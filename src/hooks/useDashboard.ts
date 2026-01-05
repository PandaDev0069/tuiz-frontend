// ====================================================
// File Name   : useDashboard.ts
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-13
// Last Update : 2025-09-13
//
// Description:
// - Dashboard-specific hooks for quiz management
// - Provides hooks for quiz listing, filtering, actions, and statistics
// - Handles draft and published quiz queries
// - Manages quiz deletion with cache invalidation
// - Provides filter state management and API filter conversion
//
// Notes:
// - Uses React Query for data fetching and caching
// - Provides separate hooks for different quiz statuses
// - Includes statistics aggregation from multiple queries
// ====================================================

//----------------------------------------------------
// 1. Imports / Dependencies
//----------------------------------------------------
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

import { quizService } from '@/lib/quizService';

import type { QuizListRequest } from '@/types/api';
import type { QuizStatus, DifficultyLevel } from '@/types/quiz';

//----------------------------------------------------
// 2. Constants / Configuration
//----------------------------------------------------
const STALE_TIME_QUIZ_LIST_MS = 30 * 1000;
const QUERY_RETRY_COUNT = 2;
const DEFAULT_QUIZ_LIMIT = 20;
const DEFAULT_API_PAGE = 1;
const DEFAULT_API_LIMIT = 50;
const DEFAULT_SORT_BY = 'created_at';
const DEFAULT_SORT_ORDER = 'desc';
const EMPTY_STRING = '';

const QUIZ_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
} as const;

const QUERY_KEYS = {
  QUIZZES: ['quizzes'],
  QUIZ_LIST: (filters: QuizListRequest) => ['quizzes', 'list', filters],
} as const;

const TOAST_MESSAGES = {
  DELETE_SUCCESS: 'クイズを削除しました',
  DELETE_ERROR: 'クイズの削除に失敗しました',
} as const;

const DEFAULT_FILTERS = {
  search: EMPTY_STRING,
  category: EMPTY_STRING,
  difficulty: EMPTY_STRING as DifficultyLevel | '',
  status: EMPTY_STRING as QuizStatus | '',
  sortBy: DEFAULT_SORT_BY,
  sortOrder: DEFAULT_SORT_ORDER,
} as const;

//----------------------------------------------------
// 3. Types / Interfaces
//----------------------------------------------------
/**
 * Options for useQuizList hook
 */
export interface UseQuizListOptions {
  filters?: QuizListRequest;
  enabled?: boolean;
}

/**
 * Quiz filter state interface
 */
export interface QuizFilters {
  search: string;
  category: string;
  difficulty: DifficultyLevel | '';
  status: QuizStatus | '';
  sortBy: 'created_at' | 'updated_at' | 'title' | 'times_played';
  sortOrder: 'asc' | 'desc';
}

//----------------------------------------------------
// 4. Core Logic
//----------------------------------------------------
/**
 * Hook: useQuizList
 * Description:
 * - Fetches list of quizzes with optional filters
 * - Supports enabling/disabling the query
 * - Uses React Query for caching and state management
 *
 * Parameters:
 * - options (UseQuizListOptions): Configuration options
 *   - filters (QuizListRequest, optional): Filter parameters for quiz list
 *   - enabled (boolean, optional): Whether query should be enabled (default: true)
 *
 * Returns:
 * - React Query result object with quiz list data
 */
export function useQuizList(options: UseQuizListOptions = {}) {
  const { filters = {}, enabled = true } = options;

  return useQuery({
    queryKey: QUERY_KEYS.QUIZ_LIST(filters),
    queryFn: async () => {
      return await quizService.listQuizzes(filters);
    },
    enabled,
    staleTime: STALE_TIME_QUIZ_LIST_MS,
    retry: QUERY_RETRY_COUNT,
  });
}

/**
 * Hook: useDraftQuizzes
 * Description:
 * - Fetches list of draft quizzes
 * - Convenience hook that uses useQuizList with draft filter
 * - Always enabled and limited to default number of results
 *
 * Returns:
 * - React Query result object with draft quiz list data
 */
export function useDraftQuizzes() {
  return useQuizList({
    filters: { status: QUIZ_STATUS.DRAFT, limit: DEFAULT_QUIZ_LIMIT },
    enabled: true,
  });
}

/**
 * Hook: usePublishedQuizzes
 * Description:
 * - Fetches list of published quizzes
 * - Convenience hook that uses useQuizList with published filter
 * - Always enabled and limited to default number of results
 *
 * Returns:
 * - React Query result object with published quiz list data
 */
export function usePublishedQuizzes() {
  return useQuizList({
    filters: { status: QUIZ_STATUS.PUBLISHED, limit: DEFAULT_QUIZ_LIMIT },
    enabled: true,
  });
}

/**
 * Hook: useQuizActions
 * Description:
 * - Provides quiz action functions (delete, etc.)
 * - Handles quiz deletion with success/error feedback
 * - Invalidates quiz queries cache after successful deletion
 *
 * Returns:
 * - Object containing:
 *   - deleteQuiz (function): Async function to delete a quiz by ID
 *   - isDeleting (boolean): Loading state for delete operation
 */
export function useQuizActions() {
  const queryClient = useQueryClient();

  const deleteQuizMutation = useMutation({
    mutationFn: async (quizId: string) => {
      return await quizService.deleteQuiz(quizId);
    },
    onSuccess: () => {
      toast.success(TOAST_MESSAGES.DELETE_SUCCESS);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.QUIZZES });
    },
    onError: () => {
      toast.error(TOAST_MESSAGES.DELETE_ERROR);
    },
  });

  return {
    deleteQuiz: deleteQuizMutation.mutateAsync,
    isDeleting: deleteQuizMutation.isPending,
  };
}

/**
 * Hook: useQuizFilters
 * Description:
 * - Manages quiz filter state
 * - Provides functions to update, clear, and convert filters
 * - Converts filter state to API request format
 *
 * Returns:
 * - Object containing:
 *   - filters (QuizFilters): Current filter state
 *   - updateFilters (function): Function to update filters partially
 *   - clearFilters (function): Function to reset filters to defaults
 *   - getApiFilters (function): Function to convert filters to API format
 */
export function useQuizFilters() {
  const [filters, setFilters] = useState<QuizFilters>(DEFAULT_FILTERS);

  const updateFilters = (newFilters: Partial<QuizFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const getApiFilters = (): QuizListRequest => {
    const apiFilters: QuizListRequest = {
      page: DEFAULT_API_PAGE,
      limit: DEFAULT_API_LIMIT,
    };

    if (filters.search) apiFilters.search = filters.search;
    if (filters.category) apiFilters.category = filters.category;
    if (filters.difficulty) apiFilters.difficulty = filters.difficulty;
    if (filters.status) apiFilters.status = filters.status;
    if (filters.sortBy) apiFilters.sort = filters.sortBy;
    if (filters.sortOrder) apiFilters.order = filters.sortOrder;

    return apiFilters;
  };

  return {
    filters,
    updateFilters,
    clearFilters,
    getApiFilters,
  };
}

/**
 * Hook: useQuizStats
 * Description:
 * - Aggregates quiz statistics from draft and published queries
 * - Calculates total counts and play statistics
 * - Returns computed statistics object
 *
 * Returns:
 * - Object containing:
 *   - totalDrafts (number): Total number of draft quizzes
 *   - totalPublished (number): Total number of published quizzes
 *   - totalQuizzes (number): Sum of draft and published quizzes
 *   - totalPlays (number): Total play count across all published quizzes
 */
export function useQuizStats() {
  const { data: draftData } = useDraftQuizzes();
  const { data: publishedData } = usePublishedQuizzes();

  const stats = {
    totalDrafts: draftData?.totalCount || 0,
    totalPublished: publishedData?.totalCount || 0,
    totalQuizzes: (draftData?.totalCount || 0) + (publishedData?.totalCount || 0),
    totalPlays: publishedData?.data?.reduce((sum, quiz) => sum + (quiz.times_played || 0), 0) || 0,
  };

  return stats;
}

//----------------------------------------------------
// 5. Helper Functions
//----------------------------------------------------

//----------------------------------------------------
// 6. Export
//----------------------------------------------------
