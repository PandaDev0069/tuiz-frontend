// ====================================================
// File Name   : label.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-02
// Last Update : 2025-09-02
//
// Description:
// - Label component for form fields with variant and size support
// - Supports multiple visual variants (default, primary, success, warning, error)
// - Supports multiple sizes (sm, md, lg)
// - Optional required indicator
//
// Notes:
// - Client component (uses 'use client' directive)
// - Simple label wrapper with variant and size support
// ====================================================

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

const DEFAULT_REQUIRED = false;
const DEFAULT_VARIANT = 'default';
const DEFAULT_SIZE = 'md';

const BASE_CLASSES = 'font-medium transition-colors duration-200';
const REQUIRED_INDICATOR_CLASSES = 'text-red-500 ml-1';

const variantClasses = {
  default: 'text-gray-700',
  primary: 'text-blue-600',
  success: 'text-green-600',
  warning: 'text-yellow-600',
  error: 'text-red-600',
} as const;

const sizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
} as const;

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
  required?: boolean;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Component: Label
 * Description:
 * - Label component for form fields with variant and size support
 * - Supports multiple visual variants and sizes
 * - Optional required indicator (red asterisk)
 * - Extends standard label HTML attributes
 *
 * Parameters:
 * - className (string, optional): Additional CSS classes
 * - children (ReactNode): Label text content
 * - required (boolean, optional): Whether to show required indicator (default: false)
 * - variant ('default' | 'primary' | 'success' | 'warning' | 'error', optional): Visual variant (default: 'default')
 * - size ('sm' | 'md' | 'lg', optional): Size variant (default: 'md')
 * - ...props (LabelHTMLAttributes): Additional HTML label attributes
 *
 * Returns:
 * - React.ReactElement: The label component
 *
 * Example:
 * ```tsx
 * <Label required variant="primary" size="md">Email Address</Label>
 * <Label variant="error" size="sm">Error Label</Label>
 * ```
 */
export const Label: React.FC<LabelProps> = ({
  children,
  required = DEFAULT_REQUIRED,
  variant = DEFAULT_VARIANT,
  size = DEFAULT_SIZE,
  className,
  ...props
}) => {
  return (
    <label
      className={cn(BASE_CLASSES, variantClasses[variant], sizeClasses[size], className)}
      {...props}
    >
      {children}
      {required && <span className={REQUIRED_INDICATOR_CLASSES}>*</span>}
    </label>
  );
};
