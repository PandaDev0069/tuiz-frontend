// ====================================================
// File Name   : LibraryFilters.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-17
// Last Update : 2025-09-17
//
// Description:
// - Filter component for quiz library (my-library and public-browse)
// - Provides search, category, status, difficulty, and sort filters
// - Implements debounced filter application to prevent rapid API calls
// - Displays active filter pills with remove functionality
// - Supports expandable/collapsible filter controls
// - Shows filter count badge when filters are active
//
// Notes:
// - Client-only component (requires 'use client')
// - Status filters apply immediately, other filters are debounced (150ms)
// - Different default sort values for my-library vs public-browse
// ====================================================

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/core/button';
import { SearchBar } from '@/components/ui/forms/search-bar';
import { Select } from '@/components/ui/forms/select';
import { X, Filter, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

const DEBOUNCE_DELAY_MS = 150;

const FILTER_VALUE_ALL = 'all';
const SORT_UPDATED_DESC = 'updated_desc';
const SORT_PLAYS_DESC = 'plays_desc';
const STATUS_DRAFTS = 'drafts';
const STATUS_PUBLISHED = 'published';
const DIFFICULTY_EASY = 'easy';
const DIFFICULTY_MEDIUM = 'medium';
const DIFFICULTY_HARD = 'hard';
const DIFFICULTY_EXPERT = 'expert';

const STATUS_LABELS: Record<string, string> = {
  [STATUS_PUBLISHED]: '公開済み',
  [STATUS_DRAFTS]: '下書き',
};

const DIFFICULTY_LABELS: Record<string, string> = {
  [DIFFICULTY_EASY]: '簡単',
  [DIFFICULTY_MEDIUM]: '普通',
  [DIFFICULTY_HARD]: '難しい',
  [DIFFICULTY_EXPERT]: '上級者',
};

const SORT_LABELS: Record<string, string> = {
  [SORT_UPDATED_DESC]: '更新日順（新しい順）',
  created_desc: '作成日順（新しい順）',
  title_asc: 'タイトル順（A-Z）',
  [SORT_PLAYS_DESC]: '人気順',
  questions_desc: '問題数順（多い順）',
};

const CONTAINER_CLASSES = 'space-y-4 mb-6';
const SEARCH_CONTAINER_CLASSES = 'w-full max-w-md';
const FILTER_CONTROLS_CONTAINER_CLASSES = 'space-y-4';
const FILTER_HEADER_CONTAINER_CLASSES = 'flex items-center justify-between';
const FILTER_HEADER_LEFT_CLASSES = 'flex items-center gap-2';
const FILTER_ICON_CLASSES = 'h-5 w-5 text-gray-600';
const FILTER_TITLE_CLASSES = 'text-lg font-medium text-gray-900';
const FILTER_BADGE_CLASSES = 'bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full';
const FILTER_HEADER_RIGHT_CLASSES = 'flex items-center gap-2';
const BUTTON_VARIANT_OUTLINE = 'outline';
const BUTTON_SIZE_SM = 'sm';
const BUTTON_TEXT_CLASSES = 'text-gray-600 hover:text-gray-800';
const ICON_SIZE_SMALL = 'h-4 w-4 mr-1';
const PILLS_CONTAINER_CLASSES = 'flex flex-wrap gap-2';
const PILL_BASE_CLASSES =
  'inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full border border-blue-200';
const PILL_REMOVE_BUTTON_CLASSES = 'ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors';
const PILL_REMOVE_ICON_CLASSES = 'h-3 w-3';
const FILTER_GRID_BASE_CLASSES =
  'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 transition-all duration-300';
const FILTER_GRID_EXPANDED_CLASSES = 'opacity-100 max-h-96';
const FILTER_GRID_COLLAPSED_CLASSES = 'opacity-0 max-h-0 overflow-hidden';
const FILTER_FIELD_CONTAINER_CLASSES = 'space-y-2';
const FILTER_LABEL_CLASSES = 'text-sm font-medium text-gray-700';

export interface LibraryFiltersProps {
  type: 'my-library' | 'public-browse';
  filters: {
    category?: string;
    status?: 'all' | 'drafts' | 'published';
    sort: string;
    difficulty?: string;
  };
  categories: string[];
  onFiltersChange: (filters: Partial<LibraryFiltersProps['filters']>) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

interface FilterPill {
  id: string;
  label: string;
  value: string;
  onRemove: () => void;
}

/**
 * Component: LibraryFilters
 * Description:
 * - Comprehensive filter component for quiz library views
 * - Supports both my-library and public-browse filter types
 * - Provides search functionality with debounced input
 * - Displays active filters as removable pills
 * - Implements expandable/collapsible filter controls
 * - Shows filter count badge when filters are active
 * - Applies status filters immediately, debounces other filters
 *
 * Parameters:
 * - type ('my-library' | 'public-browse'): Filter type determining available options
 * - filters (object): Current filter values
 * - categories (string[]): Available category options
 * - onFiltersChange (function): Callback when filters change
 * - searchQuery (string, optional): Current search query
 * - onSearchChange (function, optional): Callback when search query changes
 *
 * Returns:
 * - React.ReactElement: The library filters component
 *
 * Example:
 * ```tsx
 * <LibraryFilters
 *   type="my-library"
 *   filters={filters}
 *   categories={categories}
 *   onFiltersChange={(newFilters) => setFilters(newFilters)}
 *   searchQuery={searchQuery}
 *   onSearchChange={(query) => setSearchQuery(query)}
 * />
 * ```
 */
export const LibraryFilters: React.FC<LibraryFiltersProps> = ({
  type,
  filters,
  categories,
  onFiltersChange,
  searchQuery = '',
  onSearchChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasActiveFilters, setHasActiveFilters] = useState(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const hasFilters =
      (filters.category && filters.category !== FILTER_VALUE_ALL) ||
      (filters.status && filters.status !== FILTER_VALUE_ALL) ||
      (filters.difficulty && filters.difficulty !== FILTER_VALUE_ALL) ||
      (filters.sort && filters.sort !== SORT_UPDATED_DESC) ||
      (searchQuery && searchQuery.trim() !== '');

    setHasActiveFilters(!!hasFilters);
  }, [filters, searchQuery]);

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Function: applyStatusFilter
   * Description:
   * - Applies status filter immediately without debouncing
   * - Validates status value for my-library type
   * - Clears status for public-browse type
   *
   * Parameters:
   * - status (string): Status value to apply
   */
  const applyStatusFilter = useCallback(
    (status: string) => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      if (
        type === 'my-library' &&
        [FILTER_VALUE_ALL, STATUS_DRAFTS, STATUS_PUBLISHED].includes(status)
      ) {
        const validatedStatus = status as 'all' | 'drafts' | 'published';
        onFiltersChange({ status: validatedStatus });
      } else if (type === 'public-browse') {
        onFiltersChange({ status: undefined });
      }
    },
    [type, onFiltersChange],
  );

  /**
   * Function: applyOtherFilters
   * Description:
   * - Applies category, difficulty, and sort filters with debouncing
   * - Validates and sanitizes filter values
   * - Converts 'all' values to undefined
   *
   * Parameters:
   * - newFilters (Partial<LibraryFiltersProps['filters']>): New filter values to apply
   */
  const applyOtherFilters = useCallback(
    (newFilters: Partial<LibraryFiltersProps['filters']>) => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      debounceTimeoutRef.current = setTimeout(() => {
        const validatedFilters: Partial<LibraryFiltersProps['filters']> = {};

        if (newFilters.category !== undefined) {
          validatedFilters.category =
            newFilters.category === FILTER_VALUE_ALL ? undefined : newFilters.category;
        }

        if (newFilters.difficulty !== undefined) {
          validatedFilters.difficulty =
            newFilters.difficulty === FILTER_VALUE_ALL ? undefined : newFilters.difficulty;
        }

        if (newFilters.sort !== undefined) {
          validatedFilters.sort = newFilters.sort;
        }

        onFiltersChange(validatedFilters);
      }, DEBOUNCE_DELAY_MS);
    },
    [onFiltersChange],
  );

  /**
   * Function: applyFilters
   * Description:
   * - Main filter application function
   * - Routes status filters to immediate application
   * - Routes other filters to debounced application
   *
   * Parameters:
   * - newFilters (Partial<LibraryFiltersProps['filters']>): New filter values to apply
   */
  const applyFilters = useCallback(
    (newFilters: Partial<LibraryFiltersProps['filters']>) => {
      if (newFilters.status !== undefined) {
        applyStatusFilter(newFilters.status);
        return;
      }

      applyOtherFilters(newFilters);
    },
    [applyStatusFilter, applyOtherFilters],
  );

  /**
   * Function: clearAllFilters
   * Description:
   * - Clears all filters and resets to default values
   * - Clears search query if provided
   * - Applies immediately without debouncing
   */
  const clearAllFilters = () => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    const defaultFilters = {
      category: undefined,
      status: (type === 'my-library' ? FILTER_VALUE_ALL : undefined) as
        | 'all'
        | 'drafts'
        | 'published'
        | undefined,
      sort: type === 'my-library' ? SORT_UPDATED_DESC : SORT_PLAYS_DESC,
      difficulty: undefined,
    };

    onFiltersChange(defaultFilters);

    if (onSearchChange) {
      onSearchChange('');
    }
  };

  /**
   * Function: removeFilter
   * Description:
   * - Removes a specific filter by type
   * - Resets to default value for that filter type
   * - Applies immediately without debouncing
   *
   * Parameters:
   * - filterType (keyof LibraryFiltersProps['filters']): Type of filter to remove
   */
  const removeFilter = (filterType: keyof LibraryFiltersProps['filters']) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    const newFilters: Partial<LibraryFiltersProps['filters']> = {};

    switch (filterType) {
      case 'category':
        newFilters.category = undefined;
        break;
      case 'status':
        newFilters.status = type === 'my-library' ? FILTER_VALUE_ALL : undefined;
        break;
      case 'difficulty':
        newFilters.difficulty = undefined;
        break;
      case 'sort':
        newFilters.sort = type === 'my-library' ? SORT_UPDATED_DESC : SORT_PLAYS_DESC;
        break;
    }

    onFiltersChange(newFilters);
  };

  /**
   * Function: generateFilterPills
   * Description:
   * - Generates array of filter pills for active filters
   * - Includes category, status, difficulty, sort, and search pills
   * - Uses label mappings for display text
   *
   * Returns:
   * - FilterPill[]: Array of filter pill objects
   */
  const generateFilterPills = (): FilterPill[] => {
    const pills: FilterPill[] = [];

    if (filters.category && filters.category !== FILTER_VALUE_ALL) {
      pills.push({
        id: 'category',
        label: `カテゴリ: ${filters.category}`,
        value: filters.category,
        onRemove: () => removeFilter('category'),
      });
    }

    if (filters.status && filters.status !== FILTER_VALUE_ALL) {
      pills.push({
        id: 'status',
        label: `ステータス: ${STATUS_LABELS[filters.status] || filters.status}`,
        value: filters.status,
        onRemove: () => removeFilter('status'),
      });
    }

    if (filters.difficulty && filters.difficulty !== FILTER_VALUE_ALL) {
      pills.push({
        id: 'difficulty',
        label: `難易度: ${DIFFICULTY_LABELS[filters.difficulty] || filters.difficulty}`,
        value: filters.difficulty,
        onRemove: () => removeFilter('difficulty'),
      });
    }

    if (
      filters.sort &&
      filters.sort !== (type === 'my-library' ? SORT_UPDATED_DESC : SORT_PLAYS_DESC)
    ) {
      pills.push({
        id: 'sort',
        label: `並び順: ${SORT_LABELS[filters.sort] || filters.sort}`,
        value: filters.sort,
        onRemove: () => removeFilter('sort'),
      });
    }

    if (searchQuery && searchQuery.trim() !== '') {
      pills.push({
        id: 'search',
        label: `検索: "${searchQuery}"`,
        value: searchQuery,
        onRemove: () => onSearchChange?.(''),
      });
    }

    return pills;
  };

  const categoryOptions = [
    { value: FILTER_VALUE_ALL, label: 'すべてのカテゴリ' },
    ...categories.map((category) => ({ value: category, label: category })),
  ];

  const statusOptions = [
    { value: FILTER_VALUE_ALL, label: 'すべてのステータス' },
    { value: STATUS_PUBLISHED, label: STATUS_LABELS[STATUS_PUBLISHED] },
    { value: STATUS_DRAFTS, label: STATUS_LABELS[STATUS_DRAFTS] },
  ];

  const difficultyOptions = [
    { value: FILTER_VALUE_ALL, label: 'すべての難易度' },
    { value: DIFFICULTY_EASY, label: DIFFICULTY_LABELS[DIFFICULTY_EASY] },
    { value: DIFFICULTY_MEDIUM, label: DIFFICULTY_LABELS[DIFFICULTY_MEDIUM] },
    { value: DIFFICULTY_HARD, label: DIFFICULTY_LABELS[DIFFICULTY_HARD] },
    { value: DIFFICULTY_EXPERT, label: DIFFICULTY_LABELS[DIFFICULTY_EXPERT] },
  ];

  const sortOptions = [
    { value: SORT_UPDATED_DESC, label: SORT_LABELS[SORT_UPDATED_DESC] },
    { value: 'created_desc', label: SORT_LABELS['created_desc'] },
    { value: 'title_asc', label: SORT_LABELS['title_asc'] },
    ...(type === 'public-browse'
      ? [
          { value: SORT_PLAYS_DESC, label: SORT_LABELS[SORT_PLAYS_DESC] },
          { value: 'questions_desc', label: SORT_LABELS['questions_desc'] },
        ]
      : []),
  ];

  const filterPills = generateFilterPills();

  return (
    <div className={CONTAINER_CLASSES}>
      {onSearchChange && (
        <div className={SEARCH_CONTAINER_CLASSES}>
          <SearchBar
            placeholder={
              type === 'my-library' ? 'マイライブラリを検索...' : 'パブリッククイズを検索...'
            }
            defaultValue={searchQuery}
            onSearch={onSearchChange}
            onClear={() => onSearchChange('')}
          />
        </div>
      )}

      <div className={FILTER_CONTROLS_CONTAINER_CLASSES}>
        <div className={FILTER_HEADER_CONTAINER_CLASSES}>
          <div className={FILTER_HEADER_LEFT_CLASSES}>
            <Filter className={FILTER_ICON_CLASSES} />
            <h3 className={FILTER_TITLE_CLASSES}>フィルター</h3>
            {hasActiveFilters && (
              <span className={FILTER_BADGE_CLASSES}>{filterPills.length} 個のフィルター</span>
            )}
          </div>

          <div className={FILTER_HEADER_RIGHT_CLASSES}>
            {hasActiveFilters && (
              <Button
                variant={BUTTON_VARIANT_OUTLINE}
                size={BUTTON_SIZE_SM}
                onClick={clearAllFilters}
                className={BUTTON_TEXT_CLASSES}
              >
                <RotateCcw className={ICON_SIZE_SMALL} />
                すべてクリア
              </Button>
            )}

            <Button
              variant={BUTTON_VARIANT_OUTLINE}
              size={BUTTON_SIZE_SM}
              onClick={() => setIsExpanded(!isExpanded)}
              className={BUTTON_TEXT_CLASSES}
            >
              {isExpanded ? '折りたたむ' : '展開'}
            </Button>
          </div>
        </div>

        {filterPills.length > 0 && (
          <div className={PILLS_CONTAINER_CLASSES}>
            {filterPills.map((pill) => (
              <div key={pill.id} className={PILL_BASE_CLASSES}>
                <span>{pill.label}</span>
                <button
                  onClick={pill.onRemove}
                  className={PILL_REMOVE_BUTTON_CLASSES}
                  aria-label={`${pill.label} を削除`}
                >
                  <X className={PILL_REMOVE_ICON_CLASSES} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div
          className={cn(
            FILTER_GRID_BASE_CLASSES,
            isExpanded ? FILTER_GRID_EXPANDED_CLASSES : FILTER_GRID_COLLAPSED_CLASSES,
          )}
        >
          <div className={FILTER_FIELD_CONTAINER_CLASSES}>
            <label className={FILTER_LABEL_CLASSES}>カテゴリ</label>
            <Select
              value={filters.category || FILTER_VALUE_ALL}
              onValueChange={(value) => applyFilters({ category: value })}
              placeholder="カテゴリ選択"
              options={categoryOptions}
            />
          </div>

          {type === 'my-library' && (
            <div className={FILTER_FIELD_CONTAINER_CLASSES}>
              <label className={FILTER_LABEL_CLASSES}>ステータス</label>
              <Select
                value={filters.status || FILTER_VALUE_ALL}
                onValueChange={(value) =>
                  applyFilters({
                    status: value as 'all' | 'drafts' | 'published',
                  })
                }
                placeholder="ステータス"
                options={statusOptions}
              />
            </div>
          )}

          {type === 'public-browse' && (
            <div className={FILTER_FIELD_CONTAINER_CLASSES}>
              <label className={FILTER_LABEL_CLASSES}>難易度</label>
              <Select
                value={filters.difficulty || FILTER_VALUE_ALL}
                onValueChange={(value) => applyFilters({ difficulty: value })}
                placeholder="難易度"
                options={difficultyOptions}
              />
            </div>
          )}

          <div className={FILTER_FIELD_CONTAINER_CLASSES}>
            <label className={FILTER_LABEL_CLASSES}>並び順</label>
            <Select
              value={filters.sort}
              onValueChange={(value) => applyFilters({ sort: value })}
              placeholder="並び順"
              options={sortOptions}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
