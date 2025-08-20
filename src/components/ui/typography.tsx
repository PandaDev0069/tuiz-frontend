import * as React from 'react';
import { cn } from '@/lib/utils';

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
}

const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, as = 'h2', size = 'lg', weight = 'semibold', ...props }, ref) => {
    const Component = as;

    const sizes = {
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
      '2xl': 'text-2xl',
      '3xl': 'text-3xl',
      '4xl': 'text-4xl',
    };

    const weights = {
      light: 'font-light',
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
    };

    return (
      <Component
        ref={ref}
        className={cn('text-foreground leading-tight', sizes[size], weights[weight], className)}
        {...props}
      />
    );
  },
);
Heading.displayName = 'Heading';

export interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  variant?: 'default' | 'muted' | 'accent';
}

const Text = React.forwardRef<HTMLParagraphElement, TextProps>(
  ({ className, size = 'md', weight = 'normal', variant = 'default', ...props }, ref) => {
    const sizes = {
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
    };

    const weights = {
      light: 'font-light',
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
    };

    const variants = {
      default: 'text-foreground',
      muted: 'text-muted-foreground',
      accent: 'text-accent-foreground',
    };

    return (
      <p
        ref={ref}
        className={cn(
          'leading-relaxed',
          sizes[size],
          weights[weight],
          variants[variant],
          className,
        )}
        {...props}
      />
    );
  },
);
Text.displayName = 'Text';

export { Heading, Text };
