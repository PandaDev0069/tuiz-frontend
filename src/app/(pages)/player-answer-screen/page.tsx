'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { PlayerAnswerScreen } from '@/components/game';
import { Question } from '@/types/game';

function PlayerAnswerScreenContent() {
  // Mock question data with different types for testing
  const [currentQuestion] = useState<Question>({
    id: '1',
    text: '現在のネパールの首相は誰ですか？',
    image:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop&crop=face',
    timeLimit: 10,
    show_question_time: 10,
    answering_time: 10,
    choices: [
      { id: 'a', text: 'プラチャンダ', letter: 'A' },
      { id: 'b', text: 'シェル・バハドゥル・デウバ', letter: 'B' },
      { id: 'c', text: 'K・P・シャルマ・オリ', letter: 'C' },
      { id: 'd', text: 'マーデハブ・クマール・ネパール', letter: 'D' },
    ],
    correctAnswerId: 'c',
    explanation: 'K・P・シャルマ・オリが現在のネパールの首相です。',
    type: 'multiple_choice_4', // Test different types: multiple_choice_2, multiple_choice_3, multiple_choice_4, true_false
  });

  const [currentTime, setCurrentTime] = useState(currentQuestion.timeLimit);
  const [questionNumber] = useState(1);
  const [selectedAnswer, setSelectedAnswer] = useState<string | undefined>();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const totalQuestions = 10;

  const handleAnswerSelect = (answerId: string) => {
    setSelectedAnswer(answerId);
    console.log('Answer selected:', answerId);
  };

  const handleAnswerSubmit = () => {
    if (selectedAnswer && !isSubmitted) {
      setIsSubmitted(true);
      console.log('Answer submitted:', selectedAnswer);

      // Simulate moving to answer reveal after 2 seconds
      setTimeout(() => {
        console.log('Moving to answer reveal screen...');
        // Here you would normally navigate to the answer reveal screen
      }, 2000);
    }
  };

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev <= 1) {
          // Time's up - auto-submit if answer is selected
          if (selectedAnswer && !isSubmitted) {
            setIsSubmitted(true);
            console.log('Time up! Auto-submitting:', selectedAnswer);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [selectedAnswer, isSubmitted]);

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
    <PlayerAnswerScreen
      question={currentQuestion}
      currentTime={currentTime}
      questionNumber={questionNumber}
      totalQuestions={totalQuestions}
      onAnswerSelect={handleAnswerSelect}
      onAnswerSubmit={handleAnswerSubmit}
      isMobile={isMobile}
      isSubmitted={isSubmitted}
    />
  );
}

export default function PlayerAnswerScreenPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PlayerAnswerScreenContent />
    </Suspense>
  );
}
