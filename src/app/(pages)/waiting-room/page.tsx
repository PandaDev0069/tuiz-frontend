'use client';

import React, { Suspense, useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header, PageContainer, Container, Main } from '@/components/ui';
import { PlayerCountdownScreen } from '@/components/game';
import { useSocket } from '@/components/providers/SocketProvider';
import { gameApi } from '@/services/gameApi';
import { useDeviceId } from '@/hooks/useDeviceId';
import { toast } from 'react-hot-toast';

function WaitingRoomContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const playerName = searchParams.get('name') || '';
  const roomCode = searchParams.get('code') || '';
  const gameIdParam = searchParams.get('gameId') || '';
  const { socket, isConnected, joinRoom, leaveRoom } = useSocket();
  const { deviceId, isLoading: isDeviceIdLoading } = useDeviceId();

  // State management
  const [gameId, setGameId] = useState<string | null>(gameIdParam || null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [isRoomLocked, setIsRoomLocked] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const isNavigatingRef = useRef(false);
  const hasJoinedRoomRef = useRef(false);

  // Mobile detection
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Get gameId from room code and join game
  const getGameIdFromCode = useCallback(async (code: string): Promise<string | null> => {
    // Priority 1: Check sessionStorage (set when host creates game)
    const storedGameId = sessionStorage.getItem(`game_${code}`);
    if (storedGameId) {
      return storedGameId;
    }

    // Priority 2: Fetch game by code from API
    try {
      const { data: game, error: gameError } = await gameApi.getGameByCode(code);
      if (gameError || !game) {
        console.warn('Failed to fetch game by code:', gameError);
        return null;
      }
      // Store in sessionStorage for future use
      sessionStorage.setItem(`game_${code}`, game.id);
      return game.id;
    } catch (err) {
      console.error('Error fetching game by code:', err);
      return null;
    }
  }, []);

  // Handle reconnection: Check if player already exists for this device+game
  const checkExistingPlayer = useCallback(
    async (targetGameId?: string) => {
      const gameIdToCheck = targetGameId || gameId;
      if (!gameIdToCheck || !deviceId) return null;

      try {
        // Get all players for this game
        const { data: playersResponse } = await gameApi.getPlayers(gameIdToCheck);
        if (!playersResponse) return null;

        const playersArray = playersResponse.players || [];
        // Find player with matching device_id
        const existingPlayer = playersArray.find((p) => p.device_id === deviceId);
        return existingPlayer || null;
      } catch (err) {
        console.warn('Failed to check existing player:', err);
        return null;
      }
    },
    [gameId, deviceId],
  );

  // Fetch current game state to recover if websocket events were missed
  const syncGameState = useCallback(async () => {
    if (!gameId || isNavigatingRef.current) return;

    try {
      const { data, error } = await gameApi.getGameState(gameId);
      if (error || !data) return;

      const { game, gameFlow } = data;
      let nextPhase: string = 'waiting';

      if (game.status === 'finished') {
        nextPhase = 'ended';
      } else if (gameFlow.current_question_id) {
        if (gameFlow.current_question_end_time) {
          nextPhase = 'answer_reveal';
        } else if (gameFlow.current_question_start_time) {
          nextPhase = 'question';
        } else {
          nextPhase = 'countdown';
        }
      } else if (game.status === 'active') {
        nextPhase = 'countdown';
      }

      if (nextPhase !== 'waiting') {
        isNavigatingRef.current = true;
        router.replace(
          `/game-player?gameId=${gameId}&phase=${nextPhase}&playerId=${playerId || playerName}`,
        );
      }
    } catch (err) {
      console.warn('[WaitingRoom] Failed to sync game state', err);
    }
  }, [gameId, router, playerId, playerName]);

  // Initialize player join flow
  useEffect(() => {
    // Wait for deviceId to be ready
    if (isDeviceIdLoading || !deviceId) return;

    // Check required params
    if (!roomCode || !playerName) {
      setJoinError('ルームコードとプレイヤー名が必要です');
      return;
    }

    // Skip if already initialized
    if (isInitialized) return;

    let isMounted = true;

    const initializeAndJoin = async () => {
      try {
        setIsJoining(true);
        setJoinError(null);

        // Step 1: Get gameId from room code
        let currentGameId: string | null = gameIdParam || null;
        if (!currentGameId) {
          currentGameId = await getGameIdFromCode(roomCode);
          if (!currentGameId) {
            if (!isMounted) return;
            setJoinError('ゲームが見つかりません。ルームコードを確認してください。');
            return;
          }
        }

        if (!isMounted || !currentGameId) return;
        setGameId(currentGameId);

        // Step 1.25: Check local cache for playerId to avoid duplicate creation
        const cachedPlayerId =
          (typeof window !== 'undefined' &&
            sessionStorage.getItem(`player_${currentGameId}_${deviceId || 'unknown'}`)) ||
          null;
        if (cachedPlayerId) {
          setPlayerId(cachedPlayerId);
          setIsInitialized(true);
          toast.success('再接続しました');
          return;
        }

        // Step 1.5: Check if player already exists (reconnection scenario)
        // This handles the case where player refreshes page or reconnects
        const existingPlayer = await checkExistingPlayer(currentGameId);
        if (existingPlayer) {
          // Player already exists, use existing player
          if (!isMounted) return;
          setPlayerId(existingPlayer.id);
          if (typeof window !== 'undefined') {
            sessionStorage.setItem(
              `player_${currentGameId}_${deviceId || 'unknown'}`,
              existingPlayer.id,
            );
          }
          setIsInitialized(true);
          toast.success('再接続しました');
          return;
        }

        // Step 2: Join the game (creates players table record)
        const { data: player, error: joinError } = await gameApi.joinGame(
          currentGameId,
          playerName,
          deviceId,
        );

        if (!isMounted) return;

        if (joinError || !player) {
          const errorMessage = joinError?.message || 'ゲームへの参加に失敗しました';
          setJoinError(errorMessage);
          toast.error(errorMessage);

          // Handle specific error cases
          if (joinError?.error === 'join_game_failed') {
            if (joinError.message?.includes('locked')) {
              setIsRoomLocked(true);
            }
          }
          return;
        }

        setPlayerId(player.id);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(`player_${currentGameId}_${deviceId || 'unknown'}`, player.id);
        }

        // Step 3: Initialize game_player_data (if not already created)
        // Note: Backend might create this automatically, but we'll try to create it
        // The API will return 409 if it already exists, which is fine
        try {
          await gameApi.initializePlayerData(currentGameId, player.id, deviceId);
        } catch (dataError) {
          // Ignore if already exists (409) or other non-critical errors
          console.warn('Game player data initialization:', dataError);
        }

        if (!isMounted) return;

        // Step 4: Fetch game data to check lock status
        const { data: game } = await gameApi.getGame(currentGameId);
        if (game && !isMounted) return;

        if (game) {
          setIsRoomLocked(game.locked);
        }

        setIsInitialized(true);
        toast.success('ゲームに参加しました！');
      } catch (err) {
        if (!isMounted) return;
        const errorMessage =
          err instanceof Error ? err.message : 'ゲームへの参加中にエラーが発生しました';
        setJoinError(errorMessage);
        toast.error(errorMessage);
        console.error('Failed to join game:', err);
      } finally {
        if (isMounted) {
          setIsJoining(false);
        }
      }
    };

    initializeAndJoin();

    return () => {
      isMounted = false;
    };
  }, [
    roomCode,
    playerName,
    deviceId,
    gameIdParam,
    isDeviceIdLoading,
    isInitialized,
    getGameIdFromCode,
    checkExistingPlayer,
  ]);

  // If already initialized, double-check the current game state to avoid missing phase changes
  useEffect(() => {
    if (isInitialized) {
      syncGameState();
    }
  }, [isInitialized, syncGameState]);

  // WebSocket room joining and event listeners
  useEffect(() => {
    if (!socket || !isConnected || !gameId || !isInitialized || !playerId) return;

    let reconnectAttempted = false;

    // Join the game room via WebSocket
    // Backend will create room_participants and websocket_connections records
    const joinRoomSafe = () => {
      if (hasJoinedRoomRef.current) {
        console.log('[WaitingRoom] Already joined room, skipping duplicate join');
        return;
      }
      console.log('[WaitingRoom] Joining room:', gameId);
      joinRoom(gameId);
      hasJoinedRoomRef.current = true;
    };

    joinRoomSafe();

    // Listen for game start event
    const handleGameStarted = (data: {
      roomId?: string;
      gameId?: string;
      roomCode?: string;
      startedAt?: number;
    }) => {
      const targetGameId = data.gameId || data.roomId;
      if (isNavigatingRef.current) return;
      if (targetGameId === gameId || data.roomCode === roomCode) {
        isNavigatingRef.current = true;
        // Persist countdown start timestamp for the player page to sync timers
        if (data.startedAt) {
          sessionStorage.setItem(`countdown_started_${gameId}`, data.startedAt.toString());
        }
        // Use replace for faster navigation (no history entry)
        router.replace(
          `/game-player?gameId=${gameId}&phase=countdown&playerId=${playerId || playerName}`,
        );
      }
    };

    // Listen for explicit phase changes (fallback if game:started missed)
    const handlePhaseChange = (data: { roomId: string; phase: string; startedAt?: number }) => {
      if (data.roomId === gameId) {
        // Always store countdown start timestamp so game-player can sync even if navigation is in-flight
        if (data.phase === 'countdown' && data.startedAt) {
          sessionStorage.setItem(`countdown_started_${gameId}`, data.startedAt.toString());
        }
        if (isNavigatingRef.current) return;

        isNavigatingRef.current = true;
        // Use replace for faster navigation (no history entry)
        router.replace(
          `/game-player?gameId=${gameId}&phase=${data.phase}&playerId=${playerId || playerName}`,
        );
      }
    };

    // Listen for room lock status changes
    const handleRoomLocked = (data: { gameId?: string; roomId?: string; locked: boolean }) => {
      const targetGameId = data.gameId || data.roomId;
      if (targetGameId === gameId) {
        setIsRoomLocked(data.locked);
      }
    };

    // Handle WebSocket reconnection
    const handleReconnect = async () => {
      if (reconnectAttempted) return;
      reconnectAttempted = true;

      console.log('[WaitingRoom] WebSocket reconnected, verifying player status...');

      // Check if player still exists
      const existingPlayer = await checkExistingPlayer();
      if (existingPlayer) {
        // Player exists, rejoin room (reset flag to allow rejoin)
        hasJoinedRoomRef.current = false;
        setPlayerId(existingPlayer.id);
        if (typeof window !== 'undefined' && gameId) {
          sessionStorage.setItem(`player_${gameId}_${deviceId || 'unknown'}`, existingPlayer.id);
        }
        if (gameId) {
          joinRoom(gameId);
        }
        // Re-sync current phase in case we missed events while disconnected
        syncGameState();
        toast.success('再接続しました');
      } else {
        // Player doesn't exist, need to rejoin game
        console.warn('[WaitingRoom] Player not found after reconnection, may need to rejoin');
        toast.error('接続が切断されました。ページを再読み込みしてください。');
      }
    };

    // Listen for player join/leave events (for future use - showing player count)
    const handlePlayerJoined = (data: { gameId?: string; roomId?: string; playerId: string }) => {
      // Could update player list here if needed
      console.log('Player joined:', data);
    };

    const handlePlayerLeft = (data: { gameId?: string; roomId?: string; playerId: string }) => {
      // Could update player list here if needed
      console.log('Player left:', data);
    };

    // Handle player kicked event - redirect to join page
    const handlePlayerKicked = (data: {
      player_id: string;
      player_name: string;
      game_id: string;
      kicked_by: string;
      timestamp: string;
    }) => {
      // Check if the kicked player is the current player
      if (data.player_id === playerId || data.game_id === gameId) {
        console.log('Player was kicked:', data);

        // Show notification
        toast.error('ホストによってBANされました', {
          icon: '🚫',
          duration: 5000,
        });

        // Clear stored game data
        if (roomCode) {
          sessionStorage.removeItem(`game_${roomCode}`);
        }
        if (typeof window !== 'undefined' && gameId) {
          sessionStorage.removeItem(`player_${gameId}_${deviceId || 'unknown'}`);
        }

        // Redirect to join page after a short delay
        setTimeout(() => {
          router.push('/join');
        }, 2000);
      }
    };

    // Register event listeners
    socket.on('game:started', handleGameStarted);
    socket.on('game:phase:change', handlePhaseChange);
    socket.on('game:room-locked', handleRoomLocked);
    socket.on('room:user-joined', handlePlayerJoined);
    socket.on('room:user-left', handlePlayerLeft);
    socket.on('game:player-kicked', handlePlayerKicked);
    socket.on('connect', handleReconnect); // Handle reconnection

    // Cleanup on unmount
    return () => {
      socket.off('game:started', handleGameStarted);
      socket.off('game:phase:change', handlePhaseChange);
      socket.off('game:room-locked', handleRoomLocked);
      socket.off('room:user-joined', handlePlayerJoined);
      socket.off('room:user-left', handlePlayerLeft);
      socket.off('game:player-kicked', handlePlayerKicked);
      socket.off('connect', handleReconnect);

      // Leave room on unmount unless we are navigating to the game
      if (gameId && hasJoinedRoomRef.current && !isNavigatingRef.current) {
        console.log('[WaitingRoom] Leaving room on unmount');
        leaveRoom(gameId);
        hasJoinedRoomRef.current = false;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // Keep deps minimal to avoid repeated join/leave churn during navigation
    socket?.id,
    isConnected,
    gameId,
    isInitialized,
    playerId,
    joinRoom,
    leaveRoom,
  ]);

  // Countdown state
  const [showCountdown] = useState(false);
  const [countdownTime] = useState(5);

  const handleCountdownComplete = () => {
    // Navigate to player question screen after countdown
    window.location.href = `/player-question-screen?code=${roomCode}&playerId=test&name=${encodeURIComponent(playerName)}`;
  };

  // Show countdown screen if countdown is active
  if (showCountdown) {
    return (
      <PlayerCountdownScreen
        countdownTime={countdownTime}
        onCountdownComplete={handleCountdownComplete}
        message="準備してください！"
        questionNumber={1}
        totalQuestions={10}
        isMobile={isMobile}
      />
    );
  }

  return (
    <PageContainer>
      <Header>
        <Container size="sm">
          <div className="flex flex-col items-center space-y-2 md:space-y-3">
            {/* Logo with enhanced styling */}
            <div className="relative">
              {/* Outer glow for logo */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full blur-lg opacity-40 scale-110"></div>

              {/* Logo container with 3D effect */}
              <div className="relative bg-gradient-to-br from-cyan-100 to-blue-100 p-3 rounded-full border-2 border-cyan-300 shadow-lg">
                <Image
                  src="/logo.png"
                  alt="TUIZ情報王 ロゴ - リアルタイムクイズプラットフォーム"
                  width={80}
                  height={80}
                  priority
                  className="rounded-full"
                />
              </div>

              {/* Decorative elements around logo */}
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full animate-pulse"></div>
              <div
                className="absolute -bottom-2 -left-2 w-3 h-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full animate-pulse"
                style={{ animationDelay: '0.5s' }}
              ></div>
            </div>

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
        <Container
          size="sm"
          className="flex flex-col items-center justify-center py-4 md:py-2 space-y-4 md:space-y-6"
        >
          {/* Large Waiting Room Title with Gradient */}
          <div className="text-center">
            <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 bg-clip-text text-transparent animate-pulse">
              待機中
            </h1>
          </div>
          {/* Player Info with Avatar and Name */}
          <div className="flex flex-col items-center space-y-4">
            {/* Avatar */}
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
            </div>

            {/* Player Name in Colorful Parallelogram */}
            <div className="relative inline-block">
              {/* Outer glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 transform -skew-x-12 rounded-lg blur-lg opacity-40 scale-110"></div>

              {/* Main parallelogram with 3D effect */}
              <div className="relative bg-gradient-to-br from-cyan-500 via-blue-500 to-cyan-600 transform -skew-x-12 px-8 py-4 rounded-lg hover:scale-105 transition-all duration-300">
                {/* Inner highlight */}
                <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent rounded-t-lg transform -skew-x-12"></div>

                <span className="relative text-2xl md:text-3xl font-black text-white transform skew-x-12 inline-block">
                  {playerName || 'プレイヤー'}
                </span>
              </div>

              {/* Decorative corner elements */}
              <div className="absolute -top-2 -left-2 w-4 h-4 bg-gradient-to-br from-cyan-300 to-cyan-500 rounded-full transform -skew-x-12"></div>
              <div className="absolute -bottom-2 -right-2 w-3 h-3 bg-gradient-to-br from-blue-300 to-blue-500 rounded-full transform -skew-x-12"></div>
              <div className="absolute top-1/2 -right-1 w-2 h-2 bg-gradient-to-br from-white to-cyan-200 rounded-full transform -skew-x-12"></div>
            </div>
          </div>
          {/* Loading/Error States */}
          {isJoining && (
            <div className="text-center max-w-md">
              <div className="relative inline-block">
                <div className="relative bg-gradient-to-r from-cyan-50 to-blue-50 px-6 py-4 rounded-2xl border border-cyan-200">
                  <div className="flex items-center justify-center space-x-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-600"></div>
                    <p className="text-lg font-medium bg-gradient-to-r from-cyan-700 to-blue-700 bg-clip-text text-transparent">
                      ゲームに参加中...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {joinError && (
            <div className="text-center max-w-md">
              <div className="relative inline-block">
                <div className="relative bg-red-50 px-6 py-4 rounded-2xl border border-red-200">
                  <p className="text-lg font-medium text-red-700">{joinError}</p>
                  {isRoomLocked && (
                    <p className="text-sm text-red-600 mt-2">このルームはロックされています</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Waiting Message */}
          {!isJoining && !joinError && isInitialized && (
            <div className="text-center max-w-md">
              <div className="relative inline-block">
                {/* Background glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-100 to-blue-100 rounded-2xl blur-sm opacity-50 scale-105"></div>

                {/* Message container */}
                <div className="relative bg-gradient-to-r from-cyan-50 to-blue-50 px-6 py-4 rounded-2xl border border-cyan-200">
                  <p className="text-lg md:text-xl font-medium bg-gradient-to-r from-cyan-700 to-blue-700 bg-clip-text text-transparent leading-relaxed">
                    {isRoomLocked
                      ? 'ルームはロックされています'
                      : 'ホストがクイズ開始するのを待っています'}
                    <br />
                    お待ちください
                  </p>

                  {/* Decorative dots */}
                  <div className="flex justify-center space-x-2 mt-3">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.1s' }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Room Code */}
          <div className="text-center">
            <p className="text-2xl md:text-3xl font-semibold text-gray-700 mb-4">ルームコード</p>
            <div className="relative inline-block">
              {/* Outer glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl blur-lg opacity-30 scale-110"></div>

              {/* Main container with 3D effect */}
              <div className="relative bg-gradient-to-br from-cyan-100 via-blue-50 to-cyan-100 px-8 py-6 rounded-xl border-2 border-cyan-300  transform hover:scale-105 hover:shadow-cyan-200/50 transition-all duration-300">
                {/* Inner highlight */}
                <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent rounded-t-xl"></div>

                <span className="relative text-3xl md:text-4xl font-mono font-black bg-gradient-to-r from-cyan-700 via-blue-600 to-cyan-700 bg-clip-text text-transparent tracking-wider">
                  {roomCode || '------'}
                </span>
              </div>

              {/* Decorative corner elements */}
              <div className="absolute -top-3 -left-3 w-6 h-6 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full shadow-lg"></div>
              <div className="absolute -bottom-3 -right-3 w-5 h-5 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full shadow-lg"></div>
              <div className="absolute top-1/2 -right-2 w-3 h-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full shadow-md"></div>
            </div>
          </div>
        </Container>
      </Main>
    </PageContainer>
  );
}

export default function WaitingRoomPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WaitingRoomContent />
    </Suspense>
  );
}
