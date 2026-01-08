// ====================================================
// File Name   : RotatingSquares.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-10-01
// Last Update : 2025-10-01
//
// Description:
// - Rotating squares pattern component for quiz backgrounds
// - Renders multiple animated squares with different positions and colors
// - Supports animation toggle via animated prop
//
// Notes:
// - Client component (uses React hooks if needed)
// - Uses Tailwind CSS for styling
// - Squares rotate with different speeds and directions
// ====================================================

import React from 'react';

// ====================================================
// Constants
// ====================================================

const BASE_SQUARE_CLASSES = 'absolute bg-gradient-to-br transform rotate-45';
const ANIMATION_CLASS = 'animate-spin';

const SQUARE_1_POSITION_CLASSES = 'top-10 left-10';
const SQUARE_1_SIZE_CLASSES = 'w-8 h-8';
const SQUARE_1_GRADIENT_CLASSES = 'from-cyan-300/25 to-blue-400/25';
const SQUARE_1_ANIMATION_DURATION = '20s';

const SQUARE_2_POSITION_CLASSES = 'top-20 right-20';
const SQUARE_2_SIZE_CLASSES = 'w-6 h-6';
const SQUARE_2_GRADIENT_CLASSES = 'from-purple-300/25 to-pink-400/25';
const SQUARE_2_ANIMATION_DURATION = '15s';
const SQUARE_2_ANIMATION_DIRECTION = 'reverse';

const SQUARE_3_POSITION_CLASSES = 'bottom-20 left-1/3';
const SQUARE_3_SIZE_CLASSES = 'w-10 h-10';
const SQUARE_3_GRADIENT_CLASSES = 'from-emerald-300/25 to-teal-400/25';
const SQUARE_3_ANIMATION_DURATION = '25s';

const SQUARE_4_POSITION_CLASSES = 'top-1/2 left-1/4';
const SQUARE_4_SIZE_CLASSES = 'w-7 h-7';
const SQUARE_4_GRADIENT_CLASSES = 'from-orange-300/25 to-red-400/25';
const SQUARE_4_ANIMATION_DURATION = '18s';
const SQUARE_4_ANIMATION_DIRECTION = 'reverse';

const SQUARE_5_POSITION_CLASSES = 'bottom-1/3 right-1/5';
const SQUARE_5_SIZE_CLASSES = 'w-9 h-9';
const SQUARE_5_GRADIENT_CLASSES = 'from-violet-300/25 to-purple-400/25';
const SQUARE_5_ANIMATION_DURATION = '22s';

// ====================================================
// Types
// ====================================================

interface RotatingSquaresProps {
  animated: boolean;
}

interface SquareStyle {
  animationDuration?: string;
  animationDirection?: string;
}

// ====================================================
// Helper Functions
// ====================================================

/**
 * Function: getSquareStyle
 * Description:
 * - Returns inline style object for square animation
 * - Only returns style if animated is true
 *
 * Parameters:
 * - animated (boolean): Whether animation is enabled
 * - duration (string): Animation duration in seconds
 * - direction (string, optional): Animation direction
 *
 * Returns:
 * - SquareStyle: Style object with animation properties or empty object
 */
const getSquareStyle = (animated: boolean, duration: string, direction?: string): SquareStyle => {
  if (!animated) return {};
  return {
    animationDuration: duration,
    ...(direction && { animationDirection: direction }),
  };
};

// ====================================================
// Core Logic
// ====================================================

/**
 * Component: RotatingSquares
 * Description:
 * - Renders multiple rotating square elements for background decoration
 * - Each square has unique position, size, color, and animation properties
 * - Supports animation toggle via animated prop
 *
 * Parameters:
 * - animated (boolean): Whether squares should animate
 *
 * Returns:
 * - React.ReactElement: Fragment containing all square elements
 *
 * Example:
 * ```tsx
 * <RotatingSquares animated={true} />
 * ```
 */
export const RotatingSquares: React.FC<RotatingSquaresProps> = ({ animated }) => {
  return (
    <>
      <div
        className={`${BASE_SQUARE_CLASSES} ${SQUARE_1_POSITION_CLASSES} ${SQUARE_1_SIZE_CLASSES} ${SQUARE_1_GRADIENT_CLASSES} ${animated ? ANIMATION_CLASS : ''}`}
        style={getSquareStyle(animated, SQUARE_1_ANIMATION_DURATION)}
      ></div>
      <div
        className={`${BASE_SQUARE_CLASSES} ${SQUARE_2_POSITION_CLASSES} ${SQUARE_2_SIZE_CLASSES} ${SQUARE_2_GRADIENT_CLASSES} ${animated ? ANIMATION_CLASS : ''}`}
        style={getSquareStyle(animated, SQUARE_2_ANIMATION_DURATION, SQUARE_2_ANIMATION_DIRECTION)}
      ></div>
      <div
        className={`${BASE_SQUARE_CLASSES} ${SQUARE_3_POSITION_CLASSES} ${SQUARE_3_SIZE_CLASSES} ${SQUARE_3_GRADIENT_CLASSES} ${animated ? ANIMATION_CLASS : ''}`}
        style={getSquareStyle(animated, SQUARE_3_ANIMATION_DURATION)}
      ></div>
      <div
        className={`${BASE_SQUARE_CLASSES} ${SQUARE_4_POSITION_CLASSES} ${SQUARE_4_SIZE_CLASSES} ${SQUARE_4_GRADIENT_CLASSES} ${animated ? ANIMATION_CLASS : ''}`}
        style={getSquareStyle(animated, SQUARE_4_ANIMATION_DURATION, SQUARE_4_ANIMATION_DIRECTION)}
      ></div>
      <div
        className={`${BASE_SQUARE_CLASSES} ${SQUARE_5_POSITION_CLASSES} ${SQUARE_5_SIZE_CLASSES} ${SQUARE_5_GRADIENT_CLASSES} ${animated ? ANIMATION_CLASS : ''}`}
        style={getSquareStyle(animated, SQUARE_5_ANIMATION_DURATION)}
      ></div>
    </>
  );
};
