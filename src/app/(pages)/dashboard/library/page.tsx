'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { QueryClientProvider } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { queryClient } from '@/lib/queryClient';
import { PageContainer } from '@/components/ui/core/page-container';
import { DashboardHeader } from '@/components/ui/core/dashboard-header';
import {
  LibraryTabs,
  TabsContent,
  MyLibraryContent,
  PublicBrowseContent,
} from '@/components/quiz-library';

type TabValue = 'my-library' | 'public-browse';

// Using global query client from @/lib/queryClient

export default function LibraryPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabValue>('my-library');

  // State for My Library
  const [myLibraryFilters, setMyLibraryFilters] = useState({
    category: undefined as string | undefined,
    status: 'all' as 'all' | 'drafts' | 'published',
    sort: 'updated_desc',
  });
  const [myLibraryPagination, setMyLibraryPagination] = useState({
    page: 1,
    limit: 12,
  });

  // State for Public Browse
  const [publicBrowseQuery, setPublicBrowseQuery] = useState('');
  const [publicBrowseFilters, setPublicBrowseFilters] = useState({
    category: undefined as string | undefined,
    difficulty: undefined as string | undefined,
    sort: 'plays_desc',
  });
  const [publicBrowsePagination, setPublicBrowsePagination] = useState({
    page: 1,
    limit: 12,
  });

  // Event handlers for My Library
  const handleMyLibraryFiltersChange = (filters: Partial<typeof myLibraryFilters>) => {
    setMyLibraryFilters((prev) => ({ ...prev, ...filters }));
    setMyLibraryPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page
  };

  const handleMyLibraryPageChange = (page: number) => {
    setMyLibraryPagination((prev) => ({ ...prev, page }));
  };

  const handleEditQuiz = (id: string) => {
    router.push(`/dashboard/create/edit?id=${id}`);
  };

  const handleStartQuiz = (id: string) => {
    router.push(`/host?quiz=${id}`);
  };

  const handleDeleteQuiz = (id: string) => {
    // TODO: Implement delete quiz functionality
    console.log('Delete quiz:', id);
  };

  // Event handlers for Public Browse
  const handlePublicBrowseSearchChange = (query: string) => {
    setPublicBrowseQuery(query);
    setPublicBrowsePagination((prev) => ({ ...prev, page: 1 })); // Reset to first page
  };

  const handlePublicBrowseFiltersChange = (filters: Partial<typeof publicBrowseFilters>) => {
    setPublicBrowseFilters((prev) => ({ ...prev, ...filters }));
    setPublicBrowsePagination((prev) => ({ ...prev, page: 1 })); // Reset to first page
  };

  const handlePublicBrowsePageChange = (page: number) => {
    setPublicBrowsePagination((prev) => ({ ...prev, page }));
  };

  const handleCloneQuiz = async (id: string) => {
    try {
      // Show immediate feedback that cloning has started
      toast.loading('クイズをクローンしています...', { id: `clone-${id}` });

      // The actual cloning is handled by the useCloneQuiz hook in PublicBrowseContent
      // This handler is for additional parent-level logic after successful clone
      console.log('Clone quiz initiated:', id);

      // After successful clone, we could navigate to the "My Library" tab
      // or refresh the current view. The PublicBrowseContent will handle the actual clone
    } catch (error) {
      console.error('Failed to initiate clone:', error);
      toast.error('クローンの開始に失敗しました', { id: `clone-${id}` });
    }
  };

  const handleCloneSuccess = (clonedQuizId: string, originalQuizTitle: string) => {
    // Switch to My Library tab to show the newly cloned quiz
    setActiveTab('my-library');

    // Show success message
    toast.success(`「${originalQuizTitle}」をクローンしました！`);

    // Option to edit the cloned quiz (we can add this as a separate notification)
    setTimeout(() => {
      toast(
        <div className="flex items-center gap-2">
          <span>編集しますか？</span>
          <button
            onClick={() => {
              router.push(`/dashboard/create/edit?id=${clonedQuizId}`);
              toast.dismiss();
            }}
            className="text-blue-600 underline"
          >
            編集
          </button>
        </div>,
        { duration: 3000 },
      );
    }, 1000);

    // Reset my library pagination to first page to ensure user sees the new quiz
    setMyLibraryPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePreviewQuiz = (id: string) => {
    // TODO: Implement preview quiz functionality
    console.log('Preview quiz:', id);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <PageContainer entrance="fadeIn" className="min-h-screen">
        <DashboardHeader />

        {/* Page Title and Description */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">クイズライブラリ</h1>
            <p className="text-lg text-gray-600">
              あなたのクイズを管理し、パブリッククイズを探索しましょう
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LibraryTabs activeTab={activeTab} onTabChange={setActiveTab}>
            <TabsContent value="my-library" className="space-y-6">
              <MyLibraryContent
                searchQuery=""
                filters={myLibraryFilters}
                pagination={myLibraryPagination}
                onFiltersChange={handleMyLibraryFiltersChange}
                onPageChange={handleMyLibraryPageChange}
                onEditQuiz={handleEditQuiz}
                onStartQuiz={handleStartQuiz}
                onDeleteQuiz={handleDeleteQuiz}
              />
            </TabsContent>

            <TabsContent value="public-browse" className="space-y-6">
              <PublicBrowseContent
                searchQuery={publicBrowseQuery}
                filters={publicBrowseFilters}
                pagination={publicBrowsePagination}
                onFiltersChange={handlePublicBrowseFiltersChange}
                onPageChange={handlePublicBrowsePageChange}
                onSearchChange={handlePublicBrowseSearchChange}
                onCloneQuiz={handleCloneQuiz}
                onCloneSuccess={handleCloneSuccess}
                onPreviewQuiz={handlePreviewQuiz}
              />
            </TabsContent>
          </LibraryTabs>
        </div>
      </PageContainer>
    </QueryClientProvider>
  );
}
