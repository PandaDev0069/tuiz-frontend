'use client';

import Image from 'next/image';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { PageContainer, Main, QuizBackground } from '@/components/ui';
import { TimeBar } from './TimeBar';
import { ExplanationData } from '@/types/game';

interface HostExplanationScreenProps {
  explanation: ExplanationData;
  onTimeExpired?: () => void;
}

export const HostExplanationScreen: React.FC<HostExplanationScreenProps> = ({
  explanation,
  onTimeExpired,
}) => {
  const { questionNumber, totalQuestions, timeLimit, title, body, image, subtitle } = explanation;
  const [currentTime, setCurrentTime] = useState(timeLimit);
  const [isIntroVisible, setIsIntroVisible] = useState(false);
  const hasTriggeredTimeout = useRef(false);

  useEffect(() => {
    setCurrentTime(timeLimit);
    setIsIntroVisible(false);
  }, [timeLimit, questionNumber]);

  useEffect(() => {
    const introTimer = setTimeout(() => {
      setIsIntroVisible(true);
    }, 200);

    return () => clearTimeout(introTimer);
  }, [questionNumber]);

  useEffect(() => {
    if (timeLimit <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev <= 1) {
          if (!hasTriggeredTimeout.current) {
            hasTriggeredTimeout.current = true;
            onTimeExpired?.();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLimit, onTimeExpired]);

  useEffect(() => {
    hasTriggeredTimeout.current = false;
  }, [onTimeExpired, questionNumber]);

  const formattedProgressLabel = useMemo(() => {
    return `${questionNumber} / ${totalQuestions}問`;
  }, [questionNumber, totalQuestions]);

  return (
    <PageContainer className="h-screen">
      <Main className="h-full relative">
        <TimeBar
          currentTime={currentTime}
          timeLimit={timeLimit}
          questionNumber={questionNumber}
          totalQuestions={totalQuestions}
        />

        <div className="absolute inset-0">
          <QuizBackground variant="question" animated={false} />
        </div>

        <div className="relative z-10 h-full flex flex-col pt-16 pb-10 px-6">
          <div className="text-center mb-8">
            <div
              className={`inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-white/80 text-sm md:text-base transition-all duration-700 ${
                isIntroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
              }`}
            >
              <span className="font-semibold tracking-wide">{formattedProgressLabel}</span>
              <span className="w-1 h-1 rounded-full bg-white/70" />
              <span className="font-semibold">残り {Math.max(0, Math.ceil(currentTime))} 秒</span>
            </div>

            <div
              className={`mt-6 transition-all duration-700 delay-100 transform ${
                isIntroVisible
                  ? 'opacity-100 translate-y-0 scale-100'
                  : 'opacity-0 translate-y-4 scale-95'
              }`}
            >
              <div className="text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-[0.25em] drop-shadow-xl">
                解説
              </div>
              {subtitle && (
                <p className="mt-3 text-lg md:text-xl text-white/80 tracking-wide">{subtitle}</p>
              )}
            </div>

            <h2
              className={`mt-6 md:mt-8 text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight drop-shadow-2xl transition-opacity duration-700 delay-200 ${
                isIntroVisible ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {title}
            </h2>
          </div>

          <div className="flex-1 w-full flex flex-col items-center">
            <div className="w-full max-w-5xl space-y-8">
              {image && (
                <div
                  className={`relative w-full h-64 md:h-72 lg:h-80 rounded-3xl overflow-hidden border border-white/20 shadow-2xl transition-all duration-700 delay-150 ${
                    isIntroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                  }`}
                >
                  <Image src={image} alt="解説イメージ" fill className="object-cover" priority />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                  <div className="absolute bottom-4 left-4 bg-black/30 px-4 py-2 rounded-full text-sm text-white/90 backdrop-blur-sm">
                    ビジュアル解説
                  </div>
                </div>
              )}

              <div
                className={`relative bg-white/10 border border-white/15 backdrop-blur-xl rounded-3xl shadow-2xl p-6 md:p-8 lg:p-10 transition-all duration-700 delay-200 ${
                  isIntroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
              >
                <div className="absolute -top-4 -left-4 w-10 h-10 bg-gradient-to-br from-[#BFF098] to-[#6FD6FF] rounded-2xl blur-xl opacity-70" />
                <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-white/10 rounded-full blur-3xl" />

                <div className="max-h-[40vh] min-h-[200px] overflow-y-auto pr-2 md:pr-4 scrollbar-thin scrollbar-thumb-white/40 scrollbar-track-transparent">
                  <p className="text-lg md:text-xl lg:text-2xl leading-relaxed text-white/90 whitespace-pre-wrap">
                    {body}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Main>
    </PageContainer>
  );
};
