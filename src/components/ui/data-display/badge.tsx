// ====================================================
// File Name   : badge.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-08-20
// Last Update : 2025-08-29
//
// Description:
// - Badge component with variant and size support
// - Provides multiple visual variants (default, secondary, destructive, etc.)
// - Supports different sizes (sm, md, lg)
// - Uses class-variance-authority for variant management
//
// Notes:
// - Server and client compatible (no 'use client' directive)
// - All variants support className prop for customization
// ====================================================

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const BASE_CLASSES =
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors';

const DEFAULT_VARIANT = 'default';
const DEFAULT_SIZE = 'md';

const badgeVariants = cva(BASE_CLASSES, {
  variants: {
    variant: {
      default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
      secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
      destructive:
        'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
      success: 'border-transparent bg-green-500 text-white hover:bg-green-500/80',
      warning: 'border-transparent bg-yellow-500 text-yellow-900 hover:bg-yellow-500/80',
      outline: 'text-foreground',
      ghost: 'border-transparent bg-transparent text-foreground hover:bg-accent',
    },
    size: {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-0.5 text-xs',
      lg: 'px-3 py-1 text-sm',
    },
  },
  defaultVariants: {
    variant: DEFAULT_VARIANT,
    size: DEFAULT_SIZE,
  },
});

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

/**
 * Component: Badge
 * Description:
 * - Badge component with variant and size support
 * - Provides multiple visual variants (default, secondary, destructive, success, warning, outline, ghost)
 * - Supports different sizes (sm, md, lg)
 * - Uses class-variance-authority for variant management
 *
 * Parameters:
 * - className (string, optional): Additional CSS classes
 * - variant ('default' | 'secondary' | 'destructive' | 'success' | 'warning' | 'outline' | 'ghost', optional): Badge variant
 * - size ('sm' | 'md' | 'lg', optional): Badge size (default: 'md')
 * - ...props (React.HTMLAttributes<HTMLDivElement>): Additional div attributes
 *
 * Returns:
 * - React.ReactElement: The badge component
 *
 * Example:
 * ```tsx
 * <Badge variant="success" size="lg">
 *   New
 * </Badge>
 * ```
 */
const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, ...props }, ref) => {
    return <div ref={ref} className={cn(badgeVariants({ variant, size }), className)} {...props} />;
  },
);

Badge.displayName = 'Badge';

export { Badge, badgeVariants };
