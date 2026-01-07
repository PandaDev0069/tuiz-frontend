// ====================================================
// File Name   : constants.ts
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-04
// Last Update : 2025-09-04
//
// Description:
// - Constants for the QuestionCreationStep component
// - Defines question type options, timing options, explanation time options
// - Defines points options and difficulty level options
// - Used in quiz question creation forms
//
// Notes:
// - Question type options include icons and color classes for UI styling
// - Timing and points options are simple value-label pairs
// - Difficulty options include color classes for visual distinction
// ====================================================

import { QuestionType, DifficultyLevel } from '@/types/quiz';

/**
 * Question type option configuration interface.
 */
interface QuestionTypeOption {
  value: QuestionType;
  label: string;
  description: string;
  icon: string;
  color: string;
}

/**
 * Simple option configuration interface.
 */
interface SimpleOption {
  value: number;
  label: string;
}

/**
 * Difficulty option configuration interface.
 */
interface DifficultyOption {
  value: DifficultyLevel;
  label: string;
  description: string;
  color: string;
}

/**
 * Array of question type options for quiz question creation.
 * Each option includes a value, label, description, icon name, and Tailwind CSS color classes.
 *
 * @constant
 * @type {QuestionTypeOption[]}
 *
 * @example
 * ```tsx
 * QUESTION_TYPE_OPTIONS.map(option => (
 *   <Option key={option.value} value={option.value}>
 *     {option.label}
 *   </Option>
 * ))
 * ```
 */
export const QUESTION_TYPE_OPTIONS: QuestionTypeOption[] = [
  {
    value: QuestionType.MULTIPLE_CHOICE,
    label: 'Multiple Choice',
    description: '複数選択問題',
    icon: 'CheckSquare',
    color: 'text-blue-600 bg-yellow-500 border-yellow-200',
  },
  {
    value: QuestionType.TRUE_FALSE,
    label: 'True/False',
    description: '正誤問題',
    icon: 'CheckCircle',
    color: 'text-green-600 bg-yellow-500 border-yellow-200',
  },
];

/**
 * Array of timing options (in seconds) for quiz questions.
 * Used for setting question time limits.
 *
 * @constant
 * @type {SimpleOption[]}
 *
 * @example
 * ```tsx
 * TIMING_OPTIONS.map(option => (
 *   <Option key={option.value} value={option.value}>
 *     {option.label}
 *   </Option>
 * ))
 * ```
 */
export const TIMING_OPTIONS: readonly SimpleOption[] = [
  { value: 5, label: '5秒' },
  { value: 10, label: '10秒' },
  { value: 15, label: '15秒' },
  { value: 20, label: '20秒' },
  { value: 25, label: '25秒' },
  { value: 30, label: '30秒' },
  { value: 35, label: '35秒' },
  { value: 40, label: '40秒' },
  { value: 45, label: '45秒' },
  { value: 50, label: '50秒' },
  { value: 55, label: '55秒' },
  { value: 60, label: '60秒' },
] as const;

/**
 * Array of explanation time options (in seconds) for quiz questions.
 * Used for setting explanation display duration.
 *
 * @constant
 * @type {SimpleOption[]}
 *
 * @example
 * ```tsx
 * EXPLANATION_TIME_OPTIONS.map(option => (
 *   <Option key={option.value} value={option.value}>
 *     {option.label}
 *   </Option>
 * ))
 * ```
 */
export const EXPLANATION_TIME_OPTIONS: readonly SimpleOption[] = [
  { value: 10, label: '10秒' },
  { value: 15, label: '15秒' },
  { value: 20, label: '20秒' },
  { value: 25, label: '25秒' },
  { value: 30, label: '30秒' },
  { value: 45, label: '45秒' },
  { value: 60, label: '1分' },
  { value: 75, label: '1分15秒' },
  { value: 90, label: '1分30秒' },
  { value: 105, label: '1分45秒' },
  { value: 120, label: '2分' },
] as const;

/**
 * Array of points options for quiz questions.
 * Used for setting question point values.
 *
 * @constant
 * @type {SimpleOption[]}
 *
 * @example
 * ```tsx
 * POINTS_OPTIONS.map(option => (
 *   <Option key={option.value} value={option.value}>
 *     {option.label}
 *   </Option>
 * ))
 * ```
 */
export const POINTS_OPTIONS: readonly SimpleOption[] = [
  { value: 10, label: '10点' },
  { value: 20, label: '20点' },
  { value: 50, label: '50点' },
  { value: 100, label: '100点' },
  { value: 150, label: '150点' },
  { value: 200, label: '200点' },
  { value: 250, label: '250点' },
  { value: 300, label: '300点' },
] as const;

/**
 * Array of difficulty level options for quiz questions.
 * Each option includes a value, label, description, and Tailwind CSS color classes.
 *
 * @constant
 * @type {DifficultyOption[]}
 *
 * @example
 * ```tsx
 * DIFFICULTY_OPTIONS.map(option => (
 *   <Option key={option.value} value={option.value}>
 *     {option.label}
 *   </Option>
 * ))
 * ```
 */
export const DIFFICULTY_OPTIONS: DifficultyOption[] = [
  {
    value: DifficultyLevel.EASY,
    label: '簡単',
    description: '初心者向け',
    color: 'text-green-600 bg-green-50 border-green-200',
  },
  {
    value: DifficultyLevel.MEDIUM,
    label: '普通',
    description: '中級者向け',
    color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  },
  {
    value: DifficultyLevel.HARD,
    label: '難しい',
    description: '上級者向け',
    color: 'text-orange-600 bg-orange-50 border-orange-200',
  },
  {
    value: DifficultyLevel.EXPERT,
    label: 'エキスパート',
    description: 'エキスパート向け',
    color: 'text-red-600 bg-red-50 border-red-200',
  },
];
