// ====================================================
// File Name   : page.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-17
// Last Update : 2025-12-22
//
// Description:
// - Quiz library page for managing user's quizzes and browsing public quizzes
// - Two-tab interface: My Library and Public Browse
// - Handles quiz preview, cloning, starting games, and quiz management
//
// Notes:
// - Uses QueryClientProvider for React Query hooks
// - Preview modal requires hooks to be inside QueryClientProvider
// - Supports filtering, searching, and pagination for both tabs
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
import { toast, Toaster } from 'react-hot-toast';

//----------------------------------------------------
// 3. Internal Component Imports
//----------------------------------------------------
import { PageContainer } from '@/components/ui/core/page-container';
import { QuizLibraryHeader } from '@/components/ui/core/quiz-library-header';
import {
  LibraryTabs,
  TabsContent,
  MyLibraryContent,
  PublicBrowseContent,
  PreviewQuizModal,
} from '@/components/quiz-library';

//----------------------------------------------------
// 4. Service & Hook Imports
//----------------------------------------------------
import { useQuizPreview, useCloneQuiz } from '@/hooks/useQuizLibrary';
import { gameApi } from '@/services/gameApi';
import { quizService } from '@/lib/quizService';
import { useDeviceId } from '@/hooks/useDeviceId';
import { useAuthStore } from '@/state/useAuthStore';
import { queryClient } from '@/lib/queryClient';

//----------------------------------------------------
// 5. Type Imports
//----------------------------------------------------
// (Types defined inline)

//----------------------------------------------------
// 6. Constants / Configuration
//----------------------------------------------------
const TOAST_DURATION = {
  SUCCESS: 4000,
  CLONE_SUCCESS: 4000,
  EDIT_PROMPT: 3000,
} as const;

const DEFAULT_MAX_PLAYERS = 200;

const DEFAULT_PLAY_SETTINGS = {
  show_question_only: true,
  show_explanation: true,
  time_bonus: true,
  streak_bonus: true,
  show_correct_answer: false,
  max_players: DEFAULT_MAX_PLAYERS,
} as const;

const EDIT_PROMPT_DELAY_MS = 1000;

//----------------------------------------------------
// 7. Query Client Instance
//----------------------------------------------------
// (Using global queryClient from @/lib/queryClient)

//----------------------------------------------------
// 8. Types / Interfaces
//----------------------------------------------------
type TabValue = 'my-library' | 'public-browse';

interface PreviewQuizWrapperProps {
  isOpen: boolean;
  quizId: string | null;
  onClose: () => void;
  onStartQuiz: (quizId: string) => void;
}

interface MyLibraryFilters {
  category: string | undefined;
  status: 'all' | 'drafts' | 'published';
  sort: string;
}

interface PublicBrowseFilters {
  category: string | undefined;
  difficulty: string | undefined;
  sort: string;
}

interface PaginationState {
  page: number;
  limit: number;
}

interface PreviewModalState {
  isOpen: boolean;
  quizId: string | null;
}

//----------------------------------------------------
// 9. Helper Components
//----------------------------------------------------
/**
 * Component: PreviewQuizWrapper
 * Description:
 * - Wraps PreviewQuizModal with React Query hooks
 * - Must be inside QueryClientProvider to use hooks
 * - Handles quiz preview data fetching and cloning
 *
 * Props:
 * - isOpen (boolean): Whether modal is open
 * - quizId (string | null): Quiz ID to preview
 * - onClose (() => void): Close handler
 * - onStartQuiz ((quizId: string) => void): Start quiz handler
 */
const PreviewQuizWrapper: React.FC<PreviewQuizWrapperProps> = ({
  isOpen,
  quizId,
  onClose,
  onStartQuiz,
}) => {
  const {
    data: previewData,
    isLoading: previewLoading,
    error: previewError,
  } = useQuizPreview(quizId || '', isOpen);

  const { mutate: cloneQuiz, isPending: isCloning } = useCloneQuiz();

  const handleClone = useCallback(
    (id: string) => {
      cloneQuiz(id, {
        onSuccess: (data) => {
          toast.success(data.message);
          onClose();
        },
        onError: (error) => {
          toast.error(error.message || 'Failed to clone quiz');
        },
      });
    },
    [cloneQuiz, onClose],
  );

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

//----------------------------------------------------
// 10. Custom Hooks
//----------------------------------------------------
// (Custom hooks imported from @/hooks)

//----------------------------------------------------
// 11. Main Page Content Component
//----------------------------------------------------
/**
 * Component: LibraryPageContent
 * Description:
 * - Main content component for quiz library page
 * - Manages two tabs: My Library and Public Browse
 * - Handles quiz preview, cloning, starting games, and management
 *
 * Features:
 * - My Library: View and manage user's own quizzes
 * - Public Browse: Browse and clone public quizzes
 * - Quiz Preview: Preview quiz details before starting or cloning
 * - Game Creation: Start games from library or preview
 * - Filtering and Search: Filter and search quizzes in both tabs
 * - Pagination: Paginated results for both tabs
 *
 * Incomplete Features:
 * - handleDeleteQuiz: Currently only logs, actual deletion handled by child component
 * - handleCloneQuiz: Currently only logs, actual cloning handled by child component
 */
function LibraryPageContent() {
  //----------------------------------------------------
  // 11.1. Hooks & Router Setup
  //----------------------------------------------------
  const router = useRouter();
  const { deviceId } = useDeviceId();
  const { user } = useAuthStore();

  //----------------------------------------------------
  // 11.2. State Management
  //----------------------------------------------------
  const [activeTab, setActiveTab] = useState<TabValue>('my-library');

  const [myLibraryFilters, setMyLibraryFilters] = useState<MyLibraryFilters>({
    category: undefined,
    status: 'all',
    sort: 'updated_desc',
  });
  const [myLibraryPagination, setMyLibraryPagination] = useState<PaginationState>({
    page: 1,
    limit: 12,
  });
  const [myLibrarySearchQuery, setMyLibrarySearchQuery] = useState('');

  const [publicBrowseQuery, setPublicBrowseQuery] = useState('');
  const [publicBrowseFilters, setPublicBrowseFilters] = useState<PublicBrowseFilters>({
    category: undefined,
    difficulty: undefined,
    sort: 'plays_desc',
  });
  const [publicBrowsePagination, setPublicBrowsePagination] = useState<PaginationState>({
    page: 1,
    limit: 12,
  });

  const [previewModalState, setPreviewModalState] = useState<PreviewModalState>({
    isOpen: false,
    quizId: null,
  });

  const [isCreatingGame, setIsCreatingGame] = useState(false);

  //----------------------------------------------------
  // 11.3. Custom Hooks
  //----------------------------------------------------
  // (Custom hooks used in PreviewQuizWrapper)

  //----------------------------------------------------
  // 11.4. Effects
  //----------------------------------------------------
  // (No effects needed)

  //----------------------------------------------------
  // 11.5. Event Handlers
  //----------------------------------------------------
  const handleMyLibraryFiltersChange = useCallback((filters: Partial<MyLibraryFilters>) => {
    setMyLibraryFilters((prev) => ({ ...prev, ...filters }));
    setMyLibraryPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const handleMyLibrarySearchChange = useCallback((query: string) => {
    setMyLibrarySearchQuery(query);
    setMyLibraryPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const handleMyLibraryPageChange = useCallback((page: number) => {
    setMyLibraryPagination((prev) => ({ ...prev, page }));
  }, []);

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
    return user?.username || user?.email?.split('@')[0] || 'Host';
  }, [user]);

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
          toast.error(result.error || 'ゲームの作成に失敗しました');
          return;
        }

        navigateToWaitingRoom(result.game!.game_code, result.game!.id, id);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'ゲームの作成中にエラーが発生しました';
        toast.error(errorMessage);
      } finally {
        setIsCreatingGame(false);
      }
    },
    [
      isCreatingGame,
      deviceId,
      setIsCreatingGame,
      getHostPlayerName,
      buildGameSettings,
      createGameSession,
      navigateToWaitingRoom,
    ],
  );

  const handleDeleteQuiz = useCallback((id: string) => {
    // Actual deletion is handled by useDeleteQuiz hook in MyLibraryContent
    // This handler is for any additional parent-level logic after successful deletion
    void id; // Parameter required by interface but logic handled by child component
  }, []);

  const handlePublicBrowseSearchChange = useCallback((query: string) => {
    setPublicBrowseQuery(query);
    setPublicBrowsePagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const handlePublicBrowseFiltersChange = useCallback((filters: Partial<PublicBrowseFilters>) => {
    setPublicBrowseFilters((prev) => ({ ...prev, ...filters }));
    setPublicBrowsePagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const handlePublicBrowsePageChange = useCallback((page: number) => {
    setPublicBrowsePagination((prev) => ({ ...prev, page }));
  }, []);

  const handleCloneQuiz = useCallback(async (id: string) => {
    // Actual cloning is handled by useCloneQuiz hook in PublicBrowseContent
    // This handler is for additional parent-level logic after successful clone
    void id; // Parameter required by interface but logic handled by child component
  }, []);

  const handleCloneSuccess = useCallback(
    (clonedQuizId: string, originalQuizTitle: string) => {
      setActiveTab('my-library');

      toast.success(`「${originalQuizTitle}」をクローンしました！`, {
        duration: TOAST_DURATION.CLONE_SUCCESS,
        id: `clone-success-${clonedQuizId}`,
      });

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
          { duration: TOAST_DURATION.EDIT_PROMPT },
        );
      }, EDIT_PROMPT_DELAY_MS);

      setMyLibraryPagination((prev) => ({ ...prev, page: 1 }));
    },
    [router],
  );

  const handlePreviewQuiz = useCallback((id: string) => {
    setPreviewModalState({
      isOpen: true,
      quizId: id,
    });
  }, []);

  const handleClosePreview = useCallback(() => {
    setPreviewModalState({
      isOpen: false,
      quizId: null,
    });
  }, []);

  const handleStartFromPreview = useCallback(
    async (quizId: string) => {
      await handleStartQuiz(quizId);
    },
    [handleStartQuiz],
  );

  //----------------------------------------------------
  // 11.6. Loading State
  //----------------------------------------------------
  // (Loading states handled by child components)

  //----------------------------------------------------
  // 11.7. Error State
  //----------------------------------------------------
  // (Errors handled via toast notifications)

  //----------------------------------------------------
  // 11.8. Main Render
  //----------------------------------------------------
  return (
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
  );
}

//----------------------------------------------------
// 12. Main Page Component (with Providers)
//----------------------------------------------------
/**
 * Component: LibraryPage
 * Description:
 * - Wraps LibraryPageContent with necessary providers
 * - Provides QueryClient for React Query hooks
 * - Includes Toaster for toast notifications
 *
 * Returns:
 * - JSX: Page with all required providers
 */
export default function LibraryPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <LibraryPageContent />
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}
