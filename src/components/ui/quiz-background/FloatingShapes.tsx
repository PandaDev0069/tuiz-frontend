import React from 'react';
import { LargeCircles, MediumCircles, SmallCircles } from './shapes';

interface FloatingShapesProps {
  animated: boolean;
}

/**
 * FloatingShapes - Renders animated circular shapes in different sizes
 * Composed of LargeCircles, MediumCircles, and SmallCircles sub-components
 */
export const FloatingShapes: React.FC<FloatingShapesProps> = ({ animated }) => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <LargeCircles animated={animated} />
      <MediumCircles animated={animated} />
      <SmallCircles animated={animated} />
    </div>
  );
};
