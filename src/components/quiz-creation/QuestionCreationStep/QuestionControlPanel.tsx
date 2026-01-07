// ====================================================
// File Name   : QuestionControlPanel.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-04
// Last Update : 2025-09-05
//
// Description:
// - Control panel component for question settings
// - Allows users to configure question type, timing, points, and difficulty
// - Supports both mobile (collapsible) and desktop (expanded) layouts
// - Displays different controls based on device type
//
// Notes:
// - Client-only component (requires 'use client')
// - Mobile layout uses collapsible panel with expand/collapse button
// - Desktop layout shows all controls in a grid
// ====================================================

'use client';

import React, { useState } from 'react';
import {
  Settings,
  Clock,
  Star,
  Target,
  Brain,
  CheckSquare,
  CheckCircle,
  Timer,
} from 'lucide-react';

import { Button, Card, CardContent, CardHeader, CardTitle, Label, Select } from '@/components/ui';
import { CreateQuestionForm, QuestionType, DifficultyLevel } from '@/types/quiz';
import {
  QUESTION_TYPE_OPTIONS,
  TIMING_OPTIONS,
  EXPLANATION_TIME_OPTIONS,
  POINTS_OPTIONS,
  DIFFICULTY_OPTIONS,
} from './constants';
import { cn } from '@/lib/utils';

const DEFAULT_IS_EXPANDED = false;

const BUTTON_TYPE_BUTTON = 'button';
const BUTTON_VARIANT_GHOST = 'ghost';
const BUTTON_VARIANT_DEFAULT = 'default';
const BUTTON_VARIANT_OUTLINE = 'outline';
const BUTTON_SIZE_SM = 'sm';
const SELECT_SIZE_SM = 'sm';

const ICON_NAME_CHECK_SQUARE = 'CheckSquare';
const ICON_NAME_CHECK_CIRCLE = 'CheckCircle';

const ICON_SIZE_SMALL = 'w-3 h-3';
const ICON_SIZE_MEDIUM = 'w-4 h-4';
const ICON_SIZE_LARGE = 'w-5 h-5';

const EXPAND_SYMBOL = '+';
const COLLAPSE_SYMBOL = '−';

interface QuestionControlPanelProps {
  question: CreateQuestionForm;
  onQuestionChange: (
    field: keyof CreateQuestionForm,
    value: string | number | boolean | undefined,
  ) => void;
  isMobile: boolean;
}

/**
 * Renders icon component based on icon name.
 *
 * @param {string} iconName - Name of the icon to render
 * @returns {React.ReactElement | null} Icon component or null
 */
const renderIcon = (iconName: string): React.ReactElement | null => {
  switch (iconName) {
    case ICON_NAME_CHECK_SQUARE:
      return <CheckSquare className={ICON_SIZE_MEDIUM} />;
    case ICON_NAME_CHECK_CIRCLE:
      return <CheckCircle className={ICON_SIZE_MEDIUM} />;
    default:
      return null;
  }
};

/**
 * Converts timing/points options to select options format.
 *
 * @param {ReadonlyArray<{value: number, label: string}>} options - Options array
 * @returns {Array<{value: string, label: string}>} Formatted select options
 */
const formatSelectOptions = (
  options: ReadonlyArray<{ value: number; label: string }>,
): Array<{ value: string; label: string }> => {
  return options.map((option) => ({
    value: option.value.toString(),
    label: option.label,
  }));
};

/**
 * Converts difficulty options to select options format.
 *
 * @param {ReadonlyArray<{value: DifficultyLevel, label: string}>} options - Options array
 * @returns {Array<{value: string, label: string}>} Formatted select options
 */
const formatDifficultySelectOptions = (
  options: ReadonlyArray<{ value: DifficultyLevel; label: string }>,
): Array<{ value: string; label: string }> => {
  return options.map((option) => ({
    value: option.value,
    label: option.label,
  }));
};

/**
 * Component: QuestionControlPanel
 * Description:
 * - Control panel for configuring question settings
 * - Allows users to set question type, timing, points, and difficulty
 * - Mobile layout uses collapsible panel with expand/collapse functionality
 * - Desktop layout displays all controls in a grid
 * - Handles different question types and their configurations
 *
 * Parameters:
 * - question (CreateQuestionForm): Current question data
 * - onQuestionChange (function): Callback when question settings change
 * - isMobile (boolean): Whether device is mobile
 *
 * Returns:
 * - React.ReactElement: The question control panel component
 *
 * Example:
 * ```tsx
 * <QuestionControlPanel
 *   question={question}
 *   onQuestionChange={(field, value) => handleChange(field, value)}
 *   isMobile={false}
 * />
 * ```
 */
export const QuestionControlPanel: React.FC<QuestionControlPanelProps> = ({
  question,
  onQuestionChange,
  isMobile,
}) => {
  const [isExpanded, setIsExpanded] = useState(DEFAULT_IS_EXPANDED);

  const handleQuestionTypeChange = (value: QuestionType) => {
    onQuestionChange('question_type', value);
  };

  const handleShowQuestionTimeChange = (value: string) => {
    onQuestionChange('show_question_time', parseInt(value, 10));
  };

  const handleAnsweringTimeChange = (value: string) => {
    onQuestionChange('answering_time', parseInt(value, 10));
  };

  const handlePointsChange = (value: string) => {
    onQuestionChange('points', parseInt(value, 10));
  };

  const handleDifficultyChange = (value: DifficultyLevel) => {
    onQuestionChange('difficulty', value);
  };

  const handleExplanationTimeChange = (value: string) => {
    onQuestionChange('show_explanation_time', parseInt(value, 10));
  };

  const timingSelectOptions = formatSelectOptions(TIMING_OPTIONS);
  const explanationTimeSelectOptions = formatSelectOptions(EXPLANATION_TIME_OPTIONS);
  const pointsSelectOptions = formatSelectOptions(POINTS_OPTIONS);
  const difficultySelectOptions = formatDifficultySelectOptions(DIFFICULTY_OPTIONS);

  if (isMobile) {
    return (
      <Card className="bg-gradient-to-br from-lime-200 to-green-300 border-lime-400 shadow-sm hover:shadow-md">
        <CardHeader className="pb-3 px-4">
          <CardTitle className="flex items-center justify-between text-base text-gray-700">
            <div className="flex items-center gap-2">
              <Settings className={cn(ICON_SIZE_MEDIUM, 'text-orange-600')} />
              問題設定
            </div>
            <Button
              type={BUTTON_TYPE_BUTTON}
              variant={BUTTON_VARIANT_GHOST}
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 h-10 w-10 min-h-10 min-w-10"
            >
              <span className="text-2xl font-bold leading-none">
                {isExpanded ? COLLAPSE_SYMBOL : EXPAND_SYMBOL}
              </span>
            </Button>
          </CardTitle>
        </CardHeader>

        {isExpanded && (
          <CardContent className="px-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">問題タイプ</Label>
              <div className="grid grid-cols-2 gap-2">
                {QUESTION_TYPE_OPTIONS.map((option) => (
                  <Button
                    key={option.value}
                    type={BUTTON_TYPE_BUTTON}
                    variant={
                      question.question_type === option.value
                        ? BUTTON_VARIANT_DEFAULT
                        : BUTTON_VARIANT_OUTLINE
                    }
                    size={BUTTON_SIZE_SM}
                    onClick={() => handleQuestionTypeChange(option.value)}
                    className={cn(
                      'text-xs h-8',
                      question.question_type === option.value
                        ? 'bg-blue-500 text-white'
                        : option.color,
                    )}
                  >
                    {renderIcon(option.icon)}
                    <span className="ml-1">{option.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Clock className={ICON_SIZE_SMALL} />
                  表示時間
                </Label>
                <Select
                  value={question.show_question_time?.toString()}
                  onValueChange={handleShowQuestionTimeChange}
                  options={timingSelectOptions}
                  size={SELECT_SIZE_SM}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Target className={ICON_SIZE_SMALL} />
                  回答時間
                </Label>
                <Select
                  value={question.answering_time?.toString()}
                  onValueChange={handleAnsweringTimeChange}
                  options={timingSelectOptions}
                  size={SELECT_SIZE_SM}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Timer className={ICON_SIZE_SMALL} />
                  解説時間
                </Label>
                <Select
                  value={question.show_explanation_time?.toString()}
                  onValueChange={handleExplanationTimeChange}
                  options={explanationTimeSelectOptions}
                  size={SELECT_SIZE_SM}
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Star className={ICON_SIZE_SMALL} />
                  ポイント
                </Label>
                <Select
                  value={question.points?.toString()}
                  onValueChange={handlePointsChange}
                  options={pointsSelectOptions}
                  size={SELECT_SIZE_SM}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Brain className={ICON_SIZE_SMALL} />
                  難易度
                </Label>
                <Select
                  value={question.difficulty}
                  onValueChange={(value) => handleDifficultyChange(value as DifficultyLevel)}
                  options={difficultySelectOptions}
                  size={SELECT_SIZE_SM}
                  className="h-8 text-xs"
                />
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-lime-400 to-lime-500 border-lime-600 shadow-md ring-1 ring-lime-400">
      <CardHeader className="pb-4 px-6">
        <CardTitle className="flex items-center gap-2 text-lg text-gray-700">
          <Settings className={cn(ICON_SIZE_LARGE, 'text-orange-600')} />
          問題設定
        </CardTitle>
        <p className="text-sm text-gray-600">
          問題のタイプ、時間、ポイント、難易度を設定してください
        </p>
      </CardHeader>

      <CardContent className="px-6 space-y-6">
        <div className="space-y-3">
          <Label className="text-base font-medium text-gray-700">問題タイプ</Label>
          <div className="grid grid-cols-2 gap-4">
            {QUESTION_TYPE_OPTIONS.map((option) => (
              <Button
                key={option.value}
                type={BUTTON_TYPE_BUTTON}
                variant={
                  question.question_type === option.value
                    ? BUTTON_VARIANT_DEFAULT
                    : BUTTON_VARIANT_OUTLINE
                }
                size={BUTTON_SIZE_SM}
                onClick={() => handleQuestionTypeChange(option.value)}
                className={cn(
                  'h-12',
                  question.question_type === option.value ? 'bg-blue-500 text-white' : option.color,
                )}
              >
                {renderIcon(option.icon)}
                <div className="text-left ml-2">
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs opacity-80">{option.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-5 gap-4">
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Clock className={ICON_SIZE_MEDIUM} />
              表示時間
            </Label>
            <Select
              value={question.show_question_time?.toString()}
              onValueChange={handleShowQuestionTimeChange}
              options={timingSelectOptions}
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Target className={ICON_SIZE_MEDIUM} />
              回答時間
            </Label>
            <Select
              value={question.answering_time?.toString()}
              onValueChange={handleAnsweringTimeChange}
              options={timingSelectOptions}
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Star className={ICON_SIZE_MEDIUM} />
              ポイント
            </Label>
            <Select
              value={question.points?.toString()}
              onValueChange={handlePointsChange}
              options={pointsSelectOptions}
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Timer className={ICON_SIZE_MEDIUM} />
              解説時間
            </Label>
            <Select
              value={question.show_explanation_time?.toString()}
              onValueChange={handleExplanationTimeChange}
              options={explanationTimeSelectOptions}
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Brain className={ICON_SIZE_MEDIUM} />
              難易度
            </Label>
            <Select
              value={question.difficulty}
              onValueChange={(value) => handleDifficultyChange(value as DifficultyLevel)}
              options={difficultySelectOptions}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
