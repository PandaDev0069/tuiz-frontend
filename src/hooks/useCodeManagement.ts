// src/hooks/useCodeManagement.ts
// React hooks for custom code management

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { quizService } from '@/lib/quizService';
import { toast } from 'react-hot-toast';
import { QuizPlaySettings } from '@/types/quiz';

// ============================================================================
// CODE GENERATION HOOK
// ============================================================================

export function useGenerateCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (quizId: string) => {
      return await quizService.generateQuizCode(quizId);
    },
    onSuccess: () => {
      toast.success('新しいコードが生成されました');

      // Invalidate quiz queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['quiz'] });
    },
    onError: () => {
      toast.error('コードの生成に失敗しました');
    },
  });
}

// ============================================================================
// CODE AVAILABILITY CHECKING HOOK
// ============================================================================

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

// ============================================================================
// GET QUIZ CODE HOOK
// ============================================================================

export function useGetQuizCode(quizId: string | undefined) {
  return useQuery({
    queryKey: ['quiz-code', quizId],
    queryFn: async () => {
      if (!quizId) throw new Error('Quiz ID is required');
      return await quizService.getQuizCode(quizId);
    },
    enabled: !!quizId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

// ============================================================================
// REMOVE QUIZ CODE HOOK
// ============================================================================

export function useRemoveQuizCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (quizId: string) => {
      return await quizService.removeQuizCode(quizId);
    },
    onSuccess: () => {
      toast.success('コードが削除されました');

      // Invalidate quiz queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['quiz'] });
    },
    onError: () => {
      toast.error('コードの削除に失敗しました');
    },
  });
}

// ============================================================================
// CODE VALIDATION HOOK
// ============================================================================

export function useCodeValidation() {
  const checkAvailability = useCheckCodeAvailability();

  const validateCode = async (
    code: number,
  ): Promise<{
    isValid: boolean;
    isAvailable: boolean;
    message: string;
  }> => {
    // Basic format validation
    if (code < 100000 || code > 999999) {
      return {
        isValid: false,
        isAvailable: false,
        message: 'コードは6桁の数字である必要があります',
      };
    }

    try {
      const result = await checkAvailability.mutateAsync(code);
      return {
        isValid: true,
        isAvailable: result.isAvailable,
        message: result.isAvailable
          ? 'このコードは使用可能です'
          : 'このコードは既に使用されています',
      };
    } catch {
      return {
        isValid: false,
        isAvailable: false,
        message: 'コードの確認中にエラーが発生しました',
      };
    }
  };

  return {
    validateCode,
    isChecking: checkAvailability.isPending,
  };
}

// ============================================================================
// PLAY SETTINGS UPDATE HOOK
// ============================================================================

export function useUpdatePlaySettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      quizId,
      playSettings,
    }: {
      quizId: string;
      playSettings: Partial<QuizPlaySettings>;
    }) => {
      return await quizService.updatePlaySettings(quizId, playSettings);
    },
    onSuccess: () => {
      toast.success('設定が保存されました');

      // Invalidate quiz queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['quiz'] });
    },
    onError: () => {
      toast.error('設定の保存に失敗しました');
    },
  });
}
