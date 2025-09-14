'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui';
import { CheckCircle, ArrowLeft, Upload, XCircle } from 'lucide-react';
import { CreateQuizSetForm, CreateQuestionForm } from '@/types/quiz';
import { useValidateQuiz, usePublishQuiz } from '@/hooks/usePublishing';
import { useEditPublish } from '@/hooks/useEditPublish';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface FinalStepProps {
  formData: Partial<CreateQuizSetForm>;
  questions: CreateQuestionForm[];
  onPrevious: () => void;
  isMobile: boolean;
  quizId?: string;
  isEditMode?: boolean;
}

export const FinalStep: React.FC<FinalStepProps> = ({
  formData,
  questions,
  onPrevious,
  isMobile,
  quizId,
  isEditMode = false,
}) => {
  const [isPublishing, setIsPublishing] = useState(false);
  const router = useRouter();

  // Hooks for publishing
  const {
    data: validationData,
    isLoading: isValidating,
    refetch: validateQuiz,
  } = useValidateQuiz(quizId);
  const publishQuizMutation = usePublishQuiz();
  const { publishQuiz, isPublishing: isEditPublishing } = useEditPublish(quizId || '');

  // Validate quiz when entering final step (questions are already saved from step navigation)
  useEffect(() => {
    const validateQuizData = async () => {
      if (!quizId || questions.length === 0) {
        return;
      }

      try {
        console.log('Starting quiz validation...');
        await validateQuiz();
      } catch (error) {
        console.error('Error in quiz validation:', error);
        toast.error('クイズの検証に失敗しました');
      }
    };

    // Use a timeout to prevent multiple rapid calls
    const timeoutId = setTimeout(validateQuizData, 100);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [quizId, questions.length, validateQuiz]);

  // Update validation state when validation data changes
  useEffect(() => {
    if (validationData) {
      // Validation data received - no action needed as UI updates automatically
    }
  }, [validationData]);

  const handlePublish = async () => {
    if (!quizId) {
      return;
    }

    if (isEditMode) {
      // For edit mode, just publish (questions are already saved from step navigation)
      try {
        await publishQuiz();
      } catch {
        toast.error('公開に失敗しました。もう一度お試しください。', {
          duration: 4000,
          position: 'top-center',
        });
      }
    } else {
      // Use regular publish for creation mode
      setIsPublishing(true);
      try {
        await publishQuizMutation.mutateAsync(quizId);

        // Show success toast
        toast.success('クイズが公開されました！', {
          duration: 3000,
          position: 'top-center',
        });

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      } catch {
        toast.error('クイズの公開に失敗しました', {
          duration: 4000,
          position: 'top-center',
        });
      } finally {
        setIsPublishing(false);
      }
    }
  };

  const canPublish =
    validationData?.validation?.isValid &&
    !isPublishing &&
    !publishQuizMutation.isPending &&
    !isEditPublishing;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            isValidating
              ? 'bg-blue-100'
              : validationData?.validation?.isValid
                ? 'bg-green-100'
                : 'bg-red-100'
          }`}
        >
          {isValidating ? (
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          ) : validationData?.validation?.isValid ? (
            <CheckCircle className="w-8 h-8 text-green-600" />
          ) : (
            <XCircle className="w-8 h-8 text-red-600" />
          )}
        </div>
        <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-900 mb-2`}>
          {isValidating
            ? 'クイズを検証中...'
            : validationData?.validation?.isValid
              ? isEditMode
                ? '編集完了！'
                : 'クイズ完成！'
              : 'クイズに問題があります'}
        </h2>
        <p className="text-gray-600">
          {isValidating
            ? 'クイズの内容を確認しています'
            : validationData?.validation?.isValid
              ? isEditMode
                ? '編集内容を確認して公開しましょう'
                : 'クイズの内容を確認して公開しましょう'
              : '以下の問題を修正してから公開してください'}
        </p>
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
          disabled={isPublishing || publishQuizMutation.isPending}
          className="flex items-center gap-2 px-6 py-3"
        >
          <ArrowLeft className="w-4 h-4" />
          前へ戻る
        </Button>

        <Button
          onClick={handlePublish}
          disabled={!canPublish}
          className={`flex items-center gap-2 px-8 py-3 font-semibold ${
            canPublish
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-gray-400 text-gray-200 cursor-not-allowed'
          }`}
        >
          {isPublishing || publishQuizMutation.isPending || isEditPublishing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              公開中...
            </>
          ) : validationData?.validation?.isValid ? (
            <>
              <Upload className="w-4 h-4" />
              {isEditMode ? '編集を公開' : 'クイズを公開'}
            </>
          ) : (
            <>
              <XCircle className="w-4 h-4" />
              修正が必要
            </>
          )}
        </Button>
      </div>

      {/* Status Messages */}
      {(isPublishing || publishQuizMutation.isPending || isEditPublishing) && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            {isEditMode ? '編集を公開しています...' : 'クイズを公開しています...'}
          </div>
        </div>
      )}
    </div>
  );
};
