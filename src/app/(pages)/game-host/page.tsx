// ====================================================
// File Name   : page.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-12-12
// Last Update : 2026-01-03
//
// Description:
// - Host control panel for managing live quiz games
// - Real-time game flow control with phase management
// - Player rankings, answer statistics, and analytics
// - WebSocket integration for real-time updates
//
// Notes:
// - Uses WebSocket for real-time synchronization
// - Manages complex game phase transitions
// - Auto-starts questions after countdown
// - Supports public screen display
// ====================================================

'use client';

//----------------------------------------------------
// 1. React & Next.js Imports
//----------------------------------------------------
import React, { Suspense, useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

//----------------------------------------------------
// 2. External Library Imports
//----------------------------------------------------
import { Clock, Play, Eye, EyeOff, BarChart3, Users, Trophy, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

//----------------------------------------------------
// 3. Internal Component Imports
//----------------------------------------------------
import { Header, PageContainer, Container, Main } from '@/components/ui';

//----------------------------------------------------
// 4. Service & Hook Imports
//----------------------------------------------------
import { useGameFlow } from '@/hooks/useGameFlow';
import { useGameLeaderboard } from '@/hooks/useGameLeaderboard';
import { useSocket } from '@/components/providers/SocketProvider';
import { gameApi } from '@/services/gameApi';
import { quizService } from '@/lib/quizService';

//----------------------------------------------------
// 5. Type Imports
//----------------------------------------------------
import type { PlayersResponse } from '@/services/gameApi';
import type { QuestionWithAnswers } from '@/types/quiz';

//----------------------------------------------------
// 6. Constants / Configuration
//----------------------------------------------------
const PLAYERS_REFRESH_INTERVAL_MS = 5000;
const COUNTDOWN_DURATION_MS = 3500;
const PUBLIC_SCREEN_WIDTH = 1200;
const PUBLIC_SCREEN_HEIGHT = 800;
const MS_PER_SECOND = 1000;
const MIN_BAR_WIDTH_PERCENT = 2;

const PHASE_PRIORITY: Record<HostPhase, number> = {
  waiting: 0,
  countdown: 1,
  question: 2,
  answer_reveal: 3,
  leaderboard: 4,
  explanation: 5,
  podium: 6,
  ended: 7,
} as const;

const ANSWER_LETTERS = ['A', 'B', 'C', 'D'] as const;

const PHASE_LABELS: Record<HostPhase, string> = {
  waiting: '待機中',
  countdown: '次の問題準備中',
  question: '問題中',
  answer_reveal: '答え表示',
  leaderboard: 'ランキング',
  explanation: '解説',
  podium: '表彰台',
  ended: 'ゲーム終了',
} as const;

//----------------------------------------------------
// 7. Query Client Instance
//----------------------------------------------------
// (Not needed - using hooks)

//----------------------------------------------------
// 8. Types / Interfaces
//----------------------------------------------------
type HostPhase =
  | 'waiting'
  | 'countdown'
  | 'question'
  | 'answer_reveal'
  | 'leaderboard'
  | 'explanation'
  | 'podium'
  | 'ended';

interface PhaseChangeData {
  roomId: string;
  phase: HostPhase;
}

interface StatsUpdateData {
  roomId: string;
  questionId: string;
  counts: Record<string, number>;
}

interface GameControlsProps {
  currentPhase: HostPhase;
  currentQuestionIndex: number;
  totalQuestions: number;
  currentTimeSeconds: number;
  timerState: { isActive: boolean } | null;
  flowLoading: boolean;
  currentQuestion: QuestionWithAnswers | null;
  onStartQuestion: () => void;
  onRevealAnswer: () => void;
  onNextPhase: () => void;
  nextButtonLabel: string;
}

interface PlayerRankingsProps {
  leaderboard: Array<{
    player_id: string;
    player_name: string;
    score: number;
    rank?: number;
    accuracy?: number;
  }>;
  isLoadingPlayers: boolean;
}

interface AnalyticsPanelProps {
  connectedPlayers: number;
  totalAnswered: number;
  answerRate: number;
}

interface AnswerDistributionProps {
  currentQuestion: QuestionWithAnswers;
  answerStats: Record<string, number>;
  totalAnswered: number;
  currentPhase: HostPhase;
}

//----------------------------------------------------
// 9. Helper Components
//----------------------------------------------------
/**
 * Component: GameControls
 * Description:
 * - Left panel with game control buttons and phase information
 * - Displays current question number and timer
 * - Phase-specific action buttons
 *
 * Props:
 * - All GameControlsProps properties
 */
const GameControls: React.FC<GameControlsProps> = ({
  currentPhase,
  currentQuestionIndex,
  totalQuestions,
  currentTimeSeconds,
  timerState,
  flowLoading,
  currentQuestion,
  onStartQuestion,
  onRevealAnswer,
  onNextPhase,
  nextButtonLabel,
}) => (
  <div className="lg:col-span-1 space-y-4">
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
      <h3 className="text-lg font-semibold text-blue-600 mb-4 flex items-center">
        <Clock className="w-5 h-5 mr-2" />
        ゲーム制御
      </h3>

      <div className="space-y-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600">
            {currentQuestionIndex + 1} / {totalQuestions || '?'}
          </div>
          <div className="text-sm text-blue-300">現在の問題</div>
          {timerState?.isActive && (
            <div className="text-2xl font-bold text-green-500 mt-2">{currentTimeSeconds}s</div>
          )}
        </div>

        <div className="space-y-2">
          {currentPhase === 'countdown' || currentPhase === 'waiting' ? (
            <button
              onClick={onStartQuestion}
              disabled={flowLoading || !currentQuestion}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-500 disabled:to-gray-600 text-white py-3 px-4 rounded-lg transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Play className="w-5 h-5" />
              <span>問題を開始</span>
            </button>
          ) : currentPhase === 'question' ? (
            <button
              onClick={onRevealAnswer}
              disabled={flowLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-gray-500 disabled:to-gray-600 text-white py-3 px-4 rounded-lg transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Eye className="w-5 h-5" />
              <span>答えを表示</span>
            </button>
          ) : (
            <button
              onClick={onNextPhase}
              disabled={flowLoading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-gray-500 disabled:to-gray-600 text-white py-3 px-4 rounded-lg transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <ChevronRight className="w-5 h-5" />
              <span>{nextButtonLabel}</span>
            </button>
          )}

          <div className="pt-2 border-t border-white/10">
            <div className="text-xs text-gray-400 mb-1">現在のフェーズ</div>
            <div className="text-sm font-semibold text-white capitalize">
              {PHASE_LABELS[currentPhase]}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

/**
 * Component: PlayerRankings
 * Description:
 * - Center panel displaying player leaderboard
 * - Shows rankings with medals for top 3
 * - Displays player scores and accuracy
 *
 * Props:
 * - leaderboard (Array): Leaderboard entries
 * - isLoadingPlayers (boolean): Loading state
 */
const PlayerRankings: React.FC<PlayerRankingsProps> = ({ leaderboard, isLoadingPlayers }) => (
  <div className="lg:col-span-2 space-y-4">
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 h-full">
      <h3 className="text-lg font-semibold text-blue-600 mb-4 flex items-center">
        <Trophy className="w-5 h-5 mr-2" />
        プレイヤーランキング
      </h3>

      {isLoadingPlayers ? (
        <div className="text-center py-8 text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2">プレイヤーを読み込み中...</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {Array.isArray(leaderboard) && leaderboard.length > 0 ? (
            leaderboard
              .sort((a, b) => (a.rank || 0) - (b.rank || 0))
              .map((entry, index) => {
                const getRankStyle = () => {
                  if (index === 0)
                    return 'bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 border border-yellow-400/30';
                  if (index === 1)
                    return 'bg-gradient-to-r from-gray-300/20 to-gray-500/20 border border-gray-300/30';
                  if (index === 2)
                    return 'bg-gradient-to-r from-orange-400/20 to-orange-600/20 border border-orange-400/30';
                  return 'bg-white/5 border border-white/10';
                };

                const getBadgeStyle = () => {
                  if (index === 0) return 'bg-yellow-400 text-yellow-900';
                  if (index === 1) return 'bg-gray-300 text-gray-900';
                  if (index === 2) return 'bg-orange-400 text-orange-900';
                  return 'bg-gray-600 text-white';
                };

                return (
                  <div
                    key={entry.player_id}
                    className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${getRankStyle()}`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getBadgeStyle()}`}
                      >
                        {entry.rank || index + 1}
                      </div>
                      <div>
                        <div className="text-white font-medium">{entry.player_name}</div>
                        <div className="text-xs text-blue-400">
                          正解率: {entry.accuracy ? Math.round(entry.accuracy) : 0}%
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-bold">{entry.score.toLocaleString()}</div>
                      <div className="text-xs text-blue-400">ポイント</div>
                    </div>
                  </div>
                );
              })
          ) : (
            <div className="text-center py-8 text-gray-500">プレイヤーがいません</div>
          )}
        </div>
      )}
    </div>
  </div>
);

/**
 * Component: AnalyticsPanel
 * Description:
 * - Displays game analytics metrics
 * - Shows connected players, answered count, and answer rate
 *
 * Props:
 * - connectedPlayers (number): Number of connected players
 * - totalAnswered (number): Total answers received
 * - answerRate (number): Answer rate percentage
 */
const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({
  connectedPlayers,
  totalAnswered,
  answerRate,
}) => (
  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
      <BarChart3 className="w-5 h-5 mr-2" />
      分析
    </h3>

    <div className="space-y-4">
      <div className="text-center">
        <div className="text-2xl font-bold text-white">{connectedPlayers}</div>
        <div className="text-sm text-blue-400">接続中プレイヤー</div>
      </div>

      <div className="text-center">
        <div className="text-2xl font-bold text-cyan-400">{totalAnswered}</div>
        <div className="text-sm text-blue-400">回答済み</div>
      </div>

      <div className="text-center">
        <div className="text-2xl font-bold text-green-400">{answerRate}%</div>
        <div className="text-sm text-blue-400">回答率</div>
      </div>
    </div>
  </div>
);

/**
 * Component: AnswerDistribution
 * Description:
 * - Displays answer distribution for current question
 * - Shows answer statistics with visual bars
 * - Highlights correct answer when revealed
 *
 * Props:
 * - currentQuestion (QuestionWithAnswers): Current question data
 * - answerStats (Record<string, number>): Answer statistics
 * - totalAnswered (number): Total answers received
 * - currentPhase (HostPhase): Current game phase
 */
const AnswerDistribution: React.FC<AnswerDistributionProps> = ({
  currentQuestion,
  answerStats,
  totalAnswered,
  currentPhase,
}) => {
  const correctAnswerId = currentQuestion.answers.find((a) => a.is_correct)?.id || '';
  const correctAnswerCount = answerStats[correctAnswerId] || 0;
  const correctRate =
    totalAnswered > 0 ? Math.round((correctAnswerCount / totalAnswered) * 100) : 0;

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <Users className="w-5 h-5 mr-2" />
        {currentPhase === 'answer_reveal' ? '回答結果' : '回答分布'}
      </h3>

      <div className="space-y-2">
        {currentQuestion.answers
          .sort((a, b) => a.order_index - b.order_index)
          .map((answer, idx) => {
            const letter = ANSWER_LETTERS[idx] || String.fromCharCode(65 + idx);
            const count = answerStats[answer.id] || 0;
            const percentage = totalAnswered > 0 ? (count / totalAnswered) * 100 : 0;
            const isCorrect = answer.is_correct;

            return (
              <div key={answer.id} className="space-y-1">
                <div className="flex justify-between text-sm items-center">
                  <span className="text-white flex items-center">
                    選択肢 {letter}
                    {isCorrect && <span className="ml-1 text-green-400 font-bold">✓ 正解</span>}
                    {currentPhase === 'answer_reveal' && !isCorrect && (
                      <span className="ml-1 text-gray-400 text-xs">(不正解)</span>
                    )}
                  </span>
                  <span
                    className={`font-semibold ${
                      currentPhase === 'answer_reveal' && isCorrect
                        ? 'text-green-400'
                        : 'text-blue-400'
                    }`}
                  >
                    {count}人 ({Math.round(percentage)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-700 h-2 rounded relative overflow-hidden">
                  <div
                    className={`h-2 transition-all duration-500 rounded ${
                      isCorrect
                        ? 'bg-gradient-to-r from-green-400 to-emerald-400'
                        : 'bg-gradient-to-r from-cyan-400 to-blue-400'
                    }`}
                    style={{ width: `${Math.max(percentage, MIN_BAR_WIDTH_PERCENT)}%` }}
                  />
                  {currentPhase === 'answer_reveal' && isCorrect && (
                    <div className="absolute inset-0 bg-green-400/20 animate-pulse"></div>
                  )}
                </div>
                {currentPhase === 'answer_reveal' && (
                  <div className="text-xs text-gray-400 mt-1">{answer.answer_text}</div>
                )}
              </div>
            );
          })}
      </div>

      {currentPhase === 'answer_reveal' && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">正解率</span>
            <span className="text-green-400 font-bold">{correctRate}%</span>
          </div>
        </div>
      )}
    </div>
  );
};

//----------------------------------------------------
// 10. Custom Hooks
//----------------------------------------------------
// (Custom hooks imported from @/hooks)

//----------------------------------------------------
// 11. Main Page Content Component
//----------------------------------------------------
/**
 * Component: HostGameContent
 * Description:
 * - Main host control panel for managing live quiz games
 * - Real-time game flow control with phase management
 * - Player rankings, answer statistics, and analytics
 *
 * Features:
 * - Real-time WebSocket synchronization
 * - Complex game phase transitions
 * - Auto-start questions after countdown
 * - Public screen display management
 * - Answer statistics tracking
 * - Player leaderboard updates
 *
 * Incomplete Features:
 * - None identified
 */
function HostGameContent() {
  //----------------------------------------------------
  // 11.1. Hooks & Router Setup
  //----------------------------------------------------
  const router = useRouter();
  const searchParams = useSearchParams();
  const gameId = searchParams.get('gameId') || '';
  const phaseParam = (searchParams.get('phase') as HostPhase) || 'waiting';
  const gameCode = searchParams.get('code') || '';
  const quizId = searchParams.get('quizId') || '';

  //----------------------------------------------------
  // 11.2. State Management
  //----------------------------------------------------
  const [currentPhase, setCurrentPhase] = useState<HostPhase>(phaseParam);
  const [isPublicScreenVisible, setIsPublicScreenVisible] = useState(false);
  const [questions, setQuestions] = useState<QuestionWithAnswers[]>([]);
  const [answerStats, setAnswerStats] = useState<Record<string, number>>({});
  const [players, setPlayers] = useState<PlayersResponse['players']>([]);
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionWithAnswers | null>(null);

  //----------------------------------------------------
  // 11.3. Custom Hooks
  //----------------------------------------------------
  const {
    gameFlow,
    timerState,
    startQuestion,
    revealAnswer,
    nextQuestion: nextQuestionFlow,
    loading: flowLoading,
  } = useGameFlow({
    gameId,
    isHost: true,
    autoSync: true,
    events: {
      onQuestionEnd: () => {
        const currentPhase = currentPhaseRef.current;
        if (currentPhase === 'question' || currentPhase === 'countdown') {
          setCurrentPhase('answer_reveal');
        }
      },
      onGameEnd: () => {
        setCurrentPhase('podium');
      },
    },
  });

  const { leaderboard, refreshLeaderboard } = useGameLeaderboard({
    gameId,
    autoRefresh: true,
  });

  const { socket, joinRoom: socketJoinRoom, leaveRoom: socketLeaveRoom } = useSocket();

  //----------------------------------------------------
  // 11.4. Refs
  //----------------------------------------------------
  const hasJoinedRoomRef = useRef(false);
  const socketIdRef = useRef<string | null>(null);
  const currentQuestionIdRef = useRef<string | null>(null);
  const currentPhaseRef = useRef<HostPhase>(phaseParam);
  const countdownEmittedRef = useRef<string | null>(null);

  //----------------------------------------------------
  // 11.5. Effects
  //----------------------------------------------------
  useEffect(() => {
    if (!gameId) return;
    const loadQuiz = async () => {
      try {
        const { data: game } = await gameApi.getGame(gameId);
        const quizId = game?.quiz_id || game?.quiz_set_id;
        if (quizId) {
          const quiz = await quizService.getQuizComplete(quizId);
          const sorted = [...quiz.questions].sort((a, b) => a.order_index - b.order_index);
          setQuestions(sorted);
        }
      } catch {
        toast.error('クイズデータの読み込みに失敗しました');
      }
    };
    loadQuiz();
  }, [gameId]);

  useEffect(() => {
    if (questions.length > 0 && gameFlow && gameFlow.current_question_index !== null) {
      const idx = gameFlow.current_question_index;
      setCurrentQuestion(questions[idx] || null);
      setAnswerStats({});
    }
  }, [questions, gameFlow]);

  useEffect(() => {
    currentQuestionIdRef.current = gameFlow?.current_question_id ?? null;
  }, [gameFlow?.current_question_id]);

  useEffect(() => {
    currentPhaseRef.current = currentPhase;
  }, [currentPhase]);

  useEffect(() => {
    if (!gameId) return;
    const wasPublicScreenOpen = sessionStorage.getItem(`public_screen_open_${gameId}`) === 'true';
    if (wasPublicScreenOpen) {
      setIsPublicScreenVisible(true);
    }
  }, [gameId]);

  useEffect(() => {
    if (currentPhase === 'leaderboard' && gameId && refreshLeaderboard) {
      refreshLeaderboard();
    }
  }, [currentPhase, gameId, refreshLeaderboard]);

  //----------------------------------------------------
  // 11.6. Helper Functions
  //----------------------------------------------------
  /**
   * Function: fetchPlayers
   * Description:
   * - Fetches current players list from API
   * - Filters out host players
   */
  const fetchPlayers = useCallback(async () => {
    if (!gameId) return;
    try {
      setIsLoadingPlayers(true);
      const { data, error } = await gameApi.getPlayers(gameId);
      if (error || !data) {
        return;
      }
      setPlayers(data.players.filter((p) => !p.is_host));
    } catch {
      // Error handled silently - players will refresh on next interval
    } finally {
      setIsLoadingPlayers(false);
    }
  }, [gameId]);

  useEffect(() => {
    if (!gameId) return;
    fetchPlayers();
    const interval = setInterval(fetchPlayers, PLAYERS_REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [gameId, fetchPlayers]);

  /**
   * Function: handleStatsUpdate
   * Description:
   * - Handles WebSocket answer statistics updates
   * - Only updates stats for current question
   */
  const handleStatsUpdate = useCallback(
    (data: StatsUpdateData) => {
      if (data.roomId === gameId && data.questionId === currentQuestionIdRef.current) {
        setAnswerStats(data.counts);
      }
    },
    [gameId],
  );

  /**
   * Function: handlePhaseChange
   * Description:
   * - Handles WebSocket phase change events
   * - Prevents invalid phase downgrades
   * - Allows valid transitions (explanation -> countdown)
   */
  const handlePhaseChange = useCallback(
    (data: PhaseChangeData) => {
      if (data.roomId !== gameId) return;

      const currentPhase = currentPhaseRef.current || 'waiting';
      const currentRank = PHASE_PRIORITY[currentPhase];
      const nextRank = PHASE_PRIORITY[data.phase];

      const isValidTransition =
        (currentPhase === 'explanation' && data.phase === 'countdown') ||
        (currentPhase === 'leaderboard' && data.phase === 'countdown');

      if (
        !isValidTransition &&
        Number.isFinite(currentRank) &&
        Number.isFinite(nextRank) &&
        nextRank < currentRank
      ) {
        return;
      }

      setCurrentPhase(data.phase);
    },
    [gameId],
  );

  useEffect(() => {
    if (!socket || !gameId || !socket.connected) return;

    const currentSocketId = socket.id || null;
    if (socketIdRef.current !== currentSocketId) {
      if (socketIdRef.current) {
        hasJoinedRoomRef.current = false;
      }
      socketIdRef.current = currentSocketId;
    }

    if (hasJoinedRoomRef.current) {
      return;
    }
    hasJoinedRoomRef.current = true;
    socketJoinRoom(gameId);

    socket.on('game:answer:stats:update', handleStatsUpdate);
    socket.on('game:phase:change', handlePhaseChange);

    return () => {
      socket.off('game:answer:stats:update', handleStatsUpdate);
      socket.off('game:phase:change', handlePhaseChange);
      if (gameId && hasJoinedRoomRef.current && socket) {
        socketLeaveRoom(gameId);
        hasJoinedRoomRef.current = false;
      }
    };
  }, [
    socket?.id,
    socket?.connected,
    gameId,
    socketJoinRoom,
    socketLeaveRoom,
    handleStatsUpdate,
    handlePhaseChange,
    socket,
  ]);

  //----------------------------------------------------
  // 11.7. Computed Values
  //----------------------------------------------------
  const currentQuestionIndex = gameFlow?.current_question_index ?? 0;
  const totalQuestions = questions.length;
  const currentTimeSeconds = Math.max(
    0,
    Math.round((timerState?.remainingMs || 0) / MS_PER_SECOND),
  );

  const totalPlayers = players.length;
  const connectedPlayers = players.length;
  const totalAnswered = (currentQuestion?.answers ?? []).reduce(
    (sum, answer) => sum + (answerStats[answer.id] ?? 0),
    0,
  );
  const answerRate = totalPlayers > 0 ? Math.round((totalAnswered / totalPlayers) * 100) : 0;

  //----------------------------------------------------
  // 11.8. Event Handlers
  //----------------------------------------------------
  const emitPhaseChange = useCallback(
    (phase: HostPhase, startedAt?: number) => {
      if (!socket || !gameId) {
        return;
      }
      socket.emit('game:phase:change', { roomId: gameId, phase, startedAt });
    },
    [socket, gameId],
  );

  const handleStartQuestion = useCallback(async () => {
    const questionId = currentQuestion?.id || gameFlow?.current_question_id;
    if (!gameId || !questionId) {
      toast.error('問題データが読み込まれていません');
      return;
    }
    try {
      await startQuestion(questionId, currentQuestionIndex);
      setCurrentPhase('question');
      emitPhaseChange('question');
      toast.success('問題を開始しました');
    } catch {
      toast.error('問題の開始に失敗しました');
    }
  }, [
    gameId,
    currentQuestion?.id,
    gameFlow?.current_question_id,
    currentQuestionIndex,
    startQuestion,
    emitPhaseChange,
  ]);

  const handleRevealAnswer = useCallback(async () => {
    if (!gameId) return;
    try {
      const result = await revealAnswer();
      if (result?.answerStats) {
        setAnswerStats(result.answerStats);
      }
      setCurrentPhase('answer_reveal');
      emitPhaseChange('answer_reveal');
      toast.success('答えを表示しました');
    } catch {
      toast.error('答えの表示に失敗しました');
    }
  }, [gameId, revealAnswer, emitPhaseChange]);

  const hasExplanation = useCallback(() => {
    if (!currentQuestion) return false;
    return !!(
      (currentQuestion.explanation_text && currentQuestion.explanation_text.trim() !== '') ||
      (currentQuestion.explanation_title && currentQuestion.explanation_title.trim() !== '')
    );
  }, [currentQuestion]);

  const handleShowExplanation = useCallback(async () => {
    if (!gameId || !gameFlow?.current_question_id) return;

    try {
      setCurrentPhase('explanation');
      emitPhaseChange('explanation');

      const { data, error } = await gameApi.showExplanation(gameId);

      if (error || !data) {
        toast.error('解説の表示に失敗しました');
        setCurrentPhase('leaderboard');
        emitPhaseChange('leaderboard');
        return;
      }

      toast.success('解説を表示しました');
    } catch {
      toast.error('解説の表示に失敗しました');
      setCurrentPhase('leaderboard');
      emitPhaseChange('leaderboard');
    }
  }, [gameId, gameFlow?.current_question_id, emitPhaseChange]);

  const handleGoToPodium = useCallback(() => {
    setCurrentPhase('podium');
    emitPhaseChange('podium');
  }, [emitPhaseChange]);

  /**
   * Function: handleAnswerRevealNext
   * Description:
   * - Handles next phase transition from answer_reveal
   * - Last question: go to explanation or podium
   * - Otherwise: go to leaderboard
   */
  const handleAnswerRevealNext = useCallback(
    async (isLastQuestion: boolean) => {
      if (isLastQuestion) {
        if (hasExplanation()) {
          await handleShowExplanation();
        } else {
          handleGoToPodium();
        }
      } else {
        setCurrentPhase('leaderboard');
        emitPhaseChange('leaderboard');
      }
    },
    [hasExplanation, handleShowExplanation, handleGoToPodium, emitPhaseChange],
  );

  /**
   * Function: handleLeaderboardNext
   * Description:
   * - Handles next phase transition from leaderboard
   * - Go to explanation if available, otherwise advance to next question
   */
  const handleLeaderboardNext = useCallback(
    async (currentQuestionIndex: number, totalQuestions: number) => {
      if (hasExplanation()) {
        await handleShowExplanation();
        return;
      }

      const nextIdx = currentQuestionIndex + 1;
      if (nextIdx < totalQuestions) {
        try {
          const data = await nextQuestionFlow();
          if (data.isComplete) {
            handleGoToPodium();
          } else {
            const countdownStartTime = Date.now();
            setCurrentPhase('countdown');
            emitPhaseChange('countdown', countdownStartTime);
          }
        } catch {
          toast.error('次の問題への移動に失敗しました');
        }
      } else {
        handleGoToPodium();
      }
    },
    [hasExplanation, handleShowExplanation, nextQuestionFlow, handleGoToPodium, emitPhaseChange],
  );

  /**
   * Function: handleExplanationNext
   * Description:
   * - Handles next phase transition from explanation
   * - Advance to next question or go to podium if last question
   */
  const handleExplanationNext = useCallback(
    async (currentQuestionIndex: number, totalQuestions: number) => {
      const isLastQuestion = currentQuestionIndex >= totalQuestions - 1;
      if (isLastQuestion) {
        handleGoToPodium();
        return;
      }

      const nextIdx = currentQuestionIndex + 1;
      if (nextIdx < totalQuestions) {
        try {
          const data = await nextQuestionFlow();
          if (data.isComplete) {
            handleGoToPodium();
          } else {
            const countdownStartTime = Date.now();
            setCurrentPhase('countdown');
            emitPhaseChange('countdown', countdownStartTime);
          }
        } catch {
          toast.error('次の問題への移動に失敗しました');
        }
      } else {
        handleGoToPodium();
      }
    },
    [nextQuestionFlow, handleGoToPodium, emitPhaseChange],
  );

  const handleNextPhase = useCallback(async () => {
    const isLastQuestion = currentQuestionIndex >= totalQuestions - 1;

    if (currentPhase === 'answer_reveal') {
      await handleAnswerRevealNext(isLastQuestion);
    } else if (currentPhase === 'leaderboard') {
      await handleLeaderboardNext(currentQuestionIndex, totalQuestions);
    } else if (currentPhase === 'explanation') {
      await handleExplanationNext(currentQuestionIndex, totalQuestions);
    } else if (currentPhase === 'podium') {
      setCurrentPhase('ended');
      emitPhaseChange('ended');
      toast.success('ゲームを終了しました');
    } else if (currentPhase === 'ended') {
      router.push('/dashboard');
    }
  }, [
    currentPhase,
    currentQuestionIndex,
    totalQuestions,
    handleAnswerRevealNext,
    handleLeaderboardNext,
    handleExplanationNext,
    emitPhaseChange,
    router,
  ]);

  const handleTogglePublicScreen = useCallback(() => {
    if (!isPublicScreenVisible) {
      setIsPublicScreenVisible(true);

      const wasAlreadyOpen =
        gameId && sessionStorage.getItem(`public_screen_open_${gameId}`) === 'true';

      if (!wasAlreadyOpen) {
        const publicScreenUrl = `/host-screen?code=${gameCode}&gameId=${gameId}&quizId=${quizId}`;
        window.open(
          publicScreenUrl,
          'public-screen',
          `width=${PUBLIC_SCREEN_WIDTH},height=${PUBLIC_SCREEN_HEIGHT},scrollbars=yes,resizable=yes`,
        );
        if (gameId) {
          sessionStorage.setItem(`public_screen_open_${gameId}`, 'true');
        }
      }
    } else {
      setIsPublicScreenVisible(false);
      if (gameId) {
        sessionStorage.removeItem(`public_screen_open_${gameId}`);
      }
    }
  }, [isPublicScreenVisible, gameId, gameCode, quizId]);

  // Auto-transition from countdown to question
  useEffect(() => {
    if (currentPhase === 'countdown' && gameFlow?.current_question_id && !flowLoading) {
      const questionKey = `${currentPhase}_${gameFlow.current_question_id}`;
      if (countdownEmittedRef.current !== questionKey) {
        const countdownStartTime = Date.now();
        emitPhaseChange('countdown', countdownStartTime);
        countdownEmittedRef.current = questionKey;
      }

      const timer = setTimeout(() => {
        handleStartQuestion().catch(() => {
          toast.error('問題の自動開始に失敗しました');
        });
      }, COUNTDOWN_DURATION_MS);

      return () => clearTimeout(timer);
    }
  }, [
    currentPhase,
    gameFlow?.current_question_id,
    handleStartQuestion,
    flowLoading,
    emitPhaseChange,
  ]);

  const nextButtonLabel = (() => {
    const isLastQuestion = currentQuestionIndex >= totalQuestions - 1;
    const explanationExists = hasExplanation();

    if (currentPhase === 'answer_reveal') {
      if (isLastQuestion) return explanationExists ? '解説へ' : '表彰台へ';
      return 'ランキングへ';
    }

    if (currentPhase === 'leaderboard') {
      return explanationExists ? '解説へ' : '次の問題へ';
    }

    if (currentPhase === 'explanation') {
      if (isLastQuestion) {
        return '表彰台へ';
      } else {
        return '次の問題へ';
      }
    }

    if (currentPhase === 'podium') {
      return 'ゲーム終了';
    }

    if (currentPhase === 'ended') {
      return 'ダッシュボードへ';
    }

    return '次へ';
  })();

  //----------------------------------------------------
  // 11.9. Loading State
  //----------------------------------------------------
  // (Loading states handled by child components)

  //----------------------------------------------------
  // 11.10. Error State
  //----------------------------------------------------
  // (Errors handled via toast notifications)

  //----------------------------------------------------
  // 11.11. Main Render
  //----------------------------------------------------
  return (
    <PageContainer>
      <Header>
        <Container size="lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                ホストコントロールパネル
              </h1>
              {gameCode && (
                <div className="text-sm text-gray-600 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                  ルームコード: {gameCode}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleTogglePublicScreen}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  isPublicScreenVisible
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-gray-600 hover:bg-gray-700 text-white'
                }`}
              >
                {isPublicScreenVisible ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
                <span>パブリック画面</span>
              </button>
            </div>
          </div>
        </Container>
      </Header>

      <Main className="flex-1">
        <Container size="lg" className="h-full">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full py-6">
            <GameControls
              currentPhase={currentPhase}
              currentQuestionIndex={currentQuestionIndex}
              totalQuestions={totalQuestions}
              currentTimeSeconds={currentTimeSeconds}
              timerState={timerState}
              flowLoading={flowLoading}
              currentQuestion={currentQuestion}
              onStartQuestion={handleStartQuestion}
              onRevealAnswer={handleRevealAnswer}
              onNextPhase={handleNextPhase}
              nextButtonLabel={nextButtonLabel}
            />

            <PlayerRankings leaderboard={leaderboard} isLoadingPlayers={isLoadingPlayers} />

            <div className="lg:col-span-1 space-y-4">
              <AnalyticsPanel
                connectedPlayers={connectedPlayers}
                totalAnswered={totalAnswered}
                answerRate={answerRate}
              />

              {currentQuestion && currentQuestion.answers && (
                <AnswerDistribution
                  currentQuestion={currentQuestion}
                  answerStats={answerStats}
                  totalAnswered={totalAnswered}
                  currentPhase={currentPhase}
                />
              )}
            </div>
          </div>
        </Container>
      </Main>
    </PageContainer>
  );
}

//----------------------------------------------------
// 12. Main Page Component (with Providers)
//----------------------------------------------------
/**
 * Component: GameHostPage
 * Description:
 * - Wraps HostGameContent with Suspense boundary
 * - Handles loading state for search params
 *
 * Returns:
 * - JSX: Page with Suspense wrapper
 */
export default function GameHostPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HostGameContent />
    </Suspense>
  );
}
