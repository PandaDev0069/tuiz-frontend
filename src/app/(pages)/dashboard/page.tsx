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
} from '@/components/ui';
import Link from 'next/link';
import { FilterState } from '@/components/ui/overlays/sidebar-filter';
import { ProfileData } from '@/components/ui/overlays/profile-settings-modal';
import { User } from 'lucide-react';

export default function DashboardPage() {
  const { logout, loading, user } = useAuthStore();
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

  // Mock profile data - in real app this would come from API
  const mockProfile: ProfileData = {
    username: user?.username || 'user123',
    displayName: user?.displayName || 'Quiz Master',
    email: user?.email || 'user@example.com',
    bio: 'Passionate quiz creator and lifelong learner. I love creating engaging educational content that challenges and inspires.',
    avatarUrl: undefined,
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Optionally redirect to home page after logout
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
      // Still redirect even if logout failed
      window.location.href = '/';
    }
  };

  const handleSearch = (query: string) => {
    console.log('Search query:', query);
    console.log('Active filters:', filters);
    // TODO: Implement search functionality with filters
  };

  const handleClearSearch = () => {
    console.log('Search cleared');
    // TODO: Implement clear search functionality
  };

  const handleFilterToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    console.log('Filters updated:', newFilters);
    // TODO: Apply filters to search results
  };

  const handleProfileSave = (updatedProfile: ProfileData) => {
    console.log('Profile updated:', updatedProfile);
    // TODO: Implement API call to save profile
    setProfileModalOpen(false);
  };

  return (
    <PageContainer className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <main role="main">
        <Container size="lg" className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Manage your quizzes and track your progress</p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setProfileModalOpen(true)}
              className="flex items-center gap-2"
            >
              <User className="h-4 w-4" />
              Profile Settings
            </Button>
            <Link href="/">
              <Button variant="outline" size="lg">
                ホームに戻る
              </Button>
            </Link>
            <Button variant="destructive" size="lg" onClick={handleLogout} disabled={loading}>
              {loading ? 'ログアウト中...' : 'ログアウト'}
            </Button>
          </div>

          {/* Search and Filter Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Search & Filter Quizzes</h2>

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

          {/* Quick Actions Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button className="h-24 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
                <span className="text-2xl">📝</span>
                <span className="font-medium">クイズ作成</span>
              </Button>
              <Button className="h-24 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white">
                <span className="text-2xl">🎮</span>
                <span className="font-medium">ゲーム参加</span>
              </Button>
              <Button className="h-24 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white">
                <span className="text-2xl">📊</span>
                <span className="font-medium">分析表示</span>
              </Button>
              <Button className="h-24 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white">
                <span className="text-2xl">🌍</span>
                <span className="font-medium">グローバルライブラリ</span>
              </Button>
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
  );
}
