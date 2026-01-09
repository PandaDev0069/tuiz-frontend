// ====================================================
// File Name   : MultipleChoicePanel.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-05
// Last Update : 2025-09-14
//
// Description:
// - Panel component for managing multiple choice question answers
// - Allows users to create, edit, and remove answer options
// - Supports image uploads for each answer option
// - Displays answers in a 2x2 grid layout
//
// Notes:
// - Client-only component (requires 'use client')
// - Supports 2-4 answer options with validation
// - Implements responsive design for mobile and desktop
// ====================================================

'use client';

import React from 'react';
import { Plus, Trash2, CheckCircle, CheckSquare } from 'lucide-react';

import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '@/components/ui';
import { CreateAnswerForm } from '@/types/quiz';
import { cn } from '@/lib/utils';

const MIN_ANSWERS = 2;
const MAX_ANSWERS = 4;
const ASCII_LETTER_A = 65;

const BUTTON_TYPE_BUTTON = 'button';
const BUTTON_VARIANT_OUTLINE = 'outline';
const BUTTON_SIZE_SM = 'sm';
const LABEL_VARIANT_PRIMARY = 'primary';
const INPUT_VARIANT_DEFAULT = 'default';
const INPUT_TYPE_TEXT = 'text';

const LABEL_SIZE_LG = 'lg';
const LABEL_SIZE_MD = 'md';
const INPUT_SIZE_LG = 'lg';
const INPUT_SIZE_MD = 'md';

const ICON_SIZE_SMALL = 'w-3 h-3';
const ICON_SIZE_MEDIUM = 'w-4 h-4';

const OPTION_LETTER_SIZE = 'w-6 h-6';
const OPTION_ICON_SIZE = 'w-8 h-8';

const DEFAULT_ANSWER_TEXT = '';
const DEFAULT_IMAGE_URL = null;
const DEFAULT_IS_CORRECT = false;

interface AnswerOptionProps {
  answer: CreateAnswerForm;
  index: number;
  isMobile: boolean;
  onAnswerChange: (index: number, field: keyof CreateAnswerForm, value: string | boolean) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
}

interface OptionHeaderProps {
  optionLetter: string;
  index: number;
  isMobile: boolean;
  answer: CreateAnswerForm;
  canRemove: boolean;
  onAnswerChange: (index: number, field: keyof CreateAnswerForm, value: string | boolean) => void;
  onRemove: (index: number) => void;
}

interface AnswerTextInputProps {
  index: number;
  answer: CreateAnswerForm;
  isMobile: boolean;
  onAnswerChange: (index: number, field: keyof CreateAnswerForm, value: string | boolean) => void;
}

interface MultipleChoicePanelProps {
  answers: CreateAnswerForm[];
  isMobile: boolean;
  isUploading: boolean;
  onAnswersChange: (answers: CreateAnswerForm[]) => void;
  onImageUpload: (index: number, e: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Generates option letter (A, B, C, D) from index.
 *
 * @param {number} index - Option index (0-based)
 * @returns {string} Option letter
 */
const getOptionLetter = (index: number): string => {
  return String.fromCharCode(ASCII_LETTER_A + index);
};

/**
 * Component: OptionHeader
 * Description:
 * - Renders header section for answer option
 * - Displays option letter, label, correct toggle, and remove button
 *
 * @param {OptionHeaderProps} props - Component props
 * @returns {React.ReactElement} Option header component
 */
const OptionHeader: React.FC<OptionHeaderProps> = ({
  optionLetter,
  index,
  isMobile,
  answer,
  canRemove,
  onAnswerChange,
  onRemove,
}) => {
  const inputId = `answer_text_${index}`;
  const labelSize = isMobile ? LABEL_SIZE_LG : LABEL_SIZE_MD;

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div
          className={cn(
            OPTION_LETTER_SIZE,
            'flex items-center justify-center bg-blue-500 text-white rounded-full text-sm font-bold',
          )}
        >
          {optionLetter}
        </div>
        <Label
          htmlFor={inputId}
          variant={LABEL_VARIANT_PRIMARY}
          size={labelSize}
          className="font-semibold"
        >
          選択肢 {index + 1}
        </Label>
      </div>
      <div className="flex items-center gap-1">
        <Button
          type={BUTTON_TYPE_BUTTON}
          variant={BUTTON_VARIANT_OUTLINE}
          size={BUTTON_SIZE_SM}
          onClick={() => onAnswerChange(index, 'is_correct', !answer.is_correct)}
          className={cn(
            answer.is_correct
              ? 'bg-green-100 border-green-500 text-green-700'
              : 'bg-gray-100 border-gray-300 text-gray-600',
            isMobile ? 'px-2 py-1' : 'px-1 py-1',
          )}
        >
          <CheckCircle className={cn(ICON_SIZE_SMALL, 'mr-1')} />
          <span className="text-xs">{answer.is_correct ? '正解' : '選択'}</span>
        </Button>
        {canRemove && (
          <Button
            type={BUTTON_TYPE_BUTTON}
            variant={BUTTON_VARIANT_OUTLINE}
            size={BUTTON_SIZE_SM}
            onClick={() => onRemove(index)}
            className="text-red-600 border-red-300 p-1"
          >
            <Trash2 className={ICON_SIZE_SMALL} />
          </Button>
        )}
      </div>
    </div>
  );
};

/**
 * Component: AnswerTextInput
 * Description:
 * - Renders text input for answer option
 * - Allows users to enter answer text
 *
 * @param {AnswerTextInputProps} props - Component props
 * @returns {React.ReactElement} Answer text input component
 */
const AnswerTextInput: React.FC<AnswerTextInputProps> = ({
  index,
  answer,
  isMobile,
  onAnswerChange,
}) => {
  const inputId = `answer_text_${index}`;
  const inputSize = isMobile ? INPUT_SIZE_LG : INPUT_SIZE_MD;

  return (
    <div>
      <Input
        id={inputId}
        type={INPUT_TYPE_TEXT}
        placeholder={`選択肢 ${index + 1} のテキストを入力...`}
        value={answer.answer_text}
        onChange={(e) => onAnswerChange(index, 'answer_text', e.target.value)}
        variant={INPUT_VARIANT_DEFAULT}
        inputSize={inputSize}
        className="border-2 border-blue-500 focus:border-blue-600"
      />
    </div>
  );
};

/**
 * Component: ImageUploadSection
 * Description:
 * - Renders image upload section for answer option
 * - Displays image preview or upload area
 * - Handles image upload and removal
 *
 * @param {ImageUploadSectionProps} props - Component props
 * @returns {React.ReactElement} Image upload section component
 */

/**
 * Component: AnswerOption
 * Description:
 * - Renders complete answer option with header, text input, and image upload
 * - Combines OptionHeader, AnswerTextInput, and ImageUploadSection
 *
 * @param {AnswerOptionProps} props - Component props
 * @returns {React.ReactElement} Answer option component
 */
const AnswerOption: React.FC<AnswerOptionProps> = ({
  answer,
  index,
  isMobile,
  onAnswerChange,
  onRemove,
  canRemove,
}) => {
  const optionLetter = getOptionLetter(index);

  return (
    <div className={cn(isMobile ? 'space-y-2' : 'h-full flex flex-col space-y-2')}>
      <OptionHeader
        optionLetter={optionLetter}
        index={index}
        isMobile={isMobile}
        answer={answer}
        canRemove={canRemove}
        onAnswerChange={onAnswerChange}
        onRemove={onRemove}
      />
      <AnswerTextInput
        index={index}
        answer={answer}
        isMobile={isMobile}
        onAnswerChange={onAnswerChange}
      />
    </div>
  );
};

/**
 * Component: MultipleChoicePanel
 * Description:
 * - Panel component for managing multiple choice question answers
 * - Displays answers in a 2x2 grid layout
 * - Allows adding/removing options (2-4 options)
 * - Supports image uploads for each option
 * - Handles answer text and correct answer selection
 *
 * Parameters:
 * - answers (CreateAnswerForm[]): Array of answer options
 * - isMobile (boolean): Whether device is mobile
 * - isUploading (boolean): Whether image upload is in progress
 * - onAnswersChange (function): Callback when answers change
 * - onImageUpload (function): Callback when image is uploaded
 *
 * Returns:
 * - React.ReactElement: The multiple choice panel component
 *
 * Example:
 * ```tsx
 * <MultipleChoicePanel
 *   answers={answers}
 *   isMobile={false}
 *   isUploading={false}
 *   onAnswersChange={(answers) => setAnswers(answers)}
 *   onImageUpload={(index, e) => handleImageUpload(index, e)}
 * />
 * ```
 */
export const MultipleChoicePanel: React.FC<MultipleChoicePanelProps> = ({
  answers,
  isMobile,
  onAnswersChange,
}) => {
  const handleAnswerChange = (
    index: number,
    field: keyof CreateAnswerForm,
    value: string | boolean,
  ) => {
    const updatedAnswers = [...answers];
    updatedAnswers[index] = {
      ...updatedAnswers[index],
      [field]: value,
    };
    onAnswersChange(updatedAnswers);
  };

  const handleAddOption = () => {
    if (answers.length >= MAX_ANSWERS) {
      return;
    }

    const newAnswer: CreateAnswerForm = {
      answer_text: DEFAULT_ANSWER_TEXT,
      image_url: DEFAULT_IMAGE_URL,
      is_correct: DEFAULT_IS_CORRECT,
      order_index: answers.length + 1,
    };

    const updatedAnswers = [...answers, newAnswer];
    onAnswersChange(updatedAnswers);
  };

  const handleRemoveOption = (index: number) => {
    if (answers.length <= MIN_ANSWERS) {
      return;
    }

    const updatedAnswers = answers.filter((_, i) => i !== index);

    updatedAnswers.forEach((answer, i) => {
      answer.order_index = i + 1;
    });

    onAnswersChange(updatedAnswers);
  };

  return (
    <Card className="bg-gradient-to-br from-lime-200 to-green-300 border-lime-400 shadow-sm">
      <CardHeader className={cn(isMobile ? 'pb-4 px-4' : 'pb-6 px-6')}>
        <CardTitle className={cn('flex items-center gap-2', isMobile ? 'text-base' : 'text-lg')}>
          <div
            className={cn(
              OPTION_ICON_SIZE,
              'bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold',
            )}
          >
            <CheckSquare className={ICON_SIZE_MEDIUM} />
          </div>
          複数選択問題の選択肢
        </CardTitle>
        <p className={cn('text-gray-600', isMobile ? 'text-sm' : 'text-base')}>
          2〜4個の選択肢を作成し、正解を選択してください
        </p>
      </CardHeader>

      <CardContent className={cn(isMobile ? 'px-2' : 'px-6')}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {answers.map((answer, index) => (
              <div
                key={index}
                className={cn(
                  'p-3 rounded-lg border-2 flex flex-col justify-between',
                  answer.is_correct
                    ? 'border-green-500 bg-green-200 shadow-md'
                    : 'border-lime-600 bg-lime-300',
                )}
              >
                <AnswerOption
                  answer={answer}
                  index={index}
                  isMobile={isMobile}
                  onAnswerChange={handleAnswerChange}
                  onRemove={handleRemoveOption}
                  canRemove={answers.length > MIN_ANSWERS}
                />
              </div>
            ))}
          </div>

          {answers.length < MAX_ANSWERS && (
            <div className="flex justify-center pt-2">
              <Button
                type={BUTTON_TYPE_BUTTON}
                variant={BUTTON_VARIANT_OUTLINE}
                onClick={handleAddOption}
                className={cn(
                  'border-2 border-dashed border-lime-600 text-lime-800',
                  isMobile ? 'w-full py-3' : 'px-4 py-2',
                )}
              >
                <Plus className={cn(isMobile ? ICON_SIZE_MEDIUM : ICON_SIZE_SMALL, 'mr-2')} />
                <span className={isMobile ? 'text-sm' : 'text-xs'}>
                  選択肢を追加 ({answers.length}/{MAX_ANSWERS})
                </span>
              </Button>
            </div>
          )}

          <div
            className={cn(
              'text-gray-700 bg-lime-200 p-4 rounded-lg border border-lime-500',
              isMobile ? 'text-sm' : 'text-base',
            )}
          >
            <div className="font-semibold mb-2">💡 ヒント:</div>
            <ul className="space-y-1">
              <li>• 各選択肢にテキストを入力してください</li>
              <li>• 画像を追加して選択肢をより分かりやすくできます</li>
              <li>• 正解の選択肢をクリックして選択してください</li>
              <li>• 最低2個、最大4個の選択肢を作成できます</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
