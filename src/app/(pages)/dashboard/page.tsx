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
import { FilterState } from '@/components/ui/overlays/sidebar-filter';
import { ProfileData } from '@/components/ui/overlays/profile-settings-modal';
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

  return (
    <>
      <DashboardHeader onProfileClick={() => setProfileModalOpen(true)} />
      <PageContainer className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <main role="main">
          <Container size="lg" className="max-w-7xl mx-auto">
            {/* Quick Actions Section */}
            <div className="mb-8">
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-1 max-w-4xl mx-auto">
                <Button className="group relative h-28 w-48 flex flex-col items-center justify-center gap-0 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 hover:from-blue-600 hover:via-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 border-0 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  <PenTool
                    className="!w-15 !h-15 !text-yellow-300 group-hover:scale-110 transition-transform duration-200"
                    strokeWidth={2}
                    size={60}
                  />
                  <span className="font-semibold text-sm">クイズ作成</span>
                </Button>

                <Button className="group relative h-28 w-48 flex flex-col items-center justify-center gap-0 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-600 hover:via-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 border-0 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  <Gamepad2
                    className="!w-15 !h-15 !text-pink-400 group-hover:scale-110 transition-transform duration-200"
                    strokeWidth={2}
                    size={60}
                  />
                  <span className="font-semibold text-sm">ゲーム参加</span>
                </Button>

                <Button className="group relative h-28 w-48 flex flex-col items-center justify-center gap-0 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 border-0 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  <BarChart3
                    className="!w-15 !h-15 !text-cyan-400 group-hover:scale-110 transition-transform duration-200"
                    strokeWidth={2}
                    size={60}
                  />
                  <span className="font-semibold text-sm">分析表示</span>
                </Button>

                <Button className="group relative h-28 w-48 flex flex-col items-center justify-center gap-0 bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 hover:from-violet-600 hover:via-purple-600 hover:to-fuchsia-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 border-0 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  <Library
                    className="!w-15 !h-15 !text-orange-400 group-hover:scale-110 transition-transform duration-200"
                    strokeWidth={2}
                    size={60}
                  />
                  <span className="font-semibold text-sm">クイズライブラリ</span>
                </Button>
              </div>
            </div>

            {/* Search and Filter Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 px-auto">検索</h2>

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
