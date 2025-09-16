'use client';

import React, { useEffect, useState } from 'react';
import { PublicQuizCard } from './PublicQuizCard';
import { LibraryFilters } from './LibraryFilters';
import { LibraryGrid } from './LibraryGrid';
import { CloneProgressModal } from './CloneProgressModal';
import { PreviewQuizModal } from './PreviewQuizModal';
import { usePublicBrowse, useCloneQuiz, useQuizPreview } from '@/hooks/useQuizLibrary';
import { usePublicBrowseState, useQuizLibraryActions } from '@/state/useQuizLibraryStore';

type PublicBrowseFilters = {
  category?: string;
  difficulty?: string;
  sort: string;
};

interface PublicBrowseProps {
  searchQuery: string;
  filters: PublicBrowseFilters;
  pagination: { page: number; limit: number };
  onFiltersChange: (filters: Partial<PublicBrowseFilters>) => void;
  onPageChange: (page: number) => void;
  onSearchChange: (query: string) => void;
  onCloneQuiz: (id: string) => void;
  onCloneSuccess?: (clonedQuizId: string, originalQuizTitle: string) => void;
  onPreviewQuiz: (id: string) => void;
}

export const PublicBrowseContent: React.FC<PublicBrowseProps> = ({
  searchQuery,
  filters,
  pagination,
  onFiltersChange,
  onPageChange,
  onSearchChange,
  onCloneQuiz,
  onCloneSuccess,
  onPreviewQuiz,
}) => {
  // Get state from Zustand store
  const { quizzes, pagination: storePagination, loading, error } = usePublicBrowseState();

  // Get actions from Zustand store
  const { setPublicBrowseFilters, setPublicBrowsePagination } = useQuizLibraryActions();

  // Clone progress modal state
  const [cloneModalState, setCloneModalState] = useState<{
    isOpen: boolean;
    status: 'idle' | 'cloning' | 'success' | 'error';
    originalQuizTitle?: string;
    clonedQuizId?: string;
    error?: string;
  }>({
    isOpen: false,
    status: 'idle',
  });

  // Preview modal state
  const [previewModalState, setPreviewModalState] = useState<{
    isOpen: boolean;
    quizId?: string;
  }>({
    isOpen: false,
  });

  // Quiz preview data
  const {
    data: previewData,
    isLoading: previewLoading,
    error: previewError,
  } = useQuizPreview(previewModalState.quizId || '', previewModalState.isOpen);

  // Handle preview quiz
  const handlePreviewQuiz = (quizId: string) => {
    setPreviewModalState({
      isOpen: true,
      quizId,
    });
    // Also call the parent handler for any additional logic
    onPreviewQuiz(quizId);
  };

  // Prepare API request parameters
  const apiParams = {
    page: pagination.page,
    limit: pagination.limit,
    ...(filters.category && { category: filters.category }),
    ...(filters.difficulty && { difficulty: filters.difficulty }),
    sort: filters.sort,
    ...(searchQuery && { search: searchQuery }),
  };

  // Fetch data using React Query
  usePublicBrowse(apiParams);

  // Clone mutation
  const cloneQuizMutation = useCloneQuiz();

  // Sync props with store when they change
  useEffect(() => {
    setPublicBrowseFilters(filters);
  }, [filters, setPublicBrowseFilters]);

  useEffect(() => {
    setPublicBrowsePagination(pagination);
  }, [pagination, setPublicBrowsePagination]);

  // Handle clone quiz
  const handleCloneQuiz = async (id: string) => {
    // Find the quiz being cloned for the success callback
    const quizToClone = (quizzes || []).find((q) => q.id === id);

    if (!quizToClone) return;

    // Show cloning modal
    setCloneModalState({
      isOpen: true,
      status: 'cloning',
      originalQuizTitle: quizToClone.title,
    });

    try {
      const result = await cloneQuizMutation.mutateAsync(id);

      // Update modal to success state
      setCloneModalState((prev) => ({
        ...prev,
        status: 'success',
        clonedQuizId: result.quiz.id,
      }));

      // Call parent success handler if provided
      if (onCloneSuccess && result) {
        onCloneSuccess(result.quiz.id, quizToClone.title);
      }

      onCloneQuiz(id); // Call parent handler for any additional logic
    } catch (error) {
      // Update modal to error state
      setCloneModalState((prev) => ({
        ...prev,
        status: 'error',
        error: error instanceof Error ? error.message : 'クローンに失敗しました',
      }));
      console.error('Failed to clone quiz:', error);
    }
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
        type="public-browse"
        filters={{
          ...filters,
          status: undefined, // Not used in public browse
        }}
        categories={availableCategories}
        onFiltersChange={onFiltersChange}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
      />

      <LibraryGrid
        quizzes={quizzes}
        isLoading={loading}
        error={error}
        pagination={paginationInfo}
        onPageChange={onPageChange}
        renderQuiz={(quiz) => (
          <PublicQuizCard
            key={quiz.id}
            quiz={quiz}
            onClone={handleCloneQuiz}
            onPreview={handlePreviewQuiz}
            isCloning={cloneQuizMutation.isPending}
          />
        )}
        emptyState={{
          icon: 'search',
          message: searchQuery ? 'クイズが見つかりません' : '該当するクイズが見つかりません',
          description: searchQuery
            ? '検索条件を変更してもう一度お試しください'
            : '検索条件やフィルターを変更してもう一度お試しください',
        }}
      />

      {/* Clone Progress Modal */}
      <CloneProgressModal
        isOpen={cloneModalState.isOpen}
        onClose={() => setCloneModalState((prev) => ({ ...prev, isOpen: false }))}
        cloneStatus={cloneModalState.status}
        originalQuizTitle={cloneModalState.originalQuizTitle}
        clonedQuizId={cloneModalState.clonedQuizId}
        error={cloneModalState.error}
        onEditClonedQuiz={() => {
          if (cloneModalState.clonedQuizId) {
            window.location.href = `/dashboard/create/edit?id=${cloneModalState.clonedQuizId}`;
          }
        }}
        onViewMyLibrary={() => {
          setCloneModalState((prev) => ({ ...prev, isOpen: false }));
          // The parent component will handle switching to My Library tab
          if (onCloneSuccess && cloneModalState.clonedQuizId && cloneModalState.originalQuizTitle) {
            onCloneSuccess(cloneModalState.clonedQuizId, cloneModalState.originalQuizTitle);
          }
        }}
      />

      {/* Preview Quiz Modal */}
      <PreviewQuizModal
        isOpen={previewModalState.isOpen}
        onClose={() => setPreviewModalState({ isOpen: false })}
        quiz={previewData?.quiz || null}
        questions={previewData?.questions || []}
        isLoading={previewLoading}
        error={previewError instanceof Error ? previewError.message : undefined}
        onCloneQuiz={handleCloneQuiz}
        isCloning={cloneQuizMutation.isPending}
      />
    </div>
  );
};
