// ====================================================
// File Name   : SmallCircles.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-10-01
// Last Update : 2025-10-01
//
// Description:
// - Small circles pattern component for quiz backgrounds
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

const CIRCLE_1_POSITION_CLASSES = 'top-1/6 right-1/4';
const CIRCLE_1_SIZE_CLASSES = 'w-8 h-8';
const CIRCLE_1_GRADIENT_CLASSES = 'from-cyan-300/60 to-blue-400/60';
const CIRCLE_1_ANIMATION_TYPE = ANIMATION_BOUNCE;
const CIRCLE_1_ANIMATION_DELAY = '0.8s';

const CIRCLE_2_POSITION_CLASSES = 'bottom-1/4 left-1/6';
const CIRCLE_2_SIZE_CLASSES = 'w-12 h-12';
const CIRCLE_2_GRADIENT_CLASSES = 'from-purple-300/60 to-indigo-400/60';
const CIRCLE_2_ANIMATION_TYPE = ANIMATION_PULSE;
const CIRCLE_2_ANIMATION_DELAY = '2.2s';

const CIRCLE_3_POSITION_CLASSES = 'top-3/4 left-1/2';
const CIRCLE_3_SIZE_CLASSES = 'w-6 h-6';
const CIRCLE_3_GRADIENT_CLASSES = 'from-emerald-300/60 to-teal-400/60';
const CIRCLE_3_ANIMATION_TYPE = ANIMATION_BOUNCE;
const CIRCLE_3_ANIMATION_DELAY = '1.2s';

const CIRCLE_4_POSITION_CLASSES = 'top-1/4 left-1/4';
const CIRCLE_4_SIZE_CLASSES = 'w-10 h-10';
const CIRCLE_4_GRADIENT_CLASSES = 'from-orange-300/55 to-red-400/55';
const CIRCLE_4_ANIMATION_TYPE = ANIMATION_PULSE;
const CIRCLE_4_ANIMATION_DELAY = '3.2s';

const CIRCLE_5_POSITION_CLASSES = 'bottom-1/6 right-1/6';
const CIRCLE_5_SIZE_CLASSES = 'w-7 h-7';
const CIRCLE_5_GRADIENT_CLASSES = 'from-pink-300/55 to-rose-400/55';
const CIRCLE_5_ANIMATION_TYPE = ANIMATION_BOUNCE;
const CIRCLE_5_ANIMATION_DELAY = '2.8s';

const CIRCLE_6_POSITION_CLASSES = 'top-2/3 left-1/5';
const CIRCLE_6_SIZE_CLASSES = 'w-9 h-9';
const CIRCLE_6_GRADIENT_CLASSES = 'from-indigo-300/55 to-violet-400/55';
const CIRCLE_6_ANIMATION_TYPE = ANIMATION_PULSE;
const CIRCLE_6_ANIMATION_DELAY = '4.2s';

// ====================================================
// Types
// ====================================================

interface SmallCirclesProps {
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
 * Component: SmallCircles
 * Description:
 * - Renders multiple small-sized circle elements for background decoration
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
 * <SmallCircles animated={true} />
 * ```
 */
export const SmallCircles: React.FC<SmallCirclesProps> = ({ animated }) => {
  return (
    <>
      <div
        className={`${BASE_CIRCLE_CLASSES} ${CIRCLE_1_POSITION_CLASSES} ${CIRCLE_1_SIZE_CLASSES} ${CIRCLE_1_GRADIENT_CLASSES} ${animated ? CIRCLE_1_ANIMATION_TYPE : ''}`}
        style={getCircleStyle(animated, CIRCLE_1_ANIMATION_DELAY)}
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
      <div
        className={`${BASE_CIRCLE_CLASSES} ${CIRCLE_6_POSITION_CLASSES} ${CIRCLE_6_SIZE_CLASSES} ${CIRCLE_6_GRADIENT_CLASSES} ${animated ? CIRCLE_6_ANIMATION_TYPE : ''}`}
        style={getCircleStyle(animated, CIRCLE_6_ANIMATION_DELAY)}
      ></div>
    </>
  );
};
