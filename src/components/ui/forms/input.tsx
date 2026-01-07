// ====================================================
// File Name   : input.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-08-20
// Last Update : 2025-09-02
//
// Description:
// - Basic input component with customizable variants and sizes
// - Supports multiple visual variants (default, filled, flushed, unstyled)
// - Supports multiple sizes (sm, md, lg)
// - Uses class-variance-authority pattern for styling
//
// Notes:
// - Server and client compatible (no 'use client' directive)
// - Uses forwardRef for ref forwarding
// - Simple input wrapper with variant and size support
// ====================================================

import * as React from 'react';
import { cn } from '@/lib/utils';

const DEFAULT_VARIANT = 'default';
const DEFAULT_SIZE = 'md';

const DISPLAY_NAME = 'Input';

const BASE_CLASSES =
  'flex w-full rounded-md font-medium transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50';

const variants = {
  default:
    'border-2 border-blue-500 bg-background hover:border-blue-600 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none transition-all duration-200',
  filled:
    'border-2 border-transparent bg-muted hover:bg-gray-50 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none transition-all duration-200',
  flushed:
    'border-0 border-b-2 border-blue-500 bg-transparent rounded-none px-0 hover:border-blue-600 focus:border-blue-600 focus:ring-0 focus:outline-none transition-all duration-200',
  unstyled: 'border-0 bg-transparent shadow-none focus:outline-none',
} as const;

const sizes = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-3',
  lg: 'h-12 px-4 text-lg',
} as const;

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'filled' | 'flushed' | 'unstyled';
  inputSize?: 'sm' | 'md' | 'lg';
}

/**
 * Component: Input
 * Description:
 * - Basic input component with customizable variants and sizes
 * - Supports multiple visual styles (default, filled, flushed, unstyled)
 * - Supports multiple sizes (sm, md, lg)
 * - Uses forwardRef for ref forwarding
 *
 * Parameters:
 * - className (string, optional): Additional CSS classes
 * - variant ('default' | 'filled' | 'flushed' | 'unstyled', optional): Visual variant (default: 'default')
 * - inputSize ('sm' | 'md' | 'lg', optional): Size variant (default: 'md')
 * - type (string, optional): Input type
 * - ...props (InputHTMLAttributes): Additional HTML input attributes
 *
 * Returns:
 * - React.ReactElement: The input component
 *
 * Example:
 * ```tsx
 * <Input variant="default" inputSize="md" placeholder="Enter text" />
 * <Input variant="filled" inputSize="lg" type="email" />
 * ```
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = DEFAULT_VARIANT, inputSize = DEFAULT_SIZE, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(BASE_CLASSES, variants[variant], sizes[inputSize], className)}
        ref={ref}
        {...props}
      />
    );
  },
);

Input.displayName = DISPLAY_NAME;

export { Input };
