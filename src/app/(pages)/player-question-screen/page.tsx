'use client';

import React, { Suspense, useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { PlayerAnswerScreen, PlayerAnswerRevealScreen } from '@/components/game';
import { useGameFlow } from '@/hooks/useGameFlow';
import { useGameAnswer } from '@/hooks/useGameAnswer';
import { useDeviceId } from '@/hooks/useDeviceId';
import { Question, AnswerResult } from '@/types/game';
import { gameApi } from '@/services/gameApi';
import { quizService } from '@/lib/quizService';
import type { QuestionWithAnswers } from '@/types/quiz';

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

  const [selectedAnswer, setSelectedAnswer] = useState<string | undefined>();
  const [isMobile, setIsMobile] = useState(true);
  const [questions, setQuestions] = useState<QuestionWithAnswers[]>([]);
  const [quizPlaySettings, setQuizPlaySettings] = useState<{
    time_bonus: boolean;
    streak_bonus: boolean;
  } | null>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
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
          // Store play settings for point calculation
          if (quiz.play_settings) {
            setQuizPlaySettings({
              time_bonus: quiz.play_settings.time_bonus ?? false,
              streak_bonus: quiz.play_settings.streak_bonus ?? false,
            });
          }
        }
      } catch (err) {
        console.error('Failed to load quiz for game', err);
      }
    };
    loadQuiz();
  }, [gameId]);

  // Get current question data for point calculation
  const currentQuestionForPoints = useMemo(() => {
    if (!gameFlow?.current_question_id || !questions.length) return null;
    const questionIndex = gameFlow.current_question_index ?? 0;
    return questions[questionIndex] || null;
  }, [gameFlow?.current_question_id, gameFlow?.current_question_index, questions]);

  const { answerStatus, submitAnswer } = useGameAnswer({
    gameId,
    playerId: playerIdentifier,
    questionId: gameFlow?.current_question_id || null,
    questionNumber:
      gameFlow && gameFlow.current_question_index !== null && gameFlow.current_question_index >= 0
        ? gameFlow.current_question_index + 1
        : undefined,
    autoReveal: false,
    // Point calculation parameters
    questionPoints: currentQuestionForPoints?.points ?? 100,
    answeringTime: currentQuestionForPoints?.answering_time ?? 30,
    timeBonusEnabled: quizPlaySettings?.time_bonus ?? false,
    streakBonusEnabled: quizPlaySettings?.streak_bonus ?? false,
  });

  const currentQuestion: Question = useMemo(() => {
    const idx = gameFlow?.current_question_index ?? 0;
    const questionData = questions[idx];

    // If we have real question data, use it
    if (questionData) {
      // Use show_question_time from database (in seconds), convert to seconds for timeLimit
      const showQuestionTimeSeconds = questionData.show_question_time || 30;

      return {
        id: questionData.id,
        text: questionData.question_text,
        image: questionData.image_url || undefined,
        // Use show_question_time from database as the time limit
        timeLimit: showQuestionTimeSeconds,
        show_question_time: showQuestionTimeSeconds,
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
    }

    // Fallback: Return a minimal question structure while loading
    return {
      id: gameFlow?.current_question_id || 'placeholder-q1',
      text:
        questions.length === 0
          ? 'クイズデータを読み込み中...'
          : `問題 ${(idx ?? 0) + 1} を読み込み中...`,
      image: undefined,
      timeLimit: Math.max(5, Math.round((timerState?.remainingMs || 10000) / 1000)),
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
  }, [
    gameFlow?.current_question_id,
    gameFlow?.current_question_index,
    questions,
    timerState?.remainingMs,
  ]);

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
      // Calculate response time: total time limit - remaining time = elapsed time
      const responseTimeMs = timerState
        ? currentQuestion.timeLimit * 1000 - timerState.remainingMs
        : 0;
      await submitAnswer(selectedAnswer, responseTimeMs);
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
      totalQuestions={questions.length || 10}
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
