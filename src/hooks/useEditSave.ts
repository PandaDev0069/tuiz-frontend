// src/hooks/useEditSave.ts
// Hook for managing save status during quiz editing

import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { quizService } from '@/lib/quizService';
import { CreateQuizSetForm, CreateQuestionForm } from '@/types/quiz';
import { handleApiError } from '@/lib/apiClient';
import { ApiError } from '@/types/api';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export const useEditSave = (quizId: string) => {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const saveQuizData = useCallback(
    async (formData: Partial<CreateQuizSetForm>) => {
      if (!quizId) return;

      try {
        setSaveStatus('saving');

        // Convert form data to update request format
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

        setSaveStatus('saved');
        setLastSaved(new Date());

        // Show success toast briefly
        toast.success('クイズ情報を保存しました', { duration: 2000 });
      } catch (error) {
        setSaveStatus('error');
        const message = handleApiError(error as unknown as ApiError, { showToast: false });
        toast.error(`保存に失敗しました: ${message}`);
      }
    },
    [quizId],
  );

  const saveQuestionsData = useCallback(
    async (questions: CreateQuestionForm[]) => {
      if (!quizId) return;

      try {
        setSaveStatus('saving');

        // Convert questions to the format expected by the API
        const questionsToSave = questions.map((question) => ({
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
        }));

        await quizService.saveQuestionsData(quizId, questionsToSave);

        setSaveStatus('saved');
        setLastSaved(new Date());

        // Show success toast briefly
        toast.success('問題を保存しました', { duration: 2000 });
      } catch (error) {
        setSaveStatus('error');
        const message = handleApiError(error as unknown as ApiError, { showToast: false });
        toast.error(`問題の保存に失敗しました: ${message}`);
      }
    },
    [quizId],
  );

  const resetSaveStatus = useCallback(() => {
    setSaveStatus('idle');
  }, []);

  return {
    saveStatus,
    lastSaved,
    saveQuizData,
    saveQuestionsData,
    resetSaveStatus,
  };
};
