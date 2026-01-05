// ====================================================
// File Name   : useQuizMutation.ts
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-11
// Last Update : 2025-09-13
//
// Description:
// - React hooks for quiz CRUD operations using TanStack Query
// - Provides query and mutation hooks for quiz management
// - Handles optimistic updates and cache invalidation
// - Manages quiz lifecycle operations (create, update, delete, publish, etc.)
//
// Notes:
// - Uses React Query for data fetching and caching
// - Implements optimistic updates for better UX
// - Automatically invalidates related queries on mutations
// ====================================================

//----------------------------------------------------
// 1. Imports / Dependencies
//----------------------------------------------------
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

import { quizService } from '@/lib/quizService';
import { handleApiError } from '@/lib/apiClient';

import type {
  CreateQuizRequest,
  UpdateQuizRequest,
  QuizListRequest,
  QuizValidationResponse,
  ApiError,
} from '@/types/api';
import type { QuizSet, CreateQuestionForm } from '@/types/quiz';

//----------------------------------------------------
// 2. Constants / Configuration
//----------------------------------------------------
const STALE_TIME_QUIZ_DETAIL_MS = 5 * 60 * 1000;
const STALE_TIME_QUIZ_LIST_MS = 2 * 60 * 1000;
const STALE_TIME_QUIZ_VALIDATION_MS = 0;
const GC_TIME_QUIZ_DETAIL_MS = 10 * 60 * 1000;
const GC_TIME_QUIZ_LIST_MS = 5 * 60 * 1000;
const GC_TIME_QUIZ_VALIDATION_MS = 1 * 60 * 1000;

const QUERY_KEY_QUIZZES = 'quizzes';
const QUERY_KEY_LIST = 'list';
const QUERY_KEY_DETAIL = 'detail';
const QUERY_KEY_COMPLETE = 'complete';
const QUERY_KEY_VALIDATION = 'validation';

const TOAST_MESSAGES = {
  QUIZ_CREATED: 'クイズが作成されました',
  QUIZ_UPDATED: 'クイズが更新されました',
  QUIZ_DELETED: 'クイズが削除されました',
  QUIZ_VALIDATED: 'クイズの検証が完了しました',
  QUIZ_PUBLISHED: 'クイズが公開されました！',
  QUIZ_UNPUBLISHED: 'クイズの公開を停止しました',
  VALIDATION_ERROR: (count: number) => `検証エラー: ${count}個の問題が見つかりました`,
  EDIT_START_FAILED: (message: string) => `編集の開始に失敗しました: ${message}`,
  DRAFT_SAVE_FAILED: (message: string) => `下書きの保存に失敗しました: ${message}`,
} as const;

//----------------------------------------------------
// 3. Types / Interfaces
//----------------------------------------------------
interface UpdateQuizMutationVariables {
  id: string;
  data: UpdateQuizRequest;
}

interface SaveDraftMutationVariables {
  quizData: CreateQuizRequest | (UpdateQuizRequest & { id: string });
  questions?: CreateQuestionForm[];
}

interface OptimisticUpdateContext {
  previousQuiz: QuizSet | undefined;
}

//----------------------------------------------------
// 4. Core Logic
//----------------------------------------------------
export const QUIZ_QUERY_KEYS = {
  all: [QUERY_KEY_QUIZZES] as const,
  lists: () => [...QUIZ_QUERY_KEYS.all, QUERY_KEY_LIST] as const,
  list: (filters: QuizListRequest) => [...QUIZ_QUERY_KEYS.lists(), filters] as const,
  details: () => [...QUIZ_QUERY_KEYS.all, QUERY_KEY_DETAIL] as const,
  detail: (id: string) => [...QUIZ_QUERY_KEYS.details(), id] as const,
  complete: (id: string) => [...QUIZ_QUERY_KEYS.detail(id), QUERY_KEY_COMPLETE] as const,
  validation: (id: string) => [...QUIZ_QUERY_KEYS.detail(id), QUERY_KEY_VALIDATION] as const,
} as const;

/**
 * Hook: useQuiz
 * Description:
 * - Fetches a quiz by ID using React Query
 * - Caches the result for 5 minutes
 * - Automatically refetches when query key changes
 *
 * Parameters:
 * - id (string): Quiz ID to fetch
 * - enabled (boolean, optional): Whether the query should run (default: true)
 *
 * Returns:
 * - React Query result object with quiz data, loading state, and error
 */
export const useQuiz = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: QUIZ_QUERY_KEYS.detail(id),
    queryFn: () => quizService.getQuiz(id),
    enabled: enabled && !!id,
    staleTime: STALE_TIME_QUIZ_DETAIL_MS,
    gcTime: GC_TIME_QUIZ_DETAIL_MS,
  });
};

/**
 * Hook: useQuizComplete
 * Description:
 * - Fetches a complete quiz with questions and answers
 * - Caches the result for 5 minutes
 * - Used when full quiz details are needed
 *
 * Parameters:
 * - id (string): Quiz ID to fetch
 * - enabled (boolean, optional): Whether the query should run (default: true)
 *
 * Returns:
 * - React Query result object with complete quiz data, loading state, and error
 */
export const useQuizComplete = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: QUIZ_QUERY_KEYS.complete(id),
    queryFn: () => quizService.getQuizComplete(id),
    enabled: enabled && !!id,
    staleTime: STALE_TIME_QUIZ_DETAIL_MS,
    gcTime: GC_TIME_QUIZ_DETAIL_MS,
  });
};

/**
 * Hook: useQuizList
 * Description:
 * - Fetches a list of quizzes with optional filtering
 * - Caches the result for 2 minutes
 * - Supports filtering by status, search, and other criteria
 *
 * Parameters:
 * - filters (QuizListRequest, optional): Filter criteria for the quiz list
 * - enabled (boolean, optional): Whether the query should run (default: true)
 *
 * Returns:
 * - React Query result object with quiz list data, loading state, and error
 */
export const useQuizList = (filters: QuizListRequest = {}, enabled: boolean = true) => {
  return useQuery({
    queryKey: QUIZ_QUERY_KEYS.list(filters),
    queryFn: () => quizService.listQuizzes(filters),
    enabled,
    staleTime: STALE_TIME_QUIZ_LIST_MS,
    gcTime: GC_TIME_QUIZ_LIST_MS,
  });
};

/**
 * Hook: useQuizValidation
 * Description:
 * - Fetches quiz validation results
 * - Always fetches fresh data (no stale time)
 * - Used to check if a quiz is valid before publishing
 *
 * Parameters:
 * - id (string): Quiz ID to validate
 * - enabled (boolean, optional): Whether the query should run (default: false)
 *
 * Returns:
 * - React Query result object with validation data, loading state, and error
 */
export const useQuizValidation = (id: string, enabled: boolean = false) => {
  return useQuery({
    queryKey: QUIZ_QUERY_KEYS.validation(id),
    queryFn: () => quizService.validateQuiz(id),
    enabled: enabled && !!id,
    staleTime: STALE_TIME_QUIZ_VALIDATION_MS,
    gcTime: GC_TIME_QUIZ_VALIDATION_MS,
  });
};

/**
 * Hook: useCreateQuiz
 * Description:
 * - Creates a new quiz
 * - Invalidates quiz lists cache on success
 * - Adds the new quiz to the cache
 * - Shows success/error toast notifications
 *
 * Returns:
 * - React Query mutation object with create function and state
 */
export const useCreateQuiz = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateQuizRequest) => quizService.createQuiz(data),
    onSuccess: (quiz: QuizSet) => {
      toast.success(TOAST_MESSAGES.QUIZ_CREATED);
      invalidateQuizLists(queryClient);
      queryClient.setQueryData(QUIZ_QUERY_KEYS.detail(quiz.id), quiz);
    },
    onError: (error: ApiError) => {
      const message = handleApiError(error, { showToast: false });
      toast.error(message);
    },
  });
};

/**
 * Hook: useUpdateQuiz
 * Description:
 * - Updates an existing quiz with optimistic updates
 * - Immediately updates the UI before server confirmation
 * - Reverts changes if the update fails
 * - Invalidates related queries on success
 * - Shows success/error toast notifications
 *
 * Returns:
 * - React Query mutation object with update function and state
 */
export const useUpdateQuiz = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: UpdateQuizMutationVariables) => quizService.updateQuiz(id, data),
    onMutate: async ({ id, data }) => {
      return await performOptimisticUpdate(queryClient, id, data);
    },
    onSuccess: (quiz: QuizSet) => {
      toast.success(TOAST_MESSAGES.QUIZ_UPDATED);
      updateQuizCache(queryClient, quiz);
      invalidateRelatedQueries(queryClient, quiz.id);
    },
    onError: (error: ApiError, { id }, context) => {
      revertOptimisticUpdate(queryClient, id, context);
      const message = handleApiError(error, { showToast: false });
      toast.error(message);
    },
  });
};

/**
 * Hook: useDeleteQuiz
 * Description:
 * - Deletes a quiz
 * - Removes the quiz from cache on success
 * - Invalidates quiz lists cache
 * - Shows success/error toast notifications
 *
 * Returns:
 * - React Query mutation object with delete function and state
 */
export const useDeleteQuiz = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => quizService.deleteQuiz(id),
    onSuccess: (_, id) => {
      toast.success(TOAST_MESSAGES.QUIZ_DELETED);
      removeQuizFromCache(queryClient, id);
      invalidateQuizLists(queryClient);
    },
    onError: (error: ApiError) => {
      const message = handleApiError(error, { showToast: false });
      toast.error(message);
    },
  });
};

/**
 * Hook: useValidateQuiz
 * Description:
 * - Manually validates a quiz
 * - Shows different messages based on validation result
 * - Displays error count if validation fails
 *
 * Returns:
 * - React Query mutation object with validate function and state
 */
export const useValidateQuiz = () => {
  return useMutation({
    mutationFn: (quizId: string) => quizService.validateQuiz(quizId),
    onSuccess: (response: QuizValidationResponse) => {
      if (response.validation.isValid) {
        toast.success(TOAST_MESSAGES.QUIZ_VALIDATED);
      } else {
        toast.error(TOAST_MESSAGES.VALIDATION_ERROR(response.validation.errors.length));
      }
    },
    onError: (error: ApiError) => {
      const message = handleApiError(error, { showToast: false });
      toast.error(message);
    },
  });
};

/**
 * Hook: usePublishQuiz
 * Description:
 * - Publishes a quiz (changes status to published)
 * - Updates cache with new quiz status
 * - Invalidates related queries
 * - Shows success/error toast notifications
 *
 * Returns:
 * - React Query mutation object with publish function and state
 */
export const usePublishQuiz = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (quizId: string) => {
      const response = await quizService.publishQuiz(quizId);
      return response.quiz;
    },
    onSuccess: (quiz: QuizSet) => {
      toast.success(TOAST_MESSAGES.QUIZ_PUBLISHED);
      updateQuizCache(queryClient, quiz);
      invalidateRelatedQueries(queryClient, quiz.id);
    },
    onError: (error: ApiError) => {
      const message = handleApiError(error, { showToast: false });
      toast.error(message);
    },
  });
};

/**
 * Hook: useUnpublishQuiz
 * Description:
 * - Unpublishes a quiz (changes status to draft)
 * - Updates cache with new quiz status
 * - Invalidates quiz lists cache
 * - Shows success/error toast notifications
 *
 * Returns:
 * - React Query mutation object with unpublish function and state
 */
export const useUnpublishQuiz = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (quizId: string) => {
      const response = await quizService.unpublishQuiz(quizId);
      return response.quiz;
    },
    onSuccess: (quiz: QuizSet) => {
      toast.success(TOAST_MESSAGES.QUIZ_UNPUBLISHED);
      updateQuizCache(queryClient, quiz);
      invalidateQuizLists(queryClient);
    },
    onError: (error: ApiError) => {
      const message = handleApiError(error, { showToast: false });
      toast.error(message);
    },
  });
};

/**
 * Hook: useStartEditQuiz
 * Description:
 * - Starts editing a quiz by setting status to draft
 * - Updates cache with new status
 * - Invalidates quiz lists to reflect status change
 * - Shows success/error toast notifications
 *
 * Returns:
 * - React Query mutation object with startEdit function and state
 */
export const useStartEditQuiz = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => quizService.startEditQuiz(id),
    onSuccess: (data, quizId) => {
      queryClient.setQueryData(
        QUIZ_QUERY_KEYS.detail(quizId),
        (old: QuizSet | undefined) =>
          ({
            ...old,
            status: data.status,
            updated_at: data.updated_at,
          }) as QuizSet,
      );
      invalidateQuizLists(queryClient);
    },
    onError: (error: ApiError) => {
      const message = handleApiError(error, { showToast: false });
      toast.error(TOAST_MESSAGES.EDIT_START_FAILED(message));
    },
  });
};

/**
 * Hook: useSaveDraft
 * Description:
 * - Saves a quiz as draft (creates or updates)
 * - Updates cache with saved quiz data
 * - Invalidates quiz lists cache
 * - Does not show success toast (used for auto-save)
 * - Shows error toast on failure
 *
 * Returns:
 * - React Query mutation object with saveDraft function and state
 */
export const useSaveDraft = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ quizData, questions = [] }: SaveDraftMutationVariables) =>
      quizService.saveDraft(quizData, questions),
    onSuccess: ({ quiz }) => {
      updateQuizCache(queryClient, quiz);
      invalidateQuizLists(queryClient);
    },
    onError: (error: ApiError) => {
      const message = handleApiError(error, { showToast: false });
      toast.error(TOAST_MESSAGES.DRAFT_SAVE_FAILED(message));
    },
  });
};

/**
 * Hook: useQuizOperationState
 * Description:
 * - Aggregates loading and error states from all quiz mutations
 * - Provides individual loading states for each operation
 * - Useful for showing global loading indicators
 *
 * Returns:
 * - Object containing:
 *   - isLoading (boolean): True if any operation is pending
 *   - error (Error | null): First error from any operation
 *   - Individual loading flags for each operation type
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

//----------------------------------------------------
// 5. Helper Functions
//----------------------------------------------------
/**
 * Function: performOptimisticUpdate
 * Description:
 * - Performs optimistic update for quiz mutations
 * - Cancels outgoing queries and snapshots previous value
 * - Updates cache immediately with new data
 *
 * Parameters:
 * - queryClient (QueryClient): React Query client instance
 * - id (string): Quiz ID to update
 * - data (UpdateQuizRequest): Update data to apply
 *
 * Returns:
 * - Promise<OptimisticUpdateContext>: Context with previous quiz state
 */
async function performOptimisticUpdate(
  queryClient: ReturnType<typeof useQueryClient>,
  id: string,
  data: UpdateQuizRequest,
): Promise<OptimisticUpdateContext> {
  await queryClient.cancelQueries({ queryKey: QUIZ_QUERY_KEYS.detail(id) });

  const previousQuiz = queryClient.getQueryData<QuizSet>(QUIZ_QUERY_KEYS.detail(id));

  if (previousQuiz) {
    queryClient.setQueryData(QUIZ_QUERY_KEYS.detail(id), {
      ...previousQuiz,
      ...data,
      updated_at: new Date().toISOString(),
    });
  }

  return { previousQuiz };
}

/**
 * Function: revertOptimisticUpdate
 * Description:
 * - Reverts optimistic update if mutation fails
 * - Restores previous quiz state from context
 *
 * Parameters:
 * - queryClient (QueryClient): React Query client instance
 * - id (string): Quiz ID to revert
 * - context (OptimisticUpdateContext | undefined): Context with previous state
 */
function revertOptimisticUpdate(
  queryClient: ReturnType<typeof useQueryClient>,
  id: string,
  context: OptimisticUpdateContext | undefined,
): void {
  if (context?.previousQuiz) {
    queryClient.setQueryData(QUIZ_QUERY_KEYS.detail(id), context.previousQuiz);
  }
}

/**
 * Function: updateQuizCache
 * Description:
 * - Updates quiz in cache with new data
 *
 * Parameters:
 * - queryClient (QueryClient): React Query client instance
 * - quiz (QuizSet): Updated quiz data
 */
function updateQuizCache(queryClient: ReturnType<typeof useQueryClient>, quiz: QuizSet): void {
  queryClient.setQueryData(QUIZ_QUERY_KEYS.detail(quiz.id), quiz);
}

/**
 * Function: invalidateQuizLists
 * Description:
 * - Invalidates all quiz list queries
 *
 * Parameters:
 * - queryClient (QueryClient): React Query client instance
 */
function invalidateQuizLists(queryClient: ReturnType<typeof useQueryClient>): void {
  queryClient.invalidateQueries({
    queryKey: QUIZ_QUERY_KEYS.lists(),
  });
}

/**
 * Function: invalidateRelatedQueries
 * Description:
 * - Invalidates related queries for a quiz (lists and complete)
 *
 * Parameters:
 * - queryClient (QueryClient): React Query client instance
 * - quizId (string): Quiz ID to invalidate queries for
 */
function invalidateRelatedQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  quizId: string,
): void {
  invalidateQuizLists(queryClient);
  queryClient.invalidateQueries({
    queryKey: QUIZ_QUERY_KEYS.complete(quizId),
  });
}

/**
 * Function: removeQuizFromCache
 * Description:
 * - Removes quiz and related queries from cache
 *
 * Parameters:
 * - queryClient (QueryClient): React Query client instance
 * - id (string): Quiz ID to remove
 */
function removeQuizFromCache(queryClient: ReturnType<typeof useQueryClient>, id: string): void {
  queryClient.removeQueries({ queryKey: QUIZ_QUERY_KEYS.detail(id) });
  queryClient.removeQueries({ queryKey: QUIZ_QUERY_KEYS.complete(id) });
}

//----------------------------------------------------
// 6. Export
//----------------------------------------------------
