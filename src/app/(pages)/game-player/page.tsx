'use client';

import React, { Suspense, useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
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
  const searchParams = useSearchParams();
  const gameId = searchParams.get('gameId') || '';
  const phaseParam = (searchParams.get('phase') as PlayerPhase) || 'question';
  const questionIdParam = searchParams.get('questionId') || 'placeholder-q1';
  const questionIndexParam = Number(searchParams.get('questionIndex') || '0');
  const totalQuestions = Number(searchParams.get('totalQuestions') || '10');
  const playerParam = searchParams.get('playerId') || '';
  const { deviceId } = useDeviceId();
  const playerId = playerParam || deviceId || 'anonymous-player';

  const { gameFlow, timerState } = useGameFlow({
    gameId,
    autoSync: true,
  });

  const { answerStatus, submitAnswer } = useGameAnswer({
    gameId,
    playerId,
    questionId: gameFlow?.current_question_id || null,
    autoReveal: false,
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
        if (game?.quiz_id) {
          const quiz = await quizService.getQuizComplete(game.quiz_id);
          const sorted = [...quiz.questions].sort((a, b) => a.order_index - b.order_index);
          setQuestions(sorted);
        }
      } catch (err) {
        console.error('Failed to load quiz for game', err);
      }
    };
    loadQuiz();
  }, [gameId]);

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

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
    return {
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
    };
  }, [
    gameFlow?.current_question_id,
    gameFlow?.current_question_index,
    questionIdParam,
    questionIndexParam,
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
      await submitAnswer(selectedAnswer, timerState ? timerState.remainingMs : 0);
    } catch (err) {
      console.error(err);
    }
  };

  const revealPayload: AnswerResult = useMemo(() => {
    const playerChoice = selectedAnswer
      ? currentQuestion.choices.find((c) => c.id === selectedAnswer)
      : undefined;

    // Calculate statistics from answerStats
    const totalAnswered = Object.values(answerStats).reduce((sum, count) => sum + count, 0);
    const statistics = currentQuestion.choices.map((choice) => {
      const count = answerStats[choice.id] || 0;
      return {
        choiceId: choice.id,
        count,
        percentage: totalAnswered > 0 ? (count / totalAnswered) * 100 : 0,
      };
    });

    return {
      question: currentQuestion,
      correctAnswer: currentQuestion.choices.find((c) => c.id === currentQuestion.correctAnswerId)!,
      playerAnswer: playerChoice,
      isCorrect: playerChoice ? playerChoice.id === currentQuestion.correctAnswerId : false,
      statistics,
      totalPlayers: leaderboard.length || 0,
      totalAnswered,
    };
  }, [currentQuestion, selectedAnswer, answerStats, leaderboard.length]);

  // Phase rendering
  if (!gameId) {
    return <div className="p-6 text-red-600">gameId が指定されていません。</div>;
  }

  if (!gameFlow) {
    return <div className="p-6">ゲーム状態を読み込み中...</div>;
  }

  switch (phaseParam) {
    case 'countdown':
      return (
        <PlayerCountdownScreen
          countdownTime={3}
          questionNumber={(gameFlow.current_question_index ?? questionIndexParam) + 1}
          totalQuestions={questions.length || totalQuestions}
          isMobile={isMobile}
        />
      );
    case 'question':
    case 'answering':
      return (
        <PlayerAnswerScreen
          question={currentQuestion}
          currentTime={currentTimeSeconds}
          questionNumber={gameFlow.current_question_index ?? questionIndexParam}
          totalQuestions={totalQuestions}
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
