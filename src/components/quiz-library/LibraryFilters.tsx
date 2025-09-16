'use client';

import React from 'react';
import { Button } from '@/components/ui/core/button';
import { SearchBar } from '@/components/ui/forms/search-bar';
import { Select } from '@/components/ui/forms/select';

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

export const LibraryFilters: React.FC<LibraryFiltersProps> = ({
  type,
  filters,
  categories,
  onFiltersChange,
  searchQuery = '',
  onSearchChange,
}) => {
  const clearFilters = () => {
    onFiltersChange({
      category: undefined,
      status: 'all',
      sort: 'updated_at_desc',
      difficulty: undefined,
    });
    if (onSearchChange) {
      onSearchChange('');
    }
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
    { value: 'updated_at_desc', label: '更新日順（新しい順）' },
    { value: 'updated_at_asc', label: '更新日順（古い順）' },
    { value: 'created_at_desc', label: '作成日順（新しい順）' },
    { value: 'created_at_asc', label: '作成日順（古い順）' },
    { value: 'title_asc', label: 'タイトル順（A-Z）' },
    { value: 'title_desc', label: 'タイトル順（Z-A）' },
    ...(type === 'public-browse'
      ? [
          { value: 'times_played_desc', label: '人気順' },
          { value: 'difficulty_asc', label: '難易度順（簡単→難しい）' },
          { value: 'difficulty_desc', label: '難易度順（難しい→簡単）' },
        ]
      : []),
  ];

  return (
    <div className="space-y-4 mb-6">
      {/* Search Bar */}
      {onSearchChange && (
        <SearchBar
          placeholder={
            type === 'my-library' ? 'マイライブラリを検索...' : 'パブリッククイズを検索...'
          }
          defaultValue={searchQuery}
          onSearch={onSearchChange}
          onClear={() => onSearchChange('')}
        />
      )}

      {/* Filter Controls */}
      <div className="flex flex-wrap gap-4">
        {/* Category Filter */}
        <div className="w-[180px]">
          <Select
            value={filters.category || 'all'}
            onValueChange={(value) =>
              onFiltersChange({
                category: value === 'all' ? undefined : value,
              })
            }
            placeholder="カテゴリ選択"
            options={categoryOptions}
          />
        </div>

        {/* Status Filter (My Library only) */}
        {type === 'my-library' && (
          <div className="w-[180px]">
            <Select
              value={filters.status || 'all'}
              onValueChange={(value) =>
                onFiltersChange({ status: value as 'all' | 'drafts' | 'published' })
              }
              placeholder="ステータス"
              options={statusOptions}
            />
          </div>
        )}

        {/* Difficulty Filter (Public Browse only) */}
        {type === 'public-browse' && (
          <div className="w-[180px]">
            <Select
              value={filters.difficulty || 'all'}
              onValueChange={(value) =>
                onFiltersChange({
                  difficulty: value === 'all' ? undefined : value,
                })
              }
              placeholder="難易度"
              options={difficultyOptions}
            />
          </div>
        )}

        {/* Sort Filter */}
        <div className="w-[180px]">
          <Select
            value={filters.sort}
            onValueChange={(value) => onFiltersChange({ sort: value })}
            placeholder="並び順"
            options={sortOptions}
          />
        </div>

        {/* Clear Filters Button */}
        <Button variant="outline" onClick={clearFilters} className="whitespace-nowrap">
          フィルターをクリア
        </Button>
      </div>
    </div>
  );
};
