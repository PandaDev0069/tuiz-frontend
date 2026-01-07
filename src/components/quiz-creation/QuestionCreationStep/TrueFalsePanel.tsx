// ====================================================
// File Name   : TrueFalsePanel.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-05
// Last Update : 2025-09-13
//
// Description:
// - Panel component for true/false question answer selection
// - Displays two large buttons for True (O) and False (X) selection
// - Shows visual indicators with green circle for True and red X for False
// - Provides instructions and hints for users
// - Responsive design for mobile and desktop layouts
//
// Notes:
// - Client-only component (requires 'use client')
// - Only one answer can be selected at a time
// - Automatically creates both True and False answers when one is selected
// ====================================================

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { XCircle } from 'lucide-react';
import { CreateAnswerForm } from '@/types/quiz';

import { cn } from '@/lib/utils';

const ANSWER_TEXT_TRUE = 'True';
const ANSWER_TEXT_FALSE = 'False';

const ORDER_INDEX_TRUE = 1;
const ORDER_INDEX_FALSE = 2;

const ICON_SIZE_SMALL = 'w-4 h-4';

const TEXT_SIZE_SM = 'text-sm';
const TEXT_SIZE_BASE = 'text-base';
const TEXT_SIZE_LG = 'text-lg';
const TEXT_SIZE_XL = 'text-xl';

const CIRCLE_SIZE_SMALL_MOBILE = 'w-16 h-16';
const CIRCLE_SIZE_SMALL_DESKTOP = 'w-20 h-20';
const CIRCLE_SIZE_INNER_MOBILE = 'w-6 h-6';
const CIRCLE_SIZE_INNER_DESKTOP = 'w-8 h-8';

const BUTTON_WIDTH_MOBILE = 'w-full';
const BUTTON_WIDTH_DESKTOP = 'w-56';
const BUTTON_HEIGHT_DESKTOP = 'h-32';
const BUTTON_PADDING_MOBILE = 'py-8 px-6';

const MAIN_CARD_CLASSES =
  'bg-gradient-to-br from-lime-200 to-green-300 border-lime-400 shadow-sm hover:shadow-md';
const HEADER_ICON_CONTAINER_CLASSES =
  'w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold';

const BUTTON_BASE_CLASSES =
  'border-2 rounded-lg cursor-pointer transition-all duration-200 flex items-center justify-center';
const BUTTON_SELECTED_TRUE_CLASSES = 'bg-green-100 border-green-500 text-green-700 shadow-lg';
const BUTTON_SELECTED_FALSE_CLASSES = 'bg-red-100 border-red-500 text-red-700 shadow-lg';
const BUTTON_UNSELECTED_CLASSES = 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200';

const CIRCLE_CONTAINER_BASE_CLASSES =
  'rounded-full border-4 flex items-center justify-center bg-white';
const CIRCLE_CONTAINER_TRUE_CLASSES = 'border-green-500';
const CIRCLE_CONTAINER_FALSE_CLASSES = 'border-red-500';
const CIRCLE_INNER_TRUE_CLASSES = 'rounded-full border-6 border-green-500';
const CIRCLE_INNER_FALSE_BASE_CLASSES = 'relative';

const X_LINE_BASE_CLASSES = 'absolute inset-0 flex items-center justify-center';
const X_LINE_CLASSES = 'w-full h-2 bg-red-500 origin-center';
const X_LINE_ROTATE_45 = 'transform rotate-45';
const X_LINE_ROTATE_NEG_45 = 'transform -rotate-45';

const INSTRUCTIONS_CARD_CLASSES = 'text-gray-700 bg-lime-200 p-4 rounded-lg border border-lime-500';
const INSTRUCTIONS_TITLE_CLASSES = 'font-semibold mb-2';

interface TrueFalsePanelProps {
  answers: CreateAnswerForm[];
  isMobile: boolean;
  onAnswersChange: (answers: CreateAnswerForm[]) => void;
}

/**
 * Function: createTrueFalseAnswers
 * Description:
 * - Creates both True and False answer objects
 * - Sets the correct answer based on the selected answer text
 *
 * Parameters:
 * - answerText ('True' | 'False'): The selected answer text
 *
 * Returns:
 * - Array of CreateAnswerForm objects with True and False answers
 *
 * Example:
 * ```ts
 * const answers = createTrueFalseAnswers('True');
 * // Returns array with True as correct and False as incorrect
 * ```
 */
const createTrueFalseAnswers = (answerText: 'True' | 'False'): CreateAnswerForm[] => [
  {
    answer_text: ANSWER_TEXT_TRUE,
    image_url: null,
    is_correct: answerText === ANSWER_TEXT_TRUE,
    order_index: ORDER_INDEX_TRUE,
  },
  {
    answer_text: ANSWER_TEXT_FALSE,
    image_url: null,
    is_correct: answerText === ANSWER_TEXT_FALSE,
    order_index: ORDER_INDEX_FALSE,
  },
];

/**
 * Component: TrueFalsePanel
 * Description:
 * - Panel for selecting true/false question answers
 * - Displays two large interactive buttons for True (O) and False (X)
 * - Shows visual feedback with color-coded selection states
 * - Includes instructions and hints for users
 * - Responsive layout adapting to mobile and desktop screens
 *
 * Parameters:
 * - answers (CreateAnswerForm[]): Array of current answer objects
 * - isMobile (boolean): Whether device is mobile
 * - onAnswersChange (function): Callback when answer selection changes
 *
 * Returns:
 * - React.ReactElement: The true/false panel component
 *
 * Example:
 * ```tsx
 * <TrueFalsePanel
 *   answers={answers}
 *   isMobile={false}
 *   onAnswersChange={(newAnswers) => setAnswers(newAnswers)}
 * />
 * ```
 */
export const TrueFalsePanel: React.FC<TrueFalsePanelProps> = ({
  answers,
  isMobile,
  onAnswersChange,
}) => {
  const handleAnswerChange = (answerText: 'True' | 'False') => {
    const updatedAnswers = createTrueFalseAnswers(answerText);
    onAnswersChange(updatedAnswers);
  };

  const selectedAnswer = answers.find((answer) => answer.is_correct)?.answer_text || '';
  const isTrueSelected = selectedAnswer === ANSWER_TEXT_TRUE;
  const isFalseSelected = selectedAnswer === ANSWER_TEXT_FALSE;

  return (
    <Card className={MAIN_CARD_CLASSES}>
      <CardHeader className={cn(isMobile ? 'pb-4 px-4' : 'pb-6 px-6')}>
        <CardTitle
          className={cn('flex items-center gap-2', isMobile ? TEXT_SIZE_BASE : TEXT_SIZE_LG)}
        >
          <div className={HEADER_ICON_CONTAINER_CLASSES}>
            <XCircle className={ICON_SIZE_SMALL} />
          </div>
          正誤問題の選択肢
        </CardTitle>
        <p className={cn(isMobile ? TEXT_SIZE_SM : TEXT_SIZE_BASE, 'text-gray-600')}>
          O（正）または X（誤）を選択してください
        </p>
      </CardHeader>

      <CardContent className={cn(isMobile ? 'px-4' : 'px-6')}>
        <div className="space-y-4">
          <div className={cn(isMobile ? 'grid grid-cols-1 gap-4' : 'flex gap-8 justify-center')}>
            <div
              onClick={() => handleAnswerChange(ANSWER_TEXT_TRUE)}
              className={cn(
                BUTTON_BASE_CLASSES,
                isTrueSelected ? BUTTON_SELECTED_TRUE_CLASSES : BUTTON_UNSELECTED_CLASSES,
                isMobile
                  ? cn(BUTTON_WIDTH_MOBILE, BUTTON_PADDING_MOBILE, TEXT_SIZE_LG)
                  : cn(BUTTON_WIDTH_DESKTOP, BUTTON_HEIGHT_DESKTOP, TEXT_SIZE_XL),
              )}
            >
              <div className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    CIRCLE_CONTAINER_BASE_CLASSES,
                    CIRCLE_CONTAINER_TRUE_CLASSES,
                    isMobile ? CIRCLE_SIZE_SMALL_MOBILE : CIRCLE_SIZE_SMALL_DESKTOP,
                  )}
                >
                  <div
                    className={cn(
                      CIRCLE_INNER_TRUE_CLASSES,
                      isMobile ? CIRCLE_SIZE_INNER_MOBILE : CIRCLE_SIZE_INNER_DESKTOP,
                    )}
                  ></div>
                </div>
              </div>
            </div>

            <div
              onClick={() => handleAnswerChange(ANSWER_TEXT_FALSE)}
              className={cn(
                BUTTON_BASE_CLASSES,
                isFalseSelected ? BUTTON_SELECTED_FALSE_CLASSES : BUTTON_UNSELECTED_CLASSES,
                isMobile
                  ? cn(BUTTON_WIDTH_MOBILE, BUTTON_PADDING_MOBILE, TEXT_SIZE_LG)
                  : cn(BUTTON_WIDTH_DESKTOP, BUTTON_HEIGHT_DESKTOP, TEXT_SIZE_XL),
              )}
            >
              <div className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    CIRCLE_CONTAINER_BASE_CLASSES,
                    CIRCLE_CONTAINER_FALSE_CLASSES,
                    isMobile ? CIRCLE_SIZE_SMALL_MOBILE : CIRCLE_SIZE_SMALL_DESKTOP,
                  )}
                >
                  <div
                    className={cn(
                      CIRCLE_INNER_FALSE_BASE_CLASSES,
                      isMobile ? CIRCLE_SIZE_INNER_MOBILE : CIRCLE_SIZE_INNER_DESKTOP,
                    )}
                  >
                    <div className={X_LINE_BASE_CLASSES}>
                      <div className={cn(X_LINE_CLASSES, X_LINE_ROTATE_45)}></div>
                    </div>
                    <div className={X_LINE_BASE_CLASSES}>
                      <div className={cn(X_LINE_CLASSES, X_LINE_ROTATE_NEG_45)}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={cn(isMobile ? TEXT_SIZE_SM : TEXT_SIZE_BASE, INSTRUCTIONS_CARD_CLASSES)}>
            <div className={INSTRUCTIONS_TITLE_CLASSES}>💡 ヒント:</div>
            <ul className="space-y-1">
              <li>• 緑のOは正しいを表します</li>
              <li>• 赤のXは間違いを表します</li>
              <li>• 正解の選択肢をクリックして選択してください</li>
              <li>• 一つの問題につき一つの正解のみ選択できます</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
