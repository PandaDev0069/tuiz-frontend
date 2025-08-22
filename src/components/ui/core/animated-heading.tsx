'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { useAnimation } from '@/app/AnimationController';

const animatedHeadingVariants = cva('font-black gradient-text tracking-tight leading-tight', {
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
    size: '2xl',
    animation: 'float',
  },
});

export interface AnimatedHeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof animatedHeadingVariants> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  children: React.ReactNode;
}

const AnimatedHeading = React.forwardRef<HTMLHeadingElement, AnimatedHeadingProps>(
  ({ className, size, animation, as: Component = 'h1', children, ...props }, ref) => {
    const { duration, easing, scale } = useAnimation();

    // For float animation, let it use the pure Tailwind CSS behavior
    // This ensures consistency with direct animate-float usage
    let style: React.CSSProperties = {};

    if (animation !== 'float') {
      // Only apply custom timing for non-float animations
      let headingDuration: number;

      if (animation === 'glow' || animation === 'shimmer') {
        // Continuous animations use the full duration
        headingDuration = duration * scale;
      } else if (animation === 'pulse') {
        // Pulse should be slightly faster
        headingDuration = duration * scale * 0.6;
      } else {
        // One-time or entrance animations are faster
        headingDuration = Math.max(800, duration * scale * 0.4);
      }

      style = {
        '--heading-animation-duration': `${headingDuration}ms`,
        '--heading-animation-easing': easing,
      } as React.CSSProperties;
    }

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
