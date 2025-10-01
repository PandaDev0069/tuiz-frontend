import React from 'react';
import { RotatingSquares, TrianglePatterns, DiamondPatterns } from './patterns';

interface GeometricPatternsProps {
  animated: boolean;
}

/**
 * GeometricPatterns - Renders geometric shapes like squares, triangles, and diamonds
 * Composed of RotatingSquares, TrianglePatterns, and DiamondPatterns sub-components
 */
export const GeometricPatterns: React.FC<GeometricPatternsProps> = ({ animated }) => {
  return (
    <div className="absolute inset-0 opacity-20">
      <RotatingSquares animated={animated} />
      <TrianglePatterns animated={animated} />
      <DiamondPatterns animated={animated} />
    </div>
  );
};
