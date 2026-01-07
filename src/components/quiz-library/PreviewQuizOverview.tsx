// ====================================================
// File Name   : PreviewQuizOverview.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-17
// Last Update : 2025-09-17
//
// Description:
// - Overview component for quiz preview modal
// - Displays quiz thumbnail, title, description, and metadata
// - Shows category, difficulty, and public status badges
// - Displays play count and question count statistics
// - Shows tags and creation/update dates
//
// Notes:
// - Client-only component (requires 'use client')
// - Uses Next.js Image component for optimized images
// - Responsive layout adapting to mobile and desktop
// ====================================================

'use client';

import React from 'react';
import { Badge } from '@/components/ui/data-display/badge';
import { Text } from '@/components/ui/core/typography';
import { Globe, Users, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import { QuizSet } from '@/types/quiz';
import { getDifficultyColor, getDifficultyLabel } from '@/lib/quiz-utils';
import Image from 'next/image';

const IMAGE_WIDTH = 300;
const IMAGE_HEIGHT = 200;
const LOCALE_JA_JP = 'ja-JP';

const ICON_SIZE_XSMALL = 'w-3 h-3';
const ICON_SIZE_SMALL = 'w-4 h-4';

const CONTAINER_SPACING_CLASSES = 'space-y-6';
const HEADER_CONTAINER_CLASSES = 'flex flex-col md:flex-row gap-6';
const THUMBNAIL_CONTAINER_CLASSES =
  'w-full md:w-48 h-32 rounded-xl overflow-hidden bg-gradient-to-br from-blue-200 to-teal-200 flex-shrink-0 shadow-lg';
const THUMBNAIL_IMAGE_CLASSES = 'w-full h-full object-cover';
const THUMBNAIL_PLACEHOLDER_CLASSES =
  'w-full h-full flex items-center justify-center text-4xl text-gray-600';
const QUIZ_INFO_CONTAINER_CLASSES = 'flex-1 space-y-4';
const TITLE_CLASSES = 'text-2xl font-bold text-gray-800 mb-2';
const DESCRIPTION_CLASSES = 'text-gray-600 leading-relaxed';
const BADGES_CONTAINER_CLASSES = 'flex flex-wrap gap-2';
const BADGE_BASE_CLASSES = 'text-white border-0 shadow-md';
const BADGE_CATEGORY_CLASSES = 'bg-gray-700';
const STATS_CONTAINER_CLASSES = 'flex flex-wrap gap-4 text-sm';
const STAT_ITEM_BASE_CLASSES = 'flex items-center gap-2 px-3 py-2 rounded-lg';
const STAT_PLAYS_CLASSES = 'bg-blue-100';
const STAT_ICON_BLUE_CLASSES = 'text-blue-600';
const STAT_QUESTIONS_CLASSES = 'bg-purple-100';
const STAT_ICON_PURPLE_CLASSES = 'text-purple-600';
const STAT_TEXT_CLASSES = 'text-gray-800 font-medium';
const TAGS_CONTAINER_CLASSES = 'flex flex-wrap gap-2';
const TAG_BASE_CLASSES =
  'px-3 py-1 bg-gray-700 text-white text-xs rounded-full shadow-md font-medium';
const CREATION_INFO_CONTAINER_CLASSES = 'border-t border-gray-200 pt-4';
const CREATION_INFO_GRID_CLASSES = 'grid grid-cols-1 md:grid-cols-2 gap-4 text-sm';
const CREATION_INFO_ITEM_BASE_CLASSES = 'flex items-center gap-2 px-3 py-2 rounded-lg border';
const CREATION_DATE_CLASSES = 'bg-green-50 border-green-200';
const CREATION_DATE_LABEL_CLASSES = 'text-green-700 font-medium';
const CREATION_DATE_VALUE_CLASSES = 'text-green-800';
const UPDATE_DATE_CLASSES = 'bg-orange-50 border-orange-200';
const UPDATE_DATE_LABEL_CLASSES = 'text-orange-700 font-medium';
const UPDATE_DATE_VALUE_CLASSES = 'text-orange-800';

interface PreviewQuizOverviewProps {
  quiz: QuizSet;
}

/**
 * Component: PreviewQuizOverview
 * Description:
 * - Overview section component for quiz preview modal
 * - Displays comprehensive quiz information including thumbnail, title, description
 * - Shows category, difficulty, and public status badges
 * - Displays statistics (play count, question count)
 * - Shows tags and creation/update dates
 * - Responsive layout adapting to mobile and desktop screens
 *
 * Parameters:
 * - quiz (QuizSet): Quiz data to display
 *
 * Returns:
 * - React.ReactElement: The preview quiz overview component
 *
 * Example:
 * ```tsx
 * <PreviewQuizOverview quiz={quiz} />
 * ```
 */
export const PreviewQuizOverview: React.FC<PreviewQuizOverviewProps> = ({ quiz }) => {
  return (
    <div className={CONTAINER_SPACING_CLASSES}>
      <div className={HEADER_CONTAINER_CLASSES}>
        <div className={THUMBNAIL_CONTAINER_CLASSES}>
          {quiz.thumbnail_url ? (
            <Image
              src={quiz.thumbnail_url}
              alt={quiz.title}
              width={IMAGE_WIDTH}
              height={IMAGE_HEIGHT}
              className={THUMBNAIL_IMAGE_CLASSES}
            />
          ) : (
            <div className={THUMBNAIL_PLACEHOLDER_CLASSES}>📝</div>
          )}
        </div>

        <div className={QUIZ_INFO_CONTAINER_CLASSES}>
          <div>
            <h2 className={TITLE_CLASSES}>{quiz.title}</h2>
            <Text className={DESCRIPTION_CLASSES}>{quiz.description}</Text>
          </div>

          <div className={BADGES_CONTAINER_CLASSES}>
            <Badge className={cn(BADGE_BASE_CLASSES, BADGE_CATEGORY_CLASSES)}>
              {quiz.category}
            </Badge>
            <Badge className={cn(BADGE_BASE_CLASSES, getDifficultyColor(quiz.difficulty_level))}>
              {getDifficultyLabel(quiz.difficulty_level)}
            </Badge>
            {quiz.is_public && (
              <Badge className={cn(BADGE_BASE_CLASSES, BADGE_CATEGORY_CLASSES)}>
                <Globe className={cn(ICON_SIZE_XSMALL, 'mr-1')} />
                公開
              </Badge>
            )}
          </div>

          <div className={STATS_CONTAINER_CLASSES}>
            <div className={cn(STAT_ITEM_BASE_CLASSES, STAT_PLAYS_CLASSES)}>
              <Users className={cn(ICON_SIZE_SMALL, STAT_ICON_BLUE_CLASSES)} />
              <span className={STAT_TEXT_CLASSES}>{quiz.times_played} 回プレイ</span>
            </div>
            <div className={cn(STAT_ITEM_BASE_CLASSES, STAT_QUESTIONS_CLASSES)}>
              <Award className={cn(ICON_SIZE_SMALL, STAT_ICON_PURPLE_CLASSES)} />
              <span className={STAT_TEXT_CLASSES}>{quiz.total_questions} 問</span>
            </div>
          </div>

          {quiz.tags.length > 0 && (
            <div className={TAGS_CONTAINER_CLASSES}>
              {quiz.tags.map((tag, index) => (
                <span key={index} className={TAG_BASE_CLASSES}>
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={CREATION_INFO_CONTAINER_CLASSES}>
        <div className={CREATION_INFO_GRID_CLASSES}>
          <div className={cn(CREATION_INFO_ITEM_BASE_CLASSES, CREATION_DATE_CLASSES)}>
            <span className={CREATION_DATE_LABEL_CLASSES}>作成日:</span>
            <span className={CREATION_DATE_VALUE_CLASSES}>
              {new Date(quiz.created_at).toLocaleDateString(LOCALE_JA_JP)}
            </span>
          </div>
          <div className={cn(CREATION_INFO_ITEM_BASE_CLASSES, UPDATE_DATE_CLASSES)}>
            <span className={UPDATE_DATE_LABEL_CLASSES}>更新日:</span>
            <span className={UPDATE_DATE_VALUE_CLASSES}>
              {new Date(quiz.updated_at).toLocaleDateString(LOCALE_JA_JP)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
