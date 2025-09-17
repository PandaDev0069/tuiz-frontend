'use client';

import React from 'react';
import { Badge } from '@/components/ui/data-display/badge';
import { Text } from '@/components/ui/core/typography';
import { cn } from '@/lib/utils';
import { QuizSet } from '@/types/quiz';

interface PreviewQuizSettingsProps {
  quiz: QuizSet;
}

export const PreviewQuizSettings: React.FC<PreviewQuizSettingsProps> = ({ quiz }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-800 mb-6">ゲーム設定</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Text className="font-medium text-blue-700">最大プレイヤー数</Text>
            <Text className="font-bold text-gray-800">{quiz.play_settings.max_players}</Text>
          </div>

          <div className="flex justify-between items-center p-3 bg-green-50 border border-green-200 rounded-lg">
            <Text className="font-medium text-green-700">クイズコード</Text>
            <Text className="font-mono font-bold text-gray-800">{quiz.play_settings.code}</Text>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <Text className="font-medium text-purple-700">問題のみ表示</Text>
            <Badge
              className={cn(
                'text-white border-0 shadow-md',
                quiz.play_settings.show_question_only ? 'bg-green-600' : 'bg-gray-600',
              )}
            >
              {quiz.play_settings.show_question_only ? '有効' : '無効'}
            </Badge>
          </div>

          <div className="flex justify-between items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <Text className="font-medium text-yellow-700">解説表示</Text>
            <Badge
              className={cn(
                'text-white border-0 shadow-md',
                quiz.play_settings.show_explanation ? 'bg-green-600' : 'bg-gray-600',
              )}
            >
              {quiz.play_settings.show_explanation ? '有効' : '無効'}
            </Badge>
          </div>

          <div className="flex justify-between items-center p-3 bg-cyan-50 border border-cyan-200 rounded-lg">
            <Text className="font-medium text-cyan-700">時間ボーナス</Text>
            <Badge
              className={cn(
                'text-white border-0 shadow-md',
                quiz.play_settings.time_bonus ? 'bg-green-600' : 'bg-gray-600',
              )}
            >
              {quiz.play_settings.time_bonus ? '有効' : '無効'}
            </Badge>
          </div>

          <div className="flex justify-between items-center p-3 bg-pink-50 border border-pink-200 rounded-lg">
            <Text className="font-medium text-pink-700">連続正解ボーナス</Text>
            <Badge
              className={cn(
                'text-white border-0 shadow-md',
                quiz.play_settings.streak_bonus ? 'bg-green-600' : 'bg-gray-600',
              )}
            >
              {quiz.play_settings.streak_bonus ? '有効' : '無効'}
            </Badge>
          </div>

          <div className="flex justify-between items-center p-3 bg-teal-50 border border-teal-200 rounded-lg">
            <Text className="font-medium text-teal-700">正解表示</Text>
            <Badge
              className={cn(
                'text-white border-0 shadow-md',
                quiz.play_settings.show_correct_answer ? 'bg-green-600' : 'bg-gray-600',
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
