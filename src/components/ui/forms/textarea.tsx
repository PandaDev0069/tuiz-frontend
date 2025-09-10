'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

export const Textarea: React.FC<TextareaProps> = ({
  variant = 'default',
  size = 'md',
  resize = 'vertical',
  className,
  ...props
}) => {
  const baseClasses =
    'w-full border rounded-md shadow-sm transition-all duration-200 focus:outline-none';

  const variantClasses = {
    default: 'border-2 border-blue-500 bg-background hover:border-blue-600',
    primary: 'border-2 border-blue-500 bg-background hover:border-blue-600',
    success: 'border-2 border-green-500 bg-background hover:border-green-600',
    warning: 'border-2 border-yellow-500 bg-background hover:border-yellow-600',
    error: 'border-2 border-red-500 bg-background hover:border-red-600',
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base',
  };

  const resizeClasses = {
    none: 'resize-none',
    vertical: 'resize-y',
    horizontal: 'resize-x',
    both: 'resize',
  };

  return (
    <textarea
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        resizeClasses[resize],
        className,
      )}
      {...props}
    />
  );
};
