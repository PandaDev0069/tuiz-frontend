// ====================================================
// File Name   : useGameFlow.ts
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-12-11
// Last Update : 2026-01-01
//
// Description:
// - Manages question progression, timing, and game state transitions
// - Handles real-time synchronization of question flow across all players
// - Provides host controls for game flow management
// - Implements timer management with auto-reveal functionality
//
// Notes:
// - Uses WebSocket for real-time synchronization
// - Timer updates every 100ms for smooth countdown
// - Supports auto-reveal when timer expires (host only)
// - Handles pause/resume functionality with timer preservation
// ====================================================

'use client';

//----------------------------------------------------
// 1. Imports / Dependencies
//----------------------------------------------------
import { useState, useEffect, useCallback, useRef } from 'react';

import { useSocket } from '@/components/providers/SocketProvider';
import { gameApi, type GameFlow } from '@/services/gameApi';

//----------------------------------------------------
// 2. Constants / Configuration
//----------------------------------------------------
const DEFAULT_QUESTION_DURATION_MS = 30000;
const TIMER_UPDATE_INTERVAL_MS = 100;
const DEFAULT_IS_HOST = false;
const DEFAULT_AUTO_SYNC = true;
const DEFAULT_TRIGGER_ON_QUESTION_END_ON_TIMER = true;

const SOCKET_EVENTS = {
  QUESTION_STARTED: 'game:question:started',
  QUESTION_CHANGED: 'game:question:changed',
  QUESTION_ENDED: 'game:question:ended',
  PAUSE: 'game:pause',
  RESUME: 'game:resume',
  EXPLANATION_SHOW: 'game:explanation:show',
  EXPLANATION_HIDE: 'game:explanation:hide',
  ROOM_JOIN: 'room:join',
  ROOM_LEAVE: 'room:leave',
  CONNECT: 'connect',
} as const;

const ERROR_MESSAGES = {
  ONLY_HOST_CAN_START_QUESTIONS: 'Only the host can start questions',
  ONLY_HOST_CAN_REVEAL_ANSWERS: 'Only the host can reveal answers',
  ONLY_HOST_CAN_ADVANCE_QUESTIONS: 'Only the host can advance questions',
  ONLY_HOST_CAN_PAUSE_GAME: 'Only the host can pause the game',
  ONLY_HOST_CAN_RESUME_GAME: 'Only the host can resume the game',
  ONLY_HOST_CAN_END_GAME: 'Only the host can end the game',
  NO_GAME_ID_PROVIDED: 'No game ID provided',
  FAILED_TO_FETCH_GAME_FLOW: 'Failed to fetch game flow',
  FAILED_TO_START_QUESTION: 'Failed to start question',
  FAILED_TO_REVEAL_ANSWER: 'Failed to reveal answer',
  FAILED_TO_ADVANCE_TO_NEXT_QUESTION: 'Failed to advance to next question',
  FAILED_TO_PAUSE_GAME: 'Failed to pause game',
  FAILED_TO_RESUME_GAME: 'Failed to resume game',
  FAILED_TO_END_GAME: 'Failed to end game',
} as const;

//----------------------------------------------------
// 3. Types / Interfaces
//----------------------------------------------------
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
  onExplanationShow?: (
    questionId: string,
    explanation: {
      title: string | null;
      text: string | null;
      image_url: string | null;
      show_time: number | null;
    },
  ) => void;
  onExplanationHide?: (questionId: string) => void;
  onGamePause?: () => void;
  onGameResume?: () => void;
  onGameEnd?: () => void;
  onError?: (error: string) => void;
}

export interface UseGameFlowOptions {
  gameId: string;
  isHost?: boolean;
  autoSync?: boolean;
  events?: GameFlowEvents;
  triggerOnQuestionEndOnTimer?: boolean;
}

export interface UseGameFlowReturn {
  gameFlow: GameFlow | null;
  currentQuestionIndex: number | null;
  currentQuestionId: string | null;
  isPaused: boolean;
  timerState: QuestionTimerState | null;
  loading: boolean;
  error: string | null;
  startQuestion: (questionId: string, questionIndex?: number) => Promise<GameFlow | void>;
  revealAnswer: () => Promise<{
    message: string;
    gameFlow: GameFlow;
    answerStats?: Record<string, number>;
  } | null>;
  nextQuestion: () => Promise<{
    message: string;
    gameFlow: GameFlow;
    nextQuestion?: { id: string; index: number };
    isComplete: boolean;
  }>;
  pauseGame: () => Promise<void>;
  resumeGame: () => Promise<void>;
  endGame: () => Promise<void>;
  refreshFlow: () => Promise<void>;
  isConnected: boolean;
}

interface SocketQuestionStartedEvent {
  roomId: string;
  question: { id: string; index?: number };
  startsAt?: number;
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

interface ExplanationShowEvent {
  roomId: string;
  questionId: string;
  explanation: {
    title: string | null;
    text: string | null;
    image_url: string | null;
    show_time: number | null;
  };
}

interface ExplanationHideEvent {
  roomId: string;
  questionId: string;
}

type RevealAnswerResult = {
  message: string;
  gameFlow: GameFlow;
  answerStats?: Record<string, number>;
} | null;

//----------------------------------------------------
// 4. Core Logic
//----------------------------------------------------

//----------------------------------------------------
// 5. Helper Functions
//----------------------------------------------------
/**
 * Function: calculateRemainingTime
 * Description:
 * - Calculates remaining time for a question based on start time and duration
 * - Returns 0 if start time is not provided
 *
 * Parameters:
 * - startTime (string | null): ISO string of question start time
 * - durationMs (number): Total duration in milliseconds
 *
 * Returns:
 * - number: Remaining time in milliseconds (0 or positive)
 */
function calculateRemainingTime(startTime: string | null, durationMs: number): number {
  if (!startTime) return 0;
  const start = new Date(startTime).getTime();
  const now = Date.now();
  const elapsed = now - start;
  return Math.max(0, durationMs - elapsed);
}

/**
 * Function: calculateDuration
 * Description:
 * - Calculates question duration from start and end times
 * - Falls back to default duration if times are not available
 *
 * Parameters:
 * - startTime (string | null): Question start time ISO string
 * - endTime (string | null): Question end time ISO string
 * - defaultDurationMs (number): Default duration to use if times unavailable
 *
 * Returns:
 * - number: Duration in milliseconds
 */
function calculateDuration(
  startTime: string | null,
  endTime: string | null,
  defaultDurationMs: number,
): number {
  if (endTime && startTime) {
    return new Date(endTime).getTime() - new Date(startTime).getTime();
  }
  return defaultDurationMs;
}

/**
 * Function: handleTimerExpiration
 * Description:
 * - Handles timer expiration logic including auto-reveal for host
 * - Fires question end event if enabled
 *
 * Parameters:
 * - questionId (string): ID of the question that expired
 * - gameFlowRef (React.MutableRefObject<GameFlow | null>): Current game flow ref
 * - isHostRef (React.MutableRefObject<boolean>): Host status ref
 * - revealAnswerRef (React.MutableRefObject<(() => Promise<any>) | undefined>): Reveal answer function ref
 * - triggerOnQuestionEndOnTimerRef (React.MutableRefObject<boolean>): Trigger flag ref
 * - eventsRef (React.MutableRefObject<GameFlowEvents | undefined>): Events ref
 * - setTimerState (function): State setter for timer state
 * - timerIntervalRef (React.MutableRefObject<NodeJS.Timeout | null>): Timer interval ref
 */
function handleTimerExpiration(
  questionId: string,
  gameFlowRef: React.MutableRefObject<GameFlow | null>,
  isHostRef: React.MutableRefObject<boolean>,
  revealAnswerRef: React.MutableRefObject<(() => Promise<RevealAnswerResult>) | undefined>,
  triggerOnQuestionEndOnTimerRef: React.MutableRefObject<boolean>,
  eventsRef: React.MutableRefObject<GameFlowEvents | undefined>,
  setTimerState: (
    state:
      | QuestionTimerState
      | null
      | ((prev: QuestionTimerState | null) => QuestionTimerState | null),
  ) => void,
  timerIntervalRef: React.MutableRefObject<NodeJS.Timeout | null>,
): void {
  setTimerState((prev) => (prev ? { ...prev, remainingMs: 0, isActive: false } : null));
  if (timerIntervalRef.current) {
    clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = null;
  }

  const currentFlow = gameFlowRef.current;
  if (
    isHostRef.current &&
    revealAnswerRef.current &&
    currentFlow?.current_question_id === questionId &&
    !currentFlow?.current_question_end_time
  ) {
    revealAnswerRef.current().catch(() => {
      eventsRef.current?.onQuestionEnd?.(questionId);
    });
  } else {
    if (triggerOnQuestionEndOnTimerRef.current) {
      eventsRef.current?.onQuestionEnd?.(questionId);
    }
  }
}

/**
 * Function: createTimerInterval
 * Description:
 * - Creates and manages timer interval for question countdown
 * - Handles timer expiration and updates remaining time
 *
 * Parameters:
 * - questionId (string): Question ID
 * - startTime (string): Question start time ISO string
 * - durationMs (number): Question duration in milliseconds
 * - gameFlowRef (React.MutableRefObject<GameFlow | null>): Game flow ref
 * - isHostRef (React.MutableRefObject<boolean>): Host status ref
 * - revealAnswerRef (React.MutableRefObject<(() => Promise<any>) | undefined>): Reveal answer ref
 * - triggerOnQuestionEndOnTimerRef (React.MutableRefObject<boolean>): Trigger flag ref
 * - eventsRef (React.MutableRefObject<GameFlowEvents | undefined>): Events ref
 * - setTimerState (function): Timer state setter
 * - timerIntervalRef (React.MutableRefObject<NodeJS.Timeout | null>): Timer interval ref
 *
 * Returns:
 * - NodeJS.Timeout: The created interval
 */
function createTimerInterval(
  questionId: string,
  startTime: string,
  durationMs: number,
  gameFlowRef: React.MutableRefObject<GameFlow | null>,
  isHostRef: React.MutableRefObject<boolean>,
  revealAnswerRef: React.MutableRefObject<(() => Promise<RevealAnswerResult>) | undefined>,
  triggerOnQuestionEndOnTimerRef: React.MutableRefObject<boolean>,
  eventsRef: React.MutableRefObject<GameFlowEvents | undefined>,
  setTimerState: (
    state:
      | QuestionTimerState
      | null
      | ((prev: QuestionTimerState | null) => QuestionTimerState | null),
  ) => void,
  timerIntervalRef: React.MutableRefObject<NodeJS.Timeout | null>,
): NodeJS.Timeout {
  return setInterval(() => {
    const remaining = calculateRemainingTime(startTime, durationMs);

    if (remaining <= 0) {
      handleTimerExpiration(
        questionId,
        gameFlowRef,
        isHostRef,
        revealAnswerRef,
        triggerOnQuestionEndOnTimerRef,
        eventsRef,
        setTimerState,
        timerIntervalRef,
      );
    } else {
      setTimerState((prev) => (prev ? { ...prev, remainingMs: remaining } : null));
    }
  }, TIMER_UPDATE_INTERVAL_MS);
}

/**
 * Function: stopTimer
 * Description:
 * - Stops and clears the timer interval
 *
 * Parameters:
 * - timerIntervalRef (React.MutableRefObject<NodeJS.Timeout | null>): Timer interval ref
 */
function stopTimer(timerIntervalRef: React.MutableRefObject<NodeJS.Timeout | null>): void {
  if (timerIntervalRef.current) {
    clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = null;
  }
}

/**
 * Hook: useGameFlow
 * Description:
 * - Manages game flow state, question progression, and timing
 * - Provides host controls for game management
 * - Handles real-time synchronization via WebSocket
 * - Implements timer management with auto-reveal functionality
 *
 * Parameters:
 * - options (UseGameFlowOptions): Configuration options for the hook
 *
 * Returns:
 * - UseGameFlowReturn: Object containing game flow state and control functions
 */
export function useGameFlow(options: UseGameFlowOptions): UseGameFlowReturn {
  const {
    gameId,
    isHost = DEFAULT_IS_HOST,
    autoSync = DEFAULT_AUTO_SYNC,
    events,
    triggerOnQuestionEndOnTimer = DEFAULT_TRIGGER_ON_QUESTION_END_ON_TIMER,
  } = options;
  const { socket, isConnected, isRegistered, joinRoom, leaveRoom } = useSocket();

  const [gameFlow, setGameFlow] = useState<GameFlow | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [timerState, setTimerState] = useState<QuestionTimerState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listenersSetupRef = useRef(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const gameFlowRef = useRef<GameFlow | null>(null);
  const refreshFlowRef = useRef<(() => Promise<void>) | undefined>(undefined);
  const eventsRef = useRef<GameFlowEvents | undefined>(events);
  const socketRef = useRef(socket);
  const isConnectedRef = useRef(isConnected);
  const isHostRef = useRef(isHost);
  const revealAnswerRef = useRef<
    | (() => Promise<{
        message: string;
        gameFlow: GameFlow;
        answerStats?: Record<string, number>;
      } | null>)
    | undefined
  >(undefined);
  const hasJoinedRoomRef = useRef(false);
  const triggerOnQuestionEndOnTimerRef = useRef(triggerOnQuestionEndOnTimer);

  useEffect(() => {
    eventsRef.current = events;
  }, [events]);

  useEffect(() => {
    triggerOnQuestionEndOnTimerRef.current = triggerOnQuestionEndOnTimer;
  }, [triggerOnQuestionEndOnTimer]);

  useEffect(() => {
    socketRef.current = socket;
  }, [socket]);

  useEffect(() => {
    isConnectedRef.current = isConnected;
  }, [isConnected]);

  useEffect(() => {
    isHostRef.current = isHost;
  }, [isHost]);

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

      stopTimer(timerIntervalRef);

      timerIntervalRef.current = createTimerInterval(
        questionId,
        startTime,
        durationMs,
        gameFlowRef,
        isHostRef,
        revealAnswerRef,
        triggerOnQuestionEndOnTimerRef,
        eventsRef,
        setTimerState,
        timerIntervalRef,
      );
    },
    [],
  );

  const updateTimerStateRef = useRef(updateTimerState);
  useEffect(() => {
    updateTimerStateRef.current = updateTimerState;
  }, [updateTimerState]);

  const refreshFlow = useCallback(async () => {
    if (!gameId) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: apiError } = await gameApi.getGameState(gameId);

      if (apiError || !data) {
        throw new Error(apiError?.message || ERROR_MESSAGES.FAILED_TO_FETCH_GAME_FLOW);
      }

      setGameFlow(data.gameFlow);
      setIsPaused(data.gameFlow.is_paused);

      if (data.gameFlow.current_question_id && data.gameFlow.current_question_start_time) {
        const durationMs = calculateDuration(
          data.gameFlow.current_question_start_time,
          data.gameFlow.current_question_end_time,
          DEFAULT_QUESTION_DURATION_MS,
        );
        updateTimerStateRef.current(
          data.gameFlow.current_question_id,
          data.gameFlow.current_question_index || 0,
          data.gameFlow.current_question_start_time,
          durationMs,
        );
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : ERROR_MESSAGES.FAILED_TO_FETCH_GAME_FLOW;
      setError(errorMessage);
      eventsRef.current?.onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    gameFlowRef.current = gameFlow;
  }, [gameFlow]);

  useEffect(() => {
    refreshFlowRef.current = refreshFlow;
  }, [refreshFlow]);

  const startQuestion = useCallback(
    async (questionId: string, questionIndex?: number) => {
      if (!isHost) {
        throw new Error(ERROR_MESSAGES.ONLY_HOST_CAN_START_QUESTIONS);
      }
      if (!gameId) {
        throw new Error(ERROR_MESSAGES.NO_GAME_ID_PROVIDED);
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
          throw new Error(apiError?.message || ERROR_MESSAGES.FAILED_TO_START_QUESTION);
        }

        setGameFlow(data);
        const startIso = data.current_question_start_time || new Date().toISOString();
        const durationMs = calculateDuration(
          data.current_question_start_time,
          data.current_question_end_time,
          DEFAULT_QUESTION_DURATION_MS,
        );

        updateTimerStateRef.current(
          questionId,
          data.current_question_index ?? questionIndex ?? 0,
          startIso,
          durationMs,
        );

        if (socketRef.current && isConnectedRef.current) {
          const startsAt = new Date(startIso).getTime();
          socketRef.current.emit(SOCKET_EVENTS.QUESTION_STARTED, {
            roomId: gameId,
            question: { id: questionId, index: data.current_question_index ?? questionIndex ?? 0 },
            startsAt,
            endsAt: startsAt + durationMs,
          });
        }

        eventsRef.current?.onQuestionStart?.(questionId, questionIndex || 0);
        return data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : ERROR_MESSAGES.FAILED_TO_START_QUESTION;
        setError(errorMessage);
        eventsRef.current?.onError?.(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isHost, gameId],
  );

  const revealAnswer = useCallback(async () => {
    if (!isHost) {
      throw new Error(ERROR_MESSAGES.ONLY_HOST_CAN_REVEAL_ANSWERS);
    }
    if (!gameId) {
      throw new Error(ERROR_MESSAGES.NO_GAME_ID_PROVIDED);
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: apiError } = await gameApi.revealAnswer(gameId);

      if (apiError) {
        throw new Error(apiError.message || ERROR_MESSAGES.FAILED_TO_REVEAL_ANSWER);
      }

      if (data?.gameFlow) {
        setGameFlow(data.gameFlow);
      }

      stopTimer(timerIntervalRef);
      refreshFlowRef.current?.();

      eventsRef.current?.onAnswerReveal?.(gameFlowRef.current?.current_question_id || '', '');
      return data || null;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : ERROR_MESSAGES.FAILED_TO_REVEAL_ANSWER;
      setError(errorMessage);
      eventsRef.current?.onError?.(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isHost, gameId]);

  useEffect(() => {
    revealAnswerRef.current = revealAnswer;
  }, [revealAnswer]);

  const nextQuestion = useCallback(async () => {
    if (!isHost) {
      throw new Error(ERROR_MESSAGES.ONLY_HOST_CAN_ADVANCE_QUESTIONS);
    }
    if (!gameId) {
      throw new Error(ERROR_MESSAGES.NO_GAME_ID_PROVIDED);
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: apiError } = await gameApi.nextQuestion(gameId);

      if (apiError || !data) {
        throw new Error(apiError?.message || ERROR_MESSAGES.FAILED_TO_ADVANCE_TO_NEXT_QUESTION);
      }

      setGameFlow(data.gameFlow);

      if (data.isComplete) {
        stopTimer(timerIntervalRef);
        setTimerState(null);
        eventsRef.current?.onGameEnd?.();
      } else if (data.nextQuestion) {
        stopTimer(timerIntervalRef);
        setTimerState(null);
        refreshFlowRef.current?.();
      }

      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : ERROR_MESSAGES.FAILED_TO_ADVANCE_TO_NEXT_QUESTION;
      setError(errorMessage);
      eventsRef.current?.onError?.(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isHost, gameId]);

  const pauseGame = useCallback(async () => {
    if (!isHost) {
      throw new Error(ERROR_MESSAGES.ONLY_HOST_CAN_PAUSE_GAME);
    }
    if (!gameId) {
      throw new Error(ERROR_MESSAGES.NO_GAME_ID_PROVIDED);
    }

    try {
      setLoading(true);
      setError(null);

      const { error: apiError } = await gameApi.pauseGame(gameId);

      if (apiError) {
        throw new Error(apiError.message || ERROR_MESSAGES.FAILED_TO_PAUSE_GAME);
      }

      setIsPaused(true);
      stopTimer(timerIntervalRef);

      if (socketRef.current && isConnectedRef.current) {
        socketRef.current.emit(SOCKET_EVENTS.PAUSE, {
          gameId,
          timestamp: new Date().toISOString(),
        });
      }

      eventsRef.current?.onGamePause?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : ERROR_MESSAGES.FAILED_TO_PAUSE_GAME;
      setError(errorMessage);
      eventsRef.current?.onError?.(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isHost, gameId]);

  const resumeGame = useCallback(async () => {
    if (!isHost) {
      throw new Error(ERROR_MESSAGES.ONLY_HOST_CAN_RESUME_GAME);
    }
    if (!gameId) {
      throw new Error(ERROR_MESSAGES.NO_GAME_ID_PROVIDED);
    }

    try {
      setLoading(true);
      setError(null);

      const { error: apiError } = await gameApi.resumeGame(gameId);

      if (apiError) {
        throw new Error(apiError.message || ERROR_MESSAGES.FAILED_TO_RESUME_GAME);
      }

      setIsPaused(false);

      if (socketRef.current && isConnectedRef.current) {
        socketRef.current.emit(SOCKET_EVENTS.RESUME, {
          gameId,
          timestamp: new Date().toISOString(),
        });
      }

      eventsRef.current?.onGameResume?.();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : ERROR_MESSAGES.FAILED_TO_RESUME_GAME;
      setError(errorMessage);
      eventsRef.current?.onError?.(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isHost, gameId]);

  const endGame = useCallback(async () => {
    if (!isHost) {
      throw new Error(ERROR_MESSAGES.ONLY_HOST_CAN_END_GAME);
    }
    if (!gameId) {
      throw new Error(ERROR_MESSAGES.NO_GAME_ID_PROVIDED);
    }

    try {
      setLoading(true);
      setError(null);

      const { error: apiError } = await gameApi.endGame(gameId);

      if (apiError) {
        throw new Error(apiError.message || ERROR_MESSAGES.FAILED_TO_END_GAME);
      }

      stopTimer(timerIntervalRef);

      if (socketRef.current && isConnectedRef.current) {
        socketRef.current.emit('game:end', {
          gameId,
          timestamp: new Date().toISOString(),
        });
      }

      eventsRef.current?.onGameEnd?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : ERROR_MESSAGES.FAILED_TO_END_GAME;
      setError(errorMessage);
      eventsRef.current?.onError?.(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isHost, gameId]);

  useEffect(() => {
    if (!socketRef.current || !isConnectedRef.current || !isRegistered || !gameId) return;
    if (listenersSetupRef.current) return;

    listenersSetupRef.current = true;

    const currentSocket = socketRef.current;
    const safeJoin = (roomId: string) => {
      if (!roomId) return;
      if (typeof joinRoom === 'function') {
        joinRoom(roomId);
      } else {
        currentSocket.emit(SOCKET_EVENTS.ROOM_JOIN, { roomId });
      }
    };
    const safeLeave = (roomId: string) => {
      if (!roomId) return;
      if (typeof leaveRoom === 'function') {
        leaveRoom(roomId);
      } else {
        currentSocket.emit(SOCKET_EVENTS.ROOM_LEAVE, { roomId });
      }
    };

    if (!hasJoinedRoomRef.current) {
      safeJoin(gameId);
      hasJoinedRoomRef.current = true;
    }

    const handleQuestionStarted = (data: SocketQuestionStartedEvent) => {
      if (data.roomId !== gameId) return;

      if (data.startsAt && data.endsAt) {
        const serverStartTime = data.startsAt;
        const serverEndTime = data.endsAt;
        const durationMs = serverEndTime - serverStartTime;
        const serverStartIso = new Date(serverStartTime).toISOString();

        const idx =
          typeof data.question?.index === 'number'
            ? data.question.index
            : (gameFlowRef.current?.current_question_index ?? 0);

        updateTimerStateRef.current(data.question.id, idx, serverStartIso, durationMs);
        eventsRef.current?.onQuestionStart?.(data.question.id, idx);
      } else {
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
      eventsRef.current?.onQuestionStart?.(
        data.question.id,
        gameFlowRef.current?.current_question_index ?? 0,
      );
      refreshFlowRef.current?.();
    };

    const handleQuestionEnd = (data: SocketQuestionEndedEvent) => {
      if (data.roomId !== gameId) return;

      stopTimer(timerIntervalRef);
      setTimerState((prev) => (prev ? { ...prev, isActive: false, remainingMs: 0 } : null));
      eventsRef.current?.onQuestionEnd?.(gameFlowRef.current?.current_question_id || '');
      refreshFlowRef.current?.();
    };

    const handleGamePause = (data: GamePauseEvent) => {
      if (data.gameId !== gameId) return;

      setIsPaused(true);
      stopTimer(timerIntervalRef);
      eventsRef.current?.onGamePause?.();
    };

    const handleGameResume = (data: GameResumeEvent) => {
      if (data.gameId !== gameId) return;

      setIsPaused(false);

      if (
        gameFlowRef.current?.current_question_id &&
        gameFlowRef.current?.current_question_start_time
      ) {
        const startTime = gameFlowRef.current.current_question_start_time;
        const endTime = gameFlowRef.current.current_question_end_time;
        const durationMs = calculateDuration(startTime, endTime, DEFAULT_QUESTION_DURATION_MS);

        stopTimer(timerIntervalRef);

        const currentRemaining = calculateRemainingTime(startTime, durationMs);
        setTimerState((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            remainingMs: currentRemaining,
            isActive: currentRemaining > 0,
          };
        });

        timerIntervalRef.current = createTimerInterval(
          gameFlowRef.current.current_question_id,
          startTime,
          durationMs,
          gameFlowRef,
          isHostRef,
          revealAnswerRef,
          triggerOnQuestionEndOnTimerRef,
          eventsRef,
          setTimerState,
          timerIntervalRef,
        );
      }

      eventsRef.current?.onGameResume?.();
    };

    const handleExplanationShow = (data: ExplanationShowEvent) => {
      if (data.roomId !== gameId) return;
      eventsRef.current?.onExplanationShow?.(data.questionId, data.explanation);
      refreshFlowRef.current?.();
    };

    const handleExplanationHide = (data: ExplanationHideEvent) => {
      if (data.roomId !== gameId) return;
      eventsRef.current?.onExplanationHide?.(data.questionId);
      refreshFlowRef.current?.();
    };

    currentSocket.on(SOCKET_EVENTS.QUESTION_STARTED, handleQuestionStarted);
    currentSocket.on(SOCKET_EVENTS.QUESTION_CHANGED, handleQuestionChanged);
    currentSocket.on(SOCKET_EVENTS.QUESTION_ENDED, handleQuestionEnd);
    currentSocket.on(SOCKET_EVENTS.PAUSE, handleGamePause);
    currentSocket.on(SOCKET_EVENTS.RESUME, handleGameResume);
    currentSocket.on(SOCKET_EVENTS.EXPLANATION_SHOW, handleExplanationShow);
    currentSocket.on(SOCKET_EVENTS.EXPLANATION_HIDE, handleExplanationHide);

    return () => {
      currentSocket.off(SOCKET_EVENTS.QUESTION_STARTED, handleQuestionStarted);
      currentSocket.off(SOCKET_EVENTS.QUESTION_CHANGED, handleQuestionChanged);
      currentSocket.off(SOCKET_EVENTS.QUESTION_ENDED, handleQuestionEnd);
      currentSocket.off(SOCKET_EVENTS.PAUSE, handleGamePause);
      currentSocket.off(SOCKET_EVENTS.RESUME, handleGameResume);
      currentSocket.off(SOCKET_EVENTS.EXPLANATION_SHOW, handleExplanationShow);
      currentSocket.off(SOCKET_EVENTS.EXPLANATION_HIDE, handleExplanationHide);

      if (hasJoinedRoomRef.current) {
        safeLeave(gameId);
        hasJoinedRoomRef.current = false;
      }

      stopTimer(timerIntervalRef);
      listenersSetupRef.current = false;
    };
  }, [gameId, isRegistered, joinRoom, leaveRoom]);

  useEffect(() => {
    if (autoSync && gameId) {
      refreshFlowRef.current?.();
    }
  }, [autoSync, gameId]);

  useEffect(() => {
    if (!socketRef.current) return;
    const handleReconnect = () => {
      if (!gameId) return;
      if (!hasJoinedRoomRef.current) {
        if (typeof joinRoom === 'function') {
          joinRoom(gameId);
        } else {
          socketRef.current?.emit(SOCKET_EVENTS.ROOM_JOIN, { roomId: gameId });
        }
        hasJoinedRoomRef.current = true;
      }
      refreshFlowRef.current?.();
    };
    socketRef.current.on(SOCKET_EVENTS.CONNECT, handleReconnect);
    return () => {
      socketRef.current?.off(SOCKET_EVENTS.CONNECT, handleReconnect);
    };
  }, [gameId, joinRoom]);

  return {
    gameFlow,
    currentQuestionIndex: gameFlow?.current_question_index || null,
    currentQuestionId: gameFlow?.current_question_id || null,
    isPaused,
    timerState,
    loading,
    error,
    startQuestion,
    revealAnswer,
    nextQuestion,
    pauseGame,
    resumeGame,
    endGame,

    // Player Actions
    refreshFlow,
    isConnected,
  };
}

//----------------------------------------------------
// 6. Export
//----------------------------------------------------
