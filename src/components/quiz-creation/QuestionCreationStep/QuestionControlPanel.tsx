'use client';

import React, { useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Label, Select } from '@/components/ui';
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
import { CreateQuestionForm, QuestionType, DifficultyLevel } from '@/types/quiz';
import {
  QUESTION_TYPE_OPTIONS,
  TIMING_OPTIONS,
  EXPLANATION_TIME_OPTIONS,
  POINTS_OPTIONS,
  DIFFICULTY_OPTIONS,
} from './constants';

interface QuestionControlPanelProps {
  question: CreateQuestionForm;
  onQuestionChange: (
    field: keyof CreateQuestionForm,
    value: string | number | boolean | undefined,
  ) => void;
  isMobile: boolean;
}

export const QuestionControlPanel: React.FC<QuestionControlPanelProps> = ({
  question,
  onQuestionChange,
  isMobile,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'CheckSquare':
        return <CheckSquare className="w-4 h-4" />;
      case 'CheckCircle':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const handleQuestionTypeChange = (value: QuestionType) => {
    onQuestionChange('question_type', value);
  };

  const handleShowQuestionTimeChange = (value: string) => {
    onQuestionChange('show_question_time', parseInt(value));
  };

  const handleAnsweringTimeChange = (value: string) => {
    onQuestionChange('answering_time', parseInt(value));
  };

  const handlePointsChange = (value: string) => {
    onQuestionChange('points', parseInt(value));
  };

  const handleDifficultyChange = (value: DifficultyLevel) => {
    onQuestionChange('difficulty', value);
  };

  const handleExplanationTimeChange = (value: string) => {
    onQuestionChange('show_explanation_time', parseInt(value));
  };

  if (isMobile) {
    return (
      <Card className="bg-gradient-to-br from-lime-400 to-lime-500 border-lime-600 shadow-md ring-1 ring-lime-400">
        <CardHeader className="pb-3 px-4">
          <CardTitle className="flex items-center justify-between text-base text-gray-700">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-orange-600" />
              問題設定
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 h-10 w-10 min-h-10 min-w-10"
            >
              <span className="text-2xl font-bold leading-none">{isExpanded ? '−' : '+'}</span>
            </Button>
          </CardTitle>
        </CardHeader>

        {isExpanded && (
          <CardContent className="px-4 space-y-4">
            {/* Question Type */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">問題タイプ</Label>
              <div className="grid grid-cols-2 gap-2">
                {QUESTION_TYPE_OPTIONS.map((option) => (
                  <Button
                    key={option.value}
                    type="button"
                    variant={question.question_type === option.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleQuestionTypeChange(option.value)}
                    className={`text-xs h-8 ${
                      question.question_type === option.value
                        ? 'bg-blue-500 text-white'
                        : option.color
                    }`}
                  >
                    {renderIcon(option.icon)}
                    <span className="ml-1">{option.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Timing Controls */}
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  表示時間
                </Label>
                <Select
                  value={question.show_question_time?.toString()}
                  onValueChange={handleShowQuestionTimeChange}
                  options={TIMING_OPTIONS.map((option) => ({
                    value: option.value.toString(),
                    label: option.label,
                  }))}
                  size="sm"
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  回答時間
                </Label>
                <Select
                  value={question.answering_time?.toString()}
                  onValueChange={handleAnsweringTimeChange}
                  options={TIMING_OPTIONS.map((option) => ({
                    value: option.value.toString(),
                    label: option.label,
                  }))}
                  size="sm"
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Timer className="w-3 h-3" />
                  解説時間
                </Label>
                <Select
                  value={question.show_explanation_time?.toString()}
                  onValueChange={handleExplanationTimeChange}
                  options={EXPLANATION_TIME_OPTIONS.map((option) => ({
                    value: option.value.toString(),
                    label: option.label,
                  }))}
                  size="sm"
                  className="h-8 text-xs"
                />
              </div>
            </div>

            {/* Points and Difficulty */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  ポイント
                </Label>
                <Select
                  value={question.points?.toString()}
                  onValueChange={handlePointsChange}
                  options={POINTS_OPTIONS.map((option) => ({
                    value: option.value.toString(),
                    label: option.label,
                  }))}
                  size="sm"
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Brain className="w-3 h-3" />
                  難易度
                </Label>
                <Select
                  value={question.difficulty}
                  onValueChange={(value) => handleDifficultyChange(value as DifficultyLevel)}
                  options={DIFFICULTY_OPTIONS.map((option) => ({
                    value: option.value,
                    label: option.label,
                  }))}
                  size="sm"
                  className="h-8 text-xs"
                />
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    );
  }

  // Desktop Layout
  return (
    <Card className="bg-gradient-to-br from-lime-400 to-lime-500 border-lime-600 shadow-md ring-1 ring-lime-400">
      <CardHeader className="pb-4 px-6">
        <CardTitle className="flex items-center gap-2 text-lg text-gray-700">
          <Settings className="w-5 h-5 text-orange-600" />
          問題設定
        </CardTitle>
        <p className="text-sm text-gray-600">
          問題のタイプ、時間、ポイント、難易度を設定してください
        </p>
      </CardHeader>

      <CardContent className="px-6 space-y-6">
        {/* Question Type */}
        <div className="space-y-3">
          <Label className="text-base font-medium text-gray-700">問題タイプ</Label>
          <div className="grid grid-cols-2 gap-4">
            {QUESTION_TYPE_OPTIONS.map((option) => (
              <Button
                key={option.value}
                type="button"
                variant={question.question_type === option.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleQuestionTypeChange(option.value)}
                className={`h-12 ${
                  question.question_type === option.value ? 'bg-blue-500 text-white' : option.color
                }`}
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

        {/* Timing and Points Row */}
        <div className="grid grid-cols-5 gap-4">
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              表示時間
            </Label>
            <Select
              value={question.show_question_time?.toString()}
              onValueChange={handleShowQuestionTimeChange}
              options={TIMING_OPTIONS.map((option) => ({
                value: option.value.toString(),
                label: option.label,
              }))}
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Target className="w-4 h-4" />
              回答時間
            </Label>
            <Select
              value={question.answering_time?.toString()}
              onValueChange={handleAnsweringTimeChange}
              options={TIMING_OPTIONS.map((option) => ({
                value: option.value.toString(),
                label: option.label,
              }))}
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Star className="w-4 h-4" />
              ポイント
            </Label>
            <Select
              value={question.points?.toString()}
              onValueChange={handlePointsChange}
              options={POINTS_OPTIONS.map((option) => ({
                value: option.value.toString(),
                label: option.label,
              }))}
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Timer className="w-4 h-4" />
              解説時間
            </Label>
            <Select
              value={question.show_explanation_time?.toString()}
              onValueChange={handleExplanationTimeChange}
              options={EXPLANATION_TIME_OPTIONS.map((option) => ({
                value: option.value.toString(),
                label: option.label,
              }))}
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Brain className="w-4 h-4" />
              難易度
            </Label>
            <Select
              value={question.difficulty}
              onValueChange={(value) => handleDifficultyChange(value as DifficultyLevel)}
              options={DIFFICULTY_OPTIONS.map((option) => ({
                value: option.value,
                label: option.label,
              }))}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
