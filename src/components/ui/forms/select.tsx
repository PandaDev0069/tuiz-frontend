'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, Check } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  options: SelectOption[];
  disabled?: boolean;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  value,
  onValueChange,
  placeholder = 'Select an option',
  options,
  disabled = false,
  variant = 'default',
  size = 'md',
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const baseClasses =
    'relative w-full border rounded-md shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1';

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

  const selectedOption = options.find((option) => option.value === value);

  return (
    <div ref={selectRef} className="relative">
      <button
        type="button"
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          'flex items-center justify-between text-left',
          disabled && 'opacity-50 cursor-not-allowed bg-gray-50',
          className,
        )}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <span className={cn(selectedOption ? 'text-gray-900' : 'text-gray-500')}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-gray-400 transition-transform duration-200',
            isOpen && 'rotate-180',
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={cn(
                'w-full px-3 py-2 text-left text-sm transition-colors duration-150 flex items-center justify-between',
                'hover:bg-blue-50 focus:bg-blue-50 focus:outline-none',
                option.disabled && 'opacity-50 cursor-not-allowed',
                value === option.value && 'bg-blue-100 text-blue-900',
              )}
              onClick={() => {
                if (!option.disabled) {
                  onValueChange(option.value);
                  setIsOpen(false);
                }
              }}
              disabled={option.disabled}
            >
              <span>{option.label}</span>
              {value === option.value && <Check className="h-4 w-4 text-blue-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Additional components for more complex select usage
export const SelectTrigger: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <div className={cn('flex items-center justify-between', className)}>{children}</div>
);

export const SelectValue: React.FC<{
  placeholder?: string;
  children?: React.ReactNode;
}> = ({ placeholder, children }) => (
  <span className={cn(children ? 'text-gray-900' : 'text-gray-500')}>
    {children || placeholder}
  </span>
);

export const SelectContent: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <div
    className={cn(
      'absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto',
      className,
    )}
  >
    {children}
  </div>
);

export const SelectItem: React.FC<{
  value: string;
  children: React.ReactNode;
  disabled?: boolean;
  onSelect?: (value: string) => void;
}> = ({ value, children, disabled = false, onSelect }) => (
  <button
    type="button"
    className={cn(
      'w-full px-3 py-2 text-left text-sm transition-colors duration-150',
      'hover:bg-blue-50 focus:bg-blue-50 focus:outline-none',
      disabled && 'opacity-50 cursor-not-allowed',
    )}
    onClick={() => !disabled && onSelect?.(value)}
    disabled={disabled}
  >
    {children}
  </button>
);
