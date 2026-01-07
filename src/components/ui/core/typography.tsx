// ====================================================
// File Name   : typography.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-08-20
// Last Update : 2025-08-21
//
// Description:
// - Typography components for headings and text
// - Provides Heading and Text components with size, weight, and variant support
// - Supports semantic HTML elements with customizable styling
//
// Notes:
// - Server and client compatible (no 'use client' directive)
// - All components support className prop for customization
// ====================================================

import * as React from 'react';
import { cn } from '@/lib/utils';

const DEFAULT_HEADING_AS = 'h2';
const DEFAULT_HEADING_SIZE = 'lg';
const DEFAULT_HEADING_WEIGHT = 'semibold';

const DEFAULT_TEXT_SIZE = 'md';
const DEFAULT_TEXT_WEIGHT = 'normal';
const DEFAULT_TEXT_VARIANT = 'default';

const HEADING_BASE_CLASSES = 'text-foreground leading-tight';
const TEXT_BASE_CLASSES = 'leading-relaxed';

const SIZE_CLASSES = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
  '4xl': 'text-4xl',
} as const;

const WEIGHT_CLASSES = {
  light: 'font-light',
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
} as const;

const TEXT_VARIANT_CLASSES = {
  default: 'text-foreground',
  muted: 'text-muted-foreground',
  accent: 'text-accent-foreground',
} as const;

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
}

export interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  variant?: 'default' | 'muted' | 'accent';
}

/**
 * Component: Heading
 * Description:
 * - Semantic heading component with customizable size and weight
 * - Supports all heading levels (h1-h6) via 'as' prop
 * - Provides consistent typography styling across the application
 *
 * Parameters:
 * - className (string, optional): Additional CSS classes
 * - as ('h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6', optional): HTML heading element type (default: 'h2')
 * - size ('xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl', optional): Text size (default: 'lg')
 * - weight ('light' | 'normal' | 'medium' | 'semibold' | 'bold', optional): Font weight (default: 'semibold')
 * - ...props (React.HTMLAttributes<HTMLHeadingElement>): Additional heading attributes
 *
 * Returns:
 * - React.ReactElement: The heading component
 *
 * Example:
 * ```tsx
 * <Heading as="h1" size="2xl" weight="bold">
 *   Page Title
 * </Heading>
 * ```
 */
const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  (
    {
      className,
      as = DEFAULT_HEADING_AS,
      size = DEFAULT_HEADING_SIZE,
      weight = DEFAULT_HEADING_WEIGHT,
      ...props
    },
    ref,
  ) => {
    const Component = as;

    return (
      <Component
        ref={ref}
        className={cn(HEADING_BASE_CLASSES, SIZE_CLASSES[size], WEIGHT_CLASSES[weight], className)}
        {...props}
      />
    );
  },
);
Heading.displayName = 'Heading';

/**
 * Component: Text
 * Description:
 * - Text component with customizable size, weight, and variant
 * - Supports multiple text variants (default, muted, accent)
 * - Provides consistent typography styling for body text
 *
 * Parameters:
 * - className (string, optional): Additional CSS classes
 * - size ('xs' | 'sm' | 'md' | 'lg' | 'xl', optional): Text size (default: 'md')
 * - weight ('light' | 'normal' | 'medium' | 'semibold' | 'bold', optional): Font weight (default: 'normal')
 * - variant ('default' | 'muted' | 'accent', optional): Text color variant (default: 'default')
 * - ...props (React.HTMLAttributes<HTMLParagraphElement>): Additional paragraph attributes
 *
 * Returns:
 * - React.ReactElement: The text component
 *
 * Example:
 * ```tsx
 * <Text size="lg" weight="medium" variant="muted">
 *   Body text content
 * </Text>
 * ```
 */
const Text = React.forwardRef<HTMLParagraphElement, TextProps>(
  (
    {
      className,
      size = DEFAULT_TEXT_SIZE,
      weight = DEFAULT_TEXT_WEIGHT,
      variant = DEFAULT_TEXT_VARIANT,
      ...props
    },
    ref,
  ) => {
    return (
      <p
        ref={ref}
        className={cn(
          TEXT_BASE_CLASSES,
          SIZE_CLASSES[size],
          WEIGHT_CLASSES[weight],
          TEXT_VARIANT_CLASSES[variant],
          className,
        )}
        {...props}
      />
    );
  },
);
Text.displayName = 'Text';

export { Heading, Text };
