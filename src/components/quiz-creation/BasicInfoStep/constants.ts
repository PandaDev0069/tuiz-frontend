// ====================================================
// File Name   : constants.ts
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-03
// Last Update : 2025-09-03
//
// Description:
// - Constants for the BasicInfoStep component in quiz creation
// - Defines difficulty level options with labels, descriptions, and styling
// - Defines category options for quiz categorization
//
// Notes:
// - Difficulty options include color classes for UI styling
// - Category options are simple string arrays
// ====================================================

import { DifficultyLevel } from '@/types/quiz';

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
 * Array of difficulty level options for quiz creation.
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

/**
 * Array of category options for quiz categorization.
 * Used in quiz creation form for selecting quiz categories.
 *
 * @constant
 * @type {string[]}
 *
 * @example
 * ```tsx
 * CATEGORY_OPTIONS.map(category => (
 *   <Option key={category} value={category}>
 *     {category}
 *   </Option>
 * ))
 * ```
 */
export const CATEGORY_OPTIONS: readonly string[] = [
  '一般知識',
  'プログラミング',
  '科学',
  '数学',
  '歴史',
  '地理',
  '文学',
  'テクノロジー',
  'スポーツ',
  'エンターテイメント',
  '言語',
  '芸術・文化',
  'ビジネス',
  '健康・医学',
  'その他',
] as const;
