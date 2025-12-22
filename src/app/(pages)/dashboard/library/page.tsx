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
import { gameApi } from '@/services/gameApi';
import { quizService } from '@/lib/quizService';

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

  // Game creation state
  const [isCreatingGame, setIsCreatingGame] = useState(false);

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

  const handleStartQuiz = async (id: string) => {
    // Prevent multiple simultaneous game creations
    if (isCreatingGame) {
      return;
    }

    try {
      setIsCreatingGame(true);

      // Fetch quiz set to get play_settings
      const quizSet = await quizService.getQuiz(id);

      // Extract play_settings from quiz set
      // The backend will fetch the quiz again and extract the code from play_settings
      // We pass the play_settings as game_settings so they're used for the game
      const playSettings = quizSet.play_settings || {
        show_question_only: true,
        show_explanation: true,
        time_bonus: true,
        streak_bonus: true,
        show_correct_answer: false,
        max_players: 400,
      };

      // Prepare game settings from play_settings (excluding code - backend handles that)
      const gameSettings = {
        show_question_only: playSettings.show_question_only ?? true,
        show_explanation: playSettings.show_explanation ?? true,
        time_bonus: playSettings.time_bonus ?? true,
        streak_bonus: playSettings.streak_bonus ?? true,
        show_correct_answer: playSettings.show_correct_answer ?? false,
        max_players: playSettings.max_players ?? 400,
      };

      // Create the game via API - this creates both games and game_flows records
      // Backend will fetch the quiz, extract code from play_settings, and use game_settings for game config
      const { data: newGame, error: createError } = await gameApi.createGame(id, gameSettings);

      if (createError || !newGame) {
        const errorMessage = createError?.message || 'ゲームの作成に失敗しました';
        toast.error(errorMessage);
        console.error('Failed to create game:', createError);
        return;
      }

      // Get the authoritative game_code from backend
      const gameCode = newGame.game_code || newGame.room_code || '';
      if (!gameCode) {
        throw new Error('Game created but no game_code returned from backend');
      }

      // Store gameId in sessionStorage for player join flow
      sessionStorage.setItem(`game_${gameCode}`, newGame.id);

      // Navigate to waiting room with both quizId and gameId
      router.push(`/host-waiting-room?code=${gameCode}&quizId=${id}&gameId=${newGame.id}`);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'ゲームの作成中にエラーが発生しました';
      toast.error(errorMessage);
      console.error('Error creating game:', err);
    } finally {
      setIsCreatingGame(false);
    }
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

  const handleStartFromPreview = async (quizId: string) => {
    // Use the same game creation logic as handleStartQuiz
    await handleStartQuiz(quizId);
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
