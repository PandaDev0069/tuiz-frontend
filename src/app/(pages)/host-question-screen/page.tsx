'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { HostQuestionScreen, HostAnswerScreen, HostAnswerRevealScreen } from '@/components/game';
import { Question, AnswerResult } from '@/types/game';

type GamePhase = 'question' | 'answering' | 'answer_reveal';

function HostQuestionScreenContent() {
  // Mock question data - will be replaced with real data
  const [currentQuestion] = useState<Question>({
    id: '1',
    text: '現在のネパールの首相は誰ですか？',
    image:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop&crop=face', // Test image
    timeLimit: 10,
    choices: [
      { id: 'a', text: 'プラチャンダ', letter: 'A' },
      { id: 'b', text: 'シェル・バハドゥル・デウバ', letter: 'B' },
      { id: 'c', text: 'K・P・シャルマ・オリ', letter: 'C' },
      { id: 'd', text: 'マーデハブ・クマール・ネパール', letter: 'D' },
    ],
    correctAnswerId: 'c',
    explanation: 'K・P・シャルマ・オリが現在のネパールの首相です。',
    type: 'multiple_choice_4',
  });

  // Game state
  const [currentPhase, setCurrentPhase] = useState<GamePhase>('question');
  const [currentTime, setCurrentTime] = useState(currentQuestion.timeLimit);
  const [questionNumber] = useState(1);
  const totalQuestions = 10;

  // Answer time limit for answering phase
  const answerTimeLimit = 100;
  const [answerTime, setAnswerTime] = useState(answerTimeLimit);

  // Mock player statistics
  const [totalPlayers] = useState(200);
  const [answeredCount, setAnsweredCount] = useState(0);

  // Timer countdown for question phase
  useEffect(() => {
    if (currentPhase === 'question') {
      const timer = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev <= 1) {
            // Question time's up - move to answering phase
            console.log('Question time up! Moving to answering phase...');
            setCurrentPhase('answering');
            setAnswerTime(answerTimeLimit);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [currentPhase, currentQuestion.timeLimit]);

  // Timer countdown for answering phase
  useEffect(() => {
    if (currentPhase === 'answering') {
      const timer = setInterval(() => {
        setAnswerTime((prev) => {
          if (prev <= 1) {
            // Answer time's up - move to answer reveal
            console.log('Answer time up! Moving to answer reveal phase...');
            setCurrentPhase('answer_reveal');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [currentPhase]);

  // Simulate answers coming in during answering phase
  useEffect(() => {
    if (currentPhase === 'answering') {
      const answerSimulation = setInterval(() => {
        setAnsweredCount((prev) => {
          const newCount = Math.min(prev + Math.floor(Math.random() * 5) + 1, totalPlayers);
          return newCount;
        });
      }, 2000);

      return () => clearInterval(answerSimulation);
    }
  }, [currentPhase, totalPlayers]);

  // Mock answer result for reveal phase
  const mockAnswerResult: AnswerResult = {
    question: currentQuestion,
    correctAnswer: currentQuestion.choices.find((c) => c.id === currentQuestion.correctAnswerId)!,
    playerAnswer: undefined, // Host doesn't answer
    isCorrect: false, // Not applicable for host
    statistics: [
      { choiceId: 'a', count: 25, percentage: 12.5 },
      { choiceId: 'b', count: 60, percentage: 30.0 },
      { choiceId: 'c', count: 90, percentage: 45.0 },
      { choiceId: 'd', count: 25, percentage: 12.5 },
    ],
    totalPlayers: totalPlayers,
    totalAnswered: answeredCount,
  };

  // Render based on current phase
  switch (currentPhase) {
    case 'question':
      return (
        <HostQuestionScreen
          question={currentQuestion}
          currentTime={currentTime}
          questionNumber={questionNumber}
          totalQuestions={totalQuestions}
        />
      );

    case 'answering':
      return (
        <HostAnswerScreen
          question={currentQuestion}
          currentTime={answerTime}
          questionNumber={questionNumber}
          totalQuestions={totalQuestions}
          totalPlayers={totalPlayers}
          answeredCount={answeredCount}
        />
      );

    case 'answer_reveal':
      return <HostAnswerRevealScreen answerResult={mockAnswerResult} />;

    default:
      return null;
  }
}

export default function HostQuestionScreenPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HostQuestionScreenContent />
    </Suspense>
  );
}
