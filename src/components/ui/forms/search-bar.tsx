// ====================================================
// File Name   : search-bar.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-08-25
// Last Update : 2025-09-16
//
// Description:
// - Search bar component with YouTube-style design
// - Supports search suggestions and filter toggle
// - Includes clear button and search button
// - Shows suggestions dropdown when focused
// - Handles keyboard navigation (Enter key)
//
// Notes:
// - Client component (uses 'use client' directive)
// - Uses React hooks for state management
// - YouTube-inspired UI design
// ====================================================

'use client';

import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { TbAdjustmentsHorizontal } from 'react-icons/tb';
import { Button } from '../core/button';
import { cn } from '@/lib/utils';

const DEFAULT_PLACEHOLDER = 'クイズを検索...';
const DEFAULT_SHOW_FILTERS = false;
const DEFAULT_IS_FILTER_OPEN = false;
const DEFAULT_VALUE = '';
const DEFAULT_SUGGESTIONS: string[] = [];

const KEY_ENTER = 'Enter';

const CONTAINER_CLASSES = 'relative w-full max-w-3xl';
const INPUT_WRAPPER_CLASSES = 'flex items-center gap-3';
const SEARCH_INPUT_CONTAINER_CLASSES = 'relative flex-1';
const SEARCH_ICON_WRAPPER_CLASSES = 'absolute left-4 top-1/2 -translate-y-1/2 z-10 text-gray-500';
const SEARCH_ICON_CLASSES = 'h-5 w-5';
const INPUT_BASE_CLASSES =
  'search-input-custom pl-12 pr-20 h-11 w-full text-base border border-gray-300 rounded-lg bg-white transition-all duration-200 shadow-sm';
const INPUT_FOCUSED_CLASSES = 'border-purple-500 shadow-md ring-2 ring-purple-200';
const INPUT_HOVER_CLASSES = 'hover:border-gray-400 hover:shadow-md';
const CLEAR_BUTTON_CLASSES =
  'absolute right-23 top-1/2 -translate-y-1/2 z-10 p-1.5 bg-gray-200 text-gray-600 transition-colors rounded-full hover:bg-gray-300';
const CLEAR_ICON_CLASSES = 'h-4 w-4';
const SEARCH_BUTTON_BASE_CLASSES =
  'absolute right-2 top-1/2 -translate-y-1/2 h-9 px-6 text-sm font-medium transition-all duration-200 rounded-full';
const SEARCH_BUTTON_DISABLED_CLASSES = 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400';
const SEARCH_BUTTON_ACTIVE_CLASSES =
  'bg-purple-600 hover:bg-purple-700 text-white shadow-sm hover:shadow-md';
const FILTER_BUTTON_BASE_CLASSES =
  'h-11 px-3 border border-gray-300 rounded-full transition-all duration-200 flex-shrink-0 bg-white hover:bg-gray-50';
const FILTER_BUTTON_OPEN_CLASSES =
  'border-purple-500 text-purple-600 bg-purple-50 hover:bg-purple-100';
const FILTER_BUTTON_CLOSED_CLASSES = 'text-gray-700 hover:border-gray-400 hover:shadow-sm';
const FILTER_ICON_CLASSES = 'h-5 w-5';
const SUGGESTIONS_CONTAINER_CLASSES =
  'absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-20 max-h-60 overflow-y-auto';
const SUGGESTIONS_HEADER_CLASSES = 'p-3 text-sm text-gray-500 border-b border-gray-100 font-medium';
const SUGGESTIONS_LIST_CLASSES = 'p-2';
const SUGGESTION_ITEM_CLASSES =
  'px-3 py-2.5 hover:bg-gray-50 rounded-lg cursor-pointer text-sm text-gray-700 transition-colors';
const SUGGESTION_ITEM_CONTENT_CLASSES = 'flex items-center gap-3';
const SUGGESTION_ICON_CLASSES = 'h-4 w-4 text-gray-400';

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

/**
 * Component: SearchBar
 * Description:
 * - Search bar component with YouTube-style design
 * - Supports search suggestions and filter toggle
 * - Includes clear button and search button
 * - Shows suggestions dropdown when focused
 * - Handles keyboard navigation (Enter key to search)
 * - Manages focus state for suggestions display
 *
 * Parameters:
 * - placeholder (string, optional): Placeholder text (default: 'クイズを検索...')
 * - onSearch (function, optional): Callback when search is triggered
 * - onClear (function, optional): Callback when clear button is clicked
 * - showFilters (boolean, optional): Whether to show filter toggle button (default: false)
 * - onFilterToggle (function, optional): Callback when filter toggle is clicked
 * - isFilterOpen (boolean, optional): Whether filter is currently open (default: false)
 * - className (string, optional): Additional CSS classes
 * - defaultValue (string, optional): Default search query value (default: '')
 * - suggestions (string[], optional): Array of search suggestions (default: [])
 * - onSuggestionClick (function, optional): Callback when a suggestion is clicked
 *
 * Returns:
 * - React.ReactElement: The search bar component
 *
 * Example:
 * ```tsx
 * <SearchBar
 *   placeholder="Search quizzes..."
 *   onSearch={(query) => console.log(query)}
 *   suggestions={['quiz 1', 'quiz 2']}
 * />
 * ```
 */
export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = DEFAULT_PLACEHOLDER,
  onSearch,
  onClear,
  showFilters = DEFAULT_SHOW_FILTERS,
  onFilterToggle,
  isFilterOpen = DEFAULT_IS_FILTER_OPEN,
  className,
  defaultValue = DEFAULT_VALUE,
  suggestions = DEFAULT_SUGGESTIONS,
  onSuggestionClick,
}) => {
  const [query, setQuery] = useState(defaultValue);
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = (): void => {
    if (query.trim() && onSearch) {
      onSearch(query.trim());
    }
  };

  const handleClear = (): void => {
    setQuery(DEFAULT_VALUE);
    if (onClear) {
      onClear();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent): void => {
    if (e.key === KEY_ENTER) {
      handleSearch();
    }
  };

  const handleSuggestionClick = (suggestion: string): void => {
    setQuery(suggestion);
    if (onSuggestionClick) {
      onSuggestionClick(suggestion);
    }
  };

  const shouldShowSuggestions = isFocused && (query || suggestions.length > 0);

  return (
    <div className={cn(CONTAINER_CLASSES, className)}>
      <div className={INPUT_WRAPPER_CLASSES}>
        <div className={SEARCH_INPUT_CONTAINER_CLASSES}>
          <div className={SEARCH_ICON_WRAPPER_CLASSES}>
            <Search className={SEARCH_ICON_CLASSES} />
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className={cn(
              INPUT_BASE_CLASSES,
              isFocused ? INPUT_FOCUSED_CLASSES : INPUT_HOVER_CLASSES,
            )}
          />

          {query && (
            <button
              onClick={handleClear}
              className={CLEAR_BUTTON_CLASSES}
              aria-label="検索をクリア"
            >
              <X className={CLEAR_ICON_CLASSES} />
            </button>
          )}

          <Button
            onClick={handleSearch}
            disabled={!query.trim()}
            className={cn(
              SEARCH_BUTTON_BASE_CLASSES,
              !query.trim() ? SEARCH_BUTTON_DISABLED_CLASSES : SEARCH_BUTTON_ACTIVE_CLASSES,
            )}
          >
            検索
          </Button>
        </div>

        {showFilters && onFilterToggle && (
          <Button
            variant="outline"
            size="sm"
            onClick={onFilterToggle}
            className={cn(
              FILTER_BUTTON_BASE_CLASSES,
              isFilterOpen ? FILTER_BUTTON_OPEN_CLASSES : FILTER_BUTTON_CLOSED_CLASSES,
            )}
          >
            <TbAdjustmentsHorizontal className={FILTER_ICON_CLASSES} />
          </Button>
        )}
      </div>

      {shouldShowSuggestions && (
        <div className={SUGGESTIONS_CONTAINER_CLASSES}>
          {suggestions.length > 0 && (
            <>
              <div className={SUGGESTIONS_HEADER_CLASSES}>{query ? '検索候補' : '最近の検索'}</div>
              <div className={SUGGESTIONS_LIST_CLASSES}>
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={SUGGESTION_ITEM_CLASSES}
                  >
                    <div className={SUGGESTION_ITEM_CONTENT_CLASSES}>
                      <Search className={SUGGESTION_ICON_CLASSES} />
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
