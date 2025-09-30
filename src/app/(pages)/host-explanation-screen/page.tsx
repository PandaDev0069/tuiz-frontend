'use client';

import React, { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { HostExplanationScreen } from '@/components/game';
import { ExplanationData } from '@/types/game';

function HostExplanationScreenContent() {
  const router = useRouter();
  const explanation: ExplanationData = {
    questionNumber: 2,
    totalQuestions: 30,
    timeLimit: 10,
    title: '木星の大赤斑はどのようにして形成されたのか？',
    subtitle: '惑星科学のトリビア',
    body: `木星の大赤斑は、300年以上観測され続けている巨大な高気圧性嵐です。この嵐は地球全体がすっぽり入るほどの大きさで、木星の高速な自転と厚い大気によってエネルギーが供給されています。周囲のジェット気流が大赤斑の渦を強化し、長期間消えない理由の一つと考えられています。

最新の観測でも大赤斑は徐々に縮小しているものの、依然として木星の象徴的な気象現象として知られています。`,
    image:
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80',
  };

  const handleTimeExpired = () => {
    console.log('time up for explanation screen');
    // Todo: Add redirect later
    router.push('/host-podium-screen');
  };

  return <HostExplanationScreen explanation={explanation} onTimeExpired={handleTimeExpired} />;
}

export default function HostExplanationScreenPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HostExplanationScreenContent />
    </Suspense>
  );
}
