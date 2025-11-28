export enum AppMode {
  SUMMARY = 'SUMMARY',
  FLASHCARDS = 'FLASHCARDS',
  QUIZ = 'QUIZ',
  EXPLANATION = 'EXPLANATION',
  STUDY_PLAN = 'STUDY_PLAN',
  CHAT = 'CHAT',
}

export type Language = 'en' | 'fr';

export type ViewState = 'WELCOME' | 'LOGIN' | 'APP';

export interface User {
  id: string;
  name: string;
  email?: string;
  isGuest: boolean;
}

export interface Flashcard {
  question: string;
  answer: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface StudyContent {
  rawText: string;
  fileData?: {
    mimeType: string;
    data: string; // base64
  };
}

export interface GeneratedContent {
  summary?: string;
  flashcards?: Flashcard[];
  quiz?: QuizQuestion[];
  explanation?: string;
  studyPlan?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';