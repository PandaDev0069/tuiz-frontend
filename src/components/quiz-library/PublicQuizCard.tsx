// ====================================================
// File Name   : PublicQuizCard.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-17
// Last Update : 2025-09-17
//
// Description:
// - Card component for displaying public quiz in browse view
// - Shows quiz thumbnail, title, description, and metadata
// - Displays category, difficulty, question count, and play count
// - Provides preview and clone action buttons
// - Shows loading state during clone operation
//
// Notes:
// - Client-only component (requires 'use client')
// - Uses Next.js Image component for optimized images
// - Responsive design adapting to mobile and desktop
// ====================================================

'use client';

import React from 'react';
import { Card, CardContent, CardFooter, CardTitle } from '@/components/ui/core/card';
import { Button } from '@/components/ui/core/button';
import { Text } from '@/components/ui/core/typography';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { QuizSet, QuizStatus } from '@/types/quiz';
import { Copy, Eye, Flame, Globe, Loader2 } from 'lucide-react';

const IMAGE_WIDTH = 400;
const IMAGE_HEIGHT = 300;
const LOCALE_JA_JP = 'ja-JP';

const DIFFICULTY_EASY = 'easy';
const DIFFICULTY_MEDIUM = 'medium';
const DIFFICULTY_HARD = 'hard';

const ICON_SIZE_XSMALL = 'w-2.5 h-2.5';
const ICON_SIZE_RESPONSIVE = 'w-2.5 h-2.5 sm:w-4 sm:h-4';
const ICON_MARGIN_RESPONSIVE = 'mr-0.5 sm:mr-1';

const CARD_VARIANT_GLASS = 'glass';
const CARD_BASE_CLASSES =
  'w-full max-w-sm h-96 transition-all duration-200 hover:scale-101 flex flex-col p-4 sm:p-6';
const THUMBNAIL_CONTAINER_CLASSES =
  'relative w-full h-20 sm:h-20 md:h-20 overflow-hidden rounded-2xl';
const THUMBNAIL_IMAGE_CLASSES = 'w-full h-full object-cover';
const THUMBNAIL_PLACEHOLDER_CLASSES =
  'w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center overflow-hidden';
const THUMBNAIL_PLACEHOLDER_ICON_CLASSES =
  'text-lg sm:text-2xl md:text-3xl lg:text-4xl text-gray-400';

const CARD_CONTENT_CLASSES = 'pb-4 py-2 flex-1 flex flex-col overflow-hidden';
const BADGES_CONTAINER_CLASSES = 'flex items-center justify-between mb-2 gap-2';
const CATEGORY_BADGE_CLASSES =
  'flex items-center gap-1 px-1.5 py-0.5 bg-blue-100 rounded-full min-w-0';
const CATEGORY_BADGE_TEXT_CLASSES = 'text-xs text-blue-700 font-medium truncate';
const PUBLIC_BADGE_CLASSES =
  'flex items-center gap-1 px-1.5 py-0.5 bg-green-100 rounded-full flex-shrink-0';
const PUBLIC_ICON_CLASSES = 'text-green-600';
const PUBLIC_BADGE_TEXT_CLASSES = 'text-xs text-green-700 font-medium';

const CREATION_DATE_CLASSES = 'text-xs text-muted-foreground mb-3';
const TITLE_CLASSES = 'text-lg font-bold text-foreground mb-2 line-clamp-2';
const DESCRIPTION_CONTAINER_CLASSES = 'h-20 mb-4 overflow-hidden';
const DESCRIPTION_TEXT_CLASSES = 'text-sm text-muted-foreground line-clamp-3';

const STATS_CONTAINER_CLASSES = 'flex items-center gap-2 mb-4 flex-wrap overflow-hidden';
const DIFFICULTY_BADGE_CLASSES =
  'px-1.5 py-0.5 text-xs font-medium rounded-full text-white bg-purple-400 flex-shrink-0 leading-tight';
const QUESTION_COUNT_BADGE_CLASSES =
  'px-1.5 py-0.5 text-xs font-medium rounded-full text-white bg-teal-400 flex-shrink-0 leading-tight';
const PLAY_COUNT_CONTAINER_CLASSES =
  'flex items-center gap-1 text-xs text-orange-500 font-medium flex-shrink-0 leading-tight';

const FOOTER_CLASSES = 'flex gap-0.5 sm:gap-2 pt-0 mt-auto';
const BUTTON_SIZE_SM = 'sm';
const PREVIEW_BUTTON_CLASSES =
  'flex-1 bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg text-[10px] sm:text-sm px-1 sm:px-3';
const BUTTON_VARIANT_GRADIENT = 'gradient';
const CLONE_BUTTON_CLASSES = 'flex-1 text-[10px] sm:text-sm px-1 sm:px-3';
const CLONE_SPINNER_CLASSES = 'animate-spin';

export interface PublicQuizCardProps {
  quiz: QuizSet;
  onClone?: (id: string) => void;
  onPreview?: (id: string) => void;
  isCloning?: boolean;
  className?: string;
}

/**
 * Function: getDifficultyLabel
 * Description:
 * - Maps difficulty level to Japanese label
 *
 * Parameters:
 * - difficulty (string): Difficulty level value
 *
 * Returns:
 * - string: Japanese label for the difficulty
 *
 * Example:
 * ```ts
 * getDifficultyLabel('easy'); // Returns '簡単'
 * ```
 */
const getDifficultyLabel = (difficulty: string): string => {
  switch (difficulty) {
    case DIFFICULTY_EASY:
      return '簡単';
    case DIFFICULTY_MEDIUM:
      return '普通';
    case DIFFICULTY_HARD:
      return '難しい';
    default:
      return 'エキスパート';
  }
};

/**
 * Component: PublicQuizCard
 * Description:
 * - Card component for displaying public quiz in browse view
 * - Shows quiz thumbnail with fallback placeholder
 * - Displays category, public status, creation date
 * - Shows quiz title, description, difficulty, question count, and play count
 * - Provides preview and clone action buttons
 * - Shows loading spinner during clone operation
 *
 * Parameters:
 * - quiz (QuizSet): Quiz data to display
 * - onClone (function, optional): Callback when clone button is clicked
 * - onPreview (function, optional): Callback when preview button is clicked
 * - isCloning (boolean, optional): Whether clone operation is in progress
 * - className (string, optional): Additional CSS classes
 *
 * Returns:
 * - React.ReactElement: The public quiz card component
 *
 * Example:
 * ```tsx
 * <PublicQuizCard
 *   quiz={quiz}
 *   onClone={(id) => handleClone(id)}
 *   onPreview={(id) => handlePreview(id)}
 *   isCloning={false}
 * />
 * ```
 */
export const PublicQuizCard: React.FC<PublicQuizCardProps> = ({
  quiz,
  onClone,
  onPreview,
  isCloning = false,
  className,
}) => {
  const handleClone = () => onClone?.(quiz.id);
  const handlePreview = () => onPreview?.(quiz.id);

  return (
    <Card variant={CARD_VARIANT_GLASS} className={cn(CARD_BASE_CLASSES, className)}>
      <div className={THUMBNAIL_CONTAINER_CLASSES}>
        {quiz.thumbnail_url ? (
          <Image
            src={quiz.thumbnail_url}
            alt={`${quiz.title} thumbnail`}
            className={THUMBNAIL_IMAGE_CLASSES}
            width={IMAGE_WIDTH}
            height={IMAGE_HEIGHT}
            priority
          />
        ) : (
          <div className={THUMBNAIL_PLACEHOLDER_CLASSES}>
            <div className={THUMBNAIL_PLACEHOLDER_ICON_CLASSES}>📝</div>
          </div>
        )}
      </div>

      <CardContent className={CARD_CONTENT_CLASSES}>
        <div className={BADGES_CONTAINER_CLASSES}>
          <div className={CATEGORY_BADGE_CLASSES}>
            <span className={CATEGORY_BADGE_TEXT_CLASSES}>{quiz.category}</span>
          </div>
          <div className={PUBLIC_BADGE_CLASSES}>
            <Globe className={cn(ICON_SIZE_XSMALL, PUBLIC_ICON_CLASSES)} />
            <span className={PUBLIC_BADGE_TEXT_CLASSES}>公開</span>
          </div>
        </div>

        <div className={CREATION_DATE_CLASSES}>
          作成日 {new Date(quiz.created_at).toLocaleDateString(LOCALE_JA_JP)}
        </div>

        <CardTitle className={TITLE_CLASSES}>{quiz.title}</CardTitle>

        <div className={DESCRIPTION_CONTAINER_CLASSES}>
          <Text className={DESCRIPTION_TEXT_CLASSES}>{quiz.description}</Text>
        </div>

        <div className={STATS_CONTAINER_CLASSES}>
          <span className={DIFFICULTY_BADGE_CLASSES}>
            {getDifficultyLabel(quiz.difficulty_level)}
          </span>

          <span className={QUESTION_COUNT_BADGE_CLASSES}>{quiz.total_questions} 問</span>

          {quiz.status === QuizStatus.PUBLISHED && (
            <div className={PLAY_COUNT_CONTAINER_CLASSES}>
              <Flame className={ICON_SIZE_XSMALL} />
              プレイ {quiz.times_played}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className={FOOTER_CLASSES}>
        <Button
          size={BUTTON_SIZE_SM}
          onClick={handlePreview}
          disabled={isCloning}
          className={PREVIEW_BUTTON_CLASSES}
        >
          <Eye className={cn(ICON_SIZE_RESPONSIVE, ICON_MARGIN_RESPONSIVE)} />
          プレビュー
        </Button>
        <Button
          variant={BUTTON_VARIANT_GRADIENT}
          size={BUTTON_SIZE_SM}
          onClick={handleClone}
          disabled={isCloning}
          className={CLONE_BUTTON_CLASSES}
        >
          {isCloning ? (
            <Loader2
              className={cn(ICON_SIZE_RESPONSIVE, ICON_MARGIN_RESPONSIVE, CLONE_SPINNER_CLASSES)}
            />
          ) : (
            <Copy className={cn(ICON_SIZE_RESPONSIVE, ICON_MARGIN_RESPONSIVE)} />
          )}
          クローン
        </Button>
      </CardFooter>
    </Card>
  );
};
