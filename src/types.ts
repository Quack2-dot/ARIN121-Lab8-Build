export interface Option {
  label: 'A' | 'B' | 'C' | 'D' | string;
  text: string;
}

export interface Question {
  id: number;
  question: string;
  options: Option[];
  correctAnswer?: string;
  explanation?: string;
}

export interface QuestionResult {
  questionId: number;
  question: string;
  studentAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
}

export interface GradeResult {
  score: number;
  total: number;
  assistantFeedback: string;
  formattedSubmission: string;
  results: QuestionResult[];
}

export interface PresetTopic {
  id: string;
  title: string;
  faculty: string;
  icon: string;
  snippet: string;
  content: string;
}
