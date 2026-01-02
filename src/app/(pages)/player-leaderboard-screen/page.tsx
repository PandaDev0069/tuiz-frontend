'use client';

import React, { Suspense, useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { PlayerLeaderboardScreen } from '@/components/game';
import { LeaderboardData } from '@/types/game';
import { useGameFlow } from '@/hooks/useGameFlow';
import { useGameLeaderboard } from '@/hooks/useGameLeaderboard';
import { gameApi } from '@/services/gameApi';
import { quizService } from '@/lib/quizService';
import type { QuestionWithAnswers } from '@/types/quiz';

function PlayerLeaderboardScreenContent() {
  const searchParams = useSearchParams();
  const gameIdParam = searchParams.get('gameId') || '';
  const roomCode = searchParams.get('code') || '';

  const [gameId, setGameId] = useState<string>(gameIdParam);
  const [questions, setQuestions] = useState<QuestionWithAnswers[]>([]);

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

  // Load quiz data to get total questions
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

  const { gameFlow, timerState } = useGameFlow({
    gameId: gameId || '',
    autoSync: true,
    events: {
      onQuestionStart: () => {},
      onQuestionEnd: () => {},
      onAnswerReveal: () => {},
      onGameEnd: () => {},
      onError: (err) => console.error('PlayerLeaderboardScreen GameFlow Error:', err),
    },
  });

  const { leaderboard, loading } = useGameLeaderboard({
    gameId: gameId || '',
    autoRefresh: true,
  });

  // Transform backend LeaderboardEntry to frontend LeaderboardEntry
  const entries = useMemo(() => {
    if (!Array.isArray(leaderboard) || leaderboard.length === 0) {
      return [];
    }

    // Store previous ranks for comparison (simplified - in real app, you'd track this)
    const previousRanks = new Map<string, number>();

    return leaderboard.map((entry) => {
      const previousRank = previousRanks.get(entry.player_id) || entry.rank;
      previousRanks.set(entry.player_id, entry.rank);

      let rankChange: 'up' | 'down' | 'same' = 'same';
      if (previousRank && previousRank !== entry.rank) {
        rankChange = entry.rank < previousRank ? 'up' : 'down';
      }

      return {
        playerId: entry.player_id,
        playerName: entry.player_name,
        score: entry.score,
        rank: entry.rank,
        previousRank: previousRank !== entry.rank ? previousRank : undefined,
        rankChange,
      };
    });
  }, [leaderboard]);

  const currentQuestionIndex = gameFlow?.current_question_index ?? 0;
  const totalQuestions = questions.length || 10;
  const questionNumber = currentQuestionIndex + 1;

  // Calculate time remaining from timer state
  const timeRemaining = useMemo(() => {
    if (!timerState?.remainingMs) return 0;
    return Math.max(0, Math.ceil(timerState.remainingMs / 1000));
  }, [timerState?.remainingMs]);

  const timeLimit = 5; // Default leaderboard display time

  const leaderboardData: LeaderboardData = useMemo(
    () => ({
      entries,
      questionNumber,
      totalQuestions,
      timeRemaining,
      timeLimit,
    }),
    [entries, questionNumber, totalQuestions, timeRemaining],
  );

  const handleTimeExpired = () => {
    // Players wait for host to advance phase - don't auto-navigate
    // The main game-player page handles phase transitions via WebSocket
    console.log('Player leaderboard time expired - waiting for host');
  };

  if (!gameId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="p-6 text-red-600 text-xl">gameId が指定されていません。</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-cyan-900 via-blue-900 to-purple-900">
        <div className="text-center">
          <div className="p-6 text-white text-xl mb-4">リーダーボードを読み込み中...</div>
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
    <PlayerLeaderboardScreen leaderboardData={leaderboardData} onTimeExpired={handleTimeExpired} />
  );
}

export default function PlayerLeaderboardScreenPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PlayerLeaderboardScreenContent />
    </Suspense>
  );
}
