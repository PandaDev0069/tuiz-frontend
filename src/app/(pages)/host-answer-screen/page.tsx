'use client';

'use client';

import React, { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { HostAnswerScreen, HostQuestionScreen } from '@/components/game';
import { useSocket } from '@/components/providers/SocketProvider';
import { useGameFlow } from '@/hooks/useGameFlow';
import { useGameLeaderboard } from '@/hooks/useGameLeaderboard';
import { gameApi } from '@/services/gameApi';
import { quizService } from '@/lib/quizService';
import type { QuestionWithAnswers } from '@/types/quiz';
import { Question } from '@/types/game';

type Phase = 'question' | 'answering' | 'answer_reveal' | 'ended';

function HostAnswerScreenContent() {
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

  // Resolve gameId from room code if needed
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
      } catch (err) {
        console.error('Failed to resolve gameId for host-answer-screen', err);
      }
    };
    resolve();
  }, [gameId, roomCode]);

  // Load quiz data (timings) for current game
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
        console.error('Failed to load quiz for host-answer-screen', err);
      }
    };
    loadQuiz();
  }, [gameId]);

  // Game flow subscription (read-only)
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
      onError: (err) => console.error('[HostAnswerScreen] GameFlow error', err),
    },
  });

  useGameLeaderboard({ gameId: gameId || '', autoRefresh: true });

  // Fetch current question from API for full metadata
  useEffect(() => {
    if (!gameId || !gameFlow?.current_question_id) {
      setCurrentQuestionData(null);
      return;
    }
    const fetchCurrentQuestion = async () => {
      try {
        const { data, error } = await gameApi.getCurrentQuestion(gameId);
        if (error || !data) return;
        // Extract timing values from API
        const answeringTime = data.question.answering_time || 30;
        const timeLimit = data.question.time_limit || 40;
        const showQuestionTime = Math.max(0, timeLimit - answeringTime);

        const question: Question = {
          id: data.question.id,
          text: data.question.text,
          image: data.question.image_url || undefined,
          timeLimit: timeLimit,
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
          answeringTime,
          showQuestionTime,
        });
      } catch (err) {
        console.error('[HostAnswerScreen] Failed to fetch current question', err);
      }
    };
    fetchCurrentQuestion();
    const interval = setInterval(fetchCurrentQuestion, 5000);
    return () => clearInterval(interval);
  }, [gameId, gameFlow?.current_question_id]);

  // Join socket room and listen for stats / phase
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

  // Reset display/answer timers whenever a new question becomes current (exactly like player screen)
  useEffect(() => {
    if (!gameFlow?.current_question_id) return;
    setIsDisplayPhaseDone(false);
    setAnswerRemainingMs(null);
  }, [gameFlow?.current_question_id]);

  // Update current time every second to force timer re-renders
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Derive per-question timing - prefer API data, fallback to questions array
  const questionTimings = useMemo(() => {
    // Prefer API data if available (most accurate)
    if (
      currentQuestionData?.showQuestionTime !== undefined &&
      currentQuestionData?.answeringTime !== undefined
    ) {
      return {
        showQuestionTime: currentQuestionData.showQuestionTime,
        answeringTime: currentQuestionData.answeringTime,
      };
    }
    // Fallback to questions array
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

  // Calculate display remaining time (exactly like player screen)
  const derivedRemainingMsFromFlow = useMemo(() => {
    if (!gameFlow?.current_question_start_time || !gameFlow?.current_question_end_time) return null;
    return Math.max(0, new Date(gameFlow.current_question_end_time).getTime() - currentTime);
  }, [gameFlow?.current_question_start_time, gameFlow?.current_question_end_time, currentTime]);

  const displayRemainingMs =
    timerState?.remainingMs ??
    derivedRemainingMsFromFlow ??
    questionTimings.showQuestionTime * 1000;

  // Compute current question (API preferred, fallback to quiz data)
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
        choices: q.answers
          .sort((a, b) => a.order_index - b.order_index)
          .map((a, i) => ({
            id: a.id,
            text: a.answer_text,
            letter: ['A', 'B', 'C', 'D'][i] || String.fromCharCode(65 + i),
          })),
        correctAnswerId: q.answers.find((a) => a.is_correct)?.id || '',
        explanation: q.explanation_text || undefined,
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
  }, [currentQuestionData, questions, gameFlow?.current_question_index]);

  const startAnsweringPhase = React.useCallback(() => {
    console.log('[HostAnswerScreen] Display phase complete, moving to answering');
    setIsDisplayPhaseDone(true);
    setCurrentPhase('answering');
    const answeringDurationMs =
      (questionTimings.answeringTime ?? currentQuestion.timeLimit ?? 30) * 1000;
    setAnswerRemainingMs(answeringDurationMs);
  }, [questionTimings.answeringTime, currentQuestion.timeLimit]);

  // Move to answering once the question display timer expires (player-style)
  useEffect(() => {
    if (currentPhase !== 'question' || displayRemainingMs > 0 || isDisplayPhaseDone) return;
    startAnsweringPhase();
  }, [currentPhase, displayRemainingMs, isDisplayPhaseDone, startAnsweringPhase]);

  // Client-side answering countdown (separate from display timer) - exactly like player screen
  useEffect(() => {
    if (currentPhase !== 'answering' || answerRemainingMs === null || answerRemainingMs <= 0)
      return;
    const interval = setInterval(() => {
      setAnswerRemainingMs((prev) => (prev !== null && prev > 1000 ? prev - 1000 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [currentPhase, answerRemainingMs]);

  // Calculate answering remaining time (exactly like player screen)
  const answeringRemainingMs =
    answerRemainingMs ?? (questionTimings.answeringTime ?? currentQuestion.timeLimit ?? 30) * 1000;

  // Current time in seconds (exactly like player screen)
  const currentTimeSeconds = Math.max(
    0,
    Math.round((currentPhase === 'question' ? displayRemainingMs : answeringRemainingMs) / 1000),
  );

  const questionIndex = gameFlow?.current_question_index ?? 0;
  const totalAnswered = useMemo(
    () => Object.values(answerStats).reduce((sum, count) => sum + count, 0),
    [answerStats],
  );

  // Render
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

export default function HostAnswerScreenPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HostAnswerScreenContent />
    </Suspense>
  );
}
