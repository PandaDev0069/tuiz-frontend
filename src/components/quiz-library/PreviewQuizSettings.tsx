// ====================================================
// File Name   : PreviewQuizSettings.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-17
// Last Update : 2025-09-17
//
// Description:
// - Settings component for quiz preview modal
// - Displays quiz play settings in a grid layout
// - Shows max players and quiz code
// - Displays various game settings with enabled/disabled badges
// - Uses color-coded cards for different setting categories
//
// Notes:
// - Client-only component (requires 'use client')
// - Responsive grid layout adapting to mobile and desktop
// - Uses badges to indicate enabled/disabled states
// ====================================================

'use client';

import React from 'react';
import { Badge } from '@/components/ui/data-display/badge';
import { Text } from '@/components/ui/core/typography';
import { cn } from '@/lib/utils';
import { QuizSet } from '@/types/quiz';

const CONTAINER_SPACING_CLASSES = 'space-y-6';
const TITLE_CLASSES = 'text-xl font-bold text-gray-800 mb-6';
const SETTINGS_GRID_CLASSES = 'grid grid-cols-1 md:grid-cols-2 gap-6';
const SETTINGS_COLUMN_CLASSES = 'space-y-4';
const SETTING_ITEM_BASE_CLASSES = 'flex justify-between items-center p-3 rounded-lg border';
const SETTING_LABEL_BASE_CLASSES = 'font-medium';
const SETTING_VALUE_BASE_CLASSES = 'font-bold text-gray-800';
const SETTING_VALUE_MONO_CLASSES = 'font-mono';

const MAX_PLAYERS_BG_CLASSES = 'bg-blue-50 border-blue-200';
const MAX_PLAYERS_LABEL_CLASSES = 'text-blue-700';
const QUIZ_CODE_BG_CLASSES = 'bg-green-50 border-green-200';
const QUIZ_CODE_LABEL_CLASSES = 'text-green-700';
const SHOW_QUESTION_ONLY_BG_CLASSES = 'bg-purple-50 border-purple-200';
const SHOW_QUESTION_ONLY_LABEL_CLASSES = 'text-purple-700';
const SHOW_EXPLANATION_BG_CLASSES = 'bg-yellow-50 border-yellow-200';
const SHOW_EXPLANATION_LABEL_CLASSES = 'text-yellow-700';
const TIME_BONUS_BG_CLASSES = 'bg-cyan-50 border-cyan-200';
const TIME_BONUS_LABEL_CLASSES = 'text-cyan-700';
const STREAK_BONUS_BG_CLASSES = 'bg-pink-50 border-pink-200';
const STREAK_BONUS_LABEL_CLASSES = 'text-pink-700';
const SHOW_CORRECT_ANSWER_BG_CLASSES = 'bg-teal-50 border-teal-200';
const SHOW_CORRECT_ANSWER_LABEL_CLASSES = 'text-teal-700';

const BADGE_BASE_CLASSES = 'text-white border-0 shadow-md';
const BADGE_ENABLED_CLASSES = 'bg-green-600';
const BADGE_DISABLED_CLASSES = 'bg-gray-600';

interface PreviewQuizSettingsProps {
  quiz: QuizSet;
}

/**
 * Component: PreviewQuizSettings
 * Description:
 * - Settings preview component for quiz preview modal
 * - Displays quiz play settings in a responsive grid layout
 * - Shows max players and quiz code in the first column
 * - Displays various game settings with enabled/disabled badges in the second column
 * - Uses color-coded cards for visual organization
 *
 * Parameters:
 * - quiz (QuizSet): Quiz data containing play settings
 *
 * Returns:
 * - React.ReactElement: The preview quiz settings component
 *
 * Example:
 * ```tsx
 * <PreviewQuizSettings quiz={quiz} />
 * ```
 */
export const PreviewQuizSettings: React.FC<PreviewQuizSettingsProps> = ({ quiz }) => {
  return (
    <div className={CONTAINER_SPACING_CLASSES}>
      <h3 className={TITLE_CLASSES}>ゲーム設定</h3>

      <div className={SETTINGS_GRID_CLASSES}>
        <div className={SETTINGS_COLUMN_CLASSES}>
          <div className={cn(SETTING_ITEM_BASE_CLASSES, MAX_PLAYERS_BG_CLASSES)}>
            <Text className={cn(SETTING_LABEL_BASE_CLASSES, MAX_PLAYERS_LABEL_CLASSES)}>
              最大プレイヤー数
            </Text>
            <Text className={SETTING_VALUE_BASE_CLASSES}>{quiz.play_settings.max_players}</Text>
          </div>

          <div className={cn(SETTING_ITEM_BASE_CLASSES, QUIZ_CODE_BG_CLASSES)}>
            <Text className={cn(SETTING_LABEL_BASE_CLASSES, QUIZ_CODE_LABEL_CLASSES)}>
              クイズコード
            </Text>
            <Text className={cn(SETTING_VALUE_BASE_CLASSES, SETTING_VALUE_MONO_CLASSES)}>
              {quiz.play_settings.code}
            </Text>
          </div>
        </div>

        <div className={SETTINGS_COLUMN_CLASSES}>
          <div className={cn(SETTING_ITEM_BASE_CLASSES, SHOW_QUESTION_ONLY_BG_CLASSES)}>
            <Text className={cn(SETTING_LABEL_BASE_CLASSES, SHOW_QUESTION_ONLY_LABEL_CLASSES)}>
              問題のみ表示
            </Text>
            <Badge
              className={cn(
                BADGE_BASE_CLASSES,
                quiz.play_settings.show_question_only
                  ? BADGE_ENABLED_CLASSES
                  : BADGE_DISABLED_CLASSES,
              )}
            >
              {quiz.play_settings.show_question_only ? '有効' : '無効'}
            </Badge>
          </div>

          <div className={cn(SETTING_ITEM_BASE_CLASSES, SHOW_EXPLANATION_BG_CLASSES)}>
            <Text className={cn(SETTING_LABEL_BASE_CLASSES, SHOW_EXPLANATION_LABEL_CLASSES)}>
              解説表示
            </Text>
            <Badge
              className={cn(
                BADGE_BASE_CLASSES,
                quiz.play_settings.show_explanation
                  ? BADGE_ENABLED_CLASSES
                  : BADGE_DISABLED_CLASSES,
              )}
            >
              {quiz.play_settings.show_explanation ? '有効' : '無効'}
            </Badge>
          </div>

          <div className={cn(SETTING_ITEM_BASE_CLASSES, TIME_BONUS_BG_CLASSES)}>
            <Text className={cn(SETTING_LABEL_BASE_CLASSES, TIME_BONUS_LABEL_CLASSES)}>
              時間ボーナス
            </Text>
            <Badge
              className={cn(
                BADGE_BASE_CLASSES,
                quiz.play_settings.time_bonus ? BADGE_ENABLED_CLASSES : BADGE_DISABLED_CLASSES,
              )}
            >
              {quiz.play_settings.time_bonus ? '有効' : '無効'}
            </Badge>
          </div>

          <div className={cn(SETTING_ITEM_BASE_CLASSES, STREAK_BONUS_BG_CLASSES)}>
            <Text className={cn(SETTING_LABEL_BASE_CLASSES, STREAK_BONUS_LABEL_CLASSES)}>
              連続正解ボーナス
            </Text>
            <Badge
              className={cn(
                BADGE_BASE_CLASSES,
                quiz.play_settings.streak_bonus ? BADGE_ENABLED_CLASSES : BADGE_DISABLED_CLASSES,
              )}
            >
              {quiz.play_settings.streak_bonus ? '有効' : '無効'}
            </Badge>
          </div>

          <div className={cn(SETTING_ITEM_BASE_CLASSES, SHOW_CORRECT_ANSWER_BG_CLASSES)}>
            <Text className={cn(SETTING_LABEL_BASE_CLASSES, SHOW_CORRECT_ANSWER_LABEL_CLASSES)}>
              正解表示
            </Text>
            <Badge
              className={cn(
                BADGE_BASE_CLASSES,
                quiz.play_settings.show_correct_answer
                  ? BADGE_ENABLED_CLASSES
                  : BADGE_DISABLED_CLASSES,
              )}
            >
              {quiz.play_settings.show_correct_answer ? '有効' : '無効'}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};
