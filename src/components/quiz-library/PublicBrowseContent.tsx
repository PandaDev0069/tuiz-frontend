// ====================================================
// File Name   : PublicBrowseContent.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-17
// Last Update : 2025-09-17
//
// Description:
// - Content component for public-browse tab view
// - Manages public quiz browsing with filters and pagination
// - Handles quiz cloning with progress modal
// - Provides quiz preview functionality
// - Syncs props with Zustand store
//
// Notes:
// - Client-only component (requires 'use client')
// - Uses Zustand store for state management
// - Uses React Query for data fetching
// - Manages clone and preview modal states
// ====================================================

'use client';

import React, { useEffect, useState } from 'react';
import { PublicQuizCard } from './PublicQuizCard';
import { LibraryFilters } from './LibraryFilters';
import { LibraryGrid } from './LibraryGrid';
import { CloneProgressModal } from './CloneProgressModal';
import { PreviewQuizModal } from './PreviewQuizModal';
import { usePublicBrowse, useCloneQuiz, useQuizPreview } from '@/hooks/useQuizLibrary';
import { usePublicBrowseState, useQuizLibraryActions } from '@/state/useQuizLibraryStore';

const FILTER_TYPE_PUBLIC_BROWSE = 'public-browse';
const EMPTY_STATE_ICON_SEARCH = 'search';
const MIN_TOTAL_FOR_STORE_PAGINATION = 0;
const FIRST_PAGE = 1;
const EDIT_QUIZ_PATH_PREFIX = '/create/edit/';

const CLONE_MODAL_INITIAL_STATE = {
  isOpen: false,
  status: 'idle' as const,
};

const PREVIEW_MODAL_INITIAL_STATE = {
  isOpen: false,
};

interface CloneModalState {
  isOpen: boolean;
  status: 'idle' | 'cloning' | 'success' | 'error';
  originalQuizTitle?: string;
  clonedQuizId?: string;
  error?: string;
}

interface PreviewModalState {
  isOpen: boolean;
  quizId?: string;
}

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

/**
 * Component: PublicBrowseContent
 * Description:
 * - Main content component for public-browse tab
 * - Manages public quiz browsing with filters, search, and pagination
 * - Handles quiz cloning with progress tracking and modal display
 * - Provides quiz preview functionality with modal
 * - Syncs component props with Zustand store
 * - Fetches quiz data using React Query
 *
 * Parameters:
 * - searchQuery (string): Current search query
 * - filters (PublicBrowseFilters): Current filter values
 * - pagination (object): Pagination configuration with page and limit
 * - onFiltersChange (function): Callback when filters change
 * - onPageChange (function): Callback when page changes
 * - onSearchChange (function): Callback when search query changes
 * - onCloneQuiz (function): Callback when quiz is cloned
 * - onCloneSuccess (function, optional): Callback when clone succeeds
 * - onPreviewQuiz (function): Callback when quiz preview is requested
 *
 * Returns:
 * - React.ReactElement: The public browse content component
 *
 * Example:
 * ```tsx
 * <PublicBrowseContent
 *   searchQuery={searchQuery}
 *   filters={filters}
 *   pagination={{ page: 1, limit: 12 }}
 *   onFiltersChange={(filters) => setFilters(filters)}
 *   onPageChange={(page) => setPage(page)}
 *   onSearchChange={(query) => setSearchQuery(query)}
 *   onCloneQuiz={(id) => handleClone(id)}
 *   onCloneSuccess={(id, title) => handleCloneSuccess(id, title)}
 *   onPreviewQuiz={(id) => handlePreview(id)}
 * />
 * ```
 */
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
  const { quizzes, pagination: storePagination, loading, error } = usePublicBrowseState();
  const { setPublicBrowseFilters, setPublicBrowsePagination } = useQuizLibraryActions();

  const [cloneModalState, setCloneModalState] =
    useState<CloneModalState>(CLONE_MODAL_INITIAL_STATE);
  const [previewModalState, setPreviewModalState] = useState<PreviewModalState>(
    PREVIEW_MODAL_INITIAL_STATE,
  );

  const {
    data: previewData,
    isLoading: previewLoading,
    error: previewError,
  } = useQuizPreview(previewModalState.quizId || '', previewModalState.isOpen);

  /**
   * Function: handlePreviewQuiz
   * Description:
   * - Opens preview modal for the specified quiz
   * - Calls parent handler for additional logic
   *
   * Parameters:
   * - quizId (string): ID of quiz to preview
   */
  const handlePreviewQuiz = (quizId: string) => {
    setPreviewModalState({
      isOpen: true,
      quizId,
    });
    onPreviewQuiz(quizId);
  };

  const apiParams = {
    page: pagination.page,
    limit: pagination.limit,
    ...(filters.category && { category: filters.category }),
    ...(filters.difficulty && { difficulty: filters.difficulty }),
    sort: filters.sort,
    ...(searchQuery && { search: searchQuery }),
  };

  usePublicBrowse(apiParams);

  const cloneQuizMutation = useCloneQuiz();

  useEffect(() => {
    setPublicBrowseFilters(filters);
  }, [filters, setPublicBrowseFilters]);

  useEffect(() => {
    setPublicBrowsePagination(pagination);
  }, [pagination, setPublicBrowsePagination]);

  /**
   * Function: handleCloneQuiz
   * Description:
   * - Handles quiz cloning with progress tracking
   * - Shows cloning modal during operation
   * - Updates modal state based on clone result
   * - Calls parent handlers on success
   * - Handles errors and displays error message
   *
   * Parameters:
   * - id (string): ID of quiz to clone
   */
  const handleCloneQuiz = async (id: string) => {
    const quizToClone = (quizzes || []).find((q) => q.id === id);

    if (!quizToClone) {
      console.error('Quiz not found for cloning:', id);
      return;
    }

    setCloneModalState({
      isOpen: true,
      status: 'cloning',
      originalQuizTitle: quizToClone.title,
    });

    try {
      const result = await cloneQuizMutation.mutateAsync(id);

      if (!result || !result.clonedQuiz || !result.clonedQuiz.id) {
        throw new Error('Invalid response from clone API');
      }

      setCloneModalState((prev) => ({
        ...prev,
        status: 'success',
        clonedQuizId: result.clonedQuiz.id,
      }));

      if (onCloneSuccess && result) {
        onCloneSuccess(result.clonedQuiz.id, quizToClone.title);
      }

      onCloneQuiz(id);
    } catch (error) {
      setCloneModalState((prev) => ({
        ...prev,
        status: 'error',
        error: error instanceof Error ? error.message : 'クローンに失敗しました',
      }));
      console.error('Failed to clone quiz:', error);
    }
  };

  const availableCategories = Array.from(
    new Set((quizzes || []).map((q) => q.category).filter(Boolean)),
  ) as string[];

  const paginationInfo =
    storePagination.total > MIN_TOTAL_FOR_STORE_PAGINATION
      ? storePagination
      : {
          page: pagination.page,
          limit: pagination.limit,
          total: (quizzes || []).length,
          total_pages: Math.ceil((quizzes || []).length / pagination.limit),
          has_next: pagination.page < Math.ceil((quizzes || []).length / pagination.limit),
          has_prev: pagination.page > FIRST_PAGE,
        };

  return (
    <div>
      <LibraryFilters
        type={FILTER_TYPE_PUBLIC_BROWSE}
        filters={{
          ...filters,
          status: undefined,
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
          icon: EMPTY_STATE_ICON_SEARCH,
          message: searchQuery ? 'クイズが見つかりません' : '該当するクイズが見つかりません',
          description: searchQuery
            ? '検索条件を変更してもう一度お試しください'
            : '検索条件やフィルターを変更してもう一度お試しください',
        }}
      />

      <CloneProgressModal
        isOpen={cloneModalState.isOpen}
        onClose={() => setCloneModalState((prev) => ({ ...prev, isOpen: false }))}
        cloneStatus={cloneModalState.status}
        originalQuizTitle={cloneModalState.originalQuizTitle}
        clonedQuizId={cloneModalState.clonedQuizId}
        error={cloneModalState.error}
        onEditClonedQuiz={() => {
          if (cloneModalState.clonedQuizId) {
            window.location.href = `${EDIT_QUIZ_PATH_PREFIX}${cloneModalState.clonedQuizId}`;
          }
        }}
        onViewMyLibrary={() => {
          setCloneModalState((prev) => ({ ...prev, isOpen: false }));
          if (onCloneSuccess && cloneModalState.clonedQuizId && cloneModalState.originalQuizTitle) {
            onCloneSuccess(cloneModalState.clonedQuizId, cloneModalState.originalQuizTitle);
          }
        }}
      />

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
