'use client';

import React, { Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { HostQuestionScreen } from '@/components/game';
import { useGameFlow } from '@/hooks/useGameFlow';
import { Question } from '@/types/game';

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

  // Temporary mock question until backend question payload is wired
  const currentQuestion: Question = useMemo(
    () => ({
      id: gameFlow?.current_question_id || questionIdParam,
      text: '問題の内容は近日バックエンド連携で差し替え予定です',
      image: undefined,
      timeLimit: Math.max(5, Math.round((timerState?.remainingMs || 10000) / 1000)),
      choices: [
        { id: 'a', text: '選択肢 A', letter: 'A' },
        { id: 'b', text: '選択肢 B', letter: 'B' },
        { id: 'c', text: '選択肢 C', letter: 'C' },
        { id: 'd', text: '選択肢 D', letter: 'D' },
      ],
      correctAnswerId: 'a',
      explanation: '解説は後で表示されます。',
      type: 'multiple_choice_4',
    }),
    [gameFlow?.current_question_id, questionIdParam, timerState?.remainingMs],
  );

  const currentTimeSeconds = Math.max(
    0,
    Math.round((timerState?.remainingMs || currentQuestion.timeLimit * 1000) / 1000),
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 px-6 pt-4">
        <span className="text-sm text-gray-500">gameId: {gameId || '未指定'}</span>
        <button
          className="px-4 py-2 rounded bg-indigo-600 text-white disabled:bg-gray-400"
          onClick={() => startQuestion(questionIdParam, questionIndexParam)}
          disabled={!gameId}
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
        questionNumber={gameFlow?.current_question_index ?? questionIndexParam}
        totalQuestions={10}
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
