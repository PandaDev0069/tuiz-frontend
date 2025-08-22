import * as React from 'react';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const validationMessageVariants = cva('flex items-start gap-2 text-xs mt-1', {
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

const ValidationMessage = React.forwardRef<HTMLDivElement, ValidationMessageProps>(
  ({ className, variant, size, message, showIcon = true, icon, children, ...props }, ref) => {
    const content = message || children;

    if (!content) return null;

    const getDefaultIcon = () => {
      switch (variant) {
        case 'error':
          return <AlertCircle className="h-3 w-3 flex-shrink-0 mt-0.5" />;
        case 'success':
          return <CheckCircle className="h-3 w-3 flex-shrink-0 mt-0.5" />;
        case 'warning':
          return <AlertCircle className="h-3 w-3 flex-shrink-0 mt-0.5" />;
        case 'info':
          return <Info className="h-3 w-3 flex-shrink-0 mt-0.5" />;
        default:
          return <AlertCircle className="h-3 w-3 flex-shrink-0 mt-0.5" />;
      }
    };

    return (
      <div
        ref={ref}
        className={cn(validationMessageVariants({ variant, size }), className)}
        role={variant === 'error' ? 'alert' : 'status'}
        {...props}
      >
        {showIcon && (icon || getDefaultIcon())}
        <span className="leading-tight">{content}</span>
      </div>
    );
  },
);

ValidationMessage.displayName = 'ValidationMessage';

export { ValidationMessage, validationMessageVariants };
