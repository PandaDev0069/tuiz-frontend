'use client';

import React, { Suspense, useMemo, useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  HostQuestionScreen,
  HostAnswerRevealScreen,
  HostLeaderboardScreen,
  HostExplanationScreen,
  HostPodiumScreen,
  HostGameEndScreen,
  PublicCountdownScreen,
} from '@/components/game';
import { Question, LeaderboardData } from '@/types/game';
import { useGameFlow } from '@/hooks/useGameFlow';
import { useGameLeaderboard } from '@/hooks/useGameLeaderboard';
import { useSocket } from '@/components/providers/SocketProvider';
import { gameApi } from '@/services/gameApi';
import { quizService } from '@/lib/quizService';
import type { QuestionWithAnswers } from '@/types/quiz';

type HostPhase =
  | 'waiting'
  | 'countdown'
  | 'question'
  | 'answer_reveal'
  | 'leaderboard'
  | 'explanation'
  | 'podium'
  | 'ended';

function HostGameContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const gameId = searchParams.get('gameId') || '';
  const questionIdParam = searchParams.get('questionId') || 'placeholder-q1';
  const phaseParam = (searchParams.get('phase') as HostPhase) || 'question';
  const questionIndexParam = Number(searchParams.get('questionIndex') || '0');
  const totalQuestionsParam = Number(searchParams.get('totalQuestions') || '10');

  const [currentPhase, setCurrentPhase] = useState<HostPhase>(phaseParam);

  const {
    gameFlow,
    timerState,
    startQuestion,
    revealAnswer,
    loading: flowLoading,
  } = useGameFlow({
    gameId,
    isHost: true,
    autoSync: true,
    events: {
      onQuestionEnd: () => {
        setCurrentPhase('answer_reveal');
      },
      onGameEnd: () => {
        setCurrentPhase('podium');
      },
    },
  });

  const { leaderboard } = useGameLeaderboard({
    gameId,
    autoRefresh: true,
  });

  const { socket } = useSocket();

  const emitPhaseChange = useCallback(
    (phase: HostPhase) => {
      if (!socket || !gameId) return;
      socket.emit('game:phase:change', { roomId: gameId, phase });
    },
    [socket, gameId],
  );

  const [questions, setQuestions] = useState<QuestionWithAnswers[]>([]);
  const [answerStats, setAnswerStats] = useState<Record<string, number>>({});
  const [currentQuestionData, setCurrentQuestionData] = useState<{
    question: Question;
    serverTime: string | null;
    isActive: boolean;
  } | null>(null);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);

  // Listen for answer stats updates
  useEffect(() => {
    if (!socket) return;

    const handleStatsUpdate = (data: {
      roomId: string;
      questionId: string;
      counts: Record<string, number>;
    }) => {
      if (data.roomId === gameId && data.questionId === gameFlow?.current_question_id) {
        setAnswerStats(data.counts);
      }
    };

    socket.on('game:answer:stats:update', handleStatsUpdate);
    return () => {
      socket.off('game:answer:stats:update', handleStatsUpdate);
    };
  }, [socket, gameId, gameFlow?.current_question_id]);

  // Load quiz data once (for fallback and total questions count)
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

  // Fetch current question from API when question changes (with full metadata)
  useEffect(() => {
    if (!gameId || !gameFlow?.current_question_id) {
      setCurrentQuestionData(null);
      return;
    }

    const fetchCurrentQuestion = async () => {
      setIsLoadingQuestion(true);
      try {
        const { data, error } = await gameApi.getCurrentQuestion(gameId);
        if (error || !data) {
          console.error('Failed to fetch current question:', error);
          // Fallback to local quiz data
          return;
        }

        // Transform API response to Question format
        const question: Question = {
          id: data.question.id,
          text: data.question.text,
          image: data.question.image_url || undefined,
          timeLimit: data.question.time_limit,
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
        });
      } catch (err) {
        console.error('Error fetching current question:', err);
      } finally {
        setIsLoadingQuestion(false);
      }
    };

    fetchCurrentQuestion();

    // Refresh question data periodically to detect desync (every 5 seconds)
    const refreshInterval = setInterval(fetchCurrentQuestion, 5000);
    return () => clearInterval(refreshInterval);
  }, [gameId, gameFlow?.current_question_id]);

  // Use current question from API if available, otherwise fallback to local quiz data
  const currentQuestion: Question = useMemo(() => {
    // Prefer API data (has full metadata and server timestamps)
    if (currentQuestionData?.question) {
      return currentQuestionData.question;
    }

    // Fallback to local quiz data
    const idx = gameFlow?.current_question_index ?? questionIndexParam;
    const questionData = questions[idx];

    if (questionData) {
      return {
        id: questionData.id,
        text: questionData.question_text,
        image: questionData.image_url || undefined,
        timeLimit: Math.max(
          5,
          Math.round(
            (timerState?.remainingMs || questionData.show_question_time * 1000 || 10000) / 1000,
          ),
        ),
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

    // Loading state
    return {
      id: gameFlow?.current_question_id || questionIdParam,
      text:
        questions.length === 0
          ? 'クイズデータを読み込み中...'
          : `問題 ${(idx ?? 0) + 1} を読み込み中...`,
      image: undefined,
      timeLimit: Math.max(5, Math.round((timerState?.remainingMs || 10000) / 1000)),
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
    currentQuestionData,
    gameFlow?.current_question_id,
    gameFlow?.current_question_index,
    questionIdParam,
    questionIndexParam,
    questions,
    timerState?.remainingMs,
  ]);

  const leaderboardData: LeaderboardData = useMemo(
    () => ({
      entries: leaderboard.map((entry) => ({
        playerId: entry.player_id,
        playerName: entry.player_name,
        score: entry.score,
        rank: entry.rank,
        previousRank: entry.rank,
        rankChange: 'same' as const,
      })),
      questionNumber: (gameFlow?.current_question_index ?? questionIndexParam) + 1,
      totalQuestions: questions.length || totalQuestionsParam,
      timeRemaining: Math.max(0, Math.round((timerState?.remainingMs || 5000) / 1000)),
      timeLimit: 5,
    }),
    [
      leaderboard,
      gameFlow?.current_question_index,
      questionIndexParam,
      questions.length,
      timerState?.remainingMs,
      totalQuestionsParam,
    ],
  );

  const currentTimeSeconds = Math.max(
    0,
    Math.round((timerState?.remainingMs || currentQuestion.timeLimit * 1000) / 1000),
  );

  // Host control handlers
  const handleStartQuestion = useCallback(async () => {
    if (!gameId || !currentQuestion.id) return;
    try {
      const nextIndex = gameFlow?.current_question_index ?? questionIndexParam;
      const flow = await startQuestion(currentQuestion.id, nextIndex);
      const effectiveIndex =
        flow?.current_question_index ?? gameFlow?.current_question_index ?? nextIndex;
      setCurrentPhase('question');
      router.replace(`/game-host?gameId=${gameId}&phase=question&questionIndex=${effectiveIndex}`);
    } catch (e) {
      console.error('Failed to start question:', e);
    }
  }, [
    gameId,
    currentQuestion.id,
    startQuestion,
    gameFlow?.current_question_index,
    questionIndexParam,
    router,
  ]);

  const handleRevealAnswer = useCallback(async () => {
    if (!gameId) return;
    try {
      await revealAnswer();
      setCurrentPhase('answer_reveal');
      router.replace(`/game-host?gameId=${gameId}&phase=answer_reveal`);
    } catch (e) {
      console.error('Failed to reveal answer:', e);
    }
  }, [gameId, revealAnswer, router]);

  const handleNextPhase = useCallback(async () => {
    const currentIdx = gameFlow?.current_question_index ?? questionIndexParam;
    const totalQ = questions.length || totalQuestionsParam;
    const isLastQuestion = currentIdx >= totalQ - 1;

    if (currentPhase === 'answer_reveal') {
      // Skip leaderboard on last question, go to explanation or podium
      if (isLastQuestion) {
        if (currentQuestion.explanation) {
          setCurrentPhase('explanation');
          router.replace(`/game-host?gameId=${gameId}&phase=explanation`);
          emitPhaseChange('explanation');
        } else {
          setCurrentPhase('podium');
          router.replace(`/game-host?gameId=${gameId}&phase=podium`);
          emitPhaseChange('podium');
        }
      } else {
        setCurrentPhase('leaderboard');
        router.replace(`/game-host?gameId=${gameId}&phase=leaderboard`);
        emitPhaseChange('leaderboard');
      }
    } else if (currentPhase === 'leaderboard') {
      if (currentQuestion.explanation) {
        setCurrentPhase('explanation');
        router.replace(`/game-host?gameId=${gameId}&phase=explanation`);
        emitPhaseChange('explanation');
      } else {
        // Move to next question or end game
        const nextIdx = currentIdx + 1;
        if (nextIdx < totalQ) {
          // Advance to next question via backend
          try {
            const { data, error } = await gameApi.nextQuestion(gameId);
            if (error || !data) {
              console.error('Failed to advance to next question:', error);
              // Fallback: just update UI
              setCurrentPhase('countdown');
              router.replace(
                `/game-host?gameId=${gameId}&phase=countdown&questionIndex=${nextIdx}`,
              );
              emitPhaseChange('countdown');
            } else if (data.isComplete) {
              // Game is complete
              setCurrentPhase('podium');
              router.replace(`/game-host?gameId=${gameId}&phase=podium`);
              emitPhaseChange('podium');
            } else {
              // Next question ready - go to countdown
              setCurrentPhase('countdown');
              router.replace(
                `/game-host?gameId=${gameId}&phase=countdown&questionIndex=${data.nextQuestion?.index ?? nextIdx}`,
              );
              emitPhaseChange('countdown');
            }
          } catch (e) {
            console.error('Error advancing to next question:', e);
            // Fallback: just update UI
            setCurrentPhase('countdown');
            router.replace(`/game-host?gameId=${gameId}&phase=countdown&questionIndex=${nextIdx}`);
            emitPhaseChange('countdown');
          }
        } else {
          // Last question - end game
          try {
            const { data, error } = await gameApi.nextQuestion(gameId);
            if (error || !data || !data.isComplete) {
              console.error('Failed to end game:', error);
            }
            setCurrentPhase('podium');
            router.replace(`/game-host?gameId=${gameId}&phase=podium`);
            emitPhaseChange('podium');
          } catch (e) {
            console.error('Error ending game:', e);
            setCurrentPhase('podium');
            router.replace(`/game-host?gameId=${gameId}&phase=podium`);
            emitPhaseChange('podium');
          }
        }
      }
    } else if (currentPhase === 'explanation') {
      // Move to next question or end game
      const nextIdx = currentIdx + 1;
      if (nextIdx < totalQ) {
        // Advance to next question via backend
        try {
          const { data, error } = await gameApi.nextQuestion(gameId);
          if (error || !data) {
            console.error('Failed to advance to next question:', error);
            // Fallback: just update UI
            setCurrentPhase('countdown');
            router.replace(`/game-host?gameId=${gameId}&phase=countdown&questionIndex=${nextIdx}`);
            emitPhaseChange('countdown');
          } else if (data.isComplete) {
            // Game is complete
            setCurrentPhase('podium');
            router.replace(`/game-host?gameId=${gameId}&phase=podium`);
            emitPhaseChange('podium');
          } else {
            // Next question ready - go to countdown
            setCurrentPhase('countdown');
            router.replace(
              `/game-host?gameId=${gameId}&phase=countdown&questionIndex=${data.nextQuestion?.index ?? nextIdx}`,
            );
            emitPhaseChange('countdown');
          }
        } catch (e) {
          console.error('Error advancing to next question:', e);
          // Fallback: just update UI
          setCurrentPhase('countdown');
          router.replace(`/game-host?gameId=${gameId}&phase=countdown&questionIndex=${nextIdx}`);
          emitPhaseChange('countdown');
        }
      } else {
        // Last question - end game
        try {
          const { data, error } = await gameApi.nextQuestion(gameId);
          if (error || !data || !data.isComplete) {
            console.error('Failed to end game:', error);
          }
          setCurrentPhase('podium');
          router.replace(`/game-host?gameId=${gameId}&phase=podium`);
          emitPhaseChange('podium');
        } catch (e) {
          console.error('Error ending game:', e);
          setCurrentPhase('podium');
          router.replace(`/game-host?gameId=${gameId}&phase=podium`);
          emitPhaseChange('podium');
        }
      }
    }
  }, [
    currentPhase,
    gameFlow?.current_question_index,
    questionIndexParam,
    questions.length,
    totalQuestionsParam,
    currentQuestion.explanation,
    gameId,
    router,
    emitPhaseChange,
  ]);

  // Update phase when URL changes and emit phase change event
  useEffect(() => {
    setCurrentPhase(phaseParam);
    // Emit phase change when phase is set (for public screen and players to sync)
    if (phaseParam && gameId && socket) {
      emitPhaseChange(phaseParam);
    }
  }, [phaseParam, gameId, socket, emitPhaseChange]);

  switch (currentPhase) {
    case 'countdown':
      return (
        <PublicCountdownScreen
          countdownTime={3}
          questionNumber={(gameFlow?.current_question_index ?? questionIndexParam) + 1}
          totalQuestions={questions.length || totalQuestionsParam}
          onCountdownComplete={() => {
            // Auto-transition to question phase when countdown completes
            // The host can then start the question manually
            setCurrentPhase('question');
            const currentIdx = gameFlow?.current_question_index ?? questionIndexParam;
            router.replace(
              `/game-host?gameId=${gameId}&phase=question&questionIndex=${currentIdx}`,
            );
            emitPhaseChange('question');
          }}
        />
      );
    case 'answer_reveal': {
      if (!currentQuestion.choices || currentQuestion.choices.length === 0) {
        return (
          <div className="flex items-center justify-center h-screen">
            <div className="text-red-600 text-xl">問題データが読み込まれていません</div>
          </div>
        );
      }

      const totalAnswered = Object.values(answerStats).reduce((sum, count) => sum + count, 0);
      const statistics = currentQuestion.choices.map((choice) => {
        const count = answerStats[choice.id] || 0;
        return {
          choiceId: choice.id,
          count,
          percentage: totalAnswered > 0 ? (count / totalAnswered) * 100 : 0,
        };
      });

      const correctAnswerChoice =
        currentQuestion.choices.find((c) => c.id === currentQuestion.correctAnswerId) ||
        currentQuestion.choices[0]; // Fallback to first choice if not found

      return (
        <HostAnswerRevealScreen
          answerResult={{
            question: currentQuestion,
            correctAnswer: correctAnswerChoice,
            playerAnswer: undefined,
            isCorrect: false,
            statistics,
            totalPlayers: leaderboard.length || 0,
            totalAnswered,
          }}
          onNext={handleNextPhase}
        />
      );
    }
    case 'leaderboard':
      return (
        <HostLeaderboardScreen
          leaderboardData={leaderboardData}
          onTimeExpired={handleNextPhase}
          onNext={handleNextPhase}
        />
      );
    case 'explanation':
      return (
        <HostExplanationScreen
          explanation={{
            questionNumber: (gameFlow?.current_question_index ?? questionIndexParam) + 1,
            totalQuestions: questions.length || totalQuestionsParam,
            timeLimit: 10,
            title: '解説',
            body: currentQuestion.explanation || '解説は近日追加されます。',
          }}
          onNext={handleNextPhase}
        />
      );
    case 'podium':
      return (
        <HostPodiumScreen
          entries={leaderboardData.entries}
          onAnimationComplete={() => {
            // After podium animations, show game end screen
            setTimeout(() => {
              setCurrentPhase('ended');
              router.replace(`/game-host?gameId=${gameId}&phase=ended`);
              emitPhaseChange('ended');
            }, 5000); // Wait for podium animations to complete
          }}
        />
      );
    case 'ended':
      return (
        <HostGameEndScreen
          entries={leaderboardData.entries}
          gameId={gameId}
          onDismissRoom={() => {
            router.push('/dashboard');
          }}
          onStartNewGame={() => {
            // Navigate to dashboard to start a new game
            router.push('/dashboard');
          }}
        />
      );
    case 'question':
    default:
      return (
        <HostQuestionScreen
          question={currentQuestion}
          currentTime={currentTimeSeconds}
          questionNumber={(gameFlow?.current_question_index ?? questionIndexParam) + 1}
          totalQuestions={questions.length || totalQuestionsParam}
          onStartQuestion={handleStartQuestion}
          onRevealAnswer={handleRevealAnswer}
          isLive={timerState?.isActive ?? false}
          isLoading={flowLoading || isLoadingQuestion}
          errorMessage={
            flowLoading
              ? undefined
              : currentQuestionData && !currentQuestionData.isActive && timerState?.isActive
                ? 'タイマーの同期に問題があります'
                : undefined
          }
        />
      );
  }
}

export default function GameHostPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HostGameContent />
    </Suspense>
  );
}
