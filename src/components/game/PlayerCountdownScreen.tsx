// ====================================================
// File Name   : PlayerCountdownScreen.tsx
// Project     : TUIZ
// Author      : TUIZ Team
// Created     : 2025-09-21
// Last Update : 2025-12-26
//
// Description:
// - Displays a synchronized countdown screen for players before questions
// - Handles server-client time synchronization for accurate countdown timing
// - Shows preparation messages, countdown numbers, and progress visualization
// - Optimized for mobile performance with conditional animations
//
// Notes:
// - Uses server timestamp (startedAt) for synchronization across clients
// - Implements sync window to handle network latency
// - Client-only component (requires 'use client')
// ====================================================

'use client';

import React, { useEffect, useState } from 'react';

import { PageContainer, Main, QuizBackground } from '@/components/ui';

const SYNC_DURATION_MS = 2000;
const SYNC_UPDATE_INTERVAL_MS = 100;
const COUNTDOWN_INTERVAL_MS = 1000;
const ANIMATION_RESET_DELAY_MS = 200;
const COUNTDOWN_THRESHOLD = 3;
const PARTICLE_COUNT = 10;
const PARTICLE_ANIMATION_BASE_DURATION_S = 2;
const MILLISECONDS_PER_SECOND = 1000;

const DEFAULT_MESSAGE = '準備してください！';
const START_MESSAGE = 'スタート！';

interface PlayerCountdownScreenProps {
  countdownTime: number;
  onCountdownComplete?: () => void;
  message?: string;
  questionNumber?: number;
  totalQuestions?: number;
  isMobile?: boolean;
  startedAt?: number;
  waitingMessage?: string;
}

/**
 * Computes the remaining countdown time based on server timestamp.
 *
 * @param {number} [startTs] - Server timestamp when countdown started
 * @param {number} countdownTime - Total countdown duration in seconds
 * @returns {number} Remaining time in seconds
 */
function computeRemaining(startTs: number | undefined, countdownTime: number): number {
  if (!startTs) return countdownTime;
  const elapsedMs = Date.now() - startTs;
  const elapsedSec = Math.max(0, Math.floor(elapsedMs / MILLISECONDS_PER_SECOND));
  return Math.max(0, countdownTime - elapsedSec);
}

/**
 * Component: PlayerCountdownScreen
 * Description:
 * - Renders a synchronized countdown screen for players before questions begin
 * - Displays countdown timer with visual feedback and progress bar
 * - Handles server-client time synchronization for accurate timing
 * - Shows question counter and preparation messages
 *
 * @param {number} countdownTime - Total countdown duration in seconds
 * @param {() => void} [onCountdownComplete] - Callback invoked when countdown reaches zero
 * @param {string} [message] - Preparation message shown during countdown (default: '準備してください！')
 * @param {number} [questionNumber] - Current question number for display
 * @param {number} [totalQuestions] - Total number of questions for display
 * @param {boolean} [isMobile] - Whether the device is mobile (default: true)
 * @param {number} [startedAt] - Server timestamp when countdown started (for synchronization)
 * @param {string} [waitingMessage] - Message shown while waiting for startedAt to arrive
 * @returns {React.ReactElement} The countdown screen component
 *
 * @example
 * ```tsx
 * <PlayerCountdownScreen
 *   countdownTime={5}
 *   questionNumber={1}
 *   totalQuestions={10}
 *   startedAt={Date.now()}
 *   onCountdownComplete={() => console.log('Countdown complete')}
 * />
 * ```
 */
export const PlayerCountdownScreen: React.FC<PlayerCountdownScreenProps> = ({
  countdownTime,
  onCountdownComplete,
  message = DEFAULT_MESSAGE,
  waitingMessage = message,
  questionNumber,
  totalQuestions,
  isMobile = true,
  startedAt,
}) => {
  const [isSyncing, setIsSyncing] = useState(true);
  const [syncStartTime, setSyncStartTime] = useState(Date.now());
  const [currentTime, setCurrentTime] = useState(countdownTime);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const now = Date.now();
    const effectiveStart = startedAt && startedAt > now ? startedAt : now;
    setSyncStartTime(effectiveStart);
  }, [startedAt]);

  useEffect(() => {
    if (!startedAt) {
      setIsSyncing(true);
      setCurrentTime(countdownTime);
      return;
    }

    let intervalId: NodeJS.Timeout | null = null;
    let timeoutId: NodeJS.Timeout | null = null;

    const updateCountdown = () => {
      const remaining = computeRemaining(startedAt, countdownTime);
      setCurrentTime(remaining);
    };

    const checkSync = () => {
      const elapsed = Date.now() - syncStartTime;
      if (elapsed >= SYNC_DURATION_MS) {
        updateCountdown();
        setIsSyncing(false);
        if (intervalId) clearInterval(intervalId);
      } else {
        updateCountdown();
        const remainingMs = SYNC_DURATION_MS - elapsed;
        timeoutId = setTimeout(checkSync, Math.min(remainingMs, SYNC_UPDATE_INTERVAL_MS));
      }
    };

    updateCountdown();
    intervalId = setInterval(updateCountdown, SYNC_UPDATE_INTERVAL_MS);
    checkSync();

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [startedAt, syncStartTime, countdownTime]);

  useEffect(() => {
    if (isSyncing) return;
    if (currentTime <= 0) {
      onCountdownComplete?.();
      return;
    }

    const timer = setTimeout(() => {
      setCurrentTime((prev) => prev - 1);
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), ANIMATION_RESET_DELAY_MS);
    }, COUNTDOWN_INTERVAL_MS);

    return () => clearTimeout(timer);
  }, [currentTime, onCountdownComplete, isSyncing]);

  const getCountdownText = () => {
    if (isSyncing && startedAt) {
      if (currentTime > COUNTDOWN_THRESHOLD) return message;
      if (currentTime > 0) return currentTime.toString();
      return START_MESSAGE;
    }
    if (isSyncing) return waitingMessage;
    if (currentTime > COUNTDOWN_THRESHOLD) return message;
    if (currentTime > 0) return currentTime.toString();
    return START_MESSAGE;
  };

  const getCountdownSize = () => {
    if (isSyncing && startedAt) {
      if (isMobile) {
        if (currentTime > COUNTDOWN_THRESHOLD) return 'text-5xl sm:text-6xl';
        if (currentTime > 0) return 'text-7xl sm:text-8xl';
        return 'text-6xl sm:text-7xl';
      } else {
        if (currentTime > COUNTDOWN_THRESHOLD) return 'text-5xl md:text-6xl lg:text-7xl';
        if (currentTime > 0) return 'text-7xl md:text-8xl lg:text-9xl';
        return 'text-6xl md:text-7xl lg:text-8xl';
      }
    }
    if (isSyncing) {
      return isMobile ? 'text-5xl sm:text-6xl' : 'text-6xl md:text-7xl lg:text-8xl';
    }
    if (isMobile) {
      if (currentTime > COUNTDOWN_THRESHOLD) return 'text-5xl sm:text-6xl';
      if (currentTime > 0) return 'text-7xl sm:text-8xl';
      return 'text-6xl sm:text-7xl';
    } else {
      if (currentTime > COUNTDOWN_THRESHOLD) return 'text-5xl md:text-6xl lg:text-7xl';
      if (currentTime > 0) return 'text-7xl md:text-8xl lg:text-9xl';
      return 'text-6xl md:text-7xl lg:text-8xl';
    }
  };

  const getCountdownColor = () => {
    if (isSyncing && startedAt) {
      if (currentTime > COUNTDOWN_THRESHOLD) return 'text-white';
      if (currentTime > 0) return 'text-yellow-300';
      return 'text-green-300';
    }
    if (isSyncing) return 'text-white';
    if (currentTime > COUNTDOWN_THRESHOLD) return 'text-white';
    if (currentTime > 0) return 'text-yellow-300';
    return 'text-green-300';
  };

  return (
    <PageContainer className="h-screen">
      <Main className="h-full relative">
        <div className="absolute inset-0">
          <QuizBackground variant="question" animated={false} />
        </div>

        {questionNumber && totalQuestions && (
          <div className={`absolute z-20 ${isMobile ? 'top-4 left-4' : 'top-6 left-6'}`}>
            <div
              className={`bg-white/90 backdrop-blur-sm rounded-lg ${isMobile ? 'px-3 py-2' : 'px-4 py-2'}`}
            >
              <span className={`font-semibold text-gray-800 ${isMobile ? 'text-sm' : 'text-lg'}`}>
                問題 {questionNumber} / {totalQuestions}
              </span>
            </div>
          </div>
        )}

        <div className="relative z-10 h-full flex flex-col items-center justify-center px-4">
          <div
            className={`text-center w-full ${isMobile ? 'max-w-sm sm:max-w-md' : 'max-w-4xl lg:max-w-5xl xl:max-w-6xl'}`}
          >
            <div
              className={`${getCountdownSize()} ${getCountdownColor()} font-bold drop-shadow-2xl transition-all duration-300 ${
                isAnimating ? 'scale-110' : 'scale-100'
              }`}
            >
              {getCountdownText()}
            </div>
          </div>

          <div className={`mt-8 w-full mx-auto ${isMobile ? 'max-w-lg' : 'max-w-xl'}`}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/15 via-blue-400/15 to-purple-400/15 rounded-lg blur-sm scale-105"></div>

              <div
                className={`relative bg-white/10 rounded-lg w-full overflow-hidden border border-white/20 backdrop-blur-sm ${
                  isMobile ? 'h-3' : 'h-3.5'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 via-blue-400/10 to-purple-400/10 animate-pulse"></div>

                <div
                  className="relative h-full transition-all duration-1000 ease-linear"
                  style={{
                    width: isSyncing
                      ? '0%'
                      : `${((countdownTime - currentTime) / countdownTime) * 100}%`,
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400"></div>

                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent transform -skew-x-12 animate-pulse"></div>

                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent transform -skew-x-12 animate-pulse"></div>

                  <div
                    className={`absolute top-0 right-0 h-full bg-white/80 rounded-r-lg shadow-lg ${
                      isMobile ? 'w-1' : 'w-1.5'
                    }`}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {!isMobile && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(PARTICLE_COUNT)].map((_, i) => (
              <div
                key={i}
                className={`absolute w-1 h-1 bg-white/30 rounded-full animate-bounce ${
                  isAnimating ? 'animate-ping' : ''
                }`}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * PARTICLE_ANIMATION_BASE_DURATION_S}s`,
                  animationDuration: `${PARTICLE_ANIMATION_BASE_DURATION_S + Math.random() * PARTICLE_ANIMATION_BASE_DURATION_S}s`,
                }}
              />
            ))}
          </div>
        )}
      </Main>
    </PageContainer>
  );
};
