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
  startQuestion: (questionId: string, questionIndex?: number) => Promise<void>;
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
  question: { id: string };
  endsAt?: number;
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
          events?.onQuestionEnd?.(questionId);
        } else {
          setTimerState((prev) => (prev ? { ...prev, remainingMs: remaining } : null));
        }
      }, 100); // Update every 100ms for smooth countdown
    },
    [events],
  );

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
        updateTimerState(
          data.gameFlow.current_question_id,
          data.gameFlow.current_question_index || 0,
          data.gameFlow.current_question_start_time,
        );
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch game flow';
      setError(errorMessage);
      console.error('useGameFlow: refreshFlow error', err);
      events?.onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [gameId, events, updateTimerState]);

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

        updateTimerState(
          questionId,
          data.current_question_index ?? questionIndex ?? 0,
          startIso,
          durationMs,
        );

        // Emit WebSocket event
        if (socket && isConnected) {
          const startsAt = new Date(startIso).getTime();
          socket.emit('game:flow:start', {
            roomId: gameId,
            questionId,
            startsAt,
            endsAt: startsAt + durationMs,
          });
        }

        events?.onQuestionStart?.(questionId, questionIndex || 0);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to start question';
        setError(errorMessage);
        console.error('useGameFlow: startQuestion error', err);
        events?.onError?.(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isHost, gameId, socket, isConnected, events, updateTimerState],
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

      // Emit WebSocket event
      if (socket && isConnected) {
        socket.emit('game:flow:end', {
          roomId: gameId,
        });
      }

      events?.onAnswerReveal?.(gameFlow?.current_question_id || '', '');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reveal answer';
      setError(errorMessage);
      console.error('useGameFlow: revealAnswer error', err);
      events?.onError?.(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isHost, gameId, socket, isConnected, gameFlow, events]);

  /**
   * Advance to next question (Host only)
   */
  const nextQuestion = useCallback(async () => {
    if (!isHost) {
      throw new Error('Only the host can advance questions');
    }
    if (!gameId) {
      throw new Error('No game ID provided');
    }

    try {
      setLoading(true);
      setError(null);

      console.warn('useGameFlow: nextQuestion called but flow progression is not implemented yet');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to advance question';
      setError(errorMessage);
      console.error('useGameFlow: nextQuestion error', err);
      events?.onError?.(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isHost, gameId, events]);

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
      if (socket && isConnected) {
        socket.emit('game:pause', {
          gameId,
          timestamp: new Date().toISOString(),
        });
      }

      events?.onGamePause?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to pause game';
      setError(errorMessage);
      console.error('useGameFlow: pauseGame error', err);
      events?.onError?.(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isHost, gameId, socket, isConnected, events]);

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
      if (socket && isConnected) {
        socket.emit('game:resume', {
          gameId,
          timestamp: new Date().toISOString(),
        });
      }

      events?.onGameResume?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resume game';
      setError(errorMessage);
      console.error('useGameFlow: resumeGame error', err);
      events?.onError?.(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isHost, gameId, socket, isConnected, events]);

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
      if (socket && isConnected) {
        socket.emit('game:end', {
          gameId,
          timestamp: new Date().toISOString(),
        });
      }

      events?.onGameEnd?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to end game';
      setError(errorMessage);
      console.error('useGameFlow: endGame error', err);
      events?.onError?.(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isHost, gameId, socket, isConnected, events]);

  useEffect(() => {
    if (!socket || !isConnected || !gameId) return;
    if (listenersSetupRef.current) return;

    console.log(`useGameFlow: Setting up WebSocket listeners for game ${gameId}`);
    listenersSetupRef.current = true;

    // Join game room
    socket.emit('room:join', { roomId: gameId });

    // Question start event
    const handleQuestionStarted = (data: SocketQuestionStartedEvent) => {
      if (data.roomId !== gameId) return;
      console.log('useGameFlow: Question started', data);

      const durationMs = data.endsAt
        ? Math.max(0, data.endsAt - Date.now())
        : DEFAULT_QUESTION_DURATION_MS;
      updateTimerState(
        data.question.id,
        gameFlow?.current_question_index ?? 0,
        new Date().toISOString(),
        durationMs,
      );
      events?.onQuestionStart?.(data.question.id, gameFlow?.current_question_index ?? 0);
      refreshFlow();
    };

    const handleQuestionChanged = (data: SocketQuestionChangedEvent) => {
      if (data.roomId !== gameId) return;
      console.log('useGameFlow: Question changed', data);
      events?.onQuestionStart?.(data.question.id, gameFlow?.current_question_index ?? 0);
      refreshFlow();
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
      events?.onQuestionEnd?.(gameFlow?.current_question_id || '');
      refreshFlow();
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
      events?.onGamePause?.();
    };

    // Game resume event
    const handleGameResume = (data: GameResumeEvent) => {
      if (data.gameId !== gameId) return;
      console.log('useGameFlow: Game resumed');

      setIsPaused(false);
      events?.onGameResume?.();
    };

    // Register listeners
    socket.on('game:question:started', handleQuestionStarted);
    socket.on('game:question:changed', handleQuestionChanged);
    socket.on('game:question:ended', handleQuestionEnd);
    socket.on('game:pause', handleGamePause);
    socket.on('game:resume', handleGameResume);

    return () => {
      console.log(`useGameFlow: Cleaning up listeners for game ${gameId}`);

      socket.off('game:question:started', handleQuestionStarted);
      socket.off('game:question:changed', handleQuestionChanged);
      socket.off('game:question:ended', handleQuestionEnd);
      socket.off('game:pause', handleGamePause);
      socket.off('game:resume', handleGameResume);

      socket.emit('room:leave', { roomId: gameId });

      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }

      listenersSetupRef.current = false;
    };
  }, [
    socket,
    isConnected,
    gameId,
    events,
    updateTimerState,
    refreshFlow,
    gameFlow?.current_question_index,
    gameFlow?.current_question_id,
  ]);

  // ========================================================================
  // INITIALIZATION
  // ========================================================================

  useEffect(() => {
    if (autoSync && gameId) {
      refreshFlow();
    }
  }, [autoSync, gameId, refreshFlow]);

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
