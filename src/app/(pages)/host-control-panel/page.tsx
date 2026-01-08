// ====================================================
// File Name   : page.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-21
// Last Update : 2026-01-08
//
// Description:
// - Host control panel for managing game flow
// - Controls game phases, timers, and player analytics
// - Real-time synchronization via WebSocket
//
// Notes:
// - Manages phase transitions and game state
// - Displays player leaderboard and answer statistics
// - Supports public screen toggle
// ====================================================

'use client';

//----------------------------------------------------
// 1. React & Next.js Imports
//----------------------------------------------------
import React, { useState, Suspense, useEffect, useCallback, useRef, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';

//----------------------------------------------------
// 2. External Library Imports
//----------------------------------------------------
import {
  Users,
  BarChart3,
  Clock,
  Trophy,
  Eye,
  EyeOff,
  Play,
  ChevronRight,
  Pause,
  PlayCircle,
} from 'lucide-react';
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
import type { QuestionWithAnswers } from '@/types/quiz';

//----------------------------------------------------
// 6. Types / Interfaces
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

//----------------------------------------------------
// 7. Custom Hooks
//----------------------------------------------------
/**
 * Hook: useHostControlState
 * Description:
 * - Manages host control panel state
 */
function useHostControlState(gameIdParam: string, phaseParam: HostPhase) {
  const [gameId, setGameId] = useState<string>(gameIdParam);
  const [currentPhase, setCurrentPhase] = useState<HostPhase>(phaseParam);
  const [isPublicScreenVisible, setIsPublicScreenVisible] = useState(false);
  const [questions, setQuestions] = useState<QuestionWithAnswers[]>([]);
  const [answerStats, setAnswerStats] = useState<Record<string, number>>({});
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionWithAnswers | null>(null);

  return {
    gameId,
    setGameId,
    currentPhase,
    setCurrentPhase,
    isPublicScreenVisible,
    setIsPublicScreenVisible,
    questions,
    setQuestions,
    answerStats,
    setAnswerStats,
    isLoadingPlayers,
    setIsLoadingPlayers,
    currentQuestion,
    setCurrentQuestion,
  };
}

/**
 * Hook: useHostControlEffects
 * Description:
 * - Manages effects for game ID loading and quiz data
 */
function useHostControlEffects({
  gameId,
  roomCode,
  setGameId,
  questions,
  gameFlow,
  setCurrentQuestion,
  setQuestions,
}: {
  gameId: string;
  roomCode: string;
  setGameId: React.Dispatch<React.SetStateAction<string>>;
  questions: QuestionWithAnswers[];
  gameFlow: { current_question_index: number | null } | null;
  setCurrentQuestion: React.Dispatch<React.SetStateAction<QuestionWithAnswers | null>>;
  setQuestions: React.Dispatch<React.SetStateAction<QuestionWithAnswers[]>>;
}) {
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
          toast.error('ゲーム情報の取得に失敗しました');
          return;
        }
        setGameId(game.id);
        sessionStorage.setItem(`game_${roomCode}`, game.id);
      } catch {
        toast.error('ゲームIDの取得に失敗しました');
      }
    };

    getGameIdFromCode();
  }, [roomCode, gameId, setGameId]);

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
      } catch (err) {
        console.error('Failed to load quiz for game', err);
      }
    };
    loadQuiz();
  }, [gameId, setQuestions]);

  useEffect(() => {
    if (questions.length > 0 && gameFlow && gameFlow.current_question_index !== null) {
      const idx = gameFlow.current_question_index;
      setCurrentQuestion(questions[idx] || null);
    }
  }, [questions, gameFlow, setCurrentQuestion]);
}

/**
 * Hook: useHostControlWebSocket
 * Description:
 * - Manages WebSocket connection and event listeners
 */
function useHostControlWebSocket({
  socket,
  gameId,
  gameFlow,
  setAnswerStats,
  setCurrentPhase,
  socketJoinRoom,
  socketLeaveRoom,
}: {
  socket: ReturnType<typeof useSocket>['socket'];
  gameId: string;
  gameFlow: { current_question_id?: string | null } | null;
  setAnswerStats: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  setCurrentPhase: React.Dispatch<React.SetStateAction<HostPhase>>;
  socketJoinRoom: (roomId: string) => void;
  socketLeaveRoom: (roomId: string) => void;
}) {
  const hasJoinedRoomRef = useRef(false);
  const socketIdRef = useRef<string | null>(null);

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

    const handleStatsUpdate = (data: {
      roomId: string;
      questionId: string;
      counts: Record<string, number>;
    }) => {
      if (data.roomId === gameId && data.questionId === gameFlow?.current_question_id) {
        setAnswerStats(data.counts);
      }
    };

    const handlePhaseChange = (data: { roomId: string; phase: HostPhase }) => {
      if (data.roomId === gameId) {
        setCurrentPhase(data.phase);
      }
    };

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
    socket,
    socket?.id,
    socket?.connected,
    gameId,
    socketJoinRoom,
    socketLeaveRoom,
    gameFlow,
    setAnswerStats,
    setCurrentPhase,
  ]);
}

/**
 * Hook: useHostControlComputed
 * Description:
 * - Computes derived values for host control panel
 */
function useHostControlComputed({
  gameFlow,
  questions,
  timerState,
  leaderboard,
  answerStats,
}: {
  gameFlow: { current_question_index: number | null } | null;
  questions: QuestionWithAnswers[];
  timerState: { remainingMs?: number; isActive?: boolean } | null;
  leaderboard: unknown;
  answerStats: Record<string, number>;
}) {
  const currentQuestionIndex = gameFlow?.current_question_index ?? 0;
  const totalQuestions = questions.length || 0;

  const currentTimeSeconds = useMemo(() => {
    if (!timerState?.remainingMs) return 0;
    return Math.max(0, Math.ceil(timerState.remainingMs / 1000));
  }, [timerState?.remainingMs]);

  const connectedPlayers = useMemo(() => {
    return Array.isArray(leaderboard) ? leaderboard.length : 0;
  }, [leaderboard]);

  const totalAnswered = useMemo(() => {
    return Object.values(answerStats).reduce((sum, count) => sum + count, 0);
  }, [answerStats]);

  const answerRate = useMemo(() => {
    if (connectedPlayers === 0) return 0;
    return Math.round((totalAnswered / connectedPlayers) * 100);
  }, [connectedPlayers, totalAnswered]);

  return {
    currentQuestionIndex,
    totalQuestions,
    currentTimeSeconds,
    connectedPlayers,
    totalAnswered,
    answerRate,
  };
}

//----------------------------------------------------
// 8. Sub-Components
//----------------------------------------------------
/**
 * Component: GameControlsPanel
 * Description:
 * - Left panel with game control buttons
 */
const GameControlsPanel: React.FC<{
  currentPhase: HostPhase;
  currentQuestionIndex: number;
  totalQuestions: number;
  currentTimeSeconds: number;
  timerState: { isActive?: boolean } | null;
  flowLoading: boolean;
  currentQuestion: QuestionWithAnswers | null;
  onStartQuestion: () => void;
  onRevealAnswer: () => void;
  onNextPhase: () => void;
  onPauseGame: () => void;
  onResumeGame: () => void;
}> = ({
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
  onPauseGame,
  onResumeGame,
}) => {
  const getPhaseLabel = (phase: HostPhase): string => {
    const labels: Record<HostPhase, string> = {
      waiting: '待機中',
      countdown: 'カウントダウン',
      question: '問題中',
      answer_reveal: '答え表示',
      leaderboard: 'ランキング',
      explanation: '解説',
      podium: '表彰台',
      ended: '終了',
    };
    return labels[phase] || phase;
  };

  return (
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
              <>
                <button
                  onClick={onRevealAnswer}
                  disabled={flowLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-gray-500 disabled:to-gray-600 text-white py-3 px-4 rounded-lg transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <Eye className="w-5 h-5" />
                  <span>答えを表示</span>
                </button>
                {timerState?.isActive ? (
                  <button
                    onClick={onPauseGame}
                    disabled={flowLoading}
                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white py-2 px-4 rounded-lg transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <Pause className="w-4 h-4" />
                    <span>一時停止</span>
                  </button>
                ) : (
                  <button
                    onClick={onResumeGame}
                    disabled={flowLoading}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-2 px-4 rounded-lg transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <PlayCircle className="w-4 h-4" />
                    <span>再開</span>
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={onNextPhase}
                disabled={flowLoading}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-gray-500 disabled:to-gray-600 text-white py-3 px-4 rounded-lg transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <ChevronRight className="w-5 h-5" />
                <span>次へ</span>
              </button>
            )}

            <div className="pt-2 border-t border-white/10">
              <div className="text-xs text-gray-400 mb-1">現在のフェーズ</div>
              <div className="text-sm font-semibold text-white capitalize">
                {getPhaseLabel(currentPhase)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Component: PlayerRankingsPanel
 * Description:
 * - Center panel with player leaderboard
 */
const PlayerRankingsPanel: React.FC<{
  leaderboard: unknown;
  isLoadingPlayers: boolean;
}> = ({ leaderboard, isLoadingPlayers }) => {
  if (isLoadingPlayers) {
    return (
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 h-full">
          <h3 className="text-lg font-semibold text-blue-600 mb-4 flex items-center">
            <Trophy className="w-5 h-5 mr-2" />
            プレイヤーランキング
          </h3>
          <div className="text-center py-8 text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2">プレイヤーを読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-2 space-y-4">
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 h-full">
        <h3 className="text-lg font-semibold text-blue-600 mb-4 flex items-center">
          <Trophy className="w-5 h-5 mr-2" />
          プレイヤーランキング
        </h3>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {Array.isArray(leaderboard) && leaderboard.length > 0 ? (
            leaderboard
              .sort((a: { rank?: number }, b: { rank?: number }) => (a.rank || 0) - (b.rank || 0))
              .map(
                (
                  entry: {
                    player_id: string;
                    rank?: number;
                    player_name: string;
                    accuracy?: number;
                    score: number;
                  },
                  index: number,
                ) => (
                  <div
                    key={entry.player_id}
                    className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                      index === 0
                        ? 'bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 border border-yellow-400/30'
                        : index === 1
                          ? 'bg-gradient-to-r from-gray-300/20 to-gray-500/20 border border-gray-300/30'
                          : index === 2
                            ? 'bg-gradient-to-r from-orange-400/20 to-orange-600/20 border border-orange-400/30'
                            : 'bg-white/5 border border-white/10'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0
                            ? 'bg-yellow-400 text-yellow-900'
                            : index === 1
                              ? 'bg-gray-300 text-gray-900'
                              : index === 2
                                ? 'bg-orange-400 text-orange-900'
                                : 'bg-gray-600 text-white'
                        }`}
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
                ),
              )
          ) : (
            <div className="text-center py-8 text-gray-500">プレイヤーがいません</div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Component: AnalyticsPanel
 * Description:
 * - Right panel with analytics and answer statistics
 */
const AnalyticsPanel: React.FC<{
  connectedPlayers: number;
  totalAnswered: number;
  answerRate: number;
  currentQuestion: QuestionWithAnswers | null;
  currentPhase: HostPhase;
  answerStats: Record<string, number>;
  totalAnsweredForStats: number;
}> = ({
  connectedPlayers,
  totalAnswered,
  answerRate,
  currentQuestion,
  currentPhase,
  answerStats,
  totalAnsweredForStats,
}) => {
  return (
    <div className="lg:col-span-1 space-y-4">
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

      {currentQuestion && currentQuestion.answers && (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            {currentPhase === 'answer_reveal' ? '回答結果' : '回答分布'}
          </h3>

          <div className="space-y-2">
            {currentQuestion.answers
              .sort((a, b) => a.order_index - b.order_index)
              .map((answer, idx) => {
                const letter = ['A', 'B', 'C', 'D'][idx] || String.fromCharCode(65 + idx);
                const count = answerStats[answer.id] || 0;
                const percentage =
                  totalAnsweredForStats > 0 ? (count / totalAnsweredForStats) * 100 : 0;
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
                        style={{ width: `${Math.max(percentage, 2)}%` }}
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
                <span className="text-green-400 font-bold">
                  {totalAnsweredForStats > 0
                    ? Math.round(
                        ((answerStats[
                          currentQuestion.answers.find((a) => a.is_correct)?.id || ''
                        ] || 0) /
                          totalAnsweredForStats) *
                          100,
                      )
                    : 0}
                  %
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Component: HeaderSection
 * Description:
 * - Header with title and public screen toggle
 */
const HeaderSection: React.FC<{
  gameCode: string;
  isPublicScreenVisible: boolean;
  onTogglePublicScreen: () => void;
}> = ({ gameCode, isPublicScreenVisible, onTogglePublicScreen }) => {
  return (
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
              onClick={onTogglePublicScreen}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                isPublicScreenVisible
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-gray-600 hover:bg-gray-700 text-white'
              }`}
            >
              {isPublicScreenVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              <span>パブリック画面</span>
            </button>
          </div>
        </div>
      </Container>
    </Header>
  );
};

//----------------------------------------------------
// 9. Main Component
//----------------------------------------------------
/**
 * Component: HostControlPanelContent
 * Description:
 * - Main host control panel component
 * - Manages game flow, phase transitions, and player analytics
 *
 * Features:
 * - Real-time game phase control
 * - Player leaderboard display
 * - Answer statistics tracking
 * - Timer management
 * - Public screen toggle
 */
function HostControlPanelContent() {
  //----------------------------------------------------
  // 9.1. URL Parameters & Setup
  //----------------------------------------------------
  const searchParams = useSearchParams();
  const roomCode = searchParams.get('code') || '';
  const gameIdParam = searchParams.get('gameId') || '';
  const phaseParam = (searchParams.get('phase') as HostPhase) || 'waiting';

  //----------------------------------------------------
  // 9.2. State Management
  //----------------------------------------------------
  const state = useHostControlState(gameIdParam, phaseParam);
  const {
    gameId,
    setGameId,
    currentPhase,
    setCurrentPhase,
    isPublicScreenVisible,
    setIsPublicScreenVisible,
    questions,
    setQuestions,
    answerStats,
    setAnswerStats,
    isLoadingPlayers,
    setIsLoadingPlayers,
    currentQuestion,
    setCurrentQuestion,
  } = state;

  //----------------------------------------------------
  // 9.3. Custom Hooks
  //----------------------------------------------------
  const {
    gameFlow,
    timerState,
    startQuestion,
    revealAnswer,
    pauseGame,
    resumeGame,
    loading: flowLoading,
  } = useGameFlow({
    gameId: gameId || '',
    isHost: true,
    autoSync: true,
    events: {
      onQuestionEnd: () => {
        setCurrentPhase('answer_reveal');
      },
      onGameEnd: () => {
        setCurrentPhase('podium');
      },
    },
  });

  const { leaderboard } = useGameLeaderboard({
    gameId: gameId || '',
    autoRefresh: true,
  });

  const { socket, joinRoom: socketJoinRoom, leaveRoom: socketLeaveRoom } = useSocket();

  //----------------------------------------------------
  // 9.4. Effects
  //----------------------------------------------------
  useHostControlEffects({
    gameId,
    roomCode,
    setGameId,
    questions,
    gameFlow,
    setCurrentQuestion,
    setQuestions,
  });

  useHostControlWebSocket({
    socket,
    gameId,
    gameFlow,
    setAnswerStats,
    setCurrentPhase,
    socketJoinRoom,
    socketLeaveRoom,
  });

  const fetchPlayers = useCallback(async () => {
    if (!gameId) return;
    try {
      setIsLoadingPlayers(true);
      const { data, error } = await gameApi.getPlayers(gameId);
      if (error || !data) {
        return;
      }
    } catch {
    } finally {
      setIsLoadingPlayers(false);
    }
  }, [gameId, setIsLoadingPlayers]);

  useEffect(() => {
    if (!gameId) return;
    fetchPlayers();
    const interval = setInterval(fetchPlayers, 5000);
    return () => clearInterval(interval);
  }, [gameId, fetchPlayers]);

  //----------------------------------------------------
  // 9.5. Computed Values
  //----------------------------------------------------
  const computed = useHostControlComputed({
    gameFlow,
    questions,
    timerState,
    leaderboard,
    answerStats,
  });
  const {
    currentQuestionIndex,
    totalQuestions,
    currentTimeSeconds,
    connectedPlayers,
    totalAnswered,
    answerRate,
  } = computed;
  const gameCode = roomCode;

  //----------------------------------------------------
  // 9.6. Event Handlers
  //----------------------------------------------------
  const emitPhaseChange = useCallback(
    (phase: HostPhase) => {
      if (!socket || !gameId) {
        return;
      }
      socket.emit('game:phase:change', { roomId: gameId, phase });
    },
    [socket, gameId],
  );

  const handleTogglePublicScreen = useCallback(() => {
    setIsPublicScreenVisible(!isPublicScreenVisible);
    if (!isPublicScreenVisible) {
      const publicScreenUrl = `/host-screen?code=${roomCode || gameCode}&gameId=${gameId}`;
      window.open(
        publicScreenUrl,
        'public-screen',
        'width=1200,height=800,scrollbars=yes,resizable=yes',
      );
    }
  }, [isPublicScreenVisible, roomCode, gameCode, gameId, setIsPublicScreenVisible]);

  const handleStartQuestion = useCallback(async () => {
    if (!gameId || !currentQuestion) return;
    try {
      await startQuestion(currentQuestion.id, currentQuestionIndex);
      setCurrentPhase('question');
      emitPhaseChange('question');
      toast.success('問題を開始しました');
    } catch {
      toast.error('問題の開始に失敗しました');
    }
  }, [
    gameId,
    currentQuestion,
    currentQuestionIndex,
    startQuestion,
    emitPhaseChange,
    setCurrentPhase,
  ]);

  const handleRevealAnswer = useCallback(async () => {
    if (!gameId) return;
    try {
      await revealAnswer();
      setCurrentPhase('answer_reveal');
      emitPhaseChange('answer_reveal');
      toast.success('答えを表示しました');
    } catch {
      toast.error('答えの表示に失敗しました');
    }
  }, [gameId, revealAnswer, emitPhaseChange, setCurrentPhase]);

  //----------------------------------------------------
  // 9.7. Helper Functions for Phase Transitions
  //----------------------------------------------------
  /**
   * Function: transitionToPhase
   * Description:
   * - Sets current phase and emits phase change event
   */
  const transitionToPhase = useCallback(
    (phase: HostPhase) => {
      setCurrentPhase(phase);
      emitPhaseChange(phase);
    },
    [emitPhaseChange, setCurrentPhase],
  );

  /**
   * Function: shouldShowExplanation
   * Description:
   * - Checks if current question has explanation text
   */
  const shouldShowExplanation = useCallback((): boolean => {
    return Boolean(currentQuestion?.explanation_text);
  }, [currentQuestion]);

  /**
   * Function: advanceToNextQuestion
   * Description:
   * - Advances to next question via API
   * - Transitions to appropriate phase based on result
   */
  const advanceToNextQuestion = useCallback(async (): Promise<boolean> => {
    const nextIdx = currentQuestionIndex + 1;
    if (nextIdx >= totalQuestions) {
      transitionToPhase('podium');
      return false;
    }

    try {
      const { data, error } = await gameApi.nextQuestion(gameId);
      if (error || !data) {
        toast.error('次の問題への移動に失敗しました');
        return false;
      }

      if (data.isComplete) {
        transitionToPhase('podium');
      } else {
        transitionToPhase('countdown');
      }
      return true;
    } catch {
      toast.error('次の問題への移動に失敗しました');
      return false;
    }
  }, [currentQuestionIndex, totalQuestions, gameId, transitionToPhase]);

  /**
   * Function: handleAnswerRevealNext
   * Description:
   * - Handles next phase transition from answer_reveal
   */
  const handleAnswerRevealNext = useCallback(
    (isLastQuestion: boolean) => {
      if (isLastQuestion) {
        if (shouldShowExplanation()) {
          transitionToPhase('explanation');
        } else {
          transitionToPhase('podium');
        }
      } else {
        transitionToPhase('leaderboard');
      }
    },
    [shouldShowExplanation, transitionToPhase],
  );

  /**
   * Function: handleLeaderboardNext
   * Description:
   * - Handles next phase transition from leaderboard
   */
  const handleLeaderboardNext = useCallback(async () => {
    if (shouldShowExplanation()) {
      transitionToPhase('explanation');
    } else {
      await advanceToNextQuestion();
    }
  }, [shouldShowExplanation, transitionToPhase, advanceToNextQuestion]);

  /**
   * Function: handleExplanationNext
   * Description:
   * - Handles next phase transition from explanation
   */
  const handleExplanationNext = useCallback(async () => {
    await advanceToNextQuestion();
  }, [advanceToNextQuestion]);

  const handleNextPhase = useCallback(async () => {
    const isLastQuestion = currentQuestionIndex >= totalQuestions - 1;

    if (currentPhase === 'answer_reveal') {
      handleAnswerRevealNext(isLastQuestion);
    } else if (currentPhase === 'leaderboard') {
      await handleLeaderboardNext();
    } else if (currentPhase === 'explanation') {
      await handleExplanationNext();
    }
  }, [
    currentPhase,
    currentQuestionIndex,
    totalQuestions,
    handleAnswerRevealNext,
    handleLeaderboardNext,
    handleExplanationNext,
  ]);

  //----------------------------------------------------
  // 9.8. Loading State
  //----------------------------------------------------
  if (!gameId) {
    return (
      <PageContainer>
        <Main className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="p-6 text-red-600 text-xl">gameId が指定されていません。</div>
            <div className="text-gray-500">ルームコード: {roomCode || 'なし'}</div>
          </div>
        </Main>
      </PageContainer>
    );
  }

  //----------------------------------------------------
  // 9.9. Main Render
  //----------------------------------------------------
  return (
    <PageContainer>
      <HeaderSection
        gameCode={gameCode}
        isPublicScreenVisible={isPublicScreenVisible}
        onTogglePublicScreen={handleTogglePublicScreen}
      />

      <Main className="flex-1">
        <Container size="lg" className="h-full">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full py-6">
            <GameControlsPanel
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
              onPauseGame={pauseGame}
              onResumeGame={resumeGame}
            />

            <PlayerRankingsPanel leaderboard={leaderboard} isLoadingPlayers={isLoadingPlayers} />

            <AnalyticsPanel
              connectedPlayers={connectedPlayers}
              totalAnswered={totalAnswered}
              answerRate={answerRate}
              currentQuestion={currentQuestion}
              currentPhase={currentPhase}
              answerStats={answerStats}
              totalAnsweredForStats={totalAnswered}
            />
          </div>
        </Container>
      </Main>
    </PageContainer>
  );
}

//----------------------------------------------------
// 10. Page Wrapper Component
//----------------------------------------------------
export default function HostControlPanelPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HostControlPanelContent />
    </Suspense>
  );
}
