// ====================================================
// File Name   : useQuizDeletion.ts
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-14
// Last Update : 2025-09-14
//
// Description:
// - Custom hook for quiz deletion with confirmation modal
// - Integrates deletion action with warning confirmation dialog
// - Provides loading state and modal component
//
// Notes:
// - Uses useConfirmation hook for confirmation dialog
// - Errors are handled by the underlying deleteQuiz hook
// ====================================================

//----------------------------------------------------
// 1. Imports / Dependencies
//----------------------------------------------------
import { useCallback } from 'react';

import { useConfirmation } from './useConfirmation';
import { useQuizActions } from './useDashboard';

import type { QuizSet } from '@/types/quiz';

//----------------------------------------------------
// 2. Constants / Configuration
//----------------------------------------------------

//----------------------------------------------------
// 3. Types / Interfaces
//----------------------------------------------------

//----------------------------------------------------
// 4. Core Logic
//----------------------------------------------------
/**
 * Hook: useQuizDeletion
 * Description:
 * - Provides quiz deletion functionality with confirmation modal
 * - Wraps delete action with confirmation dialog
 * - Returns deletion function, loading state, and modal component
 *
 * Returns:
 * - Object containing:
 *   - confirmDeleteQuiz (function): Function to trigger deletion with confirmation
 *   - isDeleting (boolean): Loading state for deletion operation
 *   - WarningModalComponent (React component): Confirmation modal component
 *
 * Example:
 * ```ts
 * const { confirmDeleteQuiz, isDeleting, WarningModalComponent } = useQuizDeletion();
 * confirmDeleteQuiz(quiz);
 * ```
 */
export const useQuizDeletion = () => {
  const { deleteQuiz, isDeleting } = useQuizActions();
  const { confirmDelete, WarningModalComponent } = useConfirmation();

  const confirmDeleteQuiz = useCallback(
    (quiz: QuizSet) => {
      confirmDelete(quiz.title, async () => {
        await deleteQuiz(quiz.id);
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

//----------------------------------------------------
// 5. Helper Functions
//----------------------------------------------------

//----------------------------------------------------
// 6. Export
//----------------------------------------------------
