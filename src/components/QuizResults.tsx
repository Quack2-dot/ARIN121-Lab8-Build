import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Award,
  RefreshCw,
  Sparkles,
  BookOpen,
  Send,
  MessageSquare,
  HelpCircle,
  FileText,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { GradeResult, Question } from '../types';

interface QuizResultsProps {
  gradeResult: GradeResult;
  questions: Question[];
  studyMaterial: string;
  onRetakeQuiz: () => void;
  onGenerateAnotherQuiz: () => void;
  onStartFreshWithNewMaterial: () => void;
  onAskAssistant: (message: string) => Promise<string>;
}

export const QuizResults: React.FC<QuizResultsProps> = ({
  gradeResult,
  questions,
  studyMaterial,
  onRetakeQuiz,
  onGenerateAnotherQuiz,
  onStartFreshWithNewMaterial,
  onAskAssistant,
}) => {
  const [showNotesDrawer, setShowNotesDrawer] = useState<boolean>(false);
  const [userQuery, setUserQuery] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<{ sender: 'student' | 'assistant'; text: string }[]>([]);
  const [isAsking, setIsAsking] = useState<boolean>(false);

  const { score, total, assistantFeedback, formattedSubmission, results } = gradeResult;
  const percentage = Math.round((score / total) * 100);

  // Score styling
  const isPerfect = score === 3;
  const isPassing = score >= 2;

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuery.trim() || isAsking) return;

    const message = userQuery.trim();
    setUserQuery('');
    setChatMessages((prev) => [...prev, { sender: 'student', text: message }]);
    setIsAsking(true);

    try {
      const reply = await onAskAssistant(message);
      setChatMessages((prev) => [...prev, { sender: 'assistant', text: reply }]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: 'Sorry, I could not process your query right now. Please verify your questions against the study notes.',
        },
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Score Hero Banner */}
      <div
        className={`rounded-3xl p-6 sm:p-8 border shadow-lg relative overflow-hidden text-white transition-all ${
          isPerfect
            ? 'bg-gradient-to-br from-emerald-900 via-teal-800 to-slate-900 border-emerald-700/50'
            : isPassing
            ? 'bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 border-indigo-700/50'
            : 'bg-gradient-to-br from-amber-950 via-slate-900 to-slate-900 border-amber-800/50'
        }`}
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold tracking-wide border border-white/20">
              <Award className="w-3.5 h-3.5 text-amber-300" />
              Assessment Complete
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {isPerfect ? 'Perfect Score!' : isPassing ? 'Solid Understanding!' : 'Practice Makes Progress!'}
            </h2>
            <p className="text-slate-200 text-sm leading-relaxed">{assistantFeedback}</p>
            <div className="pt-1 text-xs text-slate-300 font-mono">
              Submission: <span className="text-amber-300 font-bold">{formattedSubmission}</span>
            </div>
          </div>

          {/* Score Badge */}
          <div className="flex flex-col items-center justify-center p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-center shrink-0 min-w-[160px]">
            <span className="text-xs font-semibold text-slate-200 uppercase tracking-widest mb-1">Your Score</span>
            <div className="text-5xl font-black tracking-tight text-white flex items-baseline justify-center">
              <span>{score}</span>
              <span className="text-2xl text-slate-300 font-normal ml-1">/ {total}</span>
            </div>
            <span
              className={`mt-2 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                isPerfect
                  ? 'bg-emerald-400/20 text-emerald-200 border border-emerald-400/30'
                  : isPassing
                  ? 'bg-indigo-400/20 text-indigo-200 border border-indigo-400/30'
                  : 'bg-amber-400/20 text-amber-200 border border-amber-400/30'
              }`}
            >
              {percentage}% Accuracy
            </span>
          </div>
        </div>
      </div>

      {/* Action / Navigation Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNotesDrawer(!showNotesDrawer)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer border border-slate-200"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
            <span>{showNotesDrawer ? 'Hide Study Notes' : 'Inspect Study Material'}</span>
            {showNotesDrawer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* User-driven actions: "Don't create another quiz unless the student asks for one" */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onRetakeQuiz}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer border border-slate-200"
            title="Retake this exact 3-question quiz with clean choices"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retake This Quiz</span>
          </button>

          <button
            onClick={onGenerateAnotherQuiz}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors cursor-pointer shadow-xs"
            title="Ask the assistant to generate 3 new questions from this same material"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Generate Another Quiz (New Questions)</span>
          </button>

          <button
            onClick={onStartFreshWithNewMaterial}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Paste new notes or choose another topic"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>New Study Notes</span>
          </button>
        </div>
      </div>

      {/* Collapsible Study Material Reference */}
      {showNotesDrawer && (
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 shadow-inner">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              Source Material Used For Assessment
            </span>
            <span className="text-[11px] text-slate-400">Grounded text</span>
          </div>
          <div className="max-h-60 overflow-y-auto text-xs text-slate-700 font-mono whitespace-pre-wrap leading-relaxed p-3.5 bg-white rounded-xl border border-slate-200">
            {studyMaterial}
          </div>
        </div>
      )}

      {/* 3 Questions Detailed Breakdown */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
            <span>Detailed Question Review & Explanations</span>
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            {score} Correct · {total - score} Incorrect
          </span>
        </div>

        {results.map((res) => {
          const originalQuestion = questions.find((q) => q.id === res.questionId);
          const studentChoiceOpt = originalQuestion?.options.find((o) => o.label === res.studentAnswer);
          const correctOpt = originalQuestion?.options.find((o) => o.label === res.correctAnswer);

          return (
            <div
              key={res.questionId}
              className={`rounded-2xl border p-6 transition-all shadow-xs ${
                res.isCorrect
                  ? 'bg-emerald-50/30 border-emerald-200 ring-1 ring-emerald-100'
                  : 'bg-rose-50/30 border-rose-200 ring-1 ring-rose-100'
              }`}
            >
              {/* Question Header & Status */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-start gap-3">
                  <span
                    className={`w-8 h-8 rounded-xl font-bold text-sm flex items-center justify-center shrink-0 shadow-xs ${
                      res.isCorrect ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                    }`}
                  >
                    {res.questionId}
                  </span>
                  <div>
                    <h4 className="text-base font-semibold text-slate-900 leading-snug">{res.question}</h4>
                    <span className="text-xs text-slate-500 font-medium">Question {res.questionId} of 3</span>
                  </div>
                </div>

                {res.isCorrect ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300/80 shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Correct (1/1)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300/80 shrink-0">
                    <XCircle className="w-4 h-4 text-rose-600" />
                    Incorrect (0/1)
                  </span>
                )}
              </div>

              {/* Answers Comparison */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
                {/* Student's answer */}
                <div
                  className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                    res.isCorrect
                      ? 'bg-emerald-100/40 border-emerald-200 text-emerald-950'
                      : 'bg-rose-100/40 border-rose-200 text-rose-950'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs shrink-0 ${
                      res.isCorrect ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                    }`}
                  >
                    {res.studentAnswer}
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider block opacity-75">
                      Your Selected Answer:
                    </span>
                    <span className="text-xs font-semibold leading-relaxed">
                      Option {res.studentAnswer}: {studentChoiceOpt ? studentChoiceOpt.text : ''}
                    </span>
                  </div>
                </div>

                {/* Correct answer display */}
                <div className="p-3.5 rounded-xl border bg-emerald-50 border-emerald-200 text-emerald-950 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-md bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {res.correctAnswer}
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider block text-emerald-700">
                      Correct Answer:
                    </span>
                    <span className="text-xs font-semibold leading-relaxed text-emerald-900">
                      Option {res.correctAnswer}: {correctOpt ? correctOpt.text : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* Detailed Explanation Grounded in Study Material */}
              <div
                className={`p-4 rounded-xl border ${
                  res.isCorrect
                    ? 'bg-white border-emerald-200 text-emerald-950'
                    : 'bg-white border-rose-200 text-slate-800'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <BookOpen
                    className={`w-4 h-4 mt-0.5 shrink-0 ${res.isCorrect ? 'text-emerald-600' : 'text-indigo-600'}`}
                  />
                  <div>
                    <span
                      className={`text-xs font-bold uppercase tracking-wider block mb-1 ${
                        res.isCorrect ? 'text-emerald-700' : 'text-indigo-700'
                      }`}
                    >
                      {res.isCorrect
                        ? 'Why your answer is correct (from study material):'
                        : 'Why this answer is correct & where your choice diverged:'}
                    </span>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
                      {res.explanation}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Assistant Follow-Up / Q&A Chat */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">Ask Your Quiz Assistant</h3>
            <p className="text-xs text-slate-500">
              Need more clarification on a question, option, or concept from your notes? Ask here.
            </p>
          </div>
        </div>

        {/* Previous Conversation history */}
        {chatMessages.length > 0 && (
          <div className="space-y-3 max-h-64 overflow-y-auto p-3 bg-slate-50 rounded-xl border border-slate-200">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${msg.sender === 'student' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`p-3 rounded-2xl text-xs sm:text-sm max-w-[85%] leading-relaxed ${
                    msg.sender === 'student'
                      ? 'bg-indigo-600 text-white rounded-br-xs'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs shadow-2xs'
                  }`}
                >
                  <span className="block text-[10px] font-bold opacity-75 mb-0.5 uppercase tracking-wide">
                    {msg.sender === 'student' ? 'You' : 'Quiz Assistant'}
                  </span>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSendChat} className="flex gap-2">
          <input
            type="text"
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            placeholder="e.g. Why was Option B incorrect for Question 2? Can you elaborate on that paragraph in my notes?"
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none text-slate-900"
          />
          <button
            type="submit"
            disabled={isAsking || !userQuery.trim()}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm disabled:opacity-50 transition-colors cursor-pointer shrink-0"
          >
            {isAsking ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>Ask</span>
          </button>
        </form>

        <p className="text-[11px] text-slate-400">
          Source Constraint: The assistant responds strictly using the study material you provided. It will not create
          another quiz unless you ask for one.
        </p>
      </div>
    </div>
  );
};
