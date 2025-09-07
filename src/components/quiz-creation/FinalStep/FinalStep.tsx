'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui';
import { CheckCircle, ArrowLeft, Upload } from 'lucide-react';
import { CreateQuizSetForm, CreateQuestionForm } from '@/types/quiz';

interface FinalStepProps {
  formData: Partial<CreateQuizSetForm>;
  questions: CreateQuestionForm[];
  onPrevious: () => void;
  onPublish: () => void;
  isMobile: boolean;
}

export const FinalStep: React.FC<FinalStepProps> = ({
  formData,
  questions,
  onPrevious,
  onPublish,
  isMobile,
}) => {
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublish = async () => {
    setIsPublishing(true);
    // Simulate publishing process
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsPublishing(false);
    onPublish();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-900 mb-2`}>
          クイズ完成！
        </h2>
        <p className="text-gray-600">クイズの内容を確認して公開しましょう</p>
      </div>

      {/* Quiz Summary */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className={`${isMobile ? 'pb-4 px-4' : 'pb-6 px-6'}`}>
          <CardTitle className={`flex items-center gap-2 ${isMobile ? 'text-base' : 'text-lg'}`}>
            <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
              📝
            </div>
            クイズ概要
          </CardTitle>
        </CardHeader>
        <CardContent className={`${isMobile ? 'px-4' : 'px-6'}`}>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">タイトル</h3>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                {formData.title || 'タイトル未設定'}
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">説明</h3>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                {formData.description || '説明未設定'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">難易度</h3>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                  {formData.difficulty_level || '未設定'}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">カテゴリ</h3>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                  {formData.category || '未設定'}
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">問題数</h3>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{questions.length} 問</p>
            </div>

            {formData.play_settings && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">プレイ設定</h3>
                <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                  <p className="text-gray-700">
                    <span className="font-medium">クイズコード:</span>{' '}
                    {formData.play_settings.code?.toString().padStart(6, '0') || '未設定'}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium">最大プレイヤー数:</span>{' '}
                    {formData.play_settings.max_players || 400}人
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium">公開設定:</span>{' '}
                    {formData.is_public ? '公開' : '非公開'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <Button
          variant="gradient2"
          onClick={onPrevious}
          className="flex items-center gap-2 px-6 py-3"
        >
          <ArrowLeft className="w-4 h-4" />
          前へ戻る
        </Button>

        <Button
          onClick={handlePublish}
          disabled={isPublishing}
          className="flex items-center gap-2 px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold"
        >
          <Upload className={`w-4 h-4 ${isPublishing ? 'animate-spin' : ''}`} />
          {isPublishing ? '公開中...' : 'クイズを公開'}
        </Button>
      </div>

      {/* Publishing Status */}
      {isPublishing && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            クイズを公開しています...
          </div>
        </div>
      )}
    </div>
  );
};
