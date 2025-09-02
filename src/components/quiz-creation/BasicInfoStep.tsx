'use client';

import React from 'react';
import { CreateQuizSetForm, FormErrors } from '@/types/quiz';
import { Button } from '@/components/ui';
import { FormHeader } from './BasicInfoStep/FormHeader';
import { TitleDescriptionForm } from './BasicInfoStep/TitleDescriptionForm';
import { DifficultyCategoryForm } from './BasicInfoStep/DifficultyCategoryForm';
import { ThumbnailUpload } from './BasicInfoStep/ThumbnailUpload';
import { VisibilitySettings } from './BasicInfoStep/VisibilitySettings';
import { TagsManager } from './BasicInfoStep/TagsManager';

interface BasicInfoStepProps {
  formData: Partial<CreateQuizSetForm>;
  onFormDataChange: (data: Partial<CreateQuizSetForm>) => void;
  onNext: () => void;
  errors?: FormErrors<CreateQuizSetForm>;
}

export const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  formData,
  onFormDataChange,
  onNext,
  errors = {},
}) => {
  const isFormValid = () => {
    return (
      formData.title?.trim() &&
      formData.description?.trim() &&
      formData.difficulty_level &&
      formData.category?.trim()
    );
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <FormHeader title="基本情報を入力" description="クイズの基本情報を設定してください" />

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
          <ThumbnailUpload formData={formData} onFormDataChange={onFormDataChange} />
          <VisibilitySettings formData={formData} onFormDataChange={onFormDataChange} />
          <TagsManager formData={formData} onFormDataChange={onFormDataChange} />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-end pt-4 md:pt-6 border-gray-500">
        <Button
          variant="gradient2"
          onClick={onNext}
          disabled={!isFormValid()}
          className="px-6 md:px-8 text-sm md:text-base"
        >
          次へ進む
        </Button>
      </div>
    </div>
  );
};
