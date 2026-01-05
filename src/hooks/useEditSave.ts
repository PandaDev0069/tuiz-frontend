// ====================================================
// File Name   : useEditSave.ts
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-14
// Last Update : 2025-09-14
//
// Description:
// - Hook for managing save status during quiz editing
// - Provides functions for saving quiz data and questions
// - Tracks save status and last saved timestamp
// - Handles error states and user feedback via toasts
//
// Notes:
// - Supports saving quiz metadata and questions separately
// - Provides status tracking for UI feedback
// - Handles API errors gracefully with user-friendly messages
// ====================================================

//----------------------------------------------------
// 1. Imports / Dependencies
//----------------------------------------------------
import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';

import { quizService } from '@/lib/quizService';
import { handleApiError } from '@/lib/apiClient';

import type { CreateQuizSetForm, CreateQuestionForm } from '@/types/quiz';
import type { ApiError } from '@/types/api';

//----------------------------------------------------
// 2. Constants / Configuration
//----------------------------------------------------
const TOAST_DURATION_MS = 2000;

const SAVE_STATUS = {
  IDLE: 'idle',
  SAVING: 'saving',
  SAVED: 'saved',
  ERROR: 'error',
} as const;

const TOAST_MESSAGES = {
  QUIZ_SAVED: 'クイズ情報を保存しました',
  QUIZ_SAVE_FAILED: (message: string) => `保存に失敗しました: ${message}`,
  QUESTIONS_SAVED: '問題を保存しました',
  QUESTIONS_SAVE_FAILED: (message: string) => `問題の保存に失敗しました: ${message}`,
} as const;

//----------------------------------------------------
// 3. Types / Interfaces
//----------------------------------------------------
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

//----------------------------------------------------
// 4. Core Logic
//----------------------------------------------------

//----------------------------------------------------
// 5. Helper Functions
//----------------------------------------------------
/**
 * Function: mapQuestionToApiFormat
 * Description:
 * - Converts question form data to API-expected format
 * - Maps all question fields including answers
 *
 * Parameters:
 * - question (CreateQuestionForm): Question form data
 *
 * Returns:
 * - Object: Question data in API format
 */
function mapQuestionToApiFormat(question: CreateQuestionForm) {
  return {
    question_text: question.question_text,
    question_type: question.question_type,
    image_url: question.image_url,
    show_question_time: question.show_question_time,
    answering_time: question.answering_time,
    points: question.points,
    difficulty: question.difficulty,
    order_index: question.order_index,
    explanation_title: question.explanation_title,
    explanation_text: question.explanation_text,
    explanation_image_url: question.explanation_image_url,
    show_explanation_time: question.show_explanation_time,
    answers: question.answers.map((answer) => ({
      answer_text: answer.answer_text,
      image_url: answer.image_url,
      is_correct: answer.is_correct,
      order_index: answer.order_index,
    })),
  };
}

/**
 * Hook: useEditSave
 * Description:
 * - Manages save status and operations for quiz editing
 * - Provides functions to save quiz data and questions
 * - Tracks save status and last saved timestamp
 * - Handles errors and provides user feedback
 *
 * Parameters:
 * - quizId (string): Unique identifier for the quiz being edited
 *
 * Returns:
 * - Object containing:
 *   - saveStatus (SaveStatus): Current save status
 *   - lastSaved (Date | null): Timestamp of last successful save
 *   - saveQuizData (function): Function to save quiz metadata
 *   - saveQuestionsData (function): Function to save questions
 *   - resetSaveStatus (function): Function to reset save status to idle
 */
export const useEditSave = (quizId: string) => {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>(SAVE_STATUS.IDLE);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const saveQuizData = useCallback(
    async (formData: Partial<CreateQuizSetForm>) => {
      if (!quizId) return;

      try {
        setSaveStatus(SAVE_STATUS.SAVING);

        const updateData = {
          title: formData.title,
          description: formData.description,
          is_public: formData.is_public,
          difficulty_level: formData.difficulty_level,
          category: formData.category,
          tags: formData.tags,
          play_settings: formData.play_settings,
        };

        await quizService.saveQuizData(quizId, updateData);

        setSaveStatus(SAVE_STATUS.SAVED);
        setLastSaved(new Date());

        toast.success(TOAST_MESSAGES.QUIZ_SAVED, { duration: TOAST_DURATION_MS });
      } catch (error) {
        setSaveStatus(SAVE_STATUS.ERROR);
        const message = handleApiError(error as unknown as ApiError, { showToast: false });
        toast.error(TOAST_MESSAGES.QUIZ_SAVE_FAILED(message));
      }
    },
    [quizId],
  );

  const saveQuestionsData = useCallback(
    async (questions: CreateQuestionForm[]) => {
      if (!quizId) return;

      try {
        setSaveStatus(SAVE_STATUS.SAVING);

        const questionsToSave = questions.map(mapQuestionToApiFormat);

        await quizService.saveQuestionsData(quizId, questionsToSave);

        setSaveStatus(SAVE_STATUS.SAVED);
        setLastSaved(new Date());

        toast.success(TOAST_MESSAGES.QUESTIONS_SAVED, { duration: TOAST_DURATION_MS });
      } catch (error) {
        setSaveStatus(SAVE_STATUS.ERROR);
        const message = handleApiError(error as unknown as ApiError, { showToast: false });
        toast.error(TOAST_MESSAGES.QUESTIONS_SAVE_FAILED(message));
      }
    },
    [quizId],
  );

  const resetSaveStatus = useCallback(() => {
    setSaveStatus(SAVE_STATUS.IDLE);
  }, []);

  return {
    saveStatus,
    lastSaved,
    saveQuizData,
    saveQuestionsData,
    resetSaveStatus,
  };
};

//----------------------------------------------------
// 6. Export
//----------------------------------------------------
