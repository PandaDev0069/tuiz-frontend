'use client';

import React, { useState, Suspense } from 'react';
import { HostAnswerRevealScreen } from '@/components/game';
import { Question, AnswerResult } from '@/types/game';

function HostAnswerRevealScreenContent() {
  // Mock question data - will be replaced with real data
  const [currentQuestion] = useState<Question>({
    id: '1',
    text: '現在のネパールの首相は誰ですか？',
    image:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop&crop=face', // Test image
    timeLimit: 30,
    show_question_time: 10,
    answering_time: 30,
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

  // Mock game state
  const [questionNumber] = useState(2);
  const [totalQuestions] = useState(30);

  // Mock player statistics
  const [totalPlayers] = useState(200);
  const [answeredCount] = useState(195);

  /**
   * Implementation pending: Navigation logic when timer expires
   * Component currently manages its own timer internally
   * Future: Navigate to next question or leaderboard screen based on game state
   */

  // Mock answer result for reveal phase
  const mockAnswerResult: AnswerResult = {
    question: currentQuestion,
    correctAnswer: currentQuestion.choices.find((c) => c.id === currentQuestion.correctAnswerId)!,
    playerAnswer: undefined, // Host doesn't answer
    isCorrect: false, // Not applicable for host
    statistics: [
      { choiceId: 'a', count: 25, percentage: 12.8 },
      { choiceId: 'b', count: 60, percentage: 30.8 },
      { choiceId: 'c', count: 85, percentage: 43.6 },
      { choiceId: 'd', count: 25, percentage: 12.8 },
    ],
    totalPlayers: totalPlayers,
    totalAnswered: answeredCount,
  };

  return (
    <HostAnswerRevealScreen
      answerResult={mockAnswerResult}
      timeLimit={5}
      questionNumber={questionNumber}
      totalQuestions={totalQuestions}
    />
  );
}

export default function HostAnswerRevealScreenPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HostAnswerRevealScreenContent />
    </Suspense>
  );
}
