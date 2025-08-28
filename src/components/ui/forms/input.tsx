import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'filled' | 'flushed' | 'unstyled';
  inputSize?: 'sm' | 'md' | 'lg';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = 'default', inputSize = 'md', ...props }, ref) => {
    const variants = {
      default: 'border border-input bg-background',
      filled: 'border-0 bg-muted',
      flushed: 'border-0 border-b border-input bg-transparent rounded-none px-0',
      unstyled: 'border-0 bg-transparent shadow-none',
    };

    const sizes = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-3',
      lg: 'h-12 px-4 text-lg',
    };

    return (
      <input
        type={type}
        className={cn(
          'flex w-full rounded-md font-medium transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
          variants[variant],
          sizes[inputSize],
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';

export { Input };
