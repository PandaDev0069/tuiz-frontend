'use client';

import React, { useEffect } from 'react';
import { QuizCard } from '@/components/ui/data-display/quiz-card';
import { LibraryFilters } from './LibraryFilters';
import { LibraryGrid } from './LibraryGrid';
import { useMyLibrary, useDeleteQuiz } from '@/hooks/useQuizLibrary';
import { useMyLibraryState, useQuizLibraryActions } from '@/state/useQuizLibraryStore';
import { useConfirmation } from '@/hooks/useConfirmation';

type MyLibraryFilters = {
  category?: string;
  status?: 'all' | 'drafts' | 'published';
  sort: string;
};

interface MyLibraryProps {
  searchQuery: string;
  filters: MyLibraryFilters;
  pagination: { page: number; limit: number };
  onFiltersChange: (filters: Partial<MyLibraryFilters>) => void;
  onPageChange: (page: number) => void;
  onEditQuiz: (id: string) => void;
  onStartQuiz: (id: string) => void;
  onDeleteQuiz: (id: string) => void;
}

export const MyLibraryContent: React.FC<MyLibraryProps> = ({
  searchQuery,
  filters,
  pagination,
  onFiltersChange,
  onPageChange,
  onEditQuiz,
  onStartQuiz,
  onDeleteQuiz,
}) => {
  // Get state from Zustand store
  const { quizzes, pagination: storePagination, loading, error } = useMyLibraryState();

  // Get actions from Zustand store
  const { setMyLibraryFilters, setMyLibraryPagination } = useQuizLibraryActions();

  // Confirmation hook for delete warnings
  const { confirmDelete, WarningModalComponent } = useConfirmation();

  // Map UI status to API status
  const mapStatusForAPI = (uiStatus: string): 'draft' | 'published' | undefined => {
    switch (uiStatus) {
      case 'drafts':
        return 'draft';
      case 'published':
        return 'published';
      default:
        return undefined;
    }
  };

  // Prepare API request parameters
  const apiParams = {
    page: pagination.page,
    limit: pagination.limit,
    ...(filters.category && { category: filters.category }),
    ...(filters.status &&
      filters.status !== 'all' && {
        status: mapStatusForAPI(filters.status),
      }),
    sort: filters.sort,
    ...(searchQuery && { search: searchQuery }),
  };

  // Fetch data using React Query
  useMyLibrary(apiParams);

  // Delete mutation
  const deleteQuizMutation = useDeleteQuiz();

  // Sync props with store when they change
  useEffect(() => {
    setMyLibraryFilters(filters);
  }, [filters, setMyLibraryFilters]);

  useEffect(() => {
    setMyLibraryPagination(pagination);
  }, [pagination, setMyLibraryPagination]);

  // Handle delete quiz with confirmation
  const handleDeleteQuiz = (id: string) => {
    const quiz = quizzes?.find((q) => q.id === id);
    if (!quiz) return;

    confirmDelete(quiz.title, async () => {
      try {
        await deleteQuizMutation.mutateAsync(id);
        onDeleteQuiz(id); // Call parent handler for any additional logic
      } catch (error) {
        console.error('Failed to delete quiz:', error);
        // Don't call onDeleteQuiz if deletion failed
      }
    });
  };

  // Get available categories from current quizzes
  const availableCategories = Array.from(
    new Set((quizzes || []).map((q) => q.category).filter(Boolean)),
  ) as string[];

  // Use store pagination if available, otherwise fall back to props
  const paginationInfo =
    storePagination.total > 0
      ? storePagination
      : {
          page: pagination.page,
          limit: pagination.limit,
          total: (quizzes || []).length,
          total_pages: Math.ceil((quizzes || []).length / pagination.limit),
          has_next: pagination.page < Math.ceil((quizzes || []).length / pagination.limit),
          has_prev: pagination.page > 1,
        };

  return (
    <div>
      <LibraryFilters
        type="my-library"
        filters={filters}
        categories={availableCategories}
        onFiltersChange={onFiltersChange}
      />

      <LibraryGrid
        quizzes={quizzes}
        isLoading={loading}
        error={error}
        pagination={paginationInfo}
        onPageChange={onPageChange}
        renderQuiz={(quiz) => (
          <QuizCard
            key={quiz.id}
            quiz={quiz}
            onEdit={onEditQuiz}
            onStart={onStartQuiz}
            onDelete={handleDeleteQuiz}
            isDeleting={deleteQuizMutation.isPending}
          />
        )}
        emptyState={{
          icon: 'library',
          message: searchQuery ? 'クイズが見つかりません' : 'ライブラリにクイズがありません',
          description: searchQuery
            ? '検索条件を変更してもう一度お試しください'
            : '新しいクイズを作成するか、パブリックライブラリからクローンしてみましょう',
        }}
      />

      {/* Warning Modal for delete confirmation */}
      <WarningModalComponent />
    </div>
  );
};
