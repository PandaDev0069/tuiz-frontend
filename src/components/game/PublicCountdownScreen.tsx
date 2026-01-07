// ====================================================
// File Name   : PublicCountdownScreen.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-21
// Last Update : 2025-12-26
//
// Description:
// - Displays a public countdown screen before a question starts
// - Optionally syncs countdown using a server-provided start timestamp
// - Shows a progress bar and simple animation effects
//
// Notes:
// - Client-only component (requires 'use client')
// - Sync behavior depends on `startedAt` (server timestamp in ms)
// ====================================================

'use client';

//----------------------------------------------------
// 1. Imports / Dependencies
//----------------------------------------------------
import React, { useEffect, useState } from 'react';

import { Main, PageContainer, QuizBackground } from '@/components/ui';

//----------------------------------------------------
// 2. Constants / Configuration
//----------------------------------------------------
const DEFAULT_MESSAGE = '準備してください！';
const DEFAULT_START_TEXT = 'スタート！';

const COUNTDOWN_NUMBER_THRESHOLD_SECONDS = 3;

const SYNC_DURATION_MS = 2000;
const SYNC_UPDATE_INTERVAL_MS = 100;

const COUNTDOWN_TICK_MS = 1000;
const ANIMATION_RESET_DELAY_MS = 200;

const PARTICLE_COUNT = 20;
const PARTICLE_SIZE_PX = 8;
const PARTICLE_OPACITY_CLASS = 'bg-white/30';
const PARTICLE_MIN_ANIMATION_DELAY_SECONDS = 0;
const PARTICLE_MAX_ANIMATION_DELAY_SECONDS = 2;
const PARTICLE_MIN_ANIMATION_DURATION_SECONDS = 2;
const PARTICLE_MAX_ANIMATION_DURATION_SECONDS = 4;

const PROGRESS_ZERO = '0%';

const COUNTDOWN_SIZE_MESSAGE = 'text-6xl md:text-7xl lg:text-8xl xl:text-9xl';
const COUNTDOWN_SIZE_NUMBER = 'text-8xl md:text-9xl lg:text-[12rem] xl:text-[16rem]';
const COUNTDOWN_SIZE_START = 'text-7xl md:text-8xl lg:text-9xl xl:text-[12rem]';

const COUNTDOWN_COLOR_MESSAGE = 'text-white';
const COUNTDOWN_COLOR_NUMBER = 'text-yellow-300';
const COUNTDOWN_COLOR_START = 'text-green-300';

//----------------------------------------------------
// 3. Types / Interfaces
//----------------------------------------------------
interface PublicCountdownScreenProps {
  countdownTime: number;
  onCountdownComplete?: () => void;
  message?: string;
  questionNumber?: number;
  totalQuestions?: number;
  startedAt?: number;
  waitingMessage?: string;
}

//----------------------------------------------------
// 4. Core Logic
//----------------------------------------------------
/**
 * Component: PublicCountdownScreen
 * Description:
 * - Renders a full-screen countdown prior to a question start
 * - If `startedAt` is provided, briefly syncs the countdown to server time
 * - Displays a progress bar and basic attention animation
 *
 * Parameters:
 * - countdownTime (number): Countdown duration in seconds
 * - onCountdownComplete (function, optional): Called once when countdown reaches 0
 * - message (string, optional): Message shown while remaining time is above threshold
 * - questionNumber (number, optional): Current question number (1-indexed)
 * - totalQuestions (number, optional): Total questions in the quiz
 * - startedAt (number, optional): Server timestamp (ms) when countdown started
 * - waitingMessage (string, optional): Message shown while waiting for `startedAt`
 *
 * Returns:
 * - React.ReactElement: The countdown screen component
 */
export const PublicCountdownScreen: React.FC<PublicCountdownScreenProps> = ({
  countdownTime,
  onCountdownComplete,
  message = DEFAULT_MESSAGE,
  questionNumber,
  totalQuestions,
  startedAt,
  waitingMessage = message,
}) => {
  const [isSyncing, setIsSyncing] = useState(true);
  const [syncStartTime, setSyncStartTime] = useState(() => Date.now());
  const [currentTime, setCurrentTime] = useState(countdownTime);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setSyncStartTime(getEffectiveSyncStartTime(startedAt, Date.now()));
  }, [startedAt]);

  useEffect(() => {
    if (!startedAt) {
      setIsSyncing(true);
      setCurrentTime(countdownTime);
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const updateCountdown = () => {
      setCurrentTime(getRemainingCountdownSeconds(countdownTime, startedAt, Date.now()));
    };

    const checkSyncWindow = () => {
      const elapsedMs = Date.now() - syncStartTime;
      if (elapsedMs >= SYNC_DURATION_MS) {
        updateCountdown();
        setIsSyncing(false);
        clearInterval(intervalId);
        return;
      }

      updateCountdown();
      const remainingMs = SYNC_DURATION_MS - elapsedMs;
      timeoutId = setTimeout(checkSyncWindow, Math.min(remainingMs, SYNC_UPDATE_INTERVAL_MS));
    };

    updateCountdown();
    const intervalId = setInterval(updateCountdown, SYNC_UPDATE_INTERVAL_MS);
    checkSyncWindow();

    return () => {
      clearInterval(intervalId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [startedAt, syncStartTime, countdownTime]);

  useEffect(() => {
    if (isSyncing) return;

    if (currentTime <= 0) {
      onCountdownComplete?.();
      return;
    }

    const tickTimer = setTimeout(() => {
      setCurrentTime((prev) => prev - 1);
      setIsAnimating(true);

      setTimeout(() => setIsAnimating(false), ANIMATION_RESET_DELAY_MS);
    }, COUNTDOWN_TICK_MS);

    return () => clearTimeout(tickTimer);
  }, [currentTime, onCountdownComplete, isSyncing]);

  const countdownText = getCountdownText({
    isSyncing,
    hasStartedAt: Boolean(startedAt),
    currentTime,
    message,
    waitingMessage,
  });

  const countdownSize = getCountdownSize({
    isSyncing,
    hasStartedAt: Boolean(startedAt),
    currentTime,
  });

  const countdownColor = getCountdownColor({
    isSyncing,
    hasStartedAt: Boolean(startedAt),
    currentTime,
  });

  const progressWidth = isSyncing
    ? PROGRESS_ZERO
    : `${getProgressPercent(countdownTime, currentTime)}%`;

  const shouldShowCounter =
    typeof questionNumber === 'number' && typeof totalQuestions === 'number';

  return (
    <PageContainer className="h-screen">
      <Main className="h-full relative">
        <div className="absolute inset-0">
          <QuizBackground variant="question" animated={true} />
        </div>

        {shouldShowCounter && (
          <div className="absolute top-8 left-8 z-20">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg px-6 py-3">
              <span className="text-xl font-semibold text-gray-800">
                問題 {questionNumber} / {totalQuestions}
              </span>
            </div>
          </div>
        )}

        <div className="relative z-10 h-full flex flex-col items-center justify-center">
          <div className="text-center">
            <div
              className={`${countdownSize} ${countdownColor} font-bold drop-shadow-2xl transition-all duration-300 ${
                isAnimating ? 'scale-110' : 'scale-100'
              }`}
            >
              {countdownText}
            </div>
          </div>

          <div className="mt-12 w-full max-w-2xl mx-auto">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 via-blue-400/20 to-purple-400/20 rounded-lg blur-sm scale-105" />

              <div className="relative bg-white/10 rounded-lg h-4 w-full overflow-hidden border-2 border-white/20 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 via-blue-400/10 to-purple-400/10 animate-pulse" />

                <div
                  className="relative h-full transition-all duration-1000 ease-linear"
                  style={{ width: progressWidth }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent transform -skew-x-12 animate-pulse" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent transform -skew-x-12 animate-pulse" />
                  <div className="absolute top-0 right-0 h-full w-2 bg-white/80 rounded-r-lg shadow-lg" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(PARTICLE_COUNT)].map((_, index) => (
            <div
              key={index}
              className={`absolute w-2 h-2 ${PARTICLE_OPACITY_CLASS} rounded-full animate-bounce ${
                isAnimating ? 'animate-ping' : ''
              }`}
              style={{
                width: PARTICLE_SIZE_PX,
                height: PARTICLE_SIZE_PX,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${
                  PARTICLE_MIN_ANIMATION_DELAY_SECONDS +
                  Math.random() *
                    (PARTICLE_MAX_ANIMATION_DELAY_SECONDS - PARTICLE_MIN_ANIMATION_DELAY_SECONDS)
                }s`,
                animationDuration: `${
                  PARTICLE_MIN_ANIMATION_DURATION_SECONDS +
                  Math.random() *
                    (PARTICLE_MAX_ANIMATION_DURATION_SECONDS -
                      PARTICLE_MIN_ANIMATION_DURATION_SECONDS)
                }s`,
              }}
            />
          ))}
        </div>
      </Main>
    </PageContainer>
  );
};

//----------------------------------------------------
// 5. Helper Functions
//----------------------------------------------------
/**
 * Returns the effective sync start time.
 * If the server start time is in the future (lead time), it becomes the sync baseline.
 */
function getEffectiveSyncStartTime(startedAt: number | undefined, nowMs: number): number {
  if (!startedAt) return nowMs;
  return startedAt > nowMs ? startedAt : nowMs;
}

/**
 * Calculates remaining seconds based on a server-provided start timestamp.
 */
function getRemainingCountdownSeconds(
  countdownTimeSeconds: number,
  startedAtMs: number | undefined,
  nowMs: number,
): number {
  if (!startedAtMs) return countdownTimeSeconds;
  const elapsedMs = nowMs - startedAtMs;
  const elapsedSeconds = Math.max(0, Math.floor(elapsedMs / COUNTDOWN_TICK_MS));
  return Math.max(0, countdownTimeSeconds - elapsedSeconds);
}

function getProgressPercent(countdownTimeSeconds: number, currentTimeSeconds: number): number {
  if (countdownTimeSeconds <= 0) return 0;
  const elapsed = countdownTimeSeconds - currentTimeSeconds;
  const ratio = elapsed / countdownTimeSeconds;
  return Math.max(0, Math.min(100, ratio * 100));
}

function getCountdownText(params: {
  isSyncing: boolean;
  hasStartedAt: boolean;
  currentTime: number;
  message: string;
  waitingMessage: string;
}): string {
  const { isSyncing, hasStartedAt, currentTime, message, waitingMessage } = params;

  if (isSyncing && !hasStartedAt) return waitingMessage;
  if (currentTime > COUNTDOWN_NUMBER_THRESHOLD_SECONDS) return message;
  if (currentTime > 0) return currentTime.toString();
  return DEFAULT_START_TEXT;
}

function getCountdownSize(params: {
  isSyncing: boolean;
  hasStartedAt: boolean;
  currentTime: number;
}): string {
  const { isSyncing, hasStartedAt, currentTime } = params;

  if (isSyncing && !hasStartedAt) return COUNTDOWN_SIZE_MESSAGE;
  if (currentTime > COUNTDOWN_NUMBER_THRESHOLD_SECONDS) return COUNTDOWN_SIZE_MESSAGE;
  if (currentTime > 0) return COUNTDOWN_SIZE_NUMBER;
  return COUNTDOWN_SIZE_START;
}

function getCountdownColor(params: {
  isSyncing: boolean;
  hasStartedAt: boolean;
  currentTime: number;
}): string {
  const { isSyncing, hasStartedAt, currentTime } = params;

  if (isSyncing && !hasStartedAt) return COUNTDOWN_COLOR_MESSAGE;
  if (currentTime > COUNTDOWN_NUMBER_THRESHOLD_SECONDS) return COUNTDOWN_COLOR_MESSAGE;
  if (currentTime > 0) return COUNTDOWN_COLOR_NUMBER;
  return COUNTDOWN_COLOR_START;
}
