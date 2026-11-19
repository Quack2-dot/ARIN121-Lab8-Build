import React, { useState, useEffect } from 'react';
import { Check, AlertCircle, Send, BookOpen, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { Question } from '../types';

interface QuizActiveProps {
  questions: Question[];
  studyMaterial: string;
  onSubmitAnswers: (answersMap: Record<number, string>, formattedText: string) => void;
  onBackToNotes: () => void;
  isLoading: boolean;
  serverClarificationError?: string | null;
}

export const QuizActive: React.FC<QuizActiveProps> = ({
  questions,
  studyMaterial,
  onSubmitAnswers,
  onBackToNotes,
  isLoading,
  serverClarificationError,
}) => {
  // Store student choices for questions 1, 2, 3
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  // Formatted string representation like "1B, 2D, 3A"
  const [answersInputText, setAnswersInputText] = useState<string>('');
  const [validationWarning, setValidationWarning] = useState<string | null>(null);
  const [showNotesDrawer, setShowNotesDrawer] = useState<boolean>(false);

  // Sync formatted text whenever selectedAnswers changes
  useEffect(() => {
    const parts: string[] = [];
    [1, 2, 3].forEach((id) => {
      if (selectedAnswers[id]) {
        parts.push(`${id}${selectedAnswers[id]}`);
      }
    });
    setAnswersInputText(parts.join(', '));
  }, [selectedAnswers]);

  const handleSelectOption = (questionId: number, optionLabel: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionLabel,
    }));
    setValidationWarning(null);
  };

  // Allow student to type in the format e.g. "1B, 2D, 3A"
  const handleTextInputChange = (text: string) => {
    setAnswersInputText(text);
    setValidationWarning(null);

    // Parse out choices like 1A, 2B, 3C
    const newAnswers: Record<number, string> = { ...selectedAnswers };
    const matches = text.match(/([1-3])\s*[:=\-]?\s*([A-Da-d])/g);
    if (matches) {
      matches.forEach((m) => {
        const parsed = m.match(/([1-3])\s*[:=\-]?\s*([A-Da-d])/);
        if (parsed) {
          const qId = parseInt(parsed[1], 10);
          const opt = parsed[2].toUpperCase();
          newAnswers[qId] = opt;
        }
      });
      setSelectedAnswers(newAnswers);
    }
  };

  const handleClearSelections = () => {
    setSelectedAnswers({});
    setAnswersInputText('');
    setValidationWarning(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check if any question was missed
    const missing = [1, 2, 3].filter((id) => !selectedAnswers[id]);
    if (missing.length > 0) {
      const missingText = missing.map((m) => `Question ${m}`).join(' and ');
      setValidationWarning(
        `You haven't answered ${missingText}. Please clarify your answer for each question (in a format like 1B, 2D, 3A) before submitting for marking.`
      );
      return;
    }

    setValidationWarning(null);
    const formatted = `1${selectedAnswers[1]}, 2${selectedAnswers[2]}, 3${selectedAnswers[3]}`;
    onSubmitAnswers(selectedAnswers, formatted);
  };

  const answeredCount = [1, 2, 3].filter((id) => selectedAnswers[id]).length;

  return (
    <div className="space-y-6">
      {/* Quiz Top Instructions Bar */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
              3 Questions
            </span>
            <span className="text-xs text-slate-500 font-medium">Single correct answer per question</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Practice Quiz In Progress</h2>
          <p className="text-xs text-slate-600 mt-1">
            Select your answers using the buttons below, or enter them in the standard format (e.g., <strong>1B, 2D, 3A</strong>).
            Correct answers and explanations will be shown after submission.
          </p>
        </div>

        {/* Progress & Reference button */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setShowNotesDrawer(!showNotesDrawer)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer border border-slate-200"
          >
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <span>{showNotesDrawer ? 'Hide Study Notes' : 'Reference Notes'}</span>
            {showNotesDrawer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700">
            Progress:{' '}
            <strong className={answeredCount === 3 ? 'text-emerald-600 font-bold' : 'text-indigo-600 font-bold'}>
              {answeredCount} of 3
            </strong>
          </div>
        </div>
      </div>

      {/* Collapsible Study Material Reference */}
      {showNotesDrawer && (
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 shadow-inner">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              Supplied Study Material
            </span>
            <span className="text-[11px] text-slate-400">Grounded source text</span>
          </div>
          <div className="max-h-60 overflow-y-auto text-xs text-slate-700 font-mono whitespace-pre-wrap leading-relaxed p-3 bg-white rounded-xl border border-slate-200">
            {studyMaterial}
          </div>
        </div>
      )}

      {/* The 3 Multiple Choice Questions */}
      <div className="space-y-5">
        {questions.map((q) => {
          const studentSelection = selectedAnswers[q.id];

          return (
            <div
              key={q.id}
              className={`bg-white rounded-2xl p-6 border transition-all shadow-xs ${
                studentSelection
                  ? 'border-indigo-300 ring-1 ring-indigo-100'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Question Header */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-start gap-3">
                  <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                    {q.id}
                  </span>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900 leading-snug">{q.question}</h3>
                    <span className="text-[11px] text-slate-400 font-medium">Select one option (A, B, C, or D)</span>
                  </div>
                </div>

                {studentSelection ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
                    <Check className="w-3.5 h-3.5" />
                    Option {studentSelection}
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 shrink-0">
                    Not answered
                  </span>
                )}
              </div>

              {/* 4 Options Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                {q.options.map((opt) => {
                  const isChosen = studentSelection === opt.label;
                  return (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => handleSelectOption(q.id, opt.label)}
                      className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3.5 cursor-pointer group ${
                        isChosen
                          ? 'border-indigo-600 bg-indigo-50/80 ring-2 ring-indigo-500/20 shadow-xs'
                          : 'border-slate-200 hover:border-indigo-200 hover:bg-slate-50'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                          isChosen
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 group-hover:bg-indigo-100 group-hover:text-indigo-700'
                        }`}
                      >
                        {opt.label}
                      </div>

                      <div className="text-sm leading-relaxed text-slate-800 font-normal">
                        {opt.text}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Answers Submission & Formatting Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">Submission Format: e.g. 1B, 2D, 3A</h3>
            <p className="text-xs text-slate-500">
              The AI verifies your submission in the standardized quiz response format.
            </p>
          </div>

          {answeredCount > 0 && (
            <button
              onClick={handleClearSelections}
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors self-start sm:self-auto cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Choices
            </button>
          )}
        </div>

        {/* Live Synchronized Answer Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Your Answers (Syncs automatically with the buttons above):
          </label>
          <div className="relative">
            <input
              type="text"
              value={answersInputText}
              onChange={(e) => handleTextInputChange(e.target.value)}
              placeholder="e.g. 1B, 2D, 3A"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 font-mono text-sm tracking-wider uppercase focus:border-indigo-600 focus:ring-3 focus:ring-indigo-100 outline-none text-slate-900 bg-slate-50/60"
            />
            <div className="absolute right-3 top-3 text-xs text-slate-400 font-mono pointer-events-none">
              {answeredCount}/3 Selected
            </div>
          </div>
        </div>

        {/* Missing Question / Clarification Prompt Alert */}
        {(validationWarning || serverClarificationError) && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-amber-800">Clarification Needed Before Marking</p>
              <p className="leading-relaxed">{validationWarning || serverClarificationError}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBackToNotes}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-center"
          >
            ← Back to Edit Material
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Checking Answers Against Material...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Answers ({answeredCount}/3)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
