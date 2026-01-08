// ====================================================
// File Name   : page.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-08-22
// Last Update : 2025-12-22
//
// Description:
// - Main dashboard page for quiz management
// - Displays user's draft and published quizzes
// - Provides search, filtering, and quick actions
// - Handles quiz creation, editing, starting games, and deletion
//
// Notes:
// - Uses custom hooks for state management and data fetching
// - Supports real-time search with debouncing
// - Horizontal scrollable quiz cards with navigation
// ====================================================

'use client';

//----------------------------------------------------
// 1. React & Next.js Imports
//----------------------------------------------------
import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

//----------------------------------------------------
// 2. External Library Imports
//----------------------------------------------------
import { QueryClientProvider } from '@tanstack/react-query';
import { PenTool, Gamepad2, BarChart3, Library, Loader2, AlertCircle } from 'lucide-react';

//----------------------------------------------------
// 3. Internal Component Imports
//----------------------------------------------------
import {
  Container,
  Button,
  PageContainer,
  SearchBar,
  SidebarFilter,
  ProfileSettingsModal,
  DashboardHeader,
  DashboardMessage,
} from '@/components/ui';
import { QuizCard } from '@/components/ui/data-display/quiz-card';
import { StructuredData } from '@/components/SEO';
import { AuthGuard } from '@/components/auth/AuthGuard';

//----------------------------------------------------
// 4. Service & Hook Imports
//----------------------------------------------------
import { useDraftQuizzes, usePublishedQuizzes } from '@/hooks/useDashboard';
import { useQuizDeletion } from '@/hooks/useQuizDeletion';
import { useQuizSearch, useRecentSearches, useSearchSuggestions } from '@/hooks/useQuizSearch';
import { gameApi } from '@/services/gameApi';
import { quizService } from '@/lib/quizService';
import { useDeviceId } from '@/hooks/useDeviceId';
import { useAuthStore } from '@/state/useAuthStore';
import { queryClient } from '@/lib/queryClient';

//----------------------------------------------------
// 5. Type Imports
//----------------------------------------------------
import type { QuizSet } from '@/types/quiz';
import type { FilterState } from '@/components/ui/overlays/sidebar-filter';
import type { ProfileData } from '@/components/ui/overlays/profile-settings-modal';

//----------------------------------------------------
// 6. Constants / Configuration
//----------------------------------------------------
const SCROLL_AMOUNT_PX = 320;
const SEARCH_DEBOUNCE_MS = 300;
const SEARCH_LIMIT = 50;
const DEFAULT_MAX_PLAYERS = 200;

const DEFAULT_PLAY_SETTINGS = {
  show_question_only: true,
  show_explanation: true,
  time_bonus: true,
  streak_bonus: true,
  show_correct_answer: false,
  max_players: DEFAULT_MAX_PLAYERS,
} as const;

const DEFAULT_FILTER_STATE: FilterState = {
  status: [],
  difficulty: [],
  category: [],
  sortBy: 'newest',
  viewMode: 'grid',
  dateRange: 'all',
  questionCount: 'all',
  playCount: 'all',
  tags: [],
};

//----------------------------------------------------
// 7. Query Client Instance
//----------------------------------------------------
// (Using global queryClient from @/lib/queryClient)

//----------------------------------------------------
// 8. Types / Interfaces
//----------------------------------------------------
// (Types imported from @/types and @/components)

//----------------------------------------------------
// 9. Helper Components
//----------------------------------------------------
/**
 * Component: QuickActions
 * Description:
 * - Displays quick action buttons for common dashboard operations
 * - Includes create quiz, join quiz, analytics, and library buttons
 *
 * Props:
 * - onCreateQuiz (() => void): Handler for creating new quiz
 * - onJoinQuiz (() => void): Handler for joining a quiz
 * - onLibrary (() => void): Handler for opening library
 *
 * Incomplete Features:
 * - Analytics Button: "分析表示" button has no onClick handler, needs implementation
 */
const QuickActions: React.FC<{
  onCreateQuiz: () => void;
  onJoinQuiz: () => void;
  onLibrary: () => void;
}> = ({ onCreateQuiz, onJoinQuiz, onLibrary }) => (
  <div className="mb-8">
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-1 max-w-4xl mx-auto">
      <Button
        onClick={onCreateQuiz}
        className="group relative h-24 sm:h-28 w-full sm:w-48 flex flex-col items-center justify-center gap-0 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 hover:from-blue-600 hover:via-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 border-0 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        <PenTool
          className="!w-12 !h-12 sm:!w-15 sm:!h-15 !text-yellow-300 group-hover:scale-110 transition-transform duration-200"
          strokeWidth={2}
          size={48}
        />
        <span className="font-semibold text-xs sm:text-sm">クイズ作成</span>
      </Button>

      <Button
        onClick={onJoinQuiz}
        className="group relative h-24 sm:h-28 w-full sm:w-48 flex flex-col items-center justify-center gap-0 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-600 hover:via-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 border-0 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        <Gamepad2
          className="!w-12 !h-12 sm:!w-15 sm:!h-15 !text-pink-400 group-hover:scale-110 transition-transform duration-200"
          strokeWidth={2}
          size={48}
        />
        <span className="font-semibold text-xs sm:text-sm">TUIZ参加</span>
      </Button>

      <Button className="group relative h-24 sm:h-28 w-full sm:w-48 flex flex-col items-center justify-center gap-0 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 border-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        <BarChart3
          className="!w-12 !h-12 sm:!w-15 sm:!h-15 !text-cyan-400 group-hover:scale-110 transition-transform duration-200"
          strokeWidth={2}
          size={48}
        />
        <span className="text-xs sm:text-sm">分析表示</span>
      </Button>

      <Button
        className="group relative h-24 sm:h-28 w-full sm:w-48 flex flex-col items-center justify-center gap-0 bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 hover:from-violet-600 hover:via-purple-600 hover:to-fuchsia-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 border-0 overflow-hidden"
        onClick={onLibrary}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        <Library
          className="!w-12 !h-12 sm:!w-15 sm:!h-15 !text-orange-400 group-hover:scale-110 transition-transform duration-200"
          strokeWidth={2}
          size={48}
        />
        <span className="text-xs sm:text-sm">クイズライブラリ</span>
      </Button>
    </div>
  </div>
);

/**
 * Component: SearchSection
 * Description:
 * - Search and filter section for quiz discovery
 * - Includes search bar with suggestions and sidebar filter
 *
 * Props:
 * - searchQuery (string): Current search query
 * - onSearch ((query: string) => void): Search handler
 * - onClearSearch (() => void): Clear search handler
 * - onFilterToggle (() => void): Toggle filter sidebar
 * - sidebarOpen (boolean): Whether filter sidebar is open
 * - searchSuggestions (string[]): Search suggestions
 * - onSuggestionClick ((suggestion: string) => void): Suggestion click handler
 * - filters (FilterState): Current filter state
 * - onFiltersChange ((filters: FilterState) => void): Filter change handler
 */
const SearchSection: React.FC<{
  searchQuery: string;
  onSearch: (query: string) => void;
  onClearSearch: () => void;
  onFilterToggle: () => void;
  sidebarOpen: boolean;
  searchSuggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}> = ({
  searchQuery,
  onSearch,
  onClearSearch,
  onFilterToggle,
  sidebarOpen,
  searchSuggestions,
  onSuggestionClick,
  filters,
  onFiltersChange,
}) => (
  <div className="mb-8">
    <h2 className="text-xl sm:text-2xl font-semibold mb-4 px-auto">検索</h2>

    {/* Search Bar */}
    <div className="flex justify-center mb-6">
      <SearchBar
        placeholder="クイズ、カテゴリ、タグで検索..."
        onSearch={onSearch}
        onClear={onClearSearch}
        showFilters={true}
        onFilterToggle={onFilterToggle}
        isFilterOpen={sidebarOpen}
        className="w-full max-w-3xl"
        defaultValue={searchQuery}
        suggestions={searchSuggestions}
        onSuggestionClick={onSuggestionClick}
      />
    </div>

    {/* Sidebar Filter Modal */}
    <SidebarFilter
      isOpen={sidebarOpen}
      onToggle={onFilterToggle}
      filters={filters}
      onFiltersChange={onFiltersChange}
    />
  </div>
);

/**
 * Function: scrollContainer
 * Description:
 * - Utility function for scrolling quiz card containers
 *
 * Parameters:
 * - direction ('left' | 'right'): Scroll direction
 * - containerId (string): ID of container element to scroll
 */
const scrollContainer = (direction: 'left' | 'right', containerId: string) => {
  const container = document.getElementById(containerId);
  if (container) {
    const currentScroll = container.scrollLeft;
    const newScroll =
      direction === 'left' ? currentScroll - SCROLL_AMOUNT_PX : currentScroll + SCROLL_AMOUNT_PX;

    container.scrollTo({
      left: newScroll,
      behavior: 'smooth',
    });
  }
};

/**
 * Component: ScrollNavigation
 * Description:
 * - Navigation arrows for horizontal scrolling quiz containers
 *
 * Props:
 * - containerId (string): ID of container to scroll
 */
const ScrollNavigation: React.FC<{
  containerId: string;
}> = ({ containerId }) => (
  <div className="hidden md:block">
    <button
      onClick={() => scrollContainer('left', containerId)}
      className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 cursor-pointer hover:bg-gray-50 hover:shadow-xl transition-all duration-200 border border-gray-200"
      aria-label="Scroll left"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
    </button>
    <button
      onClick={() => scrollContainer('right', containerId)}
      className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 cursor-pointer hover:bg-gray-50 hover:shadow-xl transition-all duration-200 border border-gray-200"
      aria-label="Scroll right"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  </div>
);

/**
 * Component: QuizSection
 * Description:
 * - Displays a section of quiz cards with loading, error, and empty states
 * - Supports horizontal scrolling with navigation arrows
 *
 * Props:
 * - title (string): Section title
 * - quizzes (QuizSet[]): Array of quizzes to display
 * - isLoading (boolean): Loading state
 * - error (Error | null): Error state
 * - onEdit ((id: string) => void): Edit handler
 * - onStart ((id: string) => void): Start quiz handler
 * - onDelete ((id: string) => void): Delete handler
 * - isDeleting (boolean): Deletion in progress
 * - isCreatingGame (boolean, optional): Game creation in progress
 * - creatingQuizId (string | null, optional): ID of quiz being started
 * - onCreateQuiz (() => void, optional): Create quiz handler
 * - containerId (string): Container ID for scrolling
 * - showCreateButton (boolean, optional): Show create button in empty state
 * - emptyMessage (string, optional): Empty state message
 * - emptySubMessage (string, optional): Empty state sub-message
 */
const QuizSection: React.FC<{
  title: string;
  quizzes: QuizSet[];
  isLoading: boolean;
  error: Error | null;
  onEdit: (id: string) => void;
  onStart: (id: string) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
  isCreatingGame?: boolean;
  creatingQuizId?: string | null;
  onCreateQuiz?: () => void;
  containerId: string;
  showCreateButton?: boolean;
  emptyMessage?: string;
  emptySubMessage?: string;
}> = ({
  title,
  quizzes,
  isLoading,
  error,
  onEdit,
  onStart,
  onDelete,
  isDeleting,
  isCreatingGame = false,
  creatingQuizId = null,
  onCreateQuiz,
  containerId,
  showCreateButton = false,
  emptyMessage = 'クイズがありません',
  emptySubMessage,
}) => (
  <div className="mb-12">
    <h2 className="text-xl sm:text-2xl font-semibold mb-4 px-auto">
      {title} {isLoading && <Loader2 className="inline w-5 h-5 animate-spin ml-2" />}
    </h2>

    {/* Error State */}
    {error && (
      <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
        <AlertCircle className="w-5 h-5 text-red-500" />
        <span className="text-red-700">{title}の読み込みに失敗しました</span>
      </div>
    )}

    {/* Loading State */}
    {isLoading ? (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>{title}を読み込み中...</span>
        </div>
      </div>
    ) : quizzes.length === 0 ? (
      <div className="text-center py-12 text-gray-500">
        <p>{emptyMessage}</p>
        {emptySubMessage && <p className="text-sm mt-2">{emptySubMessage}</p>}
        {showCreateButton && onCreateQuiz && (
          <Button onClick={onCreateQuiz} className="mt-4" variant="gradient">
            新しいクイズを作成
          </Button>
        )}
      </div>
    ) : (
      /* Horizontal Scrollable Quiz Cards */
      <div className="relative w-full">
        <div
          id={containerId}
          className="flex gap-4 overflow-x-auto pb-4 scrollbar-none sm:scrollbar-thin scroll-smooth quiz-scroll-container quiz-card-gap w-full"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#6fd6ff #f3f4f6',
          }}
        >
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="flex-shrink-0 w-[300px] sm:w-[320px] md:w-[320px] lg:w-[320px] quiz-card-mobile quiz-card-tablet quiz-card-desktop"
            >
              <QuizCard
                quiz={quiz}
                onEdit={onEdit}
                onStart={onStart}
                onDelete={onDelete}
                isDeleting={isDeleting}
                isStarting={isCreatingGame && quiz.id === creatingQuizId}
              />
            </div>
          ))}
        </div>

        {/* Scroll Navigation Arrows */}
        <ScrollNavigation containerId={containerId} />
      </div>
    )}
  </div>
);

//----------------------------------------------------
// 10. Custom Hooks
//----------------------------------------------------
/**
 * Hook: useDashboardState
 * Description:
 * - Manages dashboard UI state (sidebar, modals, search, filters)
 * - Handles game creation state and errors
 *
 * Returns:
 * - Object: Dashboard state and setters
 */
const useDashboardState = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTER_STATE);
  const [isCreatingGame, setIsCreatingGame] = useState(false);
  const [creatingQuizId, setCreatingQuizId] = useState<string | null>(null);
  const [gameCreationError, setGameCreationError] = useState<string | null>(null);

  return {
    sidebarOpen,
    setSidebarOpen,
    profileModalOpen,
    setProfileModalOpen,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    isCreatingGame,
    setIsCreatingGame,
    creatingQuizId,
    setCreatingQuizId,
    gameCreationError,
    setGameCreationError,
  };
};

/**
 * Hook: useDashboardSearch
 * Description:
 * - Manages search functionality with debouncing and suggestions
 * - Tracks recent searches
 *
 * Parameters:
 * - searchQuery (string): Current search query
 *
 * Returns:
 * - Object: Search state, results, and handlers
 */
const useDashboardSearch = (searchQuery: string) => {
  const { recentSearches, addRecentSearch } = useRecentSearches();
  const searchSuggestions = useSearchSuggestions(searchQuery, recentSearches);

  const {
    draftQuizzes: searchDraftQuizzes,
    publishedQuizzes: searchPublishedQuizzes,
    isLoading: isSearchLoading,
    error: searchError,
  } = useQuizSearch({
    searchQuery,
    debounceMs: SEARCH_DEBOUNCE_MS,
    limit: SEARCH_LIMIT,
  });

  const handleSearch = useCallback(
    (query: string) => {
      if (query.trim()) {
        addRecentSearch(query);
      }
    },
    [addRecentSearch],
  );

  const handleSearchSuggestionClick = useCallback(
    (suggestion: string) => {
      addRecentSearch(suggestion);
    },
    [addRecentSearch],
  );

  return {
    recentSearches,
    searchSuggestions,
    searchDraftQuizzes,
    searchPublishedQuizzes,
    isSearchLoading,
    searchError,
    handleSearch,
    handleSearchSuggestionClick,
  };
};

/**
 * Hook: useQuizData
 * Description:
 * - Manages quiz data fetching and combines search results with regular data
 * - Returns appropriate data based on search state
 *
 * Parameters:
 * - isSearchActive (boolean): Whether search is active
 * - searchDraftQuizzes (QuizSet[]): Draft quizzes from search
 * - searchPublishedQuizzes (QuizSet[]): Published quizzes from search
 * - isSearchLoading (boolean): Search loading state
 * - searchError (Error | null): Search error state
 *
 * Returns:
 * - Object: Combined quiz data, loading, and error states
 */
const useQuizData = (
  isSearchActive: boolean,
  searchDraftQuizzes: QuizSet[],
  searchPublishedQuizzes: QuizSet[],
  isSearchLoading: boolean,
  searchError: Error | null,
) => {
  const { data: draftData, isLoading: isLoadingDrafts, error: draftError } = useDraftQuizzes();
  const {
    data: publishedData,
    isLoading: isLoadingPublished,
    error: publishedError,
  } = usePublishedQuizzes();

  const draftQuizzes = isSearchActive ? searchDraftQuizzes : draftData?.data || [];
  const publishedQuizzes = isSearchActive ? searchPublishedQuizzes : publishedData?.data || [];
  const isLoadingDraftsFinal = isSearchActive ? isSearchLoading : isLoadingDrafts;
  const isLoadingPublishedFinal = isSearchActive ? isSearchLoading : isLoadingPublished;
  const draftErrorFinal = isSearchActive ? searchError : draftError;
  const publishedErrorFinal = isSearchActive ? searchError : publishedError;

  return {
    draftQuizzes,
    publishedQuizzes,
    isLoadingDraftsFinal,
    isLoadingPublishedFinal,
    draftErrorFinal,
    publishedErrorFinal,
  };
};

//----------------------------------------------------
// 11. Main Page Content Component
//----------------------------------------------------
/**
 * Component: DashboardContent
 * Description:
 * - Main dashboard content component
 * - Displays user's quizzes with search, filtering, and management features
 * - Handles quiz creation, editing, starting games, and deletion
 *
 * Features:
 * - Quick Actions: Create quiz, join quiz, analytics, library
 * - Search & Filter: Real-time search with suggestions and advanced filtering
 * - Quiz Sections: Draft and published quiz displays with horizontal scrolling
 * - Game Creation: Start games from quizzes with proper error handling
 * - Profile Management: Profile settings modal
 *
 * Incomplete Features:
 * - Analytics Button: "分析表示" button in QuickActions has no onClick handler
 * - handleFiltersChange: Currently only updates state, could add analytics/logging
 * - handleProfileSave: Currently only closes modal, could add success feedback
 */
function DashboardContent() {
  //----------------------------------------------------
  // 11.1. Hooks & Router Setup
  //----------------------------------------------------
  const router = useRouter();

  //----------------------------------------------------
  // 11.2. State Management
  //----------------------------------------------------
  const {
    sidebarOpen,
    setSidebarOpen,
    profileModalOpen,
    setProfileModalOpen,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    isCreatingGame,
    setIsCreatingGame,
    creatingQuizId,
    setCreatingQuizId,
    gameCreationError,
    setGameCreationError,
  } = useDashboardState();

  //----------------------------------------------------
  // 11.3. Custom Hooks
  //----------------------------------------------------
  const {
    searchSuggestions,
    searchDraftQuizzes,
    searchPublishedQuizzes,
    isSearchLoading,
    searchError,
    handleSearch,
    handleSearchSuggestionClick,
  } = useDashboardSearch(searchQuery);

  const isSearchActive = searchQuery.trim().length > 0;

  const {
    draftQuizzes,
    publishedQuizzes,
    isLoadingDraftsFinal,
    isLoadingPublishedFinal,
    draftErrorFinal,
    publishedErrorFinal,
  } = useQuizData(
    isSearchActive,
    searchDraftQuizzes,
    searchPublishedQuizzes,
    isSearchLoading,
    searchError,
  );

  const { confirmDeleteQuiz, isDeleting, WarningModalComponent } = useQuizDeletion();
  const { deviceId } = useDeviceId();

  //----------------------------------------------------
  // 11.4. Effects
  //----------------------------------------------------
  // (No effects needed)

  //----------------------------------------------------
  // 11.5. Event Handlers
  //----------------------------------------------------
  const handleSearchWithQuery = useCallback(
    (query: string) => {
      setSearchQuery(query);
      handleSearch(query);
    },
    [setSearchQuery, handleSearch],
  );

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, [setSearchQuery]);

  const handleFilterToggle = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, [setSidebarOpen]);

  const handleFiltersChange = useCallback(
    (newFilters: FilterState) => {
      setFilters(newFilters);
    },
    [setFilters],
  );

  const handleProfileSave = useCallback(
    (updatedProfile: ProfileData) => {
      void updatedProfile; // Parameter required by interface but not used
      setProfileModalOpen(false);
    },
    [setProfileModalOpen],
  );

  const handleEditQuiz = useCallback(
    (id: string) => {
      router.push(`/create/edit/${id}`);
    },
    [router],
  );

  //----------------------------------------------------
  // Helper Functions for Game Creation
  //----------------------------------------------------
  /**
   * Function: getHostPlayerName
   * Description:
   * - Extracts host player name from user data
   * - Falls back to email username or 'Host' if unavailable
   */
  const getHostPlayerName = useCallback((): string => {
    const { user } = useAuthStore.getState();
    return user?.username || user?.email?.split('@')[0] || 'Host';
  }, []);

  /**
   * Function: buildGameSettings
   * Description:
   * - Builds game settings from quiz play settings
   * - Applies defaults for missing values
   */
  const buildGameSettings = useCallback(
    (playSettings: {
      show_question_only?: boolean;
      show_explanation?: boolean;
      time_bonus?: boolean;
      streak_bonus?: boolean;
      show_correct_answer?: boolean;
      max_players?: number;
    }) => ({
      show_question_only: playSettings?.show_question_only ?? true,
      show_explanation: playSettings?.show_explanation ?? true,
      time_bonus: playSettings?.time_bonus ?? true,
      streak_bonus: playSettings?.streak_bonus ?? true,
      show_correct_answer: playSettings?.show_correct_answer ?? false,
      max_players: playSettings?.max_players ?? DEFAULT_MAX_PLAYERS,
    }),
    [],
  );

  /**
   * Function: createGameSession
   * Description:
   * - Creates a new game session via API
   * - Returns game data or error
   */
  const createGameSession = useCallback(
    async (
      quizId: string,
      gameSettings: ReturnType<typeof buildGameSettings>,
      deviceId: string | undefined,
      hostPlayerName: string,
    ) => {
      const { data: newGame, error: createError } = await gameApi.createGame(
        quizId,
        gameSettings,
        deviceId,
        hostPlayerName,
      );

      if (createError || !newGame) {
        return {
          success: false,
          error: createError?.message || 'ゲームの作成に失敗しました',
          game: null,
        };
      }

      const gameCode = newGame.game_code || newGame.room_code || '';
      if (!gameCode) {
        return {
          success: false,
          error: 'Game created but no game_code returned from backend',
          game: null,
        };
      }

      return {
        success: true,
        error: null,
        game: { ...newGame, game_code: gameCode },
      };
    },
    [],
  );

  /**
   * Function: navigateToWaitingRoom
   * Description:
   * - Stores game session in sessionStorage
   * - Navigates to host waiting room
   */
  const navigateToWaitingRoom = useCallback(
    (gameCode: string, gameId: string, quizId: string) => {
      sessionStorage.setItem(`game_${gameCode}`, gameId);
      router.push(`/host-waiting-room?code=${gameCode}&quizId=${quizId}&gameId=${gameId}`);
    },
    [router],
  );

  const handleStartQuiz = useCallback(
    async (id: string) => {
      if (isCreatingGame) {
        return;
      }

      try {
        setIsCreatingGame(true);
        setCreatingQuizId(id);
        setGameCreationError(null);

        const hostPlayerName = getHostPlayerName();
        const quizSet = await quizService.getQuiz(id);
        const playSettings = quizSet.play_settings || DEFAULT_PLAY_SETTINGS;
        const gameSettings = buildGameSettings(
          playSettings as {
            show_question_only?: boolean;
            show_explanation?: boolean;
            time_bonus?: boolean;
            streak_bonus?: boolean;
            show_correct_answer?: boolean;
            max_players?: number;
          },
        );

        const result = await createGameSession(
          id,
          gameSettings,
          deviceId || undefined,
          hostPlayerName,
        );

        if (!result.success) {
          setGameCreationError(result.error || 'ゲームの作成に失敗しました');
          return;
        }

        navigateToWaitingRoom(result.game!.game_code, result.game!.id, id);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'ゲームの作成中にエラーが発生しました';
        setGameCreationError(errorMessage);
      } finally {
        setIsCreatingGame(false);
        setCreatingQuizId(null);
      }
    },
    [
      isCreatingGame,
      deviceId,
      setIsCreatingGame,
      setCreatingQuizId,
      setGameCreationError,
      getHostPlayerName,
      buildGameSettings,
      createGameSession,
      navigateToWaitingRoom,
    ],
  );

  const handleDeleteQuiz = useCallback(
    (id: string) => {
      const quiz = [...draftQuizzes, ...publishedQuizzes].find((q) => q.id === id);
      if (quiz) {
        confirmDeleteQuiz(quiz);
      }
    },
    [draftQuizzes, publishedQuizzes, confirmDeleteQuiz],
  );

  const handleCreateQuiz = useCallback(() => {
    router.push('/create');
  }, [router]);

  const handleJoinQuiz = useCallback(() => {
    router.push('/join');
  }, [router]);

  const handleLibrary = useCallback(() => {
    router.push('/dashboard/library');
  }, [router]);

  //----------------------------------------------------
  // 11.6. Loading State
  //----------------------------------------------------
  // (Loading states handled by QuizSection components)

  //----------------------------------------------------
  // 11.7. Error State
  //----------------------------------------------------
  // (Error states handled by QuizSection components and error banner)

  //----------------------------------------------------
  // 11.8. Main Render
  //----------------------------------------------------
  return (
    <>
      {/* SEO Structured Data */}
      <StructuredData type="quiz" />
      <StructuredData type="software" />

      <DashboardHeader onProfileClick={() => setProfileModalOpen(true)} />
      <DashboardMessage className="bg-gradient-to-r from-emerald-50/50 via-purple-50/50 to-orange-50/50 border-b border-gray-200/50" />
      <PageContainer className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <main role="main">
          <Container size="lg" className="max-w-7xl mx-auto">
            {/* Game Creation Error */}
            {gameCreationError && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-md">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  <div>
                    <p className="font-semibold">ゲーム作成エラー</p>
                    <p className="text-sm">{gameCreationError}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions Section */}
            <QuickActions
              onCreateQuiz={handleCreateQuiz}
              onJoinQuiz={handleJoinQuiz}
              onLibrary={handleLibrary}
            />

            {/* Search and Filter Section */}
            <SearchSection
              searchQuery={searchQuery}
              onSearch={handleSearchWithQuery}
              onClearSearch={handleClearSearch}
              onFilterToggle={handleFilterToggle}
              sidebarOpen={sidebarOpen}
              searchSuggestions={searchSuggestions}
              onSuggestionClick={handleSearchSuggestionClick}
              filters={filters}
              onFiltersChange={handleFiltersChange}
            />

            {/* Draft Quizzes Section */}
            <QuizSection
              title="下書きのクイズ"
              quizzes={draftQuizzes}
              isLoading={isLoadingDraftsFinal}
              error={draftErrorFinal}
              onEdit={handleEditQuiz}
              onStart={handleStartQuiz}
              onDelete={handleDeleteQuiz}
              isDeleting={isDeleting}
              isCreatingGame={isCreatingGame}
              creatingQuizId={creatingQuizId}
              onCreateQuiz={handleCreateQuiz}
              containerId="draft-quizzes-container"
              showCreateButton={true}
              emptyMessage="下書きのクイズがありません"
            />

            {/* Published Quizzes Section */}
            <QuizSection
              title="公開済みのクイズ"
              quizzes={publishedQuizzes}
              isLoading={isLoadingPublishedFinal}
              error={publishedErrorFinal}
              onEdit={handleEditQuiz}
              onStart={handleStartQuiz}
              onDelete={handleDeleteQuiz}
              isDeleting={isDeleting}
              isCreatingGame={isCreatingGame}
              creatingQuizId={creatingQuizId}
              containerId="published-quizzes-container"
              showCreateButton={false}
              emptyMessage="公開済みのクイズがありません"
              emptySubMessage="クイズを作成して公開しましょう"
            />
          </Container>
        </main>

        {/* Profile Settings Modal */}
        <ProfileSettingsModal
          isOpen={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
          onSave={handleProfileSave}
        />

        {/* Warning Modal */}
        <WarningModalComponent />
      </PageContainer>
    </>
  );
}

//----------------------------------------------------
// 12. Main Page Component (with Providers)
//----------------------------------------------------
/**
 * Component: DashboardPage
 * Description:
 * - Wraps DashboardContent with necessary providers
 * - Provides QueryClient and authentication guard
 *
 * Returns:
 * - JSX: Page with all required providers
 */
export default function DashboardPage() {
  return (
    <AuthGuard>
      <QueryClientProvider client={queryClient}>
        <DashboardContent />
      </QueryClientProvider>
    </AuthGuard>
  );
}
