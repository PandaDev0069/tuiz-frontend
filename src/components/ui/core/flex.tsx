// ====================================================
// File Name   : flex.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-08-20
// Last Update : 2025-08-21
//
// Description:
// - Flex component with variant support
// - Provides flexible layout with direction, justify, align, wrap, and gap variants
// - Uses class-variance-authority for variant management
//
// Notes:
// - Server and client compatible (no 'use client' directive)
// - Supports all flexbox properties via variants
// ====================================================

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const BASE_CLASSES = 'flex';

const DEFAULT_DIRECTION = 'row';
const DEFAULT_JUSTIFY = 'start';
const DEFAULT_ALIGN = 'start';
const DEFAULT_WRAP = 'nowrap';
const DEFAULT_GAP = 0;

const flexVariants = cva(BASE_CLASSES, {
  variants: {
    direction: {
      row: 'flex-row',
      'row-reverse': 'flex-row-reverse',
      col: 'flex-col',
      'col-reverse': 'flex-col-reverse',
    },
    justify: {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly',
    },
    align: {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
      baseline: 'items-baseline',
    },
    wrap: {
      nowrap: 'flex-nowrap',
      wrap: 'flex-wrap',
      'wrap-reverse': 'flex-wrap-reverse',
    },
    gap: {
      0: 'gap-0',
      1: 'gap-1',
      2: 'gap-2',
      3: 'gap-3',
      4: 'gap-4',
      5: 'gap-5',
      6: 'gap-6',
      8: 'gap-8',
    },
  },
  defaultVariants: {
    direction: DEFAULT_DIRECTION,
    justify: DEFAULT_JUSTIFY,
    align: DEFAULT_ALIGN,
    wrap: DEFAULT_WRAP,
    gap: DEFAULT_GAP,
  },
});

export interface FlexProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof flexVariants> {}

/**
 * Component: Flex
 * Description:
 * - Flexible layout component with variant support
 * - Provides flexbox layout with customizable direction, justify, align, wrap, and gap
 * - Uses class-variance-authority for variant management
 * - Supports all standard flexbox properties via variants
 *
 * Parameters:
 * - className (string, optional): Additional CSS classes
 * - direction ('row' | 'row-reverse' | 'col' | 'col-reverse', optional): Flex direction
 * - justify ('start' | 'center' | 'end' | 'between' | 'around' | 'evenly', optional): Justify content
 * - align ('start' | 'center' | 'end' | 'stretch' | 'baseline', optional): Align items
 * - wrap ('nowrap' | 'wrap' | 'wrap-reverse', optional): Flex wrap
 * - gap (0 | 1 | 2 | 3 | 4 | 5 | 6 | 8, optional): Gap between items
 * - ...props (React.HTMLAttributes<HTMLDivElement>): Additional div attributes
 *
 * Returns:
 * - React.ReactElement: The flex component
 *
 * Example:
 * ```tsx
 * <Flex direction="col" justify="center" align="center" gap={4}>
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 * </Flex>
 * ```
 */
const Flex = React.forwardRef<HTMLDivElement, FlexProps>(
  ({ className, direction, justify, align, wrap, gap, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(flexVariants({ direction, justify, align, wrap, gap }), className)}
        {...props}
      />
    );
  },
);

Flex.displayName = 'Flex';

export { Flex, flexVariants };
