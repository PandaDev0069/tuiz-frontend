'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui';
import { CheckCircle, ArrowLeft, Upload, XCircle } from 'lucide-react';
import { CreateQuizSetForm, CreateQuestionForm, QuestionWithAnswers } from '@/types/quiz';
import { useValidateQuiz, usePublishQuiz } from '@/hooks/usePublishing';
import { useBatchSaveQuestions, useSyncQuestionsForEdit } from '@/hooks/useQuestionMutation';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface FinalStepProps {
  formData: Partial<CreateQuizSetForm>;
  questions: CreateQuestionForm[];
  originalQuestions?: QuestionWithAnswers[];
  onPrevious: () => void;
  isMobile: boolean;
  quizId?: string;
  onOriginalQuestionsChange?: (questions: QuestionWithAnswers[]) => void;
}

export const FinalStep: React.FC<FinalStepProps> = ({
  formData,
  questions,
  originalQuestions = [],
  onPrevious,
  isMobile,
  quizId,
  onOriginalQuestionsChange,
}) => {
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSavingQuestions, setIsSavingQuestions] = useState(false);
  const hasSavedQuestions = useRef(false);
  const isSyncInProgress = useRef(false);
  const router = useRouter();

  // Hooks for publishing
  const {
    data: validationData,
    isLoading: isValidating,
    refetch: validateQuiz,
  } = useValidateQuiz(quizId);
  const publishQuizMutation = usePublishQuiz();
  const batchSaveQuestionsMutation = useBatchSaveQuestions();
  const syncQuestionsMutation = useSyncQuestionsForEdit((savedQuestions) => {
    // Update originalQuestions in parent component after successful sync
    console.log(
      'syncQuestionsForEdit success callback called with:',
      savedQuestions.map((q) => q.id),
    );
    if (onOriginalQuestionsChange) {
      onOriginalQuestionsChange(savedQuestions);
      console.log('Called onOriginalQuestionsChange with updated questions');
    } else {
      console.log('onOriginalQuestionsChange callback not provided');
    }
  });

  // Save questions first if they exist, then validate (only once)
  useEffect(() => {
    const saveAndValidate = async () => {
      if (
        !quizId ||
        questions.length === 0 ||
        hasSavedQuestions.current ||
        isSavingQuestions ||
        isSyncInProgress.current
      ) {
        console.log('Skipping save - conditions not met:', {
          hasQuizId: !!quizId,
          hasQuestions: questions.length > 0,
          hasSaved: hasSavedQuestions.current,
          isSaving: isSavingQuestions,
          isSyncInProgress: isSyncInProgress.current,
        });
        return;
      }

      try {
        hasSavedQuestions.current = true;
        isSyncInProgress.current = true;
        setIsSavingQuestions(true);

        console.log('Starting question save process:', {
          quizId,
          questionCount: questions.length,
          originalQuestionCount: originalQuestions.length,
          isEditMode: originalQuestions.length > 0,
        });

        // Use sync method if we have original questions (edit mode), otherwise use batch save
        if (originalQuestions.length > 0) {
          console.log('Using sync method for edit mode');
          await syncQuestionsMutation.mutateAsync({
            quizId,
            currentQuestions: questions,
            originalQuestions,
          });
        } else {
          console.log('Using batch save for new quiz');
          await batchSaveQuestionsMutation.mutateAsync({
            quizId,
            questions,
          });
        }

        // Wait a moment for the database to be updated
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Now validate the quiz
        validateQuiz();
      } catch (error) {
        console.error('FinalStep: Failed to save questions', error);
        hasSavedQuestions.current = false; // Reset on error so it can retry
      } finally {
        setIsSavingQuestions(false);
        isSyncInProgress.current = false;
      }
    };

    // Use a timeout to prevent multiple rapid calls
    const timeoutId = setTimeout(saveAndValidate, 100);

    return () => {
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizId]);

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
  };

  const canPublish =
    validationData?.validation?.isValid &&
    !isPublishing &&
    !publishQuizMutation.isPending &&
    !isSavingQuestions;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            isSavingQuestions
              ? 'bg-yellow-100'
              : isValidating
                ? 'bg-blue-100'
                : validationData?.validation?.isValid
                  ? 'bg-green-100'
                  : 'bg-red-100'
          }`}
        >
          {isSavingQuestions ? (
            <div className="w-8 h-8 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
          ) : isValidating ? (
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          ) : validationData?.validation?.isValid ? (
            <CheckCircle className="w-8 h-8 text-green-600" />
          ) : (
            <XCircle className="w-8 h-8 text-red-600" />
          )}
        </div>
        <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-900 mb-2`}>
          {isSavingQuestions
            ? '問題を保存中...'
            : isValidating
              ? 'クイズを検証中...'
              : validationData?.validation?.isValid
                ? 'クイズ完成！'
                : 'クイズに問題があります'}
        </h2>
        <p className="text-gray-600">
          {isSavingQuestions
            ? '問題をデータベースに保存しています'
            : isValidating
              ? 'クイズの内容を確認しています'
              : validationData?.validation?.isValid
                ? 'クイズの内容を確認して公開しましょう'
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
          disabled={isPublishing || publishQuizMutation.isPending || isSavingQuestions}
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
          {isSavingQuestions ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              保存中...
            </>
          ) : isPublishing || publishQuizMutation.isPending ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              公開中...
            </>
          ) : validationData?.validation?.isValid ? (
            <>
              <Upload className="w-4 h-4" />
              クイズを公開
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
      {isSavingQuestions && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg">
            <div className="w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
            問題を保存しています...
          </div>
        </div>
      )}

      {(isPublishing || publishQuizMutation.isPending) && (
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
