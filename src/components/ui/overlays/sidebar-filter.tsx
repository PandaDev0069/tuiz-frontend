// ====================================================
// File Name   : sidebar-filter.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-08-25
// Last Update : 2025-09-02
//
// Description:
// - Sidebar filter modal component for filtering quizzes
// - Supports filtering by status, difficulty, date range, and sort options
// - YouTube-style modal design with backdrop
// - Handles filter state management and clearing
//
// Notes:
// - Client component (uses 'use client' directive)
// - Uses React hooks for state management
// - YouTube-inspired UI design
// ====================================================

'use client';

import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const DEFAULT_SORT_BY = 'newest';
const DEFAULT_VIEW_MODE = 'grid';
const DEFAULT_DATE_RANGE = 'all';
const DEFAULT_QUESTION_COUNT = 'all';
const DEFAULT_PLAY_COUNT = 'all';

const BACKDROP_CLASSES =
  'fixed inset-0 bg-gradient-to-b bg-opacity-50 z-[9998] transition-opacity duration-300';
const MODAL_BASE_CLASSES =
  'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl max-h-[90vh] bg-white rounded-lg shadow-2xl z-[9999] transition-all duration-300 ease-in-out';
const MODAL_OPEN_CLASSES = 'opacity-100 scale-100';
const MODAL_CLOSED_CLASSES = 'opacity-0 scale-95 pointer-events-none';
const HEADER_CLASSES = 'p-6 border-b bg-gradient-to-b from-purple-500 to-blue-500 rounded-t-lg';
const HEADER_TITLE_CLASSES = 'text-xl font-medium text-gray-900';
const CLOSE_BUTTON_CLASSES = 'p-2 hover:bg-gray-100 rounded-full transition-colors';
const CLOSE_ICON_CLASSES = 'h-6 w-6 text-gray-500';
const CONTENT_CLASSES = 'p-6 max-h-[calc(90vh-120px)] overflow-y-auto';
const GRID_CLASSES = 'grid grid-cols-4 gap-6';
const SECTION_CLASSES = 'space-y-3';
const SECTION_TITLE_CLASSES = 'text-sm font-medium text-gray-900';
const OPTIONS_CONTAINER_CLASSES = 'space-y-2';
const OPTION_BUTTON_BASE_CLASSES =
  'w-full text-left px-3 py-2 rounded-md text-sm transition-colors';
const OPTION_BUTTON_ACTIVE_CLASSES = 'bg-purple-50 text-purple-700 border border-purple-200';
const OPTION_BUTTON_INACTIVE_CLASSES = 'text-gray-700 hover:bg-gray-50';
const FOOTER_CLASSES = 'p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg';
const FOOTER_TEXT_CLASSES = 'text-sm text-gray-600';
const FOOTER_TEXT_BOLD_CLASSES = 'font-medium';
const CLEAR_BUTTON_CLASSES =
  'px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors';
const APPLY_BUTTON_CLASSES =
  'px-4 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors';

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

/**
 * Function: getDefaultFilterState
 * Description:
 * - Returns default filter state with all filters cleared
 * - Used for resetting filters to initial state
 *
 * Returns:
 * - FilterState: Default filter state object
 *
 * Example:
 * ```ts
 * const defaultState = getDefaultFilterState();
 * // Returns filter state with all defaults
 * ```
 */
const getDefaultFilterState = (): FilterState => ({
  status: [],
  difficulty: [],
  category: [],
  sortBy: DEFAULT_SORT_BY,
  viewMode: DEFAULT_VIEW_MODE,
  dateRange: DEFAULT_DATE_RANGE,
  questionCount: DEFAULT_QUESTION_COUNT,
  playCount: DEFAULT_PLAY_COUNT,
  tags: [],
});

/**
 * Component: SidebarFilter
 * Description:
 * - Sidebar filter modal component for filtering quizzes
 * - Supports filtering by status, difficulty, date range, and sort options
 * - YouTube-style modal design with backdrop
 * - Handles filter state management and clearing
 * - Shows active filter count and clear all functionality
 *
 * Parameters:
 * - isOpen (boolean): Whether the filter modal is open
 * - onToggle (function): Callback to toggle modal open/close
 * - filters (FilterState): Current filter state
 * - onFiltersChange (function): Callback when filters change
 * - className (string, optional): Additional CSS classes
 *
 * Returns:
 * - React.ReactElement: The sidebar filter component
 *
 * Example:
 * ```tsx
 * <SidebarFilter
 *   isOpen={isFilterOpen}
 *   onToggle={toggleFilter}
 *   filters={currentFilters}
 *   onFiltersChange={handleFiltersChange}
 * />
 * ```
 */
export const SidebarFilter: React.FC<SidebarFilterProps> = ({
  isOpen,
  onToggle,
  filters,
  onFiltersChange,
  className,
}) => {
  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]): void => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const toggleArrayFilter = <K extends keyof FilterState>(key: K, value: string): void => {
    const currentValues = filters[key] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];
    updateFilter(key, newValues as FilterState[K]);
  };

  const clearAllFilters = (): void => {
    onFiltersChange(getDefaultFilterState());
  };

  const hasActiveFilters = (): boolean => {
    return (
      filters.status.length > 0 ||
      filters.difficulty.length > 0 ||
      filters.category.length > 0 ||
      filters.sortBy !== DEFAULT_SORT_BY ||
      filters.dateRange !== DEFAULT_DATE_RANGE ||
      filters.questionCount !== DEFAULT_QUESTION_COUNT ||
      filters.playCount !== DEFAULT_PLAY_COUNT ||
      filters.tags.length > 0
    );
  };

  const getActiveFilterCount = (): number => {
    return Object.values(filters).flat().filter(Boolean).length;
  };

  const renderFilterOption = (
    option: FilterOption,
    isActive: boolean,
    onClick: () => void,
  ): React.ReactElement => (
    <button
      key={option.value}
      onClick={onClick}
      className={cn(
        OPTION_BUTTON_BASE_CLASSES,
        isActive ? OPTION_BUTTON_ACTIVE_CLASSES : OPTION_BUTTON_INACTIVE_CLASSES,
      )}
    >
      {option.label}
    </button>
  );

  return (
    <>
      {isOpen && <div className={BACKDROP_CLASSES} onClick={onToggle} />}

      <div
        className={cn(
          MODAL_BASE_CLASSES,
          isOpen ? MODAL_OPEN_CLASSES : MODAL_CLOSED_CLASSES,
          className,
        )}
      >
        <div className={HEADER_CLASSES}>
          <div className="flex items-center justify-between">
            <h3 className={HEADER_TITLE_CLASSES}>検索フィルター</h3>
            <button
              onClick={onToggle}
              className={CLOSE_BUTTON_CLASSES}
              aria-label="フィルターを閉じる"
            >
              <X className={CLOSE_ICON_CLASSES} />
            </button>
          </div>
        </div>

        <div className={CONTENT_CLASSES}>
          <div className={GRID_CLASSES}>
            <div className={SECTION_CLASSES}>
              <h4 className={SECTION_TITLE_CLASSES}>アップロード日</h4>
              <div className={OPTIONS_CONTAINER_CLASSES}>
                {DATE_RANGE_OPTIONS.map((option) =>
                  renderFilterOption(option, filters.dateRange === option.value, () =>
                    updateFilter(
                      'dateRange',
                      option.value as 'all' | 'today' | 'week' | 'month' | 'year',
                    ),
                  ),
                )}
              </div>
            </div>

            <div className={SECTION_CLASSES}>
              <h4 className={SECTION_TITLE_CLASSES}>難易度</h4>
              <div className={OPTIONS_CONTAINER_CLASSES}>
                {DIFFICULTY_OPTIONS.map((option) =>
                  renderFilterOption(option, filters.difficulty.includes(option.value), () =>
                    toggleArrayFilter('difficulty', option.value),
                  ),
                )}
              </div>
            </div>

            <div className={SECTION_CLASSES}>
              <h4 className={SECTION_TITLE_CLASSES}>並び順</h4>
              <div className={OPTIONS_CONTAINER_CLASSES}>
                {SORT_OPTIONS.map((option) =>
                  renderFilterOption(option, filters.sortBy === option.value, () =>
                    updateFilter('sortBy', option.value),
                  ),
                )}
              </div>
            </div>

            <div className={SECTION_CLASSES}>
              <h4 className={SECTION_TITLE_CLASSES}>ステータス</h4>
              <div className={OPTIONS_CONTAINER_CLASSES}>
                {STATUS_OPTIONS.map((option) =>
                  renderFilterOption(option, filters.status.includes(option.value), () =>
                    toggleArrayFilter('status', option.value),
                  ),
                )}
              </div>
            </div>
          </div>
        </div>

        <div className={FOOTER_CLASSES}>
          <div className="flex items-center justify-between">
            <div className={FOOTER_TEXT_CLASSES}>
              {hasActiveFilters() && (
                <span className={FOOTER_TEXT_BOLD_CLASSES}>
                  {getActiveFilterCount()} 個のアクティブフィルター
                </span>
              )}
            </div>
            <div className="flex gap-3">
              {hasActiveFilters() && (
                <button onClick={clearAllFilters} className={CLEAR_BUTTON_CLASSES}>
                  すべてクリア
                </button>
              )}
              <button onClick={onToggle} className={APPLY_BUTTON_CLASSES}>
                フィルターを適用
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
