// ====================================================
// File Name   : DifficultyCategoryForm.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-03
// Last Update : 2025-09-04
//
// Description:
// - Form component for selecting quiz difficulty and category
// - Displays two cards side by side for difficulty and category selection
// - Handles form validation and error display
// - Uses Select components with options from constants
//
// Notes:
// - Client component (no 'use client' needed as parent handles it)
// - Uses responsive grid layout for mobile and desktop
// - Implements error handling with visual feedback
// ====================================================

'use client';
import React, { useEffect } from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Label,
  Select,
} from '@/components/ui';
import { CreateQuizSetForm, DifficultyLevel, FormErrors } from '@/types/quiz';
import { cn } from '@/lib/utils';
import { DIFFICULTY_OPTIONS, CATEGORY_OPTIONS } from './constants';

const DEFAULT_EMPTY_VALUE = '';

const FORM_FIELD_DIFFICULTY_LEVEL = 'difficulty_level';
const FORM_FIELD_CATEGORY = 'category';

const SELECT_VARIANT_PRIMARY = 'primary';
const SELECT_VARIANT_ERROR = 'error';

const DIFFICULTY_LABEL_SEPARATOR = ' - ';

interface DifficultyCategoryFormProps {
  formData: Partial<CreateQuizSetForm>;
  onFormDataChange: (data: Partial<CreateQuizSetForm>) => void;
  errors?: FormErrors<CreateQuizSetForm>;
}

/**
 * Component: DifficultyCategoryForm
 * Description:
 * - Renders a form with two cards for difficulty and category selection
 * - Handles form input changes and displays validation errors
 * - Maps difficulty options with labels and descriptions
 * - Maps category options for selection
 *
 * Parameters:
 * - formData (Partial<CreateQuizSetForm>): Current form data values
 * - onFormDataChange (function): Callback function when form data changes
 * - errors (FormErrors<CreateQuizSetForm>, optional): Form validation errors
 *
 * Returns:
 * - React.ReactElement: The difficulty and category form component
 *
 * Example:
 * ```tsx
 * <DifficultyCategoryForm
 *   formData={formData}
 *   onFormDataChange={(data) => setFormData(data)}
 *   errors={errors}
 * />
 * ```
 */
export const DifficultyCategoryForm: React.FC<DifficultyCategoryFormProps> = ({
  formData,
  onFormDataChange,
  errors = {},
}) => {
  const handleInputChange = (field: keyof CreateQuizSetForm, value: string | DifficultyLevel) => {
    onFormDataChange({
      ...formData,
      [field]: value,
    });
  };

  const difficultyOptions = DIFFICULTY_OPTIONS.map((option) => ({
    value: option.value,
    label: `${option.label}${DIFFICULTY_LABEL_SEPARATOR}${option.description}`,
  }));

  const categoryOptions = CATEGORY_OPTIONS.map((category) => ({
    value: category,
    label: category,
  }));

  // Get the first category option as default
  const defaultCategory = categoryOptions[0]?.value || DEFAULT_EMPTY_VALUE;
  const categoryValue = formData.category || defaultCategory;

  // Set default category if not already set (only on initial mount)
  useEffect(() => {
    if (!formData.category && defaultCategory) {
      handleInputChange(FORM_FIELD_CATEGORY, defaultCategory);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount - intentionally empty deps to set default once

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      <Card className="bg-gradient-to-br from-lime-200 to-green-300 border-lime-400 shadow-lg card-with-dropdown">
        <CardHeader className="pb-3 md:pb-6 px-3 md:px-6">
          <CardTitle className="text-sm md:text-base">難易度</CardTitle>
          <CardDescription className="text-xs md:text-sm">
            クイズの難易度を選択してください
          </CardDescription>
        </CardHeader>
        <CardContent className="px-3 md:px-6">
          <Label htmlFor={FORM_FIELD_DIFFICULTY_LEVEL} required variant={SELECT_VARIANT_PRIMARY}>
            難易度
          </Label>
          <Select
            id={FORM_FIELD_DIFFICULTY_LEVEL}
            value={formData.difficulty_level || DEFAULT_EMPTY_VALUE}
            onValueChange={(value) =>
              handleInputChange(FORM_FIELD_DIFFICULTY_LEVEL, value as DifficultyLevel)
            }
            placeholder="難易度を選択してください"
            options={difficultyOptions}
            variant={errors.difficulty_level ? SELECT_VARIANT_ERROR : SELECT_VARIANT_PRIMARY}
            className={cn(
              'border-2 border-blue-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-300',
              errors.difficulty_level && 'border-red-500',
            )}
          />
          {errors.difficulty_level && (
            <p className="text-sm text-red-600 mt-1">{errors.difficulty_level}</p>
          )}
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-lime-200 to-green-300 border-lime-400 shadow-lg card-with-dropdown">
        <CardHeader className="pb-3 md:pb-6 px-3 md:px-6">
          <CardTitle className="text-sm md:text-base">カテゴリ</CardTitle>
          <CardDescription className="text-xs md:text-sm">
            クイズのカテゴリを選択してください
          </CardDescription>
        </CardHeader>
        <CardContent className="px-3 md:px-6">
          <Label htmlFor={FORM_FIELD_CATEGORY} required variant={SELECT_VARIANT_PRIMARY}>
            カテゴリ
          </Label>
          <Select
            id={FORM_FIELD_CATEGORY}
            value={categoryValue}
            onValueChange={(value) => handleInputChange(FORM_FIELD_CATEGORY, value)}
            placeholder="カテゴリを選択してください"
            options={categoryOptions}
            variant={errors.category ? SELECT_VARIANT_ERROR : SELECT_VARIANT_PRIMARY}
            className={cn(
              'border-2 border-blue-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-300',
              errors.category && 'border-red-500',
            )}
          />
          {errors.category && <p className="text-sm text-red-600 mt-1">{errors.category}</p>}
        </CardContent>
      </Card>
    </div>
  );
};
