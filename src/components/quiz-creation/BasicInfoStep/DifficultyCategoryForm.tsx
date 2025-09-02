import React from 'react';
import { CreateQuizSetForm, DifficultyLevel, FormErrors } from '@/types/quiz';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Label,
  Select,
} from '@/components/ui';
import { cn } from '@/lib/utils';
import { DIFFICULTY_OPTIONS, CATEGORY_OPTIONS } from './constants';

interface DifficultyCategoryFormProps {
  formData: Partial<CreateQuizSetForm>;
  onFormDataChange: (data: Partial<CreateQuizSetForm>) => void;
  errors?: FormErrors<CreateQuizSetForm>;
}

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      {/* Difficulty */}
      <Card className="bg-gradient-to-br from-lime-200 to-green-300 border-lime-400 shadow-lg">
        <CardHeader className="pb-3 md:pb-6 px-3 md:px-6">
          <CardTitle className="text-sm md:text-base">難易度</CardTitle>
          <CardDescription className="text-xs md:text-sm">
            クイズの難易度を選択してください
          </CardDescription>
        </CardHeader>
        <CardContent className="px-3 md:px-6">
          <Label htmlFor="difficulty_level" required variant="primary">
            難易度
          </Label>
          <Select
            id="difficulty_level"
            value={formData.difficulty_level || ''}
            onValueChange={(value) =>
              handleInputChange('difficulty_level', value as DifficultyLevel)
            }
            placeholder="難易度を選択してください"
            options={DIFFICULTY_OPTIONS.map((option) => ({
              value: option.value,
              label: `${option.label} - ${option.description}`,
            }))}
            variant={errors.difficulty_level ? 'error' : 'primary'}
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

      {/* Category */}
      <Card className="bg-gradient-to-br from-lime-200 to-green-300 border-lime-400 shadow-lg">
        <CardHeader className="pb-3 md:pb-6 px-3 md:px-6">
          <CardTitle className="text-sm md:text-base">カテゴリ</CardTitle>
          <CardDescription className="text-xs md:text-sm">
            クイズのカテゴリを選択してください
          </CardDescription>
        </CardHeader>
        <CardContent className="px-3 md:px-6">
          <Label htmlFor="category" required variant="primary">
            カテゴリ
          </Label>
          <Select
            id="category"
            value={formData.category || ''}
            onValueChange={(value) => handleInputChange('category', value)}
            placeholder="カテゴリを選択してください"
            options={CATEGORY_OPTIONS.map((category) => ({
              value: category,
              label: category,
            }))}
            variant={errors.category ? 'error' : 'primary'}
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
