// ====================================================
// File Name   : QuizOverviewPanel.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-05
// Last Update : 2025-09-06
//
// Description:
// - Overview panel component displaying quiz statistics and breakdown
// - Shows total questions, points, time, and average points
// - Displays question type breakdown (multiple choice vs true/false)
// - Provides summary message with quiz information
// - Responsive design for mobile and desktop layouts
//
// Notes:
// - Client-only component (requires 'use client')
// - Calculates statistics from question array
// - Formats time in minutes and seconds
// ====================================================

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { BarChart3, Clock, Star, Target, CheckCircle, XCircle } from 'lucide-react';
import { CreateQuestionForm, QuestionType, QUESTION_TYPE_LABELS } from '@/types/quiz';

import { cn } from '@/lib/utils';

const SECONDS_PER_MINUTE = 60;
const ZERO_QUESTIONS = 0;

const ICON_SIZE_SMALL = 'w-4 h-4';
const ICON_SIZE_MEDIUM = 'w-5 h-5';

const TEXT_SIZE_XS = 'text-xs';
const TEXT_SIZE_SM = 'text-sm';
const TEXT_SIZE_BASE = 'text-base';
const TEXT_SIZE_LG = 'text-lg';

const GRID_COLS_2 = 'grid grid-cols-2 gap-4';
const GRID_COLS_4 = 'grid grid-cols-4 gap-6';

const STAT_CARD_BASE_CLASSES = 'bg-white rounded-lg p-3 border border-gray-200 shadow-sm';
const ICON_CONTAINER_BASE_CLASSES = 'w-8 h-8 rounded-full flex items-center justify-center';
const VALUE_TEXT_CLASSES = 'font-bold text-gray-900';
const LABEL_TEXT_CLASSES = 'text-gray-600';

const ICON_BG_BLUE = 'bg-blue-100';
const ICON_COLOR_BLUE = 'text-blue-600';
const ICON_BG_GREEN = 'bg-green-100';
const ICON_COLOR_GREEN = 'text-green-600';
const ICON_BG_ORANGE = 'bg-orange-100';
const ICON_COLOR_ORANGE = 'text-orange-600';
const ICON_BG_PURPLE = 'bg-purple-100';
const ICON_COLOR_PURPLE = 'text-purple-600';

const BREAKDOWN_CARD_CLASSES = 'bg-white rounded-lg p-4 border border-gray-200 shadow-sm';
const BREAKDOWN_TITLE_CLASSES = 'font-semibold text-gray-900 mb-4';

const MULTIPLE_CHOICE_CARD_CLASSES =
  'flex items-center justify-between p-3 bg-lime-200 rounded-lg border border-lime-400';
const MULTIPLE_CHOICE_ICON_CLASSES = 'text-lime-600';
const MULTIPLE_CHOICE_TEXT_CLASSES = 'font-medium text-gray-700';
const MULTIPLE_CHOICE_COUNT_CLASSES = 'font-bold text-lime-600';

const TRUE_FALSE_CARD_CLASSES =
  'flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200';
const TRUE_FALSE_ICON_CLASSES = 'text-red-600';
const TRUE_FALSE_TEXT_CLASSES = 'font-medium text-gray-700';
const TRUE_FALSE_COUNT_CLASSES = 'font-bold text-red-600';

const SUMMARY_CARD_CLASSES =
  'bg-gradient-to-r from-lime-200 to-green-200 rounded-lg p-4 border border-lime-500';
const SUMMARY_TEXT_CLASSES = 'text-gray-700';

const MAIN_CARD_CLASSES =
  'bg-gradient-to-br from-lime-200 to-green-300 border-lime-400 shadow-sm hover:shadow-md';
const HEADER_ICON_CONTAINER_CLASSES =
  'w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold';

interface QuizOverviewPanelProps {
  questions: CreateQuestionForm[];
  isMobile: boolean;
}

interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  iconBgColor: string;
  iconColor: string;
  isMobile: boolean;
}

interface StatisticsGridProps {
  statistics: ReturnType<typeof calculateQuizStatistics>;
  isMobile: boolean;
}

interface QuestionTypeBreakdownProps {
  questionTypeBreakdown: ReturnType<typeof calculateQuestionTypeBreakdown>;
  isMobile: boolean;
}

interface SummaryMessageProps {
  statistics: ReturnType<typeof calculateQuizStatistics>;
  isMobile: boolean;
}

/**
 * Function: calculateQuizStatistics
 * Description:
 * - Calculates aggregate statistics from quiz questions
 * - Computes total questions, total points, total time, and average points
 *
 * Parameters:
 * - questions (CreateQuestionForm[]): Array of quiz questions
 *
 * Returns:
 * - Object containing totalQuestions, totalPoints, totalTime, and averagePoints
 *
 * Example:
 * ```ts
 * const stats = calculateQuizStatistics(questions);
 * // { totalQuestions: 10, totalPoints: 100, totalTime: 300, averagePoints: 10 }
 * ```
 */
const calculateQuizStatistics = (questions: CreateQuestionForm[]) => {
  const totalQuestions = questions.length;
  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
  const totalTime = questions.reduce(
    (sum, q) => sum + q.show_question_time + q.answering_time + q.show_explanation_time,
    0,
  );
  const averagePoints =
    totalQuestions > ZERO_QUESTIONS ? Math.round(totalPoints / totalQuestions) : ZERO_QUESTIONS;

  return {
    totalQuestions,
    totalPoints,
    totalTime,
    averagePoints,
  };
};

/**
 * Function: calculateQuestionTypeBreakdown
 * Description:
 * - Counts questions by type (multiple choice vs true/false)
 *
 * Parameters:
 * - questions (CreateQuestionForm[]): Array of quiz questions
 *
 * Returns:
 * - Object containing multipleChoiceCount and trueFalseCount
 *
 * Example:
 * ```ts
 * const breakdown = calculateQuestionTypeBreakdown(questions);
 * // { multipleChoiceCount: 7, trueFalseCount: 3 }
 * ```
 */
const calculateQuestionTypeBreakdown = (questions: CreateQuestionForm[]) => {
  const multipleChoiceCount = questions.filter(
    (q) => q.question_type === QuestionType.MULTIPLE_CHOICE,
  ).length;
  const trueFalseCount = questions.filter(
    (q) => q.question_type === QuestionType.TRUE_FALSE,
  ).length;

  return {
    multipleChoiceCount,
    trueFalseCount,
  };
};

/**
 * Function: formatTime
 * Description:
 * - Formats seconds into human-readable time string
 * - Returns format like "5分30秒" or "30秒"
 *
 * Parameters:
 * - seconds (number): Total seconds to format
 *
 * Returns:
 * - Formatted time string in Japanese format
 *
 * Example:
 * ```ts
 * formatTime(90); // "1分30秒"
 * formatTime(45); // "45秒"
 * ```
 */
const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / SECONDS_PER_MINUTE);
  const remainingSeconds = seconds % SECONDS_PER_MINUTE;
  if (minutes > ZERO_QUESTIONS) {
    return `${minutes}分${remainingSeconds}秒`;
  }
  return `${remainingSeconds}秒`;
};

/**
 * Component: StatCard
 * Description:
 * - Displays a single statistic with icon, value, and label
 * - Used in statistics grid to show quiz metrics
 *
 * Parameters:
 * - icon (React.ReactNode): Icon component to display
 * - value (string | number): Statistic value to display
 * - label (string): Label text for the statistic
 * - iconBgColor (string): Background color class for icon container
 * - iconColor (string): Text color class for icon
 * - isMobile (boolean): Whether device is mobile
 *
 * Returns:
 * - React.ReactElement: The statistic card component
 */
const StatCard: React.FC<StatCardProps> = ({
  icon,
  value,
  label,
  iconBgColor,
  iconColor,
  isMobile,
}) => (
  <div className={STAT_CARD_BASE_CLASSES}>
    <div className="flex items-center gap-2">
      <div className={cn(ICON_CONTAINER_BASE_CLASSES, iconBgColor)}>
        <div className={iconColor}>{icon}</div>
      </div>
      <div>
        <div className={cn(isMobile ? TEXT_SIZE_BASE : TEXT_SIZE_LG, VALUE_TEXT_CLASSES)}>
          {value}
        </div>
        <div className={cn(isMobile ? TEXT_SIZE_XS : TEXT_SIZE_SM, LABEL_TEXT_CLASSES)}>
          {label}
        </div>
      </div>
    </div>
  </div>
);

/**
 * Component: StatisticsGrid
 * Description:
 * - Displays grid of statistic cards showing quiz metrics
 * - Shows total questions, total points, total time, and average points
 * - Responsive grid layout (2 columns on mobile, 4 on desktop)
 *
 * Parameters:
 * - statistics (ReturnType<typeof calculateQuizStatistics>): Calculated quiz statistics
 * - isMobile (boolean): Whether device is mobile
 *
 * Returns:
 * - React.ReactElement: The statistics grid component
 */
const StatisticsGrid: React.FC<StatisticsGridProps> = ({ statistics, isMobile }) => (
  <div className={cn(isMobile ? GRID_COLS_2 : GRID_COLS_4)}>
    <StatCard
      icon={<Target className={ICON_SIZE_SMALL} />}
      value={statistics.totalQuestions}
      label="問題数"
      iconBgColor={ICON_BG_BLUE}
      iconColor={ICON_COLOR_BLUE}
      isMobile={isMobile}
    />
    <StatCard
      icon={<Star className={ICON_SIZE_SMALL} />}
      value={statistics.totalPoints}
      label="総ポイント"
      iconBgColor={ICON_BG_GREEN}
      iconColor={ICON_COLOR_GREEN}
      isMobile={isMobile}
    />
    <StatCard
      icon={<Clock className={ICON_SIZE_SMALL} />}
      value={formatTime(statistics.totalTime)}
      label="総時間"
      iconBgColor={ICON_BG_ORANGE}
      iconColor={ICON_COLOR_ORANGE}
      isMobile={isMobile}
    />
    <StatCard
      icon={<BarChart3 className={ICON_SIZE_SMALL} />}
      value={statistics.averagePoints}
      label="平均ポイント"
      iconBgColor={ICON_BG_PURPLE}
      iconColor={ICON_COLOR_PURPLE}
      isMobile={isMobile}
    />
  </div>
);

/**
 * Component: QuestionTypeBreakdown
 * Description:
 * - Displays breakdown of questions by type
 * - Shows count of multiple choice and true/false questions
 * - Responsive layout (vertical stack on mobile, 2-column grid on desktop)
 *
 * Parameters:
 * - questionTypeBreakdown (ReturnType<typeof calculateQuestionTypeBreakdown>): Question type counts
 * - isMobile (boolean): Whether device is mobile
 *
 * Returns:
 * - React.ReactElement: The question type breakdown component
 */
const QuestionTypeBreakdown: React.FC<QuestionTypeBreakdownProps> = ({
  questionTypeBreakdown,
  isMobile,
}) => (
  <div className={BREAKDOWN_CARD_CLASSES}>
    <h3 className={cn(isMobile ? TEXT_SIZE_SM : TEXT_SIZE_BASE, BREAKDOWN_TITLE_CLASSES)}>
      問題タイプ別
    </h3>
    <div className={cn(isMobile ? 'space-y-3' : 'grid grid-cols-2 gap-4')}>
      <div className={MULTIPLE_CHOICE_CARD_CLASSES}>
        <div className="flex items-center gap-2">
          <CheckCircle className={cn(ICON_SIZE_MEDIUM, MULTIPLE_CHOICE_ICON_CLASSES)} />
          <span
            className={cn(isMobile ? TEXT_SIZE_SM : TEXT_SIZE_BASE, MULTIPLE_CHOICE_TEXT_CLASSES)}
          >
            {QUESTION_TYPE_LABELS[QuestionType.MULTIPLE_CHOICE]}
          </span>
        </div>
        <div
          className={cn(isMobile ? TEXT_SIZE_SM : TEXT_SIZE_BASE, MULTIPLE_CHOICE_COUNT_CLASSES)}
        >
          {questionTypeBreakdown.multipleChoiceCount}
        </div>
      </div>

      <div className={TRUE_FALSE_CARD_CLASSES}>
        <div className="flex items-center gap-2">
          <XCircle className={cn(ICON_SIZE_MEDIUM, TRUE_FALSE_ICON_CLASSES)} />
          <span className={cn(isMobile ? TEXT_SIZE_SM : TEXT_SIZE_BASE, TRUE_FALSE_TEXT_CLASSES)}>
            {QUESTION_TYPE_LABELS[QuestionType.TRUE_FALSE]}
          </span>
        </div>
        <div className={cn(isMobile ? TEXT_SIZE_SM : TEXT_SIZE_BASE, TRUE_FALSE_COUNT_CLASSES)}>
          {questionTypeBreakdown.trueFalseCount}
        </div>
      </div>
    </div>
  </div>
);

/**
 * Component: SummaryMessage
 * Description:
 * - Displays summary message with quiz statistics
 * - Shows total questions, total points, and total play time
 * - Only renders when there are questions
 *
 * Parameters:
 * - statistics (ReturnType<typeof calculateQuizStatistics>): Calculated quiz statistics
 * - isMobile (boolean): Whether device is mobile
 *
 * Returns:
 * - React.ReactElement | null: The summary message component or null
 */
const SummaryMessage: React.FC<SummaryMessageProps> = ({ statistics, isMobile }) => {
  if (statistics.totalQuestions === ZERO_QUESTIONS) return null;

  return (
    <div className={SUMMARY_CARD_CLASSES}>
      <div className={cn(isMobile ? TEXT_SIZE_SM : TEXT_SIZE_BASE, SUMMARY_TEXT_CLASSES)}>
        <span className="font-semibold text-lime-600">{statistics.totalQuestions}問のクイズ</span>
        を作成しました。
        <span className="font-semibold text-green-600">{statistics.totalPoints}ポイント</span>
        の総合計で、
        <span className="font-semibold text-orange-600">{formatTime(statistics.totalTime)}</span>
        のプレイ時間になります。
      </div>
    </div>
  );
};

/**
 * Component: QuizOverviewPanel
 * Description:
 * - Main overview panel component for quiz creation
 * - Displays comprehensive statistics and breakdown of quiz questions
 * - Shows statistics grid, question type breakdown, and summary message
 * - Responsive design adapting to mobile and desktop layouts
 *
 * Parameters:
 * - questions (CreateQuestionForm[]): Array of quiz questions
 * - isMobile (boolean): Whether device is mobile
 *
 * Returns:
 * - React.ReactElement: The quiz overview panel component
 *
 * Example:
 * ```tsx
 * <QuizOverviewPanel
 *   questions={questions}
 *   isMobile={false}
 * />
 * ```
 */
export const QuizOverviewPanel: React.FC<QuizOverviewPanelProps> = ({ questions, isMobile }) => {
  const statistics = calculateQuizStatistics(questions);
  const questionTypeBreakdown = calculateQuestionTypeBreakdown(questions);

  return (
    <Card className={MAIN_CARD_CLASSES}>
      <CardHeader className={cn(isMobile ? 'pb-4 px-4' : 'pb-6 px-6')}>
        <CardTitle
          className={cn('flex items-center gap-2', isMobile ? TEXT_SIZE_BASE : TEXT_SIZE_LG)}
        >
          <div className={HEADER_ICON_CONTAINER_CLASSES}>
            <BarChart3 className={ICON_SIZE_SMALL} />
          </div>
          クイズ概要
        </CardTitle>
        <p className={cn(isMobile ? TEXT_SIZE_SM : TEXT_SIZE_BASE, 'text-gray-600')}>
          作成したクイズの統計情報を確認できます
        </p>
      </CardHeader>

      <CardContent className={cn(isMobile ? 'px-4' : 'px-6')}>
        <div className="space-y-4">
          <StatisticsGrid statistics={statistics} isMobile={isMobile} />

          <QuestionTypeBreakdown
            questionTypeBreakdown={questionTypeBreakdown}
            isMobile={isMobile}
          />

          <SummaryMessage statistics={statistics} isMobile={isMobile} />
        </div>
      </CardContent>
    </Card>
  );
};
