// ====================================================
// File Name   : animated-heading.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-08-21
// Last Update : 2025-08-21
//
// Description:
// - Animated heading component with variant support
// - Provides multiple size and animation variants
// - Integrates with animation controller for timing
// - Uses class-variance-authority for variant management
//
// Notes:
// - Client-only component (requires 'use client')
// - Supports custom animation timing via CSS variables
// - Float animation uses pure Tailwind CSS behavior
// ====================================================

'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { useAnimation } from '@/app/AnimationController';

const BASE_CLASSES = 'font-black gradient-text tracking-tight leading-tight';

const DEFAULT_SIZE = '2xl';
const DEFAULT_ANIMATION = 'float';
const DEFAULT_COMPONENT = 'h1';

const PULSE_DURATION_MULTIPLIER = 0.6;
const ENTRANCE_DURATION_MULTIPLIER = 0.4;
const MIN_ENTRANCE_DURATION_MS = 800;

const CSS_VAR_ANIMATION_DURATION = '--heading-animation-duration';
const CSS_VAR_ANIMATION_EASING = '--heading-animation-easing';

const animatedHeadingVariants = cva(BASE_CLASSES, {
  variants: {
    size: {
      sm: 'text-2xl',
      md: 'text-3xl',
      lg: 'text-4xl',
      xl: 'text-5xl',
      '2xl': 'text-6xl',
    },
    animation: {
      none: '',
      float: 'animate-float',
      glow: 'animate-glow',
      pulse: 'animate-pulse',
      shimmer: 'animate-shimmer',
    },
  },
  defaultVariants: {
    size: DEFAULT_SIZE,
    animation: DEFAULT_ANIMATION,
  },
});

export interface AnimatedHeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof animatedHeadingVariants> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  children: React.ReactNode;
}

/**
 * Function: calculateAnimationDuration
 * Description:
 * - Calculates animation duration based on animation type
 * - Applies different multipliers for different animation types
 * - Ensures minimum duration for entrance animations
 *
 * Parameters:
 * - animation (string | null | undefined): Animation type
 * - duration (number): Base animation duration
 * - scale (number): Animation scale multiplier
 *
 * Returns:
 * - number: Calculated animation duration in milliseconds
 *
 * Example:
 * ```ts
 * const duration = calculateAnimationDuration('pulse', 1000, 1.0);
 * // Returns 600ms
 * ```
 */
const calculateAnimationDuration = (
  animation: string | null | undefined,
  duration: number,
  scale: number,
): number => {
  if (animation === 'glow' || animation === 'shimmer') {
    return duration * scale;
  }

  if (animation === 'pulse') {
    return duration * scale * PULSE_DURATION_MULTIPLIER;
  }

  return Math.max(MIN_ENTRANCE_DURATION_MS, duration * scale * ENTRANCE_DURATION_MULTIPLIER);
};

/**
 * Function: getAnimationStyle
 * Description:
 * - Generates CSS custom properties for animation timing
 * - Returns empty object for float animation (uses Tailwind CSS)
 * - Applies custom duration and easing for other animations
 *
 * Parameters:
 * - animation (string | null | undefined): Animation type
 * - duration (number): Base animation duration
 * - scale (number): Animation scale multiplier
 * - easing (string): Animation easing function
 *
 * Returns:
 * - React.CSSProperties: CSS properties object with custom variables
 *
 * Example:
 * ```ts
 * const style = getAnimationStyle('glow', 1000, 1.0, 'ease-in-out');
 * // Returns { '--heading-animation-duration': '1000ms', '--heading-animation-easing': 'ease-in-out' }
 * ```
 */
const getAnimationStyle = (
  animation: string | null | undefined,
  duration: number,
  scale: number,
  easing: string,
): React.CSSProperties => {
  if (animation === 'float') {
    return {};
  }

  const headingDuration = calculateAnimationDuration(animation, duration, scale);

  return {
    [CSS_VAR_ANIMATION_DURATION]: `${headingDuration}ms`,
    [CSS_VAR_ANIMATION_EASING]: easing,
  } as React.CSSProperties;
};

/**
 * Component: AnimatedHeading
 * Description:
 * - Animated heading component with size and animation variants
 * - Supports multiple heading levels (h1-h6)
 * - Integrates with animation controller for customizable timing
 * - Uses class-variance-authority for variant management
 * - Applies CSS custom properties for animation control
 *
 * Parameters:
 * - className (string, optional): Additional CSS classes
 * - size ('sm' | 'md' | 'lg' | 'xl' | '2xl', optional): Heading size variant
 * - animation ('none' | 'float' | 'glow' | 'pulse' | 'shimmer', optional): Animation variant
 * - as ('h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6', optional): HTML heading element type
 * - children (React.ReactNode): Heading content
 * - ...props (React.HTMLAttributes<HTMLHeadingElement>): Additional HTML attributes
 *
 * Returns:
 * - React.ReactElement: The animated heading component
 *
 * Example:
 * ```tsx
 * <AnimatedHeading size="xl" animation="glow" as="h1">
 *   Welcome to TUIZ
 * </AnimatedHeading>
 * ```
 */
const AnimatedHeading = React.forwardRef<HTMLHeadingElement, AnimatedHeadingProps>(
  ({ className, size, animation, as: Component = DEFAULT_COMPONENT, children, ...props }, ref) => {
    const { duration, easing, scale } = useAnimation();
    const style = getAnimationStyle(animation, duration, scale, easing);

    return (
      <Component
        ref={ref}
        className={cn(animatedHeadingVariants({ size, animation }), className)}
        style={style}
        {...props}
      >
        {children}
      </Component>
    );
  },
);

AnimatedHeading.displayName = 'AnimatedHeading';

export { AnimatedHeading, animatedHeadingVariants };
