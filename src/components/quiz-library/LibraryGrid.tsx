// ====================================================
// File Name   : LibraryGrid.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-17
// Last Update : 2025-09-17
//
// Description:
// - Grid component for displaying quiz library with pagination
// - Shows loading state, error state, and empty state
// - Renders quiz grid with responsive layout
// - Provides pagination controls with page numbers
// - Supports custom quiz rendering via render prop
//
// Notes:
// - Client-only component (requires 'use client')
// - Uses helper function to generate pagination page numbers
// - Displays pagination only when there are multiple pages
// ====================================================

'use client';

import React from 'react';
import { Loader } from '@/components/ui/feedback/loader';
import { Button } from '@/components/ui/core/button';
import { ChevronLeft, ChevronRight, Library, Search } from 'lucide-react';
import { QuizSet } from '@/types/quiz';

const PAGINATION_DELTA = 2;
const FIRST_PAGE = 1;
const MIN_PAGES_FOR_PAGINATION = 1;
const ELLIPSIS = '...';

const LOADER_CONTAINER_CLASSES = 'flex items-center justify-center py-12';
const ERROR_CONTAINER_CLASSES = 'text-center py-12';
const ERROR_TITLE_CLASSES = 'text-red-600 mb-2';
const ERROR_TEXT_CLASSES = 'text-gray-600';
const EMPTY_STATE_CONTAINER_CLASSES = 'text-center py-12';
const EMPTY_STATE_ICON_CLASSES = 'mx-auto h-12 w-12 text-gray-400 mb-4';
const EMPTY_STATE_TITLE_CLASSES = 'text-lg font-medium text-gray-900 mb-2';
const EMPTY_STATE_DESCRIPTION_CLASSES = 'text-gray-600';

const GRID_CONTAINER_CLASSES = 'space-y-6';
const QUIZ_GRID_CLASSES = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
const PAGINATION_CONTAINER_CLASSES =
  'flex items-center justify-between pt-6 border-t border-gray-200';
const PAGINATION_INFO_CLASSES = 'text-sm text-gray-600';
const PAGINATION_CONTROLS_CLASSES = 'flex items-center space-x-2';
const BUTTON_VARIANT_OUTLINE = 'outline';
const BUTTON_VARIANT_DEFAULT = 'default';
const BUTTON_SIZE_SM = 'sm';
const PAGINATION_BUTTON_CLASSES = 'flex items-center space-x-1';
const ICON_SIZE_SMALL = 'h-4 w-4';
const PAGE_NUMBERS_CONTAINER_CLASSES = 'flex items-center space-x-1';
const ELLIPSIS_CLASSES = 'px-2 py-1 text-gray-400';
const PAGE_BUTTON_MIN_WIDTH = 'min-w-[40px]';

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

interface EmptyState {
  icon: 'library' | 'search';
  message: string;
  description: string;
}

interface LibraryGridProps {
  quizzes: QuizSet[];
  isLoading: boolean;
  error: string | null;
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  renderQuiz: (quiz: QuizSet) => React.ReactNode;
  emptyState: EmptyState;
}

/**
 * Function: getPageNumbers
 * Description:
 * - Generates array of page numbers for pagination display
 * - Includes ellipsis (...) for large page ranges
 * - Shows pages around current page with delta range
 * - Always includes first and last page when applicable
 *
 * Parameters:
 * - currentPage (number): Current active page number
 * - totalPages (number): Total number of pages
 *
 * Returns:
 * - (number | string)[]: Array of page numbers and ellipsis strings
 *
 * Example:
 * ```ts
 * getPageNumbers(5, 10);
 * // Returns: [1, '...', 3, 4, 5, 6, 7, '...', 10]
 * ```
 */
function getPageNumbers(currentPage: number, totalPages: number): (number | string)[] {
  const range: number[] = [];
  const rangeWithDots: (number | string)[] = [];

  for (
    let i = Math.max(2, currentPage - PAGINATION_DELTA);
    i <= Math.min(totalPages - 1, currentPage + PAGINATION_DELTA);
    i++
  ) {
    range.push(i);
  }

  if (currentPage - PAGINATION_DELTA > 2) {
    rangeWithDots.push(FIRST_PAGE, ELLIPSIS);
  } else {
    rangeWithDots.push(FIRST_PAGE);
  }

  rangeWithDots.push(...range);

  if (currentPage + PAGINATION_DELTA < totalPages - 1) {
    rangeWithDots.push(ELLIPSIS, totalPages);
  } else if (totalPages > MIN_PAGES_FOR_PAGINATION) {
    rangeWithDots.push(totalPages);
  }

  return rangeWithDots;
}

/**
 * Component: LibraryGrid
 * Description:
 * - Grid component for displaying quiz library with pagination
 * - Handles loading, error, and empty states
 * - Renders quiz grid with responsive columns
 * - Provides pagination controls with page navigation
 * - Uses render prop pattern for custom quiz rendering
 *
 * Parameters:
 * - quizzes (QuizSet[]): Array of quiz sets to display
 * - isLoading (boolean): Whether data is currently loading
 * - error (string | null): Error message if loading failed
 * - pagination (PaginationInfo): Pagination information
 * - onPageChange (function): Callback when page changes
 * - renderQuiz (function): Render function for each quiz item
 * - emptyState (EmptyState): Configuration for empty state display
 *
 * Returns:
 * - React.ReactElement: The library grid component
 *
 * Example:
 * ```tsx
 * <LibraryGrid
 *   quizzes={quizzes}
 *   isLoading={false}
 *   error={null}
 *   pagination={pagination}
 *   onPageChange={(page) => setPage(page)}
 *   renderQuiz={(quiz) => <QuizCard quiz={quiz} />}
 *   emptyState={{ icon: 'library', message: 'No quizzes', description: '...' }}
 * />
 * ```
 */
export const LibraryGrid: React.FC<LibraryGridProps> = ({
  quizzes,
  isLoading,
  error,
  pagination,
  onPageChange,
  renderQuiz,
  emptyState,
}) => {
  if (isLoading) {
    return (
      <div className={LOADER_CONTAINER_CLASSES}>
        <Loader size="lg" spinnerSize="xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={ERROR_CONTAINER_CLASSES}>
        <div className={ERROR_TITLE_CLASSES}>エラーが発生しました</div>
        <div className={ERROR_TEXT_CLASSES}>{error}</div>
      </div>
    );
  }

  if (quizzes.length === 0) {
    const IconComponent = emptyState.icon === 'library' ? Library : Search;

    return (
      <div className={EMPTY_STATE_CONTAINER_CLASSES}>
        <IconComponent className={EMPTY_STATE_ICON_CLASSES} />
        <h3 className={EMPTY_STATE_TITLE_CLASSES}>{emptyState.message}</h3>
        <p className={EMPTY_STATE_DESCRIPTION_CLASSES}>{emptyState.description}</p>
      </div>
    );
  }

  const startItem = (pagination.page - 1) * pagination.limit + 1;
  const endItem = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <div className={GRID_CONTAINER_CLASSES}>
      <div className={QUIZ_GRID_CLASSES}>{quizzes.map((quiz) => renderQuiz(quiz))}</div>

      {pagination.total_pages > MIN_PAGES_FOR_PAGINATION && (
        <div className={PAGINATION_CONTAINER_CLASSES}>
          <div className={PAGINATION_INFO_CLASSES}>
            {pagination.total} 件中 {startItem}-{endItem} 件を表示
          </div>

          <div className={PAGINATION_CONTROLS_CLASSES}>
            <Button
              variant={BUTTON_VARIANT_OUTLINE}
              size={BUTTON_SIZE_SM}
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={!pagination.has_prev}
              className={PAGINATION_BUTTON_CLASSES}
            >
              <ChevronLeft className={ICON_SIZE_SMALL} />
              <span>前へ</span>
            </Button>

            <div className={PAGE_NUMBERS_CONTAINER_CLASSES}>
              {getPageNumbers(pagination.page, pagination.total_pages).map((pageNum, index) => (
                <React.Fragment key={index}>
                  {pageNum === ELLIPSIS ? (
                    <span className={ELLIPSIS_CLASSES}>{ELLIPSIS}</span>
                  ) : (
                    <Button
                      variant={
                        pageNum === pagination.page
                          ? BUTTON_VARIANT_DEFAULT
                          : BUTTON_VARIANT_OUTLINE
                      }
                      size={BUTTON_SIZE_SM}
                      onClick={() => onPageChange(pageNum as number)}
                      className={PAGE_BUTTON_MIN_WIDTH}
                    >
                      {pageNum}
                    </Button>
                  )}
                </React.Fragment>
              ))}
            </div>

            <Button
              variant={BUTTON_VARIANT_OUTLINE}
              size={BUTTON_SIZE_SM}
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={!pagination.has_next}
              className={PAGINATION_BUTTON_CLASSES}
            >
              <span>次へ</span>
              <ChevronRight className={ICON_SIZE_SMALL} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
