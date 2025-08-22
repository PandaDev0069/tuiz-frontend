import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const spinnerVariants = cva('animate-spin', {
  variants: {
    size: {
      default: 'h-4 w-4',
      sm: 'h-3 w-3',
      lg: 'h-6 w-6',
      xl: 'h-8 w-8',
    },
    variant: {
      default: 'text-primary',
      secondary: 'text-secondary-foreground',
      muted: 'text-muted-foreground',
      white: 'text-white',
      current: 'text-current',
    },
  },
  defaultVariants: {
    size: 'default',
    variant: 'default',
  },
});

const loaderVariants = cva('flex items-center justify-center', {
  variants: {
    size: {
      default: 'p-4',
      sm: 'p-2',
      lg: 'p-6',
      xl: 'p-8',
      full: 'min-h-[200px]',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

export interface SpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  'aria-label'?: string;
}

export interface LoaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof loaderVariants> {
  text?: string;
  'aria-label'?: string;
  spinnerSize?: VariantProps<typeof spinnerVariants>['size'];
  spinnerVariant?: VariantProps<typeof spinnerVariants>['variant'];
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size, variant, 'aria-label': ariaLabel, ...props }, ref) => (
    <div ref={ref} className={className} {...props}>
      <Loader2
        className={cn(spinnerVariants({ size, variant }))}
        aria-label={ariaLabel || 'Loading'}
        role="status"
      />
    </div>
  ),
);

const Loader = React.forwardRef<HTMLDivElement, LoaderProps>(
  (
    {
      className,
      size,
      spinnerSize,
      spinnerVariant,
      text,
      'aria-label': ariaLabel,
      children,
      ...props
    },
    ref,
  ) => (
    <div ref={ref} className={cn(loaderVariants({ size }), className)} {...props}>
      <div className="flex flex-col items-center gap-2">
        <Loader2
          className={cn(spinnerVariants({ size: spinnerSize, variant: spinnerVariant }))}
          aria-label={ariaLabel || 'Loading'}
          role="status"
        />
        {(text || children) && (
          <div className="text-sm text-muted-foreground">{text || children}</div>
        )}
      </div>
    </div>
  ),
);

Spinner.displayName = 'Spinner';
Loader.displayName = 'Loader';

export { Spinner, Loader, spinnerVariants, loaderVariants };
