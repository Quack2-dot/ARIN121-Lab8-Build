/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { StudyMaterialInput } from './components/StudyMaterialInput';
import { QuizActive } from './components/QuizActive';
import { QuizResults } from './components/QuizResults';
import { SystemInstructionsModal } from './components/SystemInstructionsModal';
import { Question, GradeResult } from './types';

type QuizStep = 'input' | 'quiz' | 'results';

export default function App() {
  const [step, setStep] = useState<QuizStep>('input');
  const [studyMaterial, setStudyMaterial] = useState<string>('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [gradeResult, setGradeResult] = useState<GradeResult | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [serverClarificationError, setServerClarificationError] = useState<string | null>(null);
  const [isSystemModalOpen, setIsSystemModalOpen] = useState<boolean>(false);

  // 1. Generate Quiz
  const handleGenerateQuiz = async () => {
    setIsLoading(true);
    setError(null);
    setServerClarificationError(null);

    try {
      const response = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studyMaterial }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate practice quiz.');
      }

      if (data.needsMaterial) {
        setError(data.message);
        return;
      }

      if (data.questions && data.questions.length === 3) {
        setSessionId(data.sessionId);
        setQuestions(data.questions);
        setStep('quiz');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        throw new Error('Received invalid quiz questions from server.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while connecting to the quiz generator.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Submit Answers for Marking
  const handleSubmitAnswers = async (
    answersMap: Record<number, string>,
    formattedText: string
  ) => {
    setIsLoading(true);
    setError(null);
    setServerClarificationError(null);

    try {
      const response = await fetch('/api/quiz/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          studyMaterial,
          questions,
          studentAnswersText: formattedText,
          studentAnswersMap: answersMap,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to assess quiz answers.');
      }

      if (data.needsClarification) {
        // "If the student misses a question or doesn't make it clear which answer goes with which question, ask them to clarify before marking."
        setServerClarificationError(data.clarificationMessage);
        return;
      }

      // Received score out of 3 and explanations
      setGradeResult({
        score: data.score,
        total: data.total || 3,
        assistantFeedback: data.assistantFeedback,
        formattedSubmission: data.formattedSubmission || formattedText,
        results: data.results,
      });

      setStep('results');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while assessing your answers.');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Ask Assistant Follow-up
  const handleAskAssistant = async (message: string): Promise<string> => {
    const response = await fetch('/api/quiz/assistant-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        studyMaterial,
        quizData: questions,
        gradeResult,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to get answer from assistant.');
    }
    return data.reply;
  };

  // Actions for results page
  const handleRetakeQuiz = () => {
    setGradeResult(null);
    setServerClarificationError(null);
    setStep('quiz');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGenerateAnotherQuiz = () => {
    // "Don't create another quiz unless the student asks for one."
    // The student explicitly clicked this button to ask for one!
    handleGenerateQuiz();
  };

  const handleStartFreshWithNewMaterial = () => {
    setStep('input');
    setGradeResult(null);
    setQuestions([]);
    setSessionId(null);
    setError(null);
    setServerClarificationError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans flex flex-col">
      {/* Top App Header */}
      <Header
        onOpenSystemInstructions={() => setIsSystemModalOpen(true)}
        onResetAll={handleStartFreshWithNewMaterial}
        showReset={step !== 'input'}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {step === 'input' && (
          <StudyMaterialInput
            studyMaterial={studyMaterial}
            setStudyMaterial={setStudyMaterial}
            onGenerateQuiz={handleGenerateQuiz}
            isLoading={isLoading}
            error={error}
          />
        )}

        {step === 'quiz' && (
          <QuizActive
            questions={questions}
            studyMaterial={studyMaterial}
            onSubmitAnswers={handleSubmitAnswers}
            onBackToNotes={() => setStep('input')}
            isLoading={isLoading}
            serverClarificationError={serverClarificationError}
          />
        )}

        {step === 'results' && gradeResult && (
          <QuizResults
            gradeResult={gradeResult}
            questions={questions}
            studyMaterial={studyMaterial}
            onRetakeQuiz={handleRetakeQuiz}
            onGenerateAnotherQuiz={handleGenerateAnotherQuiz}
            onStartFreshWithNewMaterial={handleStartFreshWithNewMaterial}
            onAskAssistant={handleAskAssistant}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-5 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>StudyQuiz AI · Built for University Students</span>
          <button
            onClick={() => setIsSystemModalOpen(true)}
            className="text-indigo-600 hover:text-indigo-800 underline font-medium cursor-pointer"
          >
            Controlled by Playground System Instructions
          </button>
        </div>
      </footer>

      {/* System Instructions Modal */}
      <SystemInstructionsModal
        isOpen={isSystemModalOpen}
        onClose={() => setIsSystemModalOpen(false)}
      />
    </div>
  );
}
