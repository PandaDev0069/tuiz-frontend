// ====================================================
// File Name   : BackgroundOverlays.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-10-01
// Last Update : 2025-10-01
//
// Description:
// - Background overlay component for quiz backgrounds
// - Renders grid patterns, dotted overlays, and floating elements
// - Supports animation toggle via animated prop
//
// Notes:
// - Client component (uses React hooks if needed)
// - Uses Tailwind CSS and inline styles for complex patterns
// - Contains multiple overlay layers for visual depth
// ====================================================

import React from 'react';

// ====================================================
// Constants
// ====================================================

const GRID_PATTERN_CONTAINER_CLASSES = 'absolute inset-0 opacity-15';
const GRID_PATTERN_INNER_CLASSES = 'w-full h-full';

const GRID_GRADIENT_1 = 'radial-gradient(circle at 25% 25%, #3b82f6 2px, transparent 2px)';
const GRID_GRADIENT_2 = 'radial-gradient(circle at 75% 75%, #8b5cf6 2px, transparent 2px)';
const GRID_GRADIENT_3 = 'radial-gradient(circle at 50% 50%, #06b6d4 1px, transparent 1px)';
const GRID_BACKGROUND_SIZE = '40px 40px, 60px 60px, 80px 80px';
const GRID_BACKGROUND_POSITION = '0 0, 20px 20px, 10px 10px';

const DOTTED_PATTERN_CONTAINER_CLASSES = 'absolute inset-0 opacity-20';
const DOTTED_PATTERN_INNER_CLASSES = 'w-full h-full';
const DOTTED_PATTERN_IMAGE = 'radial-gradient(circle, #ffffff 1px, transparent 1px)';
const DOTTED_PATTERN_SIZE = '15px 15px';

const FLOATING_CONTAINER_CLASSES = 'absolute inset-0 overflow-hidden';
const ANIMATION_PULSE = 'animate-pulse';
const ANIMATION_BOUNCE = 'animate-bounce';

const LINE_1_POSITION_CLASSES = 'top-1/4 left-1/6';
const LINE_1_SIZE_CLASSES = 'w-32 h-1';
const LINE_1_GRADIENT_CLASSES = 'bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent';
const LINE_1_TRANSFORM_CLASSES = 'transform rotate-12';
const LINE_1_ANIMATION_DELAY = '5s';

const LINE_2_POSITION_CLASSES = 'bottom-1/3 right-1/4';
const LINE_2_SIZE_CLASSES = 'w-24 h-1';
const LINE_2_GRADIENT_CLASSES =
  'bg-gradient-to-r from-transparent via-purple-300/40 to-transparent';
const LINE_2_TRANSFORM_CLASSES = 'transform -rotate-12';
const LINE_2_ANIMATION_DELAY = '3.5s';

const LINE_3_POSITION_CLASSES = 'top-2/3 left-1/3';
const LINE_3_SIZE_CLASSES = 'w-20 h-1';
const LINE_3_GRADIENT_CLASSES =
  'bg-gradient-to-r from-transparent via-emerald-300/40 to-transparent';
const LINE_3_TRANSFORM_CLASSES = 'transform rotate-45';
const LINE_3_ANIMATION_DELAY = '4.2s';

const DOT_1_POSITION_CLASSES = 'top-1/5 right-1/3';
const DOT_1_SIZE_CLASSES = 'w-2 h-2';
const DOT_1_COLOR_CLASSES = 'bg-cyan-400/50 rounded-full';
const DOT_1_ANIMATION_DELAY = '6s';

const DOT_2_POSITION_CLASSES = 'bottom-1/5 left-1/4';
const DOT_2_SIZE_CLASSES = 'w-3 h-3';
const DOT_2_COLOR_CLASSES = 'bg-purple-400/50 rounded-full';
const DOT_2_ANIMATION_DELAY = '2.3s';

const DOT_3_POSITION_CLASSES = 'top-3/5 right-1/5';
const DOT_3_SIZE_CLASSES = 'w-1 h-1';
const DOT_3_COLOR_CLASSES = 'bg-emerald-400/50 rounded-full';
const DOT_3_ANIMATION_DELAY = '5.5s';

// ====================================================
// Types
// ====================================================

interface BackgroundOverlaysProps {
  animated: boolean;
}

interface AnimationStyle {
  animationDelay?: string;
}

interface GridPatternStyle {
  backgroundImage: string;
  backgroundSize: string;
  backgroundPosition: string;
}

interface DottedPatternStyle {
  backgroundImage: string;
  backgroundSize: string;
}

// ====================================================
// Helper Functions
// ====================================================

/**
 * Function: getGridPatternStyle
 * Description:
 * - Returns inline style object for grid pattern background
 * - Combines multiple radial gradients for layered effect
 *
 * Returns:
 * - GridPatternStyle: Style object with background properties
 */
const getGridPatternStyle = (): GridPatternStyle => {
  return {
    backgroundImage: `${GRID_GRADIENT_1}, ${GRID_GRADIENT_2}, ${GRID_GRADIENT_3}`,
    backgroundSize: GRID_BACKGROUND_SIZE,
    backgroundPosition: GRID_BACKGROUND_POSITION,
  };
};

/**
 * Function: getDottedPatternStyle
 * Description:
 * - Returns inline style object for dotted pattern background
 * - Creates uniform dot pattern overlay
 *
 * Returns:
 * - DottedPatternStyle: Style object with background properties
 */
const getDottedPatternStyle = (): DottedPatternStyle => {
  return {
    backgroundImage: DOTTED_PATTERN_IMAGE,
    backgroundSize: DOTTED_PATTERN_SIZE,
  };
};

/**
 * Function: getAnimationStyle
 * Description:
 * - Returns inline style object for element animation
 * - Only returns style if animated is true and delay is provided
 *
 * Parameters:
 * - animated (boolean): Whether animation is enabled
 * - delay (string, optional): Animation delay in seconds
 *
 * Returns:
 * - AnimationStyle: Style object with animation delay or empty object
 */
const getAnimationStyle = (animated: boolean, delay?: string): AnimationStyle => {
  if (!animated || !delay) return {};
  return { animationDelay: delay };
};

// ====================================================
// Core Logic
// ====================================================

/**
 * Component: BackgroundOverlays
 * Description:
 * - Renders multiple overlay layers for background decoration
 * - Includes grid pattern, dotted pattern, floating lines, and floating dots
 * - Supports animation toggle via animated prop
 *
 * Parameters:
 * - animated (boolean): Whether floating elements should animate
 *
 * Returns:
 * - React.ReactElement: Fragment containing all overlay elements
 *
 * Example:
 * ```tsx
 * <BackgroundOverlays animated={true} />
 * ```
 */
export const BackgroundOverlays: React.FC<BackgroundOverlaysProps> = ({ animated }) => {
  return (
    <>
      <div className={GRID_PATTERN_CONTAINER_CLASSES}>
        <div className={GRID_PATTERN_INNER_CLASSES} style={getGridPatternStyle()}></div>
      </div>

      <div className={DOTTED_PATTERN_CONTAINER_CLASSES}>
        <div className={DOTTED_PATTERN_INNER_CLASSES} style={getDottedPatternStyle()}></div>
      </div>

      <div className={FLOATING_CONTAINER_CLASSES}>
        <div
          className={`absolute ${LINE_1_POSITION_CLASSES} ${LINE_1_SIZE_CLASSES} ${LINE_1_GRADIENT_CLASSES} ${LINE_1_TRANSFORM_CLASSES} ${animated ? ANIMATION_PULSE : ''}`}
          style={getAnimationStyle(animated, LINE_1_ANIMATION_DELAY)}
        ></div>
        <div
          className={`absolute ${LINE_2_POSITION_CLASSES} ${LINE_2_SIZE_CLASSES} ${LINE_2_GRADIENT_CLASSES} ${LINE_2_TRANSFORM_CLASSES} ${animated ? ANIMATION_PULSE : ''}`}
          style={getAnimationStyle(animated, LINE_2_ANIMATION_DELAY)}
        ></div>
        <div
          className={`absolute ${LINE_3_POSITION_CLASSES} ${LINE_3_SIZE_CLASSES} ${LINE_3_GRADIENT_CLASSES} ${LINE_3_TRANSFORM_CLASSES} ${animated ? ANIMATION_PULSE : ''}`}
          style={getAnimationStyle(animated, LINE_3_ANIMATION_DELAY)}
        ></div>

        <div
          className={`absolute ${DOT_1_POSITION_CLASSES} ${DOT_1_SIZE_CLASSES} ${DOT_1_COLOR_CLASSES} ${animated ? ANIMATION_BOUNCE : ''}`}
          style={getAnimationStyle(animated, DOT_1_ANIMATION_DELAY)}
        ></div>
        <div
          className={`absolute ${DOT_2_POSITION_CLASSES} ${DOT_2_SIZE_CLASSES} ${DOT_2_COLOR_CLASSES} ${animated ? ANIMATION_BOUNCE : ''}`}
          style={getAnimationStyle(animated, DOT_2_ANIMATION_DELAY)}
        ></div>
        <div
          className={`absolute ${DOT_3_POSITION_CLASSES} ${DOT_3_SIZE_CLASSES} ${DOT_3_COLOR_CLASSES} ${animated ? ANIMATION_BOUNCE : ''}`}
          style={getAnimationStyle(animated, DOT_3_ANIMATION_DELAY)}
        ></div>
      </div>
    </>
  );
};
