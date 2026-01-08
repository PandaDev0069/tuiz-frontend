// ====================================================
// File Name   : WavePatterns.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-10-01
// Last Update : 2025-10-01
//
// Description:
// - Wave patterns component for quiz backgrounds
// - Renders gradient wave overlays at different positions
// - Creates visual depth with layered gradient effects
//
// Notes:
// - Client component (uses React hooks if needed)
// - Uses Tailwind CSS for gradient styling
// - Static component (no animation support)
// ====================================================

import React from 'react';

// ====================================================
// Constants
// ====================================================

const WAVE_1_POSITION_CLASSES = 'absolute bottom-0 left-0 right-0';
const WAVE_1_SIZE_CLASSES = 'h-20';
const WAVE_1_GRADIENT_CLASSES = 'bg-gradient-to-t from-cyan-200/20 via-cyan-100/10 to-transparent';

const WAVE_2_POSITION_CLASSES = 'absolute top-0 left-0 right-0';
const WAVE_2_SIZE_CLASSES = 'h-20';
const WAVE_2_GRADIENT_CLASSES =
  'bg-gradient-to-b from-purple-200/20 via-purple-100/10 to-transparent';

const WAVE_3_POSITION_CLASSES = 'absolute top-1/2 left-0 right-0';
const WAVE_3_SIZE_CLASSES = 'h-16';
const WAVE_3_GRADIENT_CLASSES = 'bg-gradient-to-r from-transparent via-blue-100/15 to-transparent';

// ====================================================
// Core Logic
// ====================================================

/**
 * Component: WavePatterns
 * Description:
 * - Renders gradient wave overlays for background decoration
 * - Creates visual depth with layered gradient effects at different positions
 * - Static component with no animation support
 *
 * Returns:
 * - React.ReactElement: Fragment containing all wave gradient elements
 *
 * Example:
 * ```tsx
 * <WavePatterns />
 * ```
 */
export const WavePatterns: React.FC = () => {
  return (
    <>
      <div
        className={`${WAVE_1_POSITION_CLASSES} ${WAVE_1_SIZE_CLASSES} ${WAVE_1_GRADIENT_CLASSES}`}
      ></div>
      <div
        className={`${WAVE_2_POSITION_CLASSES} ${WAVE_2_SIZE_CLASSES} ${WAVE_2_GRADIENT_CLASSES}`}
      ></div>
      <div
        className={`${WAVE_3_POSITION_CLASSES} ${WAVE_3_SIZE_CLASSES} ${WAVE_3_GRADIENT_CLASSES}`}
      ></div>
    </>
  );
};
