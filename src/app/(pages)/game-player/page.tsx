'use client';

import React, { Suspense, useMemo, useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  PlayerCountdownScreen,
  PlayerAnswerScreen,
  PlayerAnswerRevealScreen,
  PlayerLeaderboardScreen,
  PlayerExplanationScreen,
  PlayerPodiumScreen,
} from '@/components/game';
import { useGameFlow } from '@/hooks/useGameFlow';
import { useGameAnswer } from '@/hooks/useGameAnswer';
import { useGameLeaderboard } from '@/hooks/useGameLeaderboard';
import { useDeviceId } from '@/hooks/useDeviceId';
import { useSocket } from '@/components/providers/SocketProvider';
import { Question, AnswerResult } from '@/types/game';
import { gameApi } from '@/services/gameApi';
import { quizService } from '@/lib/quizService';
import type { QuestionWithAnswers } from '@/types/quiz';

type PlayerPhase =
  | 'waiting'
  | 'countdown'
  | 'question'
  | 'answering'
  | 'answer_reveal'
  | 'leaderboard'
  | 'explanation'
  | 'podium'
  | 'ended';

function PlayerGameContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const gameId = searchParams.get('gameId') || '';
  const phaseParam = (searchParams.get('phase') as PlayerPhase) || 'countdown';
  const questionIdParam = searchParams.get('questionId') || 'placeholder-q1';
  const questionIndexParam = Number(searchParams.get('questionIndex') || '0');
  const totalQuestions = Number(searchParams.get('totalQuestions') || '10');
  const playerParam = searchParams.get('playerId') || '';
  const { deviceId } = useDeviceId();
  const playerId = playerParam || deviceId || 'anonymous-player';

  const [currentPhase, setCurrentPhase] = useState<PlayerPhase>(phaseParam);

  const { gameFlow, timerState, isConnected } = useGameFlow({
    gameId,
    autoSync: true,
    events: {
      onQuestionStart: (qId, qIndex) => {
        console.log('Player: Question started', qId, qIndex);
        setCurrentPhase('question');
        router.replace(
          `/game-player?gameId=${gameId}&phase=question&questionIndex=${qIndex}&playerId=${playerId}`,
        );
      },
      onQuestionEnd: () => {
        console.log('Player: Question ended, moving to answer reveal');
        setCurrentPhase('answer_reveal');
        router.replace(`/game-player?gameId=${gameId}&phase=answer_reveal&playerId=${playerId}`);
      },
      onAnswerReveal: () => {
        console.log('Player: Answer revealed');
        setCurrentPhase('answer_reveal');
        router.replace(`/game-player?gameId=${gameId}&phase=answer_reveal&playerId=${playerId}`);
      },
      onGameEnd: () => {
        console.log('Player: Game ended, moving to podium');
        setCurrentPhase('podium');
        router.replace(`/game-player?gameId=${gameId}&phase=podium&playerId=${playerId}`);
      },
      onError: (err) => console.error('Player GameFlow Error:', err),
    },
  });

  // Note: correctAnswerId will be passed after currentQuestion is computed below
  const [correctAnswerIdState, setCorrectAnswerIdState] = useState<string | null>(null);

  const { answerStatus, answerResult, submitAnswer } = useGameAnswer({
    gameId,
    playerId,
    questionId: gameFlow?.current_question_id || null,
    questionNumber:
      gameFlow && gameFlow.current_question_index !== null && gameFlow.current_question_index >= 0
        ? gameFlow.current_question_index + 1
        : undefined,
    correctAnswerId: correctAnswerIdState || undefined,
    autoReveal: false,
    events: {
      onAnswerSubmitted: (submission) => {
        console.log('Player: Answer submitted', submission);
      },
      onError: (err) => console.error('Player Answer Error:', err),
    },
  });

  const { leaderboard } = useGameLeaderboard({
    gameId,
    playerId,
    autoRefresh: true,
  });

  const { socket } = useSocket();

  const [questions, setQuestions] = useState<QuestionWithAnswers[]>([]);
  const [answerStats, setAnswerStats] = useState<Record<string, number>>({});
  const [selectedAnswer, setSelectedAnswer] = useState<string | undefined>();
  const [isMobile, setIsMobile] = useState(true);

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

  // Listen for answer stats updates and phase changes
  useEffect(() => {
    if (!socket || !isConnected || !gameId) return;

    const handleStatsUpdate = (data: {
      roomId: string;
      questionId: string;
      counts: Record<string, number>;
    }) => {
      if (data.roomId === gameId && data.questionId === gameFlow?.current_question_id) {
        setAnswerStats(data.counts);
      }
    };

    // Listen for phase transitions from host
    const handlePhaseChange = (data: { roomId: string; phase: PlayerPhase }) => {
      if (data.roomId === gameId) {
        setCurrentPhase(data.phase);
        router.replace(`/game-player?gameId=${gameId}&phase=${data.phase}&playerId=${playerId}`);
      }
    };

    socket.on('game:answer:stats:update', handleStatsUpdate);
    socket.on('game:phase:change', handlePhaseChange);

    return () => {
      socket.off('game:answer:stats:update', handleStatsUpdate);
      socket.off('game:phase:change', handlePhaseChange);
    };
  }, [socket, isConnected, gameId, gameFlow?.current_question_id, playerId, router]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Get current question (after questions are loaded) - must be after questions state
  const currentQuestion: Question = useMemo(() => {
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
    // Fallback: Return a minimal question structure while loading
    // This should only appear briefly while quiz data is being fetched
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
    gameFlow?.current_question_id,
    gameFlow?.current_question_index,
    questionIdParam,
    questionIndexParam,
    questions,
    timerState?.remainingMs,
  ]);

  // Update correctAnswerId when currentQuestion changes
  useEffect(() => {
    if (currentQuestion?.correctAnswerId) {
      setCorrectAnswerIdState(currentQuestion.correctAnswerId);
    }
  }, [currentQuestion?.correctAnswerId]);

  const currentTimeSeconds = Math.max(
    0,
    Math.round((timerState?.remainingMs || currentQuestion.timeLimit * 1000) / 1000),
  );

  const handleAnswerSelect = (answerId: string) => {
    setSelectedAnswer(answerId);
  };

  const handleAnswerSubmit = useCallback(async () => {
    if (!selectedAnswer || !gameFlow?.current_question_id) return;
    try {
      const responseTimeMs = timerState
        ? currentQuestion.timeLimit * 1000 - timerState.remainingMs
        : 0;
      await submitAnswer(selectedAnswer, responseTimeMs);
    } catch (err) {
      console.error('Failed to submit answer:', err);
    }
  }, [
    selectedAnswer,
    gameFlow?.current_question_id,
    timerState,
    currentQuestion.timeLimit,
    submitAnswer,
  ]);

  // Use answerResult from hook if available, otherwise construct from local state
  const revealPayload: AnswerResult = useMemo(() => {
    // answerResult from hook contains partial data (questionId, selectedOption, isCorrect, etc.)
    // We need to construct the full AnswerResult with question and statistics
    const playerChoice = answerResult?.selectedOption
      ? currentQuestion.choices.find((c) => c.id === answerResult.selectedOption)
      : selectedAnswer
        ? currentQuestion.choices.find((c) => c.id === selectedAnswer)
        : undefined;

    const totalAnswered = Object.values(answerStats).reduce((sum, count) => sum + count, 0);
    const statistics = currentQuestion.choices.map((choice) => {
      const count = answerStats[choice.id] || 0;
      return {
        choiceId: choice.id,
        count,
        percentage: totalAnswered > 0 ? (count / totalAnswered) * 100 : 0,
      };
    });

    // Determine if answer is correct
    const isCorrect =
      answerResult?.isCorrect ??
      (playerChoice ? playerChoice.id === currentQuestion.correctAnswerId : false);

    return {
      question: currentQuestion,
      correctAnswer: currentQuestion.choices.find((c) => c.id === currentQuestion.correctAnswerId)!,
      playerAnswer: playerChoice,
      isCorrect,
      statistics,
      totalPlayers: leaderboard.length || 0,
      totalAnswered,
    };
  }, [answerResult, currentQuestion, selectedAnswer, answerStats, leaderboard.length]);

  // Update phase when URL changes
  useEffect(() => {
    setCurrentPhase(phaseParam);
  }, [phaseParam]);

  // Clear selected answer when question changes
  useEffect(() => {
    if (gameFlow?.current_question_id && gameFlow.current_question_id !== questionIdParam) {
      setSelectedAnswer(undefined);
    }
  }, [gameFlow?.current_question_id, questionIdParam]);

  // Phase rendering
  if (!gameId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="p-6 text-red-600 text-xl">gameId が指定されていません。</div>
      </div>
    );
  }

  if (!gameFlow) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-cyan-900 via-blue-900 to-purple-900">
        <div className="text-center">
          <div className="p-6 text-white text-xl mb-4">ゲーム状態を読み込み中...</div>
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

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-cyan-900 via-blue-900 to-purple-900">
        <div className="text-center">
          <div className="p-6 text-yellow-400 text-xl mb-4">接続を確立中...</div>
          <div className="flex justify-center space-x-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"
              style={{ animationDelay: '0.2s' }}
            ></div>
            <div
              className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"
              style={{ animationDelay: '0.4s' }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  switch (currentPhase) {
    case 'countdown':
      return (
        <PlayerCountdownScreen
          countdownTime={3}
          questionNumber={(gameFlow.current_question_index ?? questionIndexParam) + 1}
          totalQuestions={questions.length || totalQuestions}
          isMobile={isMobile}
          onCountdownComplete={() => {
            // Countdown complete - phase will transition to question via WebSocket event
            console.log('Countdown complete, waiting for question start');
          }}
        />
      );
    case 'question':
    case 'answering':
      return (
        <PlayerAnswerScreen
          question={currentQuestion}
          currentTime={currentTimeSeconds}
          questionNumber={gameFlow.current_question_index ?? questionIndexParam}
          totalQuestions={questions.length || totalQuestions}
          onAnswerSelect={handleAnswerSelect}
          onAnswerSubmit={handleAnswerSubmit}
          isMobile={isMobile}
          isSubmitted={answerStatus.hasAnswered}
        />
      );
    case 'answer_reveal':
      return <PlayerAnswerRevealScreen answerResult={revealPayload} />;
    case 'leaderboard':
      return (
        <PlayerLeaderboardScreen
          leaderboardData={{
            entries: leaderboard.map((entry) => ({
              playerId: entry.player_id,
              playerName: entry.display_name,
              score: entry.score,
              rank: entry.rank,
              previousRank: entry.rank,
              rankChange: 'same' as const,
            })),
            questionNumber: (gameFlow.current_question_index ?? questionIndexParam) + 1,
            totalQuestions: questions.length || totalQuestions,
            timeRemaining: Math.max(0, Math.round((timerState?.remainingMs || 5000) / 1000)),
            timeLimit: 5,
          }}
          onTimeExpired={() => {}}
        />
      );
    case 'explanation':
      return (
        <PlayerExplanationScreen
          explanation={{
            questionNumber: (gameFlow.current_question_index ?? questionIndexParam) + 1,
            totalQuestions: questions.length || totalQuestions,
            timeLimit: 5,
            title: '解説',
            body: currentQuestion.explanation || '解説は近日追加されます。',
          }}
        />
      );
    case 'podium':
      return (
        <PlayerPodiumScreen
          entries={leaderboard.map((entry) => ({
            playerId: entry.player_id,
            playerName: entry.display_name,
            score: entry.score,
            rank: entry.rank,
            previousRank: entry.rank,
            rankChange: 'same' as const,
          }))}
        />
      );
    default:
      return <div className="p-6">次のステップを待機しています...</div>;
  }
}

export default function GamePlayerPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PlayerGameContent />
    </Suspense>
  );
}
