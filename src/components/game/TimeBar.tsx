'use client';

import React from 'react';

interface TimeBarProps {
  currentTime: number;
  timeLimit: number;
  className?: string;
}

export const TimeBar: React.FC<TimeBarProps> = ({ currentTime, timeLimit, className = '' }) => {
  const progress = (currentTime / timeLimit) * 100;

  return (
    <div className={`absolute top-0 left-0 right-0 z-10 ${className}`}>
      <div className="bg-gray-200 h-2 w-full">
        <div
          className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all duration-1000 ease-linear"
          style={{ width: `${100 - progress}%` }}
        />
      </div>
    </div>
  );
};
