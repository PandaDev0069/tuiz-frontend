// ====================================================
// File Name   : useGameAnswer.ts
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-12-11
// Last Update : 2025-12-28
//
// Description:
// - Handles answer submission, validation, and real-time answer feedback
// - Tracks player answer status and manages answer reveal events
// - Calculates points based on correctness, time, and streak bonuses
// - Manages answer history for streak tracking
//
// Notes:
// - Uses WebSocket for real-time answer confirmation
// - Implements point calculation with time and streak bonuses
// - Handles duplicate submission prevention
// - Supports auto-reveal functionality
// ====================================================

'use client';

//----------------------------------------------------
// 1. Imports / Dependencies
//----------------------------------------------------
import { useState, useEffect, useCallback, useRef } from 'react';

import { useSocket } from '@/components/providers/SocketProvider';
import { gameApi, type Answer } from '@/services/gameApi';
import { calculatePoints } from '@/lib/pointCalculation';

//----------------------------------------------------
// 2. Constants / Configuration
//----------------------------------------------------
const DEFAULT_QUESTION_POINTS = 100;
const DEFAULT_ANSWERING_TIME_SECONDS = 30;
const DEFAULT_AUTO_REVEAL = false;
const TIME_TOLERANCE_MULTIPLIER = 1.1;
const MILLISECONDS_TO_SECONDS = 1000;
const MIN_QUESTION_NUMBER = 1;

const SOCKET_EVENTS = {
  ANSWER_SUBMIT: 'game:answer:submit',
  ANSWER_ACCEPTED: 'game:answer:accepted',
  ANSWER_STATS_UPDATE: 'game:answer:stats:update',
  ANSWER_STATS: 'game:answer:stats',
  QUESTION_STARTED: 'game:question:started',
  ROOM_JOIN: 'room:join',
  ROOM_LEAVE: 'room:leave',
} as const;

const ERROR_MESSAGES = {
  MISSING_REQUIRED_PARAMETERS: 'Missing required parameters for answer submission',
  ANSWER_ALREADY_SUBMITTED: 'Answer already submitted for this question',
  QUESTION_NUMBER_REQUIRED: 'Question number is required',
  FAILED_TO_SUBMIT_ANSWER: 'Failed to submit answer',
  FAILED_TO_FETCH_ANSWERS: 'Failed to fetch answers',
  ROUTE_NOT_FOUND: 'Route not found',
} as const;

//----------------------------------------------------
// 3. Types / Interfaces
//----------------------------------------------------
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
  questionId: string | null;
  questionNumber?: number;
  correctAnswerId?: string | null;
  autoReveal?: boolean;
  events?: GameAnswerEvents;
  questionPoints?: number;
  answeringTime?: number;
  timeBonusEnabled?: boolean;
  streakBonusEnabled?: boolean;
}

export interface UseGameAnswerReturn {
  answerStatus: AnswerStatus;
  answerResult: AnswerResult | null;
  answersHistory: Answer[];
  loading: boolean;
  error: string | null;
  submitAnswer: (selectedOption: string | null, responseTimeMs: number) => Promise<void>;
  clearAnswer: () => void;
  refreshAnswers: () => Promise<void>;
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

//----------------------------------------------------
// 4. Core Logic
//----------------------------------------------------

//----------------------------------------------------
// 5. Helper Functions
//----------------------------------------------------
/**
 * Function: calculateCurrentStreak
 * Description:
 * - Calculates the current streak of consecutive correct answers
 * - Counts backwards from the end of answer history
 *
 * Parameters:
 * - answersHistory (Answer[]): Array of previous answers
 *
 * Returns:
 * - number: Current streak count (0 if no streak)
 */
function calculateCurrentStreak(answersHistory: Answer[]): number {
  if (answersHistory.length === 0) return 0;

  let streak = 0;
  for (let i = answersHistory.length - 1; i >= 0; i--) {
    if (answersHistory[i].is_correct) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

/**
 * Function: validateAnswerTime
 * Description:
 * - Validates if answer was submitted within valid time window
 * - Uses tolerance multiplier for edge cases
 *
 * Parameters:
 * - timeTakenSeconds (number): Time taken to answer in seconds
 * - answeringTime (number): Allowed answering time in seconds
 *
 * Returns:
 * - Object containing:
 *   - isValid (boolean): Whether time is within valid window
 *   - answeredInTime (boolean): Whether answer was submitted in time (for points)
 */
function validateAnswerTime(
  timeTakenSeconds: number,
  answeringTime: number,
): { isValid: boolean; answeredInTime: boolean } {
  const answeringTimeWithTolerance = answeringTime * TIME_TOLERANCE_MULTIPLIER;
  const isValid = timeTakenSeconds >= 0 && timeTakenSeconds <= answeringTimeWithTolerance;
  const answeredInTime = timeTakenSeconds <= answeringTime;
  return { isValid, answeredInTime };
}

/**
 * Function: createAnswerFromResponse
 * Description:
 * - Creates Answer object from API response and submission data
 *
 * Parameters:
 * - questionId (string): Question ID
 * - gameId (string): Game ID
 * - playerId (string): Player ID
 * - selectedOption (string): Selected answer option
 * - isCorrect (boolean): Whether answer is correct
 * - pointsEarned (number): Points earned for this answer
 * - responseTimeMs (number): Response time in milliseconds
 *
 * Returns:
 * - Answer: Answer object for history
 */
function createAnswerFromResponse(
  questionId: string,
  gameId: string,
  playerId: string,
  selectedOption: string,
  isCorrect: boolean,
  pointsEarned: number,
  responseTimeMs: number,
): Answer {
  return {
    id: `temp-${questionId}-${Date.now()}`,
    game_id: gameId,
    player_id: playerId,
    question_id: questionId,
    selected_option: selectedOption,
    is_correct: isCorrect,
    response_time_ms: responseTimeMs,
    points_earned: pointsEarned,
    answered_at: new Date().toISOString(),
  };
}

/**
 * Function: createAnswerResult
 * Description:
 * - Creates AnswerResult object from submission and response data
 *
 * Parameters:
 * - questionId (string): Question ID
 * - selectedOption (string): Selected answer option
 * - isCorrect (boolean): Whether answer is correct
 * - pointsEarned (number): Points earned
 * - correctAnswerId (string | null): Correct answer ID
 * - responseTimeMs (number): Response time in milliseconds
 *
 * Returns:
 * - AnswerResult: Answer result object
 */
function createAnswerResult(
  questionId: string,
  selectedOption: string,
  isCorrect: boolean,
  pointsEarned: number,
  correctAnswerId: string | null,
  responseTimeMs: number,
): AnswerResult {
  return {
    questionId,
    selectedOption,
    isCorrect,
    pointsEarned,
    correctAnswer: correctAnswerId || '',
    responseTimeMs,
  };
}

/**
 * Function: isAlreadyAnsweredError
 * Description:
 * - Checks if error message indicates answer was already submitted
 *
 * Parameters:
 * - errorMessage (string): Error message to check
 *
 * Returns:
 * - boolean: True if error indicates already answered
 */
function isAlreadyAnsweredError(errorMessage: string): boolean {
  return errorMessage.includes('already') || errorMessage.includes('Already');
}

/**
 * Hook: useGameAnswer
 * Description:
 * - Manages answer submission, validation, and real-time feedback
 * - Tracks answer status and history for streak calculation
 * - Handles WebSocket events for answer confirmation
 * - Calculates points with time and streak bonuses
 *
 * Parameters:
 * - options (UseGameAnswerOptions): Configuration options for the hook
 *
 * Returns:
 * - UseGameAnswerReturn: Object containing answer state and submission functions
 */
export function useGameAnswer(options: UseGameAnswerOptions): UseGameAnswerReturn {
  const {
    gameId,
    playerId,
    questionId,
    questionNumber,
    correctAnswerId,
    autoReveal = DEFAULT_AUTO_REVEAL,
    events,
    questionPoints = DEFAULT_QUESTION_POINTS,
    answeringTime = DEFAULT_ANSWERING_TIME_SECONDS,
    timeBonusEnabled = false,
    streakBonusEnabled = false,
  } = options;
  const { socket, isConnected } = useSocket();

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

  const listenersSetupRef = useRef(false);
  const currentQuestionIdRef = useRef<string | null>(null);
  const submittedOptionRef = useRef<string | null>(null);
  const eventsRef = useRef<GameAnswerEvents | undefined>(events);
  const clearAnswerRef = useRef<(() => void) | undefined>(undefined);
  const refreshAnswersRef = useRef<(() => Promise<void>) | undefined>(undefined);
  const socketRef = useRef(socket);
  const isConnectedRef = useRef(isConnected);
  const isSubmittingRef = useRef(false);
  const hasAnsweredRef = useRef(false);

  const submitAnswer = useCallback(
    async (selectedOption: string | null, responseTimeMs: number) => {
      if (!gameId || !playerId || !questionId) {
        throw new Error(ERROR_MESSAGES.MISSING_REQUIRED_PARAMETERS);
      }

      if (hasAnsweredRef.current || isSubmittingRef.current) {
        throw new Error(ERROR_MESSAGES.ANSWER_ALREADY_SUBMITTED);
      }

      if (!questionNumber || questionNumber < MIN_QUESTION_NUMBER) {
        throw new Error(ERROR_MESSAGES.QUESTION_NUMBER_REQUIRED);
      }

      try {
        isSubmittingRef.current = true;
        setAnswerStatus((prev) => ({ ...prev, isProcessing: true }));
        setError(null);

        const isCorrect =
          correctAnswerId && selectedOption ? selectedOption === correctAnswerId : false;

        const timeTakenSeconds = responseTimeMs / MILLISECONDS_TO_SECONDS;
        const { answeredInTime } = validateAnswerTime(timeTakenSeconds, answeringTime);

        const currentStreak = calculateCurrentStreak(answersHistory);

        const pointCalculationResult = calculatePoints({
          basePoints: questionPoints,
          answeringTime,
          isCorrect,
          timeTaken: timeTakenSeconds,
          answeredInTime,
          timeBonusEnabled,
          streakBonusEnabled,
          currentStreak: isCorrect ? currentStreak + 1 : 0,
        });

        const pointsEarned = pointCalculationResult.points;

        const { data, error: apiError } = await gameApi.submitAnswer(
          gameId,
          playerId,
          questionId,
          questionNumber,
          selectedOption,
          isCorrect,
          timeTakenSeconds,
          pointsEarned,
        );

        if (apiError || !data) {
          const errorMsg =
            apiError?.message || apiError?.error || ERROR_MESSAGES.FAILED_TO_SUBMIT_ANSWER;
          throw new Error(errorMsg);
        }

        const answerReport = data.answer_report;
        const lastAnswer = answerReport?.questions?.[answerReport.questions.length - 1];

        hasAnsweredRef.current = true;
        isSubmittingRef.current = false;
        setAnswerStatus({
          hasAnswered: true,
          submittedAt: new Date(),
          submittedOption: selectedOption,
          isProcessing: false,
        });

        const safeSelectedOption = selectedOption ?? '';
        const finalIsCorrect = lastAnswer?.is_correct ?? isCorrect;
        const finalPointsEarned = lastAnswer?.points_earned ?? pointsEarned;

        const answerData = createAnswerResult(
          questionId,
          safeSelectedOption,
          finalIsCorrect,
          finalPointsEarned,
          correctAnswerId ?? null,
          responseTimeMs,
        );

        setAnswerResult(answerData);

        const newAnswer = createAnswerFromResponse(
          questionId,
          gameId,
          playerId,
          safeSelectedOption,
          finalIsCorrect,
          finalPointsEarned,
          responseTimeMs,
        );

        setAnswersHistory((prev) => {
          if (prev.some((a) => a.question_id === questionId)) return prev;
          return [...prev, newAnswer];
        });

        if (socketRef.current && isConnectedRef.current) {
          socketRef.current.emit(SOCKET_EVENTS.ANSWER_SUBMIT, {
            roomId: gameId,
            playerId,
            questionId,
            answer: safeSelectedOption,
          });
        }

        eventsRef.current?.onAnswerSubmitted?.({
          questionId,
          selectedOption: safeSelectedOption,
          responseTimeMs,
        });

        if (autoReveal) {
          eventsRef.current?.onAnswerResult?.(answerData);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : ERROR_MESSAGES.FAILED_TO_SUBMIT_ANSWER;
        const isAlreadyAnswered = isAlreadyAnsweredError(errorMessage);

        if (!isAlreadyAnswered) {
          isSubmittingRef.current = false;
        } else {
          hasAnsweredRef.current = true;
        }

        setError(errorMessage);
        setAnswerStatus((prev) => ({ ...prev, isProcessing: false }));
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
      autoReveal,
      questionPoints,
      answeringTime,
      timeBonusEnabled,
      streakBonusEnabled,
      answersHistory,
    ],
  );

  const clearAnswer = useCallback(() => {
    hasAnsweredRef.current = false;
    isSubmittingRef.current = false;
    setAnswerStatus({
      hasAnswered: false,
      submittedAt: null,
      submittedOption: null,
      isProcessing: false,
    });
    setAnswerResult(null);
    setError(null);
  }, []);

  const refreshAnswers = useCallback(async () => {
    if (!gameId || !playerId) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: apiError } = await gameApi.getPlayerAnswers(gameId, playerId);

      if (apiError || !data) {
        if (apiError?.message === ERROR_MESSAGES.ROUTE_NOT_FOUND) {
          return;
        }
        throw new Error(apiError?.message || ERROR_MESSAGES.FAILED_TO_FETCH_ANSWERS);
      }

      setAnswersHistory(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : ERROR_MESSAGES.FAILED_TO_FETCH_ANSWERS;
      setError(errorMessage);
      eventsRef.current?.onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [gameId, playerId]);

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

  useEffect(() => {
    if (!socketRef.current || !isConnectedRef.current || !gameId || !playerId) return;
    if (listenersSetupRef.current) return;

    listenersSetupRef.current = true;

    const currentSocket = socketRef.current;
    currentSocket.emit(SOCKET_EVENTS.ROOM_JOIN, { roomId: gameId });

    const handleAnswerAccepted = (data: AnswerAcceptedEvent) => {
      if (data.roomId !== gameId || data.playerId !== playerId) return;
      eventsRef.current?.onAnswerConfirmed?.(data.questionId);
    };

    const handleAnswerStatsUpdate = (data: AnswerStatsUpdateEvent) => {
      if (data.roomId !== gameId) return;
    };

    const handleQuestionStart = (data: SocketQuestionStartedEvent) => {
      if (data.roomId !== gameId) return;
      clearAnswerRef.current?.();
      currentQuestionIdRef.current = data.question.id;
    };

    currentSocket.on(SOCKET_EVENTS.ANSWER_ACCEPTED, handleAnswerAccepted);
    currentSocket.on(SOCKET_EVENTS.ANSWER_STATS_UPDATE, handleAnswerStatsUpdate);
    currentSocket.on(SOCKET_EVENTS.ANSWER_STATS, handleAnswerStatsUpdate);
    currentSocket.on(SOCKET_EVENTS.QUESTION_STARTED, handleQuestionStart);

    return () => {
      currentSocket.off(SOCKET_EVENTS.ANSWER_ACCEPTED, handleAnswerAccepted);
      currentSocket.off(SOCKET_EVENTS.ANSWER_STATS_UPDATE, handleAnswerStatsUpdate);
      currentSocket.off(SOCKET_EVENTS.ANSWER_STATS, handleAnswerStatsUpdate);
      currentSocket.off(SOCKET_EVENTS.QUESTION_STARTED, handleQuestionStart);

      currentSocket.emit(SOCKET_EVENTS.ROOM_LEAVE, { roomId: gameId });
      listenersSetupRef.current = false;
    };
  }, [gameId, playerId]);

  useEffect(() => {
    if (questionId !== currentQuestionIdRef.current) {
      currentQuestionIdRef.current = questionId;
      clearAnswerRef.current?.();
    }
  }, [questionId]);

  useEffect(() => {
    if (gameId && playerId) {
      refreshAnswersRef.current?.();
    }
  }, [gameId, playerId]);

  return {
    answerStatus,
    answerResult,
    answersHistory,
    loading,
    error,
    submitAnswer,
    clearAnswer,
    refreshAnswers,
    isConnected,
  };
}

//----------------------------------------------------
// 6. Export
//----------------------------------------------------
