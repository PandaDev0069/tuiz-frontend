// ====================================================
// File Name   : form-error.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-08-21
// Last Update : 2025-08-21
//
// Description:
// - Form error component for displaying error messages
// - Supports multiple variants (default, destructive, warning)
// - Supports multiple sizes (default, sm, lg)
// - Optional icon display
// - Uses class-variance-authority for variant management
//
// Notes:
// - Server and client compatible (no 'use client' directive)
// - Uses forwardRef for ref forwarding
// - Returns null if no content is provided
// ====================================================

import * as React from 'react';
import { AlertCircle } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const BASE_CLASSES = 'flex items-center gap-2 text-sm font-medium';

const DEFAULT_SHOW_ICON = true;
const ICON_CLASSES = 'h-4 w-4 flex-shrink-0';
const DISPLAY_NAME = 'FormError';
const ROLE_ALERT = 'alert';

const formErrorVariants = cva(BASE_CLASSES, {
  variants: {
    variant: {
      default: 'text-red-600',
      destructive: 'text-destructive',
      warning: 'text-amber-600',
    },
    size: {
      default: 'text-sm',
      sm: 'text-xs',
      lg: 'text-base',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

export interface FormErrorProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof formErrorVariants> {
  message?: string;
  showIcon?: boolean;
}

/**
 * Component: FormError
 * Description:
 * - Displays form error messages with optional icon
 * - Supports multiple visual variants and sizes
 * - Uses forwardRef for ref forwarding
 * - Returns null if no message or children are provided
 *
 * Parameters:
 * - className (string, optional): Additional CSS classes
 * - variant ('default' | 'destructive' | 'warning', optional): Visual variant (default: 'default')
 * - size ('default' | 'sm' | 'lg', optional): Size variant (default: 'default')
 * - message (string, optional): Error message text
 * - showIcon (boolean, optional): Whether to show error icon (default: true)
 * - children (ReactNode, optional): Alternative content to display
 * - ...props (HTMLDivElement attributes): Additional HTML div attributes
 *
 * Returns:
 * - React.ReactElement | null: The form error component or null if no content
 *
 * Example:
 * ```tsx
 * <FormError message="This field is required" variant="destructive" />
 * <FormError variant="warning" size="sm">Custom error message</FormError>
 * ```
 */
const FormError = React.forwardRef<HTMLDivElement, FormErrorProps>(
  (
    { className, variant, size, message, showIcon = DEFAULT_SHOW_ICON, children, ...props },
    ref,
  ) => {
    const content = message || children;

    if (!content) return null;

    return (
      <div
        ref={ref}
        className={cn(formErrorVariants({ variant, size }), className)}
        role={ROLE_ALERT}
        {...props}
      >
        {showIcon && <AlertCircle className={ICON_CLASSES} />}
        <span>{content}</span>
      </div>
    );
  },
);

FormError.displayName = DISPLAY_NAME;

export { FormError, formErrorVariants };
