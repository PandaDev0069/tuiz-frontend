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

// Custom hook for quiz validation
const useQuizValidation = (questions: CreateQuestionForm[], quizId?: string) => {
  const {
    data: validationData,
    isLoading: isValidating,
    refetch: validateQuiz,
  } = useValidateQuiz(quizId);

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

    const timeoutId = setTimeout(validateQuizData, 100);
    return () => clearTimeout(timeoutId);
  }, [quizId, questions.length, validateQuiz]);

  return { validationData, isValidating };
};

// Custom hook for publishing logic
const usePublishingLogic = (isEditMode: boolean, quizId?: string) => {
  const [isPublishing, setIsPublishing] = useState(false);
  const router = useRouter();
  const publishQuizMutation = usePublishQuiz();
  const { publishQuiz, isPublishing: isEditPublishing } = useEditPublish(quizId || '');

  const handlePublish = async () => {
    if (!quizId) return;

    if (isEditMode) {
      try {
        await publishQuiz();
      } catch {
        toast.error('公開に失敗しました。もう一度お試しください。', {
          duration: 4000,
          position: 'top-center',
        });
      }
    } else {
      setIsPublishing(true);
      try {
        await publishQuizMutation.mutateAsync(quizId);
        toast.success('クイズが公開されました！', {
          duration: 3000,
          position: 'top-center',
        });
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

  const canPublish = !isPublishing && !publishQuizMutation.isPending && !isEditPublishing;

  return {
    isPublishing,
    isEditPublishing,
    publishQuizMutation,
    handlePublish,
    canPublish,
  };
};

// Status header component
const StatusHeader: React.FC<{
  isValidating: boolean;
  isValid: boolean;
  isEditMode: boolean;
  isMobile: boolean;
}> = ({ isValidating, isValid, isEditMode, isMobile }) => (
  <div className="text-center mb-8">
    <div
      className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
        isValidating ? 'bg-blue-100' : isValid ? 'bg-green-100' : 'bg-red-100'
      }`}
    >
      {isValidating ? (
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      ) : isValid ? (
        <CheckCircle className="w-8 h-8 text-green-600" />
      ) : (
        <XCircle className="w-8 h-8 text-red-600" />
      )}
    </div>
    <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-900 mb-2`}>
      {isValidating
        ? 'クイズを検証中...'
        : isValid
          ? isEditMode
            ? '編集完了！'
            : 'クイズ完成！'
          : 'クイズに問題があります'}
    </h2>
    <p className="text-gray-600">
      {isValidating
        ? 'クイズの内容を確認しています'
        : isValid
          ? isEditMode
            ? '編集内容を確認して公開しましょう'
            : 'クイズの内容を確認して公開しましょう'
          : '以下の問題を修正してから公開してください'}
    </p>
  </div>
);

// Quiz summary component
const QuizSummary: React.FC<{
  formData: Partial<CreateQuizSetForm>;
  questions: CreateQuestionForm[];
  isMobile: boolean;
}> = ({ formData, questions, isMobile }) => (
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
);

// Action buttons component
const ActionButtons: React.FC<{
  onPrevious: () => void;
  onPublish: () => void;
  canPublish: boolean;
  isValid: boolean | undefined;
  isPublishing: boolean;
  publishQuizMutation: { isPending: boolean };
  isEditPublishing: boolean;
  isEditMode: boolean;
}> = ({
  onPrevious,
  onPublish,
  canPublish,
  isValid,
  isPublishing,
  publishQuizMutation,
  isEditPublishing,
  isEditMode,
}) => (
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
      onClick={onPublish}
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
      ) : isValid ? (
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
);

// Status messages component
const StatusMessages: React.FC<{
  isPublishing: boolean;
  publishQuizMutation: { isPending: boolean };
  isEditPublishing: boolean;
  isEditMode: boolean;
}> = ({ isPublishing, publishQuizMutation, isEditPublishing, isEditMode }) => {
  if (!isPublishing && !publishQuizMutation.isPending && !isEditPublishing) {
    return null;
  }

  return (
    <div className="text-center">
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg">
        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        {isEditMode ? '編集を公開しています...' : 'クイズを公開しています...'}
      </div>
    </div>
  );
};

export const FinalStep: React.FC<FinalStepProps> = ({
  formData,
  questions,
  onPrevious,
  isMobile,
  quizId,
  isEditMode = false,
}) => {
  const { validationData, isValidating } = useQuizValidation(questions, quizId);
  const { isPublishing, isEditPublishing, publishQuizMutation, handlePublish, canPublish } =
    usePublishingLogic(isEditMode, quizId);

  const isValid = validationData?.validation?.isValid;
  const finalCanPublish = canPublish && (isValid ?? false);

  return (
    <div className="space-y-6">
      <StatusHeader
        isValidating={isValidating}
        isValid={isValid ?? false}
        isEditMode={isEditMode}
        isMobile={isMobile}
      />

      <QuizSummary formData={formData} questions={questions} isMobile={isMobile} />

      <ActionButtons
        onPrevious={onPrevious}
        onPublish={handlePublish}
        canPublish={finalCanPublish}
        isValid={isValid ?? false}
        isPublishing={isPublishing}
        publishQuizMutation={publishQuizMutation}
        isEditPublishing={isEditPublishing}
        isEditMode={isEditMode}
      />

      <StatusMessages
        isPublishing={isPublishing}
        publishQuizMutation={publishQuizMutation}
        isEditPublishing={isEditPublishing}
        isEditMode={isEditMode}
      />
    </div>
  );
};
