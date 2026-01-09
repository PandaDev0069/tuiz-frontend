// ====================================================
// File Name   : page.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-18
// Last Update : 2026-01-08
//
// Description:
// - Public display screen for live quiz games (host screen)
// - Real-time synchronization with host control panel via WebSocket
// - Handles all game phases: countdown, question, answering, reveal, leaderboard, explanation, podium
// - Manages timers and phase transitions (read-only display, no answer submission)
//
// Notes:
// - Uses WebSocket for real-time updates from host
// - Complex timer management matching game-player page for parity
// - No answer submission logic (display only)
// - Prevents phase downgrades from host events
// ====================================================

'use client';

//----------------------------------------------------
// 1. React & Next.js Imports
//----------------------------------------------------
import React, { Suspense, useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';

//----------------------------------------------------
// 2. External Library Imports
//----------------------------------------------------

//----------------------------------------------------
// 3. Internal Component Imports
//----------------------------------------------------
import { PageContainer, Container, Main } from '@/components/ui';
import { QRCode } from '@/components/ui/QRCode';
import {
  PublicCountdownScreen,
  HostQuestionScreen,
  HostAnswerScreen,
  HostAnswerRevealScreen,
  HostLeaderboardScreen,
  HostExplanationScreen,
  HostPodiumScreen,
} from '@/components/game';

//----------------------------------------------------
// 4. Service & Hook Imports
//----------------------------------------------------
import { useSocket } from '@/components/providers/SocketProvider';
import { useGameFlow } from '@/hooks/useGameFlow';
import { useGameLeaderboard } from '@/hooks/useGameLeaderboard';
import { gameApi } from '@/services/gameApi';
import { quizService } from '@/lib/quizService';

//----------------------------------------------------
// 5. Type Imports
//----------------------------------------------------
import type { Question, LeaderboardData } from '@/types/game';
import type { QuestionWithAnswers } from '@/types/quiz';

//----------------------------------------------------
// 6. Constants / Configuration
//----------------------------------------------------
const DEFAULT_TOTAL_QUESTIONS = 10;
const DEFAULT_QUESTION_INDEX = 0;
const DEFAULT_PHASE: PublicPhase = 'waiting';

const COUNTDOWN_TIME_SECONDS = 3;
const QUESTION_REFRESH_INTERVAL_MS = 5000;
const ANSWER_REVEAL_TIME_LIMIT_SECONDS = 10;
const LEADERBOARD_TIME_LIMIT_SECONDS = 10;
const DEFAULT_EXPLANATION_TIME_SECONDS = 10;

const DEFAULT_SHOW_QUESTION_TIME_SECONDS = 10;
const DEFAULT_ANSWERING_TIME_SECONDS = 30;
const DEFAULT_MIN_TIME_LIMIT_SECONDS = 5;
const DEFAULT_FALLBACK_TIME_MS = 10000;

const TIMER_DECREMENT_INTERVAL_MS = 1000;
const TIMER_SYNC_THRESHOLD_MS = 2000;
const MS_PER_SECOND = 1000;

const PHASE_PRIORITY: Record<PublicPhase, number> = {
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

//----------------------------------------------------
// 8. Types / Interfaces
//----------------------------------------------------
type PublicPhase =
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
  answeringTime?: number;
  showQuestionTime?: number;
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
  phase: PublicPhase;
  startedAt?: number;
}

interface GameEventData {
  gameId?: string;
  roomId?: string;
  roomCode?: string;
  timestamp?: string;
}

//----------------------------------------------------
// 9. Helper Components
//----------------------------------------------------
/**
 * Component: AnswerRevealContent
 * Description:
 * - Renders answer reveal screen with statistics
 */
const AnswerRevealContent: React.FC<{
  currentQuestion: Question;
  answerStats: Record<string, number>;
  leaderboard: unknown;
  leaderboardEntries: unknown[];
  questionIndex: number;
  totalQuestionsCount: number;
}> = ({
  currentQuestion,
  answerStats,
  leaderboard,
  leaderboardEntries,
  questionIndex,
  totalQuestionsCount,
}) => {
  if (!currentQuestion.choices || currentQuestion.choices.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-600 text-xl">問題データが読み込まれていません</div>
      </div>
    );
  }

  const totalAnswered = currentQuestion.choices.reduce(
    (sum, choice) => sum + (answerStats[choice.id] ?? 0),
    0,
  );
  const statistics = currentQuestion.choices.map((choice) => {
    const count = answerStats[choice.id] || 0;
    return {
      choiceId: choice.id,
      count,
      percentage: totalAnswered > 0 ? (count / totalAnswered) * 100 : 0,
    };
  });

  const correctAnswerChoice =
    currentQuestion.choices.find((c) => c.id === currentQuestion.correctAnswerId) ||
    currentQuestion.choices[0];

  const answerResult = {
    question: currentQuestion,
    correctAnswer: correctAnswerChoice,
    playerAnswer: undefined,
    isCorrect: false,
    statistics,
    totalPlayers: Array.isArray(leaderboard) ? leaderboard.length : leaderboardEntries.length,
    totalAnswered,
  };

  return (
    <HostAnswerRevealScreen
      answerResult={answerResult}
      questionNumber={questionIndex + 1}
      totalQuestions={totalQuestionsCount}
      timeLimit={ANSWER_REVEAL_TIME_LIMIT_SECONDS}
      onTimeExpired={() => {}}
    />
  );
};

/**
 * Component: LeaderboardContent
 * Description:
 * - Renders leaderboard screen with redirect handling
 */
const LeaderboardContent: React.FC<{
  questionIndex: number;
  totalQuestionsCount: number;
  leaderboardData: LeaderboardData;
}> = ({ questionIndex, totalQuestionsCount, leaderboardData }) => {
  const currentQuestionNum = questionIndex + 1;
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

  return <HostLeaderboardScreen leaderboardData={leaderboardData} onTimeExpired={() => {}} />;
};

/**
 * Component: ExplanationContent
 * Description:
 * - Renders explanation screen
 */
const ExplanationContent: React.FC<{
  questionIndex: number;
  totalQuestionsCount: number;
  currentQuestionData: CurrentQuestionData | null;
  explanationData: ExplanationData | null;
  currentQuestion: Question;
}> = ({
  questionIndex,
  totalQuestionsCount,
  currentQuestionData,
  explanationData,
  currentQuestion,
}) => {
  const currentQuestionNum = questionIndex + 1;

  return (
    <HostExplanationScreen
      explanation={{
        questionNumber: currentQuestionNum,
        totalQuestions: totalQuestionsCount,
        timeLimit:
          currentQuestionData?.showExplanationTime ??
          explanationData?.show_time ??
          currentQuestion.show_explanation_time ??
          10,
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
  leaderboardEntries: Array<{
    playerId: string;
    playerName: string;
    score: number;
    rank: number;
    previousRank: number;
    rankChange: 'up' | 'down' | 'same';
    scoreChange: number;
  }>;
  setCurrentPhase: React.Dispatch<React.SetStateAction<PublicPhase>>;
}> = ({ leaderboard, leaderboardEntries, setCurrentPhase }) => {
  const podiumEntries = Array.isArray(leaderboard)
    ? leaderboard
        .map((entry: { player_id: string; player_name: string; score: number; rank: number }) => ({
          playerId: entry.player_id,
          playerName: entry.player_name,
          score: entry.score,
          rank: entry.rank,
          previousRank: entry.rank,
          rankChange: 'same' as const,
        }))
        .sort((a, b) => (a.rank || 0) - (b.rank || 0))
    : leaderboardEntries;

  return (
    <HostPodiumScreen
      entries={podiumEntries}
      onAnimationComplete={() => {
        setCurrentPhase('ended');
      }}
    />
  );
};

/**
 * Component: EndedScreen
 * Description:
 * - Renders game end screen
 */
const EndedScreen: React.FC = () => (
  <PageContainer>
    <Main className="flex-1">
      <Container
        size="sm"
        className="flex flex-col items-center justify-center py-4 md:py-2 space-y-4 md:space-y-6"
      >
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 bg-clip-text text-transparent">
            ゲーム終了
          </h1>
          <p className="mt-4 text-xl text-gray-600">ありがとうございました！</p>
        </div>
      </Container>
    </Main>
  </PageContainer>
);

/**
 * Component: WaitingScreen
 * Description:
 * - Renders waiting room with QR code and room code
 */
const WaitingScreen: React.FC<{ roomCode: string; joinUrl: string }> = ({ roomCode, joinUrl }) => (
  <PageContainer>
    <Main className="flex-1">
      <Container
        size="sm"
        className="flex flex-col items-center justify-center py-4 md:py-2 space-y-4 md:space-y-6"
      >
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 bg-clip-text text-transparent animate-pulse">
            TUIZ情報王
          </h1>
          <div className="mt-3 relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-100 to-blue-100 rounded-xl blur-sm opacity-50 scale-105"></div>
            <div className="relative bg-gradient-to-r from-cyan-50 to-blue-50 px-6 py-3 rounded-xl border border-cyan-200">
              <p className="text-base md:text-lg font-semibold bg-gradient-to-r from-cyan-700 to-blue-700 bg-clip-text text-transparent">
                参加コードでクイズに参加しよう！
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl blur-lg opacity-30 scale-110"></div>
            <div className="relative bg-gradient-to-br from-cyan-100 via-blue-50 to-cyan-100 px-16 py-10 rounded-xl border-2 border-cyan-300 shadow-2xl transform hover:scale-105 hover:shadow-cyan-200/50 transition-all duration-300">
              <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent rounded-t-xl"></div>
              <div className="relative">
                <span className="text-8xl md:text-9xl font-mono font-black bg-gradient-to-r from-cyan-700 via-blue-600 to-cyan-700 bg-clip-text text-transparent tracking-wider drop-shadow-sm">
                  {roomCode || '------'}
                </span>
              </div>
            </div>
            <div className="absolute -top-3 -left-3 w-6 h-6 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full shadow-lg"></div>
            <div className="absolute -bottom-3 -right-3 w-5 h-5 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full shadow-lg"></div>
            <div className="absolute top-1/2 -right-2 w-3 h-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full shadow-md"></div>
          </div>
        </div>

        <div className="text-center max-w-md">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-100 to-blue-100 rounded-2xl blur-sm opacity-50 scale-105"></div>
            <div className="relative bg-gradient-to-r from-cyan-50 to-blue-50 px-8 py-6 rounded-2xl border border-cyan-200">
              <h3 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-cyan-700 to-blue-700 bg-clip-text text-transparent mb-4">
                QRコードで参加
              </h3>
              <div className="relative inline-block mb-4">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl blur-lg opacity-30 scale-110"></div>
                <div className="relative bg-gradient-to-br from-cyan-100 via-blue-50 to-cyan-100 px-8 py-8 rounded-xl border-2 border-cyan-300 shadow-2xl transform hover:scale-105 hover:shadow-cyan-200/50 transition-all duration-300">
                  <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent rounded-t-xl"></div>
                  {joinUrl ? (
                    <QRCode value={joinUrl} size={300} className="rounded-lg" />
                  ) : (
                    <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                      <p className="text-gray-500">QRコード生成中...</p>
                    </div>
                  )}
                  <div className="absolute -top-3 -left-3 w-6 h-6 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full shadow-lg"></div>
                  <div className="absolute -bottom-3 -right-3 w-5 h-5 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full shadow-lg"></div>
                  <div className="absolute top-1/2 -right-2 w-3 h-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full shadow-md"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Main>
  </PageContainer>
);

//----------------------------------------------------
// 10. Custom Hooks
//----------------------------------------------------
/**
 * Hook: useHostScreenTimer
 * Description:
 * - Manages timer calculations and phase transitions for host screen
 */
function useHostScreenTimer({
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
}: {
  currentPhase: PublicPhase;
  gameFlow: unknown;
  timerState: { remainingMs?: number; startTime?: Date } | null;
  currentQuestion: Question;
  questionRemainingMs: number | null;
  answerRemainingMs: number | null;
  setQuestionRemainingMs: React.Dispatch<React.SetStateAction<number | null>>;
  setAnswerRemainingMs: React.Dispatch<React.SetStateAction<number | null>>;
  setAnswerDurationMs: React.Dispatch<React.SetStateAction<number | null>>;
  setIsDisplayPhaseDone: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentPhase: React.Dispatch<React.SetStateAction<PublicPhase>>;
  questionTimerInitializedRef: React.MutableRefObject<string | null>;
  previousPhaseRef: React.MutableRefObject<PublicPhase | null>;
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
            setCurrentPhase('answering');
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
        setCurrentPhase('answering');
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
 * Hook: useHostScreenWebSocket
 * Description:
 * - Manages WebSocket connection and event handlers for host screen
 */
function useHostScreenWebSocket({
  gameId,
  roomCode,
  socket,
  isConnected,
  joinRoom,
  leaveRoom,
  gameFlowRef,
  currentPhaseRef,
  setCurrentPhase,
  setAnswerStats,
  setCountdownStartedAt,
}: {
  gameId: string | null;
  roomCode: string;
  socket: ReturnType<typeof useSocket>['socket'];
  isConnected: boolean;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  gameFlowRef: React.MutableRefObject<unknown>;
  currentPhaseRef: React.MutableRefObject<PublicPhase>;
  setCurrentPhase: React.Dispatch<React.SetStateAction<PublicPhase>>;
  setAnswerStats: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  setCountdownStartedAt: React.Dispatch<React.SetStateAction<number | undefined>>;
}) {
  const hasJoinedRoomRef = useRef(false);
  const socketIdRef = useRef<string | null>(null);

  const handleStatsUpdate = useCallback(
    (data: StatsUpdateData) => {
      if (
        data.roomId === gameId &&
        data.questionId ===
          (gameFlowRef.current as { current_question_id?: string })?.current_question_id
      ) {
        setAnswerStats(data.counts);
      }
    },
    [gameId, gameFlowRef, setAnswerStats],
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
    },
    [gameId, gameFlowRef, setAnswerStats, setCurrentPhase],
  );

  const handlePhaseChange = useCallback(
    (data: PhaseChangeData) => {
      if (data.roomId !== gameId) return;

      const current = currentPhaseRef.current;
      if (data.phase !== 'waiting') {
        const isValidTransition =
          (current === 'explanation' && data.phase === 'countdown') ||
          (current === 'leaderboard' && data.phase === 'countdown') ||
          data.phase === 'explanation' ||
          data.phase === 'leaderboard';

        const currentRank = PHASE_PRIORITY[current];
        const nextRank = PHASE_PRIORITY[data.phase];
        if (
          !isValidTransition &&
          Number.isFinite(currentRank) &&
          Number.isFinite(nextRank) &&
          nextRank < currentRank
        ) {
          return;
        }
      }

      if (current !== data.phase) {
        setCurrentPhase(data.phase);
      }

      if (data.phase === 'countdown' && data.startedAt) {
        setCountdownStartedAt(data.startedAt);
      }
    },
    [gameId, currentPhaseRef, setCurrentPhase, setCountdownStartedAt],
  );

  const handleGameStarted = useCallback(
    (data: GameEventData) => {
      const targetGameId = data.gameId || data.roomId;
      if (targetGameId === gameId || data.roomCode === roomCode) {
        setCurrentPhase('countdown');
      }
    },
    [gameId, roomCode, setCurrentPhase],
  );

  const handleGamePause = useCallback(() => {}, []);
  const handleGameResume = useCallback(() => {}, []);
  const handleGameEnd = useCallback(
    (data: GameEventData) => {
      const targetGameId = data.gameId;
      if (targetGameId === gameId) {
        setCurrentPhase('ended');
      }
    },
    [gameId, setCurrentPhase],
  );

  const setupSocketListeners = useCallback(
    (currentSocket: typeof socket) => {
      if (!currentSocket) return () => {};

      currentSocket.on('game:answer:stats:update', handleStatsUpdate);
      currentSocket.on('game:answer:stats', handleStatsUpdate);
      currentSocket.on('game:answer:locked', handleAnswerLocked);
      currentSocket.on('game:phase:change', handlePhaseChange);
      currentSocket.on('game:started', handleGameStarted);
      currentSocket.on('game:pause', handleGamePause);
      currentSocket.on('game:resume', handleGameResume);
      currentSocket.on('game:end', handleGameEnd);

      return () => {
        currentSocket.off('game:answer:stats:update', handleStatsUpdate);
        currentSocket.off('game:answer:stats', handleStatsUpdate);
        currentSocket.off('game:answer:locked', handleAnswerLocked);
        currentSocket.off('game:phase:change', handlePhaseChange);
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
    ],
  );

  const joinRoomSafe = useCallback(() => {
    if (hasJoinedRoomRef.current) {
      return;
    }
    if (isConnected) {
      joinRoom(gameId || '');
      hasJoinedRoomRef.current = true;
    }
  }, [gameId, joinRoom, isConnected]);

  useEffect(() => {
    if (!socket || !isConnected || !gameId) return;

    const currentSocketId = socket.id || null;
    if (socketIdRef.current !== currentSocketId) {
      if (socketIdRef.current) {
        hasJoinedRoomRef.current = false;
      }
      socketIdRef.current = currentSocketId;
    }

    const cleanupListeners = setupSocketListeners(socket);
    joinRoomSafe();

    return () => {
      cleanupListeners();
      if (gameId && hasJoinedRoomRef.current) {
        leaveRoom(gameId);
        hasJoinedRoomRef.current = false;
      }
    };
  }, [socket, isConnected, gameId, joinRoom, leaveRoom, joinRoomSafe, setupSocketListeners]);
}

//----------------------------------------------------
// 11. Main Page Content Component
//----------------------------------------------------
/**
 * Component: HostScreenContent
 * Description:
 * - Public display screen for live quiz games
 * - Real-time synchronization with host control panel
 * - Manages all game phases and timer synchronization
 *
 * Features:
 * - Real-time WebSocket synchronization
 * - Complex timer management matching game-player page
 * - Phase transition management
 * - Answer statistics tracking
 * - Leaderboard updates
 * - Read-only display (no answer submission)
 *
 * Incomplete Features:
 * - None identified
 */
function HostScreenContent() {
  //----------------------------------------------------
  // 11.1. Hooks & Router Setup
  //----------------------------------------------------
  const searchParams = useSearchParams();
  const roomCode = searchParams.get('code') || '';
  const gameIdParam = searchParams.get('gameId') || '';

  //----------------------------------------------------
  // 11.2. State Management
  //----------------------------------------------------
  const [joinUrl, setJoinUrl] = useState('');
  const [gameId, setGameId] = useState<string | null>(gameIdParam || null);
  const [currentPhase, setCurrentPhase] = useState<PublicPhase>(DEFAULT_PHASE);
  const [questions, setQuestions] = useState<QuestionWithAnswers[]>([]);
  const [answerStats, setAnswerStats] = useState<Record<string, number>>({});
  const [currentQuestionData, setCurrentQuestionData] = useState<CurrentQuestionData | null>(null);
  const [countdownStartedAt, setCountdownStartedAt] = useState<number | undefined>(undefined);
  const [isDisplayPhaseDone, setIsDisplayPhaseDone] = useState(false);
  const [answerDurationMs, setAnswerDurationMs] = useState<number | null>(null);
  const [answerRemainingMs, setAnswerRemainingMs] = useState<number | null>(null);
  const [questionRemainingMs, setQuestionRemainingMs] = useState<number | null>(null);
  const [explanationData, setExplanationData] = useState<ExplanationData | null>(null);

  //----------------------------------------------------
  // 11.3. Custom Hooks
  //----------------------------------------------------
  const { socket, isConnected, joinRoom, leaveRoom } = useSocket();

  useEffect(() => {
    const origin = window.location.origin;
    const url = `${origin}/join${roomCode ? `?code=${encodeURIComponent(roomCode)}` : ''}`;
    setJoinUrl(url);
  }, [roomCode]);

  useEffect(() => {
    currentPhaseRef.current = currentPhase;
  }, [currentPhase]);

  useEffect(() => {
    if (gameId || !roomCode) return;

    const getGameIdFromCode = async () => {
      try {
        const storedGameId = sessionStorage.getItem(`game_${roomCode}`);
        if (storedGameId) {
          setGameId(storedGameId);
          return;
        }

        const { data: game, error } = await gameApi.getGameByCode(roomCode);
        if (error || !game) {
          return;
        }
        setGameId(game.id);
        sessionStorage.setItem(`game_${roomCode}`, game.id);
      } catch {}
    };

    getGameIdFromCode();
  }, [roomCode, gameId]);

  useEffect(() => {
    if (!gameId) return;
    const loadQuiz = async () => {
      try {
        const { data: game, error } = await gameApi.getGame(gameId);
        if (error || !game) {
          return;
        }
        const quizSetId = game?.quiz_id || game?.quiz_set_id;
        if (quizSetId) {
          const quiz = await quizService.getQuizComplete(quizSetId);
          const sorted = [...quiz.questions].sort((a, b) => a.order_index - b.order_index);
          setQuestions(sorted);
        }
      } catch {}
    };
    loadQuiz();
  }, [gameId]);

  const { gameFlow, timerState } = useGameFlow({
    gameId: gameId || '',
    isHost: false,
    autoSync: true,
    triggerOnQuestionEndOnTimer: false,
    events: {
      onQuestionStart: (qId) => {
        const isNewQuestion = qId && qId !== currentQuestionIdRef.current;
        currentQuestionIdRef.current = qId || null;

        const currentPhaseValue = currentPhaseRef.current;
        if (
          !isNewQuestion &&
          (currentPhaseValue === 'answering' ||
            currentPhaseValue === 'answer_reveal' ||
            currentPhaseValue === 'leaderboard' ||
            currentPhaseValue === 'explanation')
        ) {
          setIsDisplayPhaseDone(false);
          setAnswerRemainingMs(null);
          setQuestionRemainingMs(null);
          return;
        }

        setIsDisplayPhaseDone(false);
        setAnswerRemainingMs(null);
        setQuestionRemainingMs(null);
        setCurrentPhase('question');
      },
      onQuestionEnd: () => {
        setAnswerRemainingMs(0);
        setCurrentPhase('answer_reveal');
      },
      onAnswerReveal: () => {
        setCurrentPhase('answer_reveal');
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
        }
      },
      onExplanationHide: () => {},
      onGameEnd: () => {
        setCurrentPhase('podium');
      },
      onError: () => {},
    },
  });

  const { leaderboard, refreshLeaderboard } = useGameLeaderboard({
    gameId: gameId || '',
    autoRefresh: true,
  });

  //----------------------------------------------------
  // 11.4. Refs
  //----------------------------------------------------
  const gameFlowRef = useRef(gameFlow);
  const currentPhaseRef = useRef<PublicPhase>(DEFAULT_PHASE);
  const currentQuestionIdRef = useRef<string | null>(null);
  const questionTimerInitializedRef = useRef<string | null>(null);
  const previousPhaseRef = useRef<PublicPhase | null>(null);
  const hasTransitionedToRevealRef = useRef(false);

  //----------------------------------------------------
  // 11.5. Effects
  //----------------------------------------------------
  useEffect(() => {
    const origin = window.location.origin;
    const url = `${origin}/join${roomCode ? `?code=${encodeURIComponent(roomCode)}` : ''}`;
    setJoinUrl(url);
  }, [roomCode]);

  useEffect(() => {
    currentPhaseRef.current = currentPhase;
  }, [currentPhase]);

  useEffect(() => {
    gameFlowRef.current = gameFlow;
  }, [gameFlow]);

  useEffect(() => {
    currentQuestionIdRef.current = gameFlow?.current_question_id ?? null;
  }, [gameFlow?.current_question_id]);

  useEffect(() => {
    if (!gameFlow?.current_question_id) return;
    setIsDisplayPhaseDone(false);
    setAnswerDurationMs(null);
    setAnswerRemainingMs(null);
    setQuestionRemainingMs(null);
    setExplanationData(null);
  }, [gameFlow?.current_question_id]);

  useEffect(() => {
    if (gameId || !roomCode) return;

    const getGameIdFromCode = async () => {
      try {
        const storedGameId = sessionStorage.getItem(`game_${roomCode}`);
        if (storedGameId) {
          setGameId(storedGameId);
          return;
        }

        const { data: game, error } = await gameApi.getGameByCode(roomCode);
        if (error || !game) {
          return;
        }
        setGameId(game.id);
        sessionStorage.setItem(`game_${roomCode}`, game.id);
      } catch {}
    };

    getGameIdFromCode();
  }, [roomCode, gameId]);

  useEffect(() => {
    if (!gameId) return;
    const loadQuiz = async () => {
      try {
        const { data: game, error } = await gameApi.getGame(gameId);
        if (error || !game) {
          return;
        }
        const quizSetId = game?.quiz_id || game?.quiz_set_id;
        if (quizSetId) {
          const quiz = await quizService.getQuizComplete(quizSetId);
          const sorted = [...quiz.questions].sort((a, b) => a.order_index - b.order_index);
          setQuestions(sorted);
        }
      } catch {}
    };
    loadQuiz();
  }, [gameId]);

  // Extract current question ID for dependency array
  const currentQuestionId = gameFlow?.current_question_id;

  useEffect(() => {
    if (!gameId) {
      setCurrentQuestionData(null);
      return;
    }

    // Only require current_question_id if gameFlow exists and is loaded
    // This allows fetching even if gameFlow hasn't loaded yet (fallback to API)
    const currentQuestionIdFromFlow = currentQuestionId;
    if (gameFlow && !currentQuestionIdFromFlow) {
      setCurrentQuestionData(null);
      return;
    }

    // Log when question fetch is triggered for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('[HostScreen] Fetching current question:', {
        gameId,
        questionId: currentQuestionIdFromFlow,
        hasGameFlow: !!gameFlow,
      });
    }

    // Track if we're currently fetching to prevent duplicate requests
    let isFetching = false;
    let fetchTimeout: NodeJS.Timeout | null = null;
    // Track last fetched question ID to prevent redundant fetches
    // Use object ref to persist across async operations
    const lastFetchedQuestionIdRef = { value: null as string | null };

    // Reset tracked question ID if it changed
    if (currentQuestionIdFromFlow && lastFetchedQuestionIdRef.value !== currentQuestionIdFromFlow) {
      lastFetchedQuestionIdRef.value = null;
    }

    const fetchCurrentQuestion = async (retryCount = 0, isRetry = false) => {
      // Prevent multiple simultaneous fetches
      if (isFetching && !isRetry) {
        return;
      }

      // Skip if we've already fetched this question (unless it's a retry)
      if (
        !isRetry &&
        currentQuestionIdFromFlow &&
        lastFetchedQuestionIdRef.value === currentQuestionIdFromFlow
      ) {
        return;
      }

      isFetching = true;

      try {
        const { data, error } = await gameApi.getCurrentQuestion(gameId);

        if (error) {
          // Log error for debugging (only in development or first retry)
          if (retryCount === 0) {
            console.warn('[HostScreen] Failed to fetch current question:', {
              error: error.error,
              message: error.message,
              statusCode: error.statusCode,
              gameId,
              retryCount,
            });
          }

          // Retry 404 errors when transitioning to question phase (question might not be ready yet)
          // This is common when transitioning from countdown to question
          if (error.statusCode === 404 && retryCount < 3) {
            const delayMs = 500 * (retryCount + 1); // 500ms, 1000ms, 1500ms
            await new Promise((resolve) => setTimeout(resolve, delayMs));
            isFetching = false;
            return fetchCurrentQuestion(retryCount + 1, true);
          }

          // Don't retry 404 after max retries - question genuinely doesn't exist
          if (error.statusCode === 404) {
            isFetching = false;
            return;
          }

          // Retry network errors up to 2 times
          if (
            (error.error === 'network_error' || error.statusCode === undefined) &&
            retryCount < 2
          ) {
            await new Promise((resolve) => setTimeout(resolve, 1000 * (retryCount + 1)));
            isFetching = false;
            return fetchCurrentQuestion(retryCount + 1, true);
          }

          isFetching = false;
          return;
        }

        if (!data) {
          isFetching = false;
          return;
        }

        const answeringTime = data.question.answering_time || DEFAULT_ANSWERING_TIME_SECONDS;
        const showQuestionTime =
          data.question.show_question_time || DEFAULT_SHOW_QUESTION_TIME_SECONDS;
        const timeLimit = showQuestionTime + answeringTime;

        const question: Question = {
          id: data.question.id,
          text: data.question.text,
          image: data.question.image_url || undefined,
          timeLimit,
          show_question_time: showQuestionTime,
          answering_time: answeringTime,
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
          type: (data.question.type as Question['type']) || 'multiple_choice_4',
        };

        if (data.question.image_url) {
          const img = new Image();
          img.src = data.question.image_url;
        }

        setCurrentQuestionData({
          question,
          serverTime: data.server_time,
          isActive: data.is_active,
          answeringTime,
          showQuestionTime,
          showExplanationTime: data.question.show_explanation_time,
          totalQuestions: data.total_questions,
        });

        // Track the successfully fetched question ID
        if (currentQuestionIdFromFlow) {
          lastFetchedQuestionIdRef.value = currentQuestionIdFromFlow;
        }

        isFetching = false;
      } catch (err) {
        // Log unexpected errors for debugging
        console.error('[HostScreen] Unexpected error fetching current question:', {
          error: err,
          gameId,
          retryCount,
        });

        // Retry on unexpected errors (likely network issues)
        if (retryCount < 2) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * (retryCount + 1)));
          isFetching = false;
          return fetchCurrentQuestion(retryCount + 1, true);
        }

        isFetching = false;
      }
    };

    // Add a small delay when transitioning to question phase to allow backend to be ready
    // This helps prevent 404 errors during countdown->question transition
    const shouldDelay = currentQuestionIdFromFlow && gameFlow; // Only delay if we have question ID

    if (shouldDelay) {
      fetchTimeout = setTimeout(() => {
        fetchCurrentQuestion();
      }, 200); // 200ms delay to allow backend to be ready
    } else {
      fetchCurrentQuestion();
    }

    const refreshInterval = setInterval(() => {
      if (!isFetching) {
        fetchCurrentQuestion();
      }
    }, QUESTION_REFRESH_INTERVAL_MS);

    return () => {
      if (fetchTimeout) {
        clearTimeout(fetchTimeout);
      }
      clearInterval(refreshInterval);
      isFetching = false;
    };
    // Only depend on current_question_id, not the entire gameFlow object
    // This prevents the effect from firing on every gameFlow update
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId, currentQuestionId]);

  //----------------------------------------------------
  // 11.6. WebSocket Setup
  //----------------------------------------------------
  useHostScreenWebSocket({
    gameId,
    roomCode,
    socket,
    isConnected,
    joinRoom,
    leaveRoom,
    gameFlowRef,
    currentPhaseRef,
    setCurrentPhase,
    setAnswerStats,
    setCountdownStartedAt,
  });

  useEffect(() => {
    if (!gameFlow?.current_question_id) return;
    setIsDisplayPhaseDone(false);
    setAnswerRemainingMs(null);
    setQuestionRemainingMs(null);
    setAnswerStats({});
    setExplanationData(null);
  }, [gameFlow?.current_question_id]);

  useEffect(() => {
    if (!gameFlow) return;
    if (currentPhase === 'countdown') return;
    if (
      currentPhase === 'answer_reveal' ||
      currentPhase === 'leaderboard' ||
      currentPhase === 'explanation'
    ) {
      return;
    }
    if (gameFlow.current_question_id && timerState?.isActive) {
      const canPromoteToQuestion =
        currentPhase === 'waiting' || currentPhase === 'ended' || currentPhase === 'podium';
      if (canPromoteToQuestion) {
        setIsDisplayPhaseDone(false);
        setCurrentPhase('question');
      }
    }
  }, [gameFlow, gameFlow?.current_question_id, timerState?.isActive, currentPhase]);

  //----------------------------------------------------
  // 11.7. Additional Computed Values
  //----------------------------------------------------
  const currentQuestion: Question = useMemo(() => {
    const durationFromFlowSeconds =
      gameFlow?.current_question_start_time && gameFlow?.current_question_end_time
        ? Math.max(
            1,
            Math.round(
              (new Date(gameFlow.current_question_end_time).getTime() -
                new Date(gameFlow.current_question_start_time).getTime()) /
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

    const idx = gameFlow?.current_question_index ?? DEFAULT_QUESTION_INDEX;
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
      id: gameFlow?.current_question_id || 'loading',
      text: questions.length === 0 ? 'クイズデータを読み込み中...' : '読み込み中...',
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
  }, [
    currentQuestionData,
    gameFlow?.current_question_id,
    gameFlow?.current_question_index,
    gameFlow?.current_question_start_time,
    gameFlow?.current_question_end_time,
    questions,
    timerState?.remainingMs,
  ]);

  //----------------------------------------------------
  // 11.8. Timer Management
  //----------------------------------------------------
  const { displayRemainingMs, currentTimeSeconds, viewingRemainingMs } = useHostScreenTimer({
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
  });

  //----------------------------------------------------
  // 11.9. Event Handlers
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
    setCurrentPhase('answering');
  }, [currentQuestion.answering_time, isDisplayPhaseDone]);

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
  }, [currentPhase, answerRemainingMs]);

  const questionIndex = gameFlow?.current_question_index ?? 0;
  const totalQuestionsCount = useMemo(() => {
    if (currentQuestionData?.totalQuestions) {
      return currentQuestionData.totalQuestions;
    }
    return questions.length || DEFAULT_TOTAL_QUESTIONS;
  }, [currentQuestionData?.totalQuestions, questions.length]);

  const leaderboardEntries = useMemo(() => {
    if (!Array.isArray(leaderboard)) return [];
    return leaderboard
      .map((entry) => ({
        playerId: entry.player_id,
        playerName: entry.player_name,
        score: entry.score,
        rank: entry.rank,
        previousRank: entry.previous_rank ?? entry.rank,
        rankChange: (entry.rank_change || 'same') as 'up' | 'down' | 'same',
        scoreChange: entry.score_change ?? 0,
      }))
      .sort((a, b) => (a.rank || 0) - (b.rank || 0));
  }, [leaderboard]);

  useEffect(() => {
    if (currentPhase === 'leaderboard' && gameId && refreshLeaderboard) {
      refreshLeaderboard();
    }
  }, [currentPhase, gameId, refreshLeaderboard]);

  useEffect(() => {
    if (currentPhase === 'leaderboard' && gameFlow) {
      const currentQuestionNum = questionIndex + 1;
      const isLastQuestion = currentQuestionNum >= totalQuestionsCount;

      if (isLastQuestion) {
        setCurrentPhase('podium');
      }
    }
  }, [currentPhase, gameFlow, questionIndex, totalQuestionsCount]);

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
        } catch {}
      };
      fetchExplanation();
    }
  }, [currentPhase, gameId, gameFlow?.current_question_id, explanationData]);

  const leaderboardData: LeaderboardData = useMemo(
    () => ({
      entries: leaderboardEntries,
      questionNumber: questionIndex + 1,
      totalQuestions: totalQuestionsCount,
      timeRemaining: Math.max(0, Math.round((timerState?.remainingMs || 5000) / 1000)),
      timeLimit: LEADERBOARD_TIME_LIMIT_SECONDS,
    }),
    [leaderboardEntries, questionIndex, totalQuestionsCount, timerState?.remainingMs],
  );

  //----------------------------------------------------
  // 11.10. Loading State
  //----------------------------------------------------
  // (Loading handled by game flow hook)

  //----------------------------------------------------
  // 11.11. Error State
  //----------------------------------------------------
  // (Errors handled silently - public screen is read-only)

  //----------------------------------------------------
  // 11.12. Main Render
  //----------------------------------------------------
  switch (currentPhase) {
    case 'countdown':
      return (
        <PublicCountdownScreen
          countdownTime={COUNTDOWN_TIME_SECONDS}
          questionNumber={questionIndex + 1}
          totalQuestions={totalQuestionsCount}
          startedAt={countdownStartedAt}
          onCountdownComplete={() => {}}
        />
      );

    case 'question':
      return (
        <HostQuestionScreen
          question={{
            ...currentQuestion,
            timeLimit: currentQuestion.show_question_time,
          }}
          currentTime={currentTimeSeconds}
          questionNumber={questionIndex + 1}
          totalQuestions={totalQuestionsCount}
        />
      );

    case 'answering':
      return (
        <HostAnswerScreen
          question={{
            ...currentQuestion,
            timeLimit: currentQuestion.answering_time,
          }}
          currentTime={currentTimeSeconds}
          questionNumber={questionIndex + 1}
          totalQuestions={totalQuestionsCount}
        />
      );

    case 'answer_reveal':
      return (
        <AnswerRevealContent
          currentQuestion={currentQuestion}
          answerStats={answerStats}
          leaderboard={leaderboard}
          leaderboardEntries={leaderboardEntries}
          questionIndex={questionIndex}
          totalQuestionsCount={totalQuestionsCount}
        />
      );

    case 'leaderboard':
      return (
        <LeaderboardContent
          questionIndex={questionIndex}
          totalQuestionsCount={totalQuestionsCount}
          leaderboardData={leaderboardData}
        />
      );

    case 'explanation':
      return (
        <ExplanationContent
          questionIndex={questionIndex}
          totalQuestionsCount={totalQuestionsCount}
          currentQuestionData={currentQuestionData}
          explanationData={explanationData}
          currentQuestion={currentQuestion}
        />
      );

    case 'podium':
      return (
        <PodiumContent
          leaderboard={leaderboard}
          leaderboardEntries={leaderboardEntries}
          setCurrentPhase={setCurrentPhase}
        />
      );

    case 'ended':
      return <EndedScreen />;

    case 'waiting':
    default:
      return <WaitingScreen roomCode={roomCode} joinUrl={joinUrl} />;
  }
}

//----------------------------------------------------
// 12. Main Page Component (with Providers)
//----------------------------------------------------
/**
 * Component: HostScreenPage
 * Description:
 * - Wraps HostScreenContent with Suspense boundary
 * - Handles loading state for search params
 */
export default function HostScreenPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HostScreenContent />
    </Suspense>
  );
}
