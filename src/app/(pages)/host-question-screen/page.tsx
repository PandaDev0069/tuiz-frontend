'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { HostQuestionScreen } from '@/components/game';
import { Question } from '@/types/game';

function HostQuestionScreenContent() {
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

  // Timer countdown for question phase
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev <= 1) {
          // Time's up - auto-navigate to answering phase
          console.log('Question time up! Auto-navigating to host answer screen...');
          router.push('/host-answer-screen');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestion.timeLimit, router]);

  return (
    <HostQuestionScreen
      question={currentQuestion}
      currentTime={currentTime}
      questionNumber={questionNumber}
      totalQuestions={totalQuestions}
    />
  );
}

export default function HostQuestionScreenPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HostQuestionScreenContent />
    </Suspense>
  );
}
