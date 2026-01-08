// ====================================================
// File Name   : DiamondPatterns.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-10-01
// Last Update : 2025-10-01
//
// Description:
// - Diamond patterns component for quiz backgrounds
// - Renders multiple animated diamond shapes with different positions and colors
// - Supports animation toggle via animated prop
//
// Notes:
// - Client component (uses React hooks if needed)
// - Uses Tailwind CSS for styling
// - Diamonds are created by rotating squares 45 degrees
// - Diamonds bounce with different animation delays
// ====================================================

import React from 'react';

// ====================================================
// Constants
// ====================================================

const BASE_DIAMOND_CLASSES = 'absolute bg-gradient-to-br transform rotate-45';
const ANIMATION_CLASS = 'animate-bounce';

const DIAMOND_1_POSITION_CLASSES = 'top-1/3 right-1/4';
const DIAMOND_1_SIZE_CLASSES = 'w-6 h-6';
const DIAMOND_1_GRADIENT_CLASSES = 'from-rose-300/30 to-pink-400/30';
const DIAMOND_1_ANIMATION_DELAY = '3.8s';

const DIAMOND_2_POSITION_CLASSES = 'bottom-1/2 left-1/5';
const DIAMOND_2_SIZE_CLASSES = 'w-8 h-8';
const DIAMOND_2_GRADIENT_CLASSES = 'from-amber-300/30 to-yellow-400/30';
const DIAMOND_2_ANIMATION_DELAY = '1.3s';

const DIAMOND_3_POSITION_CLASSES = 'top-2/3 right-1/6';
const DIAMOND_3_SIZE_CLASSES = 'w-5 h-5';
const DIAMOND_3_GRADIENT_CLASSES = 'from-lime-300/30 to-green-400/30';
const DIAMOND_3_ANIMATION_DELAY = '4.8s';

// ====================================================
// Types
// ====================================================

interface DiamondPatternsProps {
  animated: boolean;
}

interface DiamondStyle {
  animationDelay?: string;
}

// ====================================================
// Helper Functions
// ====================================================

/**
 * Function: getDiamondStyle
 * Description:
 * - Returns inline style object for diamond animation
 * - Only returns style if animated is true and delay is provided
 *
 * Parameters:
 * - animated (boolean): Whether animation is enabled
 * - delay (string, optional): Animation delay in seconds
 *
 * Returns:
 * - DiamondStyle: Style object with animation delay or empty object
 */
const getDiamondStyle = (animated: boolean, delay?: string): DiamondStyle => {
  if (!animated || !delay) return {};
  return { animationDelay: delay };
};

// ====================================================
// Core Logic
// ====================================================

/**
 * Component: DiamondPatterns
 * Description:
 * - Renders multiple diamond elements for background decoration
 * - Each diamond has unique position, size, color, and animation delay
 * - Diamonds are created by rotating squares 45 degrees
 * - Supports animation toggle via animated prop
 *
 * Parameters:
 * - animated (boolean): Whether diamonds should animate
 *
 * Returns:
 * - React.ReactElement: Fragment containing all diamond elements
 *
 * Example:
 * ```tsx
 * <DiamondPatterns animated={true} />
 * ```
 */
export const DiamondPatterns: React.FC<DiamondPatternsProps> = ({ animated }) => {
  return (
    <>
      <div
        className={`${BASE_DIAMOND_CLASSES} ${DIAMOND_1_POSITION_CLASSES} ${DIAMOND_1_SIZE_CLASSES} ${DIAMOND_1_GRADIENT_CLASSES} ${animated ? ANIMATION_CLASS : ''}`}
        style={getDiamondStyle(animated, DIAMOND_1_ANIMATION_DELAY)}
      ></div>
      <div
        className={`${BASE_DIAMOND_CLASSES} ${DIAMOND_2_POSITION_CLASSES} ${DIAMOND_2_SIZE_CLASSES} ${DIAMOND_2_GRADIENT_CLASSES} ${animated ? ANIMATION_CLASS : ''}`}
        style={getDiamondStyle(animated, DIAMOND_2_ANIMATION_DELAY)}
      ></div>
      <div
        className={`${BASE_DIAMOND_CLASSES} ${DIAMOND_3_POSITION_CLASSES} ${DIAMOND_3_SIZE_CLASSES} ${DIAMOND_3_GRADIENT_CLASSES} ${animated ? ANIMATION_CLASS : ''}`}
        style={getDiamondStyle(animated, DIAMOND_3_ANIMATION_DELAY)}
      ></div>
    </>
  );
};
