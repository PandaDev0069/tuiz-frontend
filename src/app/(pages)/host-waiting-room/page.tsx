// ====================================================
// File Name   : page.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-18
// Last Update : 2026-01-08
//
// Description:
// - Host waiting room page before game starts
// - Manages player list, room settings, and game initialization
// - Handles WebSocket events for real-time player updates
//
// Notes:
// - Polls player list every 3 seconds
// - Manages room lock/unlock functionality
// - Handles game start flow with confirmation modal
// ====================================================

'use client';

//----------------------------------------------------
// 1. React & Next.js Imports
//----------------------------------------------------
import React, { useState, Suspense, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

//----------------------------------------------------
// 2. External Library Imports
//----------------------------------------------------
import { Settings } from 'lucide-react';
import toast from 'react-hot-toast';

//----------------------------------------------------
// 3. Internal Component Imports
//----------------------------------------------------
import { Header, PageContainer, Container, Main } from '@/components/ui';
import { HostSettingsModal } from '@/components/ui/overlays/host-settings-modal';
import {
  PlayerList,
  HostControls,
  RightPanel,
  StartGameConfirmationModal,
} from '@/components/host-waiting-room';

//----------------------------------------------------
// 4. Service & Hook Imports
//----------------------------------------------------
import { gameApi, type PlayersResponse } from '@/services/gameApi';
import { useSocket } from '@/components/providers/SocketProvider';
import { quizService } from '@/lib/quizService';

//----------------------------------------------------
// 5. Type Imports
//----------------------------------------------------
import { QuizPlaySettings } from '@/types/quiz';

//----------------------------------------------------
// 6. Main Component
//----------------------------------------------------
/**
 * Component: HostWaitingRoomContent
 * Description:
 * - Host waiting room component
 * - Manages player list, room settings, and game initialization
 */
function HostWaitingRoomContent() {
  //----------------------------------------------------
  // 6.1. URL Parameters & Setup
  //----------------------------------------------------
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomCode = searchParams.get('code') || '';
  const quizId = searchParams.get('quizId') || '';
  const gameIdParam = searchParams.get('gameId') || '';
  const { socket, joinRoom: socketJoinRoom, leaveRoom: socketLeaveRoom } = useSocket();

  //----------------------------------------------------
  // 6.2. State Management
  //----------------------------------------------------
  const [gameId, setGameId] = useState<string | null>(gameIdParam || null);
  const [gameCode, setGameCode] = useState<string | null>(roomCode || null);
  const [gameIdError, setGameIdError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [playSettings, setPlaySettings] = useState<Partial<QuizPlaySettings>>({
    show_question_only: true,
    show_explanation: true,
    time_bonus: true,
    streak_bonus: true,
    show_correct_answer: false,
    max_players: 400,
  });
  const [isRoomLocked, setIsRoomLocked] = useState(false);
  const [isStartConfirmOpen, setIsStartConfirmOpen] = useState(false);
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

  //----------------------------------------------------
  // 6.3. Refs
  //----------------------------------------------------
  const isNavigatingRef = useRef(false);
  const fetchPlayersRef = useRef<(() => Promise<void>) | undefined>(undefined);
  const hasJoinedRoomRef = useRef(false);
  const currentRoomGameIdRef = useRef<string | null>(null);
  const socketConnectedRef = useRef(false);
  const socketIdRef = useRef<string | null>(null);

  //----------------------------------------------------
  // 6.4. Helper Functions
  //----------------------------------------------------
  /**
   * Function: fetchPlayers
   * Description:
   * - Fetches players from backend and maps to frontend format
   */
  const fetchPlayers = useCallback(async () => {
    if (!gameId) return;

    try {
      setIsLoadingPlayers(true);
      const { data: playersResponse, error } = await gameApi.getPlayers(gameId);

      if (error || !playersResponse) {
        return;
      }

      const playersResponseTyped = playersResponse as PlayersResponse;
      const playersArray = playersResponseTyped.players || [];

      const deviceIdMap = new Map<string, (typeof playersArray)[0]>();

      playersArray
        .filter((player) => !player.is_host)
        .forEach((player) => {
          if (player.device_id) {
            const existing = deviceIdMap.get(player.device_id);
            if (!existing || new Date(player.created_at) < new Date(existing.created_at)) {
              deviceIdMap.set(player.device_id, player);
            }
          } else {
            deviceIdMap.set(player.id, player);
          }
        });

      const mappedPlayers = Array.from(deviceIdMap.values()).map((player) => ({
        id: player.id,
        name: player.player_name,
        joinedAt: new Date(player.created_at),
        isBanned: false,
        isHost: player.is_host,
      }));

      setPlayers(mappedPlayers);
    } catch {
    } finally {
      setIsLoadingPlayers(false);
    }
  }, [gameId]);

  //----------------------------------------------------
  // 6.5. Effects
  //----------------------------------------------------
  useEffect(() => {
    fetchPlayersRef.current = fetchPlayers;
  }, [fetchPlayers]);

  /**
   * Function: fetchAndSyncGameData
   * Description:
   * - Fetches game data and syncs lock status and game code
   */
  const fetchAndSyncGameData = useCallback(
    async (
      gameId: string,
      isMounted: boolean,
    ): Promise<{ success: boolean; gameCode?: string; error?: string }> => {
      const { data: game, error: gameError } = await gameApi.getGame(gameId);
      if (!isMounted) {
        return { success: false };
      }

      if (gameError || !game) {
        return { success: false, error: 'ゲームデータの取得に失敗しました' };
      }

      setIsRoomLocked(game.locked);
      if (game.game_code || game.room_code) {
        const actualGameCode = game.game_code || game.room_code || '';
        setGameCode(actualGameCode);
        sessionStorage.setItem(`game_${actualGameCode}`, gameId);
        return { success: true, gameCode: actualGameCode };
      }

      return { success: true };
    },
    [setIsRoomLocked, setGameCode],
  );

  /**
   * Function: fetchAndSyncQuizSettings
   * Description:
   * - Fetches quiz settings and syncs play settings
   */
  const fetchAndSyncQuizSettings = useCallback(
    async (quizId: string, isMounted: boolean): Promise<void> => {
      try {
        const quizSet = await quizService.getQuiz(quizId);
        if (!isMounted) return;

        if (quizSet?.play_settings) {
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
      }
    },
    [setPlaySettings],
  );

  useEffect(() => {
    if (!gameId || !quizId) return;

    let isMounted = true;

    const initializeGameData = async () => {
      setIsInitializing(true);
      try {
        const gameDataResult = await fetchAndSyncGameData(gameId, isMounted);
        if (!gameDataResult.success) {
          if (gameDataResult.error) {
            setGameIdError(gameDataResult.error);
          }
          return;
        }

        await fetchAndSyncQuizSettings(quizId, isMounted);
        await fetchPlayers();
      } catch {
        if (!isMounted) return;
        setGameIdError('ゲームの初期化に失敗しました');
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };

    initializeGameData();

    const pollInterval = setInterval(() => {
      if (gameId && isMounted) {
        fetchPlayers();
      }
    }, 3000);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [gameId, quizId, fetchAndSyncGameData, fetchAndSyncQuizSettings, fetchPlayers]);

  //----------------------------------------------------
  // 6.6. WebSocket Setup
  //----------------------------------------------------
  useEffect(() => {
    if (!socket || !gameId || !socket.connected || isNavigatingRef.current) {
      return;
    }

    const currentSocketId = socket.id || null;
    const isSocketConnected = socket.connected;
    const previousGameId = currentRoomGameIdRef.current;
    const wasInDifferentRoom =
      hasJoinedRoomRef.current && previousGameId && previousGameId !== gameId;

    if (socketIdRef.current !== currentSocketId || !isSocketConnected) {
      if (socketIdRef.current && socketIdRef.current !== currentSocketId) {
        if (hasJoinedRoomRef.current && previousGameId) {
          socketLeaveRoom(previousGameId);
        }
        hasJoinedRoomRef.current = false;
        currentRoomGameIdRef.current = null;
      }
      socketIdRef.current = currentSocketId;
      socketConnectedRef.current = isSocketConnected;
    }

    if (wasInDifferentRoom) {
      socketLeaveRoom(previousGameId);
      hasJoinedRoomRef.current = false;
    }

    if (hasJoinedRoomRef.current && currentRoomGameIdRef.current === gameId) {
      return;
    }

    hasJoinedRoomRef.current = true;
    currentRoomGameIdRef.current = gameId;
    socketJoinRoom(gameId);

    const handlePlayerJoined = () => {
      if (isNavigatingRef.current) return;
      fetchPlayersRef.current?.();
    };

    const handlePlayerLeft = () => {
      if (isNavigatingRef.current) return;
      fetchPlayersRef.current?.();
    };

    socket.on('room:user-joined', handlePlayerJoined);
    socket.on('room:user-left', handlePlayerLeft);
    socket.on('game:player-joined', handlePlayerJoined);
    socket.on('game:player-left', handlePlayerLeft);

    const handleRoomLocked = (data: { locked: boolean }) => {
      if (isNavigatingRef.current) return;
      setIsRoomLocked(data.locked);
    };
    socket.on('game:room-locked', handleRoomLocked);

    const handlePlayerKicked = (data: { player_id: string; player_name: string }) => {
      if (isNavigatingRef.current) return;
      fetchPlayersRef.current?.();
      toast.success(`${data.player_name}がBANされました`, {
        icon: '🚫',
      });
    };
    socket.on('game:player-kicked', handlePlayerKicked);

    return () => {
      socket.off('room:user-joined', handlePlayerJoined);
      socket.off('room:user-left', handlePlayerLeft);
      socket.off('game:player-joined', handlePlayerJoined);
      socket.off('game:player-left', handlePlayerLeft);
      socket.off('game:room-locked', handleRoomLocked);
      socket.off('game:player-kicked', handlePlayerKicked);
    };
  }, [socket, socket?.id, socket?.connected, gameId, socketJoinRoom, socketLeaveRoom]);

  //----------------------------------------------------
  // 6.7. Event Handlers
  //----------------------------------------------------
  /**
   * Function: handlePlayerBan
   * Description:
   * - Bans a player from the game
   */
  const handlePlayerBan = async (playerId: string) => {
    if (!gameId) return;

    const playerToBan = players.find((p) => p.id === playerId);
    const playerName = playerToBan?.name || 'プレイヤー';

    try {
      const { error } = await gameApi.kickPlayer(gameId, playerId);
      if (error) {
        const errorMessage = error.message || 'プレイヤーのBANに失敗しました';
        toast.error(errorMessage, {
          icon: '❌',
        });
        return;
      }

      toast.success(`${playerName}をBANしました`, {
        icon: '🚫',
      });

      await fetchPlayers();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'プレイヤーのBAN中にエラーが発生しました';
      toast.error(errorMessage, {
        icon: '❌',
      });
    }
  };

  const handleStartQuiz = useCallback(() => {
    setIsStartConfirmOpen(true);
  }, []);

  //----------------------------------------------------
  // 6.8. Game ID Initialization
  //----------------------------------------------------
  useEffect(() => {
    if (gameId) return;

    if (gameIdParam) {
      setGameId(gameIdParam);
      if (roomCode) {
        sessionStorage.setItem(`game_${roomCode}`, gameIdParam);
      }
      setGameIdError(null);
      return;
    }

    if (roomCode) {
      const storedGameId = sessionStorage.getItem(`game_${roomCode}`);
      if (storedGameId) {
        setGameId(storedGameId);
        setGameCode(roomCode);
        setGameIdError(null);
        router.replace(
          `/host-waiting-room?code=${roomCode}&quizId=${quizId}&gameId=${storedGameId}`,
        );
        return;
      }
    }

    if (quizId && !gameIdParam) {
      setGameIdError('ゲームが見つかりません。ダッシュボードからゲームを開始してください。');
    }
  }, [roomCode, gameIdParam, quizId, router, gameId]);

  /**
   * Function: handleConfirmStartQuiz
   * Description:
   * - Confirms and starts the game
   */
  const handleConfirmStartQuiz = async () => {
    if (!gameId) {
      setGameIdError('ゲームIDが必要です。ゲームを作成してから開始してください。');
      setIsStartConfirmOpen(false);
      return;
    }

    try {
      isNavigatingRef.current = true;

      setGameIdError(null);
      const { data: game, error } = await gameApi.startGame(gameId);
      if (error || !game) {
        const errorMessage = error?.message || 'ゲームの開始に失敗しました';
        setGameIdError(errorMessage);
        toast.error(errorMessage);
        setIsStartConfirmOpen(false);
        isNavigatingRef.current = false;
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 500));

      const actualGameCode = gameCode || roomCode;
      if (socket && socket.connected) {
        socket.emit('game:started', { roomId: gameId, roomCode: actualGameCode });
        socket.emit('game:phase:change', { roomId: gameId, phase: 'countdown' });
      } else {
        console.warn('[HostWaitingRoom] Socket not connected, cannot emit events');
      }

      await new Promise((resolve) => setTimeout(resolve, 100));

      router.push(`/game-host?gameId=${gameId}&phase=countdown`);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'ゲームの開始中にエラーが発生しました';
      setGameIdError(errorMessage);
      toast.error(errorMessage);
      setIsStartConfirmOpen(false);
      isNavigatingRef.current = false;
    }
  };

  const handleOpenScreen = useCallback(() => {
    const actualGameCode = gameCode || roomCode;
    const hostScreenUrl = `/host-screen?code=${actualGameCode}&quizId=${quizId}${
      gameId ? `&gameId=${gameId}` : ''
    }`;
    window.open(hostScreenUrl, 'host-screen', 'width=1200,height=800,scrollbars=yes,resizable=yes');

    if (gameId) {
      sessionStorage.setItem(`public_screen_open_${gameId}`, 'true');
    }
  }, [gameCode, roomCode, quizId, gameId]);

  const handleAddPlayer = useCallback(() => {}, []);

  /**
   * Function: handleRoomLockToggle
   * Description:
   * - Toggles room lock status
   */
  const handleRoomLockToggle = async (isLocked: boolean) => {
    if (!gameId) {
      toast.error('ゲームIDが見つかりません');
      return;
    }

    try {
      const { data: game, error } = await gameApi.lockGame(gameId, isLocked);

      if (error || !game) {
        const errorMessage =
          error?.message || `ルームの${isLocked ? 'ロック' : 'アンロック'}に失敗しました`;
        setGameIdError(errorMessage);
        toast.error(errorMessage);
        setIsRoomLocked(!isLocked);
        return;
      }

      setIsRoomLocked(game.locked);

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
      toast.error(errorMessage);
      setIsRoomLocked(!isLocked);
    }
  };

  //----------------------------------------------------
  // 6.9. Main Render
  //----------------------------------------------------
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

//----------------------------------------------------
// 7. Page Wrapper Component
//----------------------------------------------------
export default function HostWaitingRoomPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HostWaitingRoomContent />
    </Suspense>
  );
}
