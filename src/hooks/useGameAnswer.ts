/**
 * useGameAnswer Hook
 * Handles answer submission, validation, and real-time answer feedback
 * Tracks player answer status and manages answer reveal events
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from '@/components/providers/SocketProvider';
import { gameApi, type Answer } from '@/services/gameApi';

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
  autoReveal?: boolean; // Auto-reveal after submission
  events?: GameAnswerEvents;
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
  const { gameId, playerId, questionId, autoReveal = false, events } = options;
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

      try {
        setAnswerStatus((prev) => ({ ...prev, isProcessing: true }));
        setError(null);

        // Submit to API
        const { data, error: apiError } = await gameApi.submitAnswer(
          gameId,
          playerId,
          questionId,
          selectedOption,
          responseTimeMs,
        );

        if (apiError || !data) {
          throw new Error(apiError?.message || 'Failed to submit answer');
        }

        // Update local state
        setAnswerStatus({
          hasAnswered: true,
          submittedAt: new Date(),
          submittedOption: selectedOption,
          isProcessing: false,
        });

        // Add to history
        setAnswersHistory((prev) => [...prev, data]);

        // Emit WebSocket event
        if (socket && isConnected) {
          socket.emit('game:answer:submit', {
            roomId: gameId,
            playerId,
            questionId,
            answer: selectedOption,
          });
        }

        events?.onAnswerSubmitted?.({
          questionId,
          selectedOption,
          responseTimeMs,
        });

        // Auto-reveal if enabled and answer is processed
        if (autoReveal && data.is_correct !== null) {
          setAnswerResult({
            questionId,
            selectedOption,
            isCorrect: data.is_correct,
            pointsEarned: data.points_earned,
            correctAnswer: '', // Will be filled by reveal event
            responseTimeMs,
          });
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to submit answer';
        setError(errorMessage);
        setAnswerStatus((prev) => ({ ...prev, isProcessing: false }));
        console.error('useGameAnswer: submitAnswer error', err);
        events?.onError?.(errorMessage);
        throw err;
      }
    },
    [
      gameId,
      playerId,
      questionId,
      answerStatus.hasAnswered,
      socket,
      isConnected,
      autoReveal,
      events,
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
        throw new Error(apiError?.message || 'Failed to fetch answers');
      }

      setAnswersHistory(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch answers';
      setError(errorMessage);
      console.error('useGameAnswer: refreshAnswers error', err);
      events?.onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [gameId, playerId, events]);

  useEffect(() => {
    submittedOptionRef.current = answerStatus.submittedOption;
  }, [answerStatus.submittedOption]);

  // ========================================================================
  // WEBSOCKET EVENT HANDLERS
  // ========================================================================

  useEffect(() => {
    if (!socket || !isConnected || !gameId || !playerId) return;
    if (listenersSetupRef.current) return;

    console.log(`useGameAnswer: Setting up WebSocket listeners for player ${playerId}`);
    listenersSetupRef.current = true;

    // Join game room
    socket.emit('room:join', { roomId: gameId });

    /**
     * Answer confirmation from server
     */
    const handleAnswerAccepted = (data: AnswerAcceptedEvent) => {
      if (data.roomId !== gameId || data.playerId !== playerId) return;

      console.log('useGameAnswer: Answer accepted', data.questionId);
      events?.onAnswerConfirmed?.(data.questionId);
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
      clearAnswer();
      currentQuestionIdRef.current = data.question.id;
    };

    // Register listeners
    socket.on('game:answer:accepted', handleAnswerAccepted);
    socket.on('game:answer:stats:update', handleAnswerStatsUpdate);
    socket.on('game:question:started', handleQuestionStart);

    return () => {
      console.log(`useGameAnswer: Cleaning up listeners for player ${playerId}`);

      socket.off('game:answer:accepted', handleAnswerAccepted);
      socket.off('game:answer:stats:update', handleAnswerStatsUpdate);
      socket.off('game:question:started', handleQuestionStart);

      socket.emit('room:leave', { roomId: gameId });

      listenersSetupRef.current = false;
    };
  }, [socket, isConnected, gameId, playerId, clearAnswer, events]);

  // ========================================================================
  // QUESTION CHANGE HANDLING
  // ========================================================================

  /**
   * Clear answer when question changes
   */
  useEffect(() => {
    if (questionId !== currentQuestionIdRef.current) {
      currentQuestionIdRef.current = questionId;
      clearAnswer();
    }
  }, [questionId, clearAnswer]);

  // ========================================================================
  // INITIALIZATION
  // ========================================================================

  /**
   * Fetch answer history on mount
   */
  useEffect(() => {
    if (gameId && playerId) {
      refreshAnswers();
    }
  }, [gameId, playerId, refreshAnswers]);

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
