import * as React from 'react';
import { CheckCircle } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const formSuccessVariants = cva('flex items-center gap-2 text-sm font-medium', {
  variants: {
    variant: {
      default: 'text-green-600',
      success: 'text-emerald-600',
      primary: 'text-blue-600',
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

export interface FormSuccessProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof formSuccessVariants> {
  message?: string;
  showIcon?: boolean;
}

const FormSuccess = React.forwardRef<HTMLDivElement, FormSuccessProps>(
  ({ className, variant, size, message, showIcon = true, children, ...props }, ref) => {
    const content = message || children;

    if (!content) return null;

    return (
      <div
        ref={ref}
        className={cn(formSuccessVariants({ variant, size }), className)}
        role="status"
        {...props}
      >
        {showIcon && <CheckCircle className="h-4 w-4 flex-shrink-0" />}
        <span>{content}</span>
      </div>
    );
  },
);

FormSuccess.displayName = 'FormSuccess';

export { FormSuccess, formSuccessVariants };
