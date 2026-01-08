// ====================================================
// File Name   : page.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-23
// Last Update : 2025-12-30
//
// Description:
// - Player answer reveal screen component
// - Displays answer statistics and player's result
// - Handles navigation to leaderboard on time expiry
//
// Notes:
// - Uses game flow hook for real-time game state
// - Fetches current question and answer statistics
// - Supports WebSocket connection for live updates
// ====================================================

'use client';

//----------------------------------------------------
// 1. React & Next.js Imports
//----------------------------------------------------
import React, { Suspense, useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

//----------------------------------------------------
// 2. Component Imports
//----------------------------------------------------
import { PlayerAnswerRevealScreen } from '@/components/game';

//----------------------------------------------------
// 3. Hook Imports
//----------------------------------------------------
import { useGameFlow } from '@/hooks/useGameFlow';
import { useGameAnswer } from '@/hooks/useGameAnswer';
import { useGameLeaderboard } from '@/hooks/useGameLeaderboard';
import { useDeviceId } from '@/hooks/useDeviceId';
import { useSocket } from '@/components/providers/SocketProvider';

//----------------------------------------------------
// 4. Service Imports
//----------------------------------------------------
import { gameApi } from '@/services/gameApi';
import { quizService } from '@/lib/quizService';

//----------------------------------------------------
// 5. Type Imports
//----------------------------------------------------
import { Question, AnswerResult } from '@/types/game';

//----------------------------------------------------
// 6. Utility Imports
//----------------------------------------------------
import toast from 'react-hot-toast';

//----------------------------------------------------
// 7. Main Component
//----------------------------------------------------
/**
 * Component: PlayerAnswerRevealScreenContent
 * Description:
 * - Displays answer statistics and player's result
 * - Handles navigation to leaderboard on time expiry
 */
function PlayerAnswerRevealScreenContent() {
  //----------------------------------------------------
  // 7.1. URL Parameters & Setup
  //----------------------------------------------------
  const router = useRouter();
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

  //----------------------------------------------------
  // 7.2. Game Flow & State
  //----------------------------------------------------
  const { gameFlow } = useGameFlow({
    gameId,
    autoSync: true,
    triggerOnQuestionEndOnTimer: false,
    events: {
      onQuestionStart: () => {},
      onQuestionEnd: () => {},
      onAnswerReveal: () => {},
      onGameEnd: () => {},
      onError: (err) => {
        console.error('Player GameFlow Error:', err);
      },
    },
  });

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

  //----------------------------------------------------
  // 7.3. Effects
  //----------------------------------------------------
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
          setTotalQuestionsState(sorted.length);
        }
      } catch {
        console.error('Failed to load quiz for game');
      }
    };
    loadQuiz();
  }, [gameId]);

  useEffect(() => {
    if (!gameId || !gameFlow?.current_question_id) {
      setCurrentQuestion(null);
      return;
    }

    const fetchCurrentQuestion = async () => {
      try {
        const { data, error } = await gameApi.getCurrentQuestion(gameId);
        if (error || !data) {
          toast.error('問題データの取得に失敗しました');
          return;
        }

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
      } catch {
        toast.error('問題データの取得に失敗しました');
      }
    };

    fetchCurrentQuestion();
  }, [gameId, gameFlow?.current_question_id]);

  useEffect(() => {
    if (!socket || !isConnected || !gameId) return;

    const doJoinRoom = () => {
      if (hasJoinedRoomRef.current) {
        return;
      }
      joinRoom(gameId);
      hasJoinedRoomRef.current = true;
    };

    doJoinRoom();

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

      if (gameId && hasJoinedRoomRef.current) {
        leaveRoom(gameId);
        hasJoinedRoomRef.current = false;
      }
    };
  }, [socket, isConnected, gameId, gameFlow?.current_question_id, joinRoom, leaveRoom]);

  //----------------------------------------------------
  // 7.4. Computed Values
  //----------------------------------------------------
  const answerResult: AnswerResult | null = useMemo(() => {
    if (!currentQuestion || !currentQuestion.choices || currentQuestion.choices.length === 0) {
      return null;
    }

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

  //----------------------------------------------------
  // 7.5. Main Render
  //----------------------------------------------------
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
      onTimeExpired={() => {
        router.push(`/player-leaderboard-screen?gameId=${gameId}&playerId=${playerId}`);
      }}
    />
  );
}

//----------------------------------------------------
// 8. Page Wrapper Component
//----------------------------------------------------
export default function PlayerAnswerRevealScreenPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PlayerAnswerRevealScreenContent />
    </Suspense>
  );
}
