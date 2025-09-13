import React from 'react';
import { Card, CardContent, CardFooter, CardTitle } from '../core/card';
import { Button } from '../core/button';
import { Text } from '../core/typography';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { QuizSet, QuizStatus } from '@/types/quiz';
import { Edit3, Play, Trash2, Flame, Globe, Lock, Loader2 } from 'lucide-react';

export interface QuizCardProps {
  quiz: QuizSet;
  onEdit?: (id: string) => void;
  onStart?: (id: string) => void;
  onDelete?: (id: string) => void;
  isDeleting?: boolean;
  className?: string;
}

export const QuizCard: React.FC<QuizCardProps> = ({
  quiz,
  onEdit,
  onStart,
  onDelete,
  isDeleting = false,
  className,
}) => {
  const handleEdit = () => onEdit?.(quiz.id);
  const handleStart = () => onStart?.(quiz.id);
  const handleDelete = () => onDelete?.(quiz.id);

  return (
    <Card
      variant="glass"
      className={cn(
        'w-full max-w-sm h-96 transition-all duration-200 hover:scale-101 flex flex-col p-4 sm:p-6',
        className,
      )}
    >
      {/* Quiz Thumbnail */}
      <div className="relative w-full h-20 sm:h-20 md:h-20 overflow-hidden rounded-2xl">
        {quiz.thumbnail_url ? (
          <Image
            src={quiz.thumbnail_url}
            alt={`${quiz.title} thumbnail`}
            className="w-full h-full object-cover"
            width={400}
            height={300}
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center overflow-hidden">
            <div className="text-lg sm:text-2xl md:text-3xl lg:text-4xl text-gray-400">📝</div>
          </div>
        )}
      </div>

      {/* Quiz Content - Flex grow to fill available space */}
      <CardContent className="pb-4 py-2 flex-1 flex flex-col overflow-hidden">
        {/* Category and Public/Private Status */}
        <div className="flex items-center justify-between mb-2 gap-2">
          <div className="flex items-center gap-1 px-1.5 py-0.5 bg-blue-100 rounded-full min-w-0">
            <span className="text-xs text-blue-700 font-medium truncate">{quiz.category}</span>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {quiz.is_public ? (
              <div className="flex items-center gap-1 px-1.5 py-0.5 bg-green-100 rounded-full">
                <Globe className="w-2.5 h-2.5 text-green-600" />
                <span className="text-xs text-green-700 font-medium">公開</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 px-1.5 py-0.5 bg-red-100 rounded-full">
                <Lock className="w-2.5 h-2.5 text-red-600" />
                <span className="text-xs text-red-700 font-medium">非公開</span>
              </div>
            )}
          </div>
        </div>

        {/* Creation Date */}
        <div className="text-xs text-muted-foreground mb-3">
          作成日 {new Date(quiz.created_at).toLocaleDateString('ja-JP')}
        </div>

        {/* Quiz Title */}
        <CardTitle className="text-lg font-bold text-foreground mb-2 line-clamp-2">
          {quiz.title}
        </CardTitle>

        {/* Description */}
        <div className="h-20 mb-4 overflow-hidden">
          <Text className="text-sm text-muted-foreground line-clamp-3">{quiz.description}</Text>
        </div>

        {/* Quiz Stats Row */}
        <div className="flex items-center gap-2 mb-4 flex-wrap overflow-hidden">
          {/* Difficulty Badge */}
          <span className="px-1.5 py-0.5 text-xs font-medium rounded-full text-white bg-purple-400 flex-shrink-0 leading-tight">
            {quiz.difficulty_level === 'easy'
              ? '簡単'
              : quiz.difficulty_level === 'medium'
                ? '普通'
                : quiz.difficulty_level === 'hard'
                  ? '難しい'
                  : 'エキスパート'}
          </span>

          {/* Question Count Badge */}
          <span className="px-1.5 py-0.5 text-xs font-medium rounded-full text-white bg-teal-400 flex-shrink-0 leading-tight">
            {quiz.total_questions} 問
          </span>

          {/* Play Count - Only show for published quizzes */}
          {quiz.status === QuizStatus.PUBLISHED && (
            <div className="flex items-center gap-1 text-xs text-orange-500 font-medium flex-shrink-0 leading-tight">
              <Flame className="w-2.5 h-2.5" />
              プレイ {quiz.times_played}
            </div>
          )}
        </div>
      </CardContent>

      {/* Action Buttons - Fixed at bottom */}
      <CardFooter className="flex gap-2 pt-0 mt-auto">
        {quiz.status === QuizStatus.DRAFT ? (
          <>
            <Button
              variant="gradient2"
              size="sm"
              onClick={handleEdit}
              disabled={isDeleting}
              className="flex-1"
            >
              <Edit3 className="w-4 h-4 mr-1" />
              編集
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 bg-red-400 hover:bg-red-500 text-white"
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-1" />
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
              className="flex-1 hover:from-purple-500 hover:to-pink-500 hover:shadow-lg hover:transform-none"
            >
              <Edit3 className="w-4 h-4 mr-1" />
              編集
            </Button>
            <Button
              size="sm"
              onClick={handleStart}
              disabled={isDeleting}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg"
            >
              <Play className="w-4 h-4 mr-1" />
              ゲーム開始
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 bg-red-400 hover:bg-red-500 text-white"
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-1" />
              )}
              削除
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
};
