// src/types/api.ts
// API request/response types and error contracts

import type {
  QuizSet,
  Answer,
  QuizSetComplete,
  QuestionWithAnswers,
  CreateQuizSetForm,
  CreateQuestionForm,
  CreateAnswerForm,
} from './quiz';

// ============================================================================
// GENERIC API RESPONSE TYPES
// ============================================================================

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

// Backend unified error contract
export interface ApiError {
  error: string;
  message?: string;
  requestId?: string;
  details?: Record<string, unknown>;
}

// ============================================================================
// QUIZ API TYPES
// ============================================================================

// Quiz CRUD operations
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

// ============================================================================
// QUESTION API TYPES
// ============================================================================

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

// ============================================================================
// ANSWER API TYPES
// ============================================================================

export type CreateAnswerRequest = CreateAnswerForm;

export type UpdateAnswerRequest = Partial<CreateAnswerForm>;

export interface AnswerResponse {
  answer: Answer;
}

export interface AnswersListResponse {
  answers: Answer[];
}

// ============================================================================
// PUBLISHING API TYPES
// ============================================================================

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

// ============================================================================
// CODE MANAGEMENT API TYPES
// ============================================================================

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

// ============================================================================
// API ENDPOINT CONSTANTS
// ============================================================================

export const API_ENDPOINTS = {
  // Quiz endpoints
  QUIZ: '/quiz',
  QUIZ_BY_ID: (id: string) => `/quiz/${id}`,
  QUIZ_START_EDIT: (id: string) => `/quiz/${id}/start-edit`,
  QUIZ_LIST: '/quiz',

  // Question endpoints
  QUESTIONS: (quizId: string) => `/quiz/${quizId}/questions`,
  QUESTION_BY_ID: (quizId: string, questionId: string) => `/quiz/${quizId}/questions/${questionId}`,
  REORDER_QUESTIONS: (quizId: string) => `/quiz/${quizId}/questions/reorder`,

  // Answer endpoints
  ANSWERS: (quizId: string, questionId: string) =>
    `/quiz/${quizId}/questions/${questionId}/answers`,
  ANSWER_BY_ID: (quizId: string, questionId: string, answerId: string) =>
    `/quiz/${quizId}/questions/${questionId}/answers/${answerId}`,

  // Publishing endpoints
  VALIDATE_QUIZ: (quizId: string) => `/quiz/${quizId}/validate`,
  PUBLISH_QUIZ: (quizId: string) => `/quiz/${quizId}/publish`,
  UNPUBLISH_QUIZ: (quizId: string) => `/quiz/${quizId}/unpublish`,

  // Code management endpoints
  GENERATE_CODE: (quizId: string) => `/quiz/${quizId}/generate-code`,
  CHECK_CODE: (code: number) => `/quiz/code/check/${code}`,
  GET_CODE: (quizId: string) => `/quiz/${quizId}/code`,
  REMOVE_CODE: (quizId: string) => `/quiz/${quizId}/code`,
} as const;

// ============================================================================
// ERROR HANDLING TYPES
// ============================================================================

export interface ErrorHandlingConfig {
  showToast?: boolean;
  retryCount?: number;
  retryDelay?: number;
  customMessage?: string;
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

// ============================================================================
// LOADING STATE TYPES
// ============================================================================

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
