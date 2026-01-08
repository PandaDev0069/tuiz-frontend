// ====================================================
// File Name   : page.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-21
// Last Update : 2025-12-29
//
// Description:
// - Player answer screen page component
// - Displays question and allows player to select and submit answers
// - Handles answer submission with response time tracking
//
// Notes:
// - Uses game flow hook for real-time game state
// - Tracks answer submission time for scoring
// - Auto-submits answer when time expires
// ====================================================

'use client';

//----------------------------------------------------
// 1. React & Next.js Imports
//----------------------------------------------------
import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

//----------------------------------------------------
// 2. External Library Imports
//----------------------------------------------------
import toast from 'react-hot-toast';

//----------------------------------------------------
// 3. Internal Component Imports
//----------------------------------------------------
import { PlayerAnswerScreen } from '@/components/game';

//----------------------------------------------------
// 4. Service & Hook Imports
//----------------------------------------------------
import { useGameFlow } from '@/hooks/useGameFlow';
import { useGameAnswer } from '@/hooks/useGameAnswer';
import { useDeviceId } from '@/hooks/useDeviceId';
import { gameApi } from '@/services/gameApi';

//----------------------------------------------------
// 5. Type Imports
//----------------------------------------------------
import { Question } from '@/types/game';

//----------------------------------------------------
// 6. Main Component
//----------------------------------------------------
function PlayerAnswerScreenContent() {
  //----------------------------------------------------
  // 6.1. URL Parameters & Setup
  //----------------------------------------------------
  const router = useRouter();
  const searchParams = useSearchParams();
  const gameIdParam = searchParams.get('gameId') || '';
  const roomCode = searchParams.get('code') || '';
  const [gameId, setGameId] = useState<string>(gameIdParam);
  const questionIndexParam = Number(searchParams.get('questionIndex') || '0');
  const totalQuestions = Number(searchParams.get('totalQuestions') || '10');
  const playerParam = searchParams.get('playerId') || '';
  const { deviceId } = useDeviceId();
  const playerId = playerParam || deviceId || 'anonymous-player';

  //----------------------------------------------------
  // 6.2. Effects
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

  const { gameFlow } = useGameFlow({
    gameId: gameId || '',
    autoSync: true,
    triggerOnQuestionEndOnTimer: false,
    events: {
      onQuestionStart: () => {},
      onQuestionEnd: () => {},
      onAnswerReveal: () => {},
      onGameEnd: () => {},
      onError: (err) => console.error('PlayerAnswerScreen GameFlow Error:', err),
    },
  });

  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | undefined>();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const answerStartTimeRef = React.useRef<number | null>(null);

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
        setCurrentTime(answeringTime);
        answerStartTimeRef.current = Date.now();
      } catch {
        toast.error('問題データの取得に失敗しました');
      }
    };

    fetchCurrentQuestion();
  }, [gameId, gameFlow?.current_question_id]);

  const { answerResult, submitAnswer, answerStatus } = useGameAnswer({
    gameId: gameId || '',
    playerId,
    questionId: gameFlow?.current_question_id || '',
  });

  useEffect(() => {
    if (answerStatus.hasAnswered) {
      setIsSubmitted(true);
      if (answerResult?.selectedOption) {
        setSelectedAnswer(answerResult.selectedOption);
      }
    }
  }, [answerStatus.hasAnswered, answerResult?.selectedOption]);

  //----------------------------------------------------
  // 6.3. Event Handlers
  //----------------------------------------------------
  const handleAnswerSelect = (answerId: string) => {
    if (isSubmitted) return;
    setSelectedAnswer(answerId);
  };

  const handleAnswerSubmit = useCallback(async () => {
    if (!selectedAnswer || isSubmitted || !gameId || !gameFlow?.current_question_id) return;

    try {
      const responseTimeMs =
        answerStartTimeRef.current !== null ? Date.now() - answerStartTimeRef.current : 0;

      await submitAnswer(selectedAnswer, responseTimeMs);
      setIsSubmitted(true);
      router.push(
        `/player-answer-reveal-screen?gameId=${gameId}&code=${roomCode}&questionIndex=${questionIndexParam}&totalQuestions=${totalQuestions}&playerId=${playerId}`,
      );
    } catch {
      toast.error('回答の送信に失敗しました');
    }
  }, [
    selectedAnswer,
    isSubmitted,
    gameId,
    gameFlow?.current_question_id,
    submitAnswer,
    router,
    roomCode,
    questionIndexParam,
    totalQuestions,
    playerId,
  ]);

  useEffect(() => {
    if (!currentQuestion || isSubmitted) return;

    const timer = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev <= 1) {
          if (selectedAnswer && !isSubmitted) {
            handleAnswerSubmit();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [selectedAnswer, isSubmitted, currentQuestion, handleAnswerSubmit]);

  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  //----------------------------------------------------
  // 6.4. Main Render
  //----------------------------------------------------
  const questionNumber = (gameFlow?.current_question_index ?? questionIndexParam) + 1;

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
    <PlayerAnswerScreen
      question={currentQuestion}
      currentTime={currentTime}
      questionNumber={questionNumber}
      totalQuestions={totalQuestions}
      onAnswerSelect={handleAnswerSelect}
      onAnswerSubmit={handleAnswerSubmit}
      isMobile={isMobile}
      isSubmitted={isSubmitted}
    />
  );
}

export default function PlayerAnswerScreenPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PlayerAnswerScreenContent />
    </Suspense>
  );
}
