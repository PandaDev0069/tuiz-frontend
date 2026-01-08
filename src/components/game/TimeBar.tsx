// ====================================================
// File Name   : TimeBar.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-21
// Last Update : 2024-12-28
//
// Description:
// - Renders the top timer progress bar, optional question counter, and timer display
// - Applies warning/expired visual states as time runs low or expires
//
// Notes:
// - Client-only component (requires 'use client')
// - Memoized to avoid unnecessary re-renders during countdown ticks
// ====================================================

'use client';

//----------------------------------------------------
// 1. Imports / Dependencies
//----------------------------------------------------
import React, { memo } from 'react';

//----------------------------------------------------
// 2. Constants / Configuration
//----------------------------------------------------
const DEFAULT_CLASSNAME = '';

const DEFAULT_SHOW_QUESTION_COUNTER = true;
const DEFAULT_SHOW_TIMER_DISPLAY = true;

const DEFAULT_IS_WARNING = false;
const DEFAULT_IS_EXPIRED = false;

const LOW_TIME_THRESHOLD_SECONDS = 5;
const MIN_TIME_LIMIT_SECONDS = 1;

const PERCENT_MIN = 0;
const PERCENT_MAX = 100;

const TIMER_BAR_ANIMATION_MS = 1000;

const TIMER_EXPIRED_SECONDS = 0;
const TIMER_UNIT_LABEL = '秒';
const TIMER_EXPIRED_LABEL = '時間切れ';

//----------------------------------------------------
// 3. Types / Interfaces
//----------------------------------------------------
interface TimeBarProps {
  currentTime: number;
  timeLimit: number;
  questionNumber?: number;
  totalQuestions?: number;
  className?: string;
  showQuestionCounter?: boolean;
  showTimerDisplay?: boolean;
  isWarning?: boolean;
  isExpired?: boolean;
}

//----------------------------------------------------
// 4. Core Logic
//----------------------------------------------------
/**
 * Component: TimeBar
 * Description:
 * - Shows a progress bar that depletes as time runs out
 * - Optionally shows a question counter and a numeric seconds display
 * - Applies warning/expired visual states
 *
 * Parameters:
 * - currentTime (number): Remaining time in seconds
 * - timeLimit (number): Total time limit in seconds
 * - questionNumber (number, optional): Current question number (1-indexed)
 * - totalQuestions (number, optional): Total number of questions in the quiz
 * - className (string, optional): Additional classes for the bar container
 * - showQuestionCounter (boolean, optional): Toggles the question counter
 * - showTimerDisplay (boolean, optional): Toggles the timer number display
 * - isWarning (boolean, optional): Forces warning state
 * - isExpired (boolean, optional): Forces expired state
 *
 * Returns:
 * - React.ReactElement: The time bar UI
 */
export const TimeBar: React.FC<TimeBarProps> = memo(
  ({
    currentTime,
    timeLimit,
    questionNumber,
    totalQuestions,
    className = DEFAULT_CLASSNAME,
    showQuestionCounter = DEFAULT_SHOW_QUESTION_COUNTER,
    showTimerDisplay = DEFAULT_SHOW_TIMER_DISPLAY,
    isWarning = DEFAULT_IS_WARNING,
    isExpired = DEFAULT_IS_EXPIRED,
  }) => {
    const safeCurrentTime = sanitizeNonNegativeSeconds(currentTime);
    const safeTimeLimit = sanitizePositiveSeconds(timeLimit, MIN_TIME_LIMIT_SECONDS);

    const progressPercent = clampPercent((safeCurrentTime / safeTimeLimit) * PERCENT_MAX);
    const isLowTime = safeCurrentTime <= LOW_TIME_THRESHOLD_SECONDS && safeCurrentTime > 0;
    const shouldWarn = isWarning || isLowTime;

    const shouldShowCounter =
      showQuestionCounter &&
      typeof questionNumber === 'number' &&
      typeof totalQuestions === 'number';

    return (
      <>
        <div className={`absolute top-0 left-0 right-0 z-10 ${className}`}>
          <div className="bg-gray-200 h-2 w-full">
            <div
              className={`h-full transition-all duration-[${TIMER_BAR_ANIMATION_MS}ms] ease-linear ${
                isExpired
                  ? 'bg-gradient-to-r from-red-500 to-red-600'
                  : shouldWarn
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 animate-pulse'
                    : 'bg-gradient-to-r from-cyan-500 to-blue-500'
              }`}
              style={{ width: `${PERCENT_MAX - progressPercent}%` }}
            />
          </div>
        </div>

        {shouldShowCounter && (
          <div className="absolute top-8 left-8 z-20">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2">
              <span className="text-lg font-semibold text-gray-800">
                問題 {questionNumber} / {totalQuestions}
              </span>
            </div>
          </div>
        )}

        {showTimerDisplay && (
          <div className="absolute top-8 right-8 z-20">
            <div
              className={`backdrop-blur-sm rounded-lg px-4 py-2 transition-all duration-300 ${
                isExpired
                  ? 'bg-red-500/90 animate-pulse'
                  : shouldWarn
                    ? 'bg-orange-500/90 animate-pulse'
                    : 'bg-white/90'
              }`}
            >
              <span
                className={`text-2xl font-bold transition-colors duration-300 ${
                  isExpired || shouldWarn ? 'text-white' : 'text-gray-800'
                }`}
              >
                {isExpired ? TIMER_EXPIRED_SECONDS : Math.ceil(safeCurrentTime)}
              </span>
              <span
                className={`text-sm ml-1 ${
                  isExpired || shouldWarn ? 'text-white/90' : 'text-gray-600'
                }`}
              >
                {TIMER_UNIT_LABEL}
              </span>
            </div>
          </div>
        )}

        {isExpired && (
          <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
            <div className="bg-red-500/90 backdrop-blur-sm rounded-lg px-8 py-4 animate-pulse">
              <span className="text-2xl font-bold text-white">{TIMER_EXPIRED_LABEL}</span>
            </div>
          </div>
        )}
      </>
    );
  },
);

TimeBar.displayName = 'TimeBar';

//----------------------------------------------------
// 5. Helper Functions
//----------------------------------------------------
function sanitizeNonNegativeSeconds(value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  return value;
}

function sanitizePositiveSeconds(value: number, minValue: number): number {
  if (!Number.isFinite(value)) return minValue;
  if (value <= 0) return minValue;
  return value;
}

function clampPercent(value: number): number {
  return Math.max(PERCENT_MIN, Math.min(PERCENT_MAX, value));
}
