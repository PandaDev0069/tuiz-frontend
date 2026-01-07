// ====================================================
// File Name   : scroll-area.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-08-20
// Last Update : 2025-08-21
//
// Description:
// - Scroll area component with customizable scrollbar variants
// - Scroll indicator component for visual scroll feedback
// - Supports vertical, horizontal, and both orientations
// - Provides visual indicators for scroll position
//
// Notes:
// - Server and client compatible (no 'use client' directive)
// - Uses forwardRef for ref forwarding
// - ScrollIndicator uses React hooks for scroll tracking
// ====================================================

import * as React from 'react';
import { cn } from '@/lib/utils';

const DEFAULT_VARIANT = 'default';
const DEFAULT_ORIENTATION = 'vertical';

const BASE_CLASSES = 'relative';

const SCROLL_AREA_DISPLAY_NAME = 'ScrollArea';

const PERCENTAGE_MULTIPLIER = 100;

const scrollClasses = {
  default: '',
  thin: 'scrollbar-thin',
  hidden: 'scrollbar-hidden',
} as const;

const orientationClasses = {
  vertical: 'overflow-y-auto overflow-x-hidden',
  horizontal: 'overflow-x-auto overflow-y-hidden',
  both: 'overflow-auto',
} as const;

const VERTICAL_INDICATOR_CLASSES = 'fixed right-2 top-0 h-full w-1 bg-white/20 rounded-full';
const VERTICAL_INDICATOR_FILL_CLASSES =
  'w-full bg-gradient-to-b from-[#6fd6ff] to-[#bff098] rounded-full transition-all duration-300';
const HORIZONTAL_INDICATOR_CLASSES = 'fixed bottom-2 left-0 w-full h-1 bg-white/20 rounded-full';
const HORIZONTAL_INDICATOR_FILL_CLASSES =
  'h-full bg-gradient-to-r from-[#6fd6ff] to-[#bff098] rounded-full transition-all duration-300';

export interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'thin' | 'hidden';
  orientation?: 'vertical' | 'horizontal' | 'both';
  children: React.ReactNode;
}

export interface ScrollIndicatorProps {
  target: React.RefObject<HTMLElement | null>;
  orientation?: 'vertical' | 'horizontal';
  className?: string;
}

/**
 * Function: calculateScrollPercentage
 * Description:
 * - Calculates scroll percentage based on orientation
 * - Handles both vertical and horizontal scroll calculations
 * - Returns 0 if scrollable area is 0 or invalid
 *
 * Parameters:
 * - element (HTMLElement): The scrollable element
 * - orientation ('vertical' | 'horizontal'): Scroll orientation
 *
 * Returns:
 * - number: Scroll percentage (0-100)
 *
 * Example:
 * ```ts
 * const percentage = calculateScrollPercentage(element, 'vertical');
 * // Returns 0-100 based on scroll position
 * ```
 */
const calculateScrollPercentage = (
  element: HTMLElement,
  orientation: 'vertical' | 'horizontal',
): number => {
  if (orientation === 'vertical') {
    const scrollTop = element.scrollTop;
    const scrollHeight = element.scrollHeight - element.clientHeight;
    return scrollHeight > 0 ? (scrollTop / scrollHeight) * PERCENTAGE_MULTIPLIER : 0;
  }
  const scrollLeft = element.scrollLeft;
  const scrollWidth = element.scrollWidth - element.clientWidth;
  return scrollWidth > 0 ? (scrollLeft / scrollWidth) * PERCENTAGE_MULTIPLIER : 0;
};

/**
 * Component: ScrollArea
 * Description:
 * - Scrollable container component with customizable scrollbar styles
 * - Supports multiple scrollbar variants (default, thin, hidden)
 * - Supports vertical, horizontal, and both orientations
 * - Uses forwardRef for ref forwarding
 *
 * Parameters:
 * - className (string, optional): Additional CSS classes
 * - variant ('default' | 'thin' | 'hidden', optional): Scrollbar variant (default: 'default')
 * - orientation ('vertical' | 'horizontal' | 'both', optional): Scroll orientation (default: 'vertical')
 * - children (ReactNode): Content to display inside scroll area
 * - ...props (HTMLDivElement attributes): Additional HTML div attributes
 *
 * Returns:
 * - React.ReactElement: The scroll area component
 *
 * Example:
 * ```tsx
 * <ScrollArea variant="thin" orientation="vertical">
 *   <div>Long content here</div>
 * </ScrollArea>
 * ```
 */
const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  (
    { className, variant = DEFAULT_VARIANT, orientation = DEFAULT_ORIENTATION, children, ...props },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          BASE_CLASSES,
          orientationClasses[orientation],
          scrollClasses[variant],
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

ScrollArea.displayName = SCROLL_AREA_DISPLAY_NAME;

/**
 * Component: ScrollIndicator
 * Description:
 * - Visual indicator component showing scroll position
 * - Displays as a gradient bar (vertical or horizontal)
 * - Updates in real-time as user scrolls
 * - Uses React hooks for scroll tracking
 *
 * Parameters:
 * - target (React.RefObject<HTMLElement | null>): Ref to the scrollable element
 * - orientation ('vertical' | 'horizontal', optional): Indicator orientation (default: 'vertical')
 * - className (string, optional): Additional CSS classes
 *
 * Returns:
 * - React.ReactElement: The scroll indicator component
 *
 * Example:
 * ```tsx
 * const scrollRef = useRef<HTMLDivElement>(null);
 * <ScrollArea ref={scrollRef}>
 *   <div>Content</div>
 * </ScrollArea>
 * <ScrollIndicator target={scrollRef} orientation="vertical" />
 * ```
 */
const ScrollIndicator: React.FC<ScrollIndicatorProps> = ({
  target,
  orientation = DEFAULT_ORIENTATION,
  className,
}) => {
  const [scrollPercentage, setScrollPercentage] = React.useState(0);

  React.useEffect(() => {
    const element = target.current;
    if (!element) return;

    const handleScroll = (): void => {
      const percentage = calculateScrollPercentage(element, orientation);
      setScrollPercentage(percentage);
    };

    element.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => {
      element.removeEventListener('scroll', handleScroll);
    };
  }, [target, orientation]);

  if (orientation === 'vertical') {
    return (
      <div className={cn(VERTICAL_INDICATOR_CLASSES, className)}>
        <div
          className={VERTICAL_INDICATOR_FILL_CLASSES}
          style={{ height: `${scrollPercentage}%` }}
        />
      </div>
    );
  }

  return (
    <div className={cn(HORIZONTAL_INDICATOR_CLASSES, className)}>
      <div
        className={HORIZONTAL_INDICATOR_FILL_CLASSES}
        style={{ width: `${scrollPercentage}%` }}
      />
    </div>
  );
};

export { ScrollArea, ScrollIndicator };
