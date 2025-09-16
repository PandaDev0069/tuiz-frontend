'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/core/button';
import { SearchBar } from '@/components/ui/forms/search-bar';
import { Select } from '@/components/ui/forms/select';
import { X, Filter, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

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

  // Check if there are active filters
  useEffect(() => {
    const hasFilters =
      (filters.category && filters.category !== 'all') ||
      (filters.status && filters.status !== 'all') ||
      (filters.difficulty && filters.difficulty !== 'all') ||
      (filters.sort && filters.sort !== 'updated_desc') ||
      (searchQuery && searchQuery.trim() !== '');

    setHasActiveFilters(!!hasFilters);
  }, [filters, searchQuery]);

  // Cleanup debounce timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Apply filters with validation and debouncing
  const applyFilters = useCallback(
    (newFilters: Partial<LibraryFiltersProps['filters']>) => {
      // Clear any existing timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // Debounce the filter application to prevent rapid API calls
      debounceTimeoutRef.current = setTimeout(() => {
        // Validate and sanitize the new filters
        const validatedFilters: Partial<LibraryFiltersProps['filters']> = {};

        if (newFilters.category !== undefined) {
          validatedFilters.category =
            newFilters.category === 'all' ? undefined : newFilters.category;
        }

        if (newFilters.status !== undefined) {
          // Only allow valid status values for my-library
          if (type === 'my-library' && ['all', 'drafts', 'published'].includes(newFilters.status)) {
            validatedFilters.status = newFilters.status as 'all' | 'drafts' | 'published';
          } else if (type === 'public-browse') {
            validatedFilters.status = undefined;
          }
        }

        if (newFilters.difficulty !== undefined) {
          validatedFilters.difficulty =
            newFilters.difficulty === 'all' ? undefined : newFilters.difficulty;
        }

        if (newFilters.sort !== undefined) {
          validatedFilters.sort = newFilters.sort;
        }

        // Apply the validated filters
        onFiltersChange(validatedFilters);
      }, 150); // 150ms debounce
    },
    [type, onFiltersChange],
  );

  // Clear all filters (immediate, no debounce)
  const clearAllFilters = () => {
    // Clear any pending debounced calls
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    const defaultFilters = {
      category: undefined,
      status: (type === 'my-library' ? 'all' : undefined) as
        | 'all'
        | 'drafts'
        | 'published'
        | undefined,
      sort: type === 'my-library' ? 'updated_desc' : 'plays_desc',
      difficulty: undefined,
    };

    onFiltersChange(defaultFilters);

    if (onSearchChange) {
      onSearchChange('');
    }
  };

  // Remove specific filter (immediate, no debounce)
  const removeFilter = (filterType: keyof LibraryFiltersProps['filters']) => {
    // Clear any pending debounced calls
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    const newFilters: Partial<LibraryFiltersProps['filters']> = {};

    switch (filterType) {
      case 'category':
        newFilters.category = undefined;
        break;
      case 'status':
        newFilters.status = type === 'my-library' ? 'all' : undefined;
        break;
      case 'difficulty':
        newFilters.difficulty = undefined;
        break;
      case 'sort':
        newFilters.sort = type === 'my-library' ? 'updated_desc' : 'plays_desc';
        break;
    }

    onFiltersChange(newFilters);
  };

  // Generate filter pills
  const generateFilterPills = (): FilterPill[] => {
    const pills: FilterPill[] = [];

    if (filters.category && filters.category !== 'all') {
      pills.push({
        id: 'category',
        label: `カテゴリ: ${filters.category}`,
        value: filters.category,
        onRemove: () => removeFilter('category'),
      });
    }

    if (filters.status && filters.status !== 'all') {
      const statusLabels = {
        published: '公開済み',
        drafts: '下書き',
      };
      pills.push({
        id: 'status',
        label: `ステータス: ${statusLabels[filters.status] || filters.status}`,
        value: filters.status,
        onRemove: () => removeFilter('status'),
      });
    }

    if (filters.difficulty && filters.difficulty !== 'all') {
      const difficultyLabels = {
        easy: '簡単',
        medium: '普通',
        hard: '難しい',
        expert: '上級者',
      };
      pills.push({
        id: 'difficulty',
        label: `難易度: ${difficultyLabels[filters.difficulty as keyof typeof difficultyLabels] || filters.difficulty}`,
        value: filters.difficulty,
        onRemove: () => removeFilter('difficulty'),
      });
    }

    if (filters.sort && filters.sort !== (type === 'my-library' ? 'updated_desc' : 'plays_desc')) {
      const sortLabels = {
        updated_desc: '更新日順（新しい順）',
        created_desc: '作成日順（新しい順）',
        title_asc: 'タイトル順（A-Z）',
        plays_desc: '人気順',
        questions_desc: '問題数順（多い順）',
      };
      pills.push({
        id: 'sort',
        label: `並び順: ${sortLabels[filters.sort as keyof typeof sortLabels] || filters.sort}`,
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

  // Category options
  const categoryOptions = [
    { value: 'all', label: 'すべてのカテゴリ' },
    ...categories.map((category) => ({ value: category, label: category })),
  ];

  // Status options (for my library)
  const statusOptions = [
    { value: 'all', label: 'すべてのステータス' },
    { value: 'published', label: '公開済み' },
    { value: 'drafts', label: '下書き' },
  ];

  // Difficulty options (for public browse)
  const difficultyOptions = [
    { value: 'all', label: 'すべての難易度' },
    { value: 'easy', label: '簡単' },
    { value: 'medium', label: '普通' },
    { value: 'hard', label: '難しい' },
    { value: 'expert', label: '上級者' },
  ];

  // Sort options
  const sortOptions = [
    { value: 'updated_desc', label: '更新日順（新しい順）' },
    { value: 'created_desc', label: '作成日順（新しい順）' },
    { value: 'title_asc', label: 'タイトル順（A-Z）' },
    ...(type === 'public-browse'
      ? [
          { value: 'plays_desc', label: '人気順' },
          { value: 'questions_desc', label: '問題数順（多い順）' },
        ]
      : []),
  ];

  const filterPills = generateFilterPills();

  return (
    <div className="space-y-4 mb-6">
      {/* Search Bar */}
      {onSearchChange && (
        <div className="w-full max-w-md">
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

      {/* Filter Controls */}
      <div className="space-y-4">
        {/* Filter Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-medium text-gray-900">フィルター</h3>
            {hasActiveFilters && (
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                {filterPills.length} 個のフィルター
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="text-gray-600 hover:text-gray-800"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                すべてクリア
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-600 hover:text-gray-800"
            >
              {isExpanded ? '折りたたむ' : '展開'}
            </Button>
          </div>
        </div>

        {/* Active Filter Pills */}
        {filterPills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {filterPills.map((pill) => (
              <div
                key={pill.id}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full border border-blue-200"
              >
                <span>{pill.label}</span>
                <button
                  onClick={pill.onRemove}
                  className="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                  aria-label={`${pill.label} を削除`}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Filter Controls */}
        <div
          className={cn(
            'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 transition-all duration-300',
            isExpanded ? 'opacity-100 max-h-96' : 'opacity-0 max-h-0 overflow-hidden',
          )}
        >
          {/* Category Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">カテゴリ</label>
            <Select
              value={filters.category || 'all'}
              onValueChange={(value) =>
                applyFilters({
                  category: value,
                })
              }
              placeholder="カテゴリ選択"
              options={categoryOptions}
            />
          </div>

          {/* Status Filter (My Library only) */}
          {type === 'my-library' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">ステータス</label>
              <Select
                value={filters.status || 'all'}
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

          {/* Difficulty Filter (Public Browse only) */}
          {type === 'public-browse' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">難易度</label>
              <Select
                value={filters.difficulty || 'all'}
                onValueChange={(value) =>
                  applyFilters({
                    difficulty: value,
                  })
                }
                placeholder="難易度"
                options={difficultyOptions}
              />
            </div>
          )}

          {/* Sort Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">並び順</label>
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
