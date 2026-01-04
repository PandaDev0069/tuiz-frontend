// ====================================================
// File Name   : useQuizLibraryStore.ts
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-17
// Last Update : 2025-09-17
//
// Description:
// - Zustand store for quiz library state management
// - Manages my library and public browse quiz states
// - Handles filtering, pagination, and quiz operations
//
// Notes:
// - Uses Zustand devtools middleware for debugging
// - Persists filter preferences across sessions
// - Provides selector hooks for optimized re-renders
// ====================================================

//----------------------------------------------------
// 1. Imports / Dependencies
//----------------------------------------------------
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import type { QuizSet } from '@/types/quiz';

//----------------------------------------------------
// 3. Types / Interfaces
//----------------------------------------------------
/**
 * Interface: MyLibraryFilters
 * Description:
 * - Filter options for my library quiz view
 * - Supports category, status, and sorting
 */
export interface MyLibraryFilters {
  category?: string;
  status?: 'all' | 'drafts' | 'published';
  sort: string;
}

/**
 * Interface: PublicBrowseFilters
 * Description:
 * - Filter options for public browse quiz view
 * - Supports category, difficulty, and sorting
 */
export interface PublicBrowseFilters {
  category?: string;
  difficulty?: string;
  sort: string;
}

/**
 * Interface: PaginationState
 * Description:
 * - Pagination state for quiz lists
 * - Tracks current page, limits, and navigation state
 */
export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

/**
 * Interface: QuizLibraryState
 * Description:
 * - Complete state structure for quiz library store
 * - Includes my library and public browse states
 */
export interface QuizLibraryState {
  myLibraryQuizzes: QuizSet[];
  myLibraryFilters: MyLibraryFilters;
  myLibraryPagination: PaginationState;
  myLibraryLoading: boolean;
  myLibraryError: string | null;

  publicQuizzes: QuizSet[];
  publicBrowseQuery: string;
  publicBrowseFilters: PublicBrowseFilters;
  publicBrowsePagination: PaginationState;
  publicBrowseLoading: boolean;
  publicBrowseError: string | null;

  cloneLoading: boolean;
  deleteLoading: boolean;
}

/**
 * Interface: QuizLibraryActions
 * Description:
 * - Action methods for quiz library store
 * - Provides setters and operations for state management
 */
export interface QuizLibraryActions {
  setMyLibraryQuizzes: (quizzes: QuizSet[]) => void;
  setMyLibraryFilters: (filters: Partial<MyLibraryFilters>) => void;
  setMyLibraryPagination: (pagination: Partial<PaginationState>) => void;
  setMyLibraryLoading: (loading: boolean) => void;
  setMyLibraryError: (error: string | null) => void;
  resetMyLibraryPagination: () => void;

  setPublicQuizzes: (quizzes: QuizSet[]) => void;
  setPublicBrowseQuery: (query: string) => void;
  setPublicBrowseFilters: (filters: Partial<PublicBrowseFilters>) => void;
  setPublicBrowsePagination: (pagination: Partial<PaginationState>) => void;
  setPublicBrowseLoading: (loading: boolean) => void;
  setPublicBrowseError: (error: string | null) => void;
  resetPublicBrowsePagination: () => void;

  setCloneLoading: (loading: boolean) => void;
  setDeleteLoading: (loading: boolean) => void;

  addQuizToMyLibrary: (quiz: QuizSet) => void;
  updateQuizInMyLibrary: (id: string, updates: Partial<QuizSet>) => void;
  removeQuizFromMyLibrary: (id: string) => void;

  resetMyLibraryState: () => void;
  resetPublicBrowseState: () => void;
  resetAllState: () => void;
}

//----------------------------------------------------
// 2. Constants / Configuration
//----------------------------------------------------
const initialPagination: PaginationState = {
  page: 1,
  limit: 12,
  total: 0,
  total_pages: 0,
  has_next: false,
  has_prev: false,
};

const initialMyLibraryFilters: MyLibraryFilters = {
  category: undefined,
  status: 'all',
  sort: 'updated_desc',
};

const initialPublicBrowseFilters: PublicBrowseFilters = {
  category: undefined,
  difficulty: undefined,
  sort: 'plays_desc',
};

//----------------------------------------------------
// 4. Core Logic
//----------------------------------------------------
/**
 * Hook: useQuizLibraryStore
 * Description:
 * - Main Zustand store hook for quiz library state
 * - Manages my library and public browse quiz states
 * - Includes devtools integration and state persistence
 *
 * Returns:
 * - QuizLibraryState & QuizLibraryActions: Combined state and actions
 */
export const useQuizLibraryStore = create<QuizLibraryState & QuizLibraryActions>()(
  devtools(
    (set, get) => ({
      myLibraryQuizzes: [],
      myLibraryFilters: initialMyLibraryFilters,
      myLibraryPagination: initialPagination,
      myLibraryLoading: false,
      myLibraryError: null,

      publicQuizzes: [],
      publicBrowseQuery: '',
      publicBrowseFilters: initialPublicBrowseFilters,
      publicBrowsePagination: initialPagination,
      publicBrowseLoading: false,
      publicBrowseError: null,

      cloneLoading: false,
      deleteLoading: false,

      setMyLibraryQuizzes: (quizzes) =>
        set({ myLibraryQuizzes: quizzes }, false, 'setMyLibraryQuizzes'),

      setMyLibraryFilters: (filters) =>
        set(
          (state) => ({
            myLibraryFilters: { ...state.myLibraryFilters, ...filters },
          }),
          false,
          'setMyLibraryFilters',
        ),

      setMyLibraryPagination: (pagination) =>
        set(
          (state) => ({
            myLibraryPagination: { ...state.myLibraryPagination, ...pagination },
          }),
          false,
          'setMyLibraryPagination',
        ),

      setMyLibraryLoading: (loading) =>
        set({ myLibraryLoading: loading }, false, 'setMyLibraryLoading'),

      setMyLibraryError: (error) => set({ myLibraryError: error }, false, 'setMyLibraryError'),

      resetMyLibraryPagination: () =>
        set(
          { myLibraryPagination: { ...initialPagination, limit: get().myLibraryPagination.limit } },
          false,
          'resetMyLibraryPagination',
        ),

      setPublicQuizzes: (quizzes) => set({ publicQuizzes: quizzes }, false, 'setPublicQuizzes'),

      setPublicBrowseQuery: (query) =>
        set({ publicBrowseQuery: query }, false, 'setPublicBrowseQuery'),

      setPublicBrowseFilters: (filters) =>
        set(
          (state) => ({
            publicBrowseFilters: { ...state.publicBrowseFilters, ...filters },
          }),
          false,
          'setPublicBrowseFilters',
        ),

      setPublicBrowsePagination: (pagination) =>
        set(
          (state) => ({
            publicBrowsePagination: { ...state.publicBrowsePagination, ...pagination },
          }),
          false,
          'setPublicBrowsePagination',
        ),

      setPublicBrowseLoading: (loading) =>
        set({ publicBrowseLoading: loading }, false, 'setPublicBrowseLoading'),

      setPublicBrowseError: (error) =>
        set({ publicBrowseError: error }, false, 'setPublicBrowseError'),

      resetPublicBrowsePagination: () =>
        set(
          {
            publicBrowsePagination: {
              ...initialPagination,
              limit: get().publicBrowsePagination.limit,
            },
          },
          false,
          'resetPublicBrowsePagination',
        ),

      setCloneLoading: (loading) => set({ cloneLoading: loading }, false, 'setCloneLoading'),

      setDeleteLoading: (loading) => set({ deleteLoading: loading }, false, 'setDeleteLoading'),

      addQuizToMyLibrary: (quiz) =>
        set(
          (state) => ({
            myLibraryQuizzes: [quiz, ...state.myLibraryQuizzes],
          }),
          false,
          'addQuizToMyLibrary',
        ),

      updateQuizInMyLibrary: (id, updates) =>
        set(
          (state) => ({
            myLibraryQuizzes: state.myLibraryQuizzes.map((quiz) =>
              quiz.id === id ? { ...quiz, ...updates } : quiz,
            ),
          }),
          false,
          'updateQuizInMyLibrary',
        ),

      removeQuizFromMyLibrary: (id) =>
        set(
          (state) => ({
            myLibraryQuizzes: state.myLibraryQuizzes.filter((quiz) => quiz.id !== id),
          }),
          false,
          'removeQuizFromMyLibrary',
        ),

      resetMyLibraryState: () =>
        set(
          {
            myLibraryQuizzes: [],
            myLibraryFilters: initialMyLibraryFilters,
            myLibraryPagination: initialPagination,
            myLibraryLoading: false,
            myLibraryError: null,
          },
          false,
          'resetMyLibraryState',
        ),

      resetPublicBrowseState: () =>
        set(
          {
            publicQuizzes: [],
            publicBrowseQuery: '',
            publicBrowseFilters: initialPublicBrowseFilters,
            publicBrowsePagination: initialPagination,
            publicBrowseLoading: false,
            publicBrowseError: null,
          },
          false,
          'resetPublicBrowseState',
        ),

      resetAllState: () => {
        get().resetMyLibraryState();
        get().resetPublicBrowseState();
        set(
          {
            cloneLoading: false,
            deleteLoading: false,
          },
          false,
          'resetAllState',
        );
      },
    }),
    {
      name: 'quiz-library-store',
      partialize: (state: QuizLibraryState & QuizLibraryActions) => ({
        myLibraryFilters: state.myLibraryFilters,
        publicBrowseFilters: state.publicBrowseFilters,
        publicBrowseQuery: state.publicBrowseQuery,
      }),
    },
  ),
);

/**
 * Hook: useMyLibraryQuizzes
 * Description:
 * - Selector hook for my library quizzes
 *
 * Returns:
 * - QuizSet[]: Array of quizzes in my library
 */
export const useMyLibraryQuizzes = () => useQuizLibraryStore((state) => state.myLibraryQuizzes);

/**
 * Hook: useMyLibraryFilters
 * Description:
 * - Selector hook for my library filters
 *
 * Returns:
 * - MyLibraryFilters: Current filter state
 */
export const useMyLibraryFilters = () => useQuizLibraryStore((state) => state.myLibraryFilters);

/**
 * Hook: useMyLibraryPagination
 * Description:
 * - Selector hook for my library pagination
 *
 * Returns:
 * - PaginationState: Current pagination state
 */
export const useMyLibraryPagination = () =>
  useQuizLibraryStore((state) => state.myLibraryPagination);

/**
 * Hook: useMyLibraryLoading
 * Description:
 * - Selector hook for my library loading state
 *
 * Returns:
 * - boolean: Loading state
 */
export const useMyLibraryLoading = () => useQuizLibraryStore((state) => state.myLibraryLoading);

/**
 * Hook: useMyLibraryError
 * Description:
 * - Selector hook for my library error state
 *
 * Returns:
 * - string | null: Error message or null
 */
export const useMyLibraryError = () => useQuizLibraryStore((state) => state.myLibraryError);

/**
 * Hook: usePublicQuizzes
 * Description:
 * - Selector hook for public browse quizzes
 *
 * Returns:
 * - QuizSet[]: Array of public quizzes
 */
export const usePublicQuizzes = () => useQuizLibraryStore((state) => state.publicQuizzes);

/**
 * Hook: usePublicBrowseQuery
 * Description:
 * - Selector hook for public browse search query
 *
 * Returns:
 * - string: Current search query
 */
export const usePublicBrowseQuery = () => useQuizLibraryStore((state) => state.publicBrowseQuery);

/**
 * Hook: usePublicBrowseFilters
 * Description:
 * - Selector hook for public browse filters
 *
 * Returns:
 * - PublicBrowseFilters: Current filter state
 */
export const usePublicBrowseFilters = () =>
  useQuizLibraryStore((state) => state.publicBrowseFilters);

/**
 * Hook: usePublicBrowsePagination
 * Description:
 * - Selector hook for public browse pagination
 *
 * Returns:
 * - PaginationState: Current pagination state
 */
export const usePublicBrowsePagination = () =>
  useQuizLibraryStore((state) => state.publicBrowsePagination);

/**
 * Hook: usePublicBrowseLoading
 * Description:
 * - Selector hook for public browse loading state
 *
 * Returns:
 * - boolean: Loading state
 */
export const usePublicBrowseLoading = () =>
  useQuizLibraryStore((state) => state.publicBrowseLoading);

/**
 * Hook: usePublicBrowseError
 * Description:
 * - Selector hook for public browse error state
 *
 * Returns:
 * - string | null: Error message or null
 */
export const usePublicBrowseError = () => useQuizLibraryStore((state) => state.publicBrowseError);

/**
 * Hook: useMyLibraryState
 * Description:
 * - Combined selector hook for my library state
 * - Memoized to prevent unnecessary re-renders
 *
 * Returns:
 * - Object containing quizzes, filters, pagination, loading, and error
 */
export const useMyLibraryState = () => {
  const quizzes = useMyLibraryQuizzes();
  const filters = useMyLibraryFilters();
  const pagination = useMyLibraryPagination();
  const loading = useMyLibraryLoading();
  const error = useMyLibraryError();

  return { quizzes, filters, pagination, loading, error };
};

/**
 * Hook: usePublicBrowseState
 * Description:
 * - Combined selector hook for public browse state
 * - Memoized to prevent unnecessary re-renders
 *
 * Returns:
 * - Object containing quizzes, query, filters, pagination, loading, and error
 */
export const usePublicBrowseState = () => {
  const quizzes = usePublicQuizzes();
  const query = usePublicBrowseQuery();
  const filters = usePublicBrowseFilters();
  const pagination = usePublicBrowsePagination();
  const loading = usePublicBrowseLoading();
  const error = usePublicBrowseError();

  return { quizzes, query, filters, pagination, loading, error };
};

/**
 * Hook: useQuizLibraryActions
 * Description:
 * - Combined selector hook for quiz library actions
 * - Provides all action methods for state updates
 *
 * Returns:
 * - Object containing all action methods
 */
export const useQuizLibraryActions = () => {
  const setMyLibraryFilters = useQuizLibraryStore((state) => state.setMyLibraryFilters);
  const setMyLibraryPagination = useQuizLibraryStore((state) => state.setMyLibraryPagination);
  const resetMyLibraryPagination = useQuizLibraryStore((state) => state.resetMyLibraryPagination);
  const setPublicBrowseQuery = useQuizLibraryStore((state) => state.setPublicBrowseQuery);
  const setPublicBrowseFilters = useQuizLibraryStore((state) => state.setPublicBrowseFilters);
  const setPublicBrowsePagination = useQuizLibraryStore((state) => state.setPublicBrowsePagination);
  const resetPublicBrowsePagination = useQuizLibraryStore(
    (state) => state.resetPublicBrowsePagination,
  );
  const addQuizToMyLibrary = useQuizLibraryStore((state) => state.addQuizToMyLibrary);
  const updateQuizInMyLibrary = useQuizLibraryStore((state) => state.updateQuizInMyLibrary);
  const removeQuizFromMyLibrary = useQuizLibraryStore((state) => state.removeQuizFromMyLibrary);

  return {
    setMyLibraryFilters,
    setMyLibraryPagination,
    resetMyLibraryPagination,
    setPublicBrowseQuery,
    setPublicBrowseFilters,
    setPublicBrowsePagination,
    resetPublicBrowsePagination,
    addQuizToMyLibrary,
    updateQuizInMyLibrary,
    removeQuizFromMyLibrary,
  };
};
