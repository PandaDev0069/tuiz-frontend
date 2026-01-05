// ====================================================
// File Name   : useQuizLibrary.ts
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-17
// Last Update : 2025-09-17
//
// Description:
// - React hooks for quiz library operations using TanStack Query
// - Provides hooks for browsing, managing, and cloning quizzes
// - Integrates with quiz library store for state management
// - Handles my library, public browse, and quiz operations
//
// Notes:
// - Uses React Query for data fetching and caching
// - Synchronizes with Zustand store for UI state
// - Implements optimistic updates for better UX
// ====================================================

//----------------------------------------------------
// 1. Imports / Dependencies
//----------------------------------------------------
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

import quizLibraryService, {
  MyLibraryRequest,
  PublicBrowseRequest,
  CloneQuizResponse,
  QuizPreviewResponse,
} from '@/services/quizLibraryService';
import { useQuizLibraryStore } from '@/state/useQuizLibraryStore';

import type { QuizSet } from '@/types/quiz';

//----------------------------------------------------
// 2. Constants / Configuration
//----------------------------------------------------
const STALE_TIME_MY_LIBRARY_MS = 30 * 1000;
const STALE_TIME_PUBLIC_BROWSE_MS = 60 * 1000;
const STALE_TIME_CATEGORIES_MS = 5 * 60 * 1000;
const STALE_TIME_QUIZ_DETAILS_MS = 60 * 1000;
const STALE_TIME_QUIZ_PREVIEW_MS = 60 * 1000;

const QUERY_RETRY_COUNT = 2;
const RETRY_DELAY_BASE_MS = 1000;
const RETRY_DELAY_MAX_MS = 30 * 1000;

const QUERY_KEY_QUIZ_LIBRARY = 'quiz-library';
const QUERY_KEY_MY_LIBRARY = 'my-library';
const QUERY_KEY_PUBLIC_BROWSE = 'public-browse';
const QUERY_KEY_CATEGORIES = 'categories';
const QUERY_KEY_QUIZ = 'quiz';
const QUERY_KEY_PREVIEW = 'preview';
const QUERY_KEY_LIST = 'list';

const QUIZ_STATUS_DRAFT = 'draft';
const QUIZ_STATUS_PUBLISHED = 'published';
const QUIZ_STATUS_ARCHIVED = 'archived';

const STATUS_TEXT_MAP = {
  [QUIZ_STATUS_PUBLISHED]: '公開',
  [QUIZ_STATUS_DRAFT]: '下書き',
  [QUIZ_STATUS_ARCHIVED]: 'アーカイブ',
} as const;

const ERROR_MESSAGES = {
  FAILED_TO_LOAD_MY_LIBRARY: 'Failed to load my library',
  FAILED_TO_LOAD_PUBLIC_QUIZZES: 'Failed to load public quizzes',
  CLONE_FAILED: 'クイズのクローンに失敗しました',
  DELETE_FAILED: 'クイズの削除に失敗しました',
  STATUS_UPDATE_FAILED: 'ステータスの変更に失敗しました',
} as const;

const SUCCESS_MESSAGES = {
  QUIZ_DELETED: 'クイズが正常に削除されました',
  STATUS_UPDATED: (statusText: string) => `クイズのステータスが「${statusText}」に変更されました`,
} as const;

//----------------------------------------------------
// 3. Types / Interfaces
//----------------------------------------------------
interface UpdateQuizStatusVariables {
  quizId: string;
  status: typeof QUIZ_STATUS_DRAFT | typeof QUIZ_STATUS_PUBLISHED | typeof QUIZ_STATUS_ARCHIVED;
}

//----------------------------------------------------
// 4. Core Logic
//----------------------------------------------------
export const quizLibraryKeys = {
  all: [QUERY_KEY_QUIZ_LIBRARY] as const,
  myLibrary: () => [...quizLibraryKeys.all, QUERY_KEY_MY_LIBRARY] as const,
  myLibraryList: (filters: MyLibraryRequest) =>
    [...quizLibraryKeys.myLibrary(), QUERY_KEY_LIST, filters] as const,
  publicBrowse: () => [...quizLibraryKeys.all, QUERY_KEY_PUBLIC_BROWSE] as const,
  publicBrowseList: (filters: PublicBrowseRequest) =>
    [...quizLibraryKeys.publicBrowse(), QUERY_KEY_LIST, filters] as const,
  categories: () => [...quizLibraryKeys.all, QUERY_KEY_CATEGORIES] as const,
  quiz: (id: string) => [...quizLibraryKeys.all, QUERY_KEY_QUIZ, id] as const,
  preview: (id: string) => [...quizLibraryKeys.all, QUERY_KEY_PREVIEW, id] as const,
} as const;

/**
 * Hook: useMyLibrary
 * Description:
 * - Fetches user's quiz library with optional filtering
 * - Updates quiz library store with fetched data
 * - Handles loading and error states
 *
 * Parameters:
 * - params (MyLibraryRequest, optional): Filter parameters for the library query
 *
 * Returns:
 * - React Query result object with library data, loading state, and error
 */
export function useMyLibrary(params: MyLibraryRequest = {}) {
  const { setMyLibraryQuizzes, setMyLibraryPagination, setMyLibraryLoading, setMyLibraryError } =
    useQuizLibraryStore();

  return useQuery({
    queryKey: quizLibraryKeys.myLibraryList(params),
    queryFn: async () => {
      setMyLibraryLoading(true);
      setMyLibraryError(null);

      try {
        const response = await quizLibraryService.getMyLibrary(params);
        setMyLibraryQuizzes(response.quizzes);
        setMyLibraryPagination(response.pagination);
        return response;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : ERROR_MESSAGES.FAILED_TO_LOAD_MY_LIBRARY;
        setMyLibraryError(errorMessage);
        throw error;
      } finally {
        setMyLibraryLoading(false);
      }
    },
    staleTime: STALE_TIME_MY_LIBRARY_MS,
    retry: QUERY_RETRY_COUNT,
    retryDelay: (attemptIndex) => calculateRetryDelay(attemptIndex),
  });
}

/**
 * Hook: usePublicBrowse
 * Description:
 * - Fetches public quizzes with optional filtering
 * - Updates public browse store with fetched data
 * - Handles loading and error states
 *
 * Parameters:
 * - params (PublicBrowseRequest, optional): Filter parameters for the public browse query
 *
 * Returns:
 * - React Query result object with public quizzes data, loading state, and error
 */
export function usePublicBrowse(params: PublicBrowseRequest = {}) {
  const {
    setPublicQuizzes,
    setPublicBrowsePagination,
    setPublicBrowseLoading,
    setPublicBrowseError,
  } = useQuizLibraryStore();

  return useQuery({
    queryKey: quizLibraryKeys.publicBrowseList(params),
    queryFn: async () => {
      setPublicBrowseLoading(true);
      setPublicBrowseError(null);

      try {
        const response = await quizLibraryService.getPublicQuizzes(params);
        setPublicQuizzes(response.quizzes);
        setPublicBrowsePagination(response.pagination);
        return response;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : ERROR_MESSAGES.FAILED_TO_LOAD_PUBLIC_QUIZZES;
        setPublicBrowseError(errorMessage);
        throw error;
      } finally {
        setPublicBrowseLoading(false);
      }
    },
    staleTime: STALE_TIME_PUBLIC_BROWSE_MS,
    retry: QUERY_RETRY_COUNT,
    retryDelay: (attemptIndex) => calculateRetryDelay(attemptIndex),
  });
}

/**
 * Hook: useCategories
 * Description:
 * - Fetches available quiz categories
 * - Caches results for 5 minutes (categories change rarely)
 *
 * Returns:
 * - React Query result object with categories data, loading state, and error
 */
export function useCategories() {
  return useQuery({
    queryKey: quizLibraryKeys.categories(),
    queryFn: () => quizLibraryService.getCategories(),
    staleTime: STALE_TIME_CATEGORIES_MS,
    retry: QUERY_RETRY_COUNT,
  });
}

/**
 * Hook: useQuizDetails
 * Description:
 * - Fetches quiz details for preview
 * - Can be enabled/disabled based on component needs
 *
 * Parameters:
 * - quizId (string): ID of the quiz to fetch
 * - enabled (boolean, optional): Whether the query should run (default: true)
 *
 * Returns:
 * - React Query result object with quiz details, loading state, and error
 */
export function useQuizDetails(quizId: string, enabled = true) {
  return useQuery({
    queryKey: quizLibraryKeys.quiz(quizId),
    queryFn: () => quizLibraryService.getQuizDetails(quizId),
    enabled: !!quizId && enabled,
    staleTime: STALE_TIME_QUIZ_DETAILS_MS,
    retry: QUERY_RETRY_COUNT,
  });
}

/**
 * Hook: useQuizPreview
 * Description:
 * - Fetches complete quiz preview with questions and answers
 * - Can be enabled/disabled based on component needs
 *
 * Parameters:
 * - quizId (string): ID of the quiz to preview
 * - enabled (boolean, optional): Whether the query should run (default: true)
 *
 * Returns:
 * - React Query result object with quiz preview data, loading state, and error
 */
export function useQuizPreview(quizId: string, enabled = true) {
  return useQuery<QuizPreviewResponse>({
    queryKey: quizLibraryKeys.preview(quizId),
    queryFn: () => quizLibraryService.getQuizPreview(quizId),
    enabled: !!quizId && enabled,
    staleTime: STALE_TIME_QUIZ_PREVIEW_MS,
    retry: QUERY_RETRY_COUNT,
  });
}

/**
 * Hook: useCloneQuiz
 * Description:
 * - Clones a quiz to user's library
 * - Updates store with cloned quiz
 * - Invalidates my library queries to refetch fresh data
 * - Shows success/error toast notifications
 *
 * Returns:
 * - React Query mutation object with clone function and state
 */
export function useCloneQuiz() {
  const queryClient = useQueryClient();
  const { addQuizToMyLibrary, setCloneLoading } = useQuizLibraryStore();

  return useMutation({
    mutationFn: async (quizId: string) => {
      setCloneLoading(true);
      try {
        const result = await quizLibraryService.cloneQuiz(quizId);
        return result;
      } catch (error) {
        setCloneLoading(false);
        throw error;
      }
    },
    onSuccess: (data: CloneQuizResponse) => {
      if (data?.clonedQuiz) {
        addQuizToMyLibrary(data.clonedQuiz);
      }

      queryClient.invalidateQueries({
        queryKey: quizLibraryKeys.myLibrary(),
      });

      setCloneLoading(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || ERROR_MESSAGES.CLONE_FAILED);
      setCloneLoading(false);
    },
  });
}

/**
 * Hook: useDeleteQuiz
 * Description:
 * - Deletes a quiz from user's library
 * - Updates store by removing quiz
 * - Shows success/error toast notifications
 * - Does not invalidate queries to prevent race conditions
 *
 * Returns:
 * - React Query mutation object with delete function and state
 */
export function useDeleteQuiz() {
  const { removeQuizFromMyLibrary, setDeleteLoading } = useQuizLibraryStore();

  return useMutation({
    mutationFn: (quizId: string) => {
      setDeleteLoading(true);
      return quizLibraryService.deleteQuiz(quizId);
    },
    onSuccess: (data, quizId) => {
      removeQuizFromMyLibrary(quizId);
      toast.success(data.message || SUCCESS_MESSAGES.QUIZ_DELETED);
      setDeleteLoading(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || ERROR_MESSAGES.DELETE_FAILED);
      setDeleteLoading(false);
    },
  });
}

/**
 * Hook: useUpdateQuizStatus
 * Description:
 * - Updates quiz status (draft, published, archived)
 * - Updates store with new status
 * - Invalidates related queries
 * - Shows success/error toast notifications with status text
 *
 * Returns:
 * - React Query mutation object with updateStatus function and state
 */
export function useUpdateQuizStatus() {
  const queryClient = useQueryClient();
  const { updateQuizInMyLibrary } = useQuizLibraryStore();

  return useMutation({
    mutationFn: ({ quizId, status }: UpdateQuizStatusVariables) =>
      quizLibraryService.updateQuizStatus(quizId, status),
    onSuccess: (updatedQuiz: QuizSet) => {
      updateQuizInMyLibrary(updatedQuiz.id, updatedQuiz);

      queryClient.invalidateQueries({
        queryKey: quizLibraryKeys.myLibrary(),
      });
      queryClient.invalidateQueries({
        queryKey: quizLibraryKeys.quiz(updatedQuiz.id),
      });

      const statusText = getStatusText(updatedQuiz.status);
      toast.success(SUCCESS_MESSAGES.STATUS_UPDATED(statusText));
    },
    onError: (error: Error) => {
      toast.error(error.message || ERROR_MESSAGES.STATUS_UPDATE_FAILED);
    },
  });
}

/**
 * Hook: usePrefetchQuizDetails
 * Description:
 * - Returns a function to prefetch quiz details
 * - Useful for prefetching data on hover or before navigation
 *
 * Returns:
 * - Function that accepts quizId and prefetches quiz details
 */
export function usePrefetchQuizDetails() {
  const queryClient = useQueryClient();

  return (quizId: string) => {
    queryClient.prefetchQuery({
      queryKey: quizLibraryKeys.quiz(quizId),
      queryFn: () => quizLibraryService.getQuizDetails(quizId),
      staleTime: STALE_TIME_QUIZ_DETAILS_MS,
    });
  };
}

/**
 * Hook: usePrefetchMyLibrary
 * Description:
 * - Returns a function to prefetch my library data
 * - Useful for prefetching data before navigation
 *
 * Returns:
 * - Function that accepts params and prefetches my library data
 */
export function usePrefetchMyLibrary() {
  const queryClient = useQueryClient();

  return (params: MyLibraryRequest = {}) => {
    queryClient.prefetchQuery({
      queryKey: quizLibraryKeys.myLibraryList(params),
      queryFn: () => quizLibraryService.getMyLibrary(params),
      staleTime: STALE_TIME_MY_LIBRARY_MS,
    });
  };
}

/**
 * Hook: useOptimisticQuizUpdate
 * Description:
 * - Returns a function to perform optimistic quiz updates
 * - Updates both store and query cache immediately
 * - Provides instant UI feedback before server confirmation
 *
 * Returns:
 * - Function that accepts quizId and updates to apply optimistically
 */
export function useOptimisticQuizUpdate() {
  const queryClient = useQueryClient();
  const { updateQuizInMyLibrary } = useQuizLibraryStore();

  return (quizId: string, updates: Partial<QuizSet>) => {
    updateQuizInMyLibrary(quizId, updates);

    queryClient.setQueryData(quizLibraryKeys.quiz(quizId), (oldData: QuizSet | undefined) => {
      if (oldData) {
        return { ...oldData, ...updates };
      }
      return oldData;
    });
  };
}

//----------------------------------------------------
// 5. Helper Functions
//----------------------------------------------------
/**
 * Function: calculateRetryDelay
 * Description:
 * - Calculates exponential backoff delay for retry attempts
 * - Caps delay at maximum value
 *
 * Parameters:
 * - attemptIndex (number): Zero-based attempt index
 *
 * Returns:
 * - number: Delay in milliseconds
 */
function calculateRetryDelay(attemptIndex: number): number {
  return Math.min(RETRY_DELAY_BASE_MS * 2 ** attemptIndex, RETRY_DELAY_MAX_MS);
}

/**
 * Function: getStatusText
 * Description:
 * - Maps quiz status to Japanese text for display
 *
 * Parameters:
 * - status (string): Quiz status value
 *
 * Returns:
 * - string: Japanese text for the status
 */
function getStatusText(status: string): string {
  return STATUS_TEXT_MAP[status as keyof typeof STATUS_TEXT_MAP] || status;
}

//----------------------------------------------------
// 6. Export
//----------------------------------------------------
