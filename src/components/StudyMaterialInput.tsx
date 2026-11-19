import React, { useState, useRef } from 'react';
import { BookOpen, Sparkles, Upload, FileText, Trash2, ArrowRight, AlertCircle, Lightbulb } from 'lucide-react';
import { SAMPLE_STUDY_MATERIALS } from '../data/sampleNotes';
import { PresetTopic } from '../types';

interface StudyMaterialInputProps {
  studyMaterial: string;
  setStudyMaterial: (material: string) => void;
  onGenerateQuiz: () => void;
  isLoading: boolean;
  error?: string | null;
}

export const StudyMaterialInput: React.FC<StudyMaterialInputProps> = ({
  studyMaterial,
  setStudyMaterial,
  onGenerateQuiz,
  isLoading,
  error,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [localWarning, setLocalWarning] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const wordCount = studyMaterial.trim() ? studyMaterial.trim().split(/\s+/).length : 0;
  const charCount = studyMaterial.length;

  const handleSelectPreset = (preset: PresetTopic) => {
    setSelectedPresetId(preset.id);
    setStudyMaterial(preset.content);
    setLocalWarning(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setLocalWarning('File size exceeds 2MB limit. Please upload a smaller text file or paste excerpt directly.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setStudyMaterial(text);
        setSelectedPresetId(null);
        setLocalWarning(null);
      }
    };
    reader.onerror = () => {
      setLocalWarning('Failed to read file. Please try copy-pasting your text instead.');
    };
    reader.readAsText(file);
  };

  const handleGenerateClick = () => {
    if (!studyMaterial || studyMaterial.trim().length < 25) {
      setLocalWarning(
        'Please provide study material first. As per the system instructions: "Base questions, correct answers, and explanations on the study material supplied by the user. If no material is supplied, ask for it before generating a quiz."'
      );
      return;
    }
    setLocalWarning(null);
    onGenerateQuiz();
  };

  return (
    <div className="space-y-6">
      {/* Intro Hero Banner */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 text-xs font-medium mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            University Practice Quiz Assistant
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
            Turn your study material into targeted practice quizzes
          </h1>
          <p className="text-indigo-100/90 text-sm sm:text-base leading-relaxed">
            Supply your lecture notes, textbook summary, or revision guide. The assistant will generate{' '}
            <strong className="text-white font-semibold">3 multiple-choice questions</strong> strictly grounded in your text.
            After you submit your choices, you'll receive your exact score out of 3 and clear explanations for any mistakes.
          </p>
        </div>
      </div>

      {/* Preset Topics Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 uppercase tracking-wider">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <span>Try with sample university notes:</span>
          </div>
          <span className="text-xs text-slate-400">Click any preset to load</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {SAMPLE_STUDY_MATERIALS.map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`p-3 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{preset.icon}</span>
                    <span className="font-semibold text-xs text-slate-900 truncate">{preset.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{preset.snippet}</p>
                </div>
                <span className="text-[10px] font-medium text-indigo-600 mt-2 block">{preset.faculty}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Material Input Box */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
              1
            </div>
            <h2 className="font-semibold text-slate-900 text-sm sm:text-base">Your Study Material</h2>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".txt,.md,.text"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload .txt/.md
            </button>

            {studyMaterial && (
              <button
                onClick={() => {
                  setStudyMaterial('');
                  setSelectedPresetId(null);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                title="Clear text"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Textarea */}
        <div className="relative">
          <textarea
            value={studyMaterial}
            onChange={(e) => {
              setStudyMaterial(e.target.value);
              setLocalWarning(null);
            }}
            placeholder="Paste your study notes, lecture slides, chapter summary, or definitions here...
For example:
'Cellular respiration is the process where cells convert biochemical energy from nutrients into ATP...
Stage 1: Glycolysis occurs in the cytoplasm and yields 2 net ATP and 2 NADH...'"
            rows={12}
            className="w-full p-4 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 outline-none text-slate-800 placeholder-slate-400 text-sm leading-relaxed transition-all resize-y font-sans"
          />

          <div className="flex items-center justify-between text-xs text-slate-400 mt-2 px-1">
            <span>
              {wordCount} {wordCount === 1 ? 'word' : 'words'} · {charCount} characters
            </span>
            <span>Source Constraint: All 3 questions will be based strictly on this text</span>
          </div>
        </div>

        {/* Warning / Error display */}
        {(localWarning || error) && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-xs uppercase tracking-wide text-amber-800">
                Study Material Required
              </p>
              <p className="text-xs leading-relaxed">{localWarning || error}</p>
            </div>
          </div>
        )}

        {/* Generate Button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={handleGenerateClick}
            disabled={isLoading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Generating 3 Practice Questions...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Generate 3-Question Practice Quiz</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
