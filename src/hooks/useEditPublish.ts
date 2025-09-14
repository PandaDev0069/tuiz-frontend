// src/hooks/useEditPublish.ts
// Hook for handling quiz publishing during editing

import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { quizService } from '@/lib/quizService';
import { handleApiError } from '@/lib/apiClient';
import { ApiError } from '@/types/api';

export const useEditPublish = (quizId: string) => {
  const router = useRouter();
  const [isPublishing, setIsPublishing] = useState(false);

  const publishMutation = useMutation({
    mutationFn: () => quizService.publishEditedQuiz(quizId),
    onSuccess: () => {
      toast.success('クイズが公開されました！', {
        duration: 3000,
        position: 'top-center',
      });

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    },
    onError: (error) => {
      const message = handleApiError(error as unknown as ApiError, { showToast: false });
      toast.error(`公開に失敗しました: ${message}`, {
        duration: 4000,
        position: 'top-center',
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
