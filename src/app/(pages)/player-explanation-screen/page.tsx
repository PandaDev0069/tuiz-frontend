'use client';

import React, { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { PlayerExplanationScreen } from '@/components/game';
import { ExplanationData } from '@/types/game';

function PlayerExplanationScreenContent() {
  const router = useRouter();
  const explanation: ExplanationData = {
    questionNumber: 2,
    totalQuestions: 30,
    timeLimit: 12,
    title: '木星の大赤斑が示す気象現象とは？',
    body: `木星の大赤斑は300年以上消えずに続いている巨大な高気圧性嵐です。高速な自転と厚い大気がエネルギーを補給し続けているため、その規模を保っています。

観測によると、嵐はゆっくりと縮小しているものの、依然として地球をすっぽり覆うほどのサイズを維持しています。風速は秒間数百メートルに達し、木星の気候変化を理解する手がかりとされています。

惑星科学者たちは、大赤斑を詳細に調べることで、ガス惑星の大気構造やエネルギー循環の仕組みを解明しようとしています。`,
    image:
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80',
  };

  const handleTimeExpired = () => {
    console.log('Player explanation time expired');
    // Redirect to player podium screen for final results
    router.push('/player-podium-screen');
  };

  return <PlayerExplanationScreen explanation={explanation} onTimeExpired={handleTimeExpired} />;
}

export default function PlayerExplanationScreenPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PlayerExplanationScreenContent />
    </Suspense>
  );
}
