'use client';

import React from 'react';
import { Badge } from '@/components/ui/data-display/badge';
import { Text } from '@/components/ui/core/typography';
import { Globe, Users, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import { QuizSet } from '@/types/quiz';
import { getDifficultyColor, getDifficultyLabel } from '@/lib/quiz-utils';
import Image from 'next/image';

interface PreviewQuizOverviewProps {
  quiz: QuizSet;
}

export const PreviewQuizOverview: React.FC<PreviewQuizOverviewProps> = ({ quiz }) => {
  return (
    <div className="space-y-6">
      {/* Quiz Header */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Thumbnail */}
        <div className="w-full md:w-48 h-32 rounded-xl overflow-hidden bg-gradient-to-br from-blue-200 to-teal-200 flex-shrink-0 shadow-lg">
          {quiz.thumbnail_url ? (
            <Image
              src={quiz.thumbnail_url}
              alt={quiz.title}
              width={300}
              height={200}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl text-gray-600">
              📝
            </div>
          )}
        </div>

        {/* Quiz Info */}
        <div className="flex-1 space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{quiz.title}</h2>
            <Text className="text-gray-600 leading-relaxed">{quiz.description}</Text>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-gray-700 text-white border-0 shadow-md">{quiz.category}</Badge>
            <Badge
              className={cn(
                'text-white border-0 shadow-md',
                getDifficultyColor(quiz.difficulty_level),
              )}
            >
              {getDifficultyLabel(quiz.difficulty_level)}
            </Badge>
            {quiz.is_public && (
              <Badge className="bg-gray-700 text-white border-0 shadow-md">
                <Globe className="w-3 h-3 mr-1" />
                公開
              </Badge>
            )}
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-100 rounded-lg">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-gray-800 font-medium">{quiz.times_played} 回プレイ</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-purple-100 rounded-lg">
              <Award className="w-4 h-4 text-purple-600" />
              <span className="text-gray-800 font-medium">{quiz.total_questions} 問</span>
            </div>
          </div>

          {/* Tags */}
          {quiz.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {quiz.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-700 text-white text-xs rounded-full shadow-md font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Creation Info */}
      <div className="border-t border-gray-200 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
            <span className="text-green-700 font-medium">作成日:</span>
            <span className="text-green-800">
              {new Date(quiz.created_at).toLocaleDateString('ja-JP')}
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg">
            <span className="text-orange-700 font-medium">更新日:</span>
            <span className="text-orange-800">
              {new Date(quiz.updated_at).toLocaleDateString('ja-JP')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
