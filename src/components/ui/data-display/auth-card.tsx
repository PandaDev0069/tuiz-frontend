import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const authCardVariants = cva(
  'w-full max-w-md mx-auto p-6 bg-white rounded-lg border border-gray-200 shadow-lg',
  {
    variants: {
      variant: {
        default: 'bg-white border-gray-200 shadow-lg',
        glass: 'bg-blue/80 backdrop-blur-sm border-gray-200/50 shadow-xl',
        gradient: 'bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-xl',
        minimal: 'bg-white border-gray-100 shadow-md',
        // Colorful variants
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
        // Dark variants
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
      variant: 'default',
      size: 'default',
    },
  },
);

export interface AuthCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof authCardVariants> {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}

const AuthCard = React.forwardRef<HTMLDivElement, AuthCardProps>(
  ({ className, variant, size, title, subtitle, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(authCardVariants({ variant, size }), className)} {...props}>
        {(title || subtitle) && (
          <div className="mb-6 text-center">
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
