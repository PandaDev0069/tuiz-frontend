// ====================================================
// File Name   : PlayerExplanationScreen.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-27
// Last Update : 2025-10-01
//
// Description:
// - Displays the explanation screen for players after answering a question
// - Shows question explanation with title, body text, and optional image
// - Implements countdown timer that triggers callback when expired
// - Displays question counter and time bar
//
// Notes:
// - Client-only component (requires 'use client')
// - Uses internal timer for countdown synchronization
// - Handles timeout navigation separately to avoid race conditions
// ====================================================

'use client';

import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';

import { PageContainer, Main, QuizBackground } from '@/components/ui';
import { TimeBar } from './TimeBar';

import type { ExplanationData } from '@/types/game';

const TIMER_INTERVAL_MS = 1000;
const NAVIGATION_DELAY_MS = 0;
const TIME_EXPIRED_THRESHOLD = 1;

interface PlayerExplanationScreenProps {
  explanation: ExplanationData;
  onTimeExpired?: () => void;
}

/**
 * Component: PlayerExplanationScreen
 * Description:
 * - Renders the explanation screen for players after answering a question
 * - Displays explanation title, body text, and optional image
 * - Shows countdown timer and question counter
 * - Automatically triggers callback when time expires
 *
 * @param {ExplanationData} explanation - Explanation data including question number, time limit, title, body, and optional image
 * @param {() => void} [onTimeExpired] - Callback invoked when the explanation time limit expires
 * @returns {React.ReactElement} The explanation screen component
 *
 * @example
 * ```tsx
 * <PlayerExplanationScreen
 *   explanation={{
 *     questionNumber: 1,
 *     totalQuestions: 10,
 *     timeLimit: 30,
 *     title: "Explanation Title",
 *     body: "Explanation body text...",
 *     image: "/path/to/image.jpg"
 *   }}
 *   onTimeExpired={() => console.log('Time expired')}
 * />
 * ```
 */
export const PlayerExplanationScreen: React.FC<PlayerExplanationScreenProps> = ({
  explanation,
  onTimeExpired,
}) => {
  const { questionNumber, totalQuestions, timeLimit, title, body, image } = explanation;
  const [currentTime, setCurrentTime] = useState(timeLimit);
  const [isTimeExpired, setIsTimeExpired] = useState(false);
  const timeoutTriggered = useRef(false);

  useEffect(() => {
    timeoutTriggered.current = false;
    setCurrentTime(timeLimit);
    setIsTimeExpired(false);
  }, [timeLimit, questionNumber]);

  useEffect(() => {
    if (!timeLimit || timeLimit <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev <= TIME_EXPIRED_THRESHOLD) {
          if (!timeoutTriggered.current) {
            timeoutTriggered.current = true;
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
          className="scale-y-90"
        />

        <div className="absolute inset-0">
          <QuizBackground variant="question" animated={false} />
        </div>

        <div className="relative z-10 flex h-full flex-col pt-20 pb-8">
          <div className="px-5 text-center">
            <h1 className="mt-3 text-3xl font-bold tracking-[0.2em] text-white">解説</h1>
            <h2 className="mt-2 text-xl font-semibold leading-snug text-white/90">{title}</h2>
          </div>

          <div className="mt-6 flex-1 px-5">
            <div className="mx-auto flex h-full max-w-md flex-col gap-4">
              {image && (
                <div className="relative h-48 w-full overflow-hidden rounded-2xl border border-white/15 shadow-lg">
                  <Image
                    src={image}
                    alt="解説"
                    width={800}
                    height={400}
                    className="object-contain w-full h-full"
                    sizes="100vw"
                  />
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
