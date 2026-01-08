// ====================================================
// File Name   : form-success.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-08-21
// Last Update : 2025-08-21
//
// Description:
// - Form success component for displaying success messages
// - Supports multiple variants (default, success, primary)
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
import { CheckCircle } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const BASE_CLASSES = 'flex items-center gap-2 text-sm font-medium';

const DEFAULT_SHOW_ICON = true;
const ICON_CLASSES = 'h-4 w-4 flex-shrink-0';
const DISPLAY_NAME = 'FormSuccess';
const ROLE_STATUS = 'status';

const formSuccessVariants = cva(BASE_CLASSES, {
  variants: {
    variant: {
      default: 'text-green-600',
      success: 'text-emerald-600',
      primary: 'text-blue-600',
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

export interface FormSuccessProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof formSuccessVariants> {
  message?: string;
  showIcon?: boolean;
}

/**
 * Component: FormSuccess
 * Description:
 * - Displays form success messages with optional icon
 * - Supports multiple visual variants and sizes
 * - Uses forwardRef for ref forwarding
 * - Returns null if no message or children are provided
 *
 * Parameters:
 * - className (string, optional): Additional CSS classes
 * - variant ('default' | 'success' | 'primary', optional): Visual variant (default: 'default')
 * - size ('default' | 'sm' | 'lg', optional): Size variant (default: 'default')
 * - message (string, optional): Success message text
 * - showIcon (boolean, optional): Whether to show success icon (default: true)
 * - children (ReactNode, optional): Alternative content to display
 * - ...props (HTMLDivElement attributes): Additional HTML div attributes
 *
 * Returns:
 * - React.ReactElement | null: The form success component or null if no content
 *
 * Example:
 * ```tsx
 * <FormSuccess message="Form submitted successfully" variant="success" />
 * <FormSuccess variant="primary" size="sm">Custom success message</FormSuccess>
 * ```
 */
const FormSuccess = React.forwardRef<HTMLDivElement, FormSuccessProps>(
  (
    { className, variant, size, message, showIcon = DEFAULT_SHOW_ICON, children, ...props },
    ref,
  ) => {
    const content = message || children;

    if (!content) return null;

    return (
      <div
        ref={ref}
        className={cn(formSuccessVariants({ variant, size }), className)}
        role={ROLE_STATUS}
        {...props}
      >
        {showIcon && <CheckCircle className={ICON_CLASSES} />}
        <span>{content}</span>
      </div>
    );
  },
);

FormSuccess.displayName = DISPLAY_NAME;

export { FormSuccess, formSuccessVariants };
