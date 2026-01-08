// ====================================================
// File Name   : GeometricPatterns.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-10-01
// Last Update : 2025-10-01
//
// Description:
// - Geometric patterns component for quiz backgrounds
// - Composes multiple geometric shape components (squares, triangles, diamonds)
// - Supports animation toggle via animated prop
//
// Notes:
// - Client component (uses React hooks if needed)
// - Composed of RotatingSquares, TrianglePatterns, and DiamondPatterns sub-components
// - Container uses absolute positioning with opacity overlay
// ====================================================

import React from 'react';
import { RotatingSquares, TrianglePatterns, DiamondPatterns } from './patterns';

// ====================================================
// Constants
// ====================================================

const CONTAINER_CLASSES = 'absolute inset-0 opacity-20';

// ====================================================
// Types
// ====================================================

interface GeometricPatternsProps {
  animated: boolean;
}

// ====================================================
// Core Logic
// ====================================================

/**
 * Component: GeometricPatterns
 * Description:
 * - Renders geometric shapes like squares, triangles, and diamonds
 * - Composed of RotatingSquares, TrianglePatterns, and DiamondPatterns sub-components
 * - All patterns share the same animation state
 *
 * Parameters:
 * - animated (boolean): Whether patterns should animate
 *
 * Returns:
 * - React.ReactElement: Container div with all geometric pattern components
 *
 * Example:
 * ```tsx
 * <GeometricPatterns animated={true} />
 * ```
 */
export const GeometricPatterns: React.FC<GeometricPatternsProps> = ({ animated }) => {
  return (
    <div className={CONTAINER_CLASSES}>
      <RotatingSquares animated={animated} />
      <TrianglePatterns animated={animated} />
      <DiamondPatterns animated={animated} />
    </div>
  );
};
