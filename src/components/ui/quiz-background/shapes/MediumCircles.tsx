// ====================================================
// File Name   : MediumCircles.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-10-01
// Last Update : 2025-10-01
//
// Description:
// - Medium circles pattern component for quiz backgrounds
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

const CIRCLE_1_POSITION_CLASSES = 'top-1/3 left-1/3';
const CIRCLE_1_SIZE_CLASSES = 'w-16 h-16';
const CIRCLE_1_GRADIENT_CLASSES = 'from-blue-200/55 to-indigo-300/55';
const CIRCLE_1_ANIMATION_TYPE = ANIMATION_BOUNCE;
const CIRCLE_1_ANIMATION_DELAY = '0.5s';

const CIRCLE_2_POSITION_CLASSES = 'top-2/3 right-1/3';
const CIRCLE_2_SIZE_CLASSES = 'w-20 h-20';
const CIRCLE_2_GRADIENT_CLASSES = 'from-rose-200/55 to-pink-300/55';
const CIRCLE_2_ANIMATION_TYPE = ANIMATION_PULSE;
const CIRCLE_2_ANIMATION_DELAY = '1.5s';

const CIRCLE_3_POSITION_CLASSES = 'top-1/6 left-1/2';
const CIRCLE_3_SIZE_CLASSES = 'w-18 h-18';
const CIRCLE_3_GRADIENT_CLASSES = 'from-amber-200/50 to-yellow-300/50';
const CIRCLE_3_ANIMATION_TYPE = ANIMATION_BOUNCE;
const CIRCLE_3_ANIMATION_DELAY = '4s';

const CIRCLE_4_POSITION_CLASSES = 'bottom-1/3 right-1/4';
const CIRCLE_4_SIZE_CLASSES = 'w-14 h-14';
const CIRCLE_4_GRADIENT_CLASSES = 'from-lime-200/50 to-green-300/50';
const CIRCLE_4_ANIMATION_TYPE = ANIMATION_PULSE;
const CIRCLE_4_ANIMATION_DELAY = '1.8s';

// ====================================================
// Types
// ====================================================

interface MediumCirclesProps {
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
 * Component: MediumCircles
 * Description:
 * - Renders multiple medium-sized circle elements for background decoration
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
 * <MediumCircles animated={true} />
 * ```
 */
export const MediumCircles: React.FC<MediumCirclesProps> = ({ animated }) => {
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
    </>
  );
};
