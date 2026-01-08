// ====================================================
// File Name   : FloatingShapes.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-10-01
// Last Update : 2025-10-01
//
// Description:
// - Floating shapes component for quiz backgrounds
// - Composes multiple circle size components (large, medium, small)
// - Supports animation toggle via animated prop
//
// Notes:
// - Client component (uses React hooks if needed)
// - Composed of LargeCircles, MediumCircles, and SmallCircles sub-components
// - Container uses absolute positioning with overflow hidden
// ====================================================

import React from 'react';
import { LargeCircles, MediumCircles, SmallCircles } from './shapes';

// ====================================================
// Constants
// ====================================================

const CONTAINER_CLASSES = 'absolute inset-0 overflow-hidden';

// ====================================================
// Types
// ====================================================

interface FloatingShapesProps {
  animated: boolean;
}

// ====================================================
// Core Logic
// ====================================================

/**
 * Component: FloatingShapes
 * Description:
 * - Renders animated circular shapes in different sizes
 * - Composed of LargeCircles, MediumCircles, and SmallCircles sub-components
 * - All shapes share the same animation state
 *
 * Parameters:
 * - animated (boolean): Whether shapes should animate
 *
 * Returns:
 * - React.ReactElement: Container div with all circle components
 *
 * Example:
 * ```tsx
 * <FloatingShapes animated={true} />
 * ```
 */
export const FloatingShapes: React.FC<FloatingShapesProps> = ({ animated }) => {
  return (
    <div className={CONTAINER_CLASSES}>
      <LargeCircles animated={animated} />
      <MediumCircles animated={animated} />
      <SmallCircles animated={animated} />
    </div>
  );
};
