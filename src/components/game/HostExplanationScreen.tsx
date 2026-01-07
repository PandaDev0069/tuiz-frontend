// ====================================================
// File Name   : HostExplanationScreen.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-27
// Last Update : 2025-12-12
//
// Description:
// - Host screen component for displaying question explanations
// - Shows explanation title, body text, and optional image
// - Manages timer countdown and automatic navigation
// - Includes fade-in animations for content
//
// Notes:
// - Uses staggered animation delays for visual effect
// - Supports manual navigation via next button
// ====================================================

'use client';

//----------------------------------------------------
// 1. Imports / Dependencies
//----------------------------------------------------
import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';

import { PageContainer, Main, QuizBackground } from '@/components/ui';
import { TimeBar } from './TimeBar';
import type { ExplanationData } from '@/types/game';

//----------------------------------------------------
// 2. Constants / Configuration
//----------------------------------------------------
const INTRO_ANIMATION_DELAY_MS = 200;
const TIMER_INTERVAL_MS = 1000;
const NAVIGATION_DELAY_MS = 0;
const MIN_TIME_LIMIT = 0;
const TIME_EXPIRED_THRESHOLD = 1;

const TEXT_EXPLANATION = '解説';
const IMAGE_ALT_TEXT = '解説イメージ';
const TEXT_NEXT = '次へ';

//----------------------------------------------------
// 3. Types / Interfaces
//----------------------------------------------------
export interface HostExplanationScreenProps {
  explanation: ExplanationData;
  onTimeExpired?: () => void;
  onNext?: () => void;
}

//----------------------------------------------------
// 4. Core Logic
//----------------------------------------------------
/**
 * Component: HostExplanationScreen
 * Description:
 * - Displays explanation screen for host with animated content
 * - Shows explanation title, body text, and optional image
 * - Manages timer countdown and automatic navigation
 * - Includes fade-in animations with staggered delays
 *
 * Parameters:
 * - explanation (ExplanationData): Explanation data with title, body, image, and timing
 * - onTimeExpired (function, optional): Callback when timer expires
 * - onNext (function, optional): Callback for manual next action
 *
 * Returns:
 * - JSX.Element: Host explanation screen component
 */
export const HostExplanationScreen: React.FC<HostExplanationScreenProps> = ({
  explanation,
  onTimeExpired,
  onNext,
}) => {
  const { questionNumber, totalQuestions, timeLimit, title, body, image } = explanation;
  const [currentTime, setCurrentTime] = useState(timeLimit);
  const [isIntroVisible, setIsIntroVisible] = useState(false);
  const [isTimeExpired, setIsTimeExpired] = useState(false);
  const hasTriggeredTimeout = useRef(false);

  useEffect(() => {
    setCurrentTime(timeLimit);
    setIsIntroVisible(false);
    setIsTimeExpired(false);
    hasTriggeredTimeout.current = false;
  }, [timeLimit, questionNumber]);

  useEffect(() => {
    const introTimer = setTimeout(() => {
      setIsIntroVisible(true);
    }, INTRO_ANIMATION_DELAY_MS);

    return () => clearTimeout(introTimer);
  }, [questionNumber]);

  useEffect(() => {
    if (timeLimit <= MIN_TIME_LIMIT) {
      return;
    }

    const timer = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev <= TIME_EXPIRED_THRESHOLD) {
          if (!hasTriggeredTimeout.current) {
            hasTriggeredTimeout.current = true;
            setIsTimeExpired(true);
          }
          return 0;
        }
        return prev - 1;
      });
    }, TIMER_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [timeLimit]);

  useEffect(() => {
    if (isTimeExpired) {
      const timeoutId = setTimeout(() => {
        onTimeExpired?.();
      }, NAVIGATION_DELAY_MS);

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
                  {TEXT_EXPLANATION}
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
                  <Image src={image} alt={IMAGE_ALT_TEXT} className="object-cover" priority />
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

          {onNext && (
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
              <button
                onClick={onNext}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                {TEXT_NEXT}
              </button>
            </div>
          )}
        </div>
      </Main>
    </PageContainer>
  );
};

//----------------------------------------------------
// 5. Helper Functions
//----------------------------------------------------

//----------------------------------------------------
// 6. Export
//----------------------------------------------------
