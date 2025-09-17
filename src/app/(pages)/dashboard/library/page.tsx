'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { QueryClientProvider } from '@tanstack/react-query';
import { toast, Toaster } from 'react-hot-toast';
import { queryClient } from '@/lib/queryClient';
import { PageContainer } from '@/components/ui/core/page-container';
import { QuizLibraryHeader } from '@/components/ui/core/quiz-library-header';
import {
  LibraryTabs,
  TabsContent,
  MyLibraryContent,
  PublicBrowseContent,
  PreviewQuizModal,
} from '@/components/quiz-library';
import { useQuizPreview, useCloneQuiz } from '@/hooks/useQuizLibrary';

type TabValue = 'my-library' | 'public-browse';

// Preview Quiz Wrapper Component (uses hooks inside QueryClientProvider)
interface PreviewQuizWrapperProps {
  isOpen: boolean;
  quizId: string | null;
  onClose: () => void;
  onStartQuiz: (quizId: string) => void;
}

const PreviewQuizWrapper: React.FC<PreviewQuizWrapperProps> = ({
  isOpen,
  quizId,
  onClose,
  onStartQuiz,
}) => {
  // Preview quiz hook
  const {
    data: previewData,
    isLoading: previewLoading,
    error: previewError,
  } = useQuizPreview(quizId || '', isOpen);

  // Clone quiz hook
  const { mutate: cloneQuiz, isPending: isCloning } = useCloneQuiz();

  const handleClone = (quizId: string) => {
    cloneQuiz(quizId, {
      onSuccess: (data) => {
        toast.success(data.message);
        onClose();
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to clone quiz');
      },
    });
  };

  return (
    <PreviewQuizModal
      isOpen={isOpen}
      onClose={onClose}
      quiz={previewData?.quiz || null}
      questions={previewData?.questions || []}
      isLoading={previewLoading}
      error={previewError?.message}
      onCloneQuiz={handleClone}
      onStartQuiz={onStartQuiz}
      isCloning={isCloning}
    />
  );
};

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
  const [myLibrarySearchQuery, setMyLibrarySearchQuery] = useState('');

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

  // Preview modal state
  const [previewModalState, setPreviewModalState] = useState<{
    isOpen: boolean;
    quizId: string | null;
  }>({
    isOpen: false,
    quizId: null,
  });

  // Event handlers for My Library
  const handleMyLibraryFiltersChange = (filters: Partial<typeof myLibraryFilters>) => {
    setMyLibraryFilters((prev) => ({ ...prev, ...filters }));
    setMyLibraryPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page
  };

  const handleMyLibrarySearchChange = (query: string) => {
    setMyLibrarySearchQuery(query);
    setMyLibraryPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page
  };

  const handleMyLibraryPageChange = (page: number) => {
    setMyLibraryPagination((prev) => ({ ...prev, page }));
  };

  const handleEditQuiz = (id: string) => {
    router.push(`/create/edit/${id}`);
  };

  const handleStartQuiz = (id: string) => {
    router.push(`/host?quiz=${id}`);
  };

  const handleDeleteQuiz = (id: string) => {
    // The actual deletion is handled by the useDeleteQuiz hook in MyLibraryContent
    // This handler is for any additional parent-level logic after successful deletion
    console.log('Quiz deleted:', id);
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
      // The actual cloning is handled by the useCloneQuiz hook in PublicBrowseContent
      // This handler is for additional parent-level logic after successful clone
      console.log('Clone quiz initiated:', id);

      // After successful clone, we could navigate to the "My Library" tab
      // or refresh the current view. The PublicBrowseContent will handle the actual clone
    } catch (error) {
      console.error('Failed to initiate clone:', error);
      toast.error('クローンの開始に失敗しました');
    }
  };

  const handleCloneSuccess = (clonedQuizId: string, originalQuizTitle: string) => {
    // Switch to My Library tab to show the newly cloned quiz
    setActiveTab('my-library');

    // Show success message
    toast.success(`「${originalQuizTitle}」をクローンしました！`, {
      duration: 4000,
      id: `clone-success-${clonedQuizId}`, // Unique ID to prevent conflicts
    });

    // Option to edit the cloned quiz (we can add this as a separate notification)
    setTimeout(() => {
      toast(
        <div className="flex items-center gap-2">
          <span>編集しますか？</span>
          <button
            onClick={() => {
              router.push(`/create/edit/${clonedQuizId}`);
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
    setPreviewModalState({
      isOpen: true,
      quizId: id,
    });
  };

  const handleClosePreview = () => {
    setPreviewModalState({
      isOpen: false,
      quizId: null,
    });
  };

  const handleStartFromPreview = (quizId: string) => {
    // Navigate to quiz start page
    router.push(`/dashboard/quiz/${quizId}/start`);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <PageContainer entrance="fadeIn" className="min-h-screen">
        <QuizLibraryHeader className="mb-8" />

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
                searchQuery={myLibrarySearchQuery}
                filters={myLibraryFilters}
                pagination={myLibraryPagination}
                onFiltersChange={handleMyLibraryFiltersChange}
                onPageChange={handleMyLibraryPageChange}
                onSearchChange={handleMyLibrarySearchChange}
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

        {/* Preview Quiz Modal */}
        <PreviewQuizWrapper
          isOpen={previewModalState.isOpen}
          quizId={previewModalState.quizId}
          onClose={handleClosePreview}
          onStartQuiz={handleStartFromPreview}
        />
      </PageContainer>
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}
