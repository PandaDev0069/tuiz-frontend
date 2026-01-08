// ====================================================
// File Name   : page-container.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-08-21
// Last Update : 2025-08-21
//
// Description:
// - Page container component with entrance animation support
// - Provides page-level container with fade, slide, and scale animations
// - Integrates with animation controller for customizable timing
// - Uses class-variance-authority for variant management
//
// Notes:
// - Client-only component (requires 'use client')
// - Applies CSS custom properties for animation control
// ====================================================

'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { useAnimation } from '@/app/AnimationController';

const BASE_CLASSES = '';

const DEFAULT_ENTRANCE = 'fadeIn';

const ENTRANCE_DURATION_MULTIPLIER = 0.33;
const MIN_ENTRANCE_DURATION_MS = 800;

const CSS_VAR_ANIMATION_DURATION = '--page-animation-duration';
const CSS_VAR_ANIMATION_EASING = '--page-animation-easing';

const pageContainerVariants = cva(BASE_CLASSES, {
  variants: {
    entrance: {
      none: '',
      fadeIn: 'animate-page-fade-in',
      slideUp: 'animate-page-slide-up',
      scaleIn: 'animate-page-scale-in',
    },
  },
  defaultVariants: {
    entrance: DEFAULT_ENTRANCE,
  },
});

export interface PageContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof pageContainerVariants> {
  children: React.ReactNode;
}

/**
 * Function: calculateEntranceDuration
 * Description:
 * - Calculates entrance animation duration
 * - Uses a fraction of base duration for faster entrance effects
 * - Ensures minimum duration for smooth animations
 *
 * Parameters:
 * - duration (number): Base animation duration
 *
 * Returns:
 * - number: Calculated entrance duration in milliseconds
 *
 * Example:
 * ```ts
 * const entranceDuration = calculateEntranceDuration(1000);
 * // Returns max(800, 330) = 800ms
 * ```
 */
const calculateEntranceDuration = (duration: number): number => {
  return Math.max(MIN_ENTRANCE_DURATION_MS, duration * ENTRANCE_DURATION_MULTIPLIER);
};

/**
 * Function: getAnimationStyle
 * Description:
 * - Generates CSS custom properties for page animation timing
 * - Applies custom duration and easing for entrance animations
 *
 * Parameters:
 * - duration (number): Base animation duration
 * - easing (string): Animation easing function
 *
 * Returns:
 * - React.CSSProperties: CSS properties object with custom variables
 *
 * Example:
 * ```ts
 * const style = getAnimationStyle(1000, 'ease-in-out');
 * // Returns { '--page-animation-duration': '800ms', '--page-animation-easing': 'ease-in-out' }
 * ```
 */
const getAnimationStyle = (duration: number, easing: string): React.CSSProperties => {
  const entranceDuration = calculateEntranceDuration(duration);

  return {
    [CSS_VAR_ANIMATION_DURATION]: `${entranceDuration}ms`,
    [CSS_VAR_ANIMATION_EASING]: easing,
  } as React.CSSProperties;
};

/**
 * Component: PageContainer
 * Description:
 * - Page container component with entrance animation support
 * - Provides page-level container with customizable entrance animations
 * - Supports fade, slide, and scale entrance effects
 * - Integrates with animation controller for customizable timing
 * - Uses class-variance-authority for variant management
 *
 * Parameters:
 * - className (string, optional): Additional CSS classes
 * - entrance ('none' | 'fadeIn' | 'slideUp' | 'scaleIn', optional): Entrance animation variant
 * - children (React.ReactNode): Container content
 * - ...props (React.HTMLAttributes<HTMLDivElement>): Additional div attributes
 *
 * Returns:
 * - React.ReactElement: The page container component
 *
 * Example:
 * ```tsx
 * <PageContainer entrance="fadeIn">
 *   <div>Page content</div>
 * </PageContainer>
 * ```
 */
const PageContainer = React.forwardRef<HTMLDivElement, PageContainerProps>(
  ({ className, entrance, children, ...props }, ref) => {
    const { duration, easing } = useAnimation();
    const style = getAnimationStyle(duration, easing);

    return (
      <div
        ref={ref}
        className={cn(pageContainerVariants({ entrance }), className)}
        style={style}
        {...props}
      >
        {children}
      </div>
    );
  },
);

PageContainer.displayName = 'PageContainer';

export { PageContainer, pageContainerVariants };
