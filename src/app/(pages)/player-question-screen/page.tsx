'use client';

import React, { Suspense, useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { PlayerAnswerScreen, PlayerAnswerRevealScreen } from '@/components/game';
import { useGameFlow } from '@/hooks/useGameFlow';
import { useGameAnswer } from '@/hooks/useGameAnswer';
import { useDeviceId } from '@/hooks/useDeviceId';
import { Question, AnswerResult } from '@/types/game';

function PlayerQuestionScreenContent() {
  const searchParams = useSearchParams();
  const gameId = searchParams.get('gameId') || '';
  const playerParam = searchParams.get('playerId') || '';
  const { deviceId } = useDeviceId();
  const playerIdentifier = playerParam || deviceId || 'anonymous-player';

  const { gameFlow, timerState } = useGameFlow({
    gameId,
    autoSync: true,
  });

  const { answerStatus, submitAnswer } = useGameAnswer({
    gameId,
    playerId: playerIdentifier,
    questionId: gameFlow?.current_question_id || null,
    autoReveal: false,
  });

  const [selectedAnswer, setSelectedAnswer] = useState<string | undefined>();
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const currentQuestion: Question = useMemo(
    () => ({
      id: gameFlow?.current_question_id || 'placeholder-q1',
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
    [gameFlow?.current_question_id, timerState?.remainingMs],
  );

  const currentTimeSeconds = Math.max(
    0,
    Math.round((timerState?.remainingMs || currentQuestion.timeLimit * 1000) / 1000),
  );

  const handleAnswerSelect = (answerId: string) => {
    setSelectedAnswer(answerId);
  };

  const handleAnswerSubmit = async () => {
    if (!selectedAnswer || !gameFlow?.current_question_id) return;
    try {
      await submitAnswer(selectedAnswer, timerState ? timerState.remainingMs : 0);
    } catch (err) {
      console.error(err);
    }
  };

  // Build reveal payload
  const revealPayload: AnswerResult = useMemo(() => {
    const playerChoice = selectedAnswer
      ? currentQuestion.choices.find((c) => c.id === selectedAnswer)
      : undefined;
    return {
      question: currentQuestion,
      correctAnswer: currentQuestion.choices.find((c) => c.id === currentQuestion.correctAnswerId)!,
      playerAnswer: playerChoice,
      isCorrect: playerChoice ? playerChoice.id === currentQuestion.correctAnswerId : false,
      // Generate statistics dynamically based on actual choice IDs
      statistics: currentQuestion.choices.map((choice) => ({
        choiceId: choice.id,
        count: 0,
        percentage: 0,
      })),
      totalPlayers: 0,
      totalAnswered: 0,
    };
  }, [currentQuestion, selectedAnswer]);

  const shouldReveal = !timerState?.isActive || answerStatus.hasAnswered;

  if (!gameId) {
    return <div className="p-6 text-red-600">gameId が指定されていません。</div>;
  }

  if (!playerParam && !deviceId) {
    return <div className="p-6 text-red-600">playerId が指定されていません。</div>;
  }

  if (!gameFlow) {
    return <div className="p-6">ゲーム状態を読み込み中...</div>;
  }

  if (!gameFlow.current_question_id) {
    return <div className="p-6">次の質問開始を待機しています...</div>;
  }

  if (shouldReveal) {
    return <PlayerAnswerRevealScreen answerResult={revealPayload} />;
  }

  return (
    <PlayerAnswerScreen
      question={currentQuestion}
      currentTime={currentTimeSeconds}
      questionNumber={gameFlow.current_question_index ?? 0}
      totalQuestions={10}
      onAnswerSelect={handleAnswerSelect}
      onAnswerSubmit={handleAnswerSubmit}
      isMobile={isMobile}
      isSubmitted={answerStatus.hasAnswered}
    />
  );
}

export default function PlayerQuestionScreenPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PlayerQuestionScreenContent />
    </Suspense>
  );
}
