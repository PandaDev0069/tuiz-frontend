'use client';

import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { TbAdjustmentsHorizontal } from 'react-icons/tb';
import { Button } from '../core/button';
import { cn } from '@/lib/utils';

export interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  onClear?: () => void;
  showFilters?: boolean;
  onFilterToggle?: () => void;
  isFilterOpen?: boolean;
  className?: string;
  defaultValue?: string;
  suggestions?: string[];
  onSuggestionClick?: (suggestion: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'クイズを検索...',
  onSearch,
  onClear,
  showFilters = false,
  onFilterToggle,
  isFilterOpen = false,
  className,
  defaultValue = '',
  suggestions = [],
  onSuggestionClick,
}) => {
  const [query, setQuery] = useState(defaultValue);
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = () => {
    if (query.trim() && onSearch) {
      onSearch(query.trim());
    }
  };

  const handleClear = () => {
    setQuery('');
    if (onClear) {
      onClear();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className={cn('relative w-full max-w-3xl', className)}>
      <div className="flex items-center gap-3">
        {/* Search Input Container - YouTube Style */}
        <div className="relative flex-1">
          {/* Search Icon */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-gray-500">
            <Search className="h-5 w-5" />
          </div>

          {/* Search Input - YouTube Style */}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className={cn(
              'search-input-custom pl-12 pr-20 h-11 w-full text-base border border-gray-300 rounded-lg bg-white transition-all duration-200 shadow-sm',
              isFocused
                ? 'border-purple-500 shadow-md ring-2 ring-purple-200'
                : 'hover:border-gray-400 hover:shadow-md',
            )}
          />

          {/* Clear Button - YouTube Style */}
          {query && (
            <button
              onClick={handleClear}
              className="absolute right-23 top-1/2 -translate-y-1/2 z-10 p-1.5 bg-gray-200 text-gray-600 transition-colors rounded-full hover:bg-gray-300"
              aria-label="検索をクリア"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {/* Search Button - YouTube Style */}
          <Button
            onClick={handleSearch}
            disabled={!query.trim()}
            className={cn(
              'absolute right-2 top-1/2 -translate-y-1/2 h-9 px-6 text-sm font-medium transition-all duration-200 rounded-full',
              !query.trim()
                ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400'
                : 'bg-purple-600 hover:bg-purple-700 text-white shadow-sm hover:shadow-md',
            )}
          >
            検索
          </Button>
        </div>

        {/* Filter Toggle Button - YouTube Style */}
        {showFilters && onFilterToggle && (
          <Button
            variant="outline"
            size="sm"
            onClick={onFilterToggle}
            className={cn(
              'h-11 px-3 border border-gray-300 rounded-full transition-all duration-200 flex-shrink-0 bg-white hover:bg-gray-50',
              isFilterOpen
                ? 'border-purple-500 text-purple-600 bg-purple-50 hover:bg-purple-100'
                : 'text-gray-700 hover:border-gray-400 hover:shadow-sm',
            )}
          >
            <TbAdjustmentsHorizontal className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Search Suggestions - YouTube Style */}
      {isFocused && (query || suggestions.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-20 max-h-60 overflow-y-auto">
          {suggestions.length > 0 && (
            <>
              <div className="p-3 text-sm text-gray-500 border-b border-gray-100 font-medium">
                {query ? '検索候補' : '最近の検索'}
              </div>
              <div className="p-2">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setQuery(suggestion);
                      if (onSuggestionClick) {
                        onSuggestionClick(suggestion);
                      }
                    }}
                    className="px-3 py-2.5 hover:bg-gray-50 rounded-lg cursor-pointer text-sm text-gray-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Search className="h-4 w-4 text-gray-400" />
                      <span>{suggestion}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
