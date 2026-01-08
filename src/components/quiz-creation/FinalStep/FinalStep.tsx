// ====================================================
// File Name   : FinalStep.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-07
// Last Update : 2025-09-16
//
// Description:
// - Final step component for quiz creation and editing
// - Displays quiz validation status and summary
// - Provides publish functionality for new and existing quizzes
// - Shows action buttons and status messages
//
// Notes:
// - Client-only component (requires 'use client')
// - Uses custom hooks for validation and publishing logic
// - Supports both create and edit modes
// ====================================================

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { CheckCircle, ArrowLeft, Upload, XCircle } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui';
import { CreateQuizSetForm, CreateQuestionForm } from '@/types/quiz';
import { useValidateQuiz, usePublishQuiz } from '@/hooks/usePublishing';
import { useEditPublish } from '@/hooks/useEditPublish';
import { cn } from '@/lib/utils';

const DEFAULT_IS_EDIT_MODE = false;
const DEFAULT_EMPTY_QUIZ_ID = '';

const VALIDATION_DELAY_MS = 100;
const TOAST_DURATION_ERROR_MS = 4000;
const TOAST_DURATION_SUCCESS_MS = 3000;
const REDIRECT_DELAY_MS = 1500;
const TOAST_POSITION = 'top-center';

const DASHBOARD_ROUTE = '/dashboard';

const CODE_PADDING_LENGTH = 6;
const CODE_PADDING_CHAR = '0';
const DEFAULT_MAX_PLAYERS = 400;

const ICON_SIZE_SMALL = 'w-4 h-4';
const ICON_SIZE_MEDIUM = 'w-8 h-8';
const STATUS_ICON_SIZE = 'w-16 h-16';
const SPINNER_SIZE = 'w-8 h-8';

interface FinalStepProps {
  formData: Partial<CreateQuizSetForm>;
  questions: CreateQuestionForm[];
  onPrevious: () => void;
  isMobile: boolean;
  quizId?: string;
  isEditMode?: boolean;
}

interface StatusHeaderProps {
  isValidating: boolean;
  isValid: boolean;
  isEditMode: boolean;
  isMobile: boolean;
}

interface QuizSummaryProps {
  formData: Partial<CreateQuizSetForm>;
  questions: CreateQuestionForm[];
  isMobile: boolean;
}

interface ActionButtonsProps {
  onPrevious: () => void;
  onPublish: () => void;
  canPublish: boolean;
  isValid: boolean | undefined;
  isPublishing: boolean;
  publishQuizMutation: { isPending: boolean };
  isEditPublishing: boolean;
  isEditMode: boolean;
}

interface StatusMessagesProps {
  isPublishing: boolean;
  publishQuizMutation: { isPending: boolean };
  isEditPublishing: boolean;
  isEditMode: boolean;
}

/**
 * Custom hook for quiz validation.
 * Validates quiz data when quizId and questions are available.
 *
 * @param {CreateQuestionForm[]} questions - Array of quiz questions
 * @param {string} [quizId] - Optional quiz ID for validation
 * @returns {object} Validation data and loading state
 */
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
        await validateQuiz();
      } catch (error) {
        console.error('Error in quiz validation:', error);
        toast.error('クイズの検証に失敗しました');
      }
    };

    const timeoutId = setTimeout(validateQuizData, VALIDATION_DELAY_MS);
    return () => clearTimeout(timeoutId);
  }, [quizId, questions.length, validateQuiz]);

  return { validationData, isValidating };
};

/**
 * Custom hook for publishing logic.
 * Handles quiz publishing for both create and edit modes.
 *
 * @param {boolean} isEditMode - Whether in edit mode
 * @param {string} [quizId] - Optional quiz ID for publishing
 * @returns {object} Publishing state and handlers
 */
const usePublishingLogic = (isEditMode: boolean, quizId?: string) => {
  const [isPublishing, setIsPublishing] = useState(false);
  const router = useRouter();
  const publishQuizMutation = usePublishQuiz();
  const { publishQuiz, isPublishing: isEditPublishing } = useEditPublish(
    quizId || DEFAULT_EMPTY_QUIZ_ID,
  );

  const handlePublish = async () => {
    if (!quizId) {
      return;
    }

    if (isEditMode) {
      try {
        await publishQuiz();
      } catch {
        toast.error('公開に失敗しました。もう一度お試しください。', {
          duration: TOAST_DURATION_ERROR_MS,
          position: TOAST_POSITION,
        });
      }
    } else {
      setIsPublishing(true);
      try {
        await publishQuizMutation.mutateAsync(quizId);
        toast.success('クイズが公開されました！', {
          duration: TOAST_DURATION_SUCCESS_MS,
          position: TOAST_POSITION,
        });
        setTimeout(() => {
          router.push(DASHBOARD_ROUTE);
        }, REDIRECT_DELAY_MS);
      } catch {
        toast.error('クイズの公開に失敗しました', {
          duration: TOAST_DURATION_ERROR_MS,
          position: TOAST_POSITION,
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

/**
 * Component: StatusHeader
 * Description:
 * - Displays validation status with icon and messages
 * - Shows different states: validating, valid, invalid
 * - Adapts messages for edit and create modes
 *
 * @param {StatusHeaderProps} props - Component props
 * @returns {React.ReactElement} Status header component
 */
const StatusHeader: React.FC<StatusHeaderProps> = ({
  isValidating,
  isValid,
  isEditMode,
  isMobile,
}) => (
  <div className="text-center mb-8">
    <div
      className={cn(
        STATUS_ICON_SIZE,
        'rounded-full flex items-center justify-center mx-auto mb-4',
        isValidating ? 'bg-blue-100' : isValid ? 'bg-green-100' : 'bg-red-100',
      )}
    >
      {isValidating ? (
        <div
          className={cn(
            SPINNER_SIZE,
            'border-2 border-blue-600 border-t-transparent rounded-full animate-spin',
          )}
        ></div>
      ) : isValid ? (
        <CheckCircle className={cn(ICON_SIZE_MEDIUM, 'text-green-600')} />
      ) : (
        <XCircle className={cn(ICON_SIZE_MEDIUM, 'text-red-600')} />
      )}
    </div>
    <h2 className={cn('font-bold text-gray-900 mb-2', isMobile ? 'text-xl' : 'text-2xl')}>
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

/**
 * Component: QuizSummary
 * Description:
 * - Displays quiz summary information
 * - Shows title, description, difficulty, category, question count
 * - Displays play settings if available
 *
 * @param {QuizSummaryProps} props - Component props
 * @returns {React.ReactElement} Quiz summary component
 */
const QuizSummary: React.FC<QuizSummaryProps> = ({ formData, questions, isMobile }) => (
  <Card className="bg-white border border-gray-200 shadow-sm">
    <CardHeader className={cn(isMobile ? 'pb-4 px-4' : 'pb-6 px-6')}>
      <CardTitle className={cn('flex items-center gap-2', isMobile ? 'text-base' : 'text-lg')}>
        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
          📝
        </div>
        クイズ概要
      </CardTitle>
    </CardHeader>
    <CardContent className={cn(isMobile ? 'px-4' : 'px-6')}>
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
                {formData.play_settings.code
                  ?.toString()
                  .padStart(CODE_PADDING_LENGTH, CODE_PADDING_CHAR) || '未設定'}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">最大プレイヤー数:</span>{' '}
                {formData.play_settings.max_players || DEFAULT_MAX_PLAYERS}人
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

/**
 * Component: ActionButtons
 * Description:
 * - Displays previous and publish buttons
 * - Shows different button states based on validation and publishing status
 * - Handles button disabled states
 *
 * @param {ActionButtonsProps} props - Component props
 * @returns {React.ReactElement} Action buttons component
 */
const ActionButtons: React.FC<ActionButtonsProps> = ({
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
      <ArrowLeft className={ICON_SIZE_SMALL} />
      前へ戻る
    </Button>

    <Button
      onClick={onPublish}
      disabled={!canPublish}
      className={cn(
        'flex items-center gap-2 px-8 py-3 font-semibold',
        canPublish
          ? 'bg-green-600 hover:bg-green-700 text-white'
          : 'bg-gray-400 text-gray-200 cursor-not-allowed',
      )}
    >
      {isPublishing || publishQuizMutation.isPending || isEditPublishing ? (
        <>
          <div
            className={cn(
              ICON_SIZE_SMALL,
              'border-2 border-white border-t-transparent rounded-full animate-spin',
            )}
          ></div>
          公開中...
        </>
      ) : isValid ? (
        <>
          <Upload className={ICON_SIZE_SMALL} />
          {isEditMode ? '編集を公開' : 'クイズを公開'}
        </>
      ) : (
        <>
          <XCircle className={ICON_SIZE_SMALL} />
          修正が必要
        </>
      )}
    </Button>
  </div>
);

/**
 * Component: StatusMessages
 * Description:
 * - Displays publishing status message
 * - Shows loading indicator during publishing
 * - Only renders when publishing is in progress
 *
 * @param {StatusMessagesProps} props - Component props
 * @returns {React.ReactElement | null} Status messages component or null
 */
const StatusMessages: React.FC<StatusMessagesProps> = ({
  isPublishing,
  publishQuizMutation,
  isEditPublishing,
  isEditMode,
}) => {
  if (!isPublishing && !publishQuizMutation.isPending && !isEditPublishing) {
    return null;
  }

  return (
    <div className="text-center">
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg">
        <div
          className={cn(
            ICON_SIZE_SMALL,
            'border-2 border-blue-600 border-t-transparent rounded-full animate-spin',
          )}
        ></div>
        {isEditMode ? '編集を公開しています...' : 'クイズを公開しています...'}
      </div>
    </div>
  );
};

/**
 * Component: FinalStep
 * Description:
 * - Final step component for quiz creation and editing workflow
 * - Validates quiz data and displays summary
 * - Provides publish functionality with error handling
 * - Shows validation status and action buttons
 *
 * Parameters:
 * - formData (Partial<CreateQuizSetForm>): Quiz form data
 * - questions (CreateQuestionForm[]): Array of quiz questions
 * - onPrevious (function): Callback to go to previous step
 * - isMobile (boolean): Whether device is mobile
 * - quizId (string, optional): Quiz ID for editing
 * - isEditMode (boolean, optional): Whether in edit mode (default: false)
 *
 * Returns:
 * - React.ReactElement: The final step component
 *
 * Example:
 * ```tsx
 * <FinalStep
 *   formData={formData}
 *   questions={questions}
 *   onPrevious={() => goToPreviousStep()}
 *   isMobile={false}
 *   quizId="quiz-123"
 *   isEditMode={false}
 * />
 * ```
 */
export const FinalStep: React.FC<FinalStepProps> = ({
  formData,
  questions,
  onPrevious,
  isMobile,
  quizId,
  isEditMode = DEFAULT_IS_EDIT_MODE,
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
