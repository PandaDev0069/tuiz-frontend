// ====================================================
// File Name   : useQuizSearch.ts
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-16
// Last Update : 2025-09-16
//
// Description:
// - React hooks for quiz search functionality
// - Provides debounced search across draft and published quizzes
// - Manages recent searches in localStorage
// - Generates search suggestions based on recent searches and common terms
//
// Notes:
// - Uses React Query for data fetching and caching
// - Debounces search queries to reduce API calls
// - Stores recent searches in localStorage for persistence
// ====================================================

//----------------------------------------------------
// 1. Imports / Dependencies
//----------------------------------------------------
import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { quizService } from '@/lib/quizService';

import type { QuizListRequest } from '@/types/api';
import type { QuizSet } from '@/types/quiz';

//----------------------------------------------------
// 2. Constants / Configuration
//----------------------------------------------------
const DEFAULT_DEBOUNCE_MS = 300;
const DEFAULT_SEARCH_LIMIT = 50;
const QUERY_STALE_TIME_MS = 30 * 1000;
const QUERY_RETRY_COUNT = 2;

const STORAGE_KEY_RECENT_SEARCHES = 'tuiz-recent-searches';
const MAX_RECENT_SEARCHES = 10;
const MAX_SUGGESTIONS = 5;

const QUIZ_STATUS_DRAFT = 'draft';
const QUIZ_STATUS_PUBLISHED = 'published';

const SORT_FIELD_UPDATED_AT = 'updated_at';
const SORT_ORDER_DESC = 'desc';

const QUERY_KEY_QUIZZES = 'quizzes';
const QUERY_KEY_SEARCH = 'search';
const QUERY_KEY_DRAFT = 'draft';
const QUERY_KEY_PUBLISHED = 'published';

const COMMON_SEARCH_TERMS = [
  'プログラミング',
  '数学',
  '歴史',
  '科学',
  '英語',
  '地理',
  'スポーツ',
  '音楽',
  'アート',
  '料理',
] as const;

//----------------------------------------------------
// 3. Types / Interfaces
//----------------------------------------------------
/**
 * Interface: UseQuizSearchOptions
 * Description:
 * - Configuration options for the useQuizSearch hook
 *
 * Properties:
 * - searchQuery (string): The search query string
 * - debounceMs (number, optional): Debounce delay in milliseconds (default: 300)
 * - limit (number, optional): Maximum number of results per status (default: 50)
 */
export interface UseQuizSearchOptions {
  searchQuery: string;
  debounceMs?: number;
  limit?: number;
}

/**
 * Interface: SearchResults
 * Description:
 * - Search results returned by useQuizSearch hook
 *
 * Properties:
 * - draftQuizzes (QuizSet[]): Array of draft quiz sets matching the search
 * - publishedQuizzes (QuizSet[]): Array of published quiz sets matching the search
 * - allQuizzes (QuizSet[]): Combined array of all matching quizzes
 * - isLoading (boolean): Whether the search is currently loading
 * - error (Error | null): Error object if search failed, null otherwise
 * - totalCount (number): Total count of matching quizzes across all statuses
 */
export interface SearchResults {
  draftQuizzes: QuizSet[];
  publishedQuizzes: QuizSet[];
  allQuizzes: QuizSet[];
  isLoading: boolean;
  error: Error | null;
  totalCount: number;
}

//----------------------------------------------------
// 4. Core Logic
//----------------------------------------------------
/**
 * Hook: useQuizSearch
 * Description:
 * - Searches quizzes across both draft and published statuses
 * - Debounces search queries to reduce API calls
 * - Combines results from both statuses into a single result set
 * - Uses React Query for caching and state management
 *
 * Parameters:
 * - options (UseQuizSearchOptions): Search configuration options
 *
 * Returns:
 * - SearchResults: Combined search results with loading and error states
 *
 * Example:
 * ```ts
 * const { allQuizzes, isLoading, error } = useQuizSearch({
 *   searchQuery: 'programming',
 *   debounceMs: 500,
 *   limit: 20
 * });
 * ```
 */
export function useQuizSearch({
  searchQuery,
  debounceMs = DEFAULT_DEBOUNCE_MS,
  limit = DEFAULT_SEARCH_LIMIT,
}: UseQuizSearchOptions): SearchResults {
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchQuery, debounceMs]);

  const {
    data: draftData,
    isLoading: isLoadingDrafts,
    error: draftError,
  } = useQuery({
    queryKey: [QUERY_KEY_QUIZZES, QUERY_KEY_SEARCH, QUERY_KEY_DRAFT, debouncedQuery, limit],
    queryFn: async () => {
      const filters: QuizListRequest = {
        status: QUIZ_STATUS_DRAFT,
        search: debouncedQuery.trim() || undefined,
        limit,
        sort: SORT_FIELD_UPDATED_AT,
        order: SORT_ORDER_DESC,
      };
      return await quizService.listQuizzes(filters);
    },
    enabled: true,
    staleTime: QUERY_STALE_TIME_MS,
    retry: QUERY_RETRY_COUNT,
  });

  const {
    data: publishedData,
    isLoading: isLoadingPublished,
    error: publishedError,
  } = useQuery({
    queryKey: [QUERY_KEY_QUIZZES, QUERY_KEY_SEARCH, QUERY_KEY_PUBLISHED, debouncedQuery, limit],
    queryFn: async () => {
      const filters: QuizListRequest = {
        status: QUIZ_STATUS_PUBLISHED,
        search: debouncedQuery.trim() || undefined,
        limit,
        sort: SORT_FIELD_UPDATED_AT,
        order: SORT_ORDER_DESC,
      };
      return await quizService.listQuizzes(filters);
    },
    enabled: true,
    staleTime: QUERY_STALE_TIME_MS,
    retry: QUERY_RETRY_COUNT,
  });

  const results = useMemo(() => {
    const draftQuizzes = draftData?.data || [];
    const publishedQuizzes = publishedData?.data || [];
    const allQuizzes = [...draftQuizzes, ...publishedQuizzes];
    const totalCount = (draftData?.totalCount || 0) + (publishedData?.totalCount || 0);

    return {
      draftQuizzes,
      publishedQuizzes,
      allQuizzes,
      totalCount,
    };
  }, [draftData, publishedData]);

  return {
    ...results,
    isLoading: isLoadingDrafts || isLoadingPublished,
    error: draftError || publishedError || null,
  };
}

/**
 * Hook: useRecentSearches
 * Description:
 * - Manages recent search queries stored in localStorage
 * - Provides functions to add and clear recent searches
 * - Automatically loads recent searches on mount
 * - Limits stored searches to prevent excessive storage usage
 *
 * Returns:
 * - Object containing:
 *   - recentSearches (string[]): Array of recent search queries
 *   - addRecentSearch (function): Function to add a new search query
 *   - clearRecentSearches (function): Function to clear all recent searches
 *
 * Example:
 * ```ts
 * const { recentSearches, addRecentSearch, clearRecentSearches } = useRecentSearches();
 * addRecentSearch('programming');
 * ```
 */
export function useRecentSearches() {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY_RECENT_SEARCHES);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setRecentSearches(parsed);
        }
      } catch (error) {
        console.error('Failed to parse recent searches from localStorage:', error);
      }
    }
  }, []);

  const addRecentSearch = (query: string) => {
    if (!query.trim()) return;

    const trimmedQuery = query.trim();
    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item !== trimmedQuery);
      const newSearches = [trimmedQuery, ...filtered].slice(0, MAX_RECENT_SEARCHES);

      localStorage.setItem(STORAGE_KEY_RECENT_SEARCHES, JSON.stringify(newSearches));

      return newSearches;
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem(STORAGE_KEY_RECENT_SEARCHES);
  };

  return {
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
  };
}

/**
 * Hook: useSearchSuggestions
 * Description:
 * - Generates search suggestions based on current query and recent searches
 * - Filters recent searches and common terms that match the query
 * - Returns top matching suggestions when query is provided
 * - Returns recent searches when query is empty
 *
 * Parameters:
 * - searchQuery (string): Current search query string
 * - recentSearches (string[]): Array of recent search queries
 *
 * Returns:
 * - string[]: Array of suggested search terms (max 5)
 *
 * Example:
 * ```ts
 * const suggestions = useSearchSuggestions('pro', recentSearches);
 * // Returns: ['programming', 'programming basics', ...]
 * ```
 */
export function useSearchSuggestions(searchQuery: string, recentSearches: string[]): string[] {
  const suggestions = useMemo(() => {
    if (!searchQuery.trim()) {
      return recentSearches.slice(0, MAX_SUGGESTIONS);
    }

    const query = searchQuery.toLowerCase();
    const matchingRecent = recentSearches.filter((search) => search.toLowerCase().includes(query));
    const matchingCommon = COMMON_SEARCH_TERMS.filter((term) => term.toLowerCase().includes(query));

    const allSuggestions = [...matchingRecent, ...matchingCommon];
    const uniqueSuggestions = Array.from(new Set(allSuggestions));

    return uniqueSuggestions.slice(0, MAX_SUGGESTIONS);
  }, [searchQuery, recentSearches]);

  return suggestions;
}

//----------------------------------------------------
// 5. Helper Functions
//----------------------------------------------------

//----------------------------------------------------
// 6. Export
//----------------------------------------------------
