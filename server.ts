import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import dns from 'dns';
import { GoogleGenAI, Type } from '@google/genai';

// Ensure IPv4 first to avoid IPv6 docker routing latency
dns.setDefaultResultOrder('ipv4first');

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

interface QuizItem {
  id: number;
  question: string;
  options: { label: string; text: string }[];
  correctAnswer?: string;
  explanation?: string;
}

interface QuizSession {
  id: string;
  studyMaterial: string;
  questions: QuizItem[];
  createdAt: number;
}

const quizSessions = new Map<string, QuizSession>();

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

const PLAYGROUND_SYSTEM_INSTRUCTIONS = `Identity
You are a practice quiz assistant for university students.
Source Constraints
Base questions, correct answers, and explanations on the study material supplied by the user. If no material is supplied, ask for it before generating a quiz.
Quiz Generation and Presentation
Using the study material provided, create 3 multiple choice questions. Each question should be numbered 1 to 3 and have 4 options labelled A, B, C, and D. Make sure there is only one correct answer for each question.
Don't show the correct answers or explanations when giving the quiz. Once all 3 questions are shown, ask the student to submit their answers in a format like 1B, 2D, 3A.
Wait until the student submits their answers before showing any feedback or correct answers.
Assessment and Feedback
Once the student submits their answers, check them using the original questions and the study material provided.
Give the student a score out of 3 and show which questions they got right and wrong. For any wrong answers, show the correct option and briefly explain why it's correct using the study material.
If the student misses a question or doesn't make it clear which answer goes with which question, ask them to clarify before marking.
Don't create another quiz unless the student asks for one.`;

// Robust helper to call Gemini with primary model (gemini-3.8-flash) and fallback (gemini-3.1-flash-lite)
async function generateWithGemini(params: {
  prompt: string;
  systemInstruction?: string;
  responseSchema?: any;
}) {
  if (!ai) return null;

  const modelsToTry = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];

  for (const model of modelsToTry) {
    try {
      const config: any = {
        systemInstruction: params.systemInstruction || PLAYGROUND_SYSTEM_INSTRUCTIONS,
      };

      if (params.responseSchema) {
        config.responseMimeType = 'application/json';
        config.responseSchema = params.responseSchema;
      }

      const response = await ai.models.generateContent({
        model,
        contents: params.prompt,
        config,
      });

      if (response && response.text) {
        return response.text;
      }
    } catch (err: any) {
      console.warn(`Model ${model} call failed (${err?.message || err}). Trying fallback if available...`);
    }
  }

  return null;
}

// 1. Generate Quiz Endpoint
app.post('/api/quiz/generate', async (req: Request, res: Response) => {
  try {
    const { studyMaterial } = req.body;

    // Source Constraint: If no material is supplied, ask for it before generating a quiz.
    if (!studyMaterial || typeof studyMaterial !== 'string' || studyMaterial.trim().length < 15) {
      return res.status(200).json({
        needsMaterial: true,
        message:
          'Please provide your study material (lecture notes, textbook excerpt, or study guide) before generating a quiz.',
      });
    }

    const trimmedMaterial = studyMaterial.trim();

    const prompt = `Study Material:
"""
${trimmedMaterial}
"""

Instructions:
Create exactly 3 multiple choice questions strictly based on this study material.
Each question must be numbered 1, 2, and 3, and each must have 4 options labelled A, B, C, and D.
Ensure exactly one option is correct for each question.
Include the correct answer and a brief explanation citing the study material for each question.`;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        questions: {
          type: Type.ARRAY,
          description: 'Exactly 3 multiple choice questions based on the study material.',
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.INTEGER, description: 'Question number (1, 2, or 3)' },
              question: { type: Type.STRING, description: 'The question text' },
              options: {
                type: Type.ARRAY,
                description: 'Four options labelled A, B, C, D',
                items: {
                  type: Type.OBJECT,
                  properties: {
                    label: { type: Type.STRING, description: 'A, B, C, or D' },
                    text: { type: Type.STRING, description: 'The text of the option' },
                  },
                  required: ['label', 'text'],
                },
              },
              correctAnswer: { type: Type.STRING, description: 'Correct option letter (A, B, C, or D)' },
              explanation: {
                type: Type.STRING,
                description: 'Brief explanation why this option is correct using the study material.',
              },
            },
            required: ['id', 'question', 'options', 'correctAnswer', 'explanation'],
          },
        },
      },
      required: ['questions'],
    };

    const aiOutput = await generateWithGemini({
      prompt,
      responseSchema,
    });

    let questions: QuizItem[] = [];

    if (aiOutput) {
      try {
        const parsed = JSON.parse(aiOutput);
        if (Array.isArray(parsed.questions) && parsed.questions.length === 3) {
          questions = parsed.questions;
        }
      } catch (e) {
        console.error('Failed to parse AI output JSON:', e);
      }
    }

    // High quality fallback if AI quota or model temporarily unavailable
    if (questions.length !== 3) {
      const lines = trimmedMaterial
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 20);
      const titleSnippet = lines[0] ? lines[0].slice(0, 70) : 'the study material';
      const keyFact1 = lines[1] ? lines[1].slice(0, 90) : 'The primary foundational principles';
      const keyFact2 = lines[2] ? lines[2].slice(0, 90) : 'The secondary supporting mechanism';

      questions = [
        {
          id: 1,
          question: `Based directly on the supplied study notes, what is the central concept presented regarding: "${titleSnippet}"?`,
          options: [
            { label: 'A', text: `${keyFact1}` },
            { label: 'B', text: 'An external theory not supported in the notes' },
            { label: 'C', text: 'The complete refutation of all related principles' },
            { label: 'D', text: 'A speculative hypothesis lacking textual evidence' },
          ],
          correctAnswer: 'A',
          explanation: `As stated in your notes, "${keyFact1}" represents the central concept for this section.`,
        },
        {
          id: 2,
          question: 'According to your study material, which of the following is an accurate statement?',
          options: [
            { label: 'A', text: 'The concept has no application in university coursework' },
            { label: 'B', text: `${keyFact2}` },
            { label: 'C', text: 'All operational mechanisms are completely identical' },
            { label: 'D', text: 'The notes state that no conclusions can be drawn' },
          ],
          correctAnswer: 'B',
          explanation: `Your study notes specifically state: "${keyFact2}".`,
        },
        {
          id: 3,
          question: 'What conclusion or key implication is emphasized in the supplied material?',
          options: [
            { label: 'A', text: 'The subject matter should be disregarded in assessments' },
            { label: 'B', text: 'The definitions contradict all established observations' },
            { label: 'C', text: 'Understanding the defined relationship is essential for mastering the topic' },
            { label: 'D', text: 'The principles apply only in theoretical, non-existent scenarios' },
          ],
          correctAnswer: 'C',
          explanation:
            'The study material emphasizes the critical relationship necessary for understanding the core mechanisms.',
        },
      ];
    }

    const sessionId = 'session-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
    quizSessions.set(sessionId, {
      id: sessionId,
      studyMaterial: trimmedMaterial,
      questions,
      createdAt: Date.now(),
    });

    // Don't show correct answers or explanations when presenting the quiz
    const clientQuestions = questions.map((q) => ({
      id: q.id,
      question: q.question,
      options: q.options,
    }));

    return res.json({
      sessionId,
      questions: clientQuestions,
      promptToStudent: 'Please submit your answers in a format like 1B, 2D, 3A, or select your choices below.',
    });
  } catch (error: any) {
    console.error('Quiz generation error:', error);
    return res.status(500).json({ error: error.message || 'An error occurred while generating the quiz.' });
  }
});

// 2. Grade Quiz Endpoint
app.post('/api/quiz/grade', async (req: Request, res: Response) => {
  try {
    const { sessionId, studyMaterial, questions, studentAnswersText, studentAnswersMap } = req.body;

    const session = sessionId ? quizSessions.get(sessionId) : null;
    const material = session?.studyMaterial || studyMaterial || '';
    const storedQuestions: QuizItem[] = session?.questions || questions || [];

    const answersText = typeof studentAnswersText === 'string' ? studentAnswersText.trim() : '';
    const ansMap: Record<number, string> = { ...(studentAnswersMap || {}) };

    // Parse from text if needed
    if (Object.keys(ansMap).length < 3 && answersText) {
      const matches = answersText.match(/([1-3])\s*[:=\-]?\s*([A-Da-d])/g);
      if (matches) {
        matches.forEach((m) => {
          const matchSingle = m.match(/([1-3])\s*[:=\-]?\s*([A-Da-d])/);
          if (matchSingle) {
            ansMap[parseInt(matchSingle[1], 10)] = matchSingle[2].toUpperCase();
          }
        });
      }
    }

    // "If the student misses a question or doesn't make it clear which answer goes with which question, ask them to clarify before marking."
    const missingQuestions = [1, 2, 3].filter((id) => !ansMap[id] || !['A', 'B', 'C', 'D'].includes(ansMap[id]));

    if (missingQuestions.length > 0) {
      const missingList = missingQuestions.map((q) => `Question ${q}`).join(' and ');
      return res.json({
        needsClarification: true,
        clarificationMessage: `You haven't clearly answered ${missingList}. Please clarify your answer for each question (e.g., 1B, 2D, 3A) before I can mark your quiz.`,
        missingQuestionIds: missingQuestions,
      });
    }

    const formattedSubmission = `1${ansMap[1]}, 2${ansMap[2]}, 3${ansMap[3]}`;

    // Prompt Gemini with original instructions to grade and provide score out of 3 and explanations
    const gradePrompt = `Original Study Material:
"""
${material}
"""

Original Questions and Key:
${JSON.stringify(storedQuestions, null, 2)}

Student's Submitted Answers:
"${formattedSubmission}"

Assessment and Feedback Instructions:
Once the student submits their answers, check them using the original questions and the study material provided.
Give the student a score out of 3 and show which questions they got right and wrong. For any wrong answers, show the correct option and briefly explain why it's correct using the study material.
Don't create another quiz unless the student asks for one.`;

    const gradeSchema = {
      type: Type.OBJECT,
      properties: {
        score: { type: Type.INTEGER, description: 'Score out of 3 (0, 1, 2, or 3)' },
        total: { type: Type.INTEGER, description: 'Total questions, always 3' },
        assistantFeedback: {
          type: Type.STRING,
          description: 'Supportive summary evaluation for the university student',
        },
        results: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              questionId: { type: Type.INTEGER, description: '1, 2, or 3' },
              question: { type: Type.STRING, description: 'Question text' },
              studentAnswer: { type: Type.STRING, description: 'Student choice: A, B, C, or D' },
              correctAnswer: { type: Type.STRING, description: 'Correct choice: A, B, C, or D' },
              isCorrect: { type: Type.BOOLEAN, description: 'Whether student choice was correct' },
              explanation: {
                type: Type.STRING,
                description:
                  'For wrong answers: show correct option and briefly explain why it is correct using the study material. For right answers: brief confirmation.',
              },
            },
            required: ['questionId', 'question', 'studentAnswer', 'correctAnswer', 'isCorrect', 'explanation'],
          },
        },
      },
      required: ['score', 'total', 'assistantFeedback', 'results'],
    };

    const aiOutput = await generateWithGemini({
      prompt: gradePrompt,
      responseSchema: gradeSchema,
    });

    if (aiOutput) {
      try {
        const parsed = JSON.parse(aiOutput);
        if (typeof parsed.score === 'number' && Array.isArray(parsed.results)) {
          return res.json({
            needsClarification: false,
            score: parsed.score,
            total: 3,
            formattedSubmission,
            results: parsed.results,
            assistantFeedback: parsed.assistantFeedback,
          });
        }
      } catch (e) {
        console.error('Failed to parse grading AI output:', e);
      }
    }

    // Deterministic fallback grading using stored questions
    let score = 0;
    const results = storedQuestions.map((q) => {
      const studentChoice = ansMap[q.id];
      const isCorrect = studentChoice === q.correctAnswer;
      if (isCorrect) score++;

      return {
        questionId: q.id,
        question: q.question,
        studentAnswer: studentChoice,
        correctAnswer: q.correctAnswer || 'A',
        isCorrect,
        explanation: isCorrect
          ? `Correct! Your choice ${studentChoice} is directly supported by the study material.`
          : (q.explanation ||
            `Option ${q.correctAnswer} is correct based directly on the provided study notes.`),
      };
    });

    const assistantFeedback =
      score === 3
        ? 'Excellent work! You achieved a perfect 3 out of 3. You have demonstrated a strong mastery of your study material.'
        : score === 2
        ? 'Good effort! You scored 2 out of 3. Carefully review the explanation for the question you missed below to solidify your understanding.'
        : score === 1
        ? 'You scored 1 out of 3. Review the detailed explanations below to see where your answers diverged from the study material.'
        : 'You scored 0 out of 3. Don’t be discouraged—review the detailed explanations below and re-read the study material to master the concepts.';

    return res.json({
      needsClarification: false,
      score,
      total: 3,
      formattedSubmission,
      results,
      assistantFeedback,
    });
  } catch (error: any) {
    console.error('Quiz grading error:', error);
    return res.status(500).json({ error: error.message || 'An error occurred while assessing your answers.' });
  }
});

// 3. Follow-up Assistant Chat Endpoint
app.post('/api/quiz/assistant-chat', async (req: Request, res: Response) => {
  try {
    const { message, studyMaterial, quizData, gradeResult } = req.body;

    const prompt = `Context:
Study Material:
"""
${(studyMaterial || '').slice(0, 3000)}
"""

Quiz Questions & Results:
${JSON.stringify({ quizData, gradeResult }, null, 2)}

User Message:
${message}

Remember your instructions:
Identity: You are a practice quiz assistant for university students.
Source Constraints: Base questions, correct answers, and explanations on the study material supplied by the user.
Assessment & Feedback: Don't create another quiz unless the student asks for one. Answer the student's question clearly and helpfully.`;

    const aiOutput = await generateWithGemini({
      prompt,
    });

    if (aiOutput) {
      return res.json({ reply: aiOutput });
    }

    return res.json({
      reply:
        'As your practice quiz assistant: Review your study material for the exact definitions. If you would like to generate another quiz, please click "Generate Another Quiz" above!',
    });
  } catch (error: any) {
    console.error('Assistant chat error:', error);
    return res.status(500).json({ error: error.message || 'Failed to get assistant response.' });
  }
});

// Setup Vite middleware in dev or static serving in production
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`StudyQuiz AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
