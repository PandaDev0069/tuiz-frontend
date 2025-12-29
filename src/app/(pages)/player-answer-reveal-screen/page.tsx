'use client';

import React, { Suspense, useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { PlayerAnswerRevealScreen } from '@/components/game';
import { Question, AnswerResult } from '@/types/game';
import { useGameFlow } from '@/hooks/useGameFlow';
import { useGameAnswer } from '@/hooks/useGameAnswer';
import { useGameLeaderboard } from '@/hooks/useGameLeaderboard';
import { useDeviceId } from '@/hooks/useDeviceId';
import { useSocket } from '@/components/providers/SocketProvider';
import { gameApi } from '@/services/gameApi';
import { quizService } from '@/lib/quizService';

function PlayerAnswerRevealScreenContent() {
  const searchParams = useSearchParams();
  const gameIdParam = searchParams.get('gameId') || '';
  const roomCode = searchParams.get('code') || '';
  const [gameId, setGameId] = useState<string>(gameIdParam);
  const questionIdParam = searchParams.get('questionId') || '';
  const questionIndexParam = Number(searchParams.get('questionIndex') || '0');
  const totalQuestions = Number(searchParams.get('totalQuestions') || '10');
  const playerParam = searchParams.get('playerId') || '';
  const { deviceId } = useDeviceId();
  const playerId = playerParam || deviceId || 'anonymous-player';

  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [answerStats, setAnswerStats] = useState<Record<string, number>>({});
  const [totalQuestionsState, setTotalQuestionsState] = useState<number>(totalQuestions);
  const hasJoinedRoomRef = useRef(false);

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
          setTotalQuestionsState(sorted.length);
        }
      } catch (err) {
        console.error('Failed to load quiz for game', err);
      }
    };
    loadQuiz();
  }, [gameId]);

  // Use game flow for timer and question state
  const { gameFlow } = useGameFlow({
    gameId,
    autoSync: true,
    triggerOnQuestionEndOnTimer: false,
    events: {
      onQuestionStart: () => {},
      onQuestionEnd: () => {},
      onAnswerReveal: () => {},
      onGameEnd: () => {},
      onError: (err) => console.error('Player GameFlow Error:', err),
    },
  });

  // Use game answer hook to get player's answer
  const { answerResult: playerAnswerResult } = useGameAnswer({
    gameId,
    playerId,
    questionId: gameFlow?.current_question_id || questionIdParam,
  });

  const { leaderboard } = useGameLeaderboard({
    gameId: gameId || '',
    autoRefresh: true,
  });

  const { socket, isConnected, joinRoom, leaveRoom } = useSocket();

  // Fetch current question from API when question changes
  useEffect(() => {
    if (!gameId || !gameFlow?.current_question_id) {
      setCurrentQuestion(null);
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

        setCurrentQuestion(question);
      } catch (err) {
        console.error('Error fetching current question:', err);
      }
    };

    fetchCurrentQuestion();
  }, [gameId, gameFlow?.current_question_id]);

  // Listen for WebSocket events
  useEffect(() => {
    if (!socket || !isConnected || !gameId) return;

    // Join the game room
    const doJoinRoom = () => {
      if (hasJoinedRoomRef.current) {
        return;
      }
      console.log('[PlayerAnswerRevealScreen] Joining room:', gameId);
      joinRoom(gameId);
      hasJoinedRoomRef.current = true;
    };

    doJoinRoom();

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

    socket.on('game:answer:stats:update', handleStatsUpdate);
    socket.on('game:answer:stats', handleStatsUpdate);

    return () => {
      socket.off('game:answer:stats:update', handleStatsUpdate);
      socket.off('game:answer:stats', handleStatsUpdate);

      // Leave room on unmount
      if (gameId && hasJoinedRoomRef.current) {
        console.log('[PlayerAnswerRevealScreen] Leaving room on unmount');
        leaveRoom(gameId);
        hasJoinedRoomRef.current = false;
      }
    };
  }, [socket, isConnected, gameId, gameFlow?.current_question_id, joinRoom, leaveRoom]);

  // Construct answer result from real data
  const answerResult: AnswerResult | null = useMemo(() => {
    if (!currentQuestion || !currentQuestion.choices || currentQuestion.choices.length === 0) {
      return null;
    }

    // Get player's answer from hook
    const playerChoice = playerAnswerResult?.selectedOption
      ? currentQuestion.choices.find((c) => c.id === playerAnswerResult.selectedOption)
      : undefined;

    const totalAnswered = Object.values(answerStats).reduce((sum, count) => sum + count, 0);
    const statistics = currentQuestion.choices.map((choice) => {
      const count = answerStats[choice.id] || 0;
      return {
        choiceId: choice.id,
        count,
        percentage: totalAnswered > 0 ? (count / totalAnswered) * 100 : 0,
      };
    });

    // Determine if answer is correct
    const isCorrect =
      playerAnswerResult?.isCorrect ??
      (playerChoice ? playerChoice.id === currentQuestion.correctAnswerId : false);

    const correctAnswerChoice =
      currentQuestion.choices.find((c) => c.id === currentQuestion.correctAnswerId) ||
      currentQuestion.choices[0];

    return {
      question: currentQuestion,
      correctAnswer: correctAnswerChoice,
      playerAnswer: playerChoice,
      isCorrect,
      statistics,
      totalPlayers: Array.isArray(leaderboard) ? leaderboard.length : 0,
      totalAnswered,
    };
  }, [currentQuestion, playerAnswerResult, answerStats, leaderboard]);

  const questionIndex = gameFlow?.current_question_index ?? questionIndexParam;

  if (!gameId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="p-6 text-red-600 text-xl">gameId が指定されていません。</div>
      </div>
    );
  }

  if (!currentQuestion || !answerResult) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-cyan-900 via-blue-900 to-purple-900">
        <div className="text-center">
          <div className="p-6 text-white text-xl mb-4">問題データを読み込み中...</div>
          <div className="flex justify-center space-x-2">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
              style={{ animationDelay: '0.2s' }}
            ></div>
            <div
              className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
              style={{ animationDelay: '0.4s' }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PlayerAnswerRevealScreen
      answerResult={answerResult}
      timeLimit={5}
      questionNumber={questionIndex + 1}
      totalQuestions={totalQuestionsState || totalQuestions}
    />
  );
}

export default function PlayerAnswerRevealScreenPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PlayerAnswerRevealScreenContent />
    </Suspense>
  );
}
