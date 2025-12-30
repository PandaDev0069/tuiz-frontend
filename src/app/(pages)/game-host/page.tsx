'use client';

import React, { Suspense, useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header, PageContainer, Container, Main } from '@/components/ui';
import { HostPodiumScreen, HostGameEndScreen, HostExplanationScreen } from '@/components/game';
import { useGameFlow } from '@/hooks/useGameFlow';
import { useGameLeaderboard } from '@/hooks/useGameLeaderboard';
import { useSocket } from '@/components/providers/SocketProvider';
import { gameApi, type PlayersResponse } from '@/services/gameApi';
import { quizService } from '@/lib/quizService';
import type { QuestionWithAnswers } from '@/types/quiz';
import {
  Clock,
  Play,
  Eye,
  EyeOff,
  BarChart3,
  Users,
  Trophy,
  ChevronRight,
  Pause,
  PlayCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

type HostPhase =
  | 'waiting'
  | 'countdown'
  | 'question'
  | 'answer_reveal'
  | 'leaderboard'
  | 'explanation'
  | 'podium'
  | 'ended';

function HostGameContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const gameId = searchParams.get('gameId') || '';
  const phaseParam = (searchParams.get('phase') as HostPhase) || 'waiting';

  const [currentPhase, setCurrentPhase] = useState<HostPhase>(phaseParam);
  const [isPublicScreenVisible, setIsPublicScreenVisible] = useState(false);

  const {
    gameFlow,
    timerState,
    startQuestion,
    revealAnswer,
    nextQuestion: nextQuestionFlow,
    pauseGame,
    resumeGame,
    loading: flowLoading,
  } = useGameFlow({
    gameId,
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
    gameId,
    autoRefresh: true,
  });

  const { socket, joinRoom: socketJoinRoom, leaveRoom: socketLeaveRoom } = useSocket();

  const [questions, setQuestions] = useState<QuestionWithAnswers[]>([]);
  const [answerStats, setAnswerStats] = useState<Record<string, number>>({});
  const [players, setPlayers] = useState<PlayersResponse['players']>([]);
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionWithAnswers | null>(null);
  const [explanationData, setExplanationData] = useState<{
    title: string | null;
    text: string | null;
    image_url: string | null;
    show_time: number;
  } | null>(null);
  const hasJoinedRoomRef = useRef(false);
  const socketIdRef = useRef<string | null>(null);

  // Fetch players list
  const fetchPlayers = useCallback(async () => {
    if (!gameId) return;
    try {
      setIsLoadingPlayers(true);
      const { data, error } = await gameApi.getPlayers(gameId);
      if (error || !data) {
        console.error('Failed to fetch players:', error);
        return;
      }
      // Filter out hosts from player list
      setPlayers(data.players.filter((p) => !p.is_host));
    } catch (err) {
      console.error('Error fetching players:', err);
    } finally {
      setIsLoadingPlayers(false);
    }
  }, [gameId]);

  // Load quiz data
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
  }, [gameId]);

  // Update current question when question index changes
  useEffect(() => {
    if (questions.length > 0 && gameFlow && gameFlow.current_question_index !== null) {
      const idx = gameFlow.current_question_index;
      setCurrentQuestion(questions[idx] || null);
      // Reset explanation data when question changes
      setExplanationData(null);
    }
  }, [questions, gameFlow]);

  // Fetch explanation data when entering explanation phase (fallback if API didn't provide it)
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
            console.error('Failed to fetch explanation:', error);
            return;
          } else if (data) {
            setExplanationData({
              title: data.explanation_title,
              text: data.explanation_text,
              image_url: data.explanation_image_url,
              show_time: data.show_explanation_time || 10,
            });
          }
        } catch (err) {
          console.error('Error fetching explanation:', err);
        }
      };
      fetchExplanation();
    }
  }, [currentPhase, gameId, gameFlow?.current_question_id, explanationData]);

  // Fetch players periodically
  useEffect(() => {
    if (!gameId) return;
    fetchPlayers();
    const interval = setInterval(fetchPlayers, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [gameId, fetchPlayers]);

  // Join WebSocket room and listen for events
  useEffect(() => {
    if (!socket || !gameId || !socket.connected) return;

    // Track socket ID to prevent re-runs on socket object reference changes
    const currentSocketId = socket.id || null;
    if (socketIdRef.current !== currentSocketId) {
      if (socketIdRef.current) {
        console.log('[GameHost] Socket ID changed, resetting room state');
        hasJoinedRoomRef.current = false;
      }
      socketIdRef.current = currentSocketId;
    }

    // Join the game room to receive and emit events
    // Note: We may already be in the room from host-waiting-room, but socketJoinRoom
    // has built-in deduplication so it's safe to call
    if (hasJoinedRoomRef.current) {
      console.log('[GameHost] Already joined room, skipping duplicate join');
      return;
    }
    console.log('[GameHost] Joining room:', gameId);
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

    socket.on('game:answer:stats:update', handleStatsUpdate);
    return () => {
      socket.off('game:answer:stats:update', handleStatsUpdate);
      // Leave room on unmount
      if (gameId && hasJoinedRoomRef.current && socket) {
        console.log('[GameHost] Leaving room on unmount');
        socketLeaveRoom(gameId);
        hasJoinedRoomRef.current = false;
      }
    };
    // Use socket.id and socket.connected instead of socket object to prevent re-runs on reference changes
    // Deliberately omit gameFlow dependencies to avoid join/leave churn on question change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket?.id, socket?.connected, gameId, socketJoinRoom, socketLeaveRoom]);

  const emitPhaseChange = useCallback(
    (phase: HostPhase) => {
      if (!socket || !gameId) {
        console.warn('[GameHost] Cannot emit phase change: socket or gameId missing');
        return;
      }
      console.log('[GameHost] Emitting phase change:', phase, 'for room:', gameId);
      socket.emit('game:phase:change', { roomId: gameId, phase });
    },
    [socket, gameId],
  );

  // Get current question info
  const currentQuestionIndex = gameFlow?.current_question_index ?? 0;
  const totalQuestions = questions.length;
  const currentTimeSeconds = Math.max(0, Math.round((timerState?.remainingMs || 0) / 1000));

  // Calculate statistics
  const totalPlayers = players.length;
  const connectedPlayers = players.length; // All players in list are connected
  const totalAnswered = Object.values(answerStats).reduce((sum, count) => sum + count, 0);
  const answerRate = totalPlayers > 0 ? Math.round((totalAnswered / totalPlayers) * 100) : 0;

  // Get game code for public screen
  const gameCode = searchParams.get('code') || '';
  const quizId = searchParams.get('quizId') || '';

  // Function to reset game and return to waiting room (re-loop)
  const handleReturnToWaitingRoom = useCallback(async () => {
    if (!gameId) return;

    try {
      // Navigate to waiting room - the waiting room will handle resetting the game state
      // when the host starts a new game from there
      router.push(
        `/host-waiting-room?gameId=${gameId}${gameCode ? `&code=${gameCode}` : ''}${quizId ? `&quizId=${quizId}` : ''}`,
      );

      // Emit phase change to notify players
      emitPhaseChange('waiting');
    } catch (err) {
      console.error('Error returning to waiting room:', err);
      toast.error('待機ルームへの戻りに失敗しました');
    }
  }, [gameId, router, gameCode, quizId, emitPhaseChange]);

  // Host control handlers
  const handleStartQuestion = useCallback(async () => {
    // Use gameFlow.current_question_id as fallback if currentQuestion not loaded yet
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
    } catch (e) {
      console.error('Failed to start question:', e);
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
      await revealAnswer();
      setCurrentPhase('answer_reveal');
      emitPhaseChange('answer_reveal');
      toast.success('答えを表示しました');
    } catch (e) {
      console.error('Failed to reveal answer:', e);
      toast.error('答えの表示に失敗しました');
    }
  }, [gameId, revealAnswer, emitPhaseChange]);

  // Check if current question has explanation
  const hasExplanation = useCallback(() => {
    if (!currentQuestion) return false;
    return !!(
      (currentQuestion.explanation_text && currentQuestion.explanation_text.trim() !== '') ||
      (currentQuestion.explanation_title && currentQuestion.explanation_title.trim() !== '')
    );
  }, [currentQuestion]);

  // Show explanation for current question
  const handleShowExplanation = useCallback(async () => {
    if (!gameId || !gameFlow?.current_question_id) return;

    try {
      // Call API to show explanation (emits WebSocket event)
      const { data, error } = await gameApi.showExplanation(gameId);

      if (error || !data) {
        console.error('Failed to show explanation:', error);
        toast.error('解説の表示に失敗しました');
        return;
      }

      // Set explanation data
      setExplanationData({
        title: data.explanation.title,
        text: data.explanation.text,
        image_url: data.explanation.image_url,
        show_time: data.explanation.show_time || 10,
      });

      // Transition to explanation phase
      setCurrentPhase('explanation');
      emitPhaseChange('explanation');
      toast.success('解説を表示しました');
    } catch (e) {
      console.error('Error showing explanation:', e);
      toast.error('解説の表示に失敗しました');
    }
  }, [gameId, gameFlow?.current_question_id, emitPhaseChange]);

  const handleNextPhase = useCallback(async () => {
    const isLastQuestion = currentQuestionIndex >= totalQuestions - 1;

    if (currentPhase === 'answer_reveal') {
      // Check if question has explanation
      if (hasExplanation()) {
        // Show explanation before leaderboard
        await handleShowExplanation();
      } else if (isLastQuestion) {
        // No explanation and last question: go directly to podium
        setCurrentPhase('podium');
        emitPhaseChange('podium');
      } else {
        // No explanation: go to leaderboard
        setCurrentPhase('leaderboard');
        emitPhaseChange('leaderboard');
      }
    } else if (currentPhase === 'explanation') {
      // After explanation, go to leaderboard (or podium if last question)
      if (isLastQuestion) {
        setCurrentPhase('podium');
        emitPhaseChange('podium');
      } else {
        setCurrentPhase('leaderboard');
        emitPhaseChange('leaderboard');
      }
    } else if (currentPhase === 'leaderboard') {
      // Move to next question or podium based on whether it's the last question
      if (isLastQuestion) {
        // Last question: go to podium
        setCurrentPhase('podium');
        emitPhaseChange('podium');
      } else {
        // Not last question: proceed to next question
        const nextIdx = currentQuestionIndex + 1;
        if (nextIdx < totalQuestions) {
          try {
            // Use the hook's nextQuestion function which properly updates game flow
            const data = await nextQuestionFlow();
            if (data.isComplete) {
              setCurrentPhase('podium');
              emitPhaseChange('podium');
            } else {
              // Game flow has been updated, transition to countdown
              // The phase change event is already emitted by the backend
              setCurrentPhase('countdown');
              emitPhaseChange('countdown');
            }
          } catch (e) {
            console.error('Error advancing to next question:', e);
            toast.error('次の問題への移動に失敗しました');
            // Don't change phase on error - stay in current phase
            return;
          }
        } else {
          setCurrentPhase('podium');
          emitPhaseChange('podium');
        }
      }
    }
  }, [
    currentPhase,
    currentQuestionIndex,
    totalQuestions,
    emitPhaseChange,
    hasExplanation,
    handleShowExplanation,
    nextQuestionFlow,
  ]);

  const handleTogglePublicScreen = () => {
    setIsPublicScreenVisible(!isPublicScreenVisible);
    if (!isPublicScreenVisible) {
      const publicScreenUrl = `/host-screen?code=${gameCode}&gameId=${gameId}&quizId=${quizId}`;
      window.open(
        publicScreenUrl,
        'public-screen',
        'width=1200,height=800,scrollbars=yes,resizable=yes',
      );
    }
  };

  // Update phase when URL changes
  useEffect(() => {
    setCurrentPhase(phaseParam);
  }, [phaseParam]);

  // Auto-transition from countdown to question after countdown completes
  useEffect(() => {
    // Use gameFlow.current_question_id instead of currentQuestion?.id
    // because currentQuestion might not be loaded yet when transitioning from previous question
    if (currentPhase === 'countdown' && gameFlow?.current_question_id && !flowLoading) {
      // Set a timer to auto-start question after countdown completes
      // Use 3.5 seconds to ensure countdown component (3 seconds) completes first
      // This prevents race condition where question starts while countdown is still showing
      const countdownDuration = 3500; // 3.5 seconds to allow countdown to complete
      const timer = setTimeout(() => {
        // Auto-start the question (will use gameFlow.current_question_id)
        handleStartQuestion().catch((err) => {
          console.error('Auto-start question failed:', err);
        });
      }, countdownDuration);

      return () => clearTimeout(timer);
    }
  }, [currentPhase, gameFlow?.current_question_id, handleStartQuestion, flowLoading]);

  // Show explanation screen if in explanation phase
  if (currentPhase === 'explanation' && explanationData) {
    const currentQuestionNum = currentQuestionIndex + 1;
    return (
      <HostExplanationScreen
        explanation={{
          questionNumber: currentQuestionNum,
          totalQuestions,
          timeLimit: explanationData.show_time,
          title: explanationData.title || '解説',
          body: explanationData.text || '解説は近日追加されます。',
          image: explanationData.image_url || undefined,
        }}
        onTimeExpired={() => {
          // After explanation time expires, move to leaderboard (or podium if last question)
          const isLastQuestion = currentQuestionIndex >= totalQuestions - 1;
          if (isLastQuestion) {
            setCurrentPhase('podium');
            emitPhaseChange('podium');
          } else {
            setCurrentPhase('leaderboard');
            emitPhaseChange('leaderboard');
          }
        }}
        onNext={() => {
          // Manual next button - same logic as time expired
          const isLastQuestion = currentQuestionIndex >= totalQuestions - 1;
          if (isLastQuestion) {
            setCurrentPhase('podium');
            emitPhaseChange('podium');
          } else {
            setCurrentPhase('leaderboard');
            emitPhaseChange('leaderboard');
          }
        }}
      />
    );
  }

  // Show podium or end screen if in those phases
  if (currentPhase === 'podium') {
    const leaderboardData = {
      entries: Array.isArray(leaderboard)
        ? leaderboard.map((entry) => ({
            playerId: entry.player_id,
            playerName: entry.player_name,
            score: entry.score,
            rank: entry.rank,
            previousRank: entry.rank,
            rankChange: 'same' as const,
          }))
        : [],
      questionNumber: currentQuestionIndex + 1,
      totalQuestions,
      timeRemaining: 0,
      timeLimit: 0,
    };
    return (
      <HostPodiumScreen
        entries={leaderboardData.entries}
        onAnimationComplete={() => {
          setTimeout(() => {
            setCurrentPhase('ended');
            router.replace(`/game-host?gameId=${gameId}&phase=ended`);
            emitPhaseChange('ended');
          }, 5000);
        }}
      />
    );
  }

  if (currentPhase === 'ended') {
    const leaderboardData = {
      entries: Array.isArray(leaderboard)
        ? leaderboard.map((entry) => ({
            playerId: entry.player_id,
            playerName: entry.player_name,
            score: entry.score,
            rank: entry.rank,
            previousRank: entry.rank,
            rankChange: 'same' as const,
          }))
        : [],
      questionNumber: currentQuestionIndex + 1,
      totalQuestions,
      timeRemaining: 0,
      timeLimit: 0,
    };
    return (
      <HostGameEndScreen
        entries={leaderboardData.entries}
        gameId={gameId}
        onDismissRoom={() => {
          router.push('/dashboard');
        }}
        onStartNewGame={handleReturnToWaitingRoom}
      />
    );
  }

  // Control Panel UI
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
            {/* Left Panel - Game Controls */}
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
                      <div className="text-2xl font-bold text-green-500 mt-2">
                        {currentTimeSeconds}s
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    {currentPhase === 'countdown' || currentPhase === 'waiting' ? (
                      <button
                        onClick={handleStartQuestion}
                        disabled={flowLoading || !currentQuestion}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-500 disabled:to-gray-600 text-white py-3 px-4 rounded-lg transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        <Play className="w-5 h-5" />
                        <span>問題を開始</span>
                      </button>
                    ) : currentPhase === 'question' ? (
                      <>
                        <button
                          onClick={handleRevealAnswer}
                          disabled={flowLoading}
                          className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-gray-500 disabled:to-gray-600 text-white py-3 px-4 rounded-lg transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                          <Eye className="w-5 h-5" />
                          <span>答えを表示</span>
                        </button>
                        {timerState?.isActive ? (
                          <button
                            onClick={pauseGame}
                            disabled={flowLoading}
                            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white py-2 px-4 rounded-lg transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                          >
                            <Pause className="w-4 h-4" />
                            <span>一時停止</span>
                          </button>
                        ) : (
                          <button
                            onClick={resumeGame}
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
                        onClick={handleNextPhase}
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
                        {currentPhase === 'waiting' && '待機中'}
                        {currentPhase === 'countdown' && 'カウントダウン'}
                        {currentPhase === 'question' && '問題中'}
                        {currentPhase === 'answer_reveal' && '答え表示'}
                        {currentPhase === 'leaderboard' && 'ランキング'}
                        {currentPhase === 'explanation' && '解説'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Center Panel - Player Rankings */}
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
                        .map((entry, index) => (
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
                              <div className="text-white font-bold">
                                {entry.score.toLocaleString()}
                              </div>
                              <div className="text-xs text-blue-400">ポイント</div>
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">プレイヤーがいません</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel - Analytics */}
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
                        const percentage = totalAnswered > 0 ? (count / totalAnswered) * 100 : 0;
                        const isCorrect = answer.is_correct;

                        return (
                          <div key={answer.id} className="space-y-1">
                            <div className="flex justify-between text-sm items-center">
                              <span className="text-white flex items-center">
                                選択肢 {letter}
                                {isCorrect && (
                                  <span className="ml-1 text-green-400 font-bold">✓ 正解</span>
                                )}
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
                          {totalAnswered > 0
                            ? Math.round(
                                ((answerStats[
                                  currentQuestion.answers.find((a) => a.is_correct)?.id || ''
                                ] || 0) /
                                  totalAnswered) *
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
          </div>
        </Container>
      </Main>
    </PageContainer>
  );
}

export default function GameHostPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HostGameContent />
    </Suspense>
  );
}
