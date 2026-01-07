// ====================================================
// File Name   : button.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-08-20
// Last Update : 2025-08-29
//
// Description:
// - Button component with variant and size support
// - Provides multiple visual variants and sizes
// - Supports loading state with spinner
// - Uses class-variance-authority for variant management
// - Supports asChild prop for composition with Radix UI
//
// Notes:
// - Server and client compatible (no 'use client' directive)
// - Uses Radix UI Slot for composition pattern
// - Integrates with Lucide React icons
// ====================================================

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';

const BASE_CLASSES =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0';

const DEFAULT_VARIANT = 'default';
const DEFAULT_SIZE = 'default';
const DEFAULT_AS_CHILD = false;
const DEFAULT_LOADING = false;

const LOADER_ICON_CLASSES = 'mr-2 h-4 w-4 animate-spin';

const buttonVariants = cva(BASE_CLASSES, {
  variants: {
    variant: {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      link: 'text-primary underline-offset-4 hover:underline',
      gradient:
        'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5',
      shine:
        'relative overflow-hidden bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent',
      gradient2:
        'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl',
    },
    size: {
      default: 'h-10 px-4 py-2',
      sm: 'h-9 rounded-md px-3',
      lg: 'h-11 rounded-md px-8',
      tall: 'h-12 px-6 py-3',
      icon: 'h-10 w-10',
    },
  },
  defaultVariants: {
    variant: DEFAULT_VARIANT,
    size: DEFAULT_SIZE,
  },
});

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

/**
 * Component: Button
 * Description:
 * - Button component with variant and size support
 * - Provides multiple visual variants (default, destructive, outline, etc.)
 * - Supports multiple sizes (default, sm, lg, tall, icon)
 * - Includes loading state with spinner icon
 * - Supports asChild prop for composition with Radix UI components
 * - Uses class-variance-authority for variant management
 *
 * Parameters:
 * - className (string, optional): Additional CSS classes
 * - variant ('default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'gradient' | 'shine' | 'gradient2', optional): Button variant
 * - size ('default' | 'sm' | 'lg' | 'tall' | 'icon', optional): Button size
 * - asChild (boolean, optional): Render as child component using Radix UI Slot
 * - loading (boolean, optional): Show loading spinner
 * - disabled (boolean, optional): Disable button interaction
 * - children (React.ReactNode): Button content
 * - ...props (React.ButtonHTMLAttributes<HTMLButtonElement>): Additional button attributes
 *
 * Returns:
 * - React.ReactElement: The button component
 *
 * Example:
 * ```tsx
 * <Button variant="primary" size="lg" loading={isLoading}>
 *   Submit
 * </Button>
 * ```
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = DEFAULT_AS_CHILD,
      loading = DEFAULT_LOADING,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className={LOADER_ICON_CLASSES} />}
        {children}
      </Comp>
    );
  },
);

Button.displayName = 'Button';

export { Button, buttonVariants };
