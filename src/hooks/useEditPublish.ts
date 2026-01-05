// ====================================================
// File Name   : useEditPublish.ts
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-14
// Last Update : 2025-09-14
//
// Description:
// - Hook for handling quiz publishing during editing
// - Provides publish functionality with status tracking
// - Handles success and error states with user feedback
// - Redirects to dashboard after successful publish
//
// Notes:
// - Uses React Query mutation for publish operation
// - Provides loading state and error handling
// - Automatically redirects after successful publish
// ====================================================

//----------------------------------------------------
// 1. Imports / Dependencies
//----------------------------------------------------
import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

import { quizService } from '@/lib/quizService';
import { handleApiError } from '@/lib/apiClient';

import type { ApiError } from '@/types/api';

//----------------------------------------------------
// 2. Constants / Configuration
//----------------------------------------------------
const TOAST_DURATION_SUCCESS_MS = 3000;
const TOAST_DURATION_ERROR_MS = 4000;
const TOAST_POSITION = 'top-center';
const REDIRECT_DELAY_MS = 1500;
const DASHBOARD_ROUTE = '/dashboard';

const TOAST_MESSAGES = {
  PUBLISH_SUCCESS: 'クイズが公開されました！',
  PUBLISH_ERROR: (message: string) => `公開に失敗しました: ${message}`,
} as const;

//----------------------------------------------------
// 3. Types / Interfaces
//----------------------------------------------------

//----------------------------------------------------
// 4. Core Logic
//----------------------------------------------------
/**
 * Hook: useEditPublish
 * Description:
 * - Manages quiz publishing during editing workflow
 * - Provides publish function with loading and error states
 * - Handles success feedback and automatic redirect
 * - Uses React Query mutation for API call
 *
 * Parameters:
 * - quizId (string): Unique identifier for the quiz to publish
 *
 * Returns:
 * - Object containing:
 *   - publishQuiz (function): Function to trigger quiz publishing
 *   - isPublishing (boolean): Loading state for publish operation
 *   - publishError (Error | null): Error object if publish failed
 */
export const useEditPublish = (quizId: string) => {
  const router = useRouter();
  const [isPublishing, setIsPublishing] = useState(false);

  const publishMutation = useMutation({
    mutationFn: () => quizService.publishEditedQuiz(quizId),
    onSuccess: () => {
      toast.success(TOAST_MESSAGES.PUBLISH_SUCCESS, {
        duration: TOAST_DURATION_SUCCESS_MS,
        position: TOAST_POSITION,
      });

      setTimeout(() => {
        router.push(DASHBOARD_ROUTE);
      }, REDIRECT_DELAY_MS);
    },
    onError: (error) => {
      const message = handleApiError(error as unknown as ApiError, { showToast: false });
      toast.error(TOAST_MESSAGES.PUBLISH_ERROR(message), {
        duration: TOAST_DURATION_ERROR_MS,
        position: TOAST_POSITION,
      });
    },
  });

  const publishQuiz = useCallback(async () => {
    if (!quizId) return;

    try {
      setIsPublishing(true);
      await publishMutation.mutateAsync();
    } catch {
      // Error is handled by the mutation
    } finally {
      setIsPublishing(false);
    }
  }, [quizId, publishMutation]);

  return {
    publishQuiz,
    isPublishing: isPublishing || publishMutation.isPending,
    publishError: publishMutation.error,
  };
};

//----------------------------------------------------
// 5. Helper Functions
//----------------------------------------------------

//----------------------------------------------------
// 6. Export
//----------------------------------------------------
