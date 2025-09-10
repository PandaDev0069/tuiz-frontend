import { QuestionType, DifficultyLevel } from '@/types/quiz';

export const QUESTION_TYPE_OPTIONS = [
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

export const TIMING_OPTIONS = [
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
];

export const EXPLANATION_TIME_OPTIONS = [
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
];

export const POINTS_OPTIONS = [
  { value: 10, label: '10点' },
  { value: 20, label: '20点' },
  { value: 50, label: '50点' },
  { value: 100, label: '100点' },
  { value: 150, label: '150点' },
  { value: 200, label: '200点' },
  { value: 250, label: '250点' },
  { value: 300, label: '300点' },
];

export const DIFFICULTY_OPTIONS = [
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
