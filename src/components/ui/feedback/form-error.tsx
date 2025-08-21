import * as React from 'react';
import { AlertCircle } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const formErrorVariants = cva('flex items-center gap-2 text-sm font-medium', {
  variants: {
    variant: {
      default: 'text-red-600',
      destructive: 'text-destructive',
      warning: 'text-amber-600',
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

export interface FormErrorProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof formErrorVariants> {
  message?: string;
  showIcon?: boolean;
}

const FormError = React.forwardRef<HTMLDivElement, FormErrorProps>(
  ({ className, variant, size, message, showIcon = true, children, ...props }, ref) => {
    const content = message || children;

    if (!content) return null;

    return (
      <div
        ref={ref}
        className={cn(formErrorVariants({ variant, size }), className)}
        role="alert"
        {...props}
      >
        {showIcon && <AlertCircle className="h-4 w-4 flex-shrink-0" />}
        <span>{content}</span>
      </div>
    );
  },
);

FormError.displayName = 'FormError';

export { FormError, formErrorVariants };
