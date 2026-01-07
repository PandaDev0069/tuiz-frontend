// ====================================================
// File Name   : QuestionList.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-04
// Last Update : 2025-09-04
//
// Description:
// - Question list component for displaying and managing quiz questions
// - Shows grid of question cards with selection state
// - Provides buttons for moving, copying, and deleting questions
// - Supports both mobile and desktop layouts
//
// Notes:
// - Client-only component (requires 'use client')
// - Mobile layout uses 2x2 grid for action buttons
// - Desktop layout uses horizontal row for action buttons
// ====================================================

'use client';

import React from 'react';
import { HelpCircle, Plus, ChevronUp, ChevronDown, Copy, Trash2 } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui';
import { CreateQuestionForm } from '@/types/quiz';
import { cn } from '@/lib/utils';

const MIN_QUESTIONS = 1;
const FIRST_INDEX = 0;

const BUTTON_TYPE_BUTTON = 'button';
const BUTTON_VARIANT_OUTLINE = 'outline';
const BUTTON_SIZE_SM = 'sm';

const MOVE_DIRECTION_UP = 'up';
const MOVE_DIRECTION_DOWN = 'down';

const ICON_SIZE_SMALL = 'w-3 h-3';
const ICON_SIZE_MEDIUM = 'w-4 h-4';

const BUTTON_HEIGHT_MOBILE = 'h-8';
const BUTTON_HEIGHT_DESKTOP = 'h-9';

const BUTTON_CLASSES_BLUE =
  'border-2 border-blue-500 bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800';
const BUTTON_CLASSES_GREEN =
  'border-2 border-green-500 bg-green-50 hover:bg-green-100 text-green-700 hover:text-green-800';
const BUTTON_CLASSES_RED =
  'border-2 border-red-500 bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-800';
const BUTTON_CLASSES_DISABLED =
  'disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300';

interface QuestionListProps {
  questions: CreateQuestionForm[];
  selectedQuestionIndex: number;
  onQuestionSelect: (index: number) => void;
  onAddQuestion: () => void;
  onMoveQuestion: (direction: 'up' | 'down') => void;
  onCopyQuestion: () => void;
  onDeleteQuestion: () => void;
  isMobile: boolean;
}

/**
 * Component: QuestionList
 * Description:
 * - Displays a grid of question cards in a responsive layout
 * - Shows selected question with highlighted styling
 * - Provides add question button
 * - Displays action buttons for moving, copying, and deleting questions
 * - Adapts layout for mobile (2x2 grid) and desktop (horizontal row)
 *
 * Parameters:
 * - questions (CreateQuestionForm[]): Array of questions to display
 * - selectedQuestionIndex (number): Index of currently selected question
 * - onQuestionSelect (function): Callback when question is selected
 * - onAddQuestion (function): Callback when add question button is clicked
 * - onMoveQuestion (function): Callback when move question button is clicked
 * - onCopyQuestion (function): Callback when copy question button is clicked
 * - onDeleteQuestion (function): Callback when delete question button is clicked
 * - isMobile (boolean): Whether device is mobile
 *
 * Returns:
 * - React.ReactElement: The question list component
 *
 * Example:
 * ```tsx
 * <QuestionList
 *   questions={questions}
 *   selectedQuestionIndex={0}
 *   onQuestionSelect={(index) => selectQuestion(index)}
 *   onAddQuestion={() => addQuestion()}
 *   onMoveQuestion={(direction) => moveQuestion(direction)}
 *   onCopyQuestion={() => copyQuestion()}
 *   onDeleteQuestion={() => deleteQuestion()}
 *   isMobile={false}
 * />
 * ```
 */
export const QuestionList: React.FC<QuestionListProps> = ({
  questions,
  selectedQuestionIndex,
  onQuestionSelect,
  onAddQuestion,
  onMoveQuestion,
  onCopyQuestion,
  onDeleteQuestion,
  isMobile,
}) => {
  const isFirstQuestion = selectedQuestionIndex === FIRST_INDEX;
  const isLastQuestion = selectedQuestionIndex === questions.length - 1;
  const canDelete = questions.length > MIN_QUESTIONS;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1 sm:gap-2">
        {questions.map((question: CreateQuestionForm, index: number) => (
          <Card
            key={index}
            className={cn(
              'cursor-pointer transition-all duration-200',
              selectedQuestionIndex === index
                ? 'bg-gradient-to-br from-lime-400 to-lime-500 border-lime-600 shadow-md ring-1 ring-lime-400'
                : 'bg-gradient-to-br from-lime-200 to-green-300 border-lime-400 shadow-sm hover:shadow-md',
            )}
            onClick={() => onQuestionSelect(index)}
          >
            <CardHeader className="pb-0 px-1 sm:px-2 py-1">
              <CardTitle className="text-sm pl-1">問題 {question.order_index}</CardTitle>
            </CardHeader>
            <CardContent className="px-1 sm:px-2 pb-1 pt-0">
              <div className="text-center">
                {question.question_text ? (
                  <p className="text-gray-700 text-xs font-medium line-clamp-1">
                    {question.question_text}
                  </p>
                ) : (
                  <div className="flex flex-col items-center">
                    <HelpCircle className={cn(ICON_SIZE_SMALL, 'text-gray-400 mb-0')} />
                    <p className="text-gray-500 text-xs">準備中</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        <Card
          className="border-2 border-dashed border-lime-600 bg-lime-100 hover:bg-lime-50 cursor-pointer transition-colors"
          onClick={onAddQuestion}
        >
          <CardContent className="flex flex-col items-center justify-center py-2 px-1 sm:px-2">
            <Plus className={cn(ICON_SIZE_MEDIUM, 'text-lime-600 mb-0')} />
            <p className="text-lime-700 font-medium text-xs text-center">追加</p>
          </CardContent>
        </Card>
      </div>

      {questions.length > 0 && (
        <div className="bg-gradient-to-br from-lime-200 to-green-300 border-lime-400 rounded-lg p-2 sm:p-3 border">
          <h3 className="text-sm sm:text-base font-medium text-gray-700 mb-2 sm:mb-3 text-center">
            問題 {questions[selectedQuestionIndex]?.order_index} が選択中
          </h3>

          {isMobile ? (
            <div className="grid grid-cols-2 gap-2">
              <Button
                type={BUTTON_TYPE_BUTTON}
                variant={BUTTON_VARIANT_OUTLINE}
                size={BUTTON_SIZE_SM}
                onClick={() => onMoveQuestion(MOVE_DIRECTION_UP)}
                disabled={isFirstQuestion}
                className={cn(
                  'p-2',
                  BUTTON_HEIGHT_MOBILE,
                  BUTTON_CLASSES_BLUE,
                  BUTTON_CLASSES_DISABLED,
                )}
              >
                <ChevronUp className={cn(ICON_SIZE_SMALL, 'mr-1')} />
                <span className="text-xs">上へ</span>
              </Button>
              <Button
                type={BUTTON_TYPE_BUTTON}
                variant={BUTTON_VARIANT_OUTLINE}
                size={BUTTON_SIZE_SM}
                onClick={() => onMoveQuestion(MOVE_DIRECTION_DOWN)}
                disabled={isLastQuestion}
                className={cn(
                  'p-2',
                  BUTTON_HEIGHT_MOBILE,
                  BUTTON_CLASSES_BLUE,
                  BUTTON_CLASSES_DISABLED,
                )}
              >
                <ChevronDown className={cn(ICON_SIZE_SMALL, 'mr-1')} />
                <span className="text-xs">下へ</span>
              </Button>
              <Button
                type={BUTTON_TYPE_BUTTON}
                variant={BUTTON_VARIANT_OUTLINE}
                size={BUTTON_SIZE_SM}
                onClick={onCopyQuestion}
                className={cn('p-2', BUTTON_HEIGHT_MOBILE, BUTTON_CLASSES_GREEN)}
              >
                <Copy className={cn(ICON_SIZE_SMALL, 'mr-1')} />
                <span className="text-xs">複製</span>
              </Button>
              <Button
                type={BUTTON_TYPE_BUTTON}
                variant={BUTTON_VARIANT_OUTLINE}
                size={BUTTON_SIZE_SM}
                onClick={onDeleteQuestion}
                disabled={!canDelete}
                className={cn(
                  'p-2',
                  BUTTON_HEIGHT_MOBILE,
                  BUTTON_CLASSES_RED,
                  BUTTON_CLASSES_DISABLED,
                )}
              >
                <Trash2 className={cn(ICON_SIZE_SMALL, 'mr-1')} />
                <span className="text-xs">削除</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <div className="flex items-center gap-2">
                <Button
                  type={BUTTON_TYPE_BUTTON}
                  variant={BUTTON_VARIANT_OUTLINE}
                  size={BUTTON_SIZE_SM}
                  onClick={() => onMoveQuestion(MOVE_DIRECTION_UP)}
                  disabled={isFirstQuestion}
                  className={cn(
                    'p-2',
                    BUTTON_HEIGHT_DESKTOP,
                    BUTTON_CLASSES_BLUE,
                    BUTTON_CLASSES_DISABLED,
                  )}
                >
                  <ChevronUp className={cn(ICON_SIZE_MEDIUM, 'mr-1')} />
                  <span className="text-sm">上へ</span>
                </Button>
                <Button
                  type={BUTTON_TYPE_BUTTON}
                  variant={BUTTON_VARIANT_OUTLINE}
                  size={BUTTON_SIZE_SM}
                  onClick={() => onMoveQuestion(MOVE_DIRECTION_DOWN)}
                  disabled={isLastQuestion}
                  className={cn(
                    'p-2',
                    BUTTON_HEIGHT_DESKTOP,
                    BUTTON_CLASSES_BLUE,
                    BUTTON_CLASSES_DISABLED,
                  )}
                >
                  <ChevronDown className={cn(ICON_SIZE_MEDIUM, 'mr-1')} />
                  <span className="text-sm">下へ</span>
                </Button>
              </div>

              <Button
                type={BUTTON_TYPE_BUTTON}
                variant={BUTTON_VARIANT_OUTLINE}
                size={BUTTON_SIZE_SM}
                onClick={onCopyQuestion}
                className={cn('p-2', BUTTON_HEIGHT_DESKTOP, BUTTON_CLASSES_GREEN)}
              >
                <Copy className={cn(ICON_SIZE_MEDIUM, 'mr-1')} />
                <span className="text-sm">複製</span>
              </Button>

              <Button
                type={BUTTON_TYPE_BUTTON}
                variant={BUTTON_VARIANT_OUTLINE}
                size={BUTTON_SIZE_SM}
                onClick={onDeleteQuestion}
                disabled={!canDelete}
                className={cn(
                  'p-2',
                  BUTTON_HEIGHT_DESKTOP,
                  BUTTON_CLASSES_RED,
                  BUTTON_CLASSES_DISABLED,
                )}
              >
                <Trash2 className={cn(ICON_SIZE_MEDIUM, 'mr-1')} />
                <span className="text-sm">削除</span>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
