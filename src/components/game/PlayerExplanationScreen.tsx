'use client';

import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';
import { PageContainer, Main, QuizBackground } from '@/components/ui';
import { TimeBar } from './TimeBar';
import { ExplanationData } from '@/types/game';

interface PlayerExplanationScreenProps {
  explanation: ExplanationData;
  onTimeExpired?: () => void;
}

export const PlayerExplanationScreen: React.FC<PlayerExplanationScreenProps> = ({
  explanation,
  onTimeExpired,
}) => {
  const { questionNumber, totalQuestions, timeLimit, title, body, image } = explanation;
  const [currentTime, setCurrentTime] = useState(timeLimit);
  const timeoutTriggered = useRef(false);

  useEffect(() => {
    timeoutTriggered.current = false;
    setCurrentTime(timeLimit);
  }, [timeLimit, questionNumber]);

  useEffect(() => {
    if (!timeLimit || timeLimit <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev <= 1) {
          if (!timeoutTriggered.current) {
            timeoutTriggered.current = true;
            onTimeExpired?.();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onTimeExpired, timeLimit]);

  return (
    <PageContainer className="h-screen">
      <Main className="h-full relative">
        <TimeBar
          currentTime={currentTime}
          timeLimit={timeLimit}
          questionNumber={questionNumber}
          totalQuestions={totalQuestions}
          className="scale-y-90"
        />

        <div className="absolute inset-0">
          <QuizBackground variant="question" animated={false} />
        </div>

        <div className="relative z-10 flex h-full flex-col pt-20 pb-8">
          <div className="px-5 text-center">
            <p className="text-sm text-white/70">
              問題 {questionNumber} / {totalQuestions} ・ 残り {Math.max(0, Math.ceil(currentTime))}
              秒
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-[0.2em] text-white">解説</h1>
            <h2 className="mt-2 text-xl font-semibold leading-snug text-white/90">{title}</h2>
          </div>

          <div className="mt-6 flex-1 px-5">
            <div className="mx-auto flex h-full max-w-md flex-col gap-4">
              {image && (
                <div className="relative h-48 w-full overflow-hidden rounded-2xl border border-white/15 shadow-lg">
                  <Image src={image} alt="解説" fill className="object-cover" sizes="100vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                </div>
              )}

              <div className="flex-1 overflow-hidden rounded-2xl border border-white/15 bg-white/10 p-4 shadow-xl backdrop-blur-md">
                <div className="max-h-full overflow-y-auto pr-2 text-white/85 scrollbar-thin scrollbar-thumb-white/25 scrollbar-track-transparent">
                  <p className="whitespace-pre-wrap text-base leading-7">{body}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Main>
    </PageContainer>
  );
};
