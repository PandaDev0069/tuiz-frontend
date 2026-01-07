// ====================================================
// File Name   : QuestionForm.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-04
// Last Update : 2025-09-14
//
// Description:
// - Main form component for editing quiz questions
// - Displays question text, image upload, and explanation button
// - Shows question control panel and answer panels based on question type
// - Supports multiple choice and true/false question types
//
// Notes:
// - Client-only component (requires 'use client')
// - Conditionally renders answer panels based on question type
// - Implements responsive design for mobile and desktop
// ====================================================

'use client';

import React from 'react';
import Image from 'next/image';
import { Upload, X, BookOpen, Lightbulb } from 'lucide-react';

import { Button, Card, CardContent, CardHeader, CardTitle, Label, Textarea } from '@/components/ui';
import { CreateQuestionForm, CreateAnswerForm, QuestionType } from '@/types/quiz';
import { QuestionControlPanel } from './QuestionControlPanel';
import { MultipleChoicePanel } from './MultipleChoicePanel';
import { TrueFalsePanel } from './TrueFalsePanel';
import { cn } from '@/lib/utils';

const DEFAULT_QUESTION_TEXT = '';
const DEFAULT_ANSWERS: CreateAnswerForm[] = [];

const FORM_FIELD_QUESTION_TEXT = 'question_text';
const FORM_FIELD_IMAGE_URL = 'image_url';
const FORM_FIELD_ANSWERS = 'answers';

const INPUT_TYPE_FILE = 'file';
const FILE_INPUT_ACCEPT = 'image/*';
const TEXTAREA_VARIANT_PRIMARY = 'primary';
const LABEL_VARIANT_PRIMARY = 'primary';
const BUTTON_TYPE_BUTTON = 'button';
const BUTTON_VARIANT_OUTLINE = 'outline';
const BUTTON_SIZE_SM = 'sm';

const TEXTAREA_HEIGHT = 'h-[120px]';
const IMAGE_CONTAINER_HEIGHT = 'h-[120px]';

const IMAGE_WIDTH = 300;
const IMAGE_HEIGHT = 200;
const IMAGE_ALT_TEXT = 'Question image';

const ICON_SIZE_SMALL = 'w-3 h-3';
const ICON_SIZE_MEDIUM = 'w-4 h-4';
const ICON_SIZE_LARGE = 'w-5 h-5';

interface QuestionFormProps {
  question: CreateQuestionForm;
  selectedQuestionIndex: number;
  isUploading: boolean;
  isMobile: boolean;
  onQuestionFieldChange: (
    field: keyof CreateQuestionForm,
    value: string | number | boolean | CreateAnswerForm[] | undefined,
  ) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExplanationModalOpen: () => void;
  onAnswerImageUpload: (index: number, e: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Triggers file input click event.
 *
 * @param {string} inputId - The ID of the file input element
 */
const triggerFileInput = (inputId: string) => {
  document.getElementById(inputId)?.click();
};

/**
 * Component: QuestionForm
 * Description:
 * - Main form component for editing quiz questions
 * - Displays question text input and image upload section
 * - Shows explanation button and question control panel
 * - Conditionally renders answer panels based on question type (multiple choice or true/false)
 * - Handles question field changes and image uploads
 *
 * Parameters:
 * - question (CreateQuestionForm): Current question data
 * - selectedQuestionIndex (number): Index of the selected question
 * - isUploading (boolean): Whether image upload is in progress
 * - isMobile (boolean): Whether device is mobile
 * - onQuestionFieldChange (function): Callback when question field changes
 * - onImageUpload (function): Callback when question image is uploaded
 * - onExplanationModalOpen (function): Callback to open explanation modal
 * - onAnswerImageUpload (function): Callback when answer image is uploaded
 *
 * Returns:
 * - React.ReactElement: The question form component
 *
 * Example:
 * ```tsx
 * <QuestionForm
 *   question={question}
 *   selectedQuestionIndex={0}
 *   isUploading={false}
 *   isMobile={false}
 *   onQuestionFieldChange={(field, value) => handleChange(field, value)}
 *   onImageUpload={(e) => handleImageUpload(e)}
 *   onExplanationModalOpen={() => openModal()}
 *   onAnswerImageUpload={(index, e) => handleAnswerImageUpload(index, e)}
 * />
 * ```
 */
export const QuestionForm: React.FC<QuestionFormProps> = ({
  question,
  selectedQuestionIndex,
  isUploading,
  isMobile,
  onQuestionFieldChange,
  onImageUpload,
  onExplanationModalOpen,
  onAnswerImageUpload,
}) => {
  const questionTextId = `question_text_${selectedQuestionIndex}`;
  const questionImageId = `question_image_${selectedQuestionIndex}`;

  const handleUploadAreaClick = () => {
    if (!isUploading) {
      triggerFileInput(questionImageId);
    }
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isUploading) {
      triggerFileInput(questionImageId);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <Card className="bg-gradient-to-br from-lime-200 to-green-300 border-lime-400 shadow-sm hover:shadow-md">
        <CardHeader className="pb-3 md:pb-6 px-3 md:px-6">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <BookOpen className={cn(ICON_SIZE_MEDIUM, 'md:w-5 md:h-5 text-primary')} />
            問題 {question?.order_index} の詳細
          </CardTitle>
          <p className="text-sm md:text-sm text-gray-600">選択された問題の詳細を編集してください</p>
        </CardHeader>
        <CardContent className="px-3 md:px-6">
          <div className="space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <Label htmlFor={questionTextId} required variant={LABEL_VARIANT_PRIMARY}>
                  問題文
                </Label>
                <Textarea
                  id={questionTextId}
                  name={questionTextId}
                  placeholder="問題文を入力してください..."
                  value={question?.question_text || DEFAULT_QUESTION_TEXT}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    onQuestionFieldChange(FORM_FIELD_QUESTION_TEXT, e.target.value)
                  }
                  variant={TEXTAREA_VARIANT_PRIMARY}
                  className={cn(
                    TEXTAREA_HEIGHT,
                    'border-2 border-blue-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-300',
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={questionImageId} variant={LABEL_VARIANT_PRIMARY}>
                  問題画像（任意）
                </Label>
                <div className="space-y-4">
                  {question?.image_url ? (
                    <div className={cn('relative overflow-hidden', IMAGE_CONTAINER_HEIGHT)}>
                      <Image
                        src={question.image_url}
                        alt={IMAGE_ALT_TEXT}
                        width={IMAGE_WIDTH}
                        height={IMAGE_HEIGHT}
                        className="w-full h-full object-cover rounded-lg border"
                        onError={(e) => {
                          console.error('Question image failed to load:', question.image_url, e);
                        }}
                      />
                      <button
                        type={BUTTON_TYPE_BUTTON}
                        onClick={() => onQuestionFieldChange(FORM_FIELD_IMAGE_URL, undefined)}
                        className="absolute top-1 right-1 sm:top-2 sm:right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className={cn(ICON_SIZE_SMALL, 'sm:w-4 sm:h-4')} />
                      </button>
                    </div>
                  ) : (
                    <div
                      className={cn(
                        'border-4 border-dashed border-lime-600 rounded-lg p-4 md:p-6 text-center cursor-pointer flex flex-col items-center justify-center',
                        IMAGE_CONTAINER_HEIGHT,
                      )}
                      onClick={handleUploadAreaClick}
                    >
                      <Upload
                        className={cn('w-6 h-6', 'md:w-8 md:h-8 text-gray-400 mx-auto mb-2')}
                      />
                      <p className="text-sm md:text-sm text-gray-600 mb-2">画像をアップロード</p>
                      <input
                        type={INPUT_TYPE_FILE}
                        accept={FILE_INPUT_ACCEPT}
                        onChange={onImageUpload}
                        className="hidden"
                        id={questionImageId}
                        name={questionImageId}
                        disabled={isUploading}
                      />
                      <Button
                        type={BUTTON_TYPE_BUTTON}
                        variant={BUTTON_VARIANT_OUTLINE}
                        size={BUTTON_SIZE_SM}
                        onClick={handleButtonClick}
                        disabled={isUploading}
                      >
                        {isUploading ? 'アップロード中...' : 'ファイルを選択'}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-4">
              <Button
                type={BUTTON_TYPE_BUTTON}
                variant={BUTTON_VARIANT_OUTLINE}
                onClick={onExplanationModalOpen}
                className={cn(
                  'border-2 border-purple-500 bg-purple-50 hover:bg-purple-100 text-purple-700 hover:text-purple-800',
                  isMobile ? 'w-full py-3' : 'px-6 py-2',
                )}
              >
                <Lightbulb className={cn(isMobile ? ICON_SIZE_LARGE : ICON_SIZE_MEDIUM, 'mr-2')} />
                <span className={isMobile ? 'text-base' : 'text-sm'}>
                  解説を追加 {question?.explanation_title && '(設定済み)'}
                </span>
              </Button>
            </div>

            <div className="mt-4">
              <QuestionControlPanel
                question={question}
                onQuestionChange={onQuestionFieldChange}
                isMobile={isMobile}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {question?.question_type === QuestionType.MULTIPLE_CHOICE && (
        <MultipleChoicePanel
          answers={question.answers || DEFAULT_ANSWERS}
          isMobile={isMobile}
          isUploading={isUploading}
          onAnswersChange={(answers) => onQuestionFieldChange(FORM_FIELD_ANSWERS, answers)}
          onImageUpload={onAnswerImageUpload}
        />
      )}

      {question?.question_type === QuestionType.TRUE_FALSE && (
        <TrueFalsePanel
          answers={question.answers || DEFAULT_ANSWERS}
          isMobile={isMobile}
          onAnswersChange={(answers) => onQuestionFieldChange(FORM_FIELD_ANSWERS, answers)}
        />
      )}
    </div>
  );
};
