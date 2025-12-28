'use client';

import React, { memo } from 'react';

interface TimeBarProps {
  currentTime: number;
  timeLimit: number;
  questionNumber?: number;
  totalQuestions?: number;
  className?: string;
  showQuestionCounter?: boolean;
  showTimerDisplay?: boolean;
  isWarning?: boolean; // Show warning when time is running low
  isExpired?: boolean; // Show expired state
}

export const TimeBar: React.FC<TimeBarProps> = memo(
  ({
    currentTime,
    timeLimit,
    questionNumber,
    totalQuestions,
    className = '',
    showQuestionCounter = true,
    showTimerDisplay = true,
    isWarning = false,
    isExpired = false,
  }) => {
    // Validate and sanitize time values to prevent NaN
    const safeCurrentTime = Number.isFinite(currentTime) && currentTime >= 0 ? currentTime : 0;
    const safeTimeLimit = Number.isFinite(timeLimit) && timeLimit > 0 ? timeLimit : 1;
    const progress = Math.max(0, Math.min(100, (safeCurrentTime / safeTimeLimit) * 100));
    const isLowTime = safeCurrentTime <= 5 && safeCurrentTime > 0;
    const showWarning = isWarning || isLowTime;

    return (
      <>
        {/* Timer Bar */}
        <div className={`absolute top-0 left-0 right-0 z-10 ${className}`}>
          <div className="bg-gray-200 h-2 w-full">
            <div
              className={`h-full transition-all duration-1000 ease-linear ${
                isExpired
                  ? 'bg-gradient-to-r from-red-500 to-red-600'
                  : showWarning
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 animate-pulse'
                    : 'bg-gradient-to-r from-cyan-500 to-blue-500'
              }`}
              style={{ width: `${100 - progress}%` }}
            />
          </div>
        </div>

        {/* Question Counter */}
        {showQuestionCounter && questionNumber && totalQuestions && (
          <div className="absolute top-8 left-8 z-20">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2">
              <span className="text-lg font-semibold text-gray-800">
                問題 {questionNumber} / {totalQuestions}
              </span>
            </div>
          </div>
        )}

        {/* Timer Display */}
        {showTimerDisplay && (
          <div className="absolute top-8 right-8 z-20">
            <div
              className={`backdrop-blur-sm rounded-lg px-4 py-2 transition-all duration-300 ${
                isExpired
                  ? 'bg-red-500/90 animate-pulse'
                  : showWarning
                    ? 'bg-orange-500/90 animate-pulse'
                    : 'bg-white/90'
              }`}
            >
              <span
                className={`text-2xl font-bold transition-colors duration-300 ${
                  isExpired || showWarning ? 'text-white' : 'text-gray-800'
                }`}
              >
                {isExpired ? 0 : Math.ceil(safeCurrentTime)}
              </span>
              <span
                className={`text-sm ml-1 ${isExpired || showWarning ? 'text-white/90' : 'text-gray-600'}`}
              >
                秒
              </span>
            </div>
          </div>
        )}

        {/* Expired Indicator */}
        {isExpired && (
          <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
            <div className="bg-red-500/90 backdrop-blur-sm rounded-lg px-8 py-4 animate-pulse">
              <span className="text-2xl font-bold text-white">時間切れ</span>
            </div>
          </div>
        )}
      </>
    );
  },
);

TimeBar.displayName = 'TimeBar';
