'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { PlayerQuestionScreen } from '@/components/game';

function PlayerQuestionScreenContent() {
  // Mock question data - will be replaced with real data
  const [currentQuestion] = useState({
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
  });

  const [currentTime, setCurrentTime] = useState(currentQuestion.timeLimit);
  const [questionNumber] = useState(1);
  const [selectedAnswer, setSelectedAnswer] = useState<string | undefined>();
  const totalQuestions = 10;

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev <= 1) {
          // Time's up - submit answer if not already submitted
          if (selectedAnswer) {
            console.log('Submitting answer:', selectedAnswer);
          }
          return currentQuestion.timeLimit;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestion.timeLimit, selectedAnswer]);

  const handleAnswerSelect = (answerId: string) => {
    setSelectedAnswer(answerId);
    console.log('Answer selected:', answerId);
    // TODO: Submit answer to backend
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

  return (
    <PlayerQuestionScreen
      question={currentQuestion}
      currentTime={currentTime}
      questionNumber={questionNumber}
      totalQuestions={totalQuestions}
      selectedAnswer={selectedAnswer}
      onAnswerSelect={handleAnswerSelect}
      isMobile={isMobile}
    />
  );
}

export default function PlayerQuestionScreenPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PlayerQuestionScreenContent />
    </Suspense>
  );
}
