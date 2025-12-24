'use client';

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { PageContainer, Container, Main } from '@/components/ui';
import { QRCode } from '@/components/ui/QRCode';
import {
  PublicCountdownScreen,
  HostQuestionScreen,
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
  | 'answer_reveal'
  | 'leaderboard'
  | 'explanation'
  | 'podium'
  | 'ended';

function HostScreenContent() {
  const searchParams = useSearchParams();
  const roomCode = searchParams.get('code') || '';
  const gameIdParam = searchParams.get('gameId') || '';
  const { socket, isConnected } = useSocket();

  const [joinUrl, setJoinUrl] = useState('');
  const [gameId, setGameId] = useState<string | null>(gameIdParam || null);
  const [currentPhase, setCurrentPhase] = useState<PublicPhase>('waiting');
  const [questions, setQuestions] = useState<QuestionWithAnswers[]>([]);
  const [answerStats, setAnswerStats] = useState<Record<string, number>>({});
  const [questionIndex, setQuestionIndex] = useState(0);
  const [currentQuestionData, setCurrentQuestionData] = useState<{
    question: Question;
    serverTime: string | null;
    isActive: boolean;
  } | null>(null);

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

        const { data: game } = await gameApi.getGameByCode(roomCode);
        if (game) {
          setGameId(game.id);
          sessionStorage.setItem(`game_${roomCode}`, game.id);
        }
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
        const { data: game } = await gameApi.getGame(gameId);
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

  // Use game flow for timer and question state
  const { gameFlow, timerState } = useGameFlow({
    gameId: gameId || '',
    isHost: false, // Public screen is not the host
    autoSync: true,
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
        const question: Question = {
          id: data.question.id,
          text: data.question.text,
          image: data.question.image_url || undefined,
          timeLimit: data.question.time_limit,
          choices: data.answers
            .sort((a, b) => a.order_index - b.order_index)
            .map((a, i) => ({
              id: a.id,
              text: a.text,
              letter: ['A', 'B', 'C', 'D'][i] || String.fromCharCode(65 + i),
            })),
          correctAnswerId: data.answers.find((a) => a.is_correct)?.id || '',
          explanation: data.question.explanation_text || undefined,
          type: 'multiple_choice_4',
        };

        setCurrentQuestionData({
          question,
          serverTime: data.server_time,
          isActive: data.is_active,
        });
        setQuestionIndex(data.question_index);
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

    // Listen for game start
    const handleGameStarted = (data: { roomId?: string; gameId?: string; roomCode?: string }) => {
      const targetGameId = data.gameId || data.roomId;
      if (targetGameId === gameId || data.roomCode === roomCode) {
        setCurrentPhase('countdown');
      }
    };

    // Listen for phase changes from host
    const handlePhaseChange = (data: { roomId: string; phase: PublicPhase }) => {
      if (data.roomId === gameId) {
        setCurrentPhase(data.phase);
      }
    };

    // Listen for answer stats updates
    const handleStatsUpdate = (data: {
      roomId: string;
      questionId: string;
      counts: Record<string, number>;
    }) => {
      if (data.roomId === gameId) {
        setAnswerStats(data.counts);
      }
    };

    // Join the game room
    socket.emit('room:join', { roomId: gameId });

    socket.on('game:started', handleGameStarted);
    socket.on('game:phase:change', handlePhaseChange);
    socket.on('game:answer:stats:update', handleStatsUpdate);

    return () => {
      socket.off('game:started', handleGameStarted);
      socket.off('game:phase:change', handlePhaseChange);
      socket.off('game:answer:stats:update', handleStatsUpdate);
      socket.emit('room:leave', { roomId: gameId });
    };
  }, [socket, isConnected, gameId, roomCode]);

  // Update question index when game flow changes
  useEffect(() => {
    if (
      gameFlow &&
      gameFlow.current_question_index !== null &&
      gameFlow.current_question_index !== undefined
    ) {
      setQuestionIndex(gameFlow.current_question_index);
    }
  }, [gameFlow]);

  // Use current question from API if available, otherwise fallback to local quiz data
  const currentQuestion: Question = useMemo(() => {
    // Prefer API data (has full metadata and server timestamps)
    if (currentQuestionData?.question) {
      return currentQuestionData.question;
    }

    // Fallback to local quiz data
    const questionData = questions[questionIndex];
    if (questionData) {
      return {
        id: questionData.id,
        text: questionData.question_text,
        image: questionData.image_url || undefined,
        timeLimit: Math.max(5, questionData.show_question_time || 10),
        choices: questionData.answers
          .sort((a, b) => a.order_index - b.order_index)
          .map((a, i) => ({
            id: a.id,
            text: a.answer_text,
            letter: ['A', 'B', 'C', 'D'][i] || String.fromCharCode(65 + i),
          })),
        correctAnswerId: questionData.answers.find((a) => a.is_correct)?.id || '',
        explanation: questionData.explanation_text || undefined,
        type: 'multiple_choice_4',
      };
    }
    return {
      id: 'loading',
      text: '読み込み中...',
      timeLimit: 10,
      choices: [],
      correctAnswerId: '',
      type: 'multiple_choice_4',
    };
  }, [currentQuestionData, questions, questionIndex]);

  const currentTimeSeconds = Math.max(
    0,
    Math.round((timerState?.remainingMs || currentQuestion.timeLimit * 1000) / 1000),
  );

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
          onCountdownComplete={() => {
            // Auto-transition handled by host, but we can update local state
            setCurrentPhase('question');
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
          // No controls on public screen
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
          // No controls on public screen
        />
      );
    }

    case 'leaderboard':
      return (
        <HostLeaderboardScreen
          leaderboardData={leaderboardData}
          // No controls on public screen
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
          // No controls on public screen
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

export default function HostScreenPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HostScreenContent />
    </Suspense>
  );
}
