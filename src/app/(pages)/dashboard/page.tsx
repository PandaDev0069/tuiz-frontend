'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/state/useAuthStore';
import {
  Container,
  Button,
  PageContainer,
  SearchBar,
  SidebarFilter,
  ProfileSettingsModal,
  DashboardHeader,
} from '@/components/ui';
import { QuizCard } from '@/components/ui/data-display/quiz-card';
import { FilterState } from '@/components/ui/overlays/sidebar-filter';
import { ProfileData } from '@/components/ui/overlays/profile-settings-modal';
import { QuizSet, QuizStatus, DifficultyLevel } from '@/types/dashboard';
import { PenTool, Gamepad2, BarChart3, Library } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
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

  // Mock quiz data
  const mockDraftQuizzes: QuizSet[] = [
    {
      id: 'draft-1',
      user_id: user?.id || 'user-1',
      title: 'JavaScript基礎知識クイズ',
      description:
        'JavaScriptの基本的な構文、変数、関数について学べるクイズです。初心者向けの内容となっています。',
      thumbnail_url: undefined,
      is_public: false,
      difficulty_level: DifficultyLevel.EASY,
      category: 'プログラミング',
      total_questions: 15,
      times_played: 0,
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-20T14:30:00Z',
      status: QuizStatus.DRAFT,
      tags: ['JavaScript', '基礎', '初心者'],
      completion_rate: 0,
      play_settings: {
        shuffle_questions: true,
        shuffle_answers: true,
        points_mode: 'standard',
        show_explanations: true,
        allow_retry: true,
        show_correct_answers: true,
        show_score_immediately: true,
        allow_skip: false,
        navigation_mode: 'linear',
      },
    },
    {
      id: 'draft-2',
      user_id: user?.id || 'user-1',
      title: '世界史重要事件クイズ',
      description:
        '世界の歴史における重要な出来事や人物についてのクイズ。古代から現代まで幅広くカバーしています。',
      thumbnail_url: undefined,
      is_public: true,
      difficulty_level: DifficultyLevel.MEDIUM,
      category: '歴史',
      total_questions: 25,
      times_played: 0,
      created_at: '2024-01-10T09:00:00Z',
      updated_at: '2024-01-18T16:45:00Z',
      status: QuizStatus.DRAFT,
      tags: ['世界史', '重要事件', '人物'],
      completion_rate: 0,
      play_settings: {
        shuffle_questions: true,
        shuffle_answers: true,
        points_mode: 'standard',
        show_explanations: true,
        allow_retry: true,
        show_correct_answers: true,
        show_score_immediately: true,
        allow_skip: true,
        navigation_mode: 'free',
      },
    },
    {
      id: 'draft-3',
      user_id: user?.id || 'user-1',
      title: '数学パズル集',
      description:
        '論理的思考力を鍛える数学パズルのコレクション。代数、幾何、確率など様々な分野から出題。',
      thumbnail_url: undefined,
      is_public: false,
      difficulty_level: DifficultyLevel.HARD,
      category: '数学',
      total_questions: 20,
      times_played: 0,
      created_at: '2024-01-05T11:00:00Z',
      updated_at: '2024-01-22T10:15:00Z',
      status: QuizStatus.DRAFT,
      tags: ['数学', 'パズル', '論理'],
      completion_rate: 0,
      play_settings: {
        shuffle_questions: false,
        shuffle_answers: true,
        points_mode: 'difficulty_based',
        show_explanations: true,
        allow_retry: false,
        show_correct_answers: false,
        show_score_immediately: false,
        allow_skip: false,
        navigation_mode: 'linear',
      },
    },
    {
      id: 'draft-4',
      user_id: user?.id || 'user-1',
      title: '科学実験クイズ',
      description: '化学、物理、生物の実験に関するクイズ。実験の手順や結果の予測について学べます。',
      thumbnail_url: undefined,
      is_public: true,
      difficulty_level: DifficultyLevel.MEDIUM,
      category: '科学',
      total_questions: 18,
      times_played: 0,
      created_at: '2024-01-12T13:00:00Z',
      updated_at: '2024-01-19T15:20:00Z',
      status: QuizStatus.DRAFT,
      tags: ['科学', '実験', '化学', '物理'],
      completion_rate: 0,
      play_settings: {
        shuffle_questions: true,
        shuffle_answers: true,
        points_mode: 'standard',
        show_explanations: true,
        allow_retry: true,
        show_correct_answers: true,
        show_score_immediately: true,
        allow_skip: true,
        navigation_mode: 'free',
      },
    },
  ];

  const mockPublishedQuizzes: QuizSet[] = [
    {
      id: 'published-1',
      user_id: user?.id || 'user-1',
      title: 'Python入門クイズ',
      description:
        'Pythonプログラミングの基礎を学べるクイズ。変数、ループ、関数の概念を理解しましょう。',
      thumbnail_url: undefined,
      is_public: true,
      difficulty_level: DifficultyLevel.EASY,
      category: 'プログラミング',
      total_questions: 20,
      times_played: 156,
      created_at: '2023-12-01T08:00:00Z',
      updated_at: '2024-01-15T12:00:00Z',
      status: QuizStatus.PUBLISHED,
      tags: ['Python', '入門', '基礎'],
      completion_rate: 78,
      play_settings: {
        shuffle_questions: true,
        shuffle_answers: true,
        points_mode: 'standard',
        show_explanations: true,
        allow_retry: true,
        show_correct_answers: true,
        show_score_immediately: true,
        allow_skip: false,
        navigation_mode: 'linear',
      },
    },
    {
      id: 'published-2',
      user_id: user?.id || 'user-1',
      title: '日本地理マスター',
      description: '日本の都道府県、地形、気候についての総合クイズ。地理の知識を深めましょう。',
      thumbnail_url: undefined,
      is_public: true,
      difficulty_level: DifficultyLevel.MEDIUM,
      category: '地理',
      total_questions: 30,
      times_played: 89,
      created_at: '2023-11-15T10:00:00Z',
      updated_at: '2024-01-10T14:30:00Z',
      status: QuizStatus.PUBLISHED,
      tags: ['日本', '地理', '都道府県'],
      completion_rate: 82,
      play_settings: {
        shuffle_questions: true,
        shuffle_answers: true,
        points_mode: 'standard',
        show_explanations: true,
        allow_retry: true,
        show_correct_answers: true,
        show_score_immediately: true,
        allow_skip: true,
        navigation_mode: 'free',
      },
    },
    {
      id: 'published-3',
      user_id: user?.id || 'user-1',
      title: '英語文法チャレンジ',
      description: '中学・高校レベルの英語文法を総復習できるクイズ。時制、助動詞、関係代名詞など。',
      thumbnail_url: undefined,
      is_public: true,
      difficulty_level: DifficultyLevel.MEDIUM,
      category: '英語',
      total_questions: 25,
      times_played: 234,
      created_at: '2023-10-20T09:00:00Z',
      updated_at: '2024-01-05T11:45:00Z',
      status: QuizStatus.PUBLISHED,
      tags: ['英語', '文法', '中学', '高校'],
      completion_rate: 75,
      play_settings: {
        shuffle_questions: true,
        shuffle_answers: true,
        points_mode: 'standard',
        show_explanations: true,
        allow_retry: true,
        show_correct_answers: true,
        show_score_immediately: true,
        allow_skip: true,
        navigation_mode: 'free',
      },
    },
    {
      id: 'published-4',
      user_id: user?.id || 'user-1',
      title: '音楽理論クイズ',
      description:
        '楽譜の読み方、音程、和音について学べる音楽理論のクイズ。初心者から上級者まで対応。',
      thumbnail_url: undefined,
      is_public: true,
      difficulty_level: DifficultyLevel.HARD,
      category: '音楽',
      total_questions: 35,
      times_played: 67,
      created_at: '2023-09-10T14:00:00Z',
      updated_at: '2023-12-28T16:20:00Z',
      status: QuizStatus.PUBLISHED,
      tags: ['音楽', '理論', '楽譜', '和音'],
      completion_rate: 68,
      play_settings: {
        shuffle_questions: false,
        shuffle_answers: true,
        points_mode: 'difficulty_based',
        show_explanations: true,
        allow_retry: false,
        show_correct_answers: false,
        show_score_immediately: false,
        allow_skip: false,
        navigation_mode: 'linear',
      },
    },
    {
      id: 'published-5',
      user_id: user?.id || 'user-1',
      title: '料理の基本知識',
      description:
        '調理法、食材の選び方、栄養について学べる料理の基礎知識クイズ。家庭料理からプロまで。',
      thumbnail_url: undefined,
      is_public: true,
      difficulty_level: DifficultyLevel.EASY,
      category: '料理',
      total_questions: 22,
      times_played: 189,
      created_at: '2023-08-25T11:00:00Z',
      updated_at: '2023-12-15T13:10:00Z',
      status: QuizStatus.PUBLISHED,
      tags: ['料理', '調理法', '食材', '栄養'],
      completion_rate: 85,
      play_settings: {
        shuffle_questions: true,
        shuffle_answers: true,
        points_mode: 'standard',
        show_explanations: true,
        allow_retry: true,
        show_correct_answers: true,
        show_score_immediately: true,
        allow_skip: true,
        navigation_mode: 'free',
      },
    },
  ];

  // Mock profile data - in real app this would come from API
  const mockProfile: ProfileData = {
    username: user?.username || 'user123',
    displayName: user?.displayName || 'Quiz Master',
    email: user?.email || 'user@example.com',
    bio: 'Passionate quiz creator and lifelong learner. I love creating engaging educational content that challenges and inspires.',
    avatarUrl: undefined,
  };

  const handleSearch = (query: string) => {
    console.log('Search query:', query);
    console.log('Active filters:', filters);
    // Search functionality will be implemented when backend API is ready
    // For now, log the search parameters
  };

  const handleClearSearch = () => {
    console.log('Search cleared');
    // Clear search functionality will be implemented when backend API is ready
    // For now, just log the action
  };

  const handleFilterToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    console.log('Filters updated:', newFilters);
    // Filter application will be implemented when backend API is ready
    // For now, just log the filter changes
  };

  const handleProfileSave = (updatedProfile: ProfileData) => {
    console.log('Profile updated:', updatedProfile);
    // Profile save API call will be implemented when backend is ready
    // For now, just close the modal
    setProfileModalOpen(false);
  };

  const handleEditQuiz = (id: string) => {
    console.log('Edit quiz:', id);
    // Edit functionality will be implemented
  };

  const handleStartQuiz = (id: string) => {
    console.log('Start quiz:', id);
    // Start quiz functionality will be implemented
  };

  const handleDeleteQuiz = (id: string) => {
    console.log('Delete quiz:', id);
    // Delete functionality will be implemented
  };

  return (
    <>
      <DashboardHeader onProfileClick={() => setProfileModalOpen(true)} />
      <PageContainer className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <main role="main">
          <Container size="lg" className="max-w-7xl mx-auto">
            {/* Quick Actions Section */}
            <div className="mb-8">
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-1 max-w-4xl mx-auto">
                <Button className="group relative h-24 sm:h-28 w-full sm:w-48 flex flex-col items-center justify-center gap-0 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 hover:from-blue-600 hover:via-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 border-0 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  <PenTool
                    className="!w-12 !h-12 sm:!w-15 sm:!h-15 !text-yellow-300 group-hover:scale-110 transition-transform duration-200"
                    strokeWidth={2}
                    size={48}
                  />
                  <span className="font-semibold text-xs sm:text-sm">クイズ作成</span>
                </Button>

                <Button className="group relative h-24 sm:h-28 w-full sm:w-48 flex flex-col items-center justify-center gap-0 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-600 hover:via-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 border-0 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  <Gamepad2
                    className="!w-12 !h-12 sm:!w-15 sm:!h-15 !text-pink-400 group-hover:scale-110 transition-transform duration-200"
                    strokeWidth={2}
                    size={48}
                  />
                  <span className="font-semibold text-xs sm:text-sm">ゲーム参加</span>
                </Button>

                <Button className="group relative h-24 sm:h-28 w-full sm:w-48 flex flex-col items-center justify-center gap-0 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 border-0 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  <BarChart3
                    className="!w-12 !h-12 sm:!w-15 sm:!h-15 !text-cyan-400 group-hover:scale-110 transition-transform duration-200"
                    strokeWidth={2}
                    size={48}
                  />
                  <span className="font-semibold text-xs sm:text-sm">分析表示</span>
                </Button>

                <Button className="group relative h-24 sm:h-28 w-full sm:w-48 flex flex-col items-center justify-center gap-0 bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 hover:from-violet-600 hover:via-purple-600 hover:to-fuchsia-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 border-0 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  <Library
                    className="!w-12 !h-12 sm:!w-15 sm:!h-15 !text-orange-400 group-hover:scale-110 transition-transform duration-200"
                    strokeWidth={2}
                    size={48}
                  />
                  <span className="font-semibold text-xs sm:text-sm">クイズライブラリ</span>
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
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 px-auto">下書きのクイズ</h2>

              {/* Horizontal Scrollable Draft Cards */}
              <div className="relative w-full">
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide quiz-scroll-container quiz-card-gap w-full">
                  {mockDraftQuizzes.map((quiz) => (
                    <div
                      key={quiz.id}
                      className="flex-shrink-0 w-[300px] sm:w-[320px] md:w-[320px] lg:w-[320px] quiz-card-mobile quiz-card-tablet quiz-card-desktop"
                    >
                      <QuizCard
                        quiz={quiz}
                        onEdit={handleEditQuiz}
                        onStart={handleStartQuiz}
                        onDelete={handleDeleteQuiz}
                      />
                    </div>
                  ))}
                </div>

                {/* Scroll Indicators - Hidden on mobile */}
                <div className="hidden md:block">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 cursor-pointer hover:bg-gray-50 scroll-indicator">
                    ‹
                  </div>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 cursor-pointer hover:bg-gray-50 scroll-indicator">
                    ›
                  </div>
                </div>
              </div>
            </div>

            {/* Published Quizzes Section */}
            <div className="mb-12">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 px-auto">公開済みのクイズ</h2>

              {/* Horizontal Scrollable Published Cards */}
              <div className="relative w-full">
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide quiz-scroll-container quiz-card-gap w-full">
                  {mockPublishedQuizzes.map((quiz) => (
                    <div
                      key={quiz.id}
                      className="flex-shrink-0 w-[300px] sm:w-[320px] md:w-[360px] lg:w-[360px] quiz-card-mobile quiz-card-tablet quiz-card-desktop"
                    >
                      <QuizCard
                        quiz={quiz}
                        onEdit={handleEditQuiz}
                        onStart={handleStartQuiz}
                        onDelete={handleDeleteQuiz}
                      />
                    </div>
                  ))}
                </div>

                {/* Scroll Indicators - Hidden on mobile */}
                <div className="hidden md:block">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 cursor-pointer hover:bg-gray-50 scroll-indicator">
                    ‹
                  </div>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 cursor-pointer hover:bg-gray-50 scroll-indicator">
                    ›
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </main>

        {/* Profile Settings Modal */}
        <ProfileSettingsModal
          isOpen={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
          profile={mockProfile}
          onSave={handleProfileSave}
        />
      </PageContainer>
    </>
  );
}
