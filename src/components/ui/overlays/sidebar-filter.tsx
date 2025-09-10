'use client';

import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface FilterState {
  status: string[];
  difficulty: string[];
  category: string[];
  sortBy: string;
  viewMode: 'grid' | 'list';
  dateRange: 'all' | 'today' | 'week' | 'month' | 'year';
  questionCount: 'all' | 'small' | 'medium' | 'large';
  playCount: 'all' | 'low' | 'medium' | 'high';
  tags: string[];
}

export interface SidebarFilterProps {
  isOpen: boolean;
  onToggle: () => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  className?: string;
}

const STATUS_OPTIONS: FilterOption[] = [
  { value: 'published', label: '公開済み', count: 156 },
  { value: 'draft', label: '下書き', count: 23 },
  { value: 'creating', label: '作成中', count: 5 },
];

const DIFFICULTY_OPTIONS: FilterOption[] = [
  { value: 'easy', label: '簡単', count: 89 },
  { value: 'medium', label: '普通', count: 156 },
  { value: 'hard', label: '難しい', count: 67 },
  { value: 'expert', label: '上級', count: 34 },
];

const SORT_OPTIONS: FilterOption[] = [
  { value: 'newest', label: '最新順' },
  { value: 'oldest', label: '古い順' },
  { value: 'popular', label: '人気順' },
  { value: 'alphabetical', label: 'アルファベット順' },
  { value: 'questionCount', label: '問題数順' },
];

const DATE_RANGE_OPTIONS: FilterOption[] = [
  { value: 'all', label: 'すべて' },
  { value: 'today', label: '今日' },
  { value: 'week', label: '今週' },
  { value: 'month', label: '今月' },
  { value: 'year', label: '今年' },
];

export const SidebarFilter: React.FC<SidebarFilterProps> = ({
  isOpen,
  onToggle,
  filters,
  onFiltersChange,
  className,
}) => {
  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const toggleArrayFilter = <K extends keyof FilterState>(key: K, value: string) => {
    const currentValues = filters[key] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];
    updateFilter(key, newValues as FilterState[K]);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      status: [],
      difficulty: [],
      category: [],
      sortBy: 'newest',
      viewMode: 'grid',
      dateRange: 'all',
      questionCount: 'all',
      playCount: 'all',
      tags: [],
    });
  };

  const hasActiveFilters = () => {
    return (
      filters.status.length > 0 ||
      filters.difficulty.length > 0 ||
      filters.category.length > 0 ||
      filters.sortBy !== 'newest' ||
      filters.dateRange !== 'all' ||
      filters.questionCount !== 'all' ||
      filters.playCount !== 'all' ||
      filters.tags.length > 0
    );
  };

  return (
    <>
      {/* Backdrop - YouTube Style Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gradient-to-b bg-opacity-50 z-[9998] transition-opacity duration-300"
          onClick={onToggle}
        />
      )}

      {/* Filter Modal - YouTube Style */}
      <div
        className={cn(
          'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl max-h-[90vh] bg-white rounded-lg shadow-2xl z-[9999] transition-all duration-300 ease-in-out',
          isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none',
          className,
        )}
      >
        {/* Header - YouTube Style */}
        <div className="p-6 border-b bg-gradient-to-b from-purple-500 to-blue-500 rounded-t-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-medium text-gray-900">検索フィルター</h3>
            <button
              onClick={onToggle}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="フィルターを閉じる"
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Filter Content - YouTube Style */}
        <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          <div className="grid grid-cols-4 gap-6">
            {/* Upload Date */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-900">アップロード日</h4>
              <div className="space-y-2">
                {DATE_RANGE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() =>
                      updateFilter(
                        'dateRange',
                        option.value as 'all' | 'today' | 'week' | 'month' | 'year',
                      )
                    }
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
                      filters.dateRange === option.value
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : 'text-gray-700 hover:bg-gray-50',
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-900">難易度</h4>
              <div className="space-y-2">
                {DIFFICULTY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => toggleArrayFilter('difficulty', option.value)}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
                      filters.difficulty.includes(option.value)
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : 'text-gray-700 hover:bg-gray-50',
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort By */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-900">並び順</h4>
              <div className="space-y-2">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => updateFilter('sortBy', option.value)}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
                      filters.sortBy === option.value
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : 'text-gray-700 hover:bg-gray-50',
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Status */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-900">ステータス</h4>
              <div className="space-y-2">
                {STATUS_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => toggleArrayFilter('status', option.value)}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
                      filters.status.includes(option.value)
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : 'text-gray-700 hover:bg-gray-50',
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {hasActiveFilters() && (
                <span className="font-medium">
                  {Object.values(filters).flat().filter(Boolean).length} 個のアクティブフィルター
                </span>
              )}
            </div>
            <div className="flex gap-3">
              {hasActiveFilters() && (
                <button
                  onClick={clearAllFilters}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                >
                  すべてクリア
                </button>
              )}
              <button
                onClick={onToggle}
                className="px-4 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                フィルターを適用
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
