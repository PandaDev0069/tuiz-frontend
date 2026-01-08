// ====================================================
// File Name   : page.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-24
// Last Update : 2025-12-28
//
// Description:
// - Host answer screen component
// - Displays question and answer phases
// - Handles real-time phase transitions and answer statistics
//
// Notes:
// - Uses game flow hook for real-time game state
// - Supports question display and answering phases
// - Manages WebSocket connections for live updates
// ====================================================

'use client';

//----------------------------------------------------
// 1. React & Next.js Imports
//----------------------------------------------------
import React, { useState, useEffect, useMemo, useRef, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

//----------------------------------------------------
// 2. Component Imports
//----------------------------------------------------
import { HostAnswerScreen, HostQuestionScreen } from '@/components/game';

//----------------------------------------------------
// 3. Hook Imports
//----------------------------------------------------
import { useSocket } from '@/components/providers/SocketProvider';
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
import type { QuestionWithAnswers } from '@/types/quiz';
import { Question } from '@/types/game';

//----------------------------------------------------
// 6. Utility Imports
//----------------------------------------------------
import toast from 'react-hot-toast';

//----------------------------------------------------
// 7. Type Definitions
//----------------------------------------------------
type Phase = 'question' | 'answering' | 'answer_reveal' | 'ended';

//----------------------------------------------------
// 8. Main Component
//----------------------------------------------------
/**
 * Component: HostAnswerScreenContent
 * Description:
 * - Displays question and answer phases
 * - Handles real-time phase transitions and answer statistics
 */
function HostAnswerScreenContent() {
  //----------------------------------------------------
  // 8.1. URL Parameters & Setup
  //----------------------------------------------------
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomCode = searchParams.get('code') || '';
  const gameIdParam = searchParams.get('gameId') || '';
  const { socket, isConnected, joinRoom, leaveRoom } = useSocket();

  const [gameId, setGameId] = useState<string | null>(gameIdParam || null);
  const [currentPhase, setCurrentPhase] = useState<Phase>('question');
  const [questions, setQuestions] = useState<QuestionWithAnswers[]>([]);
  const [currentQuestionData, setCurrentQuestionData] = useState<{
    question: Question;
    serverTime: string | null;
    isActive: boolean;
    answeringTime?: number;
    showQuestionTime?: number;
  } | null>(null);
  const [answerStats, setAnswerStats] = useState<Record<string, number>>({});
  const [isDisplayPhaseDone, setIsDisplayPhaseDone] = useState(false);
  const [answerRemainingMs, setAnswerRemainingMs] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const hasJoinedRoomRef = useRef(false);

  //----------------------------------------------------
  // 8.2. Game Flow & State
  //----------------------------------------------------
  const { gameFlow, timerState } = useGameFlow({
    gameId: gameId || '',
    isHost: false,
    autoSync: true,
    events: {
      onQuestionStart: () => {
        setIsDisplayPhaseDone(false);
        setCurrentPhase('question');
      },
      onQuestionEnd: () => {
        setCurrentPhase('answer_reveal');
      },
      onAnswerReveal: () => {
        setCurrentPhase('answer_reveal');
      },
      onGameEnd: () => setCurrentPhase('ended'),
      onError: (err) => {
        console.error('HostAnswerScreen GameFlow error', err);
      },
    },
  });

  useGameLeaderboard({ gameId: gameId || '', autoRefresh: true });

  //----------------------------------------------------
  // 8.3. Effects
  //----------------------------------------------------
  useEffect(() => {
    if (gameId || !roomCode) return;
    const resolve = async () => {
      try {
        const storedGameId = sessionStorage.getItem(`game_${roomCode}`);
        if (storedGameId) {
          setGameId(storedGameId);
          return;
        }
        const { data: game } = await gameApi.getGameByCode(roomCode);
        if (game?.id) {
          setGameId(game.id);
          sessionStorage.setItem(`game_${roomCode}`, game.id);
        }
      } catch {
        toast.error('ゲーム情報の取得に失敗しました');
      }
    };
    resolve();
  }, [gameId, roomCode]);

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
        console.error('Failed to load quiz for host-answer-screen');
      }
    };
    loadQuiz();
  }, [gameId]);

  useEffect(() => {
    if (!gameId || !gameFlow?.current_question_id) {
      setCurrentQuestionData(null);
      return;
    }
    const fetchCurrentQuestion = async () => {
      try {
        const { data, error } = await gameApi.getCurrentQuestion(gameId);
        if (error || !data) return;
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
      } catch {
        toast.error('問題データの取得に失敗しました');
      }
    };
    fetchCurrentQuestion();
    const interval = setInterval(fetchCurrentQuestion, 5000);
    return () => clearInterval(interval);
  }, [gameId, gameFlow?.current_question_id]);

  useEffect(() => {
    if (!socket || !isConnected || !gameId) return;

    if (!hasJoinedRoomRef.current) {
      joinRoom(gameId);
      hasJoinedRoomRef.current = true;
    }

    const handleStatsUpdate = (data: {
      roomId: string;
      questionId: string;
      counts: Record<string, number>;
    }) => {
      if (data.roomId === gameId && data.questionId === gameFlow?.current_question_id) {
        setAnswerStats(data.counts);
      }
    };

    const handlePhaseChange = (data: { roomId: string; phase: Phase; startedAt?: number }) => {
      if (data.roomId !== gameId) return;
      setCurrentPhase(data.phase);
    };

    socket.on('game:answer:stats:update', handleStatsUpdate);
    socket.on('game:phase:change', handlePhaseChange);

    return () => {
      socket.off('game:answer:stats:update', handleStatsUpdate);
      socket.off('game:phase:change', handlePhaseChange);
      if (gameId && hasJoinedRoomRef.current) {
        leaveRoom(gameId);
        hasJoinedRoomRef.current = false;
      }
    };
  }, [socket, isConnected, gameId, joinRoom, leaveRoom, gameFlow?.current_question_id]);

  useEffect(() => {
    if (!gameFlow?.current_question_id) return;
    setIsDisplayPhaseDone(false);
    setAnswerRemainingMs(null);
  }, [gameFlow?.current_question_id]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  //----------------------------------------------------
  // 8.4. Computed Values
  //----------------------------------------------------
  const questionTimings = useMemo(() => {
    if (
      currentQuestionData?.showQuestionTime !== undefined &&
      currentQuestionData?.answeringTime !== undefined
    ) {
      return {
        showQuestionTime: currentQuestionData.showQuestionTime,
        answeringTime: currentQuestionData.answeringTime,
      };
    }
    const idx = gameFlow?.current_question_index ?? 0;
    const q = questions[idx];
    if (q) {
      return {
        showQuestionTime: q.show_question_time || 10,
        answeringTime: q.answering_time || 30,
      };
    }
    return { showQuestionTime: 10, answeringTime: 30 };
  }, [
    currentQuestionData?.showQuestionTime,
    currentQuestionData?.answeringTime,
    questions,
    gameFlow?.current_question_index,
  ]);

  const derivedRemainingMsFromFlow = useMemo(() => {
    if (!gameFlow?.current_question_start_time || !gameFlow?.current_question_end_time) return null;
    return Math.max(0, new Date(gameFlow.current_question_end_time).getTime() - currentTime);
  }, [gameFlow?.current_question_start_time, gameFlow?.current_question_end_time, currentTime]);

  const displayRemainingMs =
    timerState?.remainingMs ??
    derivedRemainingMsFromFlow ??
    questionTimings.showQuestionTime * 1000;

  const currentQuestion: Question = useMemo(() => {
    if (currentQuestionData?.question) return currentQuestionData.question;
    const idx = gameFlow?.current_question_index ?? 0;
    const q = questions[idx];
    if (q) {
      return {
        id: q.id,
        text: q.question_text,
        image: q.image_url || undefined,
        timeLimit: q.show_question_time || 10,
        show_question_time: q.show_question_time || 10,
        answering_time: q.answering_time || 30,
        choices: q.answers
          .sort((a, b) => a.order_index - b.order_index)
          .map((a, i) => ({
            id: a.id,
            text: a.answer_text,
            letter: ['A', 'B', 'C', 'D'][i] || String.fromCharCode(65 + i),
          })),
        correctAnswerId: q.answers.find((a) => a.is_correct)?.id || '',
        explanation: q.explanation_text || undefined,
        type: (q.question_type as Question['type']) || 'multiple_choice_4',
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

  const startAnsweringPhase = useCallback(() => {
    setIsDisplayPhaseDone(true);
    setCurrentPhase('answering');
    const answeringDurationMs =
      (questionTimings.answeringTime ?? currentQuestion.timeLimit ?? 30) * 1000;
    setAnswerRemainingMs(answeringDurationMs);
  }, [questionTimings.answeringTime, currentQuestion.timeLimit]);

  useEffect(() => {
    if (currentPhase !== 'question' || displayRemainingMs > 0 || isDisplayPhaseDone) return;
    startAnsweringPhase();
  }, [currentPhase, displayRemainingMs, isDisplayPhaseDone, startAnsweringPhase]);

  useEffect(() => {
    if (currentPhase !== 'answering' || answerRemainingMs === null || answerRemainingMs <= 0)
      return;
    const interval = setInterval(() => {
      setAnswerRemainingMs((prev) => (prev !== null && prev > 1000 ? prev - 1000 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [currentPhase, answerRemainingMs]);

  const answeringRemainingMs =
    answerRemainingMs ?? (questionTimings.answeringTime ?? currentQuestion.timeLimit ?? 30) * 1000;

  const currentTimeSeconds = Math.max(
    0,
    Math.round((currentPhase === 'question' ? displayRemainingMs : answeringRemainingMs) / 1000),
  );

  const questionIndex = gameFlow?.current_question_index ?? 0;
  const totalAnswered = useMemo(
    () => Object.values(answerStats).reduce((sum, count) => sum + count, 0),
    [answerStats],
  );

  //----------------------------------------------------
  // 8.5. Main Render
  //----------------------------------------------------
  switch (currentPhase) {
    case 'question':
      return (
        <HostQuestionScreen
          question={{
            ...currentQuestion,
            timeLimit: Math.max(1, questionTimings.showQuestionTime),
          }}
          currentTime={currentTimeSeconds}
          questionNumber={questionIndex + 1}
          totalQuestions={questions.length}
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
          totalPlayers={undefined}
          answeredCount={totalAnswered}
        />
      );

    case 'answer_reveal':
      router.replace(
        `/host-answer-reveal-screen?gameId=${gameId || ''}&code=${roomCode}&questionIndex=${questionIndex}`,
      );
      return <div className="p-6">答えを表示中...</div>;

    case 'ended':
    default:
      return <div className="p-6">ゲーム終了</div>;
  }
}

//----------------------------------------------------
// 9. Page Wrapper Component
//----------------------------------------------------
export default function HostAnswerScreenPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HostAnswerScreenContent />
    </Suspense>
  );
}
