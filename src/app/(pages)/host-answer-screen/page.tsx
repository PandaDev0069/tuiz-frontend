'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { HostAnswerScreen } from '@/components/game';
import { Question } from '@/types/game';

function HostAnswerScreenContent() {
  // Mock question data - will be replaced with real data
  const [currentQuestion] = useState<Question>({
    id: '1',
    text: '現在のネパールの首相は誰ですか？',
    image:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop&crop=face', // Test image
    timeLimit: 30,
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

  const [currentTime, setCurrentTime] = useState(currentQuestion.timeLimit);
  const [questionNumber] = useState(1);
  const totalQuestions = 10;

  // Mock player statistics
  const [totalPlayers] = useState(200);
  const [answeredCount, setAnsweredCount] = useState(0);

  // Timer countdown for answering phase
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev <= 1) {
          // Answer time's up - move to answer reveal
          console.log('Answer time up! Move to answer reveal phase...');
          return currentQuestion.timeLimit;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestion.timeLimit]);

  // Simulate answers coming in during answering phase
  useEffect(() => {
    const answerSimulation = setInterval(() => {
      setAnsweredCount((prev) => {
        const newCount = Math.min(prev + Math.floor(Math.random() * 5) + 1, totalPlayers);
        return newCount;
      });
    }, 2000);

    return () => clearInterval(answerSimulation);
  }, [totalPlayers]);

  return (
    <HostAnswerScreen
      question={currentQuestion}
      currentTime={currentTime}
      questionNumber={questionNumber}
      totalQuestions={totalQuestions}
      totalPlayers={totalPlayers}
      answeredCount={answeredCount}
    />
  );
}

export default function HostAnswerScreenPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HostAnswerScreenContent />
    </Suspense>
  );
}
