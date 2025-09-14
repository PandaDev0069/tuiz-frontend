// src/hooks/useQuestionMutation.ts
// React hooks for question management using TanStack Query

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { quizService } from '@/lib/quizService';
import { handleApiError } from '@/lib/apiClient';
import { QUIZ_QUERY_KEYS } from './useQuizMutation';
import type {
  CreateQuestionRequest,
  UpdateQuestionRequest,
  ReorderQuestionsRequest,
  ApiError,
} from '@/types/api';
import type { QuestionWithAnswers } from '@/types/quiz';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const QUESTION_QUERY_KEYS = {
  all: ['questions'] as const,
  byQuiz: (quizId: string) => [...QUESTION_QUERY_KEYS.all, 'quiz', quizId] as const,
  detail: (quizId: string, questionId: string) =>
    [...QUESTION_QUERY_KEYS.byQuiz(quizId), 'detail', questionId] as const,
} as const;

// ============================================================================
// QUESTION QUERIES
// ============================================================================

/**
 * Hook to get all questions for a quiz
 */
export const useQuestions = (quizId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: QUESTION_QUERY_KEYS.byQuiz(quizId),
    queryFn: () => quizService.getQuestions(quizId),
    enabled: enabled && !!quizId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// ============================================================================
// QUESTION MUTATIONS
// ============================================================================

/**
 * Hook to add a question to a quiz
 */
export const useAddQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ quizId, data }: { quizId: string; data: CreateQuestionRequest }) =>
      quizService.addQuestion(quizId, data),
    onMutate: async ({ quizId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: QUESTION_QUERY_KEYS.byQuiz(quizId) });

      // Snapshot previous value
      const previousQuestions = queryClient.getQueryData<QuestionWithAnswers[]>(
        QUESTION_QUERY_KEYS.byQuiz(quizId),
      );

      return { previousQuestions };
    },
    onSuccess: (newQuestion: QuestionWithAnswers, { quizId }) => {
      toast.success('問題が追加されました');

      // Update questions cache
      queryClient.setQueryData<QuestionWithAnswers[]>(QUESTION_QUERY_KEYS.byQuiz(quizId), (old) =>
        old ? [...old, newQuestion] : [newQuestion],
      );

      // Invalidate quiz complete data
      queryClient.invalidateQueries({
        queryKey: QUIZ_QUERY_KEYS.complete(quizId),
      });

      // Invalidate quiz details (for total_questions count)
      queryClient.invalidateQueries({
        queryKey: QUIZ_QUERY_KEYS.detail(quizId),
      });
    },
    onError: (error: ApiError, { quizId }, context) => {
      // Revert optimistic update
      if (context?.previousQuestions) {
        queryClient.setQueryData(QUESTION_QUERY_KEYS.byQuiz(quizId), context.previousQuestions);
      }

      const message = handleApiError(error, { showToast: false });
      toast.error(message);
    },
  });
};

/**
 * Hook to update a question
 */
export const useUpdateQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      quizId,
      questionId,
      data,
    }: {
      quizId: string;
      questionId: string;
      data: UpdateQuestionRequest;
    }) => quizService.updateQuestion(quizId, questionId, data),
    onMutate: async ({ quizId, questionId, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: QUESTION_QUERY_KEYS.byQuiz(quizId) });

      // Snapshot previous value
      const previousQuestions = queryClient.getQueryData<QuestionWithAnswers[]>(
        QUESTION_QUERY_KEYS.byQuiz(quizId),
      );

      // Optimistically update
      if (previousQuestions) {
        const updatedQuestions = previousQuestions.map((q) =>
          q.id === questionId ? { ...q, ...data, updated_at: new Date().toISOString() } : q,
        );
        queryClient.setQueryData(QUESTION_QUERY_KEYS.byQuiz(quizId), updatedQuestions);
      }

      return { previousQuestions };
    },
    onSuccess: (updatedQuestion: QuestionWithAnswers, { quizId }) => {
      toast.success('問題が更新されました');

      // Update questions cache
      queryClient.setQueryData<QuestionWithAnswers[]>(QUESTION_QUERY_KEYS.byQuiz(quizId), (old) =>
        old
          ? old.map((q) => (q.id === updatedQuestion.id ? updatedQuestion : q))
          : [updatedQuestion],
      );

      // Invalidate quiz complete data
      queryClient.invalidateQueries({
        queryKey: QUIZ_QUERY_KEYS.complete(quizId),
      });
    },
    onError: (error: ApiError, { quizId }, context) => {
      // Revert optimistic update
      if (context?.previousQuestions) {
        queryClient.setQueryData(QUESTION_QUERY_KEYS.byQuiz(quizId), context.previousQuestions);
      }

      const message = handleApiError(error, { showToast: false });
      toast.error(message);
    },
  });
};

/**
 * Hook to delete a question
 */
export const useDeleteQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ quizId, questionId }: { quizId: string; questionId: string }) =>
      quizService.deleteQuestion(quizId, questionId),
    onMutate: async ({ quizId, questionId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: QUESTION_QUERY_KEYS.byQuiz(quizId) });

      // Snapshot previous value
      const previousQuestions = queryClient.getQueryData<QuestionWithAnswers[]>(
        QUESTION_QUERY_KEYS.byQuiz(quizId),
      );

      // Optimistically remove question
      if (previousQuestions) {
        const filteredQuestions = previousQuestions.filter((q) => q.id !== questionId);
        queryClient.setQueryData(QUESTION_QUERY_KEYS.byQuiz(quizId), filteredQuestions);
      }

      return { previousQuestions };
    },
    onSuccess: (_, { quizId, questionId }) => {
      toast.success('問題が削除されました');

      // Update questions cache
      queryClient.setQueryData<QuestionWithAnswers[]>(QUESTION_QUERY_KEYS.byQuiz(quizId), (old) =>
        old ? old.filter((q) => q.id !== questionId) : [],
      );

      // Invalidate related caches
      queryClient.invalidateQueries({
        queryKey: QUIZ_QUERY_KEYS.complete(quizId),
      });
      queryClient.invalidateQueries({
        queryKey: QUIZ_QUERY_KEYS.detail(quizId),
      });
    },
    onError: (error: ApiError, { quizId }, context) => {
      // Revert optimistic update
      if (context?.previousQuestions) {
        queryClient.setQueryData(QUESTION_QUERY_KEYS.byQuiz(quizId), context.previousQuestions);
      }

      const message = handleApiError(error, { showToast: false });
      toast.error(message);
    },
  });
};

/**
 * Hook to reorder questions in a quiz
 */
export const useReorderQuestions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      quizId,
      questions,
    }: {
      quizId: string;
      questions: ReorderQuestionsRequest['questions'];
    }) => quizService.reorderQuestions(quizId, questions),
    onMutate: async ({ quizId, questions }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: QUESTION_QUERY_KEYS.byQuiz(quizId) });

      // Snapshot previous value
      const previousQuestions = queryClient.getQueryData<QuestionWithAnswers[]>(
        QUESTION_QUERY_KEYS.byQuiz(quizId),
      );

      // Optimistically update order
      if (previousQuestions) {
        const reorderedQuestions = [...previousQuestions].sort((a, b) => {
          const orderA = questions.find((q) => q.id === a.id)?.order_index ?? a.order_index;
          const orderB = questions.find((q) => q.id === b.id)?.order_index ?? b.order_index;
          return orderA - orderB;
        });

        // Update order_index property
        const updatedQuestions = reorderedQuestions.map((q) => {
          const newOrder = questions.find((item) => item.id === q.id)?.order_index;
          return newOrder !== undefined ? { ...q, order_index: newOrder } : q;
        });

        queryClient.setQueryData(QUESTION_QUERY_KEYS.byQuiz(quizId), updatedQuestions);
      }

      return { previousQuestions };
    },
    onSuccess: (_, { quizId }) => {
      toast.success('問題の順序が変更されました');

      // Invalidate to ensure we have the latest data
      queryClient.invalidateQueries({
        queryKey: QUESTION_QUERY_KEYS.byQuiz(quizId),
      });
      queryClient.invalidateQueries({
        queryKey: QUIZ_QUERY_KEYS.complete(quizId),
      });
    },
    onError: (error: ApiError, { quizId }, context) => {
      // Revert optimistic update
      if (context?.previousQuestions) {
        queryClient.setQueryData(QUESTION_QUERY_KEYS.byQuiz(quizId), context.previousQuestions);
      }

      const message = handleApiError(error, { showToast: false });
      toast.error(message);
    },
  });
};

/**
 * Hook to batch save questions (useful for auto-save)
 */
export const useBatchSaveQuestions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      quizId,
      questions,
    }: {
      quizId: string;
      questions: (CreateQuestionRequest | (UpdateQuestionRequest & { id: string }))[];
    }) => quizService.batchSaveQuestions(quizId, questions),
    onSuccess: (savedQuestions: QuestionWithAnswers[], { quizId }) => {
      // Update questions cache with saved questions
      queryClient.setQueryData(QUESTION_QUERY_KEYS.byQuiz(quizId), savedQuestions);

      // Invalidate related caches
      queryClient.invalidateQueries({
        queryKey: QUIZ_QUERY_KEYS.complete(quizId),
      });
      queryClient.invalidateQueries({
        queryKey: QUIZ_QUERY_KEYS.detail(quizId),
      });

      // Only show success for manual saves, not auto-saves
      // toast.success('問題が保存されました');
    },
    onError: (error: ApiError) => {
      const message = handleApiError(error, { showToast: false });
      toast.error(`問題の保存に失敗しました: ${message}`);
    },
  });
};

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Hook to get loading state for question operations
 */
export const useQuestionOperationState = () => {
  const addMutation = useAddQuestion();
  const updateMutation = useUpdateQuestion();
  const deleteMutation = useDeleteQuestion();
  const reorderMutation = useReorderQuestions();
  const batchSaveMutation = useBatchSaveQuestions();

  const isLoading =
    addMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    reorderMutation.isPending ||
    batchSaveMutation.isPending;

  const error =
    addMutation.error ||
    updateMutation.error ||
    deleteMutation.error ||
    reorderMutation.error ||
    batchSaveMutation.error;

  return {
    isLoading,
    error,
    isAdding: addMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isReordering: reorderMutation.isPending,
    isBatchSaving: batchSaveMutation.isPending,
  };
};

// ============================================================================
// OPTIMISTIC UPDATE HELPERS
// ============================================================================

/**
 * Helper to add question optimistically to local state
 */
export const addQuestionOptimistically = (
  queryClient: ReturnType<typeof useQueryClient>,
  quizId: string,
  tempQuestion: Omit<QuestionWithAnswers, 'id' | 'created_at' | 'updated_at'>,
) => {
  const tempId = `temp-${Date.now()}`;
  const optimisticQuestion: QuestionWithAnswers = {
    ...tempQuestion,
    id: tempId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  queryClient.setQueryData<QuestionWithAnswers[]>(QUESTION_QUERY_KEYS.byQuiz(quizId), (old) =>
    old ? [...old, optimisticQuestion] : [optimisticQuestion],
  );

  return tempId;
};

/**
 * Helper to update question optimistically in local state
 */
export const updateQuestionOptimistically = (
  queryClient: ReturnType<typeof useQueryClient>,
  quizId: string,
  questionId: string,
  updates: Partial<QuestionWithAnswers>,
) => {
  queryClient.setQueryData<QuestionWithAnswers[]>(QUESTION_QUERY_KEYS.byQuiz(quizId), (old) =>
    old
      ? old.map((q) =>
          q.id === questionId ? { ...q, ...updates, updated_at: new Date().toISOString() } : q,
        )
      : [],
  );
};
