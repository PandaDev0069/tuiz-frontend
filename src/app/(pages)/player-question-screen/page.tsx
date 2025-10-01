'use client';

import React, { useState, useEffect, Suspense } from 'react';
import {
  PlayerQuestionScreen,
  PlayerAnswerScreen,
  PlayerAnswerRevealScreen,
} from '@/components/game';
import { Question, AnswerResult } from '@/types/game';

type GamePhase = 'question' | 'answering' | 'answer_reveal';

function PlayerQuestionScreenContent() {
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
  const [selectedAnswer, setSelectedAnswer] = useState<string | undefined>();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const totalQuestions = 10;

  // Answer time limit for answering phase
  const answerTimeLimit = 10;
  const [answerTime, setAnswerTime] = useState(answerTimeLimit);

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
            // Answer time's up - auto-submit and move to reveal
            if (selectedAnswer && !isSubmitted) {
              setIsSubmitted(true);
              console.log('Time up! Auto-submitting:', selectedAnswer);
            }
            console.log('Moving to answer reveal phase...');
            setCurrentPhase('answer_reveal');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [currentPhase, selectedAnswer, isSubmitted]);

  // Answer selection handler
  const handleAnswerSelect = (answerId: string) => {
    setSelectedAnswer(answerId);
    console.log('Answer selected:', answerId);
  };

  // Answer submission handler
  const handleAnswerSubmit = () => {
    if (selectedAnswer && !isSubmitted) {
      setIsSubmitted(true);
      console.log('Answer submitted:', selectedAnswer);

      // Move to answer reveal after a short delay
      setTimeout(() => {
        console.log('Moving to answer reveal phase...');
        setCurrentPhase('answer_reveal');
      }, 1500);
    }
  };

  // Mock answer result for reveal phase
  const mockAnswerResult: AnswerResult = {
    question: currentQuestion,
    correctAnswer: currentQuestion.choices.find((c) => c.id === currentQuestion.correctAnswerId)!,
    playerAnswer: selectedAnswer
      ? currentQuestion.choices.find((c) => c.id === selectedAnswer)
      : undefined,
    isCorrect: selectedAnswer === currentQuestion.correctAnswerId,
    statistics: [
      { choiceId: 'a', count: 25, percentage: 12.5 },
      { choiceId: 'b', count: 60, percentage: 30.0 },
      { choiceId: 'c', count: 90, percentage: 45.0 },
      { choiceId: 'd', count: 25, percentage: 12.5 },
    ],
    totalPlayers: 200,
    totalAnswered: 200,
  };

  // Detect if mobile device
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Render based on current phase
  switch (currentPhase) {
    case 'question':
      return (
        <PlayerQuestionScreen
          question={currentQuestion}
          currentTime={currentTime}
          questionNumber={questionNumber}
          totalQuestions={totalQuestions}
          isMobile={isMobile}
        />
      );

    case 'answering':
      return (
        <PlayerAnswerScreen
          question={currentQuestion}
          currentTime={answerTime}
          questionNumber={questionNumber}
          totalQuestions={totalQuestions}
          onAnswerSelect={handleAnswerSelect}
          onAnswerSubmit={handleAnswerSubmit}
          isMobile={isMobile}
          isSubmitted={isSubmitted}
        />
      );

    case 'answer_reveal':
      return <PlayerAnswerRevealScreen answerResult={mockAnswerResult} />;

    default:
      return null;
  }
}

export default function PlayerQuestionScreenPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PlayerQuestionScreenContent />
    </Suspense>
  );
}
