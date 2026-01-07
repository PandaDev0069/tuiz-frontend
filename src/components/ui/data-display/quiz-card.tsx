// ====================================================
// File Name   : quiz-card.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-08-24
// Last Update : 2025-12-22
//
// Description:
// - Quiz card component for displaying quiz information
// - Shows thumbnail, title, description, stats, and action buttons
// - Supports edit, start, and delete actions
// - Displays different buttons based on quiz status (draft vs published)
//
// Notes:
// - Server and client compatible (no 'use client' directive)
// - Uses Next.js Image component for optimized images
// - Supports loading states for actions
// ====================================================

import React from 'react';
import { Card, CardContent, CardFooter, CardTitle } from '../core/card';
import { Button } from '../core/button';
import { Text } from '../core/typography';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { QuizSet, QuizStatus } from '@/types/quiz';
import { Edit3, Play, Trash2, Flame, Globe, Lock, Loader2 } from 'lucide-react';

const DEFAULT_IS_DELETING = false;
const DEFAULT_IS_STARTING = false;

const CARD_VARIANT = 'glass';
const THUMBNAIL_WIDTH = 400;
const THUMBNAIL_HEIGHT = 300;

const LOCALE_JA_JP = 'ja-JP';

const DIFFICULTY_EASY = 'easy';
const DIFFICULTY_MEDIUM = 'medium';
const DIFFICULTY_HARD = 'hard';

export interface QuizCardProps {
  quiz: QuizSet;
  onEdit?: (id: string) => void;
  onStart?: (id: string) => void;
  onDelete?: (id: string) => void;
  isDeleting?: boolean;
  isStarting?: boolean;
  className?: string;
}

/**
 * Function: getThumbnailAltText
 * Description:
 * - Generates alt text for quiz thumbnail image
 * - Uses quiz title in the alt text
 *
 * Parameters:
 * - title (string): Quiz title
 *
 * Returns:
 * - string: Alt text for thumbnail image
 *
 * Example:
 * ```ts
 * const alt = getThumbnailAltText('My Quiz');
 * // Returns "My Quiz thumbnail"
 * ```
 */
const getThumbnailAltText = (title: string): string => {
  return `${title} thumbnail`;
};

/**
 * Function: getDifficultyLabel
 * Description:
 * - Returns Japanese label for difficulty level
 * - Maps English difficulty values to Japanese labels
 *
 * Parameters:
 * - difficulty (string): Difficulty level (easy, medium, hard, or other)
 *
 * Returns:
 * - string: Japanese difficulty label
 *
 * Example:
 * ```ts
 * const label = getDifficultyLabel('easy');
 * // Returns "簡単"
 * ```
 */
const getDifficultyLabel = (difficulty: string): string => {
  if (difficulty === DIFFICULTY_EASY) {
    return '簡単';
  }
  if (difficulty === DIFFICULTY_MEDIUM) {
    return '普通';
  }
  if (difficulty === DIFFICULTY_HARD) {
    return '難しい';
  }
  return 'エキスパート';
};

/**
 * Function: formatCreationDate
 * Description:
 * - Formats creation date to Japanese locale format
 * - Converts date string to localized date string
 *
 * Parameters:
 * - dateString (string): ISO date string
 *
 * Returns:
 * - string: Formatted date string in Japanese locale
 *
 * Example:
 * ```ts
 * const date = formatCreationDate('2025-01-01');
 * // Returns localized date string
 * ```
 */
const formatCreationDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString(LOCALE_JA_JP);
};

/**
 * Component: QuizCard
 * Description:
 * - Quiz card component for displaying quiz information
 * - Shows thumbnail, title, description, category, difficulty, and stats
 * - Displays action buttons (edit, start, delete) based on quiz status
 * - Supports loading states for delete and start actions
 * - Shows different button sets for draft vs published quizzes
 *
 * Parameters:
 * - quiz (QuizSet): Quiz data object
 * - onEdit (function, optional): Callback when edit button is clicked
 * - onStart (function, optional): Callback when start button is clicked
 * - onDelete (function, optional): Callback when delete button is clicked
 * - isDeleting (boolean, optional): Whether delete action is in progress (default: false)
 * - isStarting (boolean, optional): Whether start action is in progress (default: false)
 * - className (string, optional): Additional CSS classes
 *
 * Returns:
 * - React.ReactElement: The quiz card component
 *
 * Example:
 * ```tsx
 * <QuizCard
 *   quiz={quizData}
 *   onEdit={(id) => router.push(`/edit/${id}`)}
 *   onStart={(id) => startGame(id)}
 *   onDelete={(id) => deleteQuiz(id)}
 * />
 * ```
 */
export const QuizCard: React.FC<QuizCardProps> = ({
  quiz,
  onEdit,
  onStart,
  onDelete,
  isDeleting = DEFAULT_IS_DELETING,
  isStarting = DEFAULT_IS_STARTING,
  className,
}) => {
  const handleEdit = (): void => {
    onEdit?.(quiz.id);
  };

  const handleStart = (): void => {
    onStart?.(quiz.id);
  };

  const handleDelete = (): void => {
    onDelete?.(quiz.id);
  };

  return (
    <Card
      variant={CARD_VARIANT}
      className={cn(
        'w-full max-w-sm h-96 transition-all duration-200 hover:scale-101 flex flex-col p-4 sm:p-6',
        className,
      )}
    >
      <div className="relative w-full h-20 sm:h-20 md:h-20 overflow-hidden rounded-2xl">
        {quiz.thumbnail_url ? (
          <Image
            src={quiz.thumbnail_url}
            alt={getThumbnailAltText(quiz.title)}
            className="w-full h-full object-cover"
            width={THUMBNAIL_WIDTH}
            height={THUMBNAIL_HEIGHT}
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center overflow-hidden">
            <div className="text-lg sm:text-2xl md:text-3xl lg:text-4xl text-gray-400">📝</div>
          </div>
        )}
      </div>

      <CardContent className="pb-4 py-2 flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-2 gap-2">
          <div className="flex items-center gap-1 px-1.5 py-0.5 bg-blue-100 rounded-full min-w-0">
            <span className="text-xs text-blue-700 font-medium truncate">{quiz.category}</span>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {quiz.is_public ? (
              <div className="flex items-center gap-1 px-1.5 py-0.5 bg-green-100 rounded-full">
                <Globe className={cn('w-2.5 h-2.5 text-green-600')} />
                <span className="text-xs text-green-700 font-medium">公開</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 px-1.5 py-0.5 bg-red-100 rounded-full">
                <Lock className={cn('w-2.5 h-2.5 text-red-600')} />
                <span className="text-xs text-red-700 font-medium">非公開</span>
              </div>
            )}
          </div>
        </div>

        <div className="text-xs text-muted-foreground mb-3">
          作成日 {formatCreationDate(quiz.created_at)}
        </div>

        <CardTitle className="text-lg font-bold text-foreground mb-2 line-clamp-2">
          {quiz.title}
        </CardTitle>

        <div className="h-20 mb-4 overflow-hidden">
          <Text className="text-sm text-muted-foreground line-clamp-3">{quiz.description}</Text>
        </div>

        <div className="flex items-center gap-2 mb-4 flex-wrap overflow-hidden">
          <span className="px-1.5 py-0.5 text-xs font-medium rounded-full text-white bg-purple-400 flex-shrink-0 leading-tight">
            {getDifficultyLabel(quiz.difficulty_level)}
          </span>

          <span className="px-1.5 py-0.5 text-xs font-medium rounded-full text-white bg-teal-400 flex-shrink-0 leading-tight">
            {quiz.total_questions} 問
          </span>

          {quiz.status === QuizStatus.PUBLISHED && (
            <div className="flex items-center gap-1 text-xs text-orange-500 font-medium flex-shrink-0 leading-tight">
              <Flame className={cn('w-2.5 h-2.5')} />
              プレイ {quiz.times_played}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex gap-0.5 sm:gap-2 pt-0 mt-auto">
        {quiz.status === QuizStatus.DRAFT ? (
          <>
            <Button
              variant="gradient2"
              size="sm"
              onClick={handleEdit}
              disabled={isDeleting}
              className="flex-1 text-[10px] sm:text-sm px-1 sm:px-3"
            >
              <Edit3 className={cn('w-2.5 h-2.5 sm:w-4 sm:h-4 mr-0.5 sm:mr-1')} />
              編集
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 bg-red-400 hover:bg-red-500 text-white text-[10px] sm:text-sm px-1 sm:px-3"
            >
              {isDeleting ? (
                <Loader2 className={cn('w-2.5 h-2.5 sm:w-4 sm:h-4 mr-0.5 sm:mr-1 animate-spin')} />
              ) : (
                <Trash2 className={cn('w-2.5 h-2.5 sm:w-4 sm:h-4 mr-0.5 sm:mr-1')} />
              )}
              削除
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="gradient2"
              size="sm"
              onClick={handleEdit}
              disabled={isDeleting}
              className="flex-1 hover:from-purple-500 hover:to-pink-500 hover:shadow-lg hover:transform-none text-[10px] sm:text-sm px-1 sm:px-3"
            >
              <Edit3 className={cn('w-2.5 h-2.5 sm:w-4 sm:h-4 mr-0.5 sm:mr-1')} />
              編集
            </Button>
            <Button
              size="sm"
              onClick={handleStart}
              disabled={isDeleting || isStarting}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg text-[10px] sm:text-sm px-1 sm:px-3"
            >
              {isStarting ? (
                <Loader2 className={cn('w-2.5 h-2.5 sm:w-4 sm:h-4 mr-0.5 sm:mr-1 animate-spin')} />
              ) : (
                <Play className={cn('w-2.5 h-2.5 sm:w-4 sm:h-4 mr-0.5 sm:mr-1')} />
              )}
              ゲーム開始
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 bg-red-400 hover:bg-red-500 text-white text-[10px] sm:text-sm px-1 sm:px-3"
            >
              {isDeleting ? (
                <Loader2 className={cn('w-2.5 h-2.5 sm:w-4 sm:h-4 mr-0.5 sm:mr-1 animate-spin')} />
              ) : (
                <Trash2 className={cn('w-2.5 h-2.5 sm:w-4 sm:h-4 mr-0.5 sm:mr-1')} />
              )}
              削除
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
};
