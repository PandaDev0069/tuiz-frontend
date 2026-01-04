// ====================================================
// File Name   : api.ts
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-11
// Last Update : 2025-12-26
//
// Description:
// - API request/response types and error contracts
// - Defines TypeScript interfaces for all API endpoints
// - Provides type safety for API communication layer
//
// Notes:
// - All types match backend API contracts
// - Error types follow unified backend error format
// - Endpoint constants provide type-safe route generation
// ====================================================

//----------------------------------------------------
// 1. Imports / Dependencies
//----------------------------------------------------
import type {
  QuizSet,
  Answer,
  QuizSetComplete,
  QuestionWithAnswers,
  CreateQuizSetForm,
  CreateQuestionForm,
  CreateAnswerForm,
} from './quiz';

//----------------------------------------------------
// 2. Constants / Configuration
//----------------------------------------------------
export const API_ENDPOINTS = {
  QUIZ: '/quiz',
  QUIZ_BY_ID: (id: string) => `/quiz/${id}`,
  QUIZ_START_EDIT: (id: string) => `/quiz/${id}/start-edit`,
  QUIZ_LIST: '/quiz',
  QUESTIONS: (quizId: string) => `/quiz/${quizId}/questions`,
  QUESTION_BY_ID: (quizId: string, questionId: string) => `/quiz/${quizId}/questions/${questionId}`,
  REORDER_QUESTIONS: (quizId: string) => `/quiz/${quizId}/questions/reorder`,
  ANSWERS: (quizId: string, questionId: string) =>
    `/quiz/${quizId}/questions/${questionId}/answers`,
  ANSWER_BY_ID: (quizId: string, questionId: string, answerId: string) =>
    `/quiz/${quizId}/questions/${questionId}/answers/${answerId}`,
  VALIDATE_QUIZ: (quizId: string) => `/quiz/${quizId}/validate`,
  PUBLISH_QUIZ: (quizId: string) => `/quiz/${quizId}/publish`,
  UNPUBLISH_QUIZ: (quizId: string) => `/quiz/${quizId}/unpublish`,
  GENERATE_CODE: (quizId: string) => `/quiz/${quizId}/generate-code`,
  CHECK_CODE: (code: number) => `/quiz/code/check/${code}`,
  GET_CODE: (quizId: string) => `/quiz/${quizId}/code`,
  REMOVE_CODE: (quizId: string) => `/quiz/${quizId}/code`,
} as const;

//----------------------------------------------------
// 3. Types / Interfaces
//----------------------------------------------------
export interface ApiResponse<T> {
  data: T;
  pagination?: PaginationInfo;
  meta?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
  totalCount: number;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ApiError {
  error: string;
  message?: string;
  requestId?: string;
  details?: Record<string, unknown>;
}

export interface ErrorHandlingConfig {
  showToast?: boolean;
  retryCount?: number;
  retryDelay?: number;
  customMessage?: string;
  logToConsole?: boolean;
}

export type ErrorCode =
  | 'invalid_payload'
  | 'invalid_credentials'
  | 'not_found'
  | 'validation_failed'
  | 'server_error'
  | 'network_error'
  | 'timeout_error'
  | 'unauthorized'
  | 'forbidden'
  | 'duplicate_entry'
  | 'rate_limit_exceeded';

export type CreateQuizRequest = CreateQuizSetForm;

export type UpdateQuizRequest = Partial<CreateQuizSetForm>;

export interface QuizListRequest {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  difficulty?: string;
  status?: string;
  sort?: 'created_at' | 'updated_at' | 'title' | 'times_played';
  order?: 'asc' | 'desc';
}

export type QuizListResponse = PaginatedResponse<QuizSet>;

export interface QuizResponse {
  quiz: QuizSet;
}

export interface QuizCompleteResponse {
  quiz: QuizSetComplete;
}

export type CreateQuestionRequest = CreateQuestionForm;

export type UpdateQuestionRequest = Partial<CreateQuestionForm>;

export interface QuestionResponse {
  question: QuestionWithAnswers;
}

export interface QuestionsListResponse {
  questions: QuestionWithAnswers[];
}

export interface ReorderQuestionsRequest {
  questions: {
    id: string;
    order_index: number;
  }[];
}

export type CreateAnswerRequest = CreateAnswerForm;

export type UpdateAnswerRequest = Partial<CreateAnswerForm>;

export interface AnswerResponse {
  answer: Answer;
}

export interface AnswersListResponse {
  answers: Answer[];
}

export interface ValidationResponse {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface QuizValidationResponse {
  quiz: {
    id: string;
    title: string;
    status: string;
    total_questions: number;
  };
  validation: ValidationResponse;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
}

export interface PublishResponse {
  message: string;
  quiz: QuizSet;
  validation: ValidationResponse;
}

export interface UnpublishResponse {
  message: string;
  quiz: QuizSet;
}

export interface GenerateCodeResponse {
  code: number;
  message: string;
}

export interface CheckCodeAvailabilityResponse {
  isAvailable: boolean;
  message?: string;
}

export interface GetQuizCodeResponse {
  code: number | null;
}

export interface RemoveCodeResponse {
  message: string;
}

export interface LoadingStates {
  create: boolean;
  update: boolean;
  delete: boolean;
  validate: boolean;
  publish: boolean;
  unpublish: boolean;
  generateCode: boolean;
  checkCode: boolean;
}

export interface QuizServiceState extends LoadingStates {
  error: ApiError | null;
  lastOperation: string | null;
  isOnline: boolean;
}
