// ====================================================
// File Name   : page.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-27
// Last Update : 2025-12-30
//
// Description:
// - Host explanation screen component
// - Displays question explanations with timing
// - Handles navigation to next question or podium
//
// Notes:
// - Uses game flow hook for real-time game state
// - Fetches explanation data from API with fallback
// - Supports automatic navigation on time expiry
// ====================================================

'use client';

//----------------------------------------------------
// 1. React & Next.js Imports
//----------------------------------------------------
import React, { Suspense, useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

//----------------------------------------------------
// 2. Component Imports
//----------------------------------------------------
import { HostExplanationScreen } from '@/components/game';

//----------------------------------------------------
// 3. Hook Imports
//----------------------------------------------------
import { useGameFlow } from '@/hooks/useGameFlow';

//----------------------------------------------------
// 4. Service Imports
//----------------------------------------------------
import { gameApi } from '@/services/gameApi';
import { quizService } from '@/lib/quizService';

//----------------------------------------------------
// 5. Type Imports
//----------------------------------------------------
import { ExplanationData } from '@/types/game';
import type { QuestionWithAnswers } from '@/types/quiz';

//----------------------------------------------------
// 6. Utility Imports
//----------------------------------------------------
import toast from 'react-hot-toast';

//----------------------------------------------------
// 7. Main Component
//----------------------------------------------------
/**
 * Component: HostExplanationScreenContent
 * Description:
 * - Displays question explanations with timing
 * - Handles navigation to next question or podium
 */
function HostExplanationScreenContent() {
  //----------------------------------------------------
  // 7.1. URL Parameters & Setup
  //----------------------------------------------------
  const router = useRouter();
  const searchParams = useSearchParams();
  const gameIdParam = searchParams.get('gameId') || '';
  const roomCode = searchParams.get('code') || '';
  const [gameId, setGameId] = useState<string>(gameIdParam);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionWithAnswers | null>(null);
  const [questions, setQuestions] = useState<QuestionWithAnswers[]>([]);
  const [explanationData, setExplanationData] = useState<{
    title: string | null;
    text: string | null;
    image_url: string | null;
    show_time: number;
  } | null>(null);

  //----------------------------------------------------
  // 7.2. Game Flow & State
  //----------------------------------------------------
  const { gameFlow } = useGameFlow({
    gameId: gameId || '',
    isHost: false,
    autoSync: true,
    events: {
      onQuestionStart: () => {},
      onQuestionEnd: () => {},
      onAnswerReveal: () => {},
      onGameEnd: () => {},
      onError: (err) => {
        console.error('HostExplanationScreen GameFlow Error:', err);
      },
    },
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

  useEffect(() => {
    if (questions.length > 0 && gameFlow && gameFlow.current_question_index !== null) {
      const idx = gameFlow.current_question_index;
      setCurrentQuestion(questions[idx] || null);
    } else if (gameFlow?.current_question_id && questions.length > 0) {
      const question = questions.find((q) => q.id === gameFlow.current_question_id);
      if (question) {
        setCurrentQuestion(question);
      }
    }
  }, [questions, gameFlow]);

  useEffect(() => {
    if (gameId && gameFlow?.current_question_id) {
      const fetchExplanation = async () => {
        try {
          const questionId = gameFlow.current_question_id;
          if (!questionId) return;

          const { data, error } = await gameApi.getExplanation(gameId, questionId);
          if (error) {
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
        } catch {
          toast.error('解説データの取得に失敗しました');
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

  //----------------------------------------------------
  // 7.4. Computed Values
  //----------------------------------------------------
  const currentQuestionIndex = gameFlow?.current_question_index ?? 0;
  const totalQuestions = questions.length || 10;
  const questionNumber = currentQuestionIndex + 1;

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

  //----------------------------------------------------
  // 7.5. Event Handlers
  //----------------------------------------------------
  const handleTimeExpired = () => {
    const isLastQuestion = questionNumber >= totalQuestions;
    if (isLastQuestion) {
      router.push(`/host-podium-screen?gameId=${gameId}&code=${roomCode}`);
    } else {
      router.push(`/game-host?gameId=${gameId}&phase=countdown&code=${roomCode}`);
    }
  };

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

//----------------------------------------------------
// 8. Page Wrapper Component
//----------------------------------------------------
export default function HostExplanationScreenPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HostExplanationScreenContent />
    </Suspense>
  );
}
