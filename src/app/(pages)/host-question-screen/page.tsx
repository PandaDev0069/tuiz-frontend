'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { HostQuestionScreen } from '@/components/game';

function HostQuestionScreenContent() {
  // Mock question data - will be replaced with real data
  const [currentQuestion] = useState({
    id: '1',
    text: '現在のネパールの首相は誰ですか？',
    image:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop&crop=face', // Test image
    timeLimit: 30,
  });

  const [currentTime, setCurrentTime] = useState(currentQuestion.timeLimit);
  const [questionNumber] = useState(1);
  const totalQuestions = 10;

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev <= 1) {
          // Time's up - move to next question or end
          console.log('Time up! Moving to next question...');
          return currentQuestion.timeLimit;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestion.timeLimit]);

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
