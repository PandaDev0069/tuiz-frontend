// ====================================================
// File Name   : LargeCircles.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-10-01
// Last Update : 2025-10-01
//
// Description:
// - Large circles pattern component for quiz backgrounds
// - Renders multiple animated circles with different positions and colors
// - Supports animation toggle via animated prop
//
// Notes:
// - Client component (uses React hooks if needed)
// - Uses Tailwind CSS for styling
// - Circles use pulse or bounce animations with different delays
// ====================================================

import React from 'react';

// ====================================================
// Constants
// ====================================================

const BASE_CIRCLE_CLASSES = 'absolute bg-gradient-to-br rounded-full';
const ANIMATION_PULSE = 'animate-pulse';
const ANIMATION_BOUNCE = 'animate-bounce';

const CIRCLE_1_POSITION_CLASSES = '-top-20 -left-20';
const CIRCLE_1_SIZE_CLASSES = 'w-40 h-40';
const CIRCLE_1_GRADIENT_CLASSES = 'from-cyan-200/50 to-blue-300/50';
const CIRCLE_1_ANIMATION_TYPE = ANIMATION_PULSE;

const CIRCLE_2_POSITION_CLASSES = 'top-1/4 -right-16';
const CIRCLE_2_SIZE_CLASSES = 'w-32 h-32';
const CIRCLE_2_GRADIENT_CLASSES = 'from-purple-200/50 to-pink-300/50';
const CIRCLE_2_ANIMATION_TYPE = ANIMATION_BOUNCE;
const CIRCLE_2_ANIMATION_DELAY = '1s';

const CIRCLE_3_POSITION_CLASSES = '-bottom-16 left-1/4';
const CIRCLE_3_SIZE_CLASSES = 'w-24 h-24';
const CIRCLE_3_GRADIENT_CLASSES = 'from-emerald-200/50 to-teal-300/50';
const CIRCLE_3_ANIMATION_TYPE = ANIMATION_PULSE;
const CIRCLE_3_ANIMATION_DELAY = '2s';

const CIRCLE_4_POSITION_CLASSES = 'top-1/2 -left-10';
const CIRCLE_4_SIZE_CLASSES = 'w-36 h-36';
const CIRCLE_4_GRADIENT_CLASSES = 'from-rose-200/45 to-orange-300/45';
const CIRCLE_4_ANIMATION_TYPE = ANIMATION_BOUNCE;
const CIRCLE_4_ANIMATION_DELAY = '2.5s';

const CIRCLE_5_POSITION_CLASSES = '-top-10 right-1/3';
const CIRCLE_5_SIZE_CLASSES = 'w-28 h-28';
const CIRCLE_5_GRADIENT_CLASSES = 'from-violet-200/45 to-purple-300/45';
const CIRCLE_5_ANIMATION_TYPE = ANIMATION_PULSE;
const CIRCLE_5_ANIMATION_DELAY = '3.5s';

// ====================================================
// Types
// ====================================================

interface LargeCirclesProps {
  animated: boolean;
}

interface CircleStyle {
  animationDelay?: string;
}

// ====================================================
// Helper Functions
// ====================================================

/**
 * Function: getCircleStyle
 * Description:
 * - Returns inline style object for circle animation
 * - Only returns style if animated is true and delay is provided
 *
 * Parameters:
 * - animated (boolean): Whether animation is enabled
 * - delay (string, optional): Animation delay in seconds
 *
 * Returns:
 * - CircleStyle: Style object with animation delay or empty object
 */
const getCircleStyle = (animated: boolean, delay?: string): CircleStyle => {
  if (!animated || !delay) return {};
  return { animationDelay: delay };
};

// ====================================================
// Core Logic
// ====================================================

/**
 * Component: LargeCircles
 * Description:
 * - Renders multiple large circle elements for background decoration
 * - Each circle has unique position, size, color, and animation properties
 * - Supports animation toggle via animated prop
 *
 * Parameters:
 * - animated (boolean): Whether circles should animate
 *
 * Returns:
 * - React.ReactElement: Fragment containing all circle elements
 *
 * Example:
 * ```tsx
 * <LargeCircles animated={true} />
 * ```
 */
export const LargeCircles: React.FC<LargeCirclesProps> = ({ animated }) => {
  return (
    <>
      <div
        className={`${BASE_CIRCLE_CLASSES} ${CIRCLE_1_POSITION_CLASSES} ${CIRCLE_1_SIZE_CLASSES} ${CIRCLE_1_GRADIENT_CLASSES} ${animated ? CIRCLE_1_ANIMATION_TYPE : ''}`}
        style={getCircleStyle(animated)}
      ></div>
      <div
        className={`${BASE_CIRCLE_CLASSES} ${CIRCLE_2_POSITION_CLASSES} ${CIRCLE_2_SIZE_CLASSES} ${CIRCLE_2_GRADIENT_CLASSES} ${animated ? CIRCLE_2_ANIMATION_TYPE : ''}`}
        style={getCircleStyle(animated, CIRCLE_2_ANIMATION_DELAY)}
      ></div>
      <div
        className={`${BASE_CIRCLE_CLASSES} ${CIRCLE_3_POSITION_CLASSES} ${CIRCLE_3_SIZE_CLASSES} ${CIRCLE_3_GRADIENT_CLASSES} ${animated ? CIRCLE_3_ANIMATION_TYPE : ''}`}
        style={getCircleStyle(animated, CIRCLE_3_ANIMATION_DELAY)}
      ></div>
      <div
        className={`${BASE_CIRCLE_CLASSES} ${CIRCLE_4_POSITION_CLASSES} ${CIRCLE_4_SIZE_CLASSES} ${CIRCLE_4_GRADIENT_CLASSES} ${animated ? CIRCLE_4_ANIMATION_TYPE : ''}`}
        style={getCircleStyle(animated, CIRCLE_4_ANIMATION_DELAY)}
      ></div>
      <div
        className={`${BASE_CIRCLE_CLASSES} ${CIRCLE_5_POSITION_CLASSES} ${CIRCLE_5_SIZE_CLASSES} ${CIRCLE_5_GRADIENT_CLASSES} ${animated ? CIRCLE_5_ANIMATION_TYPE : ''}`}
        style={getCircleStyle(animated, CIRCLE_5_ANIMATION_DELAY)}
      ></div>
    </>
  );
};
