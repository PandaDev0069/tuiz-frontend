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
 * Function: validateSubmissionParams
 * Description:
 * - Validates all required parameters for answer submission
 *
 * Parameters:
 * - gameId (string | null): Game ID
 * - playerId (string | null): Player ID
 * - questionId (string | null): Question ID
 * - questionNumber (number | undefined): Question number
 * - hasAnswered (boolean): Whether answer was already submitted
 * - isSubmitting (boolean): Whether answer is currently being submitted
 *
 * @throws {Error} If validation fails
 */
function validateSubmissionParams(
  gameId: string | null,
  playerId: string | null,
  questionId: string | null,
  questionNumber: number | undefined,
  hasAnswered: boolean,
  isSubmitting: boolean,
): void {
  if (!gameId || !playerId || !questionId) {
    throw new Error(ERROR_MESSAGES.MISSING_REQUIRED_PARAMETERS);
  }

  if (hasAnswered || isSubmitting) {
    throw new Error(ERROR_MESSAGES.ANSWER_ALREADY_SUBMITTED);
  }

  if (!questionNumber || questionNumber < MIN_QUESTION_NUMBER) {
    throw new Error(ERROR_MESSAGES.QUESTION_NUMBER_REQUIRED);
  }
}

/**
 * Function: calculateAnswerMetrics
 * Description:
 * - Calculates answer correctness, time validation, streak, and points
 *
 * Parameters:
 * - selectedOption (string | null): Selected answer option
 * - correctAnswerId (string | null | undefined): Correct answer ID
 * - responseTimeMs (number): Response time in milliseconds
 * - answeringTime (number): Allowed answering time in seconds
 * - answersHistory (Answer[]): Previous answers for streak calculation
 * - questionPoints (number): Base points for the question
 * - timeBonusEnabled (boolean): Whether time bonus is enabled
 * - streakBonusEnabled (boolean): Whether streak bonus is enabled
 *
 * Returns:
 * - Object containing:
 *   - isCorrect (boolean): Whether answer is correct
 *   - timeTakenSeconds (number): Time taken in seconds
 *   - answeredInTime (boolean): Whether answered within time limit
 *   - pointsEarned (number): Points earned for this answer
 */
function calculateAnswerMetrics(
  selectedOption: string | null,
  correctAnswerId: string | null | undefined,
  responseTimeMs: number,
  answeringTime: number,
  answersHistory: Answer[],
  questionPoints: number,
  timeBonusEnabled: boolean,
  streakBonusEnabled: boolean,
): {
  isCorrect: boolean;
  timeTakenSeconds: number;
  answeredInTime: boolean;
  pointsEarned: number;
} {
  const isCorrect = correctAnswerId && selectedOption ? selectedOption === correctAnswerId : false;

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

  return {
    isCorrect,
    timeTakenSeconds,
    answeredInTime,
    pointsEarned: pointCalculationResult.points,
  };
}

/**
 * Function: submitAnswerToApi
 * Description:
 * - Submits answer to the API and handles response
 *
 * Parameters:
 * - gameId (string): Game ID
 * - playerId (string): Player ID
 * - questionId (string): Question ID
 * - questionNumber (number): Question number
 * - selectedOption (string | null): Selected answer option
 * - isCorrect (boolean): Whether answer is correct
 * - timeTakenSeconds (number): Time taken in seconds
 * - pointsEarned (number): Points earned
 *
 * Returns:
 * - Object containing API response data
 *
 * @throws {Error} If API submission fails
 */
async function submitAnswerToApi(
  gameId: string,
  playerId: string,
  questionId: string,
  questionNumber: number,
  selectedOption: string | null,
  isCorrect: boolean,
  timeTakenSeconds: number,
  pointsEarned: number,
) {
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

  // Handle 409 Conflict (answer already submitted) - this is expected, don't throw error
  if (apiError && (apiError.statusCode === 409 || apiError.error === 'answer_already_submitted')) {
    // Return a special marker that answer was already submitted
    throw new Error(ERROR_MESSAGES.ANSWER_ALREADY_SUBMITTED);
  }

  if (apiError || !data) {
    const errorMsg = apiError?.message || apiError?.error || ERROR_MESSAGES.FAILED_TO_SUBMIT_ANSWER;
    throw new Error(errorMsg);
  }

  return data;
}

/**
 * Function: processAnswerResponse
 * Description:
 * - Processes API response and updates state with answer data
 *
 * Parameters:
 * - questionId (string): Question ID
 * - gameId (string): Game ID
 * - playerId (string): Player ID
 * - selectedOption (string | null): Selected answer option
 * - isCorrect (boolean): Whether answer is correct
 * - pointsEarned (number): Points earned
 * - apiResponse (unknown): API response data
 * - correctAnswerId (string | null | undefined): Correct answer ID
 * - responseTimeMs (number): Response time in milliseconds
 * - setAnswerStatus (function): Function to update answer status
 * - setAnswerResult (function): Function to set answer result
 * - setAnswersHistory (function): Function to update answers history
 *
 * Returns:
 * - Object containing:
 *   - answerData (AnswerResult): Answer result data
 *   - safeSelectedOption (string): Safe selected option string
 */
function processAnswerResponse(
  questionId: string,
  gameId: string,
  playerId: string,
  selectedOption: string | null,
  isCorrect: boolean,
  pointsEarned: number,
  apiResponse: unknown,
  correctAnswerId: string | null | undefined,
  responseTimeMs: number,
  setAnswerStatus: React.Dispatch<React.SetStateAction<AnswerStatus>>,
  setAnswerResult: React.Dispatch<React.SetStateAction<AnswerResult | null>>,
  setAnswersHistory: React.Dispatch<React.SetStateAction<Answer[]>>,
): { answerData: AnswerResult; safeSelectedOption: string } {
  const answerReport = (apiResponse as { answer_report?: { questions?: Answer[] } })?.answer_report;
  const lastAnswer = answerReport?.questions?.[answerReport.questions.length - 1];

  const safeSelectedOption = selectedOption ?? '';
  const finalIsCorrect = lastAnswer?.is_correct ?? isCorrect;
  const finalPointsEarned = lastAnswer?.points_earned ?? pointsEarned;

  setAnswerStatus({
    hasAnswered: true,
    submittedAt: new Date(),
    submittedOption: selectedOption,
    isProcessing: false,
  });

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

  return { answerData, safeSelectedOption };
}

/**
 * Function: notifyAnswerSubmission
 * Description:
 * - Emits socket events and triggers callbacks for answer submission
 *
 * Parameters:
 * - gameId (string): Game ID
 * - playerId (string): Player ID
 * - questionId (string): Question ID
 * - safeSelectedOption (string): Selected answer option
 * - responseTimeMs (number): Response time in milliseconds
 * - answerData (AnswerResult): Answer result data
 * - autoReveal (boolean): Whether to auto-reveal answer
 * - socket (unknown): Socket instance
 * - isConnected (boolean): Whether socket is connected
 * - events (GameAnswerEvents | undefined): Event callbacks
 */
function notifyAnswerSubmission(
  gameId: string,
  playerId: string,
  questionId: string,
  safeSelectedOption: string,
  responseTimeMs: number,
  answerData: AnswerResult,
  autoReveal: boolean,
  socket: unknown,
  isConnected: boolean,
  events: GameAnswerEvents | undefined,
): void {
  if (socket && isConnected && typeof (socket as { emit: unknown }).emit === 'function') {
    (socket as { emit: (event: string, data: unknown) => void }).emit(SOCKET_EVENTS.ANSWER_SUBMIT, {
      roomId: gameId,
      playerId,
      questionId,
      answer: safeSelectedOption,
    });
  }

  events?.onAnswerSubmitted?.({
    questionId,
    selectedOption: safeSelectedOption,
    responseTimeMs,
  });

  if (autoReveal) {
    events?.onAnswerResult?.(answerData);
  }
}

/**
 * Function: handleSubmissionError
 * Description:
 * - Handles errors during answer submission
 *
 * Parameters:
 * - error (unknown): Error object
 * - setError (function): Function to set error state
 * - setAnswerStatus (function): Function to update answer status
 * - isSubmittingRef (React.MutableRefObject<boolean>): Ref for submission state
 * - hasAnsweredRef (React.MutableRefObject<boolean>): Ref for answered state
 * - events (GameAnswerEvents | undefined): Event callbacks
 */
function handleSubmissionError(
  error: unknown,
  setError: React.Dispatch<React.SetStateAction<string | null>>,
  setAnswerStatus: React.Dispatch<React.SetStateAction<AnswerStatus>>,
  isSubmittingRef: React.MutableRefObject<boolean>,
  hasAnsweredRef: React.MutableRefObject<boolean>,
  events: GameAnswerEvents | undefined,
): void {
  const errorMessage =
    error instanceof Error ? error.message : ERROR_MESSAGES.FAILED_TO_SUBMIT_ANSWER;
  const isAlreadyAnswered = isAlreadyAnsweredError(errorMessage);

  if (!isAlreadyAnswered) {
    isSubmittingRef.current = false;
  } else {
    hasAnsweredRef.current = true;
  }

  setError(errorMessage);
  setAnswerStatus((prev) => ({ ...prev, isProcessing: false }));
  events?.onError?.(errorMessage);
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
      validateSubmissionParams(
        gameId,
        playerId,
        questionId,
        questionNumber,
        hasAnsweredRef.current,
        isSubmittingRef.current,
      );

      try {
        isSubmittingRef.current = true;
        setAnswerStatus((prev) => ({ ...prev, isProcessing: true }));
        setError(null);

        const { isCorrect, timeTakenSeconds, pointsEarned } = calculateAnswerMetrics(
          selectedOption,
          correctAnswerId,
          responseTimeMs,
          answeringTime,
          answersHistory,
          questionPoints,
          timeBonusEnabled,
          streakBonusEnabled,
        );

        const apiResponse = await submitAnswerToApi(
          gameId!,
          playerId!,
          questionId!,
          questionNumber!,
          selectedOption,
          isCorrect,
          timeTakenSeconds,
          pointsEarned,
        );

        hasAnsweredRef.current = true;
        isSubmittingRef.current = false;

        const { answerData, safeSelectedOption } = processAnswerResponse(
          questionId!,
          gameId!,
          playerId!,
          selectedOption,
          isCorrect,
          pointsEarned,
          apiResponse,
          correctAnswerId,
          responseTimeMs,
          setAnswerStatus,
          setAnswerResult,
          setAnswersHistory,
        );

        notifyAnswerSubmission(
          gameId!,
          playerId!,
          questionId!,
          safeSelectedOption,
          responseTimeMs,
          answerData,
          autoReveal,
          socketRef.current,
          isConnectedRef.current,
          eventsRef.current,
        );
      } catch (err) {
        handleSubmissionError(
          err,
          setError,
          setAnswerStatus,
          isSubmittingRef,
          hasAnsweredRef,
          eventsRef.current,
        );
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

  // Track if we've already attempted to fetch answers to prevent duplicate calls
  const hasFetchedAnswersRef = useRef(false);
  const lastFetchKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!gameId || !playerId) {
      hasFetchedAnswersRef.current = false;
      lastFetchKeyRef.current = null;
      return;
    }

    // Create a unique key for this gameId+playerId combination
    const fetchKey = `${gameId}:${playerId}`;

    // Skip if we've already fetched for this combination
    if (lastFetchKeyRef.current === fetchKey && hasFetchedAnswersRef.current) {
      return;
    }

    lastFetchKeyRef.current = fetchKey;
    hasFetchedAnswersRef.current = true;
    refreshAnswersRef.current?.();
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
