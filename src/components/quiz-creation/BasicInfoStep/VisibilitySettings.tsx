import React from 'react';
import { CreateQuizSetForm } from '@/types/quiz';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Label,
  Switch,
} from '@/components/ui';
import { Lock, Globe } from 'lucide-react';

interface VisibilitySettingsProps {
  formData: Partial<CreateQuizSetForm>;
  onFormDataChange: (data: Partial<CreateQuizSetForm>) => void;
}

export const VisibilitySettings: React.FC<VisibilitySettingsProps> = ({
  formData,
  onFormDataChange,
}) => {
  const handleInputChange = (field: keyof CreateQuizSetForm, value: boolean) => {
    onFormDataChange({
      ...formData,
      [field]: value,
    });
  };

  return (
    <Card className="bg-gradient-to-br from-lime-200 to-green-300 border-lime-400 shadow-lg">
      <CardHeader className="pb-3 md:pb-6 px-3 md:px-6">
        <CardTitle className="flex items-center gap-2 text-sm md:text-base">
          {formData.is_public ? (
            <Globe className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
          ) : (
            <Lock className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
          )}
          公開設定
        </CardTitle>
        <CardDescription className="text-xs md:text-sm">
          クイズの公開範囲を設定してください
        </CardDescription>
      </CardHeader>
      <CardContent className="px-3 md:px-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="is_public" variant={formData.is_public ? 'success' : 'default'}>
                {formData.is_public ? '公開' : '非公開'}
              </Label>
              <p className="text-xs text-gray-500">
                {formData.is_public ? '誰でもクイズに参加できます' : 'あなただけがアクセスできます'}
              </p>
            </div>
            <Switch
              id="is_public"
              checked={formData.is_public || false}
              onCheckedChange={(checked) => handleInputChange('is_public', checked)}
              variant={formData.is_public ? 'success' : 'default'}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
