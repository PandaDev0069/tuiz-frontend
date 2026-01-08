// ====================================================
// File Name   : page.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-12-12
// Last Update : 2026-01-01
//
// Description:
// - Player game interface for participating in live quiz games
// - Real-time synchronization with host via WebSocket
// - Handles all game phases: countdown, question, answering, reveal, leaderboard, explanation, podium
// - Manages timers, answer submission, and phase transitions
//
// Notes:
// - Uses WebSocket for real-time updates from host
// - Complex timer management for question and answering phases
// - Auto-submits answers when timer expires
// - Prevents phase downgrades from host events
// ====================================================

'use client';

//----------------------------------------------------
// 1. React & Next.js Imports
//----------------------------------------------------
import React, { Suspense, useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

//----------------------------------------------------
// 2. External Library Imports
//----------------------------------------------------
import { toast } from 'react-hot-toast';

//----------------------------------------------------
// 3. Internal Component Imports
//----------------------------------------------------
import {
  PlayerCountdownScreen,
  PlayerAnswerScreen,
  PlayerAnswerRevealScreen,
  PlayerLeaderboardScreen,
  PlayerExplanationScreen,
  PlayerPodiumScreen,
  PlayerGameEndScreen,
  PlayerQuestionScreen,
} from '@/components/game';

//----------------------------------------------------
// 4. Service & Hook Imports
//----------------------------------------------------
import { useGameFlow } from '@/hooks/useGameFlow';
import { useGameAnswer } from '@/hooks/useGameAnswer';
import { useGameLeaderboard } from '@/hooks/useGameLeaderboard';
import { useDeviceId } from '@/hooks/useDeviceId';
import { useSocket } from '@/components/providers/SocketProvider';
import { gameApi } from '@/services/gameApi';
import { quizService } from '@/lib/quizService';
import { apiClient } from '@/lib/apiClient';

//----------------------------------------------------
// 5. Type Imports
//----------------------------------------------------
import type { Question, AnswerResult, LeaderboardEntry } from '@/types/game';
import type { QuestionWithAnswers } from '@/types/quiz';

//----------------------------------------------------
// 6. Constants / Configuration
//----------------------------------------------------
const DEFAULT_TOTAL_QUESTIONS = 10;
const DEFAULT_QUESTION_INDEX = 0;
const DEFAULT_PHASE: PlayerPhase = 'countdown';
const DEFAULT_PLACEHOLDER_QUESTION_ID = 'placeholder-q1';
const DEFAULT_ANONYMOUS_PLAYER = 'anonymous-player';

const COUNTDOWN_TIME_SECONDS = 3;
const QUESTION_REFRESH_INTERVAL_MS = 5000;
const SOCKET_CHECK_INTERVAL_MS = 50;
const CONNECTION_CHECK_INTERVAL_MS = 100;
const CONNECTION_CHECK_TIMEOUT_MS = 5000;
const PLAYER_KICKED_DELAY_MS = 2000;
const TOAST_DURATION_MS = 5000;
const ANSWER_REVEAL_TIME_LIMIT_SECONDS = 10;
const LEADERBOARD_TIME_LIMIT_SECONDS = 10;
const DEFAULT_EXPLANATION_TIME_SECONDS = 10;

const DEFAULT_SHOW_QUESTION_TIME_SECONDS = 10;
const DEFAULT_ANSWERING_TIME_SECONDS = 30;
const DEFAULT_POINTS = 100;
const DEFAULT_MIN_TIME_LIMIT_SECONDS = 5;
const DEFAULT_FALLBACK_TIME_MS = 10000;

const TIMER_DECREMENT_INTERVAL_MS = 1000;
const TIMER_SYNC_THRESHOLD_MS = 2000;
const MS_PER_SECOND = 1000;
const RADIX_DECIMAL = 10;

const MOBILE_BREAKPOINT_PX = 768;
const ANIMATION_DELAY_1 = '0.2s';
const ANIMATION_DELAY_2 = '0.4s';

const PHASE_PRIORITY: Record<PlayerPhase, number> = {
  waiting: 0,
  countdown: 1,
  question: 2,
  answering: 3,
  answer_reveal: 4,
  leaderboard: 5,
  explanation: 6,
  podium: 7,
  ended: 8,
} as const;

const ANSWER_LETTERS = ['A', 'B', 'C', 'D'] as const;

//----------------------------------------------------
// 7. Query Client Instance
//----------------------------------------------------
// (Not needed - using hooks)

//----------------------------------------------------
// 8. Types / Interfaces
//----------------------------------------------------
type PlayerPhase =
  | 'waiting'
  | 'countdown'
  | 'question'
  | 'answering'
  | 'answer_reveal'
  | 'leaderboard'
  | 'explanation'
  | 'podium'
  | 'ended';

interface ExplanationData {
  title: string | null;
  text: string | null;
  image_url: string | null;
  show_time: number;
}

interface CurrentQuestionData {
  question: Question;
  serverTime: string | null;
  isActive: boolean;
  points: number;
  timeLimit: number;
  answeringTime?: number;
  showExplanationTime?: number;
  totalQuestions?: number;
}

interface StatsUpdateData {
  roomId: string;
  questionId: string;
  counts: Record<string, number>;
}

interface AnswerLockedData {
  roomId: string;
  questionId: string;
  counts?: Record<string, number>;
}

interface PhaseChangeData {
  roomId: string;
  phase: PlayerPhase;
  startedAt?: number;
}

interface GameEventData {
  gameId?: string;
  roomId?: string;
  roomCode?: string;
  timestamp?: string;
}

interface PlayerKickedData {
  player_id: string;
  player_name: string;
  game_id: string;
  kicked_by: string;
  timestamp: string;
}

//----------------------------------------------------
// 9. Helper Components
//----------------------------------------------------
/**
 * Component: LoadingScreen
 * Description:
 * - Displays loading state with animated dots
 */
const LoadingScreen: React.FC<{ message: string; color: string }> = ({ message, color }) => (
  <div className="flex items-center justify-center h-screen bg-gradient-to-br from-cyan-900 via-blue-900 to-purple-900">
    <div className="text-center">
      <div className={`p-6 text-${color}-400 text-xl mb-4`}>{message}</div>
      <div className="flex justify-center space-x-2">
        <div className={`w-2 h-2 bg-${color}-400 rounded-full animate-bounce`}></div>
        <div
          className={`w-2 h-2 bg-${color}-400 rounded-full animate-bounce`}
          style={{ animationDelay: ANIMATION_DELAY_1 }}
        ></div>
        <div
          className={`w-2 h-2 bg-${color}-400 rounded-full animate-bounce`}
          style={{ animationDelay: ANIMATION_DELAY_2 }}
        ></div>
      </div>
    </div>
  </div>
);

/**
 * Component: ErrorScreen
 * Description:
 * - Displays error message
 */
const ErrorScreen: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex items-center justify-center h-screen">
    <div className="p-6 text-red-600 text-xl">{message}</div>
  </div>
);

/**
 * Component: LeaderboardContent
 * Description:
 * - Renders leaderboard screen with redirect handling
 */
const LeaderboardContent: React.FC<{
  gameFlow: { current_question_index: number | null };
  questionIndexParam: number;
  currentQuestionData: CurrentQuestionData | null;
  questions: QuestionWithAnswers[];
  totalQuestions: number;
  leaderboard: unknown;
  timerState: { remainingMs?: number } | null;
}> = ({
  gameFlow,
  questionIndexParam,
  currentQuestionData,
  questions,
  totalQuestions,
  leaderboard,
  timerState,
}) => {
  const currentQuestionNum =
    gameFlow.current_question_index !== null && gameFlow.current_question_index >= 0
      ? gameFlow.current_question_index + 1
      : questionIndexParam + 1;
  const totalQuestionsCount =
    currentQuestionData?.totalQuestions ?? (questions.length || totalQuestions);
  const isLastQuestion = currentQuestionNum >= totalQuestionsCount;

  if (isLastQuestion) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="p-6 text-white text-xl">リダイレクト中...</div>
        </div>
      </div>
    );
  }

  const leaderboardEntries = Array.isArray(leaderboard)
    ? leaderboard.map(
        (entry: {
          player_id: string;
          player_name: string;
          score: number;
          rank: number;
          previous_rank?: number;
          rank_change?: string;
          score_change?: number;
        }) => ({
          playerId: entry.player_id,
          playerName: entry.player_name,
          score: entry.score,
          rank: entry.rank,
          previousRank: entry.previous_rank ?? entry.rank,
          rankChange: (entry.rank_change || 'same') as 'up' | 'down' | 'same',
          scoreChange: entry.score_change ?? 0,
        }),
      )
    : [];

  return (
    <PlayerLeaderboardScreen
      leaderboardData={{
        entries: leaderboardEntries,
        questionNumber: currentQuestionNum,
        totalQuestions: totalQuestionsCount,
        timeRemaining: Math.max(
          0,
          Math.round(
            (timerState?.remainingMs || LEADERBOARD_TIME_LIMIT_SECONDS * MS_PER_SECOND) /
              MS_PER_SECOND,
          ),
        ),
        timeLimit: LEADERBOARD_TIME_LIMIT_SECONDS,
      }}
      onTimeExpired={() => {}}
    />
  );
};

/**
 * Component: ExplanationContent
 * Description:
 * - Renders explanation screen
 */
const ExplanationContent: React.FC<{
  gameFlow: { current_question_index: number | null };
  questionIndexParam: number;
  currentQuestionData: CurrentQuestionData | null;
  questions: QuestionWithAnswers[];
  totalQuestions: number;
  explanationData: ExplanationData | null;
  currentQuestion: Question;
}> = ({
  gameFlow,
  questionIndexParam,
  currentQuestionData,
  questions,
  totalQuestions,
  explanationData,
  currentQuestion,
}) => {
  const currentQuestionNum =
    gameFlow.current_question_index !== null && gameFlow.current_question_index >= 0
      ? gameFlow.current_question_index + 1
      : questionIndexParam + 1;
  const totalQuestionsCount =
    currentQuestionData?.totalQuestions ?? (questions.length || totalQuestions);

  return (
    <PlayerExplanationScreen
      explanation={{
        questionNumber: currentQuestionNum,
        totalQuestions: totalQuestionsCount,
        timeLimit:
          currentQuestionData?.showExplanationTime ??
          explanationData?.show_time ??
          currentQuestion.show_explanation_time ??
          DEFAULT_EXPLANATION_TIME_SECONDS,
        title: explanationData?.title || '解説',
        body: explanationData?.text || currentQuestion.explanation || '解説は近日追加されます。',
        image: explanationData?.image_url || undefined,
      }}
      onTimeExpired={() => {}}
    />
  );
};

/**
 * Component: PodiumContent
 * Description:
 * - Renders podium screen
 */
const PodiumContent: React.FC<{
  leaderboard: unknown;
}> = ({ leaderboard }) => {
  const podiumEntries = Array.isArray(leaderboard)
    ? leaderboard.map(
        (entry: { player_id: string; player_name: string; score: number; rank: number }) => ({
          playerId: entry.player_id,
          playerName: entry.player_name,
          score: entry.score,
          rank: entry.rank,
          previousRank: entry.rank,
          rankChange: 'same' as const,
        }),
      )
    : [];

  return <PlayerPodiumScreen entries={podiumEntries} />;
};

/**
 * Component: GameEndContent
 * Description:
 * - Renders game end screen
 */
const GameEndContent: React.FC<{
  leaderboard: unknown;
  playerId: string;
  router: ReturnType<typeof useRouter>;
}> = ({ leaderboard, playerId, router }) => {
  const playerEntry = Array.isArray(leaderboard)
    ? (
        leaderboard as Array<{
          player_id: string;
          player_name: string;
          score: number;
          rank: number;
        }>
      ).find((entry) => entry.player_id === playerId)
    : undefined;

  const leaderboardEntries: LeaderboardEntry[] = Array.isArray(leaderboard)
    ? (
        leaderboard as Array<{
          player_id: string;
          player_name: string;
          score: number;
          rank: number;
        }>
      ).map((entry) => ({
        playerId: entry.player_id,
        playerName: entry.player_name,
        score: entry.score,
        rank: entry.rank,
        previousRank: entry.rank,
        rankChange: 'same' as const,
      }))
    : [];

  return (
    <PlayerGameEndScreen
      playerEntry={
        playerEntry
          ? {
              playerId: playerEntry.player_id,
              playerName: playerEntry.player_name,
              score: playerEntry.score,
              rank: playerEntry.rank,
              previousRank: playerEntry.rank,
              rankChange: 'same',
            }
          : undefined
      }
      entries={leaderboardEntries}
      onReturnHome={() => router.push('/')}
      onJoinNewGame={() => router.push('/')}
    />
  );
};

//----------------------------------------------------
// 10. Custom Hooks
//----------------------------------------------------
/**
 * Hook: usePlayerGameTimer
 * Description:
 * - Manages timer calculations and phase transitions for player game
 */
function usePlayerGameTimer({
  currentPhase,
  gameFlow,
  timerState,
  currentQuestion,
  questionRemainingMs,
  answerRemainingMs,
  setQuestionRemainingMs,
  setAnswerRemainingMs,
  setAnswerDurationMs,
  setIsDisplayPhaseDone,
  setCurrentPhase,
  questionTimerInitializedRef,
  previousPhaseRef,
  answeringPhaseStartTimeRef,
  gameId,
  playerId,
  router,
}: {
  currentPhase: PlayerPhase;
  gameFlow: unknown;
  timerState: { remainingMs?: number; startTime?: Date } | null;
  currentQuestion: Question;
  questionRemainingMs: number | null;
  answerRemainingMs: number | null;
  setQuestionRemainingMs: React.Dispatch<React.SetStateAction<number | null>>;
  setAnswerRemainingMs: React.Dispatch<React.SetStateAction<number | null>>;
  setAnswerDurationMs: React.Dispatch<React.SetStateAction<number | null>>;
  setIsDisplayPhaseDone: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentPhase: React.Dispatch<React.SetStateAction<PlayerPhase>>;
  questionTimerInitializedRef: React.MutableRefObject<string | null>;
  previousPhaseRef: React.MutableRefObject<PlayerPhase | null>;
  answeringPhaseStartTimeRef: React.MutableRefObject<number | null>;
  gameId: string;
  playerId: string;
  router: ReturnType<typeof useRouter>;
}) {
  const derivedRemainingMsFromFlow =
    (gameFlow as { current_question_start_time?: string; current_question_end_time?: string })
      ?.current_question_start_time &&
    (gameFlow as { current_question_start_time?: string; current_question_end_time?: string })
      ?.current_question_end_time
      ? Math.max(
          0,
          new Date(
            (
              gameFlow as {
                current_question_start_time?: string;
                current_question_end_time?: string;
              }
            ).current_question_end_time!,
          ).getTime() - Date.now(),
        )
      : null;

  const showQuestionTime = Number.isFinite(currentQuestion.show_question_time)
    ? currentQuestion.show_question_time
    : DEFAULT_SHOW_QUESTION_TIME_SECONDS;
  const answeringTime = Number.isFinite(currentQuestion.answering_time)
    ? currentQuestion.answering_time
    : DEFAULT_ANSWERING_TIME_SECONDS;

  const viewingDurationMs = showQuestionTime * MS_PER_SECOND;

  let questionElapsedMs = 0;
  if (timerState?.startTime && currentPhase === 'question') {
    questionElapsedMs = Math.max(0, Date.now() - timerState.startTime.getTime());
  } else if ((gameFlow as { current_question_start_time?: string })?.current_question_start_time) {
    questionElapsedMs = Math.max(
      0,
      Date.now() -
        new Date(
          (gameFlow as { current_question_start_time?: string }).current_question_start_time!,
        ).getTime(),
    );
  }

  const viewingRemainingMs = Math.max(0, viewingDurationMs - questionElapsedMs);

  useEffect(() => {
    const currentQuestionId = (gameFlow as { current_question_id?: string })?.current_question_id;
    const previousPhase = previousPhaseRef.current;

    if (previousPhase === 'question' && currentPhase !== 'question') {
      setQuestionRemainingMs(null);
      questionTimerInitializedRef.current = null;
    }

    previousPhaseRef.current = currentPhase;

    if (currentPhase === 'question' && currentQuestionId) {
      if (questionTimerInitializedRef.current === currentQuestionId) {
        if (questionRemainingMs === null) {
          const currentViewingRemainingMs = Math.max(0, viewingDurationMs - questionElapsedMs);

          if (currentViewingRemainingMs > 0) {
            setQuestionRemainingMs(currentViewingRemainingMs);
          } else {
            setIsDisplayPhaseDone(true);
            setAnswerDurationMs(answeringTime * MS_PER_SECOND);
            setAnswerRemainingMs(answeringTime * MS_PER_SECOND);
            answeringPhaseStartTimeRef.current = Date.now();
            setCurrentPhase('answering');
            router.replace(`/game-player?gameId=${gameId}&phase=answering&playerId=${playerId}`);
          }
        }
        return;
      }

      questionTimerInitializedRef.current = currentQuestionId;

      const currentViewingRemainingMs = Math.max(0, viewingDurationMs - questionElapsedMs);
      const initialTime =
        currentViewingRemainingMs > 0 ? currentViewingRemainingMs : viewingDurationMs;

      if (initialTime > 0) {
        setQuestionRemainingMs(initialTime);
      } else {
        setIsDisplayPhaseDone(true);
        setAnswerDurationMs(answeringTime * MS_PER_SECOND);
        setAnswerRemainingMs(answeringTime * MS_PER_SECOND);
        answeringPhaseStartTimeRef.current = Date.now();
        setCurrentPhase('answering');
        router.replace(`/game-player?gameId=${gameId}&phase=answering&playerId=${playerId}`);
      }
    }
  }, [
    currentPhase,
    gameFlow,
    viewingDurationMs,
    questionElapsedMs,
    showQuestionTime,
    answeringTime,
    questionRemainingMs,
    setQuestionRemainingMs,
    setAnswerRemainingMs,
    setAnswerDurationMs,
    setIsDisplayPhaseDone,
    setCurrentPhase,
    questionTimerInitializedRef,
    previousPhaseRef,
    answeringPhaseStartTimeRef,
    gameId,
    playerId,
    router,
  ]);

  const totalRemainingMs =
    timerState?.remainingMs ??
    derivedRemainingMsFromFlow ??
    (currentPhase === 'question' ? viewingRemainingMs : answeringTime * MS_PER_SECOND);

  const answeringRemainingMsDerived = Math.max(
    0,
    Number.isFinite(totalRemainingMs) ? totalRemainingMs : 0,
  );

  const displayRemainingMs =
    currentPhase === 'question'
      ? questionRemainingMs !== null
        ? questionRemainingMs
        : viewingRemainingMs
      : answeringRemainingMsDerived;

  const currentTimeSeconds = useMemo(() => {
    if (currentPhase === 'question') {
      const time = Number.isFinite(displayRemainingMs) ? displayRemainingMs : 0;
      return Math.max(0, Math.round(time / MS_PER_SECOND));
    } else if (currentPhase === 'answering') {
      const time = Number.isFinite(answerRemainingMs) ? (answerRemainingMs ?? 0) : 0;
      return Math.max(0, Math.round(time / MS_PER_SECOND));
    }
    return 0;
  }, [currentPhase, displayRemainingMs, answerRemainingMs]);

  return {
    displayRemainingMs,
    currentTimeSeconds,
    viewingRemainingMs,
  };
}

/**
 * Function: computeCurrentQuestion
 * Description:
 * - Computes the current question object from various data sources
 */
function computeCurrentQuestion({
  currentQuestionData,
  gameFlow,
  questionIdParam,
  questionIndexParam,
  questions,
  timerState,
}: {
  currentQuestionData: CurrentQuestionData | null;
  gameFlow: unknown;
  questionIdParam: string;
  questionIndexParam: number;
  questions: QuestionWithAnswers[];
  timerState: { remainingMs?: number } | null;
}): Question {
  const durationFromFlowSeconds =
    (gameFlow as { current_question_start_time?: string; current_question_end_time?: string })
      ?.current_question_start_time &&
    (gameFlow as { current_question_start_time?: string; current_question_end_time?: string })
      ?.current_question_end_time
      ? Math.max(
          1,
          Math.round(
            (new Date(
              (
                gameFlow as {
                  current_question_start_time?: string;
                  current_question_end_time?: string;
                }
              ).current_question_end_time!,
            ).getTime() -
              new Date(
                (
                  gameFlow as {
                    current_question_start_time?: string;
                    current_question_end_time?: string;
                  }
                ).current_question_start_time!,
              ).getTime()) /
              MS_PER_SECOND,
          ),
        )
      : null;

  if (currentQuestionData?.question) {
    return {
      ...currentQuestionData.question,
      timeLimit: durationFromFlowSeconds ?? currentQuestionData.question.timeLimit,
    };
  }

  const idx =
    (gameFlow as { current_question_index?: number })?.current_question_index ?? questionIndexParam;
  const questionData = questions[idx];
  if (questionData) {
    const showTimeSeconds = questionData.show_question_time || DEFAULT_SHOW_QUESTION_TIME_SECONDS;
    const answeringTimeSeconds = questionData.answering_time || DEFAULT_ANSWERING_TIME_SECONDS;
    return {
      id: questionData.id,
      text: questionData.question_text,
      image: questionData.image_url || undefined,
      timeLimit: durationFromFlowSeconds ?? showTimeSeconds + answeringTimeSeconds,
      show_question_time: showTimeSeconds,
      answering_time: answeringTimeSeconds,
      choices: questionData.answers
        .sort((a, b) => a.order_index - b.order_index)
        .map((a, i) => ({
          id: a.id,
          text: a.answer_text,
          letter: ANSWER_LETTERS[i] || String.fromCharCode(65 + i),
        })),
      correctAnswerId: questionData.answers.find((a) => a.is_correct)?.id || '',
      explanation: questionData.explanation_text || undefined,
      type: questionData.question_type as Question['type'],
    };
  }

  return {
    id: (gameFlow as { current_question_id?: string })?.current_question_id || questionIdParam,
    text:
      questions.length === 0
        ? 'クイズデータを読み込み中...'
        : `問題 ${(idx ?? 0) + 1} を読み込み中...`,
    image: undefined,
    timeLimit: Math.max(
      DEFAULT_MIN_TIME_LIMIT_SECONDS,
      Math.round((timerState?.remainingMs || DEFAULT_FALLBACK_TIME_MS) / MS_PER_SECOND),
    ),
    show_question_time: DEFAULT_SHOW_QUESTION_TIME_SECONDS,
    answering_time: DEFAULT_ANSWERING_TIME_SECONDS,
    choices: [
      { id: 'loading-1', text: '読み込み中...', letter: 'A' },
      { id: 'loading-2', text: '読み込み中...', letter: 'B' },
      { id: 'loading-3', text: '読み込み中...', letter: 'C' },
      { id: 'loading-4', text: '読み込み中...', letter: 'D' },
    ],
    correctAnswerId: 'loading-1',
    explanation: undefined,
    type: 'multiple_choice_4',
  };
}

/**
 * Hook: usePlayerGameWebSocket
 * Description:
 * - Manages WebSocket connection and event handlers for player game
 */
function usePlayerGameWebSocket({
  gameId,
  roomCode,
  playerId,
  socket,
  isConnected,
  joinRoom,
  leaveRoom,
  router,
  gameFlowRef,
  currentPhaseRef,
  refreshFlow,
  setCurrentPhase,
  setAnswerStats,
  setCountdownStartedAt,
  handlePlayerKickedRef,
}: {
  gameId: string;
  roomCode: string;
  playerId: string;
  socket: ReturnType<typeof useSocket>['socket'];
  isConnected: boolean;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  router: ReturnType<typeof useRouter>;
  gameFlowRef: React.MutableRefObject<unknown>;
  currentPhaseRef: React.MutableRefObject<PlayerPhase>;
  refreshFlow: () => Promise<void>;
  setCurrentPhase: React.Dispatch<React.SetStateAction<PlayerPhase>>;
  setAnswerStats: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  setCountdownStartedAt: React.Dispatch<React.SetStateAction<number | undefined>>;
  handlePlayerKickedRef: React.MutableRefObject<((data: PlayerKickedData) => void) | undefined>;
}) {
  const hasJoinedRoomRef = useRef(false);
  const socketRef = useRef(socket);
  const isConnectedRef = useRef(isConnected);

  useEffect(() => {
    socketRef.current = socket;
  }, [socket]);

  useEffect(() => {
    isConnectedRef.current = isConnected;
  }, [isConnected]);

  const handleStatsUpdate = useCallback(
    (data: StatsUpdateData) => {
      if (
        data.roomId === gameId &&
        data.questionId ===
          (gameFlowRef.current as { current_question_id?: string })?.current_question_id
      ) {
        const currentPhaseValue = currentPhaseRef.current;
        if (currentPhaseValue === 'answer_reveal' || currentPhaseValue === 'answering') {
          setAnswerStats((prev) => {
            const hasChanged =
              Object.keys(data.counts).some((key) => prev[key] !== data.counts[key]) ||
              Object.keys(prev).some((key) => !(key in data.counts));
            return hasChanged ? data.counts : prev;
          });
        }
      }
    },
    [gameId, gameFlowRef, currentPhaseRef, setAnswerStats],
  );

  const handleAnswerLocked = useCallback(
    (data: AnswerLockedData) => {
      if (data.roomId !== gameId) return;
      if (
        data.counts &&
        data.questionId ===
          (gameFlowRef.current as { current_question_id?: string })?.current_question_id
      ) {
        setAnswerStats(data.counts);
      }
      setCurrentPhase('answer_reveal');
      router.replace(`/game-player?gameId=${gameId}&phase=answer_reveal&playerId=${playerId}`);
    },
    [gameId, playerId, router, gameFlowRef, setAnswerStats, setCurrentPhase],
  );

  const handlePhaseChange = useCallback(
    (data: PhaseChangeData) => {
      if (data.roomId !== gameId) return;

      const current = currentPhaseRef.current;
      if (data.phase !== 'waiting') {
        const currentRank = PHASE_PRIORITY[current];
        const nextRank = PHASE_PRIORITY[data.phase];
        if (Number.isFinite(currentRank) && Number.isFinite(nextRank) && nextRank < currentRank) {
          return;
        }
      }

      if (data.phase === 'countdown') {
        const currentQuestionIndex =
          (gameFlowRef.current as { current_question_index?: number })?.current_question_index ?? 0;
        if (currentQuestionIndex > 0) {
          return;
        }
        setCountdownStartedAt(data.startedAt);
        refreshFlow().catch(() => {});
      }

      setCurrentPhase(data.phase);

      if (data.phase === 'waiting') {
        if (roomCode) {
          router.push(`/join?code=${roomCode}`);
        } else if (gameId) {
          router.push(`/join?gameId=${gameId}`);
        }
        return;
      }
      router.replace(`/game-player?gameId=${gameId}&phase=${data.phase}&playerId=${playerId}`);
    },
    [
      gameId,
      playerId,
      router,
      roomCode,
      gameFlowRef,
      currentPhaseRef,
      refreshFlow,
      setCurrentPhase,
      setCountdownStartedAt,
    ],
  );

  const handleGameStarted = useCallback(
    (data: GameEventData) => {
      const targetGameId = data.gameId || data.roomId;
      if (targetGameId === gameId) {
        setCurrentPhase('countdown');
        router.replace(`/game-player?gameId=${gameId}&phase=countdown&playerId=${playerId}`);
      }
    },
    [gameId, playerId, router, setCurrentPhase],
  );

  const handleGamePause = useCallback(() => {}, []);
  const handleGameResume = useCallback(() => {}, []);

  const handleGameEnd = useCallback(
    (data: GameEventData) => {
      const targetGameId = data.gameId;
      if (targetGameId === gameId) {
        setCurrentPhase('ended');
        router.replace(`/game-player?gameId=${gameId}&phase=ended&playerId=${playerId}`);
      }
    },
    [gameId, playerId, router, setCurrentPhase],
  );

  const setupSocketListeners = useCallback(
    (currentSocket: typeof socket) => {
      if (!currentSocket) return () => {};

      currentSocket.on('game:answer:stats:update', handleStatsUpdate);
      currentSocket.on('game:answer:stats', handleStatsUpdate);
      currentSocket.on('game:answer:locked', handleAnswerLocked);
      currentSocket.on('game:phase:change', handlePhaseChange);
      currentSocket.on('game:player-kicked', (data) => handlePlayerKickedRef.current?.(data));
      currentSocket.on('game:started', handleGameStarted);
      currentSocket.on('game:pause', handleGamePause);
      currentSocket.on('game:resume', handleGameResume);
      currentSocket.on('game:end', handleGameEnd);

      return () => {
        currentSocket.off('game:answer:stats:update', handleStatsUpdate);
        currentSocket.off('game:answer:stats', handleStatsUpdate);
        currentSocket.off('game:answer:locked', handleAnswerLocked);
        currentSocket.off('game:phase:change', handlePhaseChange);
        currentSocket.off('game:player-kicked');
        currentSocket.off('game:started', handleGameStarted);
        currentSocket.off('game:pause', handleGamePause);
        currentSocket.off('game:resume', handleGameResume);
        currentSocket.off('game:end', handleGameEnd);
      };
    },
    [
      handleStatsUpdate,
      handleAnswerLocked,
      handlePhaseChange,
      handleGameStarted,
      handleGamePause,
      handleGameResume,
      handleGameEnd,
      handlePlayerKickedRef,
    ],
  );

  const joinRoomSafe = useCallback(() => {
    if (hasJoinedRoomRef.current) {
      return;
    }
    if (isConnectedRef.current) {
      joinRoom(gameId);
      hasJoinedRoomRef.current = true;
    }
  }, [gameId, joinRoom]);

  useEffect(() => {
    if (!gameId) return;

    const currentSocket = socketRef.current;
    if (!currentSocket) {
      const checkSocket = setInterval(() => {
        if (socketRef.current) {
          clearInterval(checkSocket);
        }
      }, SOCKET_CHECK_INTERVAL_MS);
      return () => clearInterval(checkSocket);
    }

    const cleanupListeners = setupSocketListeners(currentSocket);
    joinRoomSafe();

    if (!isConnectedRef.current) {
      const onConnect = () => {
        joinRoomSafe();
        currentSocket.off('connect', onConnect);
      };
      currentSocket.on('connect', onConnect);

      const checkConnection = setInterval(() => {
        if (isConnectedRef.current && !hasJoinedRoomRef.current) {
          joinRoomSafe();
          clearInterval(checkConnection);
          currentSocket.off('connect', onConnect);
        }
      }, CONNECTION_CHECK_INTERVAL_MS);

      const cleanupTimeout = setTimeout(() => {
        clearInterval(checkConnection);
        currentSocket.off('connect', onConnect);
      }, CONNECTION_CHECK_TIMEOUT_MS);

      return () => {
        clearInterval(checkConnection);
        clearTimeout(cleanupTimeout);
        currentSocket.off('connect', onConnect);
        cleanupListeners();

        if (gameId && hasJoinedRoomRef.current) {
          leaveRoom(gameId);
          hasJoinedRoomRef.current = false;
        }
      };
    }

    return () => {
      cleanupListeners();
      currentSocket.off('connect');

      if (gameId && hasJoinedRoomRef.current) {
        leaveRoom(gameId);
        hasJoinedRoomRef.current = false;
      }
    };
  }, [gameId, joinRoom, leaveRoom, joinRoomSafe, setupSocketListeners]);
}

//----------------------------------------------------
// 11. Main Page Content Component
//----------------------------------------------------
/**
 * Component: PlayerGameContent
 * Description:
 * - Main player game interface component
 * - Manages all game phases and real-time synchronization
 *
 * Features:
 * - Real-time WebSocket synchronization
 * - Complex timer management for questions and answers
 * - Auto-submit answers when timer expires
 * - Phase transition management
 * - Answer statistics tracking
 * - Leaderboard updates
 *
 * Incomplete Features:
 * - None identified
 */
function PlayerGameContent() {
  //----------------------------------------------------
  // 11.1. Hooks & Router Setup
  //----------------------------------------------------
  const router = useRouter();
  const searchParams = useSearchParams();
  const gameIdParam = searchParams.get('gameId') || '';
  const roomCode = searchParams.get('code') || '';
  const phaseParam = (searchParams.get('phase') as PlayerPhase) || DEFAULT_PHASE;
  const questionIdParam = searchParams.get('questionId') || DEFAULT_PLACEHOLDER_QUESTION_ID;
  const questionIndexParam = Number(
    searchParams.get('questionIndex') || String(DEFAULT_QUESTION_INDEX),
  );
  const totalQuestions = Number(
    searchParams.get('totalQuestions') || String(DEFAULT_TOTAL_QUESTIONS),
  );
  const playerParam = searchParams.get('playerId') || '';
  const { deviceId } = useDeviceId();
  const playerId = playerParam || deviceId || DEFAULT_ANONYMOUS_PLAYER;

  //----------------------------------------------------
  // 11.2. State Management
  //----------------------------------------------------
  const [gameId, setGameId] = useState<string>(gameIdParam);
  const [currentPhase, setCurrentPhase] = useState<PlayerPhase>(phaseParam);
  const [countdownStartedAt, setCountdownStartedAt] = useState<number | undefined>(undefined);
  const [explanationData, setExplanationData] = useState<ExplanationData | null>(null);
  const [questions, setQuestions] = useState<QuestionWithAnswers[]>([]);
  const [quizPlaySettings, setQuizPlaySettings] = useState<{
    time_bonus: boolean;
    streak_bonus: boolean;
  } | null>(null);
  const [currentQuestionData, setCurrentQuestionData] = useState<CurrentQuestionData | null>(null);
  const [isDisplayPhaseDone, setIsDisplayPhaseDone] = useState(false);
  const [answerDurationMs, setAnswerDurationMs] = useState<number | null>(null);
  const [answerRemainingMs, setAnswerRemainingMs] = useState<number | null>(null);
  const [questionRemainingMs, setQuestionRemainingMs] = useState<number | null>(null);
  const [answerStats, setAnswerStats] = useState<Record<string, number>>({});
  const [selectedAnswer, setSelectedAnswer] = useState<string | undefined>();
  const [isMobile, setIsMobile] = useState(true);
  const [correctAnswerIdState, setCorrectAnswerIdState] = useState<string | null>(null);

  //----------------------------------------------------
  // 11.3. Custom Hooks
  //----------------------------------------------------
  const { gameFlow, timerState, isConnected, refreshFlow } = useGameFlow({
    gameId,
    autoSync: true,
    triggerOnQuestionEndOnTimer: false,
    events: {
      onQuestionStart: (qId, qIndex) => {
        const isNewQuestionStart = qId && qId !== lastQuestionStartIdRef.current;
        lastQuestionStartIdRef.current = qId || null;

        const currentPhaseValue = currentPhaseRef.current;
        if (
          !isNewQuestionStart &&
          (currentPhaseValue === 'answering' ||
            currentPhaseValue === 'answer_reveal' ||
            currentPhaseValue === 'leaderboard' ||
            currentPhaseValue === 'explanation')
        ) {
          setIsDisplayPhaseDone(false);
          setAnswerDurationMs(null);
          setAnswerRemainingMs(null);
          setQuestionRemainingMs(null);
          answeringPhaseStartTimeRef.current = null;
          return;
        }

        setIsDisplayPhaseDone(false);
        setAnswerDurationMs(null);
        setAnswerRemainingMs(null);
        setQuestionRemainingMs(null);
        answeringPhaseStartTimeRef.current = null;
        setCurrentPhase('question');
        router.replace(
          `/game-player?gameId=${gameId}&phase=question&questionIndex=${qIndex}&playerId=${playerId}`,
        );
      },
      onQuestionEnd: () => {
        setAnswerRemainingMs(0);
        setCurrentPhase('answer_reveal');
        router.replace(`/game-player?gameId=${gameId}&phase=answer_reveal&playerId=${playerId}`);
      },
      onAnswerReveal: () => {
        setCurrentPhase('answer_reveal');
        router.replace(`/game-player?gameId=${gameId}&phase=answer_reveal&playerId=${playerId}`);
      },
      onExplanationShow: (questionId, explanation) => {
        const hasContent =
          (explanation.text && explanation.text.trim() !== '') ||
          (explanation.title && explanation.title.trim() !== '');

        if (hasContent) {
          setExplanationData({
            title: explanation.title,
            text: explanation.text,
            image_url: explanation.image_url,
            show_time: explanation.show_time || DEFAULT_EXPLANATION_TIME_SECONDS,
          });
          setCurrentPhase('explanation');
          router.replace(`/game-player?gameId=${gameId}&phase=explanation&playerId=${playerId}`);
        }
      },
      onExplanationHide: () => {
        // Explanation phase ended, move to next phase
        // This will be handled by the explanation screen's onTimeExpired
      },
      onGameEnd: () => {
        setCurrentPhase('podium');
        router.replace(`/game-player?gameId=${gameId}&phase=podium&playerId=${playerId}`);
      },
      onError: () => {
        // Error handling is done via toast notifications
      },
    },
  });

  // Compute currentQuestionForPoints before useGameAnswer hook
  const currentQuestionForPoints = useMemo(() => {
    if (currentQuestionData) {
      return {
        points: currentQuestionData.points ?? DEFAULT_POINTS,
        answering_time:
          currentQuestionData.answeringTime ??
          currentQuestionData.timeLimit ??
          DEFAULT_ANSWERING_TIME_SECONDS,
      };
    }

    if (!gameFlow?.current_question_id || !questions.length) return null;
    const questionIndex = gameFlow.current_question_index ?? 0;
    const questionData = questions[questionIndex];
    if (questionData) {
      return {
        points: questionData.points ?? DEFAULT_POINTS,
        answering_time:
          questionData.answering_time ??
          questionData.show_question_time ??
          DEFAULT_ANSWERING_TIME_SECONDS,
      };
    }
    return null;
  }, [
    currentQuestionData,
    gameFlow?.current_question_id,
    gameFlow?.current_question_index,
    questions,
  ]);

  const {
    answerStatus,
    answerResult,
    submitAnswer,
    error: answerError,
  } = useGameAnswer({
    gameId,
    playerId,
    questionId: gameFlow?.current_question_id || null,
    questionNumber:
      gameFlow && gameFlow.current_question_index !== null && gameFlow.current_question_index >= 0
        ? gameFlow.current_question_index + 1
        : undefined,
    correctAnswerId: correctAnswerIdState || undefined,
    autoReveal: false,
    questionPoints: currentQuestionForPoints?.points ?? DEFAULT_POINTS,
    answeringTime: currentQuestionForPoints?.answering_time ?? DEFAULT_ANSWERING_TIME_SECONDS,
    timeBonusEnabled: quizPlaySettings?.time_bonus ?? false,
    streakBonusEnabled: quizPlaySettings?.streak_bonus ?? false,
    events: {
      onAnswerSubmitted: () => {
        // Answer submission handled by hook
      },
      onError: () => {
        // Error handling is done via toast notifications
      },
    },
  });

  const { leaderboard, refreshLeaderboard } = useGameLeaderboard({
    gameId,
    playerId,
    autoRefresh: true,
  });

  const { socket, joinRoom, leaveRoom } = useSocket();

  //----------------------------------------------------
  // 11.4. Computed Values
  //----------------------------------------------------
  // Compute currentQuestion before it's used in effects
  const currentQuestion: Question = useMemo(
    () =>
      computeCurrentQuestion({
        currentQuestionData,
        gameFlow,
        questionIdParam,
        questionIndexParam,
        questions,
        timerState,
      }),
    [currentQuestionData, gameFlow, questionIdParam, questionIndexParam, questions, timerState],
  );

  //----------------------------------------------------
  // 11.5. Refs
  //----------------------------------------------------
  const gameFlowRef = useRef(gameFlow);
  const handlePlayerKickedRef = useRef<typeof handlePlayerKicked | undefined>(undefined);
  const currentPhaseRef = useRef<PlayerPhase>(phaseParam);
  const lastQuestionStartIdRef = useRef<string | null>(null);
  const answeringPhaseStartTimeRef = useRef<number | null>(null);
  const questionTimerInitializedRef = useRef<string | null>(null);
  const previousPhaseRef = useRef<PlayerPhase | null>(null);
  const autoSubmittingRef = useRef(false);
  const hasTransitionedToRevealRef = useRef(false);

  //----------------------------------------------------
  // 11.6. Effects
  //----------------------------------------------------
  useEffect(() => {
    if (phaseParam === 'countdown' && !countdownStartedAt) {
      const stored = sessionStorage.getItem(`countdown_started_${gameId}`);
      if (stored) {
        const timestamp = parseInt(stored, RADIX_DECIMAL);
        if (!isNaN(timestamp)) {
          setCountdownStartedAt(timestamp);
        }
      }
    }
  }, [phaseParam, gameId, countdownStartedAt]);

  useEffect(() => {
    if (!gameFlow?.current_question_id) return;
    setIsDisplayPhaseDone(false);
    setAnswerDurationMs(null);
    setAnswerRemainingMs(null);
    setExplanationData(null);
  }, [gameFlow?.current_question_id]);

  useEffect(() => {
    gameFlowRef.current = gameFlow;
  }, [gameFlow]);

  useEffect(() => {
    currentPhaseRef.current = currentPhase;
  }, [currentPhase]);

  useEffect(() => {
    setCurrentPhase(phaseParam);
  }, [phaseParam]);

  useEffect(() => {
    if (gameFlow?.current_question_id && gameFlow.current_question_id !== questionIdParam) {
      setSelectedAnswer(undefined);
    }
  }, [gameFlow?.current_question_id, questionIdParam]);

  useEffect(() => {
    if (currentQuestion?.correctAnswerId) {
      setCorrectAnswerIdState(currentQuestion.correctAnswerId);
    }
  }, [currentQuestion?.correctAnswerId]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT_PX);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (currentPhase === 'leaderboard' && gameId && refreshLeaderboard) {
      refreshLeaderboard();
    }
  }, [currentPhase, gameId, refreshLeaderboard]);

  useEffect(() => {
    if (currentPhase === 'leaderboard' && gameFlow) {
      const currentQuestionNum =
        gameFlow.current_question_index !== null && gameFlow.current_question_index >= 0
          ? gameFlow.current_question_index + 1
          : questionIndexParam + 1;
      const totalQuestionsCount =
        currentQuestionData?.totalQuestions ?? (questions.length || totalQuestions);
      const isLastQuestion = currentQuestionNum >= totalQuestionsCount;

      if (isLastQuestion) {
        setCurrentPhase('podium');
        router.replace(`/game-player?gameId=${gameId}&phase=podium&playerId=${playerId}`);
      }
    }
  }, [
    currentPhase,
    gameFlow,
    questionIndexParam,
    currentQuestionData?.totalQuestions,
    questions.length,
    totalQuestions,
    gameId,
    playerId,
    router,
  ]);

  useEffect(() => {
    if (
      currentPhase === 'explanation' &&
      gameId &&
      gameFlow?.current_question_id &&
      !explanationData
    ) {
      const fetchExplanation = async () => {
        try {
          const questionId = gameFlow.current_question_id;
          if (!questionId) return;

          const { data, error } = await gameApi.getExplanation(gameId, questionId);
          if (error) {
            return;
          } else if (data) {
            const hasContent =
              (data.explanation_text && data.explanation_text.trim() !== '') ||
              (data.explanation_title && data.explanation_title.trim() !== '');

            if (!hasContent) {
              return;
            }
            setExplanationData({
              title: data.explanation_title,
              text: data.explanation_text,
              image_url: data.explanation_image_url,
              show_time: data.show_explanation_time || DEFAULT_EXPLANATION_TIME_SECONDS,
            });
          }
        } catch {
          // Error handled silently - explanation is optional
        }
      };
      fetchExplanation();
    }
  }, [currentPhase, gameId, gameFlow?.current_question_id, explanationData]);

  useEffect(() => {
    let cancelled = false;

    const resolveGameId = async () => {
      if (gameId) return gameId;

      const stored = roomCode ? sessionStorage.getItem(`game_${roomCode}`) : null;
      if (stored) {
        if (!cancelled) setGameId(stored);
        return stored;
      }
      return null;
    };

    const loadQuiz = async (resolvedGameId: string) => {
      try {
        if (!apiClient.isAuthenticated()) {
          return;
        }
        const { data: game } = await gameApi.getGame(resolvedGameId);
        const quizId = game?.quiz_id || game?.quiz_set_id;
        if (quizId) {
          const quiz = await quizService.getQuizComplete(quizId);
          const sorted = [...quiz.questions].sort((a, b) => a.order_index - b.order_index);
          if (!cancelled) {
            setQuestions(sorted);
            if (quiz.play_settings) {
              setQuizPlaySettings({
                time_bonus: quiz.play_settings.time_bonus ?? false,
                streak_bonus: quiz.play_settings.streak_bonus ?? false,
              });
            }
          }
        }
      } catch {
        // Error handled silently - quiz load is best-effort
      }
    };

    resolveGameId().then((resolvedId) => {
      if (!resolvedId) return;
      loadQuiz(resolvedId);
    });

    return () => {
      cancelled = true;
    };
  }, [gameId, roomCode]);

  useEffect(() => {
    if (!gameId || !gameFlow?.current_question_id) {
      setCurrentQuestionData(null);
      return;
    }

    const fetchCurrentQuestion = async () => {
      try {
        const { data, error } = await gameApi.getCurrentQuestion(gameId);
        if (error || !data) {
          return;
        }

        const question: Question = {
          id: data.question.id,
          text: data.question.text,
          image: data.question.image_url || undefined,
          timeLimit: data.question.show_question_time + data.question.answering_time,
          show_question_time: data.question.show_question_time,
          answering_time: data.question.answering_time,
          show_explanation_time: data.question.show_explanation_time,
          choices: data.answers
            .sort((a, b) => a.order_index - b.order_index)
            .map((a, i) => ({
              id: a.id,
              text: a.text,
              letter: ANSWER_LETTERS[i] || String.fromCharCode(65 + i),
            })),
          correctAnswerId: data.answers.find((a) => a.is_correct)?.id || '',
          explanation: data.question.explanation_text || undefined,
          type: data.question.type as Question['type'],
        };

        setCurrentQuestionData({
          question,
          serverTime: data.server_time,
          isActive: data.is_active,
          points: data.question.points,
          timeLimit: data.question.show_question_time + data.question.answering_time,
          answeringTime: data.question.answering_time,
          showExplanationTime: data.question.show_explanation_time,
          totalQuestions: data.total_questions,
        });
      } catch {
        // Error handled silently - question refresh is best-effort
      }
    };

    fetchCurrentQuestion();

    const refreshInterval = setInterval(fetchCurrentQuestion, QUESTION_REFRESH_INTERVAL_MS);
    return () => clearInterval(refreshInterval);
  }, [gameId, gameFlow?.current_question_id]);

  useEffect(() => {
    if (currentPhase === 'countdown' && !countdownStartedAt) {
      const stored = sessionStorage.getItem(`countdown_started_${gameId}`);
      if (stored) {
        const timestamp = parseInt(stored, RADIX_DECIMAL);
        if (!isNaN(timestamp)) {
          setCountdownStartedAt(timestamp);
          sessionStorage.removeItem(`countdown_started_${gameId}`);
        }
      }
    }
  }, [currentPhase, gameId, countdownStartedAt]);

  //----------------------------------------------------
  // 11.7. Helper Functions
  //----------------------------------------------------
  /**
   * Function: handlePlayerKicked
   * Description:
   * - Handles player kicked event from host
   * - Shows notification and redirects to join page
   */
  const handlePlayerKicked = useCallback(
    (data: PlayerKickedData) => {
      if (data.player_id === playerId || data.game_id === gameId) {
        toast.error('ホストによってBANされました', {
          icon: '🚫',
          duration: TOAST_DURATION_MS,
        });

        if (roomCode) {
          sessionStorage.removeItem(`game_${roomCode}`);
        }

        setTimeout(() => {
          router.push('/join');
        }, PLAYER_KICKED_DELAY_MS);
      }
    },
    [playerId, gameId, router, roomCode],
  );

  useEffect(() => {
    handlePlayerKickedRef.current = handlePlayerKicked;
  }, [handlePlayerKicked]);

  //----------------------------------------------------
  // 11.8. WebSocket Setup
  //----------------------------------------------------
  usePlayerGameWebSocket({
    gameId,
    roomCode,
    playerId,
    socket,
    isConnected,
    joinRoom,
    leaveRoom,
    router,
    gameFlowRef,
    currentPhaseRef,
    refreshFlow,
    setCurrentPhase,
    setAnswerStats,
    setCountdownStartedAt,
    handlePlayerKickedRef,
  });

  //----------------------------------------------------
  // 11.9. Timer Management
  //----------------------------------------------------
  const { displayRemainingMs, currentTimeSeconds, viewingRemainingMs } = usePlayerGameTimer({
    currentPhase,
    gameFlow,
    timerState,
    currentQuestion,
    questionRemainingMs,
    answerRemainingMs,
    setQuestionRemainingMs,
    setAnswerRemainingMs,
    setAnswerDurationMs,
    setIsDisplayPhaseDone,
    setCurrentPhase,
    questionTimerInitializedRef,
    previousPhaseRef,
    answeringPhaseStartTimeRef,
    gameId,
    playerId,
    router,
  });

  //----------------------------------------------------
  // 11.10. Additional Computed Values
  //----------------------------------------------------
  const statisticsMemo = useMemo(() => {
    if (!currentQuestion.choices || currentQuestion.choices.length === 0) {
      return [];
    }
    const totalAnswered = Object.values(answerStats).reduce((sum, count) => sum + count, 0);
    return currentQuestion.choices.map((choice) => {
      const count = answerStats[choice.id] || 0;
      return {
        choiceId: choice.id,
        count,
        percentage: totalAnswered > 0 ? (count / totalAnswered) * 100 : 0,
      };
    });
  }, [currentQuestion.choices, answerStats]);

  const revealPayload: AnswerResult = useMemo(() => {
    if (!currentQuestion.choices || currentQuestion.choices.length === 0) {
      return {
        question: currentQuestion,
        correctAnswer: { id: '', text: '読み込み中...', letter: 'A' },
        playerAnswer: undefined,
        isCorrect: false,
        statistics: [],
        totalPlayers: 0,
        totalAnswered: 0,
      };
    }

    const playerChoice = answerResult?.selectedOption
      ? currentQuestion.choices.find((c) => c.id === answerResult.selectedOption)
      : selectedAnswer
        ? currentQuestion.choices.find((c) => c.id === selectedAnswer)
        : undefined;

    const isCorrect =
      answerResult?.isCorrect ??
      (playerChoice ? playerChoice.id === currentQuestion.correctAnswerId : false);

    const correctAnswerChoice =
      currentQuestion.choices.find((c) => c.id === currentQuestion.correctAnswerId) ||
      currentQuestion.choices[0];

    const totalAnswered = statisticsMemo.reduce((sum, stat) => sum + stat.count, 0);

    return {
      question: currentQuestion,
      correctAnswer: correctAnswerChoice,
      playerAnswer: playerChoice,
      isCorrect,
      statistics: statisticsMemo,
      totalPlayers: Array.isArray(leaderboard) ? leaderboard.length : 0,
      totalAnswered,
    };
  }, [answerResult, currentQuestion, selectedAnswer, statisticsMemo, leaderboard]);

  //----------------------------------------------------
  // 11.11. Event Handlers
  //----------------------------------------------------
  const startAnsweringPhase = useCallback(() => {
    if (isDisplayPhaseDone) return;
    const safeAnsweringTime = Number.isFinite(currentQuestion.answering_time)
      ? currentQuestion.answering_time
      : DEFAULT_ANSWERING_TIME_SECONDS;
    const durationMs = safeAnsweringTime * MS_PER_SECOND;
    setIsDisplayPhaseDone(true);
    setAnswerDurationMs(durationMs);
    setAnswerRemainingMs(durationMs);
    answeringPhaseStartTimeRef.current = Date.now();

    setCurrentPhase('answering');
    router.replace(`/game-player?gameId=${gameId}&phase=answering&playerId=${playerId}`);
  }, [
    currentQuestion.answering_time,
    gameId,
    isDisplayPhaseDone,
    playerId,
    router,
    answeringPhaseStartTimeRef,
  ]);

  useEffect(() => {
    if (currentPhase !== 'question') return;
    if (displayRemainingMs <= 0 && !isDisplayPhaseDone) {
      startAnsweringPhase();
    }
  }, [currentPhase, displayRemainingMs, isDisplayPhaseDone, startAnsweringPhase]);

  useEffect(() => {
    if (currentPhase !== 'question') return;
    if (questionRemainingMs === null || questionRemainingMs <= 0) return;

    const interval = setInterval(() => {
      setQuestionRemainingMs((prev) => {
        if (prev === null || prev <= 0) return 0;
        return Math.max(0, prev - TIMER_DECREMENT_INTERVAL_MS);
      });
    }, TIMER_DECREMENT_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [currentPhase, questionRemainingMs]);

  useEffect(() => {
    if (currentPhase === 'question' && questionRemainingMs !== null && viewingRemainingMs > 0) {
      const difference = Math.abs(questionRemainingMs - viewingRemainingMs);
      if (difference > TIMER_SYNC_THRESHOLD_MS) {
        setQuestionRemainingMs(viewingRemainingMs);
      }
    }
  }, [currentPhase, viewingRemainingMs, questionRemainingMs]);

  useEffect(() => {
    if (currentPhase !== 'answering') return;
    if (answerDurationMs === null || answerRemainingMs === null) return;

    const interval = setInterval(() => {
      setAnswerRemainingMs((prev) => {
        if (prev === null) return null;
        return Math.max(0, prev - TIMER_DECREMENT_INTERVAL_MS);
      });
    }, TIMER_DECREMENT_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [currentPhase, answerDurationMs, answerRemainingMs]);

  const handleAnswerSelect = (answerId: string) => {
    setSelectedAnswer(answerId);
  };

  const handleAnswerSubmit = useCallback(
    async (answerId?: string | null) => {
      const targetAnswerId: string | null =
        answerId !== undefined ? answerId : selectedAnswer || null;
      if (!gameFlow?.current_question_id) return;

      try {
        const fallbackAnsweringTime = Number.isFinite(
          currentQuestionForPoints?.answering_time ?? currentQuestion.answering_time,
        )
          ? (currentQuestionForPoints?.answering_time ??
            currentQuestion.answering_time ??
            DEFAULT_ANSWERING_TIME_SECONDS)
          : DEFAULT_ANSWERING_TIME_SECONDS;
        const durationMs: number =
          answerDurationMs !== null && Number.isFinite(answerDurationMs)
            ? answerDurationMs
            : fallbackAnsweringTime * MS_PER_SECOND;
        const remainingMs: number =
          answerRemainingMs !== null && Number.isFinite(answerRemainingMs)
            ? answerRemainingMs
            : durationMs;

        let responseTimeMs: number;
        if (answerId === null) {
          responseTimeMs = durationMs;
        } else if (answeringPhaseStartTimeRef.current !== null) {
          const elapsedMs = Date.now() - answeringPhaseStartTimeRef.current;
          responseTimeMs = Math.max(0, Math.min(durationMs, elapsedMs));
        } else {
          responseTimeMs = Math.max(0, Math.min(durationMs, durationMs - remainingMs));
        }

        await submitAnswer(targetAnswerId, responseTimeMs);
      } catch {
        toast.error('回答の送信に失敗しました');
      }
    },
    [
      selectedAnswer,
      gameFlow?.current_question_id,
      answerDurationMs,
      answerRemainingMs,
      currentQuestionForPoints?.answering_time,
      currentQuestion.answering_time,
      submitAnswer,
      answeringPhaseStartTimeRef,
    ],
  );

  useEffect(() => {
    if (currentPhase !== 'answering') return;
    if (autoSubmittingRef.current) return;
    if (answerStatus.hasAnswered) return;
    if (answerRemainingMs === null || answerRemainingMs > 0) return;

    const safeAnsweringTime = Number.isFinite(currentQuestion.answering_time)
      ? currentQuestion.answering_time
      : DEFAULT_ANSWERING_TIME_SECONDS;
    const durationMs = answerDurationMs ?? safeAnsweringTime * MS_PER_SECOND;
    autoSubmittingRef.current = true;
    submitAnswer(null, durationMs).catch((err) => {
      const errorMsg = err instanceof Error ? err.message : String(err);
      if (!errorMsg.includes('already') && !errorMsg.includes('Already')) {
        toast.error('自動送信に失敗しました');
        autoSubmittingRef.current = false;
      }
    });
  }, [
    currentPhase,
    answerStatus.hasAnswered,
    answerRemainingMs,
    answerDurationMs,
    currentQuestion.answering_time,
    submitAnswer,
  ]);

  useEffect(() => {
    if (currentPhase !== 'answering') {
      hasTransitionedToRevealRef.current = false;
      return;
    }
    if (hasTransitionedToRevealRef.current) return;
    if (answerRemainingMs === null || answerRemainingMs > 0) return;

    hasTransitionedToRevealRef.current = true;
    setAnswerRemainingMs(0);
    setCurrentPhase('answer_reveal');
    router.replace(`/game-player?gameId=${gameId}&phase=answer_reveal&playerId=${playerId}`);
  }, [currentPhase, answerRemainingMs, gameId, playerId, router]);

  //----------------------------------------------------
  // 11.12. Loading State
  //----------------------------------------------------
  if (!gameId) {
    return <ErrorScreen message="gameId が指定されていません。" />;
  }

  if (!gameFlow) {
    return <LoadingScreen message="ゲーム状態を読み込み中..." color="cyan" />;
  }

  if (!isConnected) {
    return <LoadingScreen message="接続を確立中..." color="yellow" />;
  }

  //----------------------------------------------------
  // 11.13. Error State
  //----------------------------------------------------
  // (Errors handled via toast notifications)

  //----------------------------------------------------
  // 11.14. Main Render
  //----------------------------------------------------
  switch (currentPhase) {
    case 'countdown':
      return (
        <PlayerCountdownScreen
          countdownTime={COUNTDOWN_TIME_SECONDS}
          questionNumber={
            gameFlow.current_question_index !== null && gameFlow.current_question_index >= 0
              ? gameFlow.current_question_index + 1
              : questionIndexParam + 1
          }
          totalQuestions={
            currentQuestionData?.totalQuestions ?? (questions.length || totalQuestions)
          }
          isMobile={isMobile}
          startedAt={countdownStartedAt}
          onCountdownComplete={() => {
            // Countdown complete - phase will transition to question via WebSocket event
          }}
        />
      );
    case 'question':
      return (
        <PlayerQuestionScreen
          question={{
            ...currentQuestion,
            timeLimit: currentQuestion.show_question_time || DEFAULT_SHOW_QUESTION_TIME_SECONDS,
          }}
          currentTime={Math.max(0, currentTimeSeconds)}
          questionNumber={
            gameFlow.current_question_index !== null && gameFlow.current_question_index >= 0
              ? gameFlow.current_question_index + 1
              : questionIndexParam + 1
          }
          totalQuestions={
            currentQuestionData?.totalQuestions ?? (questions.length || totalQuestions)
          }
          isMobile={isMobile}
        />
      );
    case 'answering':
      return (
        <PlayerAnswerScreen
          question={{
            ...currentQuestion,
            timeLimit: currentQuestion.answering_time,
          }}
          currentTime={currentTimeSeconds}
          questionNumber={
            gameFlow.current_question_index !== null && gameFlow.current_question_index >= 0
              ? gameFlow.current_question_index + 1
              : questionIndexParam + 1
          }
          totalQuestions={
            currentQuestionData?.totalQuestions ?? (questions.length || totalQuestions)
          }
          onAnswerSelect={handleAnswerSelect}
          onAnswerSubmit={(answerId) => {
            handleAnswerSubmit(answerId);
          }}
          isMobile={isMobile}
          isSubmitted={answerStatus.hasAnswered}
          isProcessing={answerStatus.isProcessing}
          error={answerError}
        />
      );
    case 'answer_reveal':
      return (
        <PlayerAnswerRevealScreen
          answerResult={revealPayload}
          questionNumber={
            gameFlow.current_question_index !== null && gameFlow.current_question_index >= 0
              ? gameFlow.current_question_index + 1
              : questionIndexParam + 1
          }
          totalQuestions={
            currentQuestionData?.totalQuestions ?? (questions.length || totalQuestions)
          }
          timeLimit={ANSWER_REVEAL_TIME_LIMIT_SECONDS}
          onTimeExpired={() => {
            // Answer reveal must NOT auto-advance. We wait for the host to press "Next"
          }}
        />
      );
    case 'leaderboard':
      return (
        <LeaderboardContent
          gameFlow={gameFlow}
          questionIndexParam={questionIndexParam}
          currentQuestionData={currentQuestionData}
          questions={questions}
          totalQuestions={totalQuestions}
          leaderboard={leaderboard}
          timerState={timerState}
        />
      );
    case 'explanation':
      return (
        <ExplanationContent
          gameFlow={gameFlow}
          questionIndexParam={questionIndexParam}
          currentQuestionData={currentQuestionData}
          questions={questions}
          totalQuestions={totalQuestions}
          explanationData={explanationData}
          currentQuestion={currentQuestion}
        />
      );
    case 'podium':
      return <PodiumContent leaderboard={leaderboard} />;
    case 'ended':
      return <GameEndContent leaderboard={leaderboard} playerId={playerId} router={router} />;
    default:
      return <div className="p-6">次のステップを待機しています...</div>;
  }
}

//----------------------------------------------------
// 12. Main Page Component (with Providers)
//----------------------------------------------------
/**
 * Component: GamePlayerPage
 * Description:
 * - Wraps PlayerGameContent with Suspense boundary
 * - Handles loading state for search params
 *
 * Returns:
 * - JSX: Page with Suspense wrapper
 */
export default function GamePlayerPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PlayerGameContent />
    </Suspense>
  );
}
