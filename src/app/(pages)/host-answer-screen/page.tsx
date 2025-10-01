'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { HostAnswerScreen } from '@/components/game';
import { Question } from '@/types/game';

function HostAnswerScreenContent() {
  const router = useRouter();

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

  const [currentTime, setCurrentTime] = useState(currentQuestion.timeLimit);
  const [questionNumber] = useState(1);
  const totalQuestions = 10;

  // Mock player statistics
  const [totalPlayers] = useState(200);
  const [answeredCount, setAnsweredCount] = useState(0);

  // Track if we already navigated to avoid duplicate pushes
  const hasNavigatedRef = useRef(false);

  // Timer countdown for answering phase
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime((previousTime) => {
        if (previousTime <= 1) {
          return 0;
        }
        return previousTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestion.timeLimit]);

  // Navigate when time hits zero (side-effect outside of state updater)
  useEffect(() => {
    if (currentTime === 0 && !hasNavigatedRef.current) {
      hasNavigatedRef.current = true;
      console.log('Answer time up! Auto-navigating to host answer reveal screen...');
      router.push('/host-answer-reveal-screen');
    }
  }, [currentTime, router]);

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
