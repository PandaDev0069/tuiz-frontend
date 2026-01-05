// ====================================================
// File Name   : useQuestionMutation.ts
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-11
// Last Update : 2025-09-14
//
// Description:
// - React hooks for question management using TanStack Query
// - Provides query and mutation hooks for question CRUD operations
// - Handles optimistic updates and cache invalidation
// - Manages question lifecycle operations (create, update, delete, reorder, batch save)
//
// Notes:
// - Uses React Query for data fetching and caching
// - Implements optimistic updates for better UX
// - Automatically invalidates related quiz queries on question mutations
// ====================================================

//----------------------------------------------------
// 1. Imports / Dependencies
//----------------------------------------------------
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

//----------------------------------------------------
// 2. Constants / Configuration
//----------------------------------------------------
const STALE_TIME_QUESTIONS_MS = 5 * 60 * 1000;
const GC_TIME_QUESTIONS_MS = 10 * 60 * 1000;

const QUERY_KEY_QUESTIONS = 'questions';
const QUERY_KEY_QUIZ = 'quiz';
const QUERY_KEY_DETAIL = 'detail';

const TEMP_ID_PREFIX = 'temp-';

const TOAST_MESSAGES = {
  QUESTION_ADDED: '問題が追加されました',
  QUESTION_UPDATED: '問題が更新されました',
  QUESTION_DELETED: '問題が削除されました',
  QUESTIONS_REORDERED: '問題の順序が変更されました',
  BATCH_SAVE_FAILED: (message: string) => `問題の保存に失敗しました: ${message}`,
} as const;

//----------------------------------------------------
// 3. Types / Interfaces
//----------------------------------------------------
interface AddQuestionMutationVariables {
  quizId: string;
  data: CreateQuestionRequest;
}

interface UpdateQuestionMutationVariables {
  quizId: string;
  questionId: string;
  data: UpdateQuestionRequest;
}

interface DeleteQuestionMutationVariables {
  quizId: string;
  questionId: string;
}

interface ReorderQuestionsMutationVariables {
  quizId: string;
  questions: ReorderQuestionsRequest['questions'];
}

interface BatchSaveQuestionsMutationVariables {
  quizId: string;
  questions: (CreateQuestionRequest | (UpdateQuestionRequest & { id: string }))[];
}

//----------------------------------------------------
// 4. Core Logic
//----------------------------------------------------
export const QUESTION_QUERY_KEYS = {
  all: [QUERY_KEY_QUESTIONS] as const,
  byQuiz: (quizId: string) => [...QUESTION_QUERY_KEYS.all, QUERY_KEY_QUIZ, quizId] as const,
  detail: (quizId: string, questionId: string) =>
    [...QUESTION_QUERY_KEYS.byQuiz(quizId), QUERY_KEY_DETAIL, questionId] as const,
} as const;

/**
 * Hook: useQuestions
 * Description:
 * - Fetches all questions for a specific quiz
 * - Caches results for 5 minutes (stale time)
 * - Keeps cache for 10 minutes (garbage collection time)
 *
 * Parameters:
 * - quizId (string): Unique identifier for the quiz
 * - enabled (boolean, optional): Whether the query should run (default: true)
 *
 * Returns:
 * - TanStack Query result object with questions data, loading state, and error
 */
export const useQuestions = (quizId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: QUESTION_QUERY_KEYS.byQuiz(quizId),
    queryFn: () => quizService.getQuestions(quizId),
    enabled: enabled && !!quizId,
    staleTime: STALE_TIME_QUESTIONS_MS,
    gcTime: GC_TIME_QUESTIONS_MS,
  });
};

/**
 * Hook: useAddQuestion
 * Description:
 * - Adds a new question to a quiz
 * - Implements optimistic updates for immediate UI feedback
 * - Invalidates related quiz queries on success
 *
 * Returns:
 * - TanStack Query mutation object with addQuestion function and state
 */
export const useAddQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ quizId, data }: AddQuestionMutationVariables) =>
      quizService.addQuestion(quizId, data),
    onMutate: async ({ quizId }) => {
      await queryClient.cancelQueries({ queryKey: QUESTION_QUERY_KEYS.byQuiz(quizId) });

      const previousQuestions = queryClient.getQueryData<QuestionWithAnswers[]>(
        QUESTION_QUERY_KEYS.byQuiz(quizId),
      );

      return { previousQuestions };
    },
    onSuccess: (newQuestion: QuestionWithAnswers, { quizId }) => {
      toast.success(TOAST_MESSAGES.QUESTION_ADDED);

      queryClient.setQueryData<QuestionWithAnswers[]>(QUESTION_QUERY_KEYS.byQuiz(quizId), (old) =>
        old ? [...old, newQuestion] : [newQuestion],
      );

      queryClient.invalidateQueries({
        queryKey: QUIZ_QUERY_KEYS.complete(quizId),
      });

      queryClient.invalidateQueries({
        queryKey: QUIZ_QUERY_KEYS.detail(quizId),
      });
    },
    onError: (error: ApiError, { quizId }, context) => {
      if (context?.previousQuestions) {
        queryClient.setQueryData(QUESTION_QUERY_KEYS.byQuiz(quizId), context.previousQuestions);
      }

      const message = handleApiError(error, { showToast: false });
      toast.error(message);
    },
  });
};

/**
 * Hook: useUpdateQuestion
 * Description:
 * - Updates an existing question in a quiz
 * - Implements optimistic updates for immediate UI feedback
 * - Invalidates related quiz queries on success
 *
 * Returns:
 * - TanStack Query mutation object with updateQuestion function and state
 */
export const useUpdateQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ quizId, questionId, data }: UpdateQuestionMutationVariables) =>
      quizService.updateQuestion(quizId, questionId, data),
    onMutate: async ({ quizId, questionId, data }) => {
      await queryClient.cancelQueries({ queryKey: QUESTION_QUERY_KEYS.byQuiz(quizId) });

      const previousQuestions = queryClient.getQueryData<QuestionWithAnswers[]>(
        QUESTION_QUERY_KEYS.byQuiz(quizId),
      );

      if (previousQuestions) {
        const updatedQuestions = previousQuestions.map((q) =>
          q.id === questionId ? { ...q, ...data, updated_at: new Date().toISOString() } : q,
        );
        queryClient.setQueryData(QUESTION_QUERY_KEYS.byQuiz(quizId), updatedQuestions);
      }

      return { previousQuestions };
    },
    onSuccess: (updatedQuestion: QuestionWithAnswers, { quizId }) => {
      toast.success(TOAST_MESSAGES.QUESTION_UPDATED);

      queryClient.setQueryData<QuestionWithAnswers[]>(QUESTION_QUERY_KEYS.byQuiz(quizId), (old) =>
        old
          ? old.map((q) => (q.id === updatedQuestion.id ? updatedQuestion : q))
          : [updatedQuestion],
      );

      queryClient.invalidateQueries({
        queryKey: QUIZ_QUERY_KEYS.complete(quizId),
      });
    },
    onError: (error: ApiError, { quizId }, context) => {
      if (context?.previousQuestions) {
        queryClient.setQueryData(QUESTION_QUERY_KEYS.byQuiz(quizId), context.previousQuestions);
      }

      const message = handleApiError(error, { showToast: false });
      toast.error(message);
    },
  });
};

/**
 * Hook: useDeleteQuestion
 * Description:
 * - Deletes a question from a quiz
 * - Implements optimistic updates for immediate UI feedback
 * - Invalidates related quiz queries on success
 *
 * Returns:
 * - TanStack Query mutation object with deleteQuestion function and state
 */
export const useDeleteQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ quizId, questionId }: DeleteQuestionMutationVariables) =>
      quizService.deleteQuestion(quizId, questionId),
    onMutate: async ({ quizId, questionId }) => {
      await queryClient.cancelQueries({ queryKey: QUESTION_QUERY_KEYS.byQuiz(quizId) });

      const previousQuestions = queryClient.getQueryData<QuestionWithAnswers[]>(
        QUESTION_QUERY_KEYS.byQuiz(quizId),
      );

      if (previousQuestions) {
        const filteredQuestions = previousQuestions.filter((q) => q.id !== questionId);
        queryClient.setQueryData(QUESTION_QUERY_KEYS.byQuiz(quizId), filteredQuestions);
      }

      return { previousQuestions };
    },
    onSuccess: (_, { quizId, questionId }) => {
      toast.success(TOAST_MESSAGES.QUESTION_DELETED);

      queryClient.setQueryData<QuestionWithAnswers[]>(QUESTION_QUERY_KEYS.byQuiz(quizId), (old) =>
        old ? old.filter((q) => q.id !== questionId) : [],
      );

      queryClient.invalidateQueries({
        queryKey: QUIZ_QUERY_KEYS.complete(quizId),
      });
      queryClient.invalidateQueries({
        queryKey: QUIZ_QUERY_KEYS.detail(quizId),
      });
    },
    onError: (error: ApiError, { quizId }, context) => {
      if (context?.previousQuestions) {
        queryClient.setQueryData(QUESTION_QUERY_KEYS.byQuiz(quizId), context.previousQuestions);
      }

      const message = handleApiError(error, { showToast: false });
      toast.error(message);
    },
  });
};

/**
 * Hook: useReorderQuestions
 * Description:
 * - Reorders questions within a quiz
 * - Implements optimistic updates for immediate UI feedback
 * - Invalidates related quiz queries on success
 *
 * Returns:
 * - TanStack Query mutation object with reorderQuestions function and state
 */
export const useReorderQuestions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ quizId, questions }: ReorderQuestionsMutationVariables) =>
      quizService.reorderQuestions(quizId, questions),
    onMutate: async ({ quizId, questions }) => {
      await queryClient.cancelQueries({ queryKey: QUESTION_QUERY_KEYS.byQuiz(quizId) });

      const previousQuestions = queryClient.getQueryData<QuestionWithAnswers[]>(
        QUESTION_QUERY_KEYS.byQuiz(quizId),
      );

      if (previousQuestions) {
        const reorderedQuestions = [...previousQuestions].sort((a, b) => {
          const orderA = questions.find((q) => q.id === a.id)?.order_index ?? a.order_index;
          const orderB = questions.find((q) => q.id === b.id)?.order_index ?? b.order_index;
          return orderA - orderB;
        });

        const updatedQuestions = reorderedQuestions.map((q) => {
          const newOrder = questions.find((item) => item.id === q.id)?.order_index;
          return newOrder !== undefined ? { ...q, order_index: newOrder } : q;
        });

        queryClient.setQueryData(QUESTION_QUERY_KEYS.byQuiz(quizId), updatedQuestions);
      }

      return { previousQuestions };
    },
    onSuccess: (_, { quizId }) => {
      toast.success(TOAST_MESSAGES.QUESTIONS_REORDERED);

      queryClient.invalidateQueries({
        queryKey: QUESTION_QUERY_KEYS.byQuiz(quizId),
      });
      queryClient.invalidateQueries({
        queryKey: QUIZ_QUERY_KEYS.complete(quizId),
      });
    },
    onError: (error: ApiError, { quizId }, context) => {
      if (context?.previousQuestions) {
        queryClient.setQueryData(QUESTION_QUERY_KEYS.byQuiz(quizId), context.previousQuestions);
      }

      const message = handleApiError(error, { showToast: false });
      toast.error(message);
    },
  });
};

/**
 * Hook: useBatchSaveQuestions
 * Description:
 * - Batch saves multiple questions (useful for auto-save functionality)
 * - Updates cache with saved questions on success
 * - Invalidates related quiz queries
 * - Does not show success toast (intended for auto-save)
 *
 * Returns:
 * - TanStack Query mutation object with batchSaveQuestions function and state
 */
export const useBatchSaveQuestions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ quizId, questions }: BatchSaveQuestionsMutationVariables) =>
      quizService.batchSaveQuestions(quizId, questions),
    onSuccess: (savedQuestions: QuestionWithAnswers[], { quizId }) => {
      queryClient.setQueryData(QUESTION_QUERY_KEYS.byQuiz(quizId), savedQuestions);

      queryClient.invalidateQueries({
        queryKey: QUIZ_QUERY_KEYS.complete(quizId),
      });
      queryClient.invalidateQueries({
        queryKey: QUIZ_QUERY_KEYS.detail(quizId),
      });
    },
    onError: (error: ApiError) => {
      const message = handleApiError(error, { showToast: false });
      toast.error(TOAST_MESSAGES.BATCH_SAVE_FAILED(message));
    },
  });
};

/**
 * Hook: useQuestionOperationState
 * Description:
 * - Aggregates loading states from all question mutation hooks
 * - Provides individual loading states for each operation type
 * - Useful for showing global loading indicators
 *
 * Returns:
 * - Object containing:
 *   - isLoading (boolean): True if any operation is pending
 *   - error (Error | null): First error from any operation
 *   - isAdding (boolean): True if add operation is pending
 *   - isUpdating (boolean): True if update operation is pending
 *   - isDeleting (boolean): True if delete operation is pending
 *   - isReordering (boolean): True if reorder operation is pending
 *   - isBatchSaving (boolean): True if batch save operation is pending
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

//----------------------------------------------------
// 5. Helper Functions
//----------------------------------------------------
/**
 * Function: addQuestionOptimistically
 * Description:
 * - Adds a question to the cache with a temporary ID before server response
 * - Used for optimistic UI updates
 * - Returns the temporary ID for tracking
 *
 * Parameters:
 * - queryClient (ReturnType<typeof useQueryClient>): React Query client instance
 * - quizId (string): Unique identifier for the quiz
 * - tempQuestion (Omit<QuestionWithAnswers, 'id' | 'created_at' | 'updated_at'>): Question data without timestamps
 *
 * Returns:
 * - string: Temporary ID assigned to the optimistic question
 */
export const addQuestionOptimistically = (
  queryClient: ReturnType<typeof useQueryClient>,
  quizId: string,
  tempQuestion: Omit<QuestionWithAnswers, 'id' | 'created_at' | 'updated_at'>,
) => {
  const tempId = `${TEMP_ID_PREFIX}${Date.now()}`;
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
 * Function: updateQuestionOptimistically
 * Description:
 * - Updates a question in the cache before server response
 * - Used for optimistic UI updates
 *
 * Parameters:
 * - queryClient (ReturnType<typeof useQueryClient>): React Query client instance
 * - quizId (string): Unique identifier for the quiz
 * - questionId (string): Unique identifier for the question to update
 * - updates (Partial<QuestionWithAnswers>): Partial question data to merge
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

//----------------------------------------------------
// 6. Export
//----------------------------------------------------
