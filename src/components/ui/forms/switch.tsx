'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  className?: string;
  id?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onCheckedChange,
  disabled = false,
  size = 'md',
  variant = 'default',
  className,
  id,
}) => {
  const baseClasses =
    'relative inline-flex items-center rounded transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2';

  const sizeClasses = {
    sm: 'h-5 w-9',
    md: 'h-6 w-11',
    lg: 'h-7 w-13',
  };

  const variantClasses = {
    default: checked
      ? 'bg-gray-400 focus:ring-gray-300 shadow-inner'
      : 'bg-gray-300 focus:ring-gray-200 shadow-inner',
    primary: checked
      ? 'bg-blue-500 focus:ring-blue-300 shadow-inner'
      : 'bg-gray-300 focus:ring-gray-200 shadow-inner',
    success: checked
      ? 'bg-green-500 focus:ring-green-300 shadow-inner'
      : 'bg-gray-300 focus:ring-gray-200 shadow-inner',
    warning: checked
      ? 'bg-yellow-500 focus:ring-yellow-300 shadow-inner'
      : 'bg-gray-300 focus:ring-gray-200 shadow-inner',
    error: checked
      ? 'bg-red-500 focus:ring-red-300 shadow-inner'
      : 'bg-gray-300 focus:ring-gray-200 shadow-inner',
  };

  const thumbSizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const thumbPositionClasses = {
    sm: checked ? 'translate-x-4' : 'translate-x-0.5',
    md: checked ? 'translate-x-5' : 'translate-x-0.5',
    lg: checked ? 'translate-x-6' : 'translate-x-0.5',
  };

  return (
    <button
      type="button"
      id={id}
      className={cn(
        baseClasses,
        sizeClasses[size],
        variantClasses[variant],
        disabled && 'opacity-50 cursor-not-allowed',
        'shadow-sm',
        className,
      )}
      onClick={() => !disabled && onCheckedChange(!checked)}
      disabled={disabled}
      role="switch"
      aria-checked={checked}
    >
      <span
        className={cn(
          'inline-block bg-white rounded shadow-lg transform transition-all duration-300 ease-in-out',
          'border border-gray-200',
          thumbSizeClasses[size],
          thumbPositionClasses[size],
          checked && 'shadow-md',
        )}
      />
    </button>
  );
};
