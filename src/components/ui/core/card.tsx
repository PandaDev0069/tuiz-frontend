// ====================================================
// File Name   : card.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-08-20
// Last Update : 2025-08-21
//
// Description:
// - Card component with variant support
// - Provides card sub-components (Header, Title, Description, Content, Footer)
// - Supports multiple visual variants (default, glass, accent, success, warning)
// - Uses forwardRef for ref forwarding
//
// Notes:
// - Server and client compatible (no 'use client' directive)
// - All sub-components support className prop for customization
// ====================================================

import * as React from 'react';

import { cn } from '@/lib/utils';

const DEFAULT_VARIANT = 'default';

const CARD_BASE_CLASSES =
  'rounded-3xl border shadow-md transition-shadow hover:shadow-3xl hover:shadow-black/20 p-6';

const CARD_VARIANTS = {
  default: 'bg-card text-card-foreground shadow-sm',
  glass: 'bg-white/40 backdrop-blur-lg border border-white/30',
  accent: 'bg-blue-50 border-blue-200 text-blue-900',
  success: 'bg-green-50 border-green-200 text-green-900',
  warning: 'bg-orange-50 border-orange-200 text-orange-900',
} as const;

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'accent' | 'success' | 'warning';
}

/**
 * Component: Card
 * Description:
 * - Card container component with variant support
 * - Provides multiple visual variants (default, glass, accent, success, warning)
 * - Includes hover effects and shadow transitions
 * - Supports custom className for additional styling
 *
 * Parameters:
 * - className (string, optional): Additional CSS classes
 * - variant ('default' | 'glass' | 'accent' | 'success' | 'warning', optional): Card variant
 * - ...props (React.HTMLAttributes<HTMLDivElement>): Additional div attributes
 *
 * Returns:
 * - React.ReactElement: The card component
 *
 * Example:
 * ```tsx
 * <Card variant="glass">
 *   <CardHeader>
 *     <CardTitle>Title</CardTitle>
 *   </CardHeader>
 * </Card>
 * ```
 */
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = DEFAULT_VARIANT, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(CARD_BASE_CLASSES, CARD_VARIANTS[variant], className)}
        {...props}
      />
    );
  },
);
Card.displayName = 'Card';

/**
 * Component: CardHeader
 * Description:
 * - Header section of the card
 * - Provides spacing and layout for card header content
 * - Typically contains CardTitle and CardDescription
 *
 * Parameters:
 * - className (string, optional): Additional CSS classes
 * - ...props (React.HTMLAttributes<HTMLDivElement>): Additional div attributes
 *
 * Returns:
 * - React.ReactElement: The card header component
 *
 * Example:
 * ```tsx
 * <CardHeader>
 *   <CardTitle>Title</CardTitle>
 *   <CardDescription>Description</CardDescription>
 * </CardHeader>
 * ```
 */
const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 pb-4', className)} {...props} />
  ),
);
CardHeader.displayName = 'CardHeader';

/**
 * Component: CardTitle
 * Description:
 * - Title heading for the card
 * - Uses h3 element with semantic styling
 * - Provides consistent typography for card titles
 *
 * Parameters:
 * - className (string, optional): Additional CSS classes
 * - ...props (React.HTMLAttributes<HTMLHeadingElement>): Additional heading attributes
 *
 * Returns:
 * - React.ReactElement: The card title component
 *
 * Example:
 * ```tsx
 * <CardTitle>Card Title</CardTitle>
 * ```
 */
const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-2xl font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  ),
);
CardTitle.displayName = 'CardTitle';

/**
 * Component: CardDescription
 * Description:
 * - Description text for the card
 * - Provides muted text styling for secondary information
 * - Typically used in CardHeader below CardTitle
 *
 * Parameters:
 * - className (string, optional): Additional CSS classes
 * - ...props (React.HTMLAttributes<HTMLParagraphElement>): Additional paragraph attributes
 *
 * Returns:
 * - React.ReactElement: The card description component
 *
 * Example:
 * ```tsx
 * <CardDescription>This is a description</CardDescription>
 * ```
 */
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
));
CardDescription.displayName = 'CardDescription';

/**
 * Component: CardContent
 * Description:
 * - Main content area of the card
 * - Provides padding and spacing for card body content
 * - Typically contains the primary content of the card
 *
 * Parameters:
 * - className (string, optional): Additional CSS classes
 * - ...props (React.HTMLAttributes<HTMLDivElement>): Additional div attributes
 *
 * Returns:
 * - React.ReactElement: The card content component
 *
 * Example:
 * ```tsx
 * <CardContent>
 *   <p>Main content goes here</p>
 * </CardContent>
 * ```
 */
const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('pt-0', className)} {...props} />,
);
CardContent.displayName = 'CardContent';

/**
 * Component: CardFooter
 * Description:
 * - Footer section of the card
 * - Provides spacing and layout for card footer content
 * - Typically contains action buttons or additional information
 *
 * Parameters:
 * - className (string, optional): Additional CSS classes
 * - ...props (React.HTMLAttributes<HTMLDivElement>): Additional div attributes
 *
 * Returns:
 * - React.ReactElement: The card footer component
 *
 * Example:
 * ```tsx
 * <CardFooter>
 *   <Button>Action</Button>
 * </CardFooter>
 * ```
 */
const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center pt-4', className)} {...props} />
  ),
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
