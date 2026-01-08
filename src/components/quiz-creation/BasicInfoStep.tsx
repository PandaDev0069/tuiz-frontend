// ====================================================
// File Name   : BasicInfoStep.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-02
// Last Update : 2025-09-13
//
// Description:
// - First step component in quiz creation/editing flow
// - Handles basic information input (title, description, difficulty, category)
// - Manages thumbnail upload and visibility settings
// - Validates form data before proceeding to next step
// - Supports both creating new quizzes and editing existing ones
//
// Notes:
// - Client-only component (requires 'use client')
// - Creates or updates quiz before proceeding to question creation
// - Handles thumbnail upload separately after quiz creation
// ====================================================

'use client';

import React, { useState } from 'react';
import { CreateQuizSetForm, FormErrors } from '@/types/quiz';
import { Button } from '@/components/ui';
import { FormHeader } from './BasicInfoStep/FormHeader';
import { TitleDescriptionForm } from './BasicInfoStep/TitleDescriptionForm';
import { DifficultyCategoryForm } from './BasicInfoStep/DifficultyCategoryForm';
import { ThumbnailUpload } from './BasicInfoStep/ThumbnailUpload';
import { VisibilitySettings } from './BasicInfoStep/VisibilitySettings';
import { TagsManager } from './BasicInfoStep/TagsManager';
import { useCreateQuiz, useUpdateQuiz, useStartEditQuiz } from '@/hooks/useQuizMutation';
import { useFileUpload } from '@/lib/uploadService';
import { Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';

const BUTTON_VARIANT_GRADIENT2 = 'gradient2';

const ICON_SIZE_SMALL = 'w-4 h-4';
const ICON_ANIMATION = 'animate-spin';
const ICON_MARGIN = 'mr-2';

const BUTTON_PADDING_CLASSES = 'px-6 md:px-8 text-sm md:text-base';
const CONTAINER_SPACING_CLASSES = 'space-y-4 md:space-y-6';
const GRID_LAYOUT_CLASSES = 'grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6';
const MAIN_FORM_COLUMN_CLASSES = 'lg:col-span-2 space-y-4 md:space-y-6';
const NAVIGATION_CONTAINER_CLASSES = 'flex justify-end pt-4 md:pt-6 border-gray-500';

const PROCESSING_INDICATOR_CLASSES =
  'flex items-center justify-center p-2 bg-blue-50 border border-blue-200 rounded-lg';
const PROCESSING_ICON_CLASSES = 'text-blue-600';
const PROCESSING_TEXT_CLASSES = 'text-sm text-blue-700';

interface BasicInfoStepProps {
  formData: Partial<CreateQuizSetForm>;
  onFormDataChange: (data: Partial<CreateQuizSetForm>) => void;
  onNext: (quizId: string) => void;
  errors?: FormErrors<CreateQuizSetForm>;
  quizId?: string;
  isLoading?: boolean;
}

/**
 * Component: BasicInfoStep
 * Description:
 * - First step in quiz creation/editing workflow
 * - Collects basic quiz information (title, description, difficulty, category)
 * - Handles thumbnail upload and visibility settings
 * - Validates form before allowing progression to question creation
 * - Creates new quiz or updates existing quiz based on quizId prop
 * - Shows processing indicator during save operations
 *
 * Parameters:
 * - formData (Partial<CreateQuizSetForm>): Current form data
 * - onFormDataChange (function): Callback when form data changes
 * - onNext (function): Callback when proceeding to next step, receives quiz ID
 * - errors (FormErrors<CreateQuizSetForm>, optional): Form validation errors
 * - quizId (string, optional): ID of quiz being edited, undefined for new quiz
 * - isLoading (boolean, optional): External loading state
 *
 * Returns:
 * - React.ReactElement: The basic info step component
 *
 * Example:
 * ```tsx
 * <BasicInfoStep
 *   formData={formData}
 *   onFormDataChange={(data) => setFormData(data)}
 *   onNext={(quizId) => navigateToQuestions(quizId)}
 *   errors={errors}
 *   quizId={existingQuizId}
 *   isLoading={false}
 * />
 * ```
 */
export const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  formData,
  onFormDataChange,
  onNext,
  errors = {},
  quizId,
  isLoading = false,
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const createQuizMutation = useCreateQuiz();
  const updateQuizMutation = useUpdateQuiz();
  const startEditMutation = useStartEditQuiz();
  const { uploadQuizThumbnail } = useFileUpload();

  /**
   * Function: isFormValid
   * Description:
   * - Validates that all required form fields are filled
   * - Checks title, description, difficulty_level, and category
   *
   * Returns:
   * - boolean: True if form is valid, false otherwise
   */
  const isFormValid = () => {
    return (
      formData.title?.trim() &&
      formData.description?.trim() &&
      formData.difficulty_level &&
      formData.category?.trim()
    );
  };

  /**
   * Function: handleNext
   * Description:
   * - Handles form submission and navigation to next step
   * - Creates new quiz or updates existing quiz based on quizId
   * - Uploads thumbnail if provided for new quizzes
   * - Updates quiz with thumbnail URL after upload
   * - Calls onNext with quiz ID on success
   *
   * Returns:
   * - Promise<void>
   */
  const handleNext = async () => {
    if (!isFormValid()) {
      return;
    }

    setIsSaving(true);

    try {
      let resultQuizId: string;

      if (quizId) {
        await startEditMutation.mutateAsync(quizId);

        const updatedQuiz = await updateQuizMutation.mutateAsync({
          id: quizId,
          data: formData as CreateQuizSetForm,
        });
        resultQuizId = updatedQuiz.id;
      } else {
        const { _thumbnailFile, ...quizFormData } = formData;
        const newQuiz = await createQuizMutation.mutateAsync(quizFormData as CreateQuizSetForm);
        resultQuizId = newQuiz.id;

        if (_thumbnailFile) {
          const thumbnailUrl = await uploadQuizThumbnail(_thumbnailFile, resultQuizId);

          if (thumbnailUrl) {
            try {
              await updateQuizMutation.mutateAsync({
                id: resultQuizId,
                data: { thumbnail_url: thumbnailUrl } as CreateQuizSetForm,
              });
            } catch (error) {
              console.error('Failed to update quiz with thumbnail URL:', error);
            }

            onFormDataChange({
              ...formData,
              thumbnail_url: thumbnailUrl,
              _thumbnailFile: undefined,
            });
          }
        }
      }

      onNext(resultQuizId);
    } catch (error) {
      console.error('Failed to save quiz:', error);

      if (quizId) {
        onNext(quizId);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const isProcessing =
    isSaving ||
    createQuizMutation.isPending ||
    updateQuizMutation.isPending ||
    startEditMutation.isPending ||
    isLoading;

  return (
    <div className={CONTAINER_SPACING_CLASSES}>
      <FormHeader title="基本情報を入力" description="クイズの基本情報を設定してください" />

      {isProcessing && (
        <div className={PROCESSING_INDICATOR_CLASSES}>
          <Loader2
            className={cn(ICON_SIZE_SMALL, ICON_ANIMATION, PROCESSING_ICON_CLASSES, ICON_MARGIN)}
          />
          <span className={PROCESSING_TEXT_CLASSES}>{isSaving ? '保存中...' : '処理中...'}</span>
        </div>
      )}

      <div className={GRID_LAYOUT_CLASSES}>
        <div className={MAIN_FORM_COLUMN_CLASSES}>
          <TitleDescriptionForm
            formData={formData}
            onFormDataChange={onFormDataChange}
            errors={errors}
          />
          <DifficultyCategoryForm
            formData={formData}
            onFormDataChange={onFormDataChange}
            errors={errors}
          />
        </div>

        <div className={CONTAINER_SPACING_CLASSES}>
          <ThumbnailUpload
            formData={formData}
            onFormDataChange={onFormDataChange}
            quizId={quizId}
          />
          <VisibilitySettings formData={formData} onFormDataChange={onFormDataChange} />
          <TagsManager formData={formData} onFormDataChange={onFormDataChange} />
        </div>
      </div>

      <div className={NAVIGATION_CONTAINER_CLASSES}>
        <Button
          variant={BUTTON_VARIANT_GRADIENT2}
          onClick={handleNext}
          disabled={!isFormValid() || isProcessing}
          className={BUTTON_PADDING_CLASSES}
        >
          {isProcessing ? (
            <>
              <Loader2 className={cn(ICON_SIZE_SMALL, ICON_ANIMATION, ICON_MARGIN)} />
              {isSaving ? '保存中...' : '処理中...'}
            </>
          ) : (
            '次へ進む'
          )}
        </Button>
      </div>
    </div>
  );
};
