// src/hooks/useQuizSearch.ts
// Hook for searching quizzes across both draft and published status

import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { quizService } from '@/lib/quizService';
import type { QuizListRequest } from '@/types/api';
import type { QuizSet } from '@/types/quiz';

export interface UseQuizSearchOptions {
  searchQuery: string;
  debounceMs?: number;
  limit?: number;
}

export interface SearchResults {
  draftQuizzes: QuizSet[];
  publishedQuizzes: QuizSet[];
  allQuizzes: QuizSet[];
  isLoading: boolean;
  error: Error | null;
  totalCount: number;
}

export function useQuizSearch({
  searchQuery,
  debounceMs = 300,
  limit = 50,
}: UseQuizSearchOptions): SearchResults {
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);

  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchQuery, debounceMs]);

  // Search draft quizzes
  const {
    data: draftData,
    isLoading: isLoadingDrafts,
    error: draftError,
  } = useQuery({
    queryKey: ['quizzes', 'search', 'draft', debouncedQuery, limit],
    queryFn: async () => {
      const filters: QuizListRequest = {
        status: 'draft',
        search: debouncedQuery.trim() || undefined,
        limit,
        sort: 'updated_at',
        order: 'desc',
      };
      return await quizService.listQuizzes(filters);
    },
    enabled: true,
    staleTime: 30 * 1000, // 30 seconds
    retry: 2,
  });

  // Search published quizzes
  const {
    data: publishedData,
    isLoading: isLoadingPublished,
    error: publishedError,
  } = useQuery({
    queryKey: ['quizzes', 'search', 'published', debouncedQuery, limit],
    queryFn: async () => {
      const filters: QuizListRequest = {
        status: 'published',
        search: debouncedQuery.trim() || undefined,
        limit,
        sort: 'updated_at',
        order: 'desc',
      };
      return await quizService.listQuizzes(filters);
    },
    enabled: true,
    staleTime: 30 * 1000, // 30 seconds
    retry: 2,
  });

  // Combine results
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

// Hook for recent searches (local storage)
export function useRecentSearches() {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('tuiz-recent-searches');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setRecentSearches(parsed);
        }
      } catch (error) {
        console.warn('Failed to parse recent searches from localStorage:', error);
      }
    }
  }, []);

  // Save recent searches to localStorage
  const addRecentSearch = (query: string) => {
    if (!query.trim()) return;

    const trimmedQuery = query.trim();
    setRecentSearches((prev) => {
      // Remove if already exists and add to beginning
      const filtered = prev.filter((item) => item !== trimmedQuery);
      const newSearches = [trimmedQuery, ...filtered].slice(0, 10); // Keep only last 10

      // Save to localStorage
      localStorage.setItem('tuiz-recent-searches', JSON.stringify(newSearches));

      return newSearches;
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('tuiz-recent-searches');
  };

  return {
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
  };
}

// Hook for search suggestions (based on recent searches and common terms)
export function useSearchSuggestions(searchQuery: string, recentSearches: string[]) {
  const suggestions = useMemo(() => {
    if (!searchQuery.trim()) {
      return recentSearches.slice(0, 5); // Show recent searches when no query
    }

    const query = searchQuery.toLowerCase();
    const commonTerms = [
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
    ];

    // Filter recent searches that match the query
    const matchingRecent = recentSearches.filter((search) => search.toLowerCase().includes(query));

    // Filter common terms that match the query
    const matchingCommon = commonTerms.filter((term) => term.toLowerCase().includes(query));

    // Combine and deduplicate
    const allSuggestions = [...matchingRecent, ...matchingCommon];
    const uniqueSuggestions = Array.from(new Set(allSuggestions));

    return uniqueSuggestions.slice(0, 5);
  }, [searchQuery, recentSearches]);

  return suggestions;
}
