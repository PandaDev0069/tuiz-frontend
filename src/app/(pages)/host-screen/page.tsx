'use client';

import React, { useState, useEffect, Suspense, useMemo, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
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
import { useSocket } from '@/components/providers/SocketProvider';
import { useGameFlow } from '@/hooks/useGameFlow';
import { useGameLeaderboard } from '@/hooks/useGameLeaderboard';
import { gameApi } from '@/services/gameApi';
import { quizService } from '@/lib/quizService';
import type { QuestionWithAnswers } from '@/types/quiz';
import { Question, LeaderboardData } from '@/types/game';

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

function HostScreenContent() {
  const searchParams = useSearchParams();
  const roomCode = searchParams.get('code') || '';
  const gameIdParam = searchParams.get('gameId') || '';
  const { socket, isConnected, joinRoom, leaveRoom } = useSocket();

  const [joinUrl, setJoinUrl] = useState('');
  const [gameId, setGameId] = useState<string | null>(gameIdParam || null);
  const [currentPhase, setCurrentPhase] = useState<PublicPhase>('waiting');
  const [questions, setQuestions] = useState<QuestionWithAnswers[]>([]);
  const [answerStats, setAnswerStats] = useState<Record<string, number>>({});
  const [currentQuestionData, setCurrentQuestionData] = useState<{
    question: Question;
    serverTime: string | null;
    isActive: boolean;
    answeringTime?: number;
    showQuestionTime?: number;
  } | null>(null);
  const [countdownStartedAt, setCountdownStartedAt] = useState<number | undefined>(undefined);
  const [isDisplayPhaseDone, setIsDisplayPhaseDone] = useState(false);
  const [answerRemainingMs, setAnswerRemainingMs] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const hasJoinedRoomRef = useRef(false);

  useEffect(() => {
    setJoinUrl(`https://tuiz-info-king.vercel.app/join`);
  }, [roomCode]);

  // Get gameId from room code if not provided
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
          console.error('Failed to get game by code:', error);
          return;
        }
        setGameId(game.id);
        sessionStorage.setItem(`game_${roomCode}`, game.id);
      } catch (err) {
        console.error('Failed to get game ID:', err);
      }
    };

    getGameIdFromCode();
  }, [roomCode, gameId]);

  // Load quiz data once (for fallback)
  useEffect(() => {
    if (!gameId) return;
    const loadQuiz = async () => {
      try {
        const { data: game, error } = await gameApi.getGame(gameId);
        if (error || !game) {
          console.error('Failed to get game:', error);
          return;
        }
        const quizSetId = game?.quiz_id || game?.quiz_set_id;
        if (quizSetId) {
          const quiz = await quizService.getQuizComplete(quizSetId);
          const sorted = [...quiz.questions].sort((a, b) => a.order_index - b.order_index);
          setQuestions(sorted);
        }
      } catch (err) {
        console.error('Failed to load quiz for game', err);
      }
    };
    loadQuiz();
  }, [gameId]);

  // Use game flow for timer and question state - sync with backend
  const { gameFlow, timerState } = useGameFlow({
    gameId: gameId || '',
    isHost: false, // Public screen is not the host
    autoSync: true,
    events: {
      onQuestionStart: (questionId, questionIndex) => {
        console.log('Public Screen: Question started', questionId, questionIndex);
        setIsDisplayPhaseDone(false);
        // Don't transition if we're in countdown - let countdown complete first
        if (currentPhase !== 'countdown') {
          setCurrentPhase('question');
        }
      },
      onQuestionEnd: () => {
        console.log('Public Screen: Question ended');
        // Don't auto-transition - wait for host to reveal answer
      },
      onAnswerReveal: () => {
        console.log('Public Screen: Answer revealed');
        setCurrentPhase('answer_reveal');
      },
      onGameEnd: () => {
        console.log('Public Screen: Game ended');
        setCurrentPhase('podium');
      },
      onError: (err) => console.error('Public Screen GameFlow Error:', err),
    },
  });

  const { leaderboard } = useGameLeaderboard({
    gameId: gameId || '',
    autoRefresh: true,
  });

  // Fetch current question from API when question changes (with full metadata)
  useEffect(() => {
    if (!gameId || !gameFlow?.current_question_id) {
      setCurrentQuestionData(null);
      return;
    }

    const fetchCurrentQuestion = async () => {
      try {
        const { data, error } = await gameApi.getCurrentQuestion(gameId);
        if (error || !data) {
          console.error('Failed to fetch current question:', error);
          return;
        }

        // Transform API response to Question format
        const answeringTime = data.question.answering_time || 30;
        const timeLimit = data.question.time_limit || 40;
        const showQuestionTime = Math.max(0, timeLimit - answeringTime);

        const question: Question = {
          id: data.question.id,
          text: data.question.text,
          image: data.question.image_url || undefined,
          timeLimit: timeLimit,
          show_question_time: data.question.show_question_time || 10,
          answering_time: answeringTime,
          choices: data.answers
            .sort((a, b) => a.order_index - b.order_index)
            .map((a, i) => ({
              id: a.id,
              text: a.text,
              letter: ['A', 'B', 'C', 'D'][i] || String.fromCharCode(65 + i),
            })),
          correctAnswerId: data.answers.find((a) => a.is_correct)?.id || '',
          explanation: data.question.explanation_text || undefined,
          type: (data.question.type as Question['type']) || 'multiple_choice_4',
        };

        setCurrentQuestionData({
          question,
          serverTime: data.server_time,
          isActive: data.is_active,
          answeringTime,
          showQuestionTime,
        });
      } catch (err) {
        console.error('Error fetching current question:', err);
      }
    };

    fetchCurrentQuestion();

    // Refresh question data periodically to sync with server (every 5 seconds)
    const refreshInterval = setInterval(fetchCurrentQuestion, 5000);
    return () => clearInterval(refreshInterval);
  }, [gameId, gameFlow?.current_question_id]);

  // Listen for WebSocket events to sync with host control panel
  useEffect(() => {
    if (!socket || !isConnected || !gameId) return;

    // Join the game room using provider helper (dedup + registration guard)
    const doJoinRoom = () => {
      if (hasJoinedRoomRef.current) {
        console.log('[HostScreen] Already joined room, skipping duplicate join');
        return;
      }
      console.log('[HostScreen] Joining room:', gameId);
      joinRoom(gameId);
      hasJoinedRoomRef.current = true;
    };

    doJoinRoom();

    // Listen for phase changes from host
    const handlePhaseChange = (data: {
      roomId: string;
      phase: PublicPhase;
      startedAt?: number;
    }) => {
      if (data.roomId === gameId) {
        console.log('Public Screen: Phase changed to', data.phase, 'startedAt:', data.startedAt);
        setCurrentPhase(data.phase);
        // Store countdown start timestamp for synchronization
        if (data.phase === 'countdown' && data.startedAt) {
          setCountdownStartedAt(data.startedAt);
        }
        // Phase change handled by game flow events
      }
    };

    // Listen for answer stats updates
    const handleStatsUpdate = (data: {
      roomId: string;
      questionId: string;
      counts: Record<string, number>;
    }) => {
      if (data.roomId === gameId && data.questionId === gameFlow?.current_question_id) {
        setAnswerStats(data.counts);
      }
    };

    // Listen for game started event
    const handleGameStarted = (data: { roomId?: string; gameId?: string; roomCode?: string }) => {
      const targetGameId = data.gameId || data.roomId;
      if (targetGameId === gameId || data.roomCode === roomCode) {
        console.log('Public Screen: Game started');
        setCurrentPhase('countdown');
      }
    };

    // Listen for game pause event
    const handleGamePause = (data: { gameId?: string; timestamp?: string }) => {
      const targetGameId = data.gameId;
      if (targetGameId === gameId) {
        console.log('Public Screen: Game paused');
        // Timer will be paused by useGameFlow hook
      }
    };

    // Listen for game resume event
    const handleGameResume = (data: { gameId?: string; timestamp?: string }) => {
      const targetGameId = data.gameId;
      if (targetGameId === gameId) {
        console.log('Public Screen: Game resumed');
        // Timer will be resumed by useGameFlow hook
      }
    };

    // Listen for game end event
    const handleGameEnd = (data: { gameId?: string; timestamp?: string }) => {
      const targetGameId = data.gameId;
      if (targetGameId === gameId) {
        console.log('Public Screen: Game ended');
        setCurrentPhase('ended');
      }
    };

    socket.on('game:phase:change', handlePhaseChange);
    socket.on('game:answer:stats:update', handleStatsUpdate);
    socket.on('game:started', handleGameStarted);
    socket.on('game:pause', handleGamePause);
    socket.on('game:resume', handleGameResume);
    socket.on('game:end', handleGameEnd);

    return () => {
      socket.off('game:phase:change', handlePhaseChange);
      socket.off('game:answer:stats:update', handleStatsUpdate);
      socket.off('game:started', handleGameStarted);
      socket.off('game:pause', handleGamePause);
      socket.off('game:resume', handleGameResume);
      socket.off('game:end', handleGameEnd);

      // Leave room on unmount
      if (gameId && hasJoinedRoomRef.current) {
        console.log('[HostScreen] Leaving room on unmount');
        leaveRoom(gameId);
        hasJoinedRoomRef.current = false;
      }
    };
    // Deliberately do not depend on gameFlow/question to avoid join/leave churn
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, isConnected, gameId, roomCode]);

  // Reset display phase when question changes
  useEffect(() => {
    if (!gameFlow?.current_question_id) return;
    setIsDisplayPhaseDone(false);
    setAnswerRemainingMs(null);
  }, [gameFlow?.current_question_id]);

  // Update current time every second to force timer re-renders
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Sync phase with game flow state - but don't interrupt countdown
  useEffect(() => {
    if (!gameFlow) return;
    // Don't transition if we're in countdown phase - let countdown complete naturally
    if (currentPhase === 'countdown') return;
    if (gameFlow.current_question_id && timerState?.isActive) {
      const canPromoteToQuestion =
        currentPhase === 'waiting' ||
        currentPhase === 'leaderboard' ||
        currentPhase === 'explanation' ||
        currentPhase === 'ended' ||
        currentPhase === 'podium';
      if (canPromoteToQuestion) {
        setIsDisplayPhaseDone(false);
        setCurrentPhase('question');
      }
    }
  }, [gameFlow, gameFlow?.current_question_id, timerState?.isActive, currentPhase]);

  // Derive per-question timing - prefer API data, fallback to questions array
  const questionTimings = useMemo(() => {
    // Prefer API data if available (most accurate)
    if (
      currentQuestionData?.showQuestionTime !== undefined &&
      currentQuestionData?.answeringTime !== undefined
    ) {
      return {
        showQuestionTime: currentQuestionData.showQuestionTime,
        answeringTime: currentQuestionData.answeringTime,
      };
    }
    // Fallback to questions array
    const idx = gameFlow?.current_question_index ?? 0;
    const q = questions[idx];
    if (q) {
      return {
        showQuestionTime: q.show_question_time || 10,
        answeringTime: q.answering_time || 30,
      };
    }
    return {
      showQuestionTime: 10,
      answeringTime: 30,
    };
  }, [
    currentQuestionData?.showQuestionTime,
    currentQuestionData?.answeringTime,
    questions,
    gameFlow?.current_question_index,
  ]);

  // Timer updates are handled by useGameFlow hook via timerState

  // Use current question from API if available, otherwise fallback to local quiz data
  const currentQuestion: Question = useMemo(() => {
    // Prefer API data (has full metadata and server timestamps)
    if (currentQuestionData?.question) {
      return currentQuestionData.question;
    }

    // Fallback to local quiz data
    const questionIndex = gameFlow?.current_question_index ?? 0;
    const questionData = questions[questionIndex];
    if (questionData) {
      return {
        id: questionData.id,
        text: questionData.question_text,
        image: questionData.image_url || undefined,
        timeLimit: Math.max(5, questionData.show_question_time || 10),
        show_question_time: questionData.show_question_time || 10,
        answering_time: questionData.answering_time || 30,
        choices: questionData.answers
          .sort((a, b) => a.order_index - b.order_index)
          .map((a, i) => ({
            id: a.id,
            text: a.answer_text,
            letter: ['A', 'B', 'C', 'D'][i] || String.fromCharCode(65 + i),
          })),
        correctAnswerId: questionData.answers.find((a) => a.is_correct)?.id || '',
        explanation: questionData.explanation_text || undefined,
        type: (questionData.question_type as Question['type']) || 'multiple_choice_4',
      };
    }
    return {
      id: 'loading',
      text: '読み込み中...',
      timeLimit: 10,
      show_question_time: 10,
      answering_time: 30,
      choices: [],
      correctAnswerId: '',
      type: 'multiple_choice_4',
    };
  }, [currentQuestionData, questions, gameFlow?.current_question_index]);

  // Calculate display remaining time (exactly like player screen)
  const derivedRemainingMsFromFlow =
    gameFlow?.current_question_start_time && gameFlow?.current_question_end_time
      ? Math.max(0, new Date(gameFlow.current_question_end_time).getTime() - currentTime)
      : null;

  const displayRemainingMs =
    timerState?.remainingMs ?? derivedRemainingMsFromFlow ?? currentQuestion.timeLimit * 1000;

  const startAnsweringPhase = useCallback(() => {
    console.log('Public Screen: Display phase complete, moving to answering');
    setCurrentPhase('answering');
    const answeringDurationMs =
      (questionTimings.answeringTime ?? currentQuestion.timeLimit ?? 30) * 1000;
    setAnswerRemainingMs(answeringDurationMs);
  }, [questionTimings.answeringTime, currentQuestion.timeLimit]);

  // Move to answering once the question display timer expires (player-style)
  useEffect(() => {
    if (currentPhase !== 'question') return;
    if (displayRemainingMs <= 0 && !isDisplayPhaseDone) {
      startAnsweringPhase();
    }
  }, [currentPhase, displayRemainingMs, isDisplayPhaseDone, startAnsweringPhase]);

  // Client-side answering countdown (separate from display timer) - exactly like player screen
  useEffect(() => {
    if (currentPhase !== 'answering' || answerRemainingMs === null || answerRemainingMs <= 0)
      return;
    const interval = setInterval(() => {
      setAnswerRemainingMs((prev) => (prev !== null && prev > 1000 ? prev - 1000 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [currentPhase, answerRemainingMs]);

  // Calculate answering remaining time (exactly like player screen)
  const answeringRemainingMs =
    answerRemainingMs ?? (questionTimings.answeringTime ?? currentQuestion.timeLimit ?? 30) * 1000;

  // Current time in seconds (exactly like player screen)
  const currentTimeSeconds = Math.max(
    0,
    Math.round((currentPhase === 'question' ? displayRemainingMs : answeringRemainingMs) / 1000),
  );

  const questionIndex = gameFlow?.current_question_index ?? 0;

  const leaderboardData: LeaderboardData = useMemo(
    () => ({
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
      questionNumber: questionIndex + 1,
      totalQuestions: questions.length,
      timeRemaining: currentTimeSeconds,
      timeLimit: 5,
    }),
    [leaderboard, questionIndex, questions.length, currentTimeSeconds],
  );

  // Render different phases based on game state
  switch (currentPhase) {
    case 'countdown':
      return (
        <PublicCountdownScreen
          countdownTime={3}
          questionNumber={questionIndex + 1}
          totalQuestions={questions.length}
          startedAt={countdownStartedAt}
          onCountdownComplete={() => {
            // Countdown completed - now transition to question phase
            if (gameFlow?.current_question_id) {
              setIsDisplayPhaseDone(false);
              setCurrentPhase('question');
            }
          }}
        />
      );

    case 'question':
      return (
        <HostQuestionScreen
          question={currentQuestion}
          currentTime={currentTimeSeconds}
          questionNumber={questionIndex + 1}
          totalQuestions={questions.length}
          // No controls on public screen - read-only display
        />
      );

    case 'answering':
      return (
        <HostAnswerScreen
          question={{
            ...currentQuestion,
            timeLimit: Math.max(1, questionTimings.answeringTime),
          }}
          currentTime={currentTimeSeconds}
          questionNumber={questionIndex + 1}
          totalQuestions={questions.length}
          // No controls on public screen - read-only display
        />
      );

    case 'answer_reveal': {
      if (!currentQuestion.choices || currentQuestion.choices.length === 0) {
        return (
          <div className="flex items-center justify-center h-screen">
            <div className="text-red-600 text-xl">問題データが読み込まれていません</div>
          </div>
        );
      }

      const totalAnswered = Object.values(answerStats).reduce((sum, count) => sum + count, 0);
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
        currentQuestion.choices[0]; // Fallback to first choice if not found

      return (
        <HostAnswerRevealScreen
          answerResult={{
            question: currentQuestion,
            correctAnswer: correctAnswerChoice,
            playerAnswer: undefined,
            isCorrect: false,
            statistics,
            totalPlayers: Array.isArray(leaderboard) ? leaderboard.length : 0,
            totalAnswered,
          }}
          questionNumber={questionIndex + 1}
          totalQuestions={questions.length}
          // No controls on public screen - read-only display
        />
      );
    }

    case 'leaderboard':
      return (
        <HostLeaderboardScreen
          leaderboardData={leaderboardData}
          // No controls on public screen - read-only display
        />
      );

    case 'explanation':
      return (
        <HostExplanationScreen
          explanation={{
            questionNumber: questionIndex + 1,
            totalQuestions: questions.length,
            timeLimit: 10,
            title: '解説',
            body: currentQuestion.explanation || '解説は近日追加されます。',
          }}
          // No controls on public screen - read-only display
        />
      );

    case 'podium':
      return <HostPodiumScreen entries={leaderboardData.entries} />;

    case 'ended':
      // Game end screen - show final message
      return (
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

    case 'waiting':
    default:
      // Show waiting room with room code and QR code
      return (
        <PageContainer>
          <Main className="flex-1">
            <Container
              size="sm"
              className="flex flex-col items-center justify-center py-4 md:py-2 space-y-4 md:space-y-6"
            >
              {/* Public Display Title */}
              <div className="text-center">
                <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 bg-clip-text text-transparent animate-pulse">
                  TUIZ情報王
                </h1>
                <div className="mt-3 relative inline-block">
                  {/* Background glow */}
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-100 to-blue-100 rounded-xl blur-sm opacity-50 scale-105"></div>

                  {/* Message container */}
                  <div className="relative bg-gradient-to-r from-cyan-50 to-blue-50 px-6 py-3 rounded-xl border border-cyan-200">
                    <p className="text-base md:text-lg font-semibold bg-gradient-to-r from-cyan-700 to-blue-700 bg-clip-text text-transparent">
                      参加コードでクイズに参加しよう！
                    </p>
                  </div>
                </div>
              </div>

              {/* Room Code Display - Large for audience */}
              <div className="text-center">
                <div className="relative inline-block">
                  {/* Outer glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl blur-lg opacity-30 scale-110"></div>

                  {/* Main container with 3D effect */}
                  <div className="relative bg-gradient-to-br from-cyan-100 via-blue-50 to-cyan-100 px-16 py-10 rounded-xl border-2 border-cyan-300 shadow-2xl transform hover:scale-105 hover:shadow-cyan-200/50 transition-all duration-300">
                    {/* Inner highlight */}
                    <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent rounded-t-xl"></div>

                    <div className="relative">
                      <span className="text-8xl md:text-9xl font-mono font-black bg-gradient-to-r from-cyan-700 via-blue-600 to-cyan-700 bg-clip-text text-transparent tracking-wider drop-shadow-sm">
                        {roomCode || '------'}
                      </span>
                    </div>
                  </div>

                  {/* Decorative corner elements */}
                  <div className="absolute -top-3 -left-3 w-6 h-6 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full shadow-lg"></div>
                  <div className="absolute -bottom-3 -right-3 w-5 h-5 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full shadow-lg"></div>
                  <div className="absolute top-1/2 -right-2 w-3 h-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full shadow-md"></div>
                </div>
              </div>

              {/* QR Code for Join Page */}
              <div className="text-center max-w-md">
                <div className="relative inline-block">
                  {/* Background glow */}
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-100 to-blue-100 rounded-2xl blur-sm opacity-50 scale-105"></div>

                  {/* QR Code container */}
                  <div className="relative bg-gradient-to-r from-cyan-50 to-blue-50 px-8 py-6 rounded-2xl border border-cyan-200">
                    <h3 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-cyan-700 to-blue-700 bg-clip-text text-transparent mb-4">
                      QRコードで参加
                    </h3>

                    {/* QR Code */}
                    <div className="relative inline-block mb-4">
                      {/* Outer glow effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl blur-lg opacity-30 scale-110"></div>

                      {/* Main container with 3D effect */}
                      <div className="relative bg-gradient-to-br from-cyan-100 via-blue-50 to-cyan-100 px-8 py-8 rounded-xl border-2 border-cyan-300 shadow-2xl transform hover:scale-105 hover:shadow-cyan-200/50 transition-all duration-300">
                        {/* Inner highlight */}
                        <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent rounded-t-xl"></div>

                        {/* QR Code */}
                        {joinUrl ? (
                          <QRCode value={joinUrl} size={300} className="rounded-lg" />
                        ) : (
                          <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                            <p className="text-gray-500">QRコード生成中...</p>
                          </div>
                        )}

                        {/* Decorative corner elements */}
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
  }
}

export default function HostScreenPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HostScreenContent />
    </Suspense>
  );
}
