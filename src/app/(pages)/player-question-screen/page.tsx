// ====================================================
// File Name   : page.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-21
// Last Update : 2026-01-08
//
// Description:
// - Player question screen component
// - Displays questions and handles answer submission
// - Manages quiz data loading and question transformation
// - Handles answer reveal screen transitions
//
// Notes:
// - Uses game flow hook for real-time game state
// - Calculates points based on quiz play settings
// - Supports mobile and desktop layouts
// ====================================================

'use client';

//----------------------------------------------------
// 1. React & Next.js Imports
//----------------------------------------------------
import React, { Suspense, useMemo, useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';

//----------------------------------------------------
// 2. Component Imports
//----------------------------------------------------
import { PlayerAnswerScreen, PlayerAnswerRevealScreen } from '@/components/game';

//----------------------------------------------------
// 3. Hook Imports
//----------------------------------------------------
import { useGameFlow } from '@/hooks/useGameFlow';
import { useGameAnswer } from '@/hooks/useGameAnswer';
import { useDeviceId } from '@/hooks/useDeviceId';

//----------------------------------------------------
// 4. Service Imports
//----------------------------------------------------
import { gameApi } from '@/services/gameApi';
import { quizService } from '@/lib/quizService';

//----------------------------------------------------
// 5. Type Imports
//----------------------------------------------------
import { Question, AnswerResult } from '@/types/game';
import type { QuestionWithAnswers } from '@/types/quiz';

//----------------------------------------------------
// 6. Utility Imports
//----------------------------------------------------
import toast from 'react-hot-toast';

//----------------------------------------------------
// 7. Helper Functions
//----------------------------------------------------
/**
 * Extracts URL parameters and device ID
 */
const usePlayerQuestionParams = () => {
  const searchParams = useSearchParams();
  const { deviceId } = useDeviceId();
  const gameId = searchParams.get('gameId') || '';
  const playerParam = searchParams.get('playerId') || '';
  const playerIdentifier = playerParam || deviceId || 'anonymous-player';

  return { gameId, playerIdentifier, playerParam, deviceId };
};

/**
 * Loads quiz data from API
 */
const useQuizData = (gameId: string) => {
  const [questions, setQuestions] = useState<QuestionWithAnswers[]>([]);
  const [quizPlaySettings, setQuizPlaySettings] = useState<{
    time_bonus: boolean;
    streak_bonus: boolean;
  } | null>(null);

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

  return { questions, quizPlaySettings };
};

/**
 * Detects mobile device
 */
const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

/**
 * Transforms question data from database format to component format
 */
const transformQuestionData = (questionData: QuestionWithAnswers): Question => {
  const showQuestionTimeSeconds = questionData.show_question_time || 30;

  return {
    id: questionData.id,
    text: questionData.question_text,
    image: questionData.image_url || undefined,
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
};

/**
 * Creates a placeholder question while loading
 */
const createPlaceholderQuestion = (
  questionIndex: number,
  questionsLength: number,
  gameFlow: { current_question_id?: string | null } | null,
  timerState: { remainingMs?: number } | null,
): Question => {
  return {
    id: gameFlow?.current_question_id || 'placeholder-q1',
    text:
      questionsLength === 0
        ? 'クイズデータを読み込み中...'
        : `問題 ${(questionIndex ?? 0) + 1} を読み込み中...`,
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
};

/**
 * Calculates question number from game flow
 */
const getQuestionNumber = (
  gameFlow: { current_question_index?: number | null } | null,
): number | undefined => {
  if (
    !gameFlow ||
    gameFlow.current_question_index === null ||
    gameFlow.current_question_index === undefined ||
    gameFlow.current_question_index < 0
  ) {
    return undefined;
  }
  return gameFlow.current_question_index + 1;
};

/**
 * Calculates response time in milliseconds
 */
const calculateResponseTime = (
  timerState: { remainingMs?: number } | null,
  timeLimit: number,
): number => {
  if (!timerState || timerState.remainingMs === undefined) return 0;
  return timeLimit * 1000 - timerState.remainingMs;
};

/**
 * Builds reveal payload from current question and selected answer
 */
const buildRevealPayload = (
  currentQuestion: Question,
  selectedAnswer: string | undefined,
): AnswerResult => {
  const playerChoice = selectedAnswer
    ? currentQuestion.choices.find((c) => c.id === selectedAnswer)
    : undefined;

  return {
    question: currentQuestion,
    correctAnswer: currentQuestion.choices.find((c) => c.id === currentQuestion.correctAnswerId)!,
    playerAnswer: playerChoice,
    isCorrect: playerChoice ? playerChoice.id === currentQuestion.correctAnswerId : false,
    statistics: currentQuestion.choices.map((choice) => ({
      choiceId: choice.id,
      count: 0,
      percentage: 0,
    })),
    totalPlayers: 0,
    totalAnswered: 0,
  };
};

/**
 * Component: ValidationErrorScreen
 * Description:
 * - Displays validation error messages
 */
const ValidationErrorScreen: React.FC<{ message: string }> = ({ message }) => (
  <div className="p-6 text-red-600">{message}</div>
);

/**
 * Component: LoadingScreen
 * Description:
 * - Displays loading state messages
 */
const LoadingScreen: React.FC<{ message: string }> = ({ message }) => (
  <div className="p-6">{message}</div>
);

//----------------------------------------------------
// 8. Main Component
//----------------------------------------------------
/**
 * Component: PlayerQuestionScreenContent
 * Description:
 * - Displays questions and handles answer submission
 * - Manages quiz data loading and question transformation
 */
function PlayerQuestionScreenContent() {
  //----------------------------------------------------
  // 8.1. URL Parameters & Setup
  //----------------------------------------------------
  const { gameId, playerIdentifier, playerParam, deviceId } = usePlayerQuestionParams();
  const isMobile = useMobileDetection();
  const { questions, quizPlaySettings } = useQuizData(gameId);

  //----------------------------------------------------
  // 8.2. Game Flow & State
  //----------------------------------------------------
  const { gameFlow, timerState } = useGameFlow({
    gameId,
    autoSync: true,
  });

  const [selectedAnswer, setSelectedAnswer] = useState<string | undefined>();

  //----------------------------------------------------
  // 8.3. Computed Values
  //----------------------------------------------------
  const currentQuestionForPoints = useMemo(() => {
    if (!gameFlow?.current_question_id || !questions.length) return null;
    const questionIndex = gameFlow.current_question_index ?? 0;
    return questions[questionIndex] || null;
  }, [gameFlow?.current_question_id, gameFlow?.current_question_index, questions]);

  const currentQuestion: Question = useMemo(() => {
    const idx = gameFlow?.current_question_index ?? 0;
    const questionData = questions[idx];

    if (questionData) {
      return transformQuestionData(questionData);
    }

    return createPlaceholderQuestion(idx, questions.length, gameFlow, timerState);
  }, [gameFlow, questions, timerState]);

  const currentTimeSeconds = Math.max(
    0,
    Math.round((timerState?.remainingMs || currentQuestion.timeLimit * 1000) / 1000),
  );

  //----------------------------------------------------
  // 8.4. Answer Handling
  //----------------------------------------------------
  const questionNumber = useMemo(() => getQuestionNumber(gameFlow), [gameFlow]);

  const { answerStatus, submitAnswer } = useGameAnswer({
    gameId,
    playerId: playerIdentifier,
    questionId: gameFlow?.current_question_id || null,
    questionNumber,
    autoReveal: false,
    questionPoints: currentQuestionForPoints?.points ?? 100,
    answeringTime: currentQuestionForPoints?.answering_time ?? 30,
    timeBonusEnabled: quizPlaySettings?.time_bonus ?? false,
    streakBonusEnabled: quizPlaySettings?.streak_bonus ?? false,
  });

  const handleAnswerSelect = useCallback((answerId: string) => {
    setSelectedAnswer(answerId);
  }, []);

  const handleAnswerSubmit = useCallback(async () => {
    if (!selectedAnswer || !gameFlow?.current_question_id) return;
    try {
      const responseTimeMs = calculateResponseTime(timerState, currentQuestion.timeLimit);
      await submitAnswer(selectedAnswer, responseTimeMs);
    } catch {
      toast.error('回答の送信に失敗しました');
    }
  }, [
    selectedAnswer,
    gameFlow?.current_question_id,
    timerState,
    currentQuestion.timeLimit,
    submitAnswer,
  ]);

  const revealPayload: AnswerResult = useMemo(
    () => buildRevealPayload(currentQuestion, selectedAnswer),
    [currentQuestion, selectedAnswer],
  );

  //----------------------------------------------------
  // 8.5. Validation & Rendering
  //----------------------------------------------------
  const shouldReveal = !timerState?.isActive || answerStatus.hasAnswered;

  if (!gameId) {
    return <ValidationErrorScreen message="gameId が指定されていません。" />;
  }

  if (!playerParam && !deviceId) {
    return <ValidationErrorScreen message="playerId が指定されていません。" />;
  }

  if (!gameFlow) {
    return <LoadingScreen message="ゲーム状態を読み込み中..." />;
  }

  if (!gameFlow.current_question_id) {
    return <LoadingScreen message="次の質問開始を待機しています..." />;
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

//----------------------------------------------------
// 9. Page Wrapper Component
//----------------------------------------------------

export default function PlayerQuestionScreenPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PlayerQuestionScreenContent />
    </Suspense>
  );
}
