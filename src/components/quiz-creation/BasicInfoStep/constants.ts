import { DifficultyLevel } from '@/types/quiz';

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

export const CATEGORY_OPTIONS = [
  '一般知識',
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
];
