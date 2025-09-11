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
import { useCreateQuiz, useUpdateQuiz } from '@/hooks/useQuizMutation';
import { useFileUpload } from '@/lib/uploadService';
import { debugLog } from '@/components/debug';
import { Loader2 } from 'lucide-react';

interface BasicInfoStepProps {
  formData: Partial<CreateQuizSetForm>;
  onFormDataChange: (data: Partial<CreateQuizSetForm>) => void;
  onNext: (quizId: string) => void; // Now passes quiz ID to parent
  errors?: FormErrors<CreateQuizSetForm>;
  quizId?: string; // For editing existing quiz
  isLoading?: boolean;
}

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
  const { uploadQuizThumbnail } = useFileUpload();

  const isFormValid = () => {
    return (
      formData.title?.trim() &&
      formData.description?.trim() &&
      formData.difficulty_level &&
      formData.category?.trim()
    );
  };

  const handleNext = async () => {
    if (!isFormValid()) {
      return;
    }

    setIsSaving(true);
    debugLog.info('Starting quiz save process', { quizId, hasFormData: !!formData });

    try {
      let resultQuizId: string;

      if (quizId) {
        // Quiz already exists, always update it
        debugLog.info('Updating existing quiz', { quizId });
        const updatedQuiz = await updateQuizMutation.mutateAsync({
          id: quizId,
          data: formData as CreateQuizSetForm,
        });
        resultQuizId = updatedQuiz.id;
        debugLog.success('Quiz updated successfully', { quizId: resultQuizId });
      } else {
        // No quiz ID, create new quiz
        debugLog.info('Creating new quiz', { title: formData.title });
        // Create a copy of form data without the temporary file and blob URL for API call
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _thumbnailFile, thumbnail_url, ...quizFormData } = formData;
        const newQuiz = await createQuizMutation.mutateAsync(quizFormData as CreateQuizSetForm);
        resultQuizId = newQuiz.id;
        debugLog.success('Quiz created successfully', { quizId: resultQuizId });

        // If there's a pending thumbnail file, upload it now
        if (_thumbnailFile) {
          debugLog.info('Uploading pending thumbnail', {
            fileName: _thumbnailFile.name,
            size: _thumbnailFile.size,
          });
          const thumbnailUrl = await uploadQuizThumbnail(_thumbnailFile, resultQuizId);

          if (thumbnailUrl) {
            debugLog.success('Thumbnail uploaded successfully', { url: thumbnailUrl });

            // Update the quiz with the actual thumbnail URL
            try {
              await updateQuizMutation.mutateAsync({
                id: resultQuizId,
                data: { thumbnail_url: thumbnailUrl } as CreateQuizSetForm,
              });
              debugLog.success('Quiz updated with thumbnail URL', { url: thumbnailUrl });
            } catch (error) {
              debugLog.error('Failed to update quiz with thumbnail URL', { error });
            }

            // Update local form data
            onFormDataChange({
              ...formData,
              thumbnail_url: thumbnailUrl,
              _thumbnailFile: undefined,
            });
          } else {
            debugLog.warning('Thumbnail upload returned no URL');
          }
        }
      }

      debugLog.success('Proceeding to next step', { quizId: resultQuizId });
      // Move to next step with quiz ID
      onNext(resultQuizId);
    } catch (error) {
      debugLog.error('Failed to save quiz', {
        error: error instanceof Error ? error.message : String(error),
      });
      // Error is already handled by mutation hooks (toast notification)
      console.error('Failed to save quiz:', error);

      // If we have a quizId but update failed, still try to proceed
      // This handles cases where the quiz data hasn't actually changed
      if (quizId) {
        debugLog.warning('Update failed but proceeding with existing quiz ID', { quizId });
        onNext(quizId);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const isProcessing =
    isSaving || createQuizMutation.isPending || updateQuizMutation.isPending || isLoading;

  return (
    <div className="space-y-4 md:space-y-6">
      <FormHeader title="基本情報を入力" description="クイズの基本情報を設定してください" />

      {/* Auto-save indicator */}
      {isProcessing && (
        <div className="flex items-center justify-center p-2 bg-blue-50 border border-blue-200 rounded-lg">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600 mr-2" />
          <span className="text-sm text-blue-700">{isSaving ? '保存中...' : '処理中...'}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
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

        {/* Sidebar */}
        <div className="space-y-4 md:space-y-6">
          <ThumbnailUpload
            formData={formData}
            onFormDataChange={onFormDataChange}
            quizId={quizId} // Pass quiz ID for image upload
          />
          <VisibilitySettings formData={formData} onFormDataChange={onFormDataChange} />
          <TagsManager formData={formData} onFormDataChange={onFormDataChange} />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-end pt-4 md:pt-6 border-gray-500">
        <Button
          variant="gradient2"
          onClick={handleNext}
          disabled={!isFormValid() || isProcessing}
          className="px-6 md:px-8 text-sm md:text-base"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
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
