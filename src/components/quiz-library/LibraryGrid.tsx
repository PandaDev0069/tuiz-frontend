'use client';

import React from 'react';
import { Loader } from '@/components/ui/feedback/loader';
import { Button } from '@/components/ui/core/button';
import { ChevronLeft, ChevronRight, Library, Search } from 'lucide-react';
import { QuizSet } from '@/types/quiz';

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
      <div className="flex items-center justify-center py-12">
        <Loader size="lg" spinnerSize="xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-2">エラーが発生しました</div>
        <div className="text-gray-600">{error}</div>
      </div>
    );
  }

  if (quizzes.length === 0) {
    const IconComponent = emptyState.icon === 'library' ? Library : Search;

    return (
      <div className="text-center py-12">
        <IconComponent className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">{emptyState.message}</h3>
        <p className="text-gray-600">{emptyState.description}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quiz Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz) => renderQuiz(quiz))}
      </div>

      {/* Pagination */}
      {pagination.total_pages > 1 && (
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            {pagination.total} 件中 {(pagination.page - 1) * pagination.limit + 1}-
            {Math.min(pagination.page * pagination.limit, pagination.total)} 件を表示
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={!pagination.has_prev}
              className="flex items-center space-x-1"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>前へ</span>
            </Button>

            {/* Page Numbers */}
            <div className="flex items-center space-x-1">
              {getPageNumbers(pagination.page, pagination.total_pages).map((pageNum, index) => (
                <React.Fragment key={index}>
                  {pageNum === '...' ? (
                    <span className="px-2 py-1 text-gray-400">...</span>
                  ) : (
                    <Button
                      variant={pageNum === pagination.page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => onPageChange(pageNum as number)}
                      className="min-w-[40px]"
                    >
                      {pageNum}
                    </Button>
                  )}
                </React.Fragment>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={!pagination.has_next}
              className="flex items-center space-x-1"
            >
              <span>次へ</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to generate page numbers for pagination
function getPageNumbers(currentPage: number, totalPages: number): (number | string)[] {
  const delta = 2;
  const range = [];
  const rangeWithDots = [];

  for (
    let i = Math.max(2, currentPage - delta);
    i <= Math.min(totalPages - 1, currentPage + delta);
    i++
  ) {
    range.push(i);
  }

  if (currentPage - delta > 2) {
    rangeWithDots.push(1, '...');
  } else {
    rangeWithDots.push(1);
  }

  rangeWithDots.push(...range);

  if (currentPage + delta < totalPages - 1) {
    rangeWithDots.push('...', totalPages);
  } else if (totalPages > 1) {
    rangeWithDots.push(totalPages);
  }

  return rangeWithDots;
}
