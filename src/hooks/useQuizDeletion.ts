// src/hooks/useQuizDeletion.ts
// Custom hook for quiz deletion with warning modal

import { useCallback } from 'react';
import { useConfirmation } from './useConfirmation';
import { useQuizActions } from './useDashboard';
import { QuizSet } from '@/types/quiz';

export const useQuizDeletion = () => {
  const { deleteQuiz, isDeleting } = useQuizActions();
  const { confirmDelete, WarningModalComponent } = useConfirmation();

  const confirmDeleteQuiz = useCallback(
    (quiz: QuizSet) => {
      confirmDelete(quiz.title, async () => {
        try {
          await deleteQuiz(quiz.id);
        } catch {
          // Error is handled in the hook
        }
      });
    },
    [deleteQuiz, confirmDelete],
  );

  return {
    confirmDeleteQuiz,
    isDeleting,
    WarningModalComponent,
  };
};
