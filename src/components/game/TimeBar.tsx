'use client';

import React from 'react';

interface TimeBarProps {
  currentTime: number;
  timeLimit: number;
  questionNumber?: number;
  totalQuestions?: number;
  className?: string;
  showQuestionCounter?: boolean;
  showTimerDisplay?: boolean;
}

export const TimeBar: React.FC<TimeBarProps> = ({
  currentTime,
  timeLimit,
  questionNumber,
  totalQuestions,
  className = '',
  showQuestionCounter = true,
  showTimerDisplay = true,
}) => {
  const progress = (currentTime / timeLimit) * 100;

  return (
    <>
      {/* Timer Bar */}
      <div className={`absolute top-0 left-0 right-0 z-10 ${className}`}>
        <div className="bg-gray-200 h-2 w-full">
          <div
            className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all duration-1000 ease-linear"
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
          <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2">
            <span className="text-2xl font-bold text-gray-800">{Math.ceil(currentTime)}</span>
            <span className="text-sm text-gray-600 ml-1">秒</span>
          </div>
        </div>
      )}
    </>
  );
};
