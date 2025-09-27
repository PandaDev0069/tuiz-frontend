'use client';

import React, { useState, Suspense } from 'react';
import { PlayerAnswerRevealScreen } from '@/components/game';
import { AnswerResult } from '@/types/game';

function PlayerAnswerRevealScreenContent() {
  // Mock answer result data for testing
  const [answerResult] = useState<AnswerResult>({
    question: {
      id: '1',
      text: '現在のネパールの首相は誰ですか？',
      image:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop&crop=face',
      timeLimit: 30,
      choices: [
        { id: 'a', text: 'プラチャンダ', letter: 'A' },
        { id: 'b', text: 'シェル・バハドゥル・デウバ', letter: 'B' },
        { id: 'c', text: 'K・P・シャルマ・オリ', letter: 'C' },
        { id: 'd', text: 'マーデハブ・クマール・ネパール', letter: 'D' },
      ],
      correctAnswerId: 'c',
      explanation: 'K・P・シャルマ・オリが現在のネパールの首相です。',
      type: 'multiple_choice_4', // Test different types
    },
    correctAnswer: { id: 'c', text: 'K・P・シャルマ・オリ', letter: 'C' },
    playerAnswer: { id: 'b', text: 'シェル・バハドゥル・デウバ', letter: 'B' }, // Wrong answer for testing
    isCorrect: false,
    statistics: [
      { choiceId: 'a', count: 25, percentage: 12.5 },
      { choiceId: 'b', count: 60, percentage: 30.0 },
      { choiceId: 'c', count: 90, percentage: 45.0 },
      { choiceId: 'd', count: 25, percentage: 12.5 },
    ],
    totalPlayers: 200,
    totalAnswered: 200,
  });

  return <PlayerAnswerRevealScreen answerResult={answerResult} />;
}

export default function PlayerAnswerRevealScreenPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PlayerAnswerRevealScreenContent />
    </Suspense>
  );
}
