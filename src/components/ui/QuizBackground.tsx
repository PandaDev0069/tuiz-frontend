// ====================================================
// File Name   : QuizBackground.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-21
// Last Update : 2025-10-01
//
// Description:
// - Quiz background component for quiz screens
// - Renders animated background patterns with variant-specific gradients
// - Composed of multiple sub-components for layered effects
//
// Notes:
// - Client component (uses 'use client' directive)
// - Uses smaller sub-components for better maintainability
// - Supports multiple variants with different color schemes
// ====================================================

'use client';

import React from 'react';
import {
  FloatingShapes,
  GeometricPatterns,
  WavePatterns,
  BackgroundOverlays,
} from './quiz-background';

// ====================================================
// Constants
// ====================================================

const DEFAULT_CLASS_NAME = '';
const DEFAULT_VARIANT = 'default';
const DEFAULT_ANIMATED = true;

const BASE_CONTAINER_CLASSES = 'absolute inset-0';

const VARIANT_DEFAULT_GRADIENT = 'bg-gradient-to-br from-cyan-400 via-blue-400 to-purple-400';
const VARIANT_QUESTION_GRADIENT = 'bg-gradient-to-br from-cyan-400 via-blue-400 to-indigo-400';
const VARIANT_ANSWER_GRADIENT = 'bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400';
const VARIANT_LEADERBOARD_GRADIENT = 'bg-gradient-to-br from-purple-400 via-pink-400 to-rose-400';

// ====================================================
// Types
// ====================================================

interface QuizBackgroundProps {
  className?: string;
  variant?: 'default' | 'question' | 'answer' | 'leaderboard';
  animated?: boolean;
}

// ====================================================
// Helper Functions
// ====================================================

/**
 * Function: getBackgroundStyle
 * Description:
 * - Returns gradient background classes based on variant
 * - Maps variant to appropriate color scheme
 *
 * Parameters:
 * - variant ('default' | 'question' | 'answer' | 'leaderboard'): Background variant
 *
 * Returns:
 * - string: Tailwind CSS gradient classes
 */
const getBackgroundStyle = (variant: 'default' | 'question' | 'answer' | 'leaderboard'): string => {
  switch (variant) {
    case 'question':
      return VARIANT_QUESTION_GRADIENT;
    case 'answer':
      return VARIANT_ANSWER_GRADIENT;
    case 'leaderboard':
      return VARIANT_LEADERBOARD_GRADIENT;
    default:
      return VARIANT_DEFAULT_GRADIENT;
  }
};

// ====================================================
// Core Logic
// ====================================================

/**
 * Component: QuizBackground
 * Description:
 * - Renders animated background patterns for quiz screens
 * - Composed of FloatingShapes, GeometricPatterns, WavePatterns, and BackgroundOverlays
 * - Supports variant-specific color gradients
 * - Refactored to use smaller sub-components for better maintainability
 *
 * Parameters:
 * - className (string, optional): Additional CSS classes
 * - variant ('default' | 'question' | 'answer' | 'leaderboard', optional): Background variant (default: 'default')
 * - animated (boolean, optional): Whether patterns should animate (default: true)
 *
 * Returns:
 * - React.ReactElement: Container div with all background pattern components
 *
 * Example:
 * ```tsx
 * <QuizBackground variant="question" animated={true} />
 * ```
 */
export const QuizBackground: React.FC<QuizBackgroundProps> = ({
  className = DEFAULT_CLASS_NAME,
  variant = DEFAULT_VARIANT,
  animated = DEFAULT_ANIMATED,
}) => {
  return (
    <div className={`${BASE_CONTAINER_CLASSES} ${getBackgroundStyle(variant)} ${className}`}>
      <FloatingShapes animated={animated} />
      <GeometricPatterns animated={animated} />
      <WavePatterns />
      <BackgroundOverlays animated={animated} />
    </div>
  );
};
