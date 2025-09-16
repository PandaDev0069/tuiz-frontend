'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
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
import { FilterState } from '@/components/ui/overlays/sidebar-filter';
import { ProfileData } from '@/components/ui/overlays/profile-settings-modal';
import { QuizSet } from '@/types/quiz';
import { PenTool, Gamepad2, BarChart3, Library, Loader2, AlertCircle } from 'lucide-react';
import { StructuredData } from '@/components/SEO';
import { useDraftQuizzes, usePublishedQuizzes } from '@/hooks/useDashboard';
import { useQuizDeletion } from '@/hooks/useQuizDeletion';
import { useQuizSearch, useRecentSearches, useSearchSuggestions } from '@/hooks/useQuizSearch';
import { AuthGuard } from '@/components/auth/AuthGuard';

// Custom hook for dashboard state management
const useDashboardState = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    status: [],
    difficulty: [],
    category: [],
    sortBy: 'newest',
    viewMode: 'grid',
    dateRange: 'all',
    questionCount: 'all',
    playCount: 'all',
    tags: [],
  });

  return {
    sidebarOpen,
    setSidebarOpen,
    profileModalOpen,
    setProfileModalOpen,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
  };
};

// Custom hook for search functionality
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
    debounceMs: 300,
    limit: 50,
  });

  const handleSearch = (query: string) => {
    if (query.trim()) {
      addRecentSearch(query);
    }
  };

  const handleSearchSuggestionClick = (suggestion: string) => {
    addRecentSearch(suggestion);
  };

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

// Custom hook for quiz data management
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

// Quick Actions component
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

// Search and Filter Section component
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

// Scroll navigation utility
const scrollContainer = (direction: 'left' | 'right', containerId: string) => {
  const container = document.getElementById(containerId);
  if (container) {
    const scrollAmount = 320; // Width of one card + gap
    const currentScroll = container.scrollLeft;
    const newScroll =
      direction === 'left' ? currentScroll - scrollAmount : currentScroll + scrollAmount;

    container.scrollTo({
      left: newScroll,
      behavior: 'smooth',
    });
  }
};

// Scroll Navigation Arrows component
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

// Create a QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
    },
  },
});

// Quiz Section component for displaying quiz lists
const QuizSection: React.FC<{
  title: string;
  quizzes: QuizSet[];
  isLoading: boolean;
  error: Error | null;
  onEdit: (id: string) => void;
  onStart: (id: string) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
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

// Dashboard content component
function DashboardContent() {
  const router = useRouter();

  // Use custom hooks for state management
  const {
    sidebarOpen,
    setSidebarOpen,
    profileModalOpen,
    setProfileModalOpen,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
  } = useDashboardState();

  // Use custom hooks for search functionality
  const {
    searchSuggestions,
    searchDraftQuizzes,
    searchPublishedQuizzes,
    isSearchLoading,
    searchError,
    handleSearch,
    handleSearchSuggestionClick,
  } = useDashboardSearch(searchQuery);

  // Determine search state
  const isSearchActive = searchQuery.trim().length > 0;

  // Use custom hook for quiz data
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

  // Event handlers
  const handleSearchWithQuery = (query: string) => {
    setSearchQuery(query);
    handleSearch(query);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleFilterToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    console.log('Filters updated:', newFilters);
  };

  const handleProfileSave = (updatedProfile: ProfileData) => {
    console.log('Profile updated:', updatedProfile);
    setProfileModalOpen(false);
  };

  const handleEditQuiz = (id: string) => {
    router.push(`/create/edit/${id}`);
  };

  const handleStartQuiz = (id: string) => {
    router.push(`/play/${id}`);
  };

  const handleDeleteQuiz = (id: string) => {
    const quiz = [...draftQuizzes, ...publishedQuizzes].find((q) => q.id === id);
    if (quiz) {
      confirmDeleteQuiz(quiz);
    }
  };

  const handleCreateQuiz = () => {
    router.push('/create');
  };

  const handleJoinQuiz = () => {
    router.push('/join');
  };

  const handleLibrary = () => {
    router.push('/dashboard/library');
  };

  return (
    <>
      {/* Structured Data for SEO */}
      <StructuredData type="quiz" />
      <StructuredData type="software" />

      <DashboardHeader onProfileClick={() => setProfileModalOpen(true)} />
      <DashboardMessage className="bg-gradient-to-r from-emerald-50/50 via-purple-50/50 to-orange-50/50 border-b border-gray-200/50" />
      <PageContainer className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <main role="main">
          <Container size="lg" className="max-w-7xl mx-auto">
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

// Main dashboard page with QueryClientProvider and AuthGuard
export default function DashboardPage() {
  return (
    <AuthGuard>
      <QueryClientProvider client={queryClient}>
        <DashboardContent />
      </QueryClientProvider>
    </AuthGuard>
  );
}
