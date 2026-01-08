// ====================================================
// File Name   : TrianglePatterns.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-10-01
// Last Update : 2025-10-01
//
// Description:
// - Triangle patterns component for quiz backgrounds
// - Renders multiple animated triangles with different positions and colors
// - Supports animation toggle via animated prop
//
// Notes:
// - Client component (uses React hooks if needed)
// - Uses Tailwind CSS border tricks to create triangle shapes
// - Triangles pulse with different animation delays
// ====================================================

import React from 'react';

// ====================================================
// Constants
// ====================================================

const BASE_TRIANGLE_CLASSES = 'absolute w-0 h-0 border-l-transparent border-r-transparent';
const ANIMATION_CLASS = 'animate-pulse';

const TRIANGLE_1_POSITION_CLASSES = 'top-1/2 right-10';
const TRIANGLE_1_BORDER_CLASSES = 'border-l-8 border-r-8 border-b-12';
const TRIANGLE_1_COLOR_CLASSES = 'border-b-cyan-300/25';
const TRIANGLE_1_ANIMATION_DELAY = '3s';

const TRIANGLE_2_POSITION_CLASSES = 'bottom-10 right-1/3';
const TRIANGLE_2_BORDER_CLASSES = 'border-l-6 border-r-6 border-b-10';
const TRIANGLE_2_COLOR_CLASSES = 'border-b-purple-300/25';
const TRIANGLE_2_ANIMATION_DELAY = '1.8s';

const TRIANGLE_3_POSITION_CLASSES = 'top-1/4 left-1/2';
const TRIANGLE_3_BORDER_CLASSES = 'border-l-5 border-r-5 border-b-8';
const TRIANGLE_3_COLOR_CLASSES = 'border-b-emerald-300/25';
const TRIANGLE_3_ANIMATION_DELAY = '4.5s';

const TRIANGLE_4_POSITION_CLASSES = 'bottom-1/4 left-1/3';
const TRIANGLE_4_BORDER_CLASSES = 'border-l-7 border-r-7 border-b-11';
const TRIANGLE_4_COLOR_CLASSES = 'border-b-orange-300/25';
const TRIANGLE_4_ANIMATION_DELAY = '2.7s';

// ====================================================
// Types
// ====================================================

interface TrianglePatternsProps {
  animated: boolean;
}

interface TriangleStyle {
  animationDelay?: string;
}

// ====================================================
// Helper Functions
// ====================================================

/**
 * Function: getTriangleStyle
 * Description:
 * - Returns inline style object for triangle animation
 * - Only returns style if animated is true
 *
 * Parameters:
 * - animated (boolean): Whether animation is enabled
 * - delay (string): Animation delay in seconds
 *
 * Returns:
 * - TriangleStyle: Style object with animation delay or empty object
 */
const getTriangleStyle = (animated: boolean, delay: string): TriangleStyle => {
  if (!animated) return {};
  return { animationDelay: delay };
};

// ====================================================
// Core Logic
// ====================================================

/**
 * Component: TrianglePatterns
 * Description:
 * - Renders multiple triangle elements for background decoration
 * - Each triangle has unique position, size, color, and animation delay
 * - Uses CSS border tricks to create triangle shapes
 * - Supports animation toggle via animated prop
 *
 * Parameters:
 * - animated (boolean): Whether triangles should animate
 *
 * Returns:
 * - React.ReactElement: Fragment containing all triangle elements
 *
 * Example:
 * ```tsx
 * <TrianglePatterns animated={true} />
 * ```
 */
export const TrianglePatterns: React.FC<TrianglePatternsProps> = ({ animated }) => {
  return (
    <>
      <div
        className={`${BASE_TRIANGLE_CLASSES} ${TRIANGLE_1_POSITION_CLASSES} ${TRIANGLE_1_BORDER_CLASSES} ${TRIANGLE_1_COLOR_CLASSES} ${animated ? ANIMATION_CLASS : ''}`}
        style={getTriangleStyle(animated, TRIANGLE_1_ANIMATION_DELAY)}
      ></div>
      <div
        className={`${BASE_TRIANGLE_CLASSES} ${TRIANGLE_2_POSITION_CLASSES} ${TRIANGLE_2_BORDER_CLASSES} ${TRIANGLE_2_COLOR_CLASSES} ${animated ? ANIMATION_CLASS : ''}`}
        style={getTriangleStyle(animated, TRIANGLE_2_ANIMATION_DELAY)}
      ></div>
      <div
        className={`${BASE_TRIANGLE_CLASSES} ${TRIANGLE_3_POSITION_CLASSES} ${TRIANGLE_3_BORDER_CLASSES} ${TRIANGLE_3_COLOR_CLASSES} ${animated ? ANIMATION_CLASS : ''}`}
        style={getTriangleStyle(animated, TRIANGLE_3_ANIMATION_DELAY)}
      ></div>
      <div
        className={`${BASE_TRIANGLE_CLASSES} ${TRIANGLE_4_POSITION_CLASSES} ${TRIANGLE_4_BORDER_CLASSES} ${TRIANGLE_4_COLOR_CLASSES} ${animated ? ANIMATION_CLASS : ''}`}
        style={getTriangleStyle(animated, TRIANGLE_4_ANIMATION_DELAY)}
      ></div>
    </>
  );
};
