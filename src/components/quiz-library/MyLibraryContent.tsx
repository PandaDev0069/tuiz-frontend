// ====================================================
// File Name   : MyLibraryContent.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-17
// Last Update : 2025-09-17
//
// Description:
// - Content component for my-library tab view
// - Manages quiz library state and filters
// - Handles quiz deletion with confirmation
// - Displays library filters and grid
// - Syncs props with Zustand store
//
// Notes:
// - Client-only component (requires 'use client')
// - Uses Zustand store for state management
// - Uses React Query for data fetching
// - Provides delete confirmation via useConfirmation hook
// ====================================================

'use client';

import React, { useEffect } from 'react';
import { QuizCard } from '@/components/ui/data-display/quiz-card';
import { LibraryFilters } from './LibraryFilters';
import { LibraryGrid } from './LibraryGrid';
import { useMyLibrary, useDeleteQuiz } from '@/hooks/useQuizLibrary';
import { useMyLibraryState, useQuizLibraryActions } from '@/state/useQuizLibraryStore';
import { useConfirmation } from '@/hooks/useConfirmation';

const STATUS_UI_DRAFTS = 'drafts';
const STATUS_UI_PUBLISHED = 'published';
const STATUS_UI_ALL = 'all';
const STATUS_API_DRAFT = 'draft';
const STATUS_API_PUBLISHED = 'published';

const FILTER_TYPE_MY_LIBRARY = 'my-library';
const EMPTY_STATE_ICON_LIBRARY = 'library';

const MIN_TOTAL_FOR_STORE_PAGINATION = 0;
const FIRST_PAGE = 1;

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
  onSearchChange: (query: string) => void;
  onEditQuiz: (id: string) => void;
  onStartQuiz: (id: string) => void;
  onDeleteQuiz: (id: string) => void;
}

/**
 * Function: mapStatusForAPI
 * Description:
 * - Maps UI status values to API status values
 * - Converts 'drafts' to 'draft' and 'published' to 'published'
 * - Returns undefined for 'all' or unknown statuses
 *
 * Parameters:
 * - uiStatus (string): UI status value ('drafts', 'published', 'all')
 *
 * Returns:
 * - 'draft' | 'published' | undefined: API status value or undefined
 *
 * Example:
 * ```ts
 * mapStatusForAPI('drafts'); // Returns 'draft'
 * mapStatusForAPI('published'); // Returns 'published'
 * mapStatusForAPI('all'); // Returns undefined
 * ```
 */
const mapStatusForAPI = (uiStatus: string): 'draft' | 'published' | undefined => {
  switch (uiStatus) {
    case STATUS_UI_DRAFTS:
      return STATUS_API_DRAFT;
    case STATUS_UI_PUBLISHED:
      return STATUS_API_PUBLISHED;
    default:
      return undefined;
  }
};

/**
 * Component: MyLibraryContent
 * Description:
 * - Main content component for my-library tab
 * - Manages quiz library state, filters, and pagination
 * - Handles quiz deletion with confirmation modal
 * - Displays library filters and quiz grid
 * - Syncs component props with Zustand store
 * - Fetches quiz data using React Query
 *
 * Parameters:
 * - searchQuery (string): Current search query
 * - filters (MyLibraryFilters): Current filter values
 * - pagination (object): Pagination configuration with page and limit
 * - onFiltersChange (function): Callback when filters change
 * - onPageChange (function): Callback when page changes
 * - onSearchChange (function): Callback when search query changes
 * - onEditQuiz (function): Callback when quiz edit is requested
 * - onStartQuiz (function): Callback when quiz start is requested
 * - onDeleteQuiz (function): Callback when quiz is deleted
 *
 * Returns:
 * - React.ReactElement: The my-library content component
 *
 * Example:
 * ```tsx
 * <MyLibraryContent
 *   searchQuery={searchQuery}
 *   filters={filters}
 *   pagination={{ page: 1, limit: 12 }}
 *   onFiltersChange={(filters) => setFilters(filters)}
 *   onPageChange={(page) => setPage(page)}
 *   onSearchChange={(query) => setSearchQuery(query)}
 *   onEditQuiz={(id) => navigateToEdit(id)}
 *   onStartQuiz={(id) => startQuiz(id)}
 *   onDeleteQuiz={(id) => handleDelete(id)}
 * />
 * ```
 */
export const MyLibraryContent: React.FC<MyLibraryProps> = ({
  searchQuery,
  filters,
  pagination,
  onFiltersChange,
  onPageChange,
  onSearchChange,
  onEditQuiz,
  onStartQuiz,
  onDeleteQuiz,
}) => {
  const { quizzes, pagination: storePagination, loading, error } = useMyLibraryState();
  const { setMyLibraryFilters, setMyLibraryPagination } = useQuizLibraryActions();
  const { confirmDelete, WarningModalComponent } = useConfirmation();

  const apiParams = {
    page: pagination.page,
    limit: pagination.limit,
    ...(filters.category && { category: filters.category }),
    ...(filters.status &&
      filters.status !== STATUS_UI_ALL && {
        status: mapStatusForAPI(filters.status),
      }),
    sort: filters.sort,
    ...(searchQuery && { search: searchQuery }),
  };

  useMyLibrary(apiParams);

  const deleteQuizMutation = useDeleteQuiz();

  useEffect(() => {
    setMyLibraryFilters(filters);
  }, [filters, setMyLibraryFilters]);

  useEffect(() => {
    setMyLibraryPagination(pagination);
  }, [pagination, setMyLibraryPagination]);

  /**
   * Function: handleDeleteQuiz
   * Description:
   * - Handles quiz deletion with confirmation
   * - Shows confirmation modal before deleting
   * - Calls parent handler on successful deletion
   * - Logs errors if deletion fails
   *
   * Parameters:
   * - id (string): ID of quiz to delete
   */
  const handleDeleteQuiz = (id: string) => {
    const quiz = quizzes?.find((q) => q.id === id);
    if (!quiz) return;

    confirmDelete(quiz.title, async () => {
      try {
        await deleteQuizMutation.mutateAsync(id);
        onDeleteQuiz(id);
      } catch (error) {
        console.error('Failed to delete quiz:', error);
      }
    });
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
        type={FILTER_TYPE_MY_LIBRARY}
        filters={filters}
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
          icon: EMPTY_STATE_ICON_LIBRARY,
          message: searchQuery ? 'クイズが見つかりません' : 'ライブラリにクイズがありません',
          description: searchQuery
            ? '検索条件を変更してもう一度お試しください'
            : '新しいクイズを作成するか、パブリックライブラリからクローンしてみましょう',
        }}
      />

      <WarningModalComponent />
    </div>
  );
};
