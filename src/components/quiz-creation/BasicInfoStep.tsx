'use client';

import React, { useState } from 'react';
import { CreateQuizSetForm, DifficultyLevel, FormErrors } from '@/types/quiz';
import {
  Button,
  Input,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Label,
  Textarea,
  Switch,
  Select,
} from '@/components/ui';
import { cn } from '@/lib/utils';
import { Upload, X, Plus, BookOpen, Lock, Globe } from 'lucide-react';
import Image from 'next/image';

interface BasicInfoStepProps {
  formData: Partial<CreateQuizSetForm>;
  onFormDataChange: (data: Partial<CreateQuizSetForm>) => void;
  onNext: () => void;
  errors?: FormErrors<CreateQuizSetForm>;
}

const DIFFICULTY_OPTIONS = [
  {
    value: DifficultyLevel.EASY,
    label: '簡単',
    description: '初心者向け',
    color: 'text-green-600 bg-green-50 border-green-200',
  },
  {
    value: DifficultyLevel.MEDIUM,
    label: '普通',
    description: '中級者向け',
    color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  },
  {
    value: DifficultyLevel.HARD,
    label: '難しい',
    description: '上級者向け',
    color: 'text-orange-600 bg-orange-50 border-orange-200',
  },
  {
    value: DifficultyLevel.EXPERT,
    label: 'エキスパート',
    description: 'エキスパート向け',
    color: 'text-red-600 bg-red-50 border-red-200',
  },
];

const CATEGORY_OPTIONS = [
  '一般知識',
  '科学',
  '数学',
  '歴史',
  '地理',
  '文学',
  'テクノロジー',
  'スポーツ',
  'エンターテイメント',
  '言語',
  '芸術・文化',
  'ビジネス',
  '健康・医学',
  'その他',
];

export const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  formData,
  onFormDataChange,
  onNext,
  errors = {},
}) => {
  const [newTag, setNewTag] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleInputChange = (
    field: keyof CreateQuizSetForm,
    value:
      | string
      | boolean
      | string[]
      | DifficultyLevel
      | undefined
      | Partial<CreateQuizSetForm['play_settings']>,
  ) => {
    onFormDataChange({
      ...formData,
      [field]: value,
    });
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      handleInputChange('tags', [...(formData.tags || []), newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    handleInputChange('tags', formData.tags?.filter((tag) => tag !== tagToRemove) || []);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // TODO: Implement actual file upload logic
      // For now, we'll simulate the upload
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const mockUrl = URL.createObjectURL(file);
      handleInputChange('thumbnail_url', mockUrl);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

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
      {/* Header */}
      <div className="text-center mb-4 md:mb-8">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1 md:mb-2">基本情報を入力</h2>
        <p className="text-sm md:text-base text-gray-600">クイズの基本情報を設定してください</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
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
                  className={cn(
                    'min-h-[100px] border-2 border-blue-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-300',
                    errors.description && 'border-red-500',
                  )}
                />
                {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Difficulty & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
        </div>

        {/* Sidebar */}
        <div className="space-y-4 md:space-y-6">
          {/* Thumbnail Upload */}
          <Card className="bg-gradient-to-br from-lime-200 to-green-300 border-lime-400 shadow-lg">
            <CardHeader className="pb-3 md:pb-6 px-3 md:px-6">
              <CardTitle className="flex items-center gap-2 text-sm md:text-base">
                <Upload className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                サムネイル
              </CardTitle>
              <CardDescription className="text-xs md:text-sm">
                クイズのサムネイル画像をアップロード（任意）
              </CardDescription>
            </CardHeader>
            <CardContent className="px-3 md:px-6">
              <div className="space-y-4">
                {formData.thumbnail_url ? (
                  <div className="relative">
                    <Image
                      src={formData.thumbnail_url}
                      alt="Quiz thumbnail"
                      width={300}
                      height={128}
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => handleInputChange('thumbnail_url', undefined)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    className="border-4 border-dashed border-lime-600 rounded-lg p-4 md:p-6 text-center cursor-pointer"
                    onClick={() => {
                      if (!isUploading) {
                        document.getElementById('thumbnail-upload')?.click();
                      }
                    }}
                  >
                    <Upload className="w-6 h-6 md:w-8 md:h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-xs md:text-sm text-gray-600 mb-2">画像をアップロード</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailUpload}
                      className="hidden"
                      id="thumbnail-upload"
                      disabled={isUploading}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isUploading) {
                          document.getElementById('thumbnail-upload')?.click();
                        }
                      }}
                      disabled={isUploading}
                    >
                      {isUploading ? 'アップロード中...' : 'ファイルを選択'}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Visibility Settings */}
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
                      {formData.is_public
                        ? '誰でもクイズに参加できます'
                        : 'あなただけがアクセスできます'}
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

          {/* Tags */}
          <Card className="bg-gradient-to-br from-lime-200 to-green-300 border-lime-400 shadow-lg">
            <CardHeader className="pb-3 md:pb-6 px-3 md:px-6">
              <CardTitle className="text-sm md:text-base">タグ</CardTitle>
              <CardDescription className="text-xs md:text-sm">
                クイズのタグを追加してください
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 px-3 md:px-6">
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="タグを入力"
                    value={newTag}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTag(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className={cn(
                      'flex-1 border-2 border-blue-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-300',
                    )}
                  />
                  <Button
                    type="button"
                    onClick={handleAddTag}
                    disabled={!newTag.trim()}
                    size="sm"
                    variant="outline"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {formData.tags && formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {formData.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="flex items-center gap-1 px-2 py-1 text-xs"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-end pt-4 md:pt-6 border-t">
        <Button
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
