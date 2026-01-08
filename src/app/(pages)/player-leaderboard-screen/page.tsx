// ====================================================
// File Name   : page.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-27
// Last Update : 2025-12-29
//
// Description:
// - Player leaderboard screen component
// - Displays player rankings and scores
// - Waits for host to advance phase
//
// Notes:
// - Uses game flow hook for real-time game state
// - Fetches leaderboard data with auto-refresh
// - No auto-navigation (waits for host phase change)
// ====================================================

'use client';

//----------------------------------------------------
// 1. React & Next.js Imports
//----------------------------------------------------
import React, { Suspense, useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';

//----------------------------------------------------
// 2. Component Imports
//----------------------------------------------------
import { PlayerLeaderboardScreen } from '@/components/game';

//----------------------------------------------------
// 3. Hook Imports
//----------------------------------------------------
import { useGameFlow } from '@/hooks/useGameFlow';
import { useGameLeaderboard } from '@/hooks/useGameLeaderboard';

//----------------------------------------------------
// 4. Service Imports
//----------------------------------------------------
import { gameApi } from '@/services/gameApi';
import { quizService } from '@/lib/quizService';

//----------------------------------------------------
// 5. Type Imports
//----------------------------------------------------
import { LeaderboardData } from '@/types/game';
import type { QuestionWithAnswers } from '@/types/quiz';

//----------------------------------------------------
// 6. Utility Imports
//----------------------------------------------------
import toast from 'react-hot-toast';

//----------------------------------------------------
// 7. Main Component
//----------------------------------------------------
/**
 * Component: PlayerLeaderboardScreenContent
 * Description:
 * - Displays player rankings and scores
 * - Waits for host to advance phase
 */
function PlayerLeaderboardScreenContent() {
  //----------------------------------------------------
  // 7.1. URL Parameters & Setup
  //----------------------------------------------------
  const searchParams = useSearchParams();
  const gameIdParam = searchParams.get('gameId') || '';
  const roomCode = searchParams.get('code') || '';
  const [gameId, setGameId] = useState<string>(gameIdParam);
  const [questions, setQuestions] = useState<QuestionWithAnswers[]>([]);

  //----------------------------------------------------
  // 7.2. Game Flow & State
  //----------------------------------------------------
  const { gameFlow, timerState } = useGameFlow({
    gameId: gameId || '',
    autoSync: true,
    events: {
      onQuestionStart: () => {},
      onQuestionEnd: () => {},
      onAnswerReveal: () => {},
      onGameEnd: () => {},
      onError: (err) => {
        console.error('PlayerLeaderboardScreen GameFlow Error:', err);
      },
    },
  });

  const { leaderboard, loading } = useGameLeaderboard({
    gameId: gameId || '',
    autoRefresh: true,
  });

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
        const { data: game } = await gameApi.getGame(gameId);
        const quizId = game?.quiz_id || game?.quiz_set_id;
        if (quizId) {
          const quiz = await quizService.getQuizComplete(quizId);
          const sorted = [...quiz.questions].sort((a, b) => a.order_index - b.order_index);
          setQuestions(sorted);
        }
      } catch {
        console.error('Failed to load quiz for game');
      }
    };
    loadQuiz();
  }, [gameId]);

  //----------------------------------------------------
  // 7.4. Computed Values
  //----------------------------------------------------
  const entries = useMemo(() => {
    if (!Array.isArray(leaderboard) || leaderboard.length === 0) {
      return [];
    }

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

  const timeRemaining = useMemo(() => {
    if (!timerState?.remainingMs) return 0;
    return Math.max(0, Math.ceil(timerState.remainingMs / 1000));
  }, [timerState?.remainingMs]);

  const timeLimit = 5;

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

  //----------------------------------------------------
  // 7.5. Event Handlers
  //----------------------------------------------------
  const handleTimeExpired = () => {};

  //----------------------------------------------------
  // 7.6. Main Render
  //----------------------------------------------------
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

//----------------------------------------------------
// 8. Page Wrapper Component
//----------------------------------------------------
export default function PlayerLeaderboardScreenPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PlayerLeaderboardScreenContent />
    </Suspense>
  );
}
