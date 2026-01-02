'use client';

import React, { Suspense, useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { PlayerExplanationScreen } from '@/components/game';
import { ExplanationData } from '@/types/game';
import { useGameFlow } from '@/hooks/useGameFlow';
import { gameApi } from '@/services/gameApi';
import { quizService } from '@/lib/quizService';
import type { QuestionWithAnswers } from '@/types/quiz';

function PlayerExplanationScreenContent() {
  const searchParams = useSearchParams();
  const gameIdParam = searchParams.get('gameId') || '';
  const roomCode = searchParams.get('code') || '';

  const [gameId, setGameId] = useState<string>(gameIdParam);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionWithAnswers | null>(null);
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

  // Load quiz data to get questions
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

  const { gameFlow } = useGameFlow({
    gameId: gameId || '',
    autoSync: true,
    events: {
      onQuestionStart: () => {},
      onQuestionEnd: () => {},
      onAnswerReveal: () => {},
      onGameEnd: () => {},
      onError: (err) => console.error('PlayerExplanationScreen GameFlow Error:', err),
    },
  });

  // Update current question from questions array when it changes
  useEffect(() => {
    if (questions.length > 0 && gameFlow && gameFlow.current_question_index !== null) {
      const idx = gameFlow.current_question_index;
      setCurrentQuestion(questions[idx] || null);
    } else if (gameFlow?.current_question_id && questions.length > 0) {
      // Fallback: find by question ID
      const question = questions.find((q) => q.id === gameFlow.current_question_id);
      if (question) {
        setCurrentQuestion(question);
      }
    }
  }, [questions, gameFlow]);

  const currentQuestionIndex = gameFlow?.current_question_index ?? 0;
  const totalQuestions = questions.length || 10;
  const questionNumber = currentQuestionIndex + 1;

  const explanation: ExplanationData = useMemo(
    () => ({
      questionNumber,
      totalQuestions,
      timeLimit: 5,
      title: '解説',
      body: currentQuestion?.explanation_text || '解説は近日追加されます。',
      image:
        currentQuestion?.explanation_image_url ||
        (currentQuestion?.image_url ? currentQuestion.image_url : undefined),
    }),
    [questionNumber, totalQuestions, currentQuestion],
  );

  const handleTimeExpired = () => {
    // Players wait for host to advance phase - don't auto-navigate
    // The main game-player page handles phase transitions via WebSocket
    console.log('Player explanation time expired - waiting for host');
  };

  if (!gameId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="p-6 text-red-600 text-xl">gameId が指定されていません。</div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-cyan-900 via-blue-900 to-purple-900">
        <div className="text-center">
          <div className="p-6 text-white text-xl mb-4">解説を読み込み中...</div>
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

  return <PlayerExplanationScreen explanation={explanation} onTimeExpired={handleTimeExpired} />;
}

export default function PlayerExplanationScreenPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PlayerExplanationScreenContent />
    </Suspense>
  );
}
