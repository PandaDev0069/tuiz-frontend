// Dashboard Types for Quiz Management System

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
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE = 'true_false',
  SHORT_ANSWER = 'short_answer',
  LONG_ANSWER = 'long_answer',
  MATCHING = 'matching',
  ORDERING = 'ordering',
  FILL_BLANK = 'fill_blank',
  HOTSPOT = 'hotspot',
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
  time_limit?: number; // In seconds
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
  shuffle_questions: boolean;
  shuffle_answers: boolean;
  points_mode: 'standard' | 'time_based' | 'difficulty_based';
  time_limit_per_question?: number; // Override individual question time limits
  show_explanations: boolean;
  allow_retry: boolean;
  max_attempts?: number;
  passing_score?: number; // Percentage required to pass
  show_correct_answers: boolean;
  show_score_immediately: boolean;
  allow_skip: boolean;
  navigation_mode: 'linear' | 'free' | 'review';
}

// ============================================================================
// DASHBOARD SPECIFIC TYPES
// ============================================================================

export interface DashboardStats {
  total_quizzes: number;
  published_quizzes: number;
  draft_quizzes: number;
  total_plays: number;
  average_completion_rate: number;
  total_questions: number;
  recent_activity: QuizActivity[];
}

export interface QuizActivity {
  id: string;
  quiz_set_id: string;
  quiz_title: string;
  action: 'created' | 'updated' | 'published' | 'played' | 'completed';
  timestamp: string;
  user_id?: string;
  additional_data?: Record<string, string | number | boolean>;
}

export interface QuizFilterOptions {
  status?: QuizStatus[];
  difficulty?: DifficultyLevel[];
  category?: string[];
  tags?: string[];
  is_public?: boolean;
  date_range?: {
    start: string;
    end: string;
  };
  search_query?: string;
}

export interface QuizSortOptions {
  field:
    | 'title'
    | 'created_at'
    | 'updated_at'
    | 'times_played'
    | 'completion_rate'
    | 'difficulty_level';
  direction: 'asc' | 'desc';
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
  status: 'success' | 'error';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export interface QuizListResponse extends PaginatedResponse<QuizSet> {
  filters: QuizFilterOptions;
  sort: QuizSortOptions;
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
  [QuestionType.SHORT_ANSWER]: 'Short Answer',
  [QuestionType.LONG_ANSWER]: 'Long Answer',
  [QuestionType.MATCHING]: 'Matching',
  [QuestionType.ORDERING]: 'Ordering',
  [QuestionType.FILL_BLANK]: 'Fill in the Blank',
  [QuestionType.HOTSPOT]: 'Hotspot',
} as const;
