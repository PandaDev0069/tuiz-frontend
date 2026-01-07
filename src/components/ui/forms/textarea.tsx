// ====================================================
// File Name   : textarea.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-02
// Last Update : 2025-09-02
//
// Description:
// - Textarea component with customizable variants, sizes, and resize options
// - Supports multiple visual variants (default, primary, success, warning, error)
// - Supports multiple sizes (sm, md, lg)
// - Supports resize options (none, vertical, horizontal, both)
//
// Notes:
// - Client component (uses 'use client' directive)
// - Extends standard textarea HTML attributes
// ====================================================

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

const DEFAULT_VARIANT = 'default';
const DEFAULT_SIZE = 'md';
const DEFAULT_RESIZE = 'vertical';

const BASE_CLASSES =
  'w-full border rounded-md shadow-sm transition-all duration-200 focus:outline-none';

const variantClasses = {
  default: 'border-2 border-blue-500 bg-background hover:border-blue-600',
  primary: 'border-2 border-blue-500 bg-background hover:border-blue-600',
  success: 'border-2 border-green-500 bg-background hover:border-green-600',
  warning: 'border-2 border-yellow-500 bg-background hover:border-yellow-600',
  error: 'border-2 border-red-500 bg-background hover:border-red-600',
} as const;

const sizeClasses = {
  sm: 'px-2 py-1 text-sm',
  md: 'px-3 py-2 text-sm',
  lg: 'px-4 py-3 text-base',
} as const;

const resizeClasses = {
  none: 'resize-none',
  vertical: 'resize-y',
  horizontal: 'resize-x',
  both: 'resize',
} as const;

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

/**
 * Component: Textarea
 * Description:
 * - Textarea component with customizable variants, sizes, and resize options
 * - Supports multiple visual variants and sizes
 * - Supports resize behavior (none, vertical, horizontal, both)
 * - Extends standard textarea HTML attributes
 *
 * Parameters:
 * - className (string, optional): Additional CSS classes
 * - variant ('default' | 'primary' | 'success' | 'warning' | 'error', optional): Visual variant (default: 'default')
 * - size ('sm' | 'md' | 'lg', optional): Size variant (default: 'md')
 * - resize ('none' | 'vertical' | 'horizontal' | 'both', optional): Resize behavior (default: 'vertical')
 * - ...props (TextareaHTMLAttributes): Additional HTML textarea attributes
 *
 * Returns:
 * - React.ReactElement: The textarea component
 *
 * Example:
 * ```tsx
 * <Textarea placeholder="Enter text" variant="default" size="md" />
 * <Textarea variant="error" resize="none" rows={5} />
 * ```
 */
export const Textarea: React.FC<TextareaProps> = ({
  variant = DEFAULT_VARIANT,
  size = DEFAULT_SIZE,
  resize = DEFAULT_RESIZE,
  className,
  ...props
}) => {
  return (
    <textarea
      className={cn(
        BASE_CLASSES,
        variantClasses[variant],
        sizeClasses[size],
        resizeClasses[resize],
        className,
      )}
      {...props}
    />
  );
};
