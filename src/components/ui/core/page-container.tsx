'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { useAnimation } from '@/app/AnimationController';

const pageContainerVariants = cva('', {
  variants: {
    entrance: {
      none: '',
      fadeIn: 'animate-page-fade-in',
      slideUp: 'animate-page-slide-up',
      scaleIn: 'animate-page-scale-in',
    },
  },
  defaultVariants: {
    entrance: 'fadeIn',
  },
});

export interface PageContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof pageContainerVariants> {
  children: React.ReactNode;
}

const PageContainer = React.forwardRef<HTMLDivElement, PageContainerProps>(
  ({ className, entrance, children, ...props }, ref) => {
    const { duration, easing } = useAnimation();

    // Page entrance animations should be faster than continuous animations
    // Use 1/3 of the base duration for entrance effects
    const entranceDuration = Math.max(800, duration * 0.33);

    const style = {
      '--page-animation-duration': `${entranceDuration}ms`,
      '--page-animation-easing': easing,
    } as React.CSSProperties;

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
