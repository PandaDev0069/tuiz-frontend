// Quiz Types for Quiz Management System

// ============================================================================
// ENUMS
// ============================================================================

export enum DifficultyLevel {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  EXPERT = 'expert',
}

export enum QuizStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice', // Multiple Choice with options range (2~4)
  TRUE_FALSE = 'true_false',
}

// ============================================================================
// CORE INTERFACES
// ============================================================================

export interface QuizSet {
  id: string;
  user_id: string; // Creator/owner from profiles table
  title: string;
  description: string;
  thumbnail_url?: string;
  is_public: boolean;
  difficulty_level: DifficultyLevel;
  category: string;
  total_questions: number;
  times_played: number;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  status: QuizStatus;
  tags: string[];
  completion_rate: number; // Percentage (0-100)
  last_played_at?: string; // ISO date string
  play_settings: QuizPlaySettings;
  cloned_from?: string; // ID of original quiz if duplicated
}

export interface Question {
  id: string;
  question_set_id: string;
  question_text: string;
  question_type: QuestionType;
  image_url?: string;
  show_question_time: number;
  answering_time: number;
  points: number;
  difficulty: DifficultyLevel;
  order_index: number;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  explanation_title?: string;
  explanation_text?: string;
  explanation_image_url?: string;
}

export interface Answer {
  id: string;
  question_id: string;
  answer_text: string;
  image_url?: string;
  is_correct: boolean;
  order_index: number;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}

// ============================================================================
// EXTENDED INTERFACES (Combined data)
// ============================================================================

export interface QuizSetWithQuestions extends QuizSet {
  questions: Question[];
}

export interface QuestionWithAnswers extends Question {
  answers: Answer[];
}

export interface QuizSetComplete extends QuizSet {
  questions: QuestionWithAnswers[];
}

// ============================================================================
// PLAY SETTINGS INTERFACE
// ============================================================================

export interface QuizPlaySettings {
  // Will add later
  show_score_immediately: boolean;
}

// ============================================================================
// FORM TYPES (For creating/editing quizzes)
// ============================================================================

export interface CreateQuizSetForm {
  title: string;
  description: string;
  thumbnail_url?: string;
  is_public: boolean;
  difficulty_level: DifficultyLevel;
  category: string;
  tags: string[];
  play_settings: Partial<QuizPlaySettings>;
}

export interface UpdateQuizSetForm extends Partial<CreateQuizSetForm> {
  id: string;
  status?: QuizStatus;
}

export interface CreateQuestionForm {
  question_text: string;
  question_type: QuestionType;
  image_url?: string;
  time_limit?: number;
  points: number;
  difficulty: DifficultyLevel;
  order_index: number;
  explanation_title?: string;
  explanation_text?: string;
  explanation_image_url?: string;
  answers: CreateAnswerForm[];
}

export interface CreateAnswerForm {
  answer_text: string;
  image_url?: string;
  is_correct: boolean;
  order_index: number;
}

export interface UpdateQuestionForm extends Partial<CreateQuestionForm> {
  id: string;
  question_set_id: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type QuizSetStatus = QuizStatus;
export type QuizDifficulty = DifficultyLevel;
export type QuestionTypeEnum = QuestionType;

// Helper type for form validation
export type FormErrors<T> = {
  [K in keyof T]?: string;
};

// Type for quiz creation workflow
export interface QuizCreationWorkflow {
  step: 'basic_info' | 'questions' | 'settings' | 'preview' | 'publish';
  quiz_data: Partial<CreateQuizSetForm>;
  questions: CreateQuestionForm[];
  is_complete: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const DIFFICULTY_COLORS = {
  [DifficultyLevel.EASY]: 'text-green-600 bg-green-100',
  [DifficultyLevel.MEDIUM]: 'text-yellow-600 bg-yellow-100',
  [DifficultyLevel.HARD]: 'text-orange-600 bg-orange-100',
  [DifficultyLevel.EXPERT]: 'text-red-600 bg-red-100',
} as const;

export const STATUS_COLORS = {
  [QuizStatus.DRAFT]: 'text-yellow-600 bg-yellow-100',
  [QuizStatus.PUBLISHED]: 'text-green-600 bg-green-100',
  [QuizStatus.ARCHIVED]: 'text-gray-600 bg-gray-100',
} as const;

export const QUESTION_TYPE_LABELS = {
  [QuestionType.MULTIPLE_CHOICE]: 'Multiple Choice',
  [QuestionType.TRUE_FALSE]: 'True/False',
} as const;
