'use client';

import React, { useState, Suspense, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header, PageContainer, Container, Main } from '@/components/ui';
import { HostSettingsModal } from '@/components/ui/overlays/host-settings-modal';
import {
  PlayerList,
  HostControls,
  RightPanel,
  StartGameConfirmationModal,
} from '@/components/host-waiting-room';
import { Settings } from 'lucide-react';
import { QuizPlaySettings } from '@/types/quiz';
import { gameApi, type PlayersResponse } from '@/services/gameApi';
import { useSocket } from '@/components/providers/SocketProvider';
import { quizService } from '@/lib/quizService';

function HostWaitingRoomContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomCode = searchParams.get('code') || '';
  const quizId = searchParams.get('quizId') || '';
  const gameIdParam = searchParams.get('gameId') || '';
  const { socket } = useSocket();

  const [gameId, setGameId] = useState<string | null>(gameIdParam || null);
  const [gameCode, setGameCode] = useState<string | null>(roomCode || null);
  const [gameIdError, setGameIdError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  // Settings modal state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [playSettings, setPlaySettings] = useState<Partial<QuizPlaySettings>>({
    show_question_only: true,
    show_explanation: true,
    time_bonus: true,
    streak_bonus: true,
    show_correct_answer: false,
    max_players: 400,
  });

  // Room lock state
  const [isRoomLocked, setIsRoomLocked] = useState(false);

  // Start game confirmation modal state
  const [isStartConfirmOpen, setIsStartConfirmOpen] = useState(false);

  // Player data from backend
  const [players, setPlayers] = useState<
    Array<{
      id: string;
      name: string;
      joinedAt: Date;
      isBanned?: boolean;
      isHost?: boolean;
    }>
  >([]);
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(false);

  // Fetch players from backend
  const fetchPlayers = useCallback(async () => {
    if (!gameId) return;

    try {
      setIsLoadingPlayers(true);
      const { data: playersResponse, error } = await gameApi.getPlayers(gameId);

      if (error || !playersResponse) {
        console.error('Failed to fetch players:', error);
        return;
      }

      // Backend returns PlayersResponse with { players: Player[], total: number, ... }
      const playersResponseTyped = playersResponse as PlayersResponse;
      const playersArray = playersResponseTyped.players || [];

      // Map backend Player format to frontend format
      // Backend returns player_name, created_at (not display_name, joined_at)
      const mappedPlayers = playersArray.map((player) => ({
        id: player.id,
        name: player.player_name, // Backend uses player_name
        joinedAt: new Date(player.created_at), // Backend uses created_at
        isBanned: false, // is_kicked not implemented in backend
        isHost: player.is_host,
      }));

      setPlayers(mappedPlayers);
    } catch (err) {
      console.error('Error fetching players:', err);
    } finally {
      setIsLoadingPlayers(false);
    }
  }, [gameId]);

  // Fetch game data, quiz settings, and players when gameId is available
  useEffect(() => {
    if (!gameId || !quizId) return;

    let isMounted = true;

    const initializeGameData = async () => {
      setIsInitializing(true);
      try {
        // Fetch game data to get lock status and game code
        const { data: game, error: gameError } = await gameApi.getGame(gameId);
        if (!isMounted) return;

        if (gameError || !game) {
          console.error('Failed to fetch game data:', gameError);
          setGameIdError('ゲームデータの取得に失敗しました');
          return;
        }

        // Sync lock status and game code from backend
        setIsRoomLocked(game.locked);
        if (game.game_code || game.room_code) {
          const actualGameCode = game.game_code || game.room_code || '';
          setGameCode(actualGameCode);
          // Update sessionStorage
          sessionStorage.setItem(`game_${actualGameCode}`, gameId);
        }

        // Fetch quiz set to get play_settings
        try {
          const quizSet = await quizService.getQuiz(quizId);
          if (!isMounted) return;

          if (quizSet?.play_settings) {
            // Sync play_settings from quiz set
            setPlaySettings({
              show_question_only: quizSet.play_settings.show_question_only ?? true,
              show_explanation: quizSet.play_settings.show_explanation ?? true,
              time_bonus: quizSet.play_settings.time_bonus ?? true,
              streak_bonus: quizSet.play_settings.streak_bonus ?? true,
              show_correct_answer: quizSet.play_settings.show_correct_answer ?? false,
              max_players: quizSet.play_settings.max_players ?? 400,
            });
          }
        } catch (quizError) {
          console.warn('Failed to fetch quiz settings, using defaults:', quizError);
          // Continue with default settings if quiz fetch fails
        }

        // Fetch players
        await fetchPlayers();
      } catch (err) {
        if (!isMounted) return;
        console.error('Error initializing game data:', err);
        setGameIdError('ゲームの初期化に失敗しました');
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };

    initializeGameData();

    // Set up polling to refresh player list every 3 seconds
    const pollInterval = setInterval(() => {
      if (gameId && isMounted) {
        fetchPlayers();
      }
    }, 3000);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
    // Note: fetchPlayers is stable (useCallback with gameId dependency)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId, quizId]);

  // Listen for WebSocket events for real-time player updates
  useEffect(() => {
    if (!socket || !gameId || !socket.connected) {
      // Wait for socket connection
      return;
    }

    // Join the game room to receive events
    socket.emit('room:join', { roomId: gameId });

    // Listen for player join/leave events
    const handlePlayerJoined = (data?: { playerId?: string; playerName?: string }) => {
      console.log('Player joined:', data);
      // Refresh player list when a player joins
      fetchPlayers();
    };

    const handlePlayerLeft = (data?: { playerId?: string }) => {
      console.log('Player left:', data);
      // Refresh player list when a player leaves
      fetchPlayers();
    };

    // Listen for room user events (these fire when players join/leave the room)
    socket.on('room:user-joined', handlePlayerJoined);
    socket.on('room:user-left', handlePlayerLeft);

    // Also listen for game-specific player events if they exist
    socket.on('game:player-joined', handlePlayerJoined);
    socket.on('game:player-left', handlePlayerLeft);

    // Listen for room lock status changes
    const handleRoomLocked = (data: { locked: boolean }) => {
      setIsRoomLocked(data.locked);
    };
    socket.on('game:room-locked', handleRoomLocked);

    return () => {
      socket.off('room:user-joined', handlePlayerJoined);
      socket.off('room:user-left', handlePlayerLeft);
      socket.off('game:player-joined', handlePlayerJoined);
      socket.off('game:player-left', handlePlayerLeft);
      socket.off('game:room-locked', handleRoomLocked);
      socket.emit('room:leave', { roomId: gameId });
    };
  }, [socket, gameId, fetchPlayers]);

  // Player management functions
  const handlePlayerBan = async (playerId: string) => {
    if (!gameId) return;

    try {
      // Call backend API to kick player
      const { error } = await gameApi.kickPlayer(gameId, playerId);
      if (error) {
        console.error('Failed to ban player:', error);
        return;
      }

      // Refresh player list after banning
      await fetchPlayers();
    } catch (err) {
      console.error('Error banning player:', err);
    }
  };

  const handleStartQuiz = () => {
    setIsStartConfirmOpen(true);
  };

  // Initialize game from URL params or sessionStorage
  useEffect(() => {
    // Skip if we already have a gameId (to avoid re-running when gameId state updates)
    if (gameId) return;

    // Priority 1: gameId from URL params (preferred - game should be created before navigation)
    if (gameIdParam) {
      setGameId(gameIdParam);
      // Store in sessionStorage for player join flow
      if (roomCode) {
        sessionStorage.setItem(`game_${roomCode}`, gameIdParam);
      }
      setGameIdError(null);
      return;
    }

    // Priority 2: gameId from sessionStorage (fallback for direct navigation)
    if (roomCode) {
      const storedGameId = sessionStorage.getItem(`game_${roomCode}`);
      if (storedGameId) {
        setGameId(storedGameId);
        setGameCode(roomCode);
        setGameIdError(null);
        // Update URL to include gameId
        router.replace(
          `/host-waiting-room?code=${roomCode}&quizId=${quizId}&gameId=${storedGameId}`,
        );
        return;
      }
    }

    // If we have quizId but no gameId, show error (game should be created in dashboard)
    if (quizId && !gameIdParam) {
      setGameIdError('ゲームが見つかりません。ダッシュボードからゲームを開始してください。');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomCode, gameIdParam, quizId, router]);

  const handleConfirmStartQuiz = async () => {
    if (!gameId) {
      setGameIdError('ゲームIDが必要です。ゲームを作成してから開始してください。');
      setIsStartConfirmOpen(false);
      return;
    }

    try {
      setGameIdError(null);
      // Start the game via API
      const { data: game, error } = await gameApi.startGame(gameId);
      if (error || !game) {
        const errorMessage = error?.message || 'ゲームの開始に失敗しました';
        setGameIdError(errorMessage);
        console.error('Failed to start game:', error);
        setIsStartConfirmOpen(false);
        return;
      }

      // Emit WebSocket event to notify all players via the room
      const actualGameCode = gameCode || roomCode;
      if (socket && socket.connected) {
        socket.emit('game:started', { roomId: gameId, roomCode: actualGameCode });
      }

      // Redirect to game host page
      router.push(`/game-host?gameId=${gameId}&phase=countdown`);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'ゲームの開始中にエラーが発生しました';
      setGameIdError(errorMessage);
      console.error('Error starting game:', err);
      setIsStartConfirmOpen(false);
    }
  };

  const handleOpenScreen = () => {
    // Open host screen in new window
    const actualGameCode = gameCode || roomCode;
    const hostScreenUrl = `/host-screen?code=${actualGameCode}&quizId=${quizId}${
      gameId ? `&gameId=${gameId}` : ''
    }`;
    window.open(hostScreenUrl, 'host-screen', 'width=1200,height=800,scrollbars=yes,resizable=yes');
  };

  const handleAddPlayer = () => {
    // Remove this function - players join via the join endpoint, not manually
    // This was only for testing with mock data
    console.warn('handleAddPlayer is deprecated - players join via the join endpoint');
  };

  const handleRoomLockToggle = async (isLocked: boolean) => {
    if (!gameId) {
      console.error('Cannot lock room: gameId is missing');
      return;
    }

    try {
      // Update room lock status via backend API
      const { data: game, error } = await gameApi.lockGame(gameId, isLocked);

      if (error || !game) {
        const errorMessage =
          error?.message || `ルームの${isLocked ? 'ロック' : 'アンロック'}に失敗しました`;
        setGameIdError(errorMessage);
        console.error('Failed to lock/unlock room:', error);
        // Revert the state change on error
        setIsRoomLocked(!isLocked);
        return;
      }

      // Update local state on success
      setIsRoomLocked(game.locked);

      // Emit WebSocket event to notify players about room lock status
      if (socket) {
        socket.emit('game:room-locked', {
          roomId: gameId,
          locked: game.locked,
        });
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : `ルームの${isLocked ? 'ロック' : 'アンロック'}中にエラーが発生しました`;
      setGameIdError(errorMessage);
      console.error('Error locking/unlocking room:', err);
      // Revert the state change on error
      setIsRoomLocked(!isLocked);
    }
  };

  return (
    <PageContainer>
      {/* Settings Button - Fixed Top Right */}
      <button
        onClick={() => setIsSettingsOpen(true)}
        className="fixed top-4 right-4 z-40 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        title="ゲーム設定"
      >
        <Settings className="w-5 h-5" />
      </button>

      <Header>
        <Container size="sm">
          <div className="flex flex-col items-center space-y-2 md:space-y-3">
            {/* Enhanced title */}
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text text-transparent animate-pulse">
                TUIZ情報王
              </h1>
              <div className="mt-2 flex justify-center space-x-1">
                <div className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce"></div>
                <div
                  className="w-1 h-1 bg-blue-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                ></div>
                <div
                  className="w-1 h-1 bg-purple-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0.4s' }}
                ></div>
              </div>
            </div>
          </div>
        </Container>
      </Header>

      <Main className="flex-1">
        <Container size="lg" className="h-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full py-6">
            {/* Left Panel - Player List */}
            <div className="lg:col-span-1 h-full">
              <PlayerList
                players={players}
                onPlayerBan={handlePlayerBan}
                onAddPlayer={handleAddPlayer}
                className="h-full"
                isLoading={isLoadingPlayers}
              />
            </div>

            {/* Center Panel - Host Controls */}
            <div className="lg:col-span-1 h-full flex flex-col items-center justify-center space-y-6">
              {isInitializing && (
                <div className="w-full max-w-md bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg shadow-md">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <p className="text-sm">ゲームを初期化中...</p>
                  </div>
                </div>
              )}
              {gameIdError && (
                <div className="w-full max-w-md bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-md">
                  <p className="font-semibold">エラー</p>
                  <p className="text-sm">{gameIdError}</p>
                </div>
              )}
              {!isInitializing && (
                <HostControls
                  roomCode={gameCode || roomCode}
                  onStartQuiz={handleStartQuiz}
                  onOpenScreen={handleOpenScreen}
                  className="w-full max-w-md h-fit"
                />
              )}
            </div>

            {/* Right Panel - Room Management */}
            <div className="lg:col-span-1 h-full">
              <RightPanel
                className="h-full"
                isRoomLocked={isRoomLocked}
                onRoomLockToggle={handleRoomLockToggle}
                playerCount={players.length}
                maxPlayers={playSettings.max_players || 400}
              />
            </div>
          </div>
        </Container>
      </Main>

      {/* Settings Modal */}
      <HostSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        playSettings={playSettings}
        onPlaySettingsChange={setPlaySettings}
        roomCode={gameCode || roomCode}
      />

      {/* Start Game Confirmation Modal */}
      <StartGameConfirmationModal
        isOpen={isStartConfirmOpen}
        onClose={() => setIsStartConfirmOpen(false)}
        onConfirm={handleConfirmStartQuiz}
        playerCount={players.length}
        maxPlayers={playSettings.max_players || 400}
        roomCode={gameCode || roomCode}
        playSettings={playSettings}
      />
    </PageContainer>
  );
}

export default function HostWaitingRoomPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HostWaitingRoomContent />
    </Suspense>
  );
}
