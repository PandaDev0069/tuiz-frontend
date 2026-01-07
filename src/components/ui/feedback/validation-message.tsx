// ====================================================
// File Name   : validation-message.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-08-21
// Last Update : 2025-08-21
//
// Description:
// - Validation message component for form field validation feedback
// - Supports multiple variants (error, success, warning, info, muted)
// - Supports multiple sizes (default, sm, base)
// - Optional icon display with default icons per variant
// - Uses class-variance-authority for variant management
//
// Notes:
// - Server and client compatible (no 'use client' directive)
// - Uses forwardRef for ref forwarding
// - Returns null if no content is provided
// - Accessible with ARIA roles (alert for error, status for others)
// ====================================================

import * as React from 'react';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const BASE_CLASSES = 'flex items-start gap-2 text-xs mt-1';

const DEFAULT_SHOW_ICON = true;
const ICON_CLASSES = 'h-3 w-3 flex-shrink-0 mt-0.5';
const TEXT_CLASSES = 'leading-tight';
const DISPLAY_NAME = 'ValidationMessage';

const ROLE_ALERT = 'alert';
const ROLE_STATUS = 'status';

const validationMessageVariants = cva(BASE_CLASSES, {
  variants: {
    variant: {
      error: 'text-red-600',
      success: 'text-green-600',
      warning: 'text-amber-600',
      info: 'text-blue-600',
      muted: 'text-gray-500',
    },
    size: {
      default: 'text-xs',
      sm: 'text-[10px]',
      base: 'text-sm',
    },
  },
  defaultVariants: {
    variant: 'error',
    size: 'default',
  },
});

export interface ValidationMessageProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof validationMessageVariants> {
  message?: string;
  showIcon?: boolean;
  icon?: React.ReactNode;
}

/**
 * Function: getDefaultIcon
 * Description:
 * - Returns default icon component based on variant
 * - Maps variant types to appropriate Lucide icons
 * - Uses consistent icon styling across all variants
 *
 * Parameters:
 * - variant ('error' | 'success' | 'warning' | 'info' | 'muted' | null | undefined): Message variant
 *
 * Returns:
 * - React.ReactElement: Icon component for the variant
 *
 * Example:
 * ```ts
 * const icon = getDefaultIcon('error');
 * // Returns <AlertCircle /> component
 * ```
 */
const getDefaultIcon = (
  variant: 'error' | 'success' | 'warning' | 'info' | 'muted' | null | undefined,
): React.ReactElement => {
  switch (variant) {
    case 'error':
      return <AlertCircle className={ICON_CLASSES} />;
    case 'success':
      return <CheckCircle className={ICON_CLASSES} />;
    case 'warning':
      return <AlertCircle className={ICON_CLASSES} />;
    case 'info':
      return <Info className={ICON_CLASSES} />;
    default:
      return <AlertCircle className={ICON_CLASSES} />;
  }
};

/**
 * Component: ValidationMessage
 * Description:
 * - Displays validation messages for form fields
 * - Supports multiple visual variants and sizes
 * - Shows default icons based on variant or custom icon
 * - Uses forwardRef for ref forwarding
 * - Returns null if no message or children are provided
 * - Accessible with appropriate ARIA roles
 *
 * Parameters:
 * - className (string, optional): Additional CSS classes
 * - variant ('error' | 'success' | 'warning' | 'info' | 'muted', optional): Visual variant (default: 'error')
 * - size ('default' | 'sm' | 'base', optional): Size variant (default: 'default')
 * - message (string, optional): Validation message text
 * - showIcon (boolean, optional): Whether to show icon (default: true)
 * - icon (ReactNode, optional): Custom icon to display instead of default
 * - children (ReactNode, optional): Alternative content to display
 * - ...props (HTMLDivElement attributes): Additional HTML div attributes
 *
 * Returns:
 * - React.ReactElement | null: The validation message component or null if no content
 *
 * Example:
 * ```tsx
 * <ValidationMessage message="This field is required" variant="error" />
 * <ValidationMessage variant="success" size="sm">Field is valid</ValidationMessage>
 * ```
 */
const ValidationMessage = React.forwardRef<HTMLDivElement, ValidationMessageProps>(
  (
    { className, variant, size, message, showIcon = DEFAULT_SHOW_ICON, icon, children, ...props },
    ref,
  ) => {
    const content = message || children;

    if (!content) return null;

    return (
      <div
        ref={ref}
        className={cn(validationMessageVariants({ variant, size }), className)}
        role={variant === 'error' ? ROLE_ALERT : ROLE_STATUS}
        {...props}
      >
        {showIcon && (icon || getDefaultIcon(variant))}
        <span className={TEXT_CLASSES}>{content}</span>
      </div>
    );
  },
);

ValidationMessage.displayName = DISPLAY_NAME;

export { ValidationMessage, validationMessageVariants };
