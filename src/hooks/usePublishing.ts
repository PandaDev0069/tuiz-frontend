// ====================================================
// File Name   : usePublishing.ts
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-13
// Last Update : 2025-09-13
//
// Description:
// - React hooks for quiz publishing and validation operations
// - Provides hooks for validating, publishing, and unpublishing quizzes
// - Handles cache invalidation and toast notifications
//
// Notes:
// - Uses React Query for data fetching and mutations
// - Integrates with quizService for API calls
// - Automatically invalidates related queries on mutations
// ====================================================

//----------------------------------------------------
// 1. Imports / Dependencies
//----------------------------------------------------
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

import { quizService } from '@/lib/quizService';

import { QUIZ_QUERY_KEYS } from './useQuizMutation';

//----------------------------------------------------
// 2. Constants / Configuration
//----------------------------------------------------
const STALE_TIME_VALIDATION_MS = 2 * 60 * 1000;
const RETRY_COUNT_VALIDATION = 1;

const ERROR_MESSAGES = {
  QUIZ_ID_REQUIRED: 'Quiz ID is required',
} as const;

const TOAST_MESSAGES = {
  UNPUBLISHED_SUCCESS: 'クイズの公開を取り消しました',
  UNPUBLISHED_ERROR: 'クイズの公開取り消しに失敗しました',
} as const;

//----------------------------------------------------
// 3. Types / Interfaces
//----------------------------------------------------

//----------------------------------------------------
// 4. Core Logic
//----------------------------------------------------
/**
 * Hook: useValidateQuiz
 * Description:
 * - Fetches quiz validation results for a specific quiz
 * - Caches results for 2 minutes (stale time)
 * - Only runs when quizId is provided
 *
 * Parameters:
 * - quizId (string | undefined): Unique identifier for the quiz to validate
 *
 * Returns:
 * - TanStack Query result object with validation data, loading state, and error
 */
export function useValidateQuiz(quizId: string | undefined) {
  return useQuery({
    queryKey: QUIZ_QUERY_KEYS.validation(quizId || ''),
    queryFn: async () => {
      if (!quizId) {
        throw new Error(ERROR_MESSAGES.QUIZ_ID_REQUIRED);
      }
      return await quizService.validateQuiz(quizId);
    },
    enabled: !!quizId,
    staleTime: STALE_TIME_VALIDATION_MS,
    retry: RETRY_COUNT_VALIDATION,
  });
}

/**
 * Hook: usePublishQuiz
 * Description:
 * - Publishes a quiz (makes it publicly available)
 * - Invalidates related quiz queries on success
 * - Error handling is managed by the calling component
 *
 * Returns:
 * - TanStack Query mutation object with publishQuiz function and state
 */
export function usePublishQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (quizId: string) => {
      return await quizService.publishQuiz(quizId);
    },
    onSuccess: (_, quizId) => {
      queryClient.invalidateQueries({ queryKey: QUIZ_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: QUIZ_QUERY_KEYS.validation(quizId) });
    },
  });
}

/**
 * Hook: useUnpublishQuiz
 * Description:
 * - Unpublishes a quiz (removes it from public availability)
 * - Shows success/error toast notifications
 * - Invalidates related quiz queries on success
 *
 * Returns:
 * - TanStack Query mutation object with unpublishQuiz function and state
 */
export function useUnpublishQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (quizId: string) => {
      return await quizService.unpublishQuiz(quizId);
    },
    onSuccess: (_, quizId) => {
      toast.success(TOAST_MESSAGES.UNPUBLISHED_SUCCESS);

      queryClient.invalidateQueries({ queryKey: QUIZ_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: QUIZ_QUERY_KEYS.validation(quizId) });
    },
    onError: () => {
      toast.error(TOAST_MESSAGES.UNPUBLISHED_ERROR);
    },
  });
}

//----------------------------------------------------
// 5. Helper Functions
//----------------------------------------------------

//----------------------------------------------------
// 6. Export
//----------------------------------------------------
