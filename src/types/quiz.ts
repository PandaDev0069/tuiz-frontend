// ====================================================
// File Name   : quiz.ts
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-08-24
// Last Update : 2025-09-13
//
// Description:
// - Quiz types for quiz management system
// - Defines enums, interfaces, and types for quizzes, questions, and answers
// - Provides type safety for quiz creation, editing, and management workflows
//
// Notes:
// - Form types support quiz creation and editing workflows
// - Extended interfaces combine related data structures
// - Constants provide UI styling mappings for enums
// ====================================================

//----------------------------------------------------
// 1. Imports / Dependencies
//----------------------------------------------------

//----------------------------------------------------
// 3. Types / Interfaces
//----------------------------------------------------
/**
 * Enum: DifficultyLevel
 * Description:
 * - Represents quiz difficulty levels
 */
export enum DifficultyLevel {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  EXPERT = 'expert',
}

/**
 * Enum: QuizStatus
 * Description:
 * - Represents quiz publication status
 */
export enum QuizStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

/**
 * Enum: QuestionType
 * Description:
 * - Represents question types
 * - Multiple choice supports 2-4 answer options
 */
export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE = 'true_false',
}

/**
 * Interface: QuizSet
 * Description:
 * - Core quiz set data structure
 * - Contains quiz metadata, settings, and status information
 */
export interface QuizSet {
  id: string;
  user_id: string;
  title: string;
  description: string;
  thumbnail_url?: string;
  is_public: boolean;
  difficulty_level: DifficultyLevel;
  category: string;
  total_questions: number;
  times_played: number;
  created_at: string;
  updated_at: string;
  status: QuizStatus;
  tags: string[];
  last_played_at?: string;
  play_settings: QuizPlaySettings;
  cloned_from?: string;
}

/**
 * Interface: Question
 * Description:
 * - Individual question within a quiz set
 * - Includes question text, timing settings, and explanation data
 */
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
  created_at: string;
  updated_at: string;
  explanation_title?: string;
  explanation_text?: string;
  explanation_image_url?: string;
  show_explanation_time: number;
}

/**
 * Interface: Answer
 * Description:
 * - Answer option for a question
 * - Supports text and optional image, tracks correctness
 */
export interface Answer {
  id: string;
  question_id: string;
  answer_text: string;
  image_url?: string;
  is_correct: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

/**
 * Interface: QuizSetWithQuestions
 * Description:
 * - Quiz set extended with questions array
 */
export interface QuizSetWithQuestions extends QuizSet {
  questions: Question[];
}

/**
 * Interface: QuestionWithAnswers
 * Description:
 * - Question extended with answers array
 */
export interface QuestionWithAnswers extends Question {
  answers: Answer[];
}

/**
 * Interface: QuizSetComplete
 * Description:
 * - Complete quiz set with all questions and their answers
 */
export interface QuizSetComplete extends QuizSet {
  questions: QuestionWithAnswers[];
}

/**
 * Interface: QuizPlaySettings
 * Description:
 * - Gameplay settings for quiz sessions
 * - Configures timing, bonuses, and display options
 */
export interface QuizPlaySettings {
  code: number;
  show_question_only: boolean;
  show_explanation: boolean;
  time_bonus: boolean;
  streak_bonus: boolean;
  show_correct_answer: boolean;
  max_players: number;
}

/**
 * Interface: CreateQuizSetForm
 * Description:
 * - Form data structure for creating a new quiz set
 * - Includes temporary file field for thumbnail upload
 */
export interface CreateQuizSetForm {
  title: string;
  description: string;
  thumbnail_url?: string;
  is_public: boolean;
  difficulty_level: DifficultyLevel;
  category: string;
  tags: string[];
  play_settings: Partial<QuizPlaySettings>;
  _thumbnailFile?: File;
}

/**
 * Interface: UpdateQuizSetForm
 * Description:
 * - Form data structure for updating an existing quiz set
 */
export interface UpdateQuizSetForm extends Partial<CreateQuizSetForm> {
  id: string;
  status?: QuizStatus;
}

/**
 * Interface: CreateQuestionForm
 * Description:
 * - Form data structure for creating a new question
 * - Includes nested answer forms
 */
export interface CreateQuestionForm {
  question_text: string;
  question_type: QuestionType;
  image_url?: string | null;
  show_question_time: number;
  answering_time: number;
  points: number;
  difficulty: DifficultyLevel;
  order_index: number;
  explanation_title?: string | null;
  explanation_text?: string | null;
  explanation_image_url?: string | null;
  show_explanation_time: number;
  answers: CreateAnswerForm[];
}

/**
 * Interface: CreateAnswerForm
 * Description:
 * - Form data structure for creating a new answer
 */
export interface CreateAnswerForm {
  answer_text: string;
  image_url?: string | null;
  is_correct: boolean;
  order_index: number;
}

/**
 * Interface: UpdateQuestionForm
 * Description:
 * - Form data structure for updating an existing question
 */
export interface UpdateQuestionForm extends Partial<CreateQuestionForm> {
  id: string;
  question_set_id: string;
}

/**
 * Type: QuizSetStatus
 * Description:
 * - Alias for QuizStatus enum
 */
export type QuizSetStatus = QuizStatus;

/**
 * Type: QuizDifficulty
 * Description:
 * - Alias for DifficultyLevel enum
 */
export type QuizDifficulty = DifficultyLevel;

/**
 * Type: QuestionTypeEnum
 * Description:
 * - Alias for QuestionType enum
 */
export type QuestionTypeEnum = QuestionType;

/**
 * Type: FormErrors
 * Description:
 * - Helper type for form validation errors
 */
export type FormErrors<T> = {
  [K in keyof T]?: string;
};

/**
 * Interface: QuizCreationWorkflow
 * Description:
 * - Tracks state through quiz creation workflow steps
 */
export interface QuizCreationWorkflow {
  step: 'basic_info' | 'questions' | 'settings' | 'preview' | 'publish';
  quiz_data: Partial<CreateQuizSetForm>;
  questions: CreateQuestionForm[];
  is_complete: boolean;
}

//----------------------------------------------------
// 2. Constants / Configuration
//----------------------------------------------------
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
