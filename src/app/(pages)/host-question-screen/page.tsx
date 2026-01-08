// ====================================================
// File Name   : page.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-21
// Last Update : 2026-01-08
//
// Description:
// - Host question screen component
// - Displays questions and manages question timing
// - Handles question start and answer reveal actions
//
// Notes:
// - Uses game flow hook for real-time game state
// - Calculates time limits from server timestamps
// - Supports question data loading and transformation
// ====================================================

'use client';

//----------------------------------------------------
// 1. React & Next.js Imports
//----------------------------------------------------
import React, { Suspense, useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

//----------------------------------------------------
// 2. Component Imports
//----------------------------------------------------
import { HostQuestionScreen } from '@/components/game';

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
import { Question } from '@/types/game';
import type { QuestionWithAnswers } from '@/types/quiz';

//----------------------------------------------------
// 6. Utility Imports
//----------------------------------------------------
import toast from 'react-hot-toast';

//----------------------------------------------------
// 7. Helper Functions
//----------------------------------------------------
/**
 * Calculates server duration from start and end times
 */
const calculateServerDuration = (
  startTime: string | null | undefined,
  endTime: string | null | undefined,
): number | null => {
  if (!startTime || !endTime) return null;
  const durationMs = new Date(endTime).getTime() - new Date(startTime).getTime();
  return Math.max(1, Math.round(durationMs / 1000));
};

/**
 * Transforms question data from database format to component format
 */
const transformQuestionData = (
  questionData: QuestionWithAnswers,
  timeLimitSeconds: number,
): Question => {
  return {
    id: questionData.id,
    text: questionData.question_text,
    image: questionData.image_url || undefined,
    timeLimit: timeLimitSeconds,
    show_question_time: questionData.show_question_time || 10,
    answering_time: questionData.answering_time || 30,
    choices: questionData.answers
      .sort((a, b) => a.order_index - b.order_index)
      .map((a, i) => ({
        id: a.id,
        text: a.answer_text,
        letter: ['A', 'B', 'C', 'D'][i] || String.fromCharCode(65 + i),
      })),
    correctAnswerId: questionData.answers.find((a) => a.is_correct)?.id || '',
    explanation: questionData.explanation_text || undefined,
    type: (questionData.question_type as Question['type']) || 'multiple_choice_4',
  };
};

/**
 * Creates a placeholder question while loading
 */
const createPlaceholderQuestion = (
  questionIndex: number,
  questionsLength: number,
  gameFlow: {
    current_question_id?: string | null;
    current_question_start_time?: string | null;
    current_question_end_time?: string | null;
  } | null,
  questionIdParam: string,
  timerState: { remainingMs?: number } | null,
): Question => {
  const fallbackTimeLimit =
    gameFlow?.current_question_start_time && gameFlow?.current_question_end_time
      ? new Date(gameFlow.current_question_end_time).getTime() -
        new Date(gameFlow.current_question_start_time).getTime()
      : 30000;

  return {
    id: gameFlow?.current_question_id || questionIdParam,
    text:
      questionsLength === 0
        ? 'クイズデータを読み込み中...'
        : `問題 ${(questionIndex ?? 0) + 1} を読み込み中...`,
    image: undefined,
    timeLimit: Math.max(5, Math.round((timerState?.remainingMs || fallbackTimeLimit) / 1000)),
    show_question_time: 10,
    answering_time: 30,
    choices: [
      { id: 'loading-1', text: '読み込み中...', letter: 'A' },
      { id: 'loading-2', text: '読み込み中...', letter: 'B' },
      { id: 'loading-3', text: '読み込み中...', letter: 'C' },
      { id: 'loading-4', text: '読み込み中...', letter: 'D' },
    ],
    correctAnswerId: 'loading-1',
    explanation: undefined,
    type: 'multiple_choice_4',
  };
};

/**
 * Loads quiz data from API
 */
const useQuizData = (gameId: string) => {
  const [questions, setQuestions] = useState<QuestionWithAnswers[]>([]);

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

  return questions;
};

//----------------------------------------------------
// 8. Main Component
//----------------------------------------------------
/**
 * Component: HostQuestionScreenContent
 * Description:
 * - Displays questions and manages question timing
 * - Handles question start and answer reveal actions
 */
function HostQuestionScreenContent() {
  //----------------------------------------------------
  // 8.1. URL Parameters & Setup
  //----------------------------------------------------
  const searchParams = useSearchParams();
  const gameId = searchParams.get('gameId') || '';
  const questionIdParam = searchParams.get('questionId') || 'placeholder-q1';
  const questionIndexParam = Number(searchParams.get('questionIndex') || '0');

  //----------------------------------------------------
  // 8.2. Game Flow & State
  //----------------------------------------------------
  const { timerState, startQuestion, revealAnswer, gameFlow } = useGameFlow({
    gameId,
    isHost: true,
    autoSync: true,
  });

  const questions = useQuizData(gameId);
  const [currentTime, setCurrentTime] = useState(Date.now());

  //----------------------------------------------------
  // 8.3. Effects
  //----------------------------------------------------
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  //----------------------------------------------------
  // 8.4. Computed Values
  //----------------------------------------------------
  const currentQuestion: Question = useMemo(() => {
    const idx = gameFlow?.current_question_index ?? questionIndexParam;
    const questionData = questions[idx];

    if (questionData) {
      const showQuestionTimeSeconds = questionData.show_question_time || 30;
      const serverDurationSeconds = calculateServerDuration(
        gameFlow?.current_question_start_time,
        gameFlow?.current_question_end_time,
      );
      const timeLimitSeconds = serverDurationSeconds ?? showQuestionTimeSeconds;
      return transformQuestionData(questionData, timeLimitSeconds);
    }

    return createPlaceholderQuestion(idx, questions.length, gameFlow, questionIdParam, timerState);
  }, [gameFlow, questionIndexParam, questions, questionIdParam, timerState]);

  const currentTimeSeconds = Math.max(
    0,
    Math.round(
      (timerState?.remainingMs ??
        (gameFlow?.current_question_start_time && gameFlow?.current_question_end_time
          ? Math.max(0, new Date(gameFlow.current_question_end_time).getTime() - currentTime)
          : currentQuestion.timeLimit * 1000)) / 1000,
    ),
  );

  const currentQuestionId = useMemo(() => {
    if (gameFlow?.current_question_id) {
      return gameFlow.current_question_id;
    }
    const idx = gameFlow?.current_question_index ?? questionIndexParam;
    const questionData = questions[idx];
    if (questionData) {
      return questionData.id;
    }
    return questionIdParam;
  }, [
    gameFlow?.current_question_id,
    gameFlow?.current_question_index,
    questionIndexParam,
    questions,
    questionIdParam,
  ]);

  const currentQuestionIndex = gameFlow?.current_question_index ?? questionIndexParam;

  //----------------------------------------------------
  // 8.5. Event Handlers
  //----------------------------------------------------
  const handleStartQuestion = async () => {
    try {
      await startQuestion(currentQuestionId, currentQuestionIndex);
    } catch {
      toast.error('問題の開始に失敗しました');
    }
  };

  //----------------------------------------------------
  // 8.6. Main Render
  //----------------------------------------------------

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 px-6 pt-4">
        <span className="text-sm text-gray-500">gameId: {gameId || '未指定'}</span>
        <button
          className="px-4 py-2 rounded bg-indigo-600 text-white disabled:bg-gray-400"
          onClick={handleStartQuestion}
          disabled={!gameId || !currentQuestionId}
        >
          質問を開始
        </button>
        <button
          className="px-4 py-2 rounded bg-emerald-600 text-white disabled:bg-gray-400"
          onClick={() => revealAnswer()}
          disabled={!gameId}
        >
          解答を公開
        </button>
      </div>
      <HostQuestionScreen
        question={currentQuestion}
        currentTime={currentTimeSeconds}
        questionNumber={currentQuestionIndex + 1}
        totalQuestions={questions.length || 10}
      />
    </div>
  );
}

//----------------------------------------------------
// 9. Page Wrapper Component
//----------------------------------------------------
export default function HostQuestionScreenPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HostQuestionScreenContent />
    </Suspense>
  );
}
