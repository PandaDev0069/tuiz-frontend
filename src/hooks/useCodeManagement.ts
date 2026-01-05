// ====================================================
// File Name   : useCodeManagement.ts
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-13
// Last Update : 2025-09-13
//
// Description:
// - React hooks for custom code management
// - Provides hooks for quiz code generation, validation, and management
// - Handles code availability checking and play settings updates
// - Manages cache invalidation for quiz queries
//
// Notes:
// - Uses React Query for data fetching and mutations
// - Provides code validation with format and availability checks
// - Includes hooks for generating, removing, and checking quiz codes
// ====================================================

//----------------------------------------------------
// 1. Imports / Dependencies
//----------------------------------------------------
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

import { quizService } from '@/lib/quizService';

import type { QuizPlaySettings } from '@/types/quiz';

//----------------------------------------------------
// 2. Constants / Configuration
//----------------------------------------------------
const STALE_TIME_QUIZ_CODE_MS = 5 * 60 * 1000;
const QUERY_RETRY_COUNT = 2;
const CODE_MIN_VALUE = 100000;
const CODE_MAX_VALUE = 999999;

const QUERY_KEYS = {
  QUIZ: ['quiz'],
  QUIZ_CODE: (quizId: string | undefined) => ['quiz-code', quizId],
} as const;

const TOAST_MESSAGES = {
  CODE_GENERATED: '新しいコードが生成されました',
  CODE_GENERATE_ERROR: 'コードの生成に失敗しました',
  CODE_REMOVED: 'コードが削除されました',
  CODE_REMOVE_ERROR: 'コードの削除に失敗しました',
  SETTINGS_SAVED: '設定が保存されました',
  SETTINGS_SAVE_ERROR: '設定の保存に失敗しました',
} as const;

const VALIDATION_MESSAGES = {
  INVALID_FORMAT: 'コードは6桁の数字である必要があります',
  AVAILABLE: 'このコードは使用可能です',
  UNAVAILABLE: 'このコードは既に使用されています',
  CHECK_ERROR: 'コードの確認中にエラーが発生しました',
} as const;

const ERROR_MESSAGES = {
  QUIZ_ID_REQUIRED: 'Quiz ID is required',
} as const;

//----------------------------------------------------
// 3. Types / Interfaces
//----------------------------------------------------
/**
 * Code validation result
 */
interface CodeValidationResult {
  isValid: boolean;
  isAvailable: boolean;
  message: string;
}

/**
 * Update play settings parameters
 */
interface UpdatePlaySettingsParams {
  quizId: string;
  playSettings: Partial<QuizPlaySettings>;
}

//----------------------------------------------------
// 4. Core Logic
//----------------------------------------------------
/**
 * Hook: useGenerateCode
 * Description:
 * - Generates a new quiz code for a given quiz
 * - Invalidates quiz queries cache on success
 * - Shows success/error toast notifications
 *
 * Returns:
 * - React Query mutation object for code generation
 */
export function useGenerateCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (quizId: string) => {
      return await quizService.generateQuizCode(quizId);
    },
    onSuccess: () => {
      toast.success(TOAST_MESSAGES.CODE_GENERATED);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.QUIZ });
    },
    onError: () => {
      toast.error(TOAST_MESSAGES.CODE_GENERATE_ERROR);
    },
  });
}

/**
 * Hook: useCheckCodeAvailability
 * Description:
 * - Checks if a quiz code is available
 * - Does not show toast notifications (frequent checks)
 * - Returns availability status
 *
 * Returns:
 * - React Query mutation object for code availability check
 */
export function useCheckCodeAvailability() {
  return useMutation({
    mutationFn: async (code: number) => {
      return await quizService.checkCodeAvailability(code);
    },
    onError: () => {
      // Don't show toast for availability checks as they're frequent
    },
  });
}

/**
 * Hook: useGetQuizCode
 * Description:
 * - Fetches quiz code for a given quiz ID
 * - Only runs when quizId is provided
 * - Caches result for 5 minutes
 *
 * Parameters:
 * - quizId (string | undefined): Quiz ID to fetch code for
 *
 * Returns:
 * - React Query result object with quiz code data
 */
export function useGetQuizCode(quizId: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.QUIZ_CODE(quizId),
    queryFn: async () => {
      if (!quizId) throw new Error(ERROR_MESSAGES.QUIZ_ID_REQUIRED);
      return await quizService.getQuizCode(quizId);
    },
    enabled: !!quizId,
    staleTime: STALE_TIME_QUIZ_CODE_MS,
    retry: QUERY_RETRY_COUNT,
  });
}

/**
 * Hook: useRemoveQuizCode
 * Description:
 * - Removes quiz code for a given quiz
 * - Invalidates quiz queries cache on success
 * - Shows success/error toast notifications
 *
 * Returns:
 * - React Query mutation object for code removal
 */
export function useRemoveQuizCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (quizId: string) => {
      return await quizService.removeQuizCode(quizId);
    },
    onSuccess: () => {
      toast.success(TOAST_MESSAGES.CODE_REMOVED);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.QUIZ });
    },
    onError: () => {
      toast.error(TOAST_MESSAGES.CODE_REMOVE_ERROR);
    },
  });
}

/**
 * Hook: useCodeValidation
 * Description:
 * - Validates quiz code format and availability
 * - Checks if code is 6 digits (100000-999999)
 * - Verifies code availability via API
 * - Returns validation result with status and message
 *
 * Returns:
 * - Object containing:
 *   - validateCode (function): Function to validate a code
 *   - isChecking (boolean): Loading state for availability check
 */
export function useCodeValidation() {
  const checkAvailability = useCheckCodeAvailability();

  const validateCode = async (code: number): Promise<CodeValidationResult> => {
    if (code < CODE_MIN_VALUE || code > CODE_MAX_VALUE) {
      return {
        isValid: false,
        isAvailable: false,
        message: VALIDATION_MESSAGES.INVALID_FORMAT,
      };
    }

    try {
      const result = await checkAvailability.mutateAsync(code);
      return {
        isValid: true,
        isAvailable: result.isAvailable,
        message: result.isAvailable
          ? VALIDATION_MESSAGES.AVAILABLE
          : VALIDATION_MESSAGES.UNAVAILABLE,
      };
    } catch {
      return {
        isValid: false,
        isAvailable: false,
        message: VALIDATION_MESSAGES.CHECK_ERROR,
      };
    }
  };

  return {
    validateCode,
    isChecking: checkAvailability.isPending,
  };
}

/**
 * Hook: useUpdatePlaySettings
 * Description:
 * - Updates play settings for a quiz
 * - Invalidates quiz queries cache on success
 * - Shows success/error toast notifications
 *
 * Returns:
 * - React Query mutation object for play settings update
 */
export function useUpdatePlaySettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ quizId, playSettings }: UpdatePlaySettingsParams) => {
      return await quizService.updatePlaySettings(quizId, playSettings);
    },
    onSuccess: () => {
      toast.success(TOAST_MESSAGES.SETTINGS_SAVED);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.QUIZ });
    },
    onError: () => {
      toast.error(TOAST_MESSAGES.SETTINGS_SAVE_ERROR);
    },
  });
}

//----------------------------------------------------
// 5. Helper Functions
//----------------------------------------------------

//----------------------------------------------------
// 6. Export
//----------------------------------------------------
