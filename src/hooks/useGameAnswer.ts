/**
 * useGameAnswer Hook
 * Handles answer submission, validation, and real-time answer feedback
 * Tracks player answer status and manages answer reveal events
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from '@/components/providers/SocketProvider';
import { gameApi, type Answer } from '@/services/gameApi';
import { calculatePoints } from '@/lib/pointCalculation';

// ============================================================================
// TYPES
// ============================================================================

export interface AnswerSubmission {
  questionId: string;
  selectedOption: string;
  responseTimeMs: number;
}

export interface AnswerResult {
  questionId: string;
  selectedOption: string;
  isCorrect: boolean;
  pointsEarned: number;
  correctAnswer: string;
  responseTimeMs: number;
}

export interface AnswerStatus {
  hasAnswered: boolean;
  submittedAt: Date | null;
  submittedOption: string | null;
  isProcessing: boolean;
}

export interface GameAnswerEvents {
  onAnswerSubmitted?: (answer: AnswerSubmission) => void;
  onAnswerConfirmed?: (answerId: string) => void;
  onAnswerResult?: (result: AnswerResult) => void;
  onRevealAnswer?: (correctAnswer: string) => void;
  onError?: (error: string) => void;
}

export interface UseGameAnswerOptions {
  gameId: string;
  playerId: string;
  questionId: string | null; // Current question
  questionNumber?: number; // Current question number (1-indexed)
  correctAnswerId?: string | null; // Correct answer ID for validation
  autoReveal?: boolean; // Auto-reveal after submission
  events?: GameAnswerEvents;
  // Point calculation parameters
  questionPoints?: number; // Points for this question (from question.points)
  answeringTime?: number; // Time limit for answering in seconds (from question.answering_time)
  timeBonusEnabled?: boolean; // Whether time bonus is enabled (from game settings)
  streakBonusEnabled?: boolean; // Whether streak bonus is enabled (from game settings)
}

export interface UseGameAnswerReturn {
  // State
  answerStatus: AnswerStatus;
  answerResult: AnswerResult | null;
  answersHistory: Answer[];
  loading: boolean;
  error: string | null;

  // Actions
  submitAnswer: (selectedOption: string, responseTimeMs: number) => Promise<void>;
  clearAnswer: () => void;
  refreshAnswers: () => Promise<void>;

  // Real-time status
  isConnected: boolean;
}

interface AnswerAcceptedEvent {
  roomId: string;
  playerId: string;
  questionId: string;
  submittedAt: string;
}

interface AnswerStatsUpdateEvent {
  roomId: string;
  questionId: string;
  counts: Record<string, number>;
}

interface SocketQuestionStartedEvent {
  roomId: string;
  question: { id: string };
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

export function useGameAnswer(options: UseGameAnswerOptions): UseGameAnswerReturn {
  const {
    gameId,
    playerId,
    questionId,
    questionNumber,
    correctAnswerId,
    autoReveal = false,
    events,
    questionPoints = 100, // Default to 100 if not provided
    answeringTime = 30, // Default to 30 seconds if not provided
    timeBonusEnabled = false,
    streakBonusEnabled = false,
  } = options;
  const { socket, isConnected } = useSocket();

  // State
  const [answerStatus, setAnswerStatus] = useState<AnswerStatus>({
    hasAnswered: false,
    submittedAt: null,
    submittedOption: null,
    isProcessing: false,
  });
  const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null);
  const [answersHistory, setAnswersHistory] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const listenersSetupRef = useRef(false);
  const currentQuestionIdRef = useRef<string | null>(null);
  const submittedOptionRef = useRef<string | null>(null);
  const eventsRef = useRef<GameAnswerEvents | undefined>(events);
  const clearAnswerRef = useRef<(() => void) | undefined>(undefined);
  const refreshAnswersRef = useRef<(() => Promise<void>) | undefined>(undefined);
  const socketRef = useRef(socket);
  const isConnectedRef = useRef(isConnected);

  // ========================================================================
  // REST API OPERATIONS
  // ========================================================================

  /**
   * Submit answer for current question
   */
  const submitAnswer = useCallback(
    async (selectedOption: string, responseTimeMs: number) => {
      if (!gameId || !playerId || !questionId) {
        throw new Error('Missing required parameters for answer submission');
      }

      if (answerStatus.hasAnswered) {
        throw new Error('Answer already submitted for this question');
      }

      if (!questionNumber || questionNumber < 1) {
        throw new Error('Question number is required');
      }

      try {
        setAnswerStatus((prev) => ({ ...prev, isProcessing: true }));
        setError(null);

        // Determine if answer is correct
        const isCorrect = correctAnswerId ? selectedOption === correctAnswerId : false;

        // Convert milliseconds to seconds
        const timeTakenSeconds = responseTimeMs / 1000;

        // Check if answer was submitted in time
        // If timeTaken exceeds answeringTime, it's considered late
        const answeredInTime = timeTakenSeconds <= answeringTime;

        // Get current streak from answer history
        // Streak is the number of consecutive correct answers before this one
        let currentStreak = 0;
        if (answersHistory.length > 0) {
          // Count consecutive correct answers from the end
          for (let i = answersHistory.length - 1; i >= 0; i--) {
            if (answersHistory[i].is_correct) {
              currentStreak++;
            } else {
              break; // Streak broken
            }
          }
        }

        // Calculate points using the point calculation utility
        const pointCalculationResult = calculatePoints({
          basePoints: questionPoints,
          answeringTime,
          isCorrect,
          timeTaken: timeTakenSeconds,
          answeredInTime,
          timeBonusEnabled,
          streakBonusEnabled,
          currentStreak,
        });

        const pointsEarned = pointCalculationResult.points;

        // Submit to API with backend-expected format
        const { data, error: apiError } = await gameApi.submitAnswer(
          gameId,
          playerId,
          questionId,
          questionNumber,
          selectedOption, // answer_id
          isCorrect,
          timeTakenSeconds,
          pointsEarned,
        );

        if (apiError || !data) {
          throw new Error(apiError?.message || 'Failed to submit answer');
        }

        // Extract answer info from response (GamePlayerData contains answer_report)
        const answerReport = data.answer_report;
        const lastAnswer = answerReport?.questions?.[answerReport.questions.length - 1];

        // Update local state
        setAnswerStatus({
          hasAnswered: true,
          submittedAt: new Date(),
          submittedOption: selectedOption,
          isProcessing: false,
        });

        // Create answer result from response
        const answerData: AnswerResult = {
          questionId,
          selectedOption,
          isCorrect: lastAnswer?.is_correct ?? isCorrect,
          pointsEarned: lastAnswer?.points_earned ?? pointsEarned,
          correctAnswer: correctAnswerId || '',
          responseTimeMs,
        };

        setAnswerResult(answerData);

        // Emit WebSocket event
        if (socketRef.current && isConnectedRef.current) {
          socketRef.current.emit('game:answer:submit', {
            roomId: gameId,
            playerId,
            questionId,
            answer: selectedOption,
          });
        }

        eventsRef.current?.onAnswerSubmitted?.({
          questionId,
          selectedOption,
          responseTimeMs,
        });

        // Auto-reveal if enabled
        if (autoReveal) {
          eventsRef.current?.onAnswerResult?.(answerData);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to submit answer';
        setError(errorMessage);
        setAnswerStatus((prev) => ({ ...prev, isProcessing: false }));
        console.error('useGameAnswer: submitAnswer error', err);
        eventsRef.current?.onError?.(errorMessage);
        throw err;
      }
    },
    [
      gameId,
      playerId,
      questionId,
      questionNumber,
      correctAnswerId,
      answerStatus.hasAnswered,
      autoReveal,
      questionPoints,
      answeringTime,
      timeBonusEnabled,
      streakBonusEnabled,
      answersHistory,
    ],
  );

  /**
   * Clear answer state (for new question)
   */
  const clearAnswer = useCallback(() => {
    setAnswerStatus({
      hasAnswered: false,
      submittedAt: null,
      submittedOption: null,
      isProcessing: false,
    });
    setAnswerResult(null);
    setError(null);
  }, []);

  /**
   * Refresh answer history from API
   */
  const refreshAnswers = useCallback(async () => {
    if (!gameId || !playerId) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: apiError } = await gameApi.getPlayerAnswers(gameId, playerId);

      if (apiError || !data) {
        // If endpoint not implemented yet, swallow and continue without blocking gameplay
        if (apiError?.message === 'Route not found') {
          console.warn('useGameAnswer: getPlayerAnswers route not found; skipping history fetch');
          return;
        }
        throw new Error(apiError?.message || 'Failed to fetch answers');
      }

      setAnswersHistory(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch answers';
      setError(errorMessage);
      console.error('useGameAnswer: refreshAnswers error', err);
      eventsRef.current?.onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [gameId, playerId]);

  // Keep refs in sync
  useEffect(() => {
    submittedOptionRef.current = answerStatus.submittedOption;
  }, [answerStatus.submittedOption]);

  useEffect(() => {
    eventsRef.current = events;
  }, [events]);

  useEffect(() => {
    clearAnswerRef.current = clearAnswer;
  }, [clearAnswer]);

  useEffect(() => {
    refreshAnswersRef.current = refreshAnswers;
  }, [refreshAnswers]);

  useEffect(() => {
    socketRef.current = socket;
  }, [socket]);

  useEffect(() => {
    isConnectedRef.current = isConnected;
  }, [isConnected]);

  // ========================================================================
  // WEBSOCKET EVENT HANDLERS
  // ========================================================================

  useEffect(() => {
    if (!socketRef.current || !isConnectedRef.current || !gameId || !playerId) return;
    if (listenersSetupRef.current) return;

    console.log(`useGameAnswer: Setting up WebSocket listeners for player ${playerId}`);
    listenersSetupRef.current = true;

    const currentSocket = socketRef.current;

    // Join game room
    currentSocket.emit('room:join', { roomId: gameId });

    /**
     * Answer confirmation from server
     */
    const handleAnswerAccepted = (data: AnswerAcceptedEvent) => {
      if (data.roomId !== gameId || data.playerId !== playerId) return;

      console.log('useGameAnswer: Answer accepted', data.questionId);
      eventsRef.current?.onAnswerConfirmed?.(data.questionId);
    };

    /**
     * Answer stats update from server (aggregate counts)
     */
    const handleAnswerStatsUpdate = (data: AnswerStatsUpdateEvent) => {
      if (data.roomId !== gameId) return;
      console.log('useGameAnswer: Answer stats update', data);
    };

    /**
     * New question started - clear previous answer
     */
    const handleQuestionStart = (data: SocketQuestionStartedEvent) => {
      if (data.roomId !== gameId) return;

      console.log('useGameAnswer: New question started, clearing answer');
      clearAnswerRef.current?.();
      currentQuestionIdRef.current = data.question.id;
    };

    // Register listeners
    currentSocket.on('game:answer:accepted', handleAnswerAccepted);
    currentSocket.on('game:answer:stats:update', handleAnswerStatsUpdate);
    currentSocket.on('game:question:started', handleQuestionStart);

    return () => {
      console.log(`useGameAnswer: Cleaning up listeners for player ${playerId}`);

      currentSocket.off('game:answer:accepted', handleAnswerAccepted);
      currentSocket.off('game:answer:stats:update', handleAnswerStatsUpdate);
      currentSocket.off('game:question:started', handleQuestionStart);

      currentSocket.emit('room:leave', { roomId: gameId });

      listenersSetupRef.current = false;
    };
  }, [gameId, playerId]);

  // ========================================================================
  // QUESTION CHANGE HANDLING
  // ========================================================================

  /**
   * Clear answer when question changes
   */
  useEffect(() => {
    if (questionId !== currentQuestionIdRef.current) {
      currentQuestionIdRef.current = questionId;
      clearAnswerRef.current?.();
    }
  }, [questionId]);

  // ========================================================================
  // INITIALIZATION
  // ========================================================================

  /**
   * Fetch answer history on mount
   */
  useEffect(() => {
    if (gameId && playerId) {
      refreshAnswersRef.current?.();
    }
  }, [gameId, playerId]);

  // ========================================================================
  // RETURN
  // ========================================================================

  return {
    // State
    answerStatus,
    answerResult,
    answersHistory,
    loading,
    error,

    // Actions
    submitAnswer,
    clearAnswer,
    refreshAnswers,

    // Real-time status
    isConnected,
  };
}
