// src/hooks/useDashboard.ts
// Dashboard-specific hooks for quiz management

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quizService } from '@/lib/quizService';
import { toast } from 'react-hot-toast';
import type { QuizListRequest } from '@/types/api';
import type { QuizStatus, DifficultyLevel } from '@/types/quiz';

// ============================================================================
// QUIZ LIST HOOK
// ============================================================================

export interface UseQuizListOptions {
  filters?: QuizListRequest;
  enabled?: boolean;
}

export function useQuizList(options: UseQuizListOptions = {}) {
  const { filters = {}, enabled = true } = options;

  return useQuery({
    queryKey: ['quizzes', 'list', filters],
    queryFn: async () => {
      return await quizService.listQuizzes(filters);
    },
    enabled,
    staleTime: 30 * 1000, // 30 seconds
    retry: 2,
  });
}

// ============================================================================
// DRAFT QUIZZES HOOK
// ============================================================================

export function useDraftQuizzes() {
  return useQuizList({
    filters: { status: 'draft', limit: 20 },
    enabled: true,
  });
}

// ============================================================================
// PUBLISHED QUIZZES HOOK
// ============================================================================

export function usePublishedQuizzes() {
  return useQuizList({
    filters: { status: 'published', limit: 20 },
    enabled: true,
  });
}

// ============================================================================
// QUIZ ACTIONS HOOK
// ============================================================================

export function useQuizActions() {
  const queryClient = useQueryClient();

  const deleteQuizMutation = useMutation({
    mutationFn: async (quizId: string) => {
      return await quizService.deleteQuiz(quizId);
    },
    onSuccess: () => {
      toast.success('クイズを削除しました');
      // Invalidate all quiz queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
    },
    onError: () => {
      toast.error('クイズの削除に失敗しました');
    },
  });

  return {
    deleteQuiz: deleteQuizMutation.mutateAsync,
    isDeleting: deleteQuizMutation.isPending,
  };
}

// ============================================================================
// QUIZ FILTERS HOOK
// ============================================================================

export interface QuizFilters {
  search: string;
  category: string;
  difficulty: DifficultyLevel | '';
  status: QuizStatus | '';
  sortBy: 'created_at' | 'updated_at' | 'title' | 'times_played';
  sortOrder: 'asc' | 'desc';
}

export function useQuizFilters() {
  const [filters, setFilters] = useState<QuizFilters>({
    search: '',
    category: '',
    difficulty: '',
    status: '',
    sortBy: 'created_at',
    sortOrder: 'desc',
  });

  const updateFilters = (newFilters: Partial<QuizFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      difficulty: '',
      status: '',
      sortBy: 'created_at',
      sortOrder: 'desc',
    });
  };

  const getApiFilters = (): QuizListRequest => {
    const apiFilters: QuizListRequest = {
      page: 1,
      limit: 50,
    };

    if (filters.search) apiFilters.search = filters.search;
    if (filters.category) apiFilters.category = filters.category;
    if (filters.difficulty) apiFilters.difficulty = filters.difficulty;
    if (filters.status) apiFilters.status = filters.status;
    if (filters.sortBy) apiFilters.sort = filters.sortBy;
    if (filters.sortOrder) apiFilters.order = filters.sortOrder;

    return apiFilters;
  };

  return {
    filters,
    updateFilters,
    clearFilters,
    getApiFilters,
  };
}

// ============================================================================
// QUIZ STATISTICS HOOK
// ============================================================================

export function useQuizStats() {
  const { data: draftData } = useDraftQuizzes();
  const { data: publishedData } = usePublishedQuizzes();

  const stats = {
    totalDrafts: draftData?.totalCount || 0,
    totalPublished: publishedData?.totalCount || 0,
    totalQuizzes: (draftData?.totalCount || 0) + (publishedData?.totalCount || 0),
    totalPlays: publishedData?.data?.reduce((sum, quiz) => sum + (quiz.times_played || 0), 0) || 0,
  };

  return stats;
}
