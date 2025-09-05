'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { BarChart3, Clock, Star, Target, CheckCircle, XCircle } from 'lucide-react';
import { CreateQuestionForm, QuestionType, QUESTION_TYPE_LABELS } from '@/types/quiz';

interface QuizOverviewPanelProps {
  questions: CreateQuestionForm[];
  isMobile: boolean;
}

export const QuizOverviewPanel: React.FC<QuizOverviewPanelProps> = ({ questions, isMobile }) => {
  // Calculate statistics
  const totalQuestions = questions.length;
  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
  const totalTime = questions.reduce(
    (sum, q) => sum + q.show_question_time + q.answering_time + q.show_explanation_time,
    0,
  );

  // Question type breakdown
  const multipleChoiceCount = questions.filter(
    (q) => q.question_type === QuestionType.MULTIPLE_CHOICE,
  ).length;
  const trueFalseCount = questions.filter(
    (q) => q.question_type === QuestionType.TRUE_FALSE,
  ).length;

  // Average points per question
  const averagePoints = totalQuestions > 0 ? Math.round(totalPoints / totalQuestions) : 0;

  // Format time in minutes and seconds
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes}分${remainingSeconds}秒`;
    }
    return `${remainingSeconds}秒`;
  };

  return (
    <Card className="bg-gradient-to-br from-lime-200 to-green-300 border-lime-400 shadow-sm hover:shadow-md">
      <CardHeader className={`${isMobile ? 'pb-4 px-4' : 'pb-6 px-6'}`}>
        <CardTitle className={`flex items-center gap-2 ${isMobile ? 'text-base' : 'text-lg'}`}>
          <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
            <BarChart3 className="w-4 h-4" />
          </div>
          クイズ概要
        </CardTitle>
        <p className={`${isMobile ? 'text-sm' : 'text-base'} text-gray-600`}>
          作成したクイズの統計情報を確認できます
        </p>
      </CardHeader>

      <CardContent className={`${isMobile ? 'px-4' : 'px-6'}`}>
        <div className="space-y-4">
          {/* Main Statistics Grid */}
          <div className={`${isMobile ? 'grid grid-cols-2 gap-4' : 'grid grid-cols-4 gap-6'}`}>
            {/* Total Questions */}
            <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Target className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <div className={`${isMobile ? 'text-base' : 'text-lg'} font-bold text-gray-900`}>
                    {totalQuestions}
                  </div>
                  <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>問題数</div>
                </div>
              </div>
            </div>

            {/* Total Points */}
            <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Star className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <div className={`${isMobile ? 'text-base' : 'text-lg'} font-bold text-gray-900`}>
                    {totalPoints}
                  </div>
                  <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>
                    総ポイント
                  </div>
                </div>
              </div>
            </div>

            {/* Total Time */}
            <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <Clock className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <div className={`${isMobile ? 'text-base' : 'text-lg'} font-bold text-gray-900`}>
                    {formatTime(totalTime)}
                  </div>
                  <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>総時間</div>
                </div>
              </div>
            </div>

            {/* Average Points */}
            <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <div className={`${isMobile ? 'text-base' : 'text-lg'} font-bold text-gray-900`}>
                    {averagePoints}
                  </div>
                  <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>
                    平均ポイント
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Question Types Breakdown */}
          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <h3
              className={`${isMobile ? 'text-sm' : 'text-base'} font-semibold text-gray-900 mb-4`}
            >
              問題タイプ別
            </h3>
            <div className={`${isMobile ? 'space-y-3' : 'grid grid-cols-2 gap-4'}`}>
              <div className="flex items-center justify-between p-3 bg-lime-200 rounded-lg border border-lime-400">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-lime-600" />
                  <span
                    className={`${isMobile ? 'text-sm' : 'text-base'} font-medium text-gray-700`}
                  >
                    {QUESTION_TYPE_LABELS[QuestionType.MULTIPLE_CHOICE]}
                  </span>
                </div>
                <div className={`${isMobile ? 'text-sm' : 'text-base'} font-bold text-lime-600`}>
                  {multipleChoiceCount}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <span
                    className={`${isMobile ? 'text-sm' : 'text-base'} font-medium text-gray-700`}
                  >
                    {QUESTION_TYPE_LABELS[QuestionType.TRUE_FALSE]}
                  </span>
                </div>
                <div className={`${isMobile ? 'text-sm' : 'text-base'} font-bold text-red-600`}>
                  {trueFalseCount}
                </div>
              </div>
            </div>
          </div>

          {/* Summary Message */}
          {totalQuestions > 0 && (
            <div className="bg-gradient-to-r from-lime-200 to-green-200 rounded-lg p-4 border border-lime-500">
              <div className={`${isMobile ? 'text-sm' : 'text-base'} text-gray-700`}>
                <span className="font-semibold text-lime-600">{totalQuestions}問のクイズ</span>
                を作成しました。
                <span className="font-semibold text-green-600">{totalPoints}ポイント</span>
                の総合計で、
                <span className="font-semibold text-orange-600">{formatTime(totalTime)}</span>
                のプレイ時間になります。
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
