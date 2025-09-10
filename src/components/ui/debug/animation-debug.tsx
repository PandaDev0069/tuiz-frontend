'use client';

import * as React from 'react';
import { useAnimation } from '@/app/AnimationController';

export function AnimationDebug() {
  const { latencyMs, duration, easing, scale } = useAnimation();

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed bottom-4 left-4 bg-black/80 text-white p-2 text-xs rounded font-mono z-[9999]">
      <div>Latency: {latencyMs}ms</div>
      <div>Duration: {duration}ms</div>
      <div>Scale: {scale}</div>
      <div>Easing: {easing}</div>
    </div>
  );
}
