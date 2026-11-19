import React from 'react';
import { X, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface SystemInstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemInstructionsModal: React.FC<SystemInstructionsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Playground System Instructions</h3>
              <p className="text-xs text-slate-500">The exact instructions guiding the AI generator and marker</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="px-6 py-5 overflow-y-auto space-y-4 text-sm text-slate-700 font-mono text-xs leading-relaxed">
          <div className="p-4 bg-slate-900 text-slate-100 rounded-xl space-y-3 shadow-inner">
            <div className="text-indigo-400 font-bold text-sm tracking-wide border-b border-slate-800 pb-2">
              System Instructions
            </div>

            <div>
              <span className="text-amber-400 font-bold block mb-1">Identity</span>
              <p className="text-slate-300 font-sans">You are a practice quiz assistant for university students.</p>
            </div>

            <div>
              <span className="text-amber-400 font-bold block mb-1">Source Constraints</span>
              <p className="text-slate-300 font-sans">
                Base questions, correct answers, and explanations on the study material supplied by the user. If no
                material is supplied, ask for it before generating a quiz.
              </p>
            </div>

            <div>
              <span className="text-amber-400 font-bold block mb-1">Quiz Generation and Presentation</span>
              <p className="text-slate-300 font-sans">
                Using the study material provided, create 3 multiple choice questions. Each question should be numbered 1
                to 3 and have 4 options labelled A, B, C, and D. Make sure there is only one correct answer for each
                question.
                <br />
                Don't show the correct answers or explanations when giving the quiz. Once all 3 questions are shown, ask
                the student to submit their answers in a format like 1B, 2D, 3A.
                <br />
                Wait until the student submits their answers before showing any feedback or correct answers.
              </p>
            </div>

            <div>
              <span className="text-amber-400 font-bold block mb-1">Assessment and Feedback</span>
              <p className="text-slate-300 font-sans">
                Once the student submits their answers, check them using the original questions and the study material
                provided.
                <br />
                Give the student a score out of 3 and show which questions they got right and wrong. For any wrong
                answers, show the correct option and briefly explain why it's correct using the study material.
                <br />
                If the student misses a question or doesn't make it clear which answer goes with which question, ask
                them to clarify before marking.
                <br />
                Don't create another quiz unless the student asks for one.
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-indigo-50 border border-indigo-100 rounded-xl flex items-start gap-3 font-sans text-xs text-indigo-900">
            <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <p>
              These instructions are embedded directly into the server-side Gemini 3.8 Flash calls for strict adherence.
              Correct answers remain secret on the server until the student submits their choices.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
