import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import quizLibraryService, {
  MyLibraryRequest,
  PublicBrowseRequest,
  CloneQuizResponse,
  QuizPreviewResponse,
} from '@/services/quizLibraryService';
import { QuizSet } from '@/types/quiz';
import { useQuizLibraryStore } from '@/state/useQuizLibraryStore';

// Query Keys
export const quizLibraryKeys = {
  all: ['quiz-library'] as const,
  myLibrary: () => [...quizLibraryKeys.all, 'my-library'] as const,
  myLibraryList: (filters: MyLibraryRequest) =>
    [...quizLibraryKeys.myLibrary(), 'list', filters] as const,
  publicBrowse: () => [...quizLibraryKeys.all, 'public-browse'] as const,
  publicBrowseList: (filters: PublicBrowseRequest) =>
    [...quizLibraryKeys.publicBrowse(), 'list', filters] as const,
  categories: () => [...quizLibraryKeys.all, 'categories'] as const,
  quiz: (id: string) => [...quizLibraryKeys.all, 'quiz', id] as const,
  preview: (id: string) => [...quizLibraryKeys.all, 'preview', id] as const,
};

// My Library Hook
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

        // Update store with new data
        setMyLibraryQuizzes(response.quizzes);
        setMyLibraryPagination(response.pagination);

        return response;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load my library';
        setMyLibraryError(errorMessage);
        throw error;
      } finally {
        setMyLibraryLoading(false);
      }
    },
    staleTime: 30000, // 30 seconds
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Public Browse Hook
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

        // Update store with new data
        setPublicQuizzes(response.quizzes);
        setPublicBrowsePagination(response.pagination);

        return response;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to load public quizzes';
        setPublicBrowseError(errorMessage);
        throw error;
      } finally {
        setPublicBrowseLoading(false);
      }
    },
    staleTime: 60000, // 1 minute (public data changes less frequently)
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Categories Hook
export function useCategories() {
  return useQuery({
    queryKey: quizLibraryKeys.categories(),
    queryFn: () => quizLibraryService.getCategories(),
    staleTime: 300000, // 5 minutes (categories change rarely)
    retry: 2,
  });
}

// Quiz Details Hook (for preview)
export function useQuizDetails(quizId: string, enabled = true) {
  return useQuery({
    queryKey: quizLibraryKeys.quiz(quizId),
    queryFn: () => quizLibraryService.getQuizDetails(quizId),
    enabled: !!quizId && enabled,
    staleTime: 60000, // 1 minute
    retry: 2,
  });
}

// Quiz Preview Hook (with questions and answers)
export function useQuizPreview(quizId: string, enabled = true) {
  return useQuery<QuizPreviewResponse>({
    queryKey: quizLibraryKeys.preview(quizId),
    queryFn: () => quizLibraryService.getQuizPreview(quizId),
    enabled: !!quizId && enabled,
    staleTime: 60000, // 1 minute
    retry: 2,
  });
}

// Clone Quiz Mutation
export function useCloneQuiz() {
  const queryClient = useQueryClient();
  const { addQuizToMyLibrary, setCloneLoading } = useQuizLibraryStore();

  return useMutation({
    mutationFn: (quizId: string) => {
      setCloneLoading(true);
      return quizLibraryService.cloneQuiz(quizId);
    },
    onSuccess: (data: CloneQuizResponse) => {
      // Add cloned quiz to my library in the store
      addQuizToMyLibrary(data.quiz);

      // Invalidate my library queries to refetch fresh data
      queryClient.invalidateQueries({
        queryKey: quizLibraryKeys.myLibrary(),
      });

      setCloneLoading(false);

      // Return the response for the component to handle success feedback
      return data;
    },
    onError: (error: Error) => {
      toast.error(error.message || 'クイズのクローンに失敗しました');
      setCloneLoading(false);
    },
  });
}

// Delete Quiz Mutation
export function useDeleteQuiz() {
  const queryClient = useQueryClient();
  const { removeQuizFromMyLibrary, setDeleteLoading } = useQuizLibraryStore();

  return useMutation({
    mutationFn: (quizId: string) => {
      setDeleteLoading(true);
      return quizLibraryService.deleteQuiz(quizId);
    },
    onSuccess: (data, quizId) => {
      // Remove quiz from my library in the store
      removeQuizFromMyLibrary(quizId);

      // Invalidate my library queries to refetch fresh data
      queryClient.invalidateQueries({
        queryKey: quizLibraryKeys.myLibrary(),
      });

      // Show success message
      toast.success(data.message || 'クイズが正常に削除されました');
      setDeleteLoading(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'クイズの削除に失敗しました');
      setDeleteLoading(false);
    },
  });
}

// Update Quiz Status Mutation
export function useUpdateQuizStatus() {
  const queryClient = useQueryClient();
  const { updateQuizInMyLibrary } = useQuizLibraryStore();

  return useMutation({
    mutationFn: ({
      quizId,
      status,
    }: {
      quizId: string;
      status: 'draft' | 'published' | 'archived';
    }) => quizLibraryService.updateQuizStatus(quizId, status),
    onSuccess: (updatedQuiz: QuizSet) => {
      // Update quiz in the store
      updateQuizInMyLibrary(updatedQuiz.id, updatedQuiz);

      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: quizLibraryKeys.myLibrary(),
      });
      queryClient.invalidateQueries({
        queryKey: quizLibraryKeys.quiz(updatedQuiz.id),
      });

      // Show success message
      const statusText =
        updatedQuiz.status === 'published'
          ? '公開'
          : updatedQuiz.status === 'draft'
            ? '下書き'
            : 'アーカイブ';
      toast.success(`クイズのステータスが「${statusText}」に変更されました`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'ステータスの変更に失敗しました');
    },
  });
}

// Prefetch helpers
export function usePrefetchQuizDetails() {
  const queryClient = useQueryClient();

  return (quizId: string) => {
    queryClient.prefetchQuery({
      queryKey: quizLibraryKeys.quiz(quizId),
      queryFn: () => quizLibraryService.getQuizDetails(quizId),
      staleTime: 60000,
    });
  };
}

export function usePrefetchMyLibrary() {
  const queryClient = useQueryClient();

  return (params: MyLibraryRequest = {}) => {
    queryClient.prefetchQuery({
      queryKey: quizLibraryKeys.myLibraryList(params),
      queryFn: () => quizLibraryService.getMyLibrary(params),
      staleTime: 30000,
    });
  };
}

// Optimistic update helpers
export function useOptimisticQuizUpdate() {
  const queryClient = useQueryClient();
  const { updateQuizInMyLibrary } = useQuizLibraryStore();

  return (quizId: string, updates: Partial<QuizSet>) => {
    // Update store immediately for instant UI feedback
    updateQuizInMyLibrary(quizId, updates);

    // Update query cache optimistically
    queryClient.setQueryData(quizLibraryKeys.quiz(quizId), (oldData: QuizSet | undefined) => {
      if (oldData) {
        return { ...oldData, ...updates };
      }
      return oldData;
    });
  };
}
