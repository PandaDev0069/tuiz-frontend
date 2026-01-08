// ====================================================
// File Name   : page.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-18
// Last Update : 2026-01-08
//
// Description:
// - Waiting room page for players before game starts
// - Handles player join flow, reconnection, and WebSocket setup
// - Manages game state synchronization
//
// Notes:
// - Handles existing player reconnection scenarios
// - Syncs game state to avoid missing phase changes
// - WebSocket event listeners for game start and phase changes
// ====================================================

'use client';

//----------------------------------------------------
// 1. React & Next.js Imports
//----------------------------------------------------
import React, { Suspense, useState, useEffect, useCallback, useRef } from 'react';
import { flushSync } from 'react-dom';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';

//----------------------------------------------------
// 2. External Library Imports
//----------------------------------------------------
import { toast } from 'react-hot-toast';

//----------------------------------------------------
// 3. Internal Component Imports
//----------------------------------------------------
import { Header, PageContainer, Container, Main } from '@/components/ui';
import { PlayerCountdownScreen } from '@/components/game';

//----------------------------------------------------
// 4. Service & Hook Imports
//----------------------------------------------------
import { useSocket } from '@/components/providers/SocketProvider';
import { gameApi } from '@/services/gameApi';
import { useDeviceId } from '@/hooks/useDeviceId';

//----------------------------------------------------
// 5. Types / Interfaces
//----------------------------------------------------

//----------------------------------------------------
// 6. Helper Functions for Join Flow
//----------------------------------------------------
/**
 * Function: resetJoinState
 * Description:
 * - Resets join state and refs
 */
function resetJoinState(
  setIsJoining: React.Dispatch<React.SetStateAction<boolean>>,
  isJoiningRef: React.MutableRefObject<boolean>,
) {
  setIsJoining(false);
  isJoiningRef.current = false;
}

/**
 * Function: storePlayerIdInSession
 * Description:
 * - Stores player ID in sessionStorage
 */
function storePlayerIdInSession(gameId: string, deviceId: string | null, playerId: string) {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(`player_${gameId}_${deviceId || 'unknown'}`, playerId);
  }
}

/**
 * Function: clearCachedPlayerId
 * Description:
 * - Clears cached player ID from sessionStorage
 */
function clearCachedPlayerId(gameId: string, deviceId: string | null) {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(`player_${gameId}_${deviceId || 'unknown'}`);
  }
}

/**
 * Function: finalizePlayerJoin
 * Description:
 * - Finalizes player join by setting all state together
 */
function finalizePlayerJoin(
  setIsJoining: React.Dispatch<React.SetStateAction<boolean>>,
  setJoinError: React.Dispatch<React.SetStateAction<string | null>>,
  setPlayerId: React.Dispatch<React.SetStateAction<string | null>>,
  setIsInitialized: React.Dispatch<React.SetStateAction<boolean>>,
  isJoiningRef: React.MutableRefObject<boolean>,
  hasInitializedRef: React.MutableRefObject<boolean>,
  playerId: string,
) {
  isJoiningRef.current = false;
  flushSync(() => {
    setIsJoining(false);
    setJoinError(null);
    setPlayerId(playerId);
    setIsInitialized(true);
  });
  hasInitializedRef.current = true;
}

//----------------------------------------------------
// 7. Main Component
//----------------------------------------------------
/**
 * Component: WaitingRoomContent
 * Description:
 * - Waiting room component for players
 * - Handles player join flow and WebSocket setup
 */
function WaitingRoomContent() {
  //----------------------------------------------------
  // 7.1. URL Parameters & Setup
  //----------------------------------------------------
  const router = useRouter();
  const searchParams = useSearchParams();
  const playerName = searchParams.get('name') || '';
  const roomCode = searchParams.get('code') || '';
  const gameIdParam = searchParams.get('gameId') || '';
  const { socket, isConnected, isRegistered, joinRoom, leaveRoom } = useSocket();
  const { deviceId, isLoading: isDeviceIdLoading } = useDeviceId();

  //----------------------------------------------------
  // 7.2. State Management
  //----------------------------------------------------
  const [gameId, setGameId] = useState<string | null>(gameIdParam || null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [isRoomLocked, setIsRoomLocked] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isMobile, setIsMobile] = useState(true);

  //----------------------------------------------------
  // 7.3. Refs
  //----------------------------------------------------
  const isNavigatingRef = useRef(false);
  const hasJoinedRoomRef = useRef(false);
  const isJoiningRef = useRef(false);
  const hasInitializedRef = useRef(false);

  //----------------------------------------------------
  // 7.4. Computed Values
  //----------------------------------------------------
  const shouldShowWaitingMessage = !isJoining && !joinError && isInitialized && !!playerId;

  //----------------------------------------------------
  // 7.5. Effects
  //----------------------------------------------------
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, [setIsMobile]);

  //----------------------------------------------------
  // 7.6. Helper Functions
  //----------------------------------------------------
  /**
   * Function: getGameIdFromCode
   * Description:
   * - Gets game ID from room code
   * - Checks sessionStorage first, then API
   */
  const getGameIdFromCode = useCallback(async (code: string): Promise<string | null> => {
    const storedGameId = sessionStorage.getItem(`game_${code}`);
    if (storedGameId) {
      return storedGameId;
    }

    try {
      const { data: game, error: gameError } = await gameApi.getGameByCode(code);
      if (gameError || !game) {
        return null;
      }
      sessionStorage.setItem(`game_${code}`, game.id);
      return game.id;
    } catch {
      return null;
    }
  }, []);

  /**
   * Function: checkExistingPlayer
   * Description:
   * - Checks if player already exists for reconnection
   */
  const checkExistingPlayer = useCallback(
    async (targetGameId?: string) => {
      const gameIdToCheck = targetGameId || gameId;
      if (!gameIdToCheck || !deviceId) {
        return null;
      }

      try {
        const { data: playersResponse, error: playersError } =
          await gameApi.getPlayers(gameIdToCheck);
        if (playersError) {
          return null;
        }
        if (!playersResponse) {
          return null;
        }

        const playersArray = playersResponse.players || [];
        const existingPlayer = playersArray.find((p) => p.device_id === deviceId);
        return existingPlayer || null;
      } catch {
        return null;
      }
    },
    [gameId, deviceId],
  );

  /**
   * Function: syncGameState
   * Description:
   * - Syncs game state to recover if WebSocket events were missed
   */
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
    } catch {}
  }, [gameId, router, playerId, playerName]);

  /**
   * Function: resolveGameId
   * Description:
   * - Resolves game ID from param or room code
   */
  const resolveGameId = useCallback(
    async (gameIdParam: string, roomCode: string): Promise<string | null> => {
      if (gameIdParam) {
        return gameIdParam;
      }
      return await getGameIdFromCode(roomCode);
    },
    [getGameIdFromCode],
  );

  /**
   * Function: handleExistingPlayerReconnection
   * Description:
   * - Handles reconnection for existing player
   */
  const handleExistingPlayerReconnection = useCallback(
    (
      existingPlayer: { id: string },
      currentGameId: string,
      deviceId: string | null,
      isMounted: boolean,
    ): boolean => {
      if (!isMounted || hasInitializedRef.current) {
        return false;
      }

      storePlayerIdInSession(currentGameId, deviceId, existingPlayer.id);
      finalizePlayerJoin(
        setIsJoining,
        setJoinError,
        setPlayerId,
        setIsInitialized,
        isJoiningRef,
        hasInitializedRef,
        existingPlayer.id,
      );
      toast.success('再接続しました');
      return true;
    },
    [setIsJoining, setJoinError, setPlayerId, setIsInitialized],
  );

  /**
   * Function: validateJoinParameters
   * Description:
   * - Validates required parameters for joining
   */
  const validateJoinParameters = useCallback(
    (
      deviceId: string | null,
      playerName: string,
      isMounted: boolean,
    ): { valid: boolean; error?: string } => {
      if (!deviceId) {
        if (!isMounted) {
          return { valid: false };
        }
        return {
          valid: false,
          error: 'デバイスIDが見つかりません。ページを再読み込みしてください。',
        };
      }

      if (!playerName || playerName.trim() === '') {
        if (!isMounted) {
          return { valid: false };
        }
        return { valid: false, error: 'プレイヤー名が必要です' };
      }

      return { valid: true };
    },
    [],
  );

  /**
   * Function: performGameJoin
   * Description:
   * - Performs the actual game join API call
   */
  const performGameJoin = useCallback(
    async (
      currentGameId: string,
      playerName: string,
      deviceId: string,
    ): Promise<{ success: boolean; player?: { id: string }; error?: string }> => {
      const { data: player, error: joinError } = await gameApi.joinGame(
        currentGameId,
        playerName.trim(),
        deviceId,
      );

      if (joinError || !player) {
        const errorMessage = joinError?.message || 'ゲームへの参加に失敗しました';

        if (joinError?.error === 'join_game_failed' && joinError.message?.includes('locked')) {
          return { success: false, error: errorMessage, player: undefined };
        }

        return { success: false, error: errorMessage, player: undefined };
      }

      if (!player.id) {
        return { success: false, error: 'プレイヤー情報が不正です', player: undefined };
      }

      return { success: true, player };
    },
    [],
  );

  /**
   * Function: initializePlayerGameData
   * Description:
   * - Initializes player game data (handles 409 conflicts gracefully)
   */
  const initializePlayerGameData = useCallback(
    async (currentGameId: string, playerId: string, deviceId: string) => {
      try {
        const { error: dataError } = await gameApi.initializePlayerData(
          currentGameId,
          playerId,
          deviceId,
        );
        if (dataError) {
        }
      } catch {}
    },
    [],
  );

  /**
   * Function: fetchGameLockStatus
   * Description:
   * - Fetches game data to check lock status
   */
  const fetchGameLockStatus = useCallback(
    async (currentGameId: string) => {
      const { data: game } = await gameApi.getGame(currentGameId);
      if (game) {
        setIsRoomLocked(game.locked);
      }
    },
    [setIsRoomLocked],
  );

  /**
   * Function: handleGameIdResolution
   * Description:
   * - Resolves and validates game ID
   * - Returns game ID or null with error handling
   */
  const handleGameIdResolution = useCallback(
    async (
      gameIdParam: string,
      roomCode: string,
      isMounted: boolean,
    ): Promise<{ success: boolean; gameId?: string; error?: string }> => {
      const currentGameId = await resolveGameId(gameIdParam, roomCode);
      if (!currentGameId) {
        if (!isMounted) {
          return { success: false };
        }
        return {
          success: false,
          error: 'ゲームが見つかりません。ルームコードを確認してください。',
        };
      }

      if (!isMounted) {
        return { success: false };
      }

      setGameId(currentGameId);
      return { success: true, gameId: currentGameId };
    },
    [resolveGameId, setGameId],
  );

  /**
   * Function: handleExistingPlayerFlow
   * Description:
   * - Handles the entire existing player reconnection flow
   */
  const handleExistingPlayerFlow = useCallback(
    async (
      currentGameId: string,
      deviceId: string | null,
      isMounted: boolean,
    ): Promise<{ handled: boolean }> => {
      const existingPlayer = await checkExistingPlayer(currentGameId);
      if (!existingPlayer) {
        const cachedPlayerId =
          (typeof window !== 'undefined' &&
            sessionStorage.getItem(`player_${currentGameId}_${deviceId || 'unknown'}`)) ||
          null;
        if (cachedPlayerId) {
          clearCachedPlayerId(currentGameId, deviceId);
        }
        return { handled: false };
      }

      if (handleExistingPlayerReconnection(existingPlayer, currentGameId, deviceId, isMounted)) {
        return { handled: true };
      }

      if (!isMounted) {
        return { handled: false };
      }

      return { handled: false };
    },
    [checkExistingPlayer, handleExistingPlayerReconnection],
  );

  /**
   * Function: handleJoinError
   * Description:
   * - Handles join errors consistently
   */
  const handleJoinError = useCallback(
    (error: string, isMounted: boolean, isLocked?: boolean): { shouldReturn: boolean } => {
      if (!isMounted) {
        return { shouldReturn: true };
      }

      setJoinError(error);
      resetJoinState(setIsJoining, isJoiningRef);
      toast.error(error);

      if (isLocked) {
        setIsRoomLocked(true);
      }

      return { shouldReturn: true };
    },
    [setIsJoining, setJoinError, setIsRoomLocked],
  );

  /**
   * Function: handleNewPlayerJoinFlow
   * Description:
   * - Handles the entire new player join flow
   */
  const handleNewPlayerJoinFlow = useCallback(
    async (
      currentGameId: string,
      playerName: string,
      deviceId: string,
      isMounted: boolean,
    ): Promise<{ success: boolean; error?: string }> => {
      const validation = validateJoinParameters(deviceId, playerName, isMounted);
      if (!validation.valid) {
        if (!isMounted) {
          return { success: false };
        }
        if (validation.error) {
          setJoinError(validation.error);
        }
        resetJoinState(setIsJoining, isJoiningRef);
        return { success: false, error: validation.error };
      }

      const joinResult = await performGameJoin(currentGameId, playerName, deviceId);
      if (!joinResult.success) {
        const isLocked = joinResult.error?.includes('locked');
        handleJoinError(joinResult.error || 'ゲームへの参加に失敗しました', isMounted, isLocked);
        return { success: false, error: joinResult.error };
      }

      if (!joinResult.player?.id) {
        if (!isMounted) {
          return { success: false };
        }
        setJoinError('プレイヤー情報が不正です');
        resetJoinState(setIsJoining, isJoiningRef);
        return { success: false, error: 'プレイヤー情報が不正です' };
      }

      storePlayerIdInSession(currentGameId, deviceId, joinResult.player.id);

      await initializePlayerGameData(currentGameId, joinResult.player.id, deviceId);
      await fetchGameLockStatus(currentGameId);

      finalizePlayerJoin(
        setIsJoining,
        setJoinError,
        setPlayerId,
        setIsInitialized,
        isJoiningRef,
        hasInitializedRef,
        joinResult.player.id,
      );
      toast.success('ゲームに参加しました！');

      return { success: true };
    },
    [
      validateJoinParameters,
      performGameJoin,
      handleJoinError,
      initializePlayerGameData,
      fetchGameLockStatus,
      setIsJoining,
      setJoinError,
      setPlayerId,
      setIsInitialized,
    ],
  );

  //----------------------------------------------------
  // 7.7. Initialize Player Join Flow
  //----------------------------------------------------
  useEffect(() => {
    if (isDeviceIdLoading || !deviceId) return;

    if (!roomCode || !playerName) {
      setJoinError('ルームコードとプレイヤー名が必要です');
      return;
    }

    if (hasInitializedRef.current || isJoiningRef.current) {
      return;
    }

    let isMounted = true;

    const initializeAndJoin = async () => {
      if (isJoiningRef.current) {
        return;
      }
      isJoiningRef.current = true;

      try {
        setIsJoining(true);
        setJoinError(null);

        const gameIdResult = await handleGameIdResolution(gameIdParam, roomCode, isMounted);
        if (!gameIdResult.success) {
          if (gameIdResult.error) {
            setJoinError(gameIdResult.error);
          }
          resetJoinState(setIsJoining, isJoiningRef);
          return;
        }

        const currentGameId = gameIdResult.gameId!;

        const existingPlayerResult = await handleExistingPlayerFlow(
          currentGameId,
          deviceId,
          isMounted,
        );
        if (existingPlayerResult.handled) {
          return;
        }

        const newPlayerResult = await handleNewPlayerJoinFlow(
          currentGameId,
          playerName,
          deviceId!,
          isMounted,
        );
        if (!newPlayerResult.success) {
          return;
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'ゲームへの参加中にエラーが発生しました';
        handleJoinError(errorMessage, isMounted);
      } finally {
        if (isMounted) {
          resetJoinState(setIsJoining, isJoiningRef);
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
    handleGameIdResolution,
    handleExistingPlayerFlow,
    handleNewPlayerJoinFlow,
    handleJoinError,
  ]);

  //----------------------------------------------------
  // 7.8. Game State Sync
  //----------------------------------------------------
  useEffect(() => {
    if (isInitialized) {
      syncGameState();
    }
  }, [isInitialized, syncGameState]);

  //----------------------------------------------------
  // 7.9. WebSocket Setup
  //----------------------------------------------------
  useEffect(() => {
    if (!socket || !isConnected || !isRegistered || !gameId || !isInitialized || !playerId) {
      return;
    }

    let reconnectAttempted = false;

    const joinRoomSafe = () => {
      if (hasJoinedRoomRef.current) {
        return;
      }
      joinRoom(gameId);
      hasJoinedRoomRef.current = true;
    };

    joinRoomSafe();

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
        if (data.startedAt) {
          sessionStorage.setItem(`countdown_started_${gameId}`, data.startedAt.toString());
        }
        router.replace(
          `/game-player?gameId=${gameId}&phase=countdown&playerId=${playerId || playerName}`,
        );
      }
    };

    const handlePhaseChange = (data: { roomId: string; phase: string; startedAt?: number }) => {
      if (data.roomId === gameId) {
        if (data.phase === 'countdown' && data.startedAt) {
          sessionStorage.setItem(`countdown_started_${gameId}`, data.startedAt.toString());
        }
        if (isNavigatingRef.current) return;

        isNavigatingRef.current = true;
        router.replace(
          `/game-player?gameId=${gameId}&phase=${data.phase}&playerId=${playerId || playerName}`,
        );
      }
    };

    const handleRoomLocked = (data: { gameId?: string; roomId?: string; locked: boolean }) => {
      const targetGameId = data.gameId || data.roomId;
      if (targetGameId === gameId) {
        setIsRoomLocked(data.locked);
      }
    };

    const handleReconnect = async () => {
      if (reconnectAttempted) return;
      reconnectAttempted = true;

      await new Promise((resolve) => setTimeout(resolve, 500));

      const existingPlayer = await checkExistingPlayer();
      if (existingPlayer) {
        hasJoinedRoomRef.current = false;
        setPlayerId(existingPlayer.id);
        if (typeof window !== 'undefined' && gameId) {
          sessionStorage.setItem(`player_${gameId}_${deviceId || 'unknown'}`, existingPlayer.id);
        }
        if (gameId && isRegistered) {
          joinRoom(gameId);
        }
        syncGameState();
        toast.success('再接続しました');
      } else {
        toast.error('接続が切断されました。ページを再読み込みしてください。');
      }
    };

    const handlePlayerJoined = () => {};

    const handlePlayerLeft = () => {};

    const handlePlayerKicked = (data: {
      player_id: string;
      player_name: string;
      game_id: string;
      kicked_by: string;
      timestamp: string;
    }) => {
      if (data.player_id === playerId || data.game_id === gameId) {
        toast.error('ホストによってBANされました', {
          icon: '🚫',
          duration: 5000,
        });

        if (roomCode) {
          sessionStorage.removeItem(`game_${roomCode}`);
        }
        if (typeof window !== 'undefined' && gameId) {
          sessionStorage.removeItem(`player_${gameId}_${deviceId || 'unknown'}`);
        }

        setTimeout(() => {
          router.push('/join');
        }, 2000);
      }
    };

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
        leaveRoom(gameId);
        hasJoinedRoomRef.current = false;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // Keep deps minimal to avoid repeated join/leave churn during navigation
    socket?.id,
    isConnected,
    isRegistered, // Important: wait for registration, not just connection
    gameId,
    isInitialized,
    playerId,
    joinRoom,
    leaveRoom,
  ]);

  //----------------------------------------------------
  // 7.10. Countdown State (Legacy - not currently used)
  //----------------------------------------------------
  const [showCountdown] = useState(false);
  const [countdownTime] = useState(5);

  const handleCountdownComplete = useCallback(() => {
    window.location.href = `/player-question-screen?code=${roomCode}&playerId=test&name=${encodeURIComponent(playerName)}`;
  }, [roomCode, playerName]);

  //----------------------------------------------------
  // 7.11. Loading State
  //----------------------------------------------------
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
          {shouldShowWaitingMessage && (
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

//----------------------------------------------------
// 8. Page Wrapper Component
//----------------------------------------------------
export default function WaitingRoomPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WaitingRoomContent />
    </Suspense>
  );
}
