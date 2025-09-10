import React from 'react';
import { CreateQuizSetForm, FormErrors } from '@/types/quiz';
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
import { cn } from '@/lib/utils';
import { BookOpen } from 'lucide-react';

interface TitleDescriptionFormProps {
  formData: Partial<CreateQuizSetForm>;
  onFormDataChange: (data: Partial<CreateQuizSetForm>) => void;
  errors?: FormErrors<CreateQuizSetForm>;
}

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
      {/* Title */}
      <Card className="bg-gradient-to-br from-lime-200 to-green-300 border-lime-400 shadow-lg">
        <CardHeader className="pb-3 md:pb-6 px-3 md:px-6">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <BookOpen className="w-4 h-4 md:w-5 md:h-5 text-primary" />
            クイズタイトル
          </CardTitle>
          <CardDescription className="text-xs md:text-sm">
            分かりやすく魅力的なタイトルを入力してください
          </CardDescription>
        </CardHeader>
        <CardContent className="px-3 md:px-6">
          <div className="space-y-2">
            <Label htmlFor="title" required variant="primary">
              タイトル
            </Label>
            <Input
              id="title"
              placeholder="例: JavaScript基礎知識クイズ"
              value={formData.title || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleInputChange('title', e.target.value)
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

      {/* Description */}
      <Card className="bg-gradient-to-br from-lime-200 to-green-300 border-lime-400 shadow-lg">
        <CardHeader className="pb-3 md:pb-6 px-3 md:px-6">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <BookOpen className="w-4 h-4 md:w-5 md:h-5 text-primary" />
            説明
          </CardTitle>
          <CardDescription className="text-xs md:text-sm">
            クイズの内容や目的を説明してください
          </CardDescription>
        </CardHeader>
        <CardContent className="px-3 md:px-6">
          <div className="space-y-2">
            <Label htmlFor="description" required variant="primary">
              説明
            </Label>
            <Textarea
              id="description"
              placeholder="このクイズでは、JavaScriptの基本的な概念について学習できます..."
              value={formData.description || ''}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                handleInputChange('description', e.target.value)
              }
              variant={errors.description ? 'error' : 'primary'}
              className={cn('min-h-[100px]', errors.description && 'border-red-500')}
            />
            {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
