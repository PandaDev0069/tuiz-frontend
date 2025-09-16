import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { QuizSet } from '@/types/quiz';

// Types for quiz library store
export interface MyLibraryFilters {
  category?: string;
  status?: 'all' | 'drafts' | 'published';
  sort: string;
}

export interface PublicBrowseFilters {
  category?: string;
  difficulty?: string;
  sort: string;
}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface QuizLibraryState {
  // My Library State
  myLibraryQuizzes: QuizSet[];
  myLibraryFilters: MyLibraryFilters;
  myLibraryPagination: PaginationState;
  myLibraryLoading: boolean;
  myLibraryError: string | null;

  // Public Browse State
  publicQuizzes: QuizSet[];
  publicBrowseQuery: string;
  publicBrowseFilters: PublicBrowseFilters;
  publicBrowsePagination: PaginationState;
  publicBrowseLoading: boolean;
  publicBrowseError: string | null;

  // Global Loading States
  cloneLoading: boolean;
  deleteLoading: boolean;
}

export interface QuizLibraryActions {
  // My Library Actions
  setMyLibraryQuizzes: (quizzes: QuizSet[]) => void;
  setMyLibraryFilters: (filters: Partial<MyLibraryFilters>) => void;
  setMyLibraryPagination: (pagination: Partial<PaginationState>) => void;
  setMyLibraryLoading: (loading: boolean) => void;
  setMyLibraryError: (error: string | null) => void;
  resetMyLibraryPagination: () => void;

  // Public Browse Actions
  setPublicQuizzes: (quizzes: QuizSet[]) => void;
  setPublicBrowseQuery: (query: string) => void;
  setPublicBrowseFilters: (filters: Partial<PublicBrowseFilters>) => void;
  setPublicBrowsePagination: (pagination: Partial<PaginationState>) => void;
  setPublicBrowseLoading: (loading: boolean) => void;
  setPublicBrowseError: (error: string | null) => void;
  resetPublicBrowsePagination: () => void;

  // Global Actions
  setCloneLoading: (loading: boolean) => void;
  setDeleteLoading: (loading: boolean) => void;

  // Quiz Operations
  addQuizToMyLibrary: (quiz: QuizSet) => void;
  updateQuizInMyLibrary: (id: string, updates: Partial<QuizSet>) => void;
  removeQuizFromMyLibrary: (id: string) => void;

  // Reset Functions
  resetMyLibraryState: () => void;
  resetPublicBrowseState: () => void;
  resetAllState: () => void;
}

// Initial state values
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
  sort: 'updated_at_desc',
};

const initialPublicBrowseFilters: PublicBrowseFilters = {
  category: undefined,
  difficulty: undefined,
  sort: 'times_played_desc',
};

export const useQuizLibraryStore = create<QuizLibraryState & QuizLibraryActions>()(
  devtools(
    (set, get) => ({
      // Initial State
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

      // My Library Actions
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

      // Public Browse Actions
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

      // Global Actions
      setCloneLoading: (loading) => set({ cloneLoading: loading }, false, 'setCloneLoading'),

      setDeleteLoading: (loading) => set({ deleteLoading: loading }, false, 'setDeleteLoading'),

      // Quiz Operations
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

      // Reset Functions
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
        // Only persist filters, not data or loading states
        myLibraryFilters: state.myLibraryFilters,
        publicBrowseFilters: state.publicBrowseFilters,
        publicBrowseQuery: state.publicBrowseQuery,
      }),
    },
  ),
);

// Selector hooks for better performance
export const useMyLibraryState = () =>
  useQuizLibraryStore((state) => ({
    quizzes: state.myLibraryQuizzes,
    filters: state.myLibraryFilters,
    pagination: state.myLibraryPagination,
    loading: state.myLibraryLoading,
    error: state.myLibraryError,
  }));

export const usePublicBrowseState = () =>
  useQuizLibraryStore((state) => ({
    quizzes: state.publicQuizzes,
    query: state.publicBrowseQuery,
    filters: state.publicBrowseFilters,
    pagination: state.publicBrowsePagination,
    loading: state.publicBrowseLoading,
    error: state.publicBrowseError,
  }));

export const useQuizLibraryActions = () =>
  useQuizLibraryStore((state) => ({
    // My Library Actions
    setMyLibraryFilters: state.setMyLibraryFilters,
    setMyLibraryPagination: state.setMyLibraryPagination,
    resetMyLibraryPagination: state.resetMyLibraryPagination,

    // Public Browse Actions
    setPublicBrowseQuery: state.setPublicBrowseQuery,
    setPublicBrowseFilters: state.setPublicBrowseFilters,
    setPublicBrowsePagination: state.setPublicBrowsePagination,
    resetPublicBrowsePagination: state.resetPublicBrowsePagination,

    // Quiz Operations
    addQuizToMyLibrary: state.addQuizToMyLibrary,
    updateQuizInMyLibrary: state.updateQuizInMyLibrary,
    removeQuizFromMyLibrary: state.removeQuizFromMyLibrary,
  }));
