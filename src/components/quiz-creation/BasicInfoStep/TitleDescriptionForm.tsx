// ====================================================
// File Name   : TitleDescriptionForm.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-03
// Last Update : 2025-09-03
//
// Description:
// - Form component for quiz title and description input
// - Displays two cards for title and description fields
// - Handles form validation and error display
// - Uses Input and Textarea components with error states
//
// Notes:
// - Client component (no 'use client' needed as parent handles it)
// - Uses responsive design for mobile and desktop
// - Implements error handling with visual feedback
// ====================================================

import React from 'react';
import { BookOpen } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Label,
  Input,
  Textarea,
} from '@/components/ui';
import { CreateQuizSetForm, FormErrors } from '@/types/quiz';
import { cn } from '@/lib/utils';

const DEFAULT_EMPTY_VALUE = '';

const FORM_FIELD_TITLE = 'title';
const FORM_FIELD_DESCRIPTION = 'description';

const LABEL_VARIANT_PRIMARY = 'primary';
const INPUT_VARIANT_PRIMARY = 'primary';
const INPUT_VARIANT_ERROR = 'error';

const ICON_SIZE_SMALL = 'w-4 h-4';
const TEXTAREA_MIN_HEIGHT = 'min-h-[100px]';

interface TitleDescriptionFormProps {
  formData: Partial<CreateQuizSetForm>;
  onFormDataChange: (data: Partial<CreateQuizSetForm>) => void;
  errors?: FormErrors<CreateQuizSetForm>;
}

/**
 * Component: TitleDescriptionForm
 * Description:
 * - Renders form with two cards for title and description input
 * - Handles form input changes and displays validation errors
 * - Uses Input component for title and Textarea for description
 * - Implements responsive design with mobile and desktop layouts
 *
 * Parameters:
 * - formData (Partial<CreateQuizSetForm>): Current form data values
 * - onFormDataChange (function): Callback function when form data changes
 * - errors (FormErrors<CreateQuizSetForm>, optional): Form validation errors
 *
 * Returns:
 * - React.ReactElement: The title and description form component
 *
 * Example:
 * ```tsx
 * <TitleDescriptionForm
 *   formData={formData}
 *   onFormDataChange={(data) => setFormData(data)}
 *   errors={errors}
 * />
 * ```
 */
export const TitleDescriptionForm: React.FC<TitleDescriptionFormProps> = ({
  formData,
  onFormDataChange,
  errors = {},
}) => {
  const handleInputChange = (field: keyof CreateQuizSetForm, value: string) => {
    onFormDataChange({
      ...formData,
      [field]: value,
    });
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <Card className="bg-gradient-to-br from-lime-200 to-green-300 border-lime-400 shadow-lg">
        <CardHeader className="pb-3 md:pb-6 px-3 md:px-6">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <BookOpen className={cn(ICON_SIZE_SMALL, 'md:w-5 md:h-5 text-primary')} />
            クイズタイトル
          </CardTitle>
          <CardDescription className="text-xs md:text-sm">
            分かりやすく魅力的なタイトルを入力してください
          </CardDescription>
        </CardHeader>
        <CardContent className="px-3 md:px-6">
          <div className="space-y-2">
            <Label htmlFor={FORM_FIELD_TITLE} required variant={LABEL_VARIANT_PRIMARY}>
              タイトル
            </Label>
            <Input
              id={FORM_FIELD_TITLE}
              placeholder="例: JavaScript基礎知識クイズ"
              value={formData.title || DEFAULT_EMPTY_VALUE}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleInputChange(FORM_FIELD_TITLE, e.target.value)
              }
              className={cn(
                'border-2 border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500',
                errors.title && 'border-red-500',
              )}
            />
            {errors.title && <p className="text-sm text-red-600">{errors.title}</p>}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-lime-200 to-green-300 border-lime-400 shadow-lg">
        <CardHeader className="pb-3 md:pb-6 px-3 md:px-6">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <BookOpen className={cn(ICON_SIZE_SMALL, 'md:w-5 md:h-5 text-primary')} />
            説明
          </CardTitle>
          <CardDescription className="text-xs md:text-sm">
            クイズの内容や目的を説明してください
          </CardDescription>
        </CardHeader>
        <CardContent className="px-3 md:px-6">
          <div className="space-y-2">
            <Label htmlFor={FORM_FIELD_DESCRIPTION} required variant={LABEL_VARIANT_PRIMARY}>
              説明
            </Label>
            <Textarea
              id={FORM_FIELD_DESCRIPTION}
              placeholder="このクイズでは、JavaScriptの基本的な概念について学習できます..."
              value={formData.description || DEFAULT_EMPTY_VALUE}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                handleInputChange(FORM_FIELD_DESCRIPTION, e.target.value)
              }
              variant={errors.description ? INPUT_VARIANT_ERROR : INPUT_VARIANT_PRIMARY}
              className={cn(TEXTAREA_MIN_HEIGHT, errors.description && 'border-red-500')}
            />
            {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
