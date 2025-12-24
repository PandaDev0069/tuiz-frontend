/**
 * useGameFlow Hook
 * Manages question progression, timing, and game state transitions
 * Handles real-time synchronization of question flow across all players
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from '@/components/providers/SocketProvider';
import { gameApi, type GameFlow } from '@/services/gameApi';

const DEFAULT_QUESTION_DURATION_MS = 30000;

// ============================================================================
// TYPES
// ============================================================================

export interface QuestionTimerState {
  questionId: string;
  questionIndex: number;
  startTime: Date;
  endTime: Date | null;
  remainingMs: number;
  isActive: boolean;
}

export interface GameFlowEvents {
  onQuestionStart?: (questionId: string, questionIndex: number) => void;
  onQuestionEnd?: (questionId: string) => void;
  onAnswerReveal?: (questionId: string, correctAnswer: string) => void;
  onGamePause?: () => void;
  onGameResume?: () => void;
  onGameEnd?: () => void;
  onError?: (error: string) => void;
}

export interface UseGameFlowOptions {
  gameId: string;
  isHost?: boolean;
  autoSync?: boolean; // Auto-sync with backend state
  events?: GameFlowEvents;
}

export interface UseGameFlowReturn {
  // State
  gameFlow: GameFlow | null;
  currentQuestionIndex: number | null;
  currentQuestionId: string | null;
  isPaused: boolean;
  timerState: QuestionTimerState | null;
  loading: boolean;
  error: string | null;

  // Host Actions (only available if isHost=true)
  startQuestion: (questionId: string, questionIndex?: number) => Promise<GameFlow | void>;
  revealAnswer: () => Promise<void>;
  nextQuestion: () => Promise<void>;
  pauseGame: () => Promise<void>;
  resumeGame: () => Promise<void>;
  endGame: () => Promise<void>;

  // Player Actions
  refreshFlow: () => Promise<void>;

  // Real-time status
  isConnected: boolean;
}

interface SocketQuestionStartedEvent {
  roomId: string;
  question: { id: string; index?: number };
  startsAt?: number; // Server timestamp (milliseconds)
  endsAt?: number; // Server timestamp (milliseconds)
}

interface SocketQuestionChangedEvent {
  roomId: string;
  question: { id: string };
}

interface SocketQuestionEndedEvent {
  roomId: string;
}

interface GamePauseEvent {
  gameId: string;
  reason?: string;
}

interface GameResumeEvent {
  gameId: string;
  resumedAt?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function calculateRemainingTime(startTime: string | null, durationMs: number): number {
  if (!startTime) return 0;
  const start = new Date(startTime).getTime();
  const now = Date.now();
  const elapsed = now - start;
  return Math.max(0, durationMs - elapsed);
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

export function useGameFlow(options: UseGameFlowOptions): UseGameFlowReturn {
  const { gameId, isHost = false, autoSync = true, events } = options;
  const { socket, isConnected } = useSocket();

  // State
  const [gameFlow, setGameFlow] = useState<GameFlow | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [timerState, setTimerState] = useState<QuestionTimerState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const listenersSetupRef = useRef(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const gameFlowRef = useRef<GameFlow | null>(null);
  const refreshFlowRef = useRef<(() => Promise<void>) | undefined>(undefined);
  const eventsRef = useRef<GameFlowEvents | undefined>(events);
  const socketRef = useRef(socket);
  const isConnectedRef = useRef(isConnected);

  // Keep refs in sync
  useEffect(() => {
    eventsRef.current = events;
  }, [events]);

  useEffect(() => {
    socketRef.current = socket;
  }, [socket]);

  useEffect(() => {
    isConnectedRef.current = isConnected;
  }, [isConnected]);

  const updateTimerState = useCallback(
    (
      questionId: string,
      questionIndex: number,
      startTime: string,
      durationMs: number = DEFAULT_QUESTION_DURATION_MS,
    ) => {
      const start = new Date(startTime);
      const end = new Date(start.getTime() + durationMs);

      setTimerState({
        questionId,
        questionIndex,
        startTime: start,
        endTime: end,
        remainingMs: calculateRemainingTime(startTime, durationMs),
        isActive: true,
      });

      // Start countdown interval
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }

      timerIntervalRef.current = setInterval(() => {
        const remaining = calculateRemainingTime(startTime, durationMs);

        if (remaining <= 0) {
          // Timer expired
          setTimerState((prev) => (prev ? { ...prev, remainingMs: 0, isActive: false } : null));
          if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
          }
          eventsRef.current?.onQuestionEnd?.(questionId);
        } else {
          setTimerState((prev) => (prev ? { ...prev, remainingMs: remaining } : null));
        }
      }, 100); // Update every 100ms for smooth countdown
    },
    [],
  );

  // Store updateTimerState in ref (it's stable, but we need it in the effect)
  const updateTimerStateRef = useRef(updateTimerState);
  useEffect(() => {
    updateTimerStateRef.current = updateTimerState;
  }, [updateTimerState]);

  // ========================================================================
  // REST API OPERATIONS
  // ========================================================================

  /**
   * Refresh game flow from API
   */
  const refreshFlow = useCallback(async () => {
    if (!gameId) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: apiError } = await gameApi.getGameState(gameId);

      if (apiError || !data) {
        throw new Error(apiError?.message || 'Failed to fetch game flow');
      }

      setGameFlow(data.gameFlow);
      setIsPaused(data.gameFlow.is_paused);

      // Update timer state if question is active
      if (data.gameFlow.current_question_id && data.gameFlow.current_question_start_time) {
        updateTimerStateRef.current(
          data.gameFlow.current_question_id,
          data.gameFlow.current_question_index || 0,
          data.gameFlow.current_question_start_time,
        );
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch game flow';
      setError(errorMessage);
      console.error('useGameFlow: refreshFlow error', err);
      eventsRef.current?.onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  // Keep refs in sync with state and callbacks
  useEffect(() => {
    gameFlowRef.current = gameFlow;
  }, [gameFlow]);

  useEffect(() => {
    refreshFlowRef.current = refreshFlow;
  }, [refreshFlow]);

  /**
   * Start a specific question (Host only)
   */
  const startQuestion = useCallback(
    async (questionId: string, questionIndex?: number) => {
      if (!isHost) {
        throw new Error('Only the host can start questions');
      }
      if (!gameId) {
        throw new Error('No game ID provided');
      }

      try {
        setLoading(true);
        setError(null);

        const { data, error: apiError } = await gameApi.startQuestion(
          gameId,
          questionId,
          questionIndex,
        );

        if (apiError || !data) {
          throw new Error(apiError?.message || 'Failed to start question');
        }

        setGameFlow(data);
        const startIso = data.current_question_start_time || new Date().toISOString();
        const durationMs =
          data.current_question_end_time && data.current_question_start_time
            ? new Date(data.current_question_end_time).getTime() -
              new Date(data.current_question_start_time).getTime()
            : DEFAULT_QUESTION_DURATION_MS;

        updateTimerStateRef.current(
          questionId,
          data.current_question_index ?? questionIndex ?? 0,
          startIso,
          durationMs,
        );

        // Emit WebSocket event (align with listener: game:question:started)
        if (socketRef.current && isConnectedRef.current) {
          const startsAt = new Date(startIso).getTime();
          socketRef.current.emit('game:question:started', {
            roomId: gameId,
            question: { id: questionId, index: data.current_question_index ?? questionIndex ?? 0 },
            startsAt,
            endsAt: startsAt + durationMs,
          });
        }

        eventsRef.current?.onQuestionStart?.(questionId, questionIndex || 0);
        return data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to start question';
        setError(errorMessage);
        console.error('useGameFlow: startQuestion error', err);
        eventsRef.current?.onError?.(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isHost, gameId],
  );

  /**
   * Reveal answer for current question (Host only)
   */
  const revealAnswer = useCallback(async () => {
    if (!isHost) {
      throw new Error('Only the host can reveal answers');
    }
    if (!gameId) {
      throw new Error('No game ID provided');
    }

    try {
      setLoading(true);
      setError(null);

      const { error: apiError } = await gameApi.revealAnswer(gameId);

      if (apiError) {
        throw new Error(apiError.message || 'Failed to reveal answer');
      }

      // Stop timer
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }

      // Emit WebSocket event (align with listener: game:question:ended)
      if (socketRef.current && isConnectedRef.current) {
        socketRef.current.emit('game:question:ended', {
          roomId: gameId,
          questionId: gameFlowRef.current?.current_question_id,
        });
      }

      eventsRef.current?.onAnswerReveal?.(gameFlowRef.current?.current_question_id || '', '');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reveal answer';
      setError(errorMessage);
      console.error('useGameFlow: revealAnswer error', err);
      eventsRef.current?.onError?.(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isHost, gameId]);

  /**
   * Advance to next question (Host only)
   *
   * NOTE: This function requires the next question ID to be provided.
   * To advance to the next question, use startQuestion() with the next question's ID instead.
   * This function is kept for API compatibility but throws an error to indicate it's not implemented.
   */
  const nextQuestion = useCallback(async () => {
    if (!isHost) {
      throw new Error('Only the host can advance questions');
    }
    if (!gameId) {
      throw new Error('No game ID provided');
    }

    const errorMessage =
      'nextQuestion is not implemented. Use startQuestion(questionId, questionIndex) with the next question ID instead.';
    setError(errorMessage);
    console.error('useGameFlow: nextQuestion called but not implemented', {
      gameId,
      currentQuestionId: gameFlowRef.current?.current_question_id,
      currentQuestionIndex: gameFlowRef.current?.current_question_index,
    });
    eventsRef.current?.onError?.(errorMessage);
    throw new Error(errorMessage);
  }, [isHost, gameId]);

  /**
   * Pause the game (Host only)
   */
  const pauseGame = useCallback(async () => {
    if (!isHost) {
      throw new Error('Only the host can pause the game');
    }
    if (!gameId) {
      throw new Error('No game ID provided');
    }

    try {
      setLoading(true);
      setError(null);

      const { error: apiError } = await gameApi.pauseGame(gameId);

      if (apiError) {
        throw new Error(apiError.message || 'Failed to pause game');
      }

      setIsPaused(true);

      // Stop timer
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }

      // Emit WebSocket event
      if (socketRef.current && isConnectedRef.current) {
        socketRef.current.emit('game:pause', {
          gameId,
          timestamp: new Date().toISOString(),
        });
      }

      eventsRef.current?.onGamePause?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to pause game';
      setError(errorMessage);
      console.error('useGameFlow: pauseGame error', err);
      eventsRef.current?.onError?.(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isHost, gameId]);

  /**
   * Resume the game (Host only)
   */
  const resumeGame = useCallback(async () => {
    if (!isHost) {
      throw new Error('Only the host can resume the game');
    }
    if (!gameId) {
      throw new Error('No game ID provided');
    }

    try {
      setLoading(true);
      setError(null);

      const { error: apiError } = await gameApi.resumeGame(gameId);

      if (apiError) {
        throw new Error(apiError.message || 'Failed to resume game');
      }

      setIsPaused(false);

      // Emit WebSocket event
      if (socketRef.current && isConnectedRef.current) {
        socketRef.current.emit('game:resume', {
          gameId,
          timestamp: new Date().toISOString(),
        });
      }

      eventsRef.current?.onGameResume?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resume game';
      setError(errorMessage);
      console.error('useGameFlow: resumeGame error', err);
      eventsRef.current?.onError?.(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isHost, gameId]);

  /**
   * End the game (Host only)
   */
  const endGame = useCallback(async () => {
    if (!isHost) {
      throw new Error('Only the host can end the game');
    }
    if (!gameId) {
      throw new Error('No game ID provided');
    }

    try {
      setLoading(true);
      setError(null);

      const { error: apiError } = await gameApi.endGame(gameId);

      if (apiError) {
        throw new Error(apiError.message || 'Failed to end game');
      }

      // Stop timer
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }

      // Emit WebSocket event
      if (socketRef.current && isConnectedRef.current) {
        socketRef.current.emit('game:end', {
          gameId,
          timestamp: new Date().toISOString(),
        });
      }

      eventsRef.current?.onGameEnd?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to end game';
      setError(errorMessage);
      console.error('useGameFlow: endGame error', err);
      eventsRef.current?.onError?.(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isHost, gameId]);

  useEffect(() => {
    if (!socketRef.current || !isConnectedRef.current || !gameId) return;
    if (listenersSetupRef.current) return;

    console.log(`useGameFlow: Setting up WebSocket listeners for game ${gameId}`);
    listenersSetupRef.current = true;

    const currentSocket = socketRef.current;

    // Join game room
    currentSocket.emit('room:join', { roomId: gameId });

    // Question start event
    const handleQuestionStarted = (data: SocketQuestionStartedEvent) => {
      if (data.roomId !== gameId) return;
      console.log('useGameFlow: Question started', data);

      // Use server timestamps if available (authoritative)
      if (data.startsAt && data.endsAt) {
        const serverStartTime = data.startsAt;
        const serverEndTime = data.endsAt;
        const durationMs = serverEndTime - serverStartTime;

        // Calculate server start time ISO string
        const serverStartIso = new Date(serverStartTime).toISOString();

        const idx =
          typeof data.question?.index === 'number'
            ? data.question.index
            : (gameFlowRef.current?.current_question_index ?? 0);

        updateTimerStateRef.current(data.question.id, idx, serverStartIso, durationMs);
        eventsRef.current?.onQuestionStart?.(data.question.id, idx);
      } else {
        // Fallback to client-side calculation if server timestamps not available
        const durationMs = DEFAULT_QUESTION_DURATION_MS;
        const idx =
          typeof data.question?.index === 'number'
            ? data.question.index
            : (gameFlowRef.current?.current_question_index ?? 0);

        updateTimerStateRef.current(data.question.id, idx, new Date().toISOString(), durationMs);
        eventsRef.current?.onQuestionStart?.(data.question.id, idx);
      }

      refreshFlowRef.current?.();
    };

    const handleQuestionChanged = (data: SocketQuestionChangedEvent) => {
      if (data.roomId !== gameId) return;
      console.log('useGameFlow: Question changed', data);
      eventsRef.current?.onQuestionStart?.(
        data.question.id,
        gameFlowRef.current?.current_question_index ?? 0,
      );
      refreshFlowRef.current?.();
    };

    // Question end event
    const handleQuestionEnd = (data: SocketQuestionEndedEvent) => {
      if (data.roomId !== gameId) return;
      console.log('useGameFlow: Question ended', data);

      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      setTimerState((prev) => (prev ? { ...prev, isActive: false, remainingMs: 0 } : null));
      eventsRef.current?.onQuestionEnd?.(gameFlowRef.current?.current_question_id || '');
      refreshFlowRef.current?.();
    };

    // Game pause event
    const handleGamePause = (data: GamePauseEvent) => {
      if (data.gameId !== gameId) return;
      console.log('useGameFlow: Game paused');

      setIsPaused(true);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      eventsRef.current?.onGamePause?.();
    };

    // Game resume event
    const handleGameResume = (data: GameResumeEvent) => {
      if (data.gameId !== gameId) return;
      console.log('useGameFlow: Game resumed');

      setIsPaused(false);
      eventsRef.current?.onGameResume?.();
    };

    // Register listeners
    currentSocket.on('game:question:started', handleQuestionStarted);
    currentSocket.on('game:question:changed', handleQuestionChanged);
    currentSocket.on('game:question:ended', handleQuestionEnd);
    currentSocket.on('game:pause', handleGamePause);
    currentSocket.on('game:resume', handleGameResume);

    return () => {
      console.log(`useGameFlow: Cleaning up listeners for game ${gameId}`);

      currentSocket.off('game:question:started', handleQuestionStarted);
      currentSocket.off('game:question:changed', handleQuestionChanged);
      currentSocket.off('game:question:ended', handleQuestionEnd);
      currentSocket.off('game:pause', handleGamePause);
      currentSocket.off('game:resume', handleGameResume);

      currentSocket.emit('room:leave', { roomId: gameId });

      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }

      listenersSetupRef.current = false;
    };
  }, [gameId]);

  // ========================================================================
  // INITIALIZATION
  // ========================================================================

  useEffect(() => {
    if (autoSync && gameId) {
      refreshFlowRef.current?.();
    }
  }, [autoSync, gameId]);

  // Re-sync on socket reconnect
  useEffect(() => {
    if (!socketRef.current) return;
    const handleReconnect = () => {
      if (!gameId) return;
      socketRef.current?.emit('room:join', { roomId: gameId });
      refreshFlowRef.current?.();
    };
    socketRef.current.on('connect', handleReconnect);
    return () => {
      socketRef.current?.off('connect', handleReconnect);
    };
  }, [gameId]);

  // ========================================================================
  // RETURN
  // ========================================================================

  return {
    // State
    gameFlow,
    currentQuestionIndex: gameFlow?.current_question_index || null,
    currentQuestionId: gameFlow?.current_question_id || null,
    isPaused,
    timerState,
    loading,
    error,

    // Host Actions
    startQuestion,
    revealAnswer,
    nextQuestion,
    pauseGame,
    resumeGame,
    endGame,

    // Player Actions
    refreshFlow,

    // Real-time status
    isConnected,
  };
}
