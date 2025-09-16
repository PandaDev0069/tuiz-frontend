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
import { PenTool, Gamepad2, BarChart3, Library, Loader2, AlertCircle } from 'lucide-react';
import { StructuredData } from '@/components/SEO';
import { useDraftQuizzes, usePublishedQuizzes } from '@/hooks/useDashboard';
import { useQuizDeletion } from '@/hooks/useQuizDeletion';
import { useQuizSearch, useRecentSearches, useSearchSuggestions } from '@/hooks/useQuizSearch';
import { AuthGuard } from '@/components/auth/AuthGuard';

// Create a QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
    },
  },
});

// Dashboard content component
function DashboardContent() {
  const router = useRouter();
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

  // Search hooks
  const { recentSearches, addRecentSearch } = useRecentSearches();
  const searchSuggestions = useSearchSuggestions(searchQuery, recentSearches);

  // Search functionality
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

  // Real data hooks (fallback when not searching)
  const { data: draftData, isLoading: isLoadingDrafts, error: draftError } = useDraftQuizzes();
  const {
    data: publishedData,
    isLoading: isLoadingPublished,
    error: publishedError,
  } = usePublishedQuizzes();

  const { confirmDeleteQuiz, isDeleting, WarningModalComponent } = useQuizDeletion();

  // Determine which data to use based on search state
  const isSearchActive = searchQuery.trim().length > 0;
  const draftQuizzes = isSearchActive ? searchDraftQuizzes : draftData?.data || [];
  const publishedQuizzes = isSearchActive ? searchPublishedQuizzes : publishedData?.data || [];
  const isLoadingDraftsFinal = isSearchActive ? isSearchLoading : isLoadingDrafts;
  const isLoadingPublishedFinal = isSearchActive ? isSearchLoading : isLoadingPublished;
  const draftErrorFinal = isSearchActive ? searchError : draftError;
  const publishedErrorFinal = isSearchActive ? searchError : publishedError;

  // Profile data is now fetched by the ProfileSettingsModal component

  const handleSearch = (query: string) => {
    setSearchQuery(query);

    if (query.trim()) {
      addRecentSearch(query);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleSearchSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    addRecentSearch(suggestion);
  };

  const handleFilterToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    // Update Later: Implement filter functionality with backend
    console.log('Filters updated:', newFilters);
  };

  const handleProfileSave = (updatedProfile: ProfileData) => {
    // Profile save is now handled by the ProfileSettingsModal component
    console.log('Profile updated:', updatedProfile);
    setProfileModalOpen(false);
  };

  const handleEditQuiz = (id: string) => {
    router.push(`/create/edit/${id}`);
  };

  const handleStartQuiz = (id: string) => {
    // TODO: Implement start quiz functionality - redirect to play page
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
            <div className="mb-8">
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-1 max-w-4xl mx-auto">
                <Button
                  onClick={handleCreateQuiz}
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
                  onClick={() => router.push('/join')}
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

                <Button className="group relative h-24 sm:h-28 w-full sm:w-48 flex flex-col items-center justify-center gap-0 bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 hover:from-violet-600 hover:via-purple-600 hover:to-fuchsia-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 border-0 overflow-hidden">
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

            {/* Search and Filter Section */}
            <div className="mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 px-auto">検索</h2>

              {/* Search Bar */}
              <div className="flex justify-center mb-6">
                <SearchBar
                  placeholder="クイズ、カテゴリ、タグで検索..."
                  onSearch={handleSearch}
                  onClear={handleClearSearch}
                  showFilters={true}
                  onFilterToggle={handleFilterToggle}
                  isFilterOpen={sidebarOpen}
                  className="w-full max-w-3xl"
                  defaultValue={searchQuery}
                  suggestions={searchSuggestions}
                  onSuggestionClick={handleSearchSuggestionClick}
                />
              </div>

              {/* Sidebar Filter Modal */}
              <SidebarFilter
                isOpen={sidebarOpen}
                onToggle={handleFilterToggle}
                filters={filters}
                onFiltersChange={handleFiltersChange}
              />
            </div>

            {/* Draft Quizzes Section */}
            <div className="mb-12">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 px-auto">
                下書きのクイズ{' '}
                {isLoadingDraftsFinal && <Loader2 className="inline w-5 h-5 animate-spin ml-2" />}
              </h2>

              {/* Error State */}
              {draftErrorFinal && (
                <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <span className="text-red-700">下書きクイズの読み込みに失敗しました</span>
                </div>
              )}

              {/* Loading State */}
              {isLoadingDraftsFinal ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>下書きクイズを読み込み中...</span>
                  </div>
                </div>
              ) : draftQuizzes.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>下書きのクイズがありません</p>
                  <Button onClick={handleCreateQuiz} className="mt-4" variant="gradient">
                    新しいクイズを作成
                  </Button>
                </div>
              ) : (
                /* Horizontal Scrollable Draft Cards */
                <div className="relative w-full">
                  <div
                    id="draft-quizzes-container"
                    className="flex gap-4 overflow-x-auto pb-4 scrollbar-none sm:scrollbar-thin scroll-smooth quiz-scroll-container quiz-card-gap w-full"
                    style={{
                      scrollbarWidth: 'thin',
                      scrollbarColor: '#6fd6ff #f3f4f6',
                    }}
                  >
                    {draftQuizzes.map((quiz) => (
                      <div
                        key={quiz.id}
                        className="flex-shrink-0 w-[300px] sm:w-[320px] md:w-[320px] lg:w-[320px] quiz-card-mobile quiz-card-tablet quiz-card-desktop"
                      >
                        <QuizCard
                          quiz={quiz}
                          onEdit={handleEditQuiz}
                          onStart={handleStartQuiz}
                          onDelete={handleDeleteQuiz}
                          isDeleting={isDeleting}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Scroll Navigation Arrows - Hidden on mobile */}
                  <div className="hidden md:block">
                    <button
                      onClick={() => scrollContainer('left', 'draft-quizzes-container')}
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 cursor-pointer hover:bg-gray-50 hover:shadow-xl transition-all duration-200 border border-gray-200"
                      aria-label="Scroll left"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => scrollContainer('right', 'draft-quizzes-container')}
                      className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 cursor-pointer hover:bg-gray-50 hover:shadow-xl transition-all duration-200 border border-gray-200"
                      aria-label="Scroll right"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Published Quizzes Section */}
            <div className="mb-12">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 px-auto">
                公開済みのクイズ{' '}
                {isLoadingPublishedFinal && (
                  <Loader2 className="inline w-5 h-5 animate-spin ml-2" />
                )}
              </h2>

              {/* Error State */}
              {publishedErrorFinal && (
                <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <span className="text-red-700">公開済みクイズの読み込みに失敗しました</span>
                </div>
              )}

              {/* Loading State */}
              {isLoadingPublishedFinal ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>公開済みクイズを読み込み中...</span>
                  </div>
                </div>
              ) : publishedQuizzes.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>公開済みのクイズがありません</p>
                  <p className="text-sm mt-2">クイズを作成して公開しましょう</p>
                </div>
              ) : (
                /* Horizontal Scrollable Published Cards */
                <div className="relative w-full">
                  <div
                    id="published-quizzes-container"
                    className="flex gap-4 overflow-x-auto pb-4 scrollbar-none sm:scrollbar-thin scroll-smooth quiz-scroll-container quiz-card-gap w-full"
                    style={{
                      scrollbarWidth: 'thin',
                      scrollbarColor: '#6fd6ff #f3f4f6',
                    }}
                  >
                    {publishedQuizzes.map((quiz) => (
                      <div
                        key={quiz.id}
                        className="flex-shrink-0 w-[300px] sm:w-[360px] md:w-[360px] lg:w-[360px] quiz-card-mobile quiz-card-tablet quiz-card-desktop"
                      >
                        <QuizCard
                          quiz={quiz}
                          onEdit={handleEditQuiz}
                          onStart={handleStartQuiz}
                          onDelete={handleDeleteQuiz}
                          isDeleting={isDeleting}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
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
