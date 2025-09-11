// src/hooks/useQuizMutation.ts
// React hooks for quiz CRUD operations using TanStack Query

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { quizService } from '@/lib/quizService';
import { handleApiError } from '@/lib/apiClient';
import type {
  CreateQuizRequest,
  UpdateQuizRequest,
  QuizListRequest,
  ValidationResponse,
  ApiError,
} from '@/types/api';
import type { QuizSet, CreateQuestionForm } from '@/types/quiz';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const QUIZ_QUERY_KEYS = {
  all: ['quizzes'] as const,
  lists: () => [...QUIZ_QUERY_KEYS.all, 'list'] as const,
  list: (filters: QuizListRequest) => [...QUIZ_QUERY_KEYS.lists(), filters] as const,
  details: () => [...QUIZ_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...QUIZ_QUERY_KEYS.details(), id] as const,
  complete: (id: string) => [...QUIZ_QUERY_KEYS.detail(id), 'complete'] as const,
  validation: (id: string) => [...QUIZ_QUERY_KEYS.detail(id), 'validation'] as const,
} as const;

// ============================================================================
// QUIZ QUERIES
// ============================================================================

/**
 * Hook to get a quiz by ID
 */
export const useQuiz = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: QUIZ_QUERY_KEYS.detail(id),
    queryFn: () => quizService.getQuiz(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook to get a complete quiz with questions and answers
 */
export const useQuizComplete = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: QUIZ_QUERY_KEYS.complete(id),
    queryFn: () => quizService.getQuizComplete(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook to list quizzes with filtering
 */
export const useQuizList = (filters: QuizListRequest = {}, enabled: boolean = true) => {
  return useQuery({
    queryKey: QUIZ_QUERY_KEYS.list(filters),
    queryFn: () => quizService.listQuizzes(filters),
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to validate a quiz
 */
export const useQuizValidation = (id: string, enabled: boolean = false) => {
  return useQuery({
    queryKey: QUIZ_QUERY_KEYS.validation(id),
    queryFn: () => quizService.validateQuiz(id),
    enabled: enabled && !!id,
    staleTime: 0, // Always fresh
    gcTime: 1 * 60 * 1000, // 1 minute
  });
};

// ============================================================================
// QUIZ MUTATIONS
// ============================================================================

/**
 * Hook to create a new quiz
 */
export const useCreateQuiz = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateQuizRequest) => quizService.createQuiz(data),
    onSuccess: (quiz: QuizSet) => {
      toast.success('クイズが作成されました');

      // Invalidate quiz lists
      queryClient.invalidateQueries({
        queryKey: QUIZ_QUERY_KEYS.lists(),
      });

      // Add quiz to cache
      queryClient.setQueryData(QUIZ_QUERY_KEYS.detail(quiz.id), quiz);
    },
    onError: (error: ApiError) => {
      const message = handleApiError(error, { showToast: false });
      toast.error(message);
    },
  });
};

/**
 * Hook to update a quiz
 */
export const useUpdateQuiz = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateQuizRequest }) =>
      quizService.updateQuiz(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: QUIZ_QUERY_KEYS.detail(id) });

      // Snapshot previous value
      const previousQuiz = queryClient.getQueryData<QuizSet>(QUIZ_QUERY_KEYS.detail(id));

      // Optimistically update
      if (previousQuiz) {
        queryClient.setQueryData(QUIZ_QUERY_KEYS.detail(id), {
          ...previousQuiz,
          ...data,
          updated_at: new Date().toISOString(),
        });
      }

      return { previousQuiz };
    },
    onSuccess: (quiz: QuizSet) => {
      toast.success('クイズが更新されました');

      // Update cache
      queryClient.setQueryData(QUIZ_QUERY_KEYS.detail(quiz.id), quiz);

      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: QUIZ_QUERY_KEYS.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: QUIZ_QUERY_KEYS.complete(quiz.id),
      });
    },
    onError: (error: ApiError, { id }, context) => {
      // Revert optimistic update
      if (context?.previousQuiz) {
        queryClient.setQueryData(QUIZ_QUERY_KEYS.detail(id), context.previousQuiz);
      }

      const message = handleApiError(error, { showToast: false });
      toast.error(message);
    },
  });
};

/**
 * Hook to delete a quiz
 */
export const useDeleteQuiz = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => quizService.deleteQuiz(id),
    onSuccess: (_, id) => {
      toast.success('クイズが削除されました');

      // Remove from cache
      queryClient.removeQueries({ queryKey: QUIZ_QUERY_KEYS.detail(id) });
      queryClient.removeQueries({ queryKey: QUIZ_QUERY_KEYS.complete(id) });

      // Invalidate lists
      queryClient.invalidateQueries({
        queryKey: QUIZ_QUERY_KEYS.lists(),
      });
    },
    onError: (error: ApiError) => {
      const message = handleApiError(error, { showToast: false });
      toast.error(message);
    },
  });
};

/**
 * Hook to validate a quiz manually
 */
export const useValidateQuiz = () => {
  return useMutation({
    mutationFn: (quizId: string) => quizService.validateQuiz(quizId),
    onSuccess: (validation: ValidationResponse) => {
      if (validation.isValid) {
        toast.success('クイズの検証が完了しました');
      } else {
        toast.error(`検証エラー: ${validation.errors.length}個の問題が見つかりました`);
      }
    },
    onError: (error: ApiError) => {
      const message = handleApiError(error, { showToast: false });
      toast.error(message);
    },
  });
};

/**
 * Hook to publish a quiz
 */
export const usePublishQuiz = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (quizId: string) => quizService.publishQuiz(quizId),
    onSuccess: (quiz: QuizSet) => {
      toast.success('クイズが公開されました！');

      // Update cache
      queryClient.setQueryData(QUIZ_QUERY_KEYS.detail(quiz.id), quiz);

      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: QUIZ_QUERY_KEYS.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: QUIZ_QUERY_KEYS.complete(quiz.id),
      });
    },
    onError: (error: ApiError) => {
      const message = handleApiError(error, { showToast: false });
      toast.error(message);
    },
  });
};

/**
 * Hook to unpublish a quiz
 */
export const useUnpublishQuiz = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (quizId: string) => quizService.unpublishQuiz(quizId),
    onSuccess: (quiz: QuizSet) => {
      toast.success('クイズの公開を停止しました');

      // Update cache
      queryClient.setQueryData(QUIZ_QUERY_KEYS.detail(quiz.id), quiz);

      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: QUIZ_QUERY_KEYS.lists(),
      });
    },
    onError: (error: ApiError) => {
      const message = handleApiError(error, { showToast: false });
      toast.error(message);
    },
  });
};

/**
 * Hook to save quiz as draft (create or update)
 */
export const useSaveDraft = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      quizData,
      questions = [],
    }: {
      quizData: CreateQuizRequest | (UpdateQuizRequest & { id: string });
      questions?: CreateQuestionForm[];
    }) => quizService.saveDraft(quizData, questions),
    onSuccess: ({ quiz }) => {
      // Update cache
      queryClient.setQueryData(QUIZ_QUERY_KEYS.detail(quiz.id), quiz);

      // Invalidate lists
      queryClient.invalidateQueries({
        queryKey: QUIZ_QUERY_KEYS.lists(),
      });

      // Show success message only for manual saves (not auto-saves)
      // toast.success('下書きが保存されました');
    },
    onError: (error: ApiError) => {
      const message = handleApiError(error, { showToast: false });
      toast.error(`下書きの保存に失敗しました: ${message}`);
    },
  });
};

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Hook to get loading state for quiz operations
 */
export const useQuizOperationState = () => {
  const createMutation = useCreateQuiz();
  const updateMutation = useUpdateQuiz();
  const deleteMutation = useDeleteQuiz();
  const publishMutation = usePublishQuiz();
  const unpublishMutation = useUnpublishQuiz();
  const validateMutation = useValidateQuiz();
  const saveDraftMutation = useSaveDraft();

  const isLoading =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    publishMutation.isPending ||
    unpublishMutation.isPending ||
    validateMutation.isPending ||
    saveDraftMutation.isPending;

  const error =
    createMutation.error ||
    updateMutation.error ||
    deleteMutation.error ||
    publishMutation.error ||
    unpublishMutation.error ||
    validateMutation.error ||
    saveDraftMutation.error;

  return {
    isLoading,
    error,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isPublishing: publishMutation.isPending,
    isUnpublishing: unpublishMutation.isPending,
    isValidating: validateMutation.isPending,
    isSavingDraft: saveDraftMutation.isPending,
  };
};
