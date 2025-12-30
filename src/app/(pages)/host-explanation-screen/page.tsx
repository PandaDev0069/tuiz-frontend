'use client';

import React, { Suspense, useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { HostExplanationScreen } from '@/components/game';
import { ExplanationData } from '@/types/game';
import { useGameFlow } from '@/hooks/useGameFlow';
import { gameApi } from '@/services/gameApi';
import { quizService } from '@/lib/quizService';
import type { QuestionWithAnswers } from '@/types/quiz';

function HostExplanationScreenContent() {
  const router = useRouter();
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
    isHost: false,
    autoSync: true,
    events: {
      onQuestionStart: () => {},
      onQuestionEnd: () => {},
      onAnswerReveal: () => {},
      onGameEnd: () => {},
      onError: (err) => console.error('HostExplanationScreen GameFlow Error:', err),
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

  // Fetch explanation data from API
  const [explanationData, setExplanationData] = useState<{
    title: string | null;
    text: string | null;
    image_url: string | null;
    show_time: number;
  } | null>(null);

  useEffect(() => {
    if (gameId && gameFlow?.current_question_id) {
      const fetchExplanation = async () => {
        try {
          const questionId = gameFlow.current_question_id;
          if (!questionId) return;

          const { data, error } = await gameApi.getExplanation(gameId, questionId);
          if (error) {
            console.error('Failed to fetch explanation:', error);
            // Fallback to question data
            setExplanationData({
              title: currentQuestion?.explanation_title || null,
              text: currentQuestion?.explanation_text || null,
              image_url: currentQuestion?.explanation_image_url || null,
              show_time: currentQuestion?.show_explanation_time || 10,
            });
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
          // Fallback to question data
          setExplanationData({
            title: currentQuestion?.explanation_title || null,
            text: currentQuestion?.explanation_text || null,
            image_url: currentQuestion?.explanation_image_url || null,
            show_time: currentQuestion?.show_explanation_time || 10,
          });
        }
      };
      fetchExplanation();
    }
  }, [gameId, gameFlow?.current_question_id, currentQuestion]);

  const explanation: ExplanationData = useMemo(
    () => ({
      questionNumber,
      totalQuestions,
      timeLimit: explanationData?.show_time || currentQuestion?.show_explanation_time || 10,
      title: explanationData?.title || '解説',
      body:
        explanationData?.text || currentQuestion?.explanation_text || '解説は近日追加されます。',
      image: explanationData?.image_url || currentQuestion?.explanation_image_url || undefined,
    }),
    [questionNumber, totalQuestions, explanationData, currentQuestion],
  );

  const handleTimeExpired = () => {
    const isLastQuestion = questionNumber >= totalQuestions;
    if (isLastQuestion) {
      router.push(`/host-podium-screen?gameId=${gameId}&code=${roomCode}`);
    } else {
      // Move to next question (countdown phase)
      router.push(`/game-host?gameId=${gameId}&phase=countdown&code=${roomCode}`);
    }
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

  return <HostExplanationScreen explanation={explanation} onTimeExpired={handleTimeExpired} />;
}

export default function HostExplanationScreenPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HostExplanationScreenContent />
    </Suspense>
  );
}
