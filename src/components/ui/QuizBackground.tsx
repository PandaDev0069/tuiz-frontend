'use client';

import React from 'react';
import {
  FloatingShapes,
  GeometricPatterns,
  WavePatterns,
  BackgroundOverlays,
} from './quiz-background';

interface QuizBackgroundProps {
  className?: string;
  variant?: 'default' | 'question' | 'answer' | 'leaderboard';
  animated?: boolean;
}

/**
 * QuizBackground component - Renders animated background patterns for quiz screens
 * Refactored to use smaller sub-components for better maintainability
 */
export const QuizBackground: React.FC<QuizBackgroundProps> = ({
  className = '',
  variant = 'default',
  animated = true,
}) => {
  const getBackgroundStyle = (): string => {
    switch (variant) {
      case 'question':
        return 'bg-gradient-to-br from-cyan-400 via-blue-400 to-indigo-400';
      case 'answer':
        return 'bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400';
      case 'leaderboard':
        return 'bg-gradient-to-br from-purple-400 via-pink-400 to-rose-400';
      default:
        return 'bg-gradient-to-br from-cyan-400 via-blue-400 to-purple-400';
    }
  };

  return (
    <div className={`absolute inset-0 ${getBackgroundStyle()} ${className}`}>
      <FloatingShapes animated={animated} />
      <GeometricPatterns animated={animated} />
      <WavePatterns />
      <BackgroundOverlays animated={animated} />
    </div>
  );
};
