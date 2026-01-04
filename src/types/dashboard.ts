// ====================================================
// File Name   : dashboard.ts
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-08-24
// Last Update : 2025-08-31
//
// Description:
// - Dashboard-specific type definitions for quiz management
// - Defines types for dashboard statistics, filtering, and sorting
// - Provides type safety for dashboard UI components
//
// Notes:
// - Re-exports common quiz types for convenience
// - API response types are dashboard-specific variants
// ====================================================

//----------------------------------------------------
// 1. Imports / Dependencies
//----------------------------------------------------
import type { QuizSet, QuizStatus, DifficultyLevel } from './quiz';

//----------------------------------------------------
// 2. Types / Interfaces
//----------------------------------------------------
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

export type {
  QuizSet,
  QuizStatus,
  DifficultyLevel,
  QuizSetWithQuestions,
  QuizSetComplete,
} from './quiz';
