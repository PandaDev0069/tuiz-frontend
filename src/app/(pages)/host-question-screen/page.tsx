'use client';

import React, { Suspense, useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { HostQuestionScreen } from '@/components/game';
import { useGameFlow } from '@/hooks/useGameFlow';
import { Question } from '@/types/game';
import { gameApi } from '@/services/gameApi';
import { quizService } from '@/lib/quizService';
import type { QuestionWithAnswers } from '@/types/quiz';

function HostQuestionScreenContent() {
  const searchParams = useSearchParams();
  const gameId = searchParams.get('gameId') || '';
  const questionIdParam = searchParams.get('questionId') || 'placeholder-q1';
  const questionIndexParam = Number(searchParams.get('questionIndex') || '0');

  const { timerState, startQuestion, revealAnswer, gameFlow } = useGameFlow({
    gameId,
    isHost: true,
    autoSync: true,
  });

  const [questions, setQuestions] = useState<QuestionWithAnswers[]>([]);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Update current time every second to force timer re-renders
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Load quiz data
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

  const currentQuestion: Question = useMemo(() => {
    const idx = gameFlow?.current_question_index ?? questionIndexParam;
    const questionData = questions[idx];

    // If we have real question data, use it
    if (questionData) {
      // Use show_question_time from database (in seconds), convert to seconds for timeLimit
      const showQuestionTimeSeconds = questionData.show_question_time || 30;
      const serverDurationSeconds =
        gameFlow?.current_question_start_time && gameFlow?.current_question_end_time
          ? Math.max(
              1,
              Math.round(
                (new Date(gameFlow.current_question_end_time).getTime() -
                  new Date(gameFlow.current_question_start_time).getTime()) /
                  1000,
              ),
            )
          : null;
      const timeLimitSeconds = serverDurationSeconds ?? showQuestionTimeSeconds;

      return {
        id: questionData.id,
        text: questionData.question_text,
        image: questionData.image_url || undefined,
        // Use show_question_time from database as the time limit
        timeLimit: timeLimitSeconds,
        choices: questionData.answers
          .sort((a, b) => a.order_index - b.order_index)
          .map((a, i) => ({
            id: a.id,
            text: a.answer_text,
            letter: ['A', 'B', 'C', 'D'][i] || String.fromCharCode(65 + i),
          })),
        correctAnswerId: questionData.answers.find((a) => a.is_correct)?.id || '',
        explanation: questionData.explanation_text || undefined,
        type: 'multiple_choice_4',
      };
    }

    // Fallback: Return a minimal question structure while loading
    return {
      id: gameFlow?.current_question_id || questionIdParam,
      text:
        questions.length === 0
          ? 'クイズデータを読み込み中...'
          : `問題 ${(idx ?? 0) + 1} を読み込み中...`,
      image: undefined,
      timeLimit: Math.max(
        5,
        Math.round(
          (timerState?.remainingMs ||
            (gameFlow?.current_question_end_time &&
              gameFlow?.current_question_start_time &&
              new Date(gameFlow.current_question_end_time).getTime() -
                new Date(gameFlow.current_question_start_time).getTime()) ||
            30000) / 1000,
        ),
      ),
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
  }, [
    gameFlow?.current_question_id,
    gameFlow?.current_question_index,
    gameFlow?.current_question_start_time,
    gameFlow?.current_question_end_time,
    questionIdParam,
    questionIndexParam,
    questions,
    timerState?.remainingMs,
  ]);

  const currentTimeSeconds = Math.max(
    0,
    Math.round(
      (timerState?.remainingMs ??
        (gameFlow?.current_question_start_time && gameFlow?.current_question_end_time
          ? Math.max(0, new Date(gameFlow.current_question_end_time).getTime() - currentTime)
          : currentQuestion.timeLimit * 1000)) / 1000,
    ),
  );

  // Get the current question ID from the loaded questions or gameFlow
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

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 px-6 pt-4">
        <span className="text-sm text-gray-500">gameId: {gameId || '未指定'}</span>
        <button
          className="px-4 py-2 rounded bg-indigo-600 text-white disabled:bg-gray-400"
          onClick={async () => {
            try {
              await startQuestion(currentQuestionId, currentQuestionIndex);
            } catch (e) {
              console.error('Failed to start question:', e);
            }
          }}
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

export default function HostQuestionScreenPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HostQuestionScreenContent />
    </Suspense>
  );
}
