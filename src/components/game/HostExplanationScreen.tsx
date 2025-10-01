'use client';

import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';
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
  const { questionNumber, totalQuestions, timeLimit, title, body, image } = explanation;
  const [currentTime, setCurrentTime] = useState(timeLimit);
  const [isIntroVisible, setIsIntroVisible] = useState(false);
  const [isTimeExpired, setIsTimeExpired] = useState(false);
  const hasTriggeredTimeout = useRef(false);

  // Reset state when data changes
  useEffect(() => {
    setCurrentTime(timeLimit);
    setIsIntroVisible(false);
    setIsTimeExpired(false);
    hasTriggeredTimeout.current = false;
  }, [timeLimit, questionNumber]);

  useEffect(() => {
    const introTimer = setTimeout(() => {
      setIsIntroVisible(true);
    }, 200);

    return () => clearTimeout(introTimer);
  }, [questionNumber]);

  // Internal timer countdown
  useEffect(() => {
    if (timeLimit <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev <= 1) {
          if (!hasTriggeredTimeout.current) {
            hasTriggeredTimeout.current = true;
            setIsTimeExpired(true);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLimit]);

  // Handle timeout navigation in separate effect
  useEffect(() => {
    if (isTimeExpired) {
      // Use setTimeout to ensure navigation happens after current render cycle
      const timeoutId = setTimeout(() => {
        onTimeExpired?.();
      }, 0);

      return () => clearTimeout(timeoutId);
    }
  }, [isTimeExpired, onTimeExpired]);
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
              className={`mt-6 transition-all duration-700 delay-100 transform ${
                isIntroVisible
                  ? 'opacity-100 translate-y-0 scale-100'
                  : 'opacity-0 translate-y-4 scale-95'
              }`}
            >
              <div className="relative">
                <span className="text-5xl md:text-8xl font-mono font-black bg-gradient-to-r from-cyan-700 via-blue-600 to-cyan-700 bg-clip-text text-transparent tracking-wider drop-shadow-sm">
                  解説
                </span>
              </div>
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
                  <p className="text-2xl md:text-xl lg:text-2xl leading-relaxed text-white/90 whitespace-pre-wrap">
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
