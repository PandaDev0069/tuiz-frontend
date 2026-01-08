// ====================================================
// File Name   : auth-card.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-08-21
// Last Update : 2025-08-21
//
// Description:
// - Authentication card component with variant support
// - Provides multiple visual variants (default, glass, gradient, colorful, dark)
// - Supports different sizes and optional title/subtitle
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
  'w-full max-w-md mx-auto p-6 bg-white rounded-lg border border-gray-200 shadow-lg';

const DEFAULT_VARIANT = 'default';
const DEFAULT_SIZE = 'default';

const HEADER_CONTAINER_CLASSES = 'mb-6 text-center';

const authCardVariants = cva(BASE_CLASSES, {
  variants: {
    variant: {
      default: 'bg-white border-gray-200 shadow-lg',
      glass: 'bg-blue/80 backdrop-blur-sm border-gray-200/50 shadow-xl',
      gradient: 'bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-xl',
      minimal: 'bg-white border-gray-100 shadow-md',
      primary:
        'bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200/50 shadow-xl text-blue-900',
      success:
        'bg-gradient-to-br from-emerald-50 to-green-100 border-emerald-200/50 shadow-xl text-emerald-900',
      warning:
        'bg-gradient-to-br from-amber-50 to-orange-100 border-amber-200/50 shadow-xl text-amber-900',
      accent:
        'bg-gradient-to-br from-purple-50 to-pink-100 border-purple-200/50 shadow-xl text-purple-900',
      neon: 'bg-gradient-to-br from-cyan-50 to-teal-100 border-cyan-200/50 shadow-xl text-cyan-900',
      sunset:
        'bg-gradient-to-br from-orange-50 via-pink-50 to-purple-100 border-orange-200/50 shadow-xl text-orange-900',
      ocean:
        'bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-100 border-blue-200/50 shadow-xl text-blue-900',
      forest:
        'bg-gradient-to-br from-emerald-50 via-green-50 to-lime-100 border-emerald-200/50 shadow-xl text-emerald-900',
      darkGlass: 'bg-gray-900/80 backdrop-blur-sm border-gray-700/50 shadow-xl text-white',
      darkGradient:
        'bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 shadow-xl text-white',
      darkAccent:
        'bg-gradient-to-br from-purple-900 to-indigo-900 border-purple-700/50 shadow-xl text-purple-100',
    },
    size: {
      default: 'max-w-md p-6',
      sm: 'max-w-sm p-4',
      lg: 'max-w-lg p-8',
      xl: 'max-w-xl p-10',
    },
  },
  defaultVariants: {
    variant: DEFAULT_VARIANT,
    size: DEFAULT_SIZE,
  },
});

export interface AuthCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof authCardVariants> {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}

/**
 * Component: AuthCard
 * Description:
 * - Authentication card component with variant and size support
 * - Provides multiple visual variants (default, glass, gradient, colorful, dark)
 * - Supports optional title and subtitle
 * - Uses class-variance-authority for variant management
 *
 * Parameters:
 * - className (string, optional): Additional CSS classes
 * - variant (string, optional): Card variant (default, glass, gradient, etc.)
 * - size ('default' | 'sm' | 'lg' | 'xl', optional): Card size (default: 'default')
 * - title (string, optional): Card title text
 * - subtitle (string, optional): Card subtitle text
 * - children (React.ReactNode): Card content
 * - ...props (React.HTMLAttributes<HTMLDivElement>): Additional div attributes
 *
 * Returns:
 * - React.ReactElement: The auth card component
 *
 * Example:
 * ```tsx
 * <AuthCard variant="primary" size="lg" title="Welcome" subtitle="Sign in to continue">
 *   <form>...</form>
 * </AuthCard>
 * ```
 */
const AuthCard = React.forwardRef<HTMLDivElement, AuthCardProps>(
  ({ className, variant, size, title, subtitle, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(authCardVariants({ variant, size }), className)} {...props}>
        {(title || subtitle) && (
          <div className={HEADER_CONTAINER_CLASSES}>
            {title && <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>}
            {subtitle && <p className="text-gray-600 text-sm">{subtitle}</p>}
          </div>
        )}
        {children}
      </div>
    );
  },
);

AuthCard.displayName = 'AuthCard';

export { AuthCard, authCardVariants };
