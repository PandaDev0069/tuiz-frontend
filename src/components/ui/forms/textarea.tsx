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
    'w-full border rounded-md shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1';

  const variantClasses = {
    default: 'border-2 border-blue-500 focus:ring-blue-500 focus:border-blue-600',
    primary: 'border-2 border-blue-500 focus:ring-blue-500 focus:border-blue-600',
    success: 'border-2 border-green-500 focus:ring-green-500 focus:border-green-600',
    warning: 'border-2 border-yellow-500 focus:ring-yellow-500 focus:border-yellow-600',
    error: 'border-2 border-red-500 focus:ring-red-500 focus:border-red-600',
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
