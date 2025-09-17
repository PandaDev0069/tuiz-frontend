// src/hooks/usePublishing.ts
// React hooks for quiz publishing operations

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { quizService } from '@/lib/quizService';
import { toast } from 'react-hot-toast';

// ============================================================================
// QUIZ VALIDATION HOOK
// ============================================================================

export function useValidateQuiz(quizId: string | undefined) {
  return useQuery({
    queryKey: ['quiz-validation', quizId],
    queryFn: async () => {
      if (!quizId) throw new Error('Quiz ID is required');
      return await quizService.validateQuiz(quizId);
    },
    enabled: !!quizId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
  });
}

// ============================================================================
// PUBLISH QUIZ HOOK
// ============================================================================

export function usePublishQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (quizId: string) => {
      return await quizService.publishQuiz(quizId);
    },
    onSuccess: () => {
      // Invalidate quiz queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['quiz'] });
      queryClient.invalidateQueries({ queryKey: ['quiz-validation'] });
    },
    onError: () => {
      // Error handling is done in the component
    },
  });
}

// ============================================================================
// UNPUBLISH QUIZ HOOK
// ============================================================================

export function useUnpublishQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (quizId: string) => {
      return await quizService.unpublishQuiz(quizId);
    },
    onSuccess: () => {
      toast.success('クイズの公開を取り消しました');

      // Invalidate quiz queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['quiz'] });
      queryClient.invalidateQueries({ queryKey: ['quiz-validation'] });
    },
    onError: () => {
      toast.error('クイズの公開取り消しに失敗しました');
    },
  });
}
