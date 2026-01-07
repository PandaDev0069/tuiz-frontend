// ====================================================
// File Name   : checkbox.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-08-21
// Last Update : 2025-09-02
//
// Description:
// - Checkbox component with customizable variants and sizes
// - Supports label and description text
// - Multiple visual variants (default, accent, success, warning)
// - Uses class-variance-authority for variant management
//
// Notes:
// - Server and client compatible (no 'use client' directive)
// - Uses forwardRef for ref forwarding
// - Generates unique ID if not provided
// - Accessible with proper label associations
// ====================================================

import * as React from 'react';
import { Check } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const BASE_CLASSES =
  'peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow-sm hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-1 sm:focus:ring-offset-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 active:scale-95';

const DISPLAY_NAME = 'Checkbox';

const CHECK_ICON_CLASSES = 'h-3 w-3 stroke-[3]';
const CHECKBOX_INPUT_CLASSES = 'absolute opacity-0 cursor-pointer h-full w-full';
const CHECKBOX_DISPLAY_CLASSES = 'flex items-center justify-center transition-all duration-200';

const CONTAINER_CLASSES = 'flex items-start space-x-2';
const CHECKBOX_WRAPPER_CLASSES = 'relative flex items-center';
const LABEL_CONTAINER_CLASSES = 'flex flex-col min-h-[1.5rem] sm:min-h-[1.25rem]';
const LABEL_CLASSES =
  'text-sm font-medium leading-tight sm:leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer';
const DESCRIPTION_CLASSES = 'text-xs text-muted-foreground mt-1 leading-relaxed';

const checkboxVariants = cva(BASE_CLASSES, {
  variants: {
    variant: {
      default:
        'border-gray-400 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground focus:ring-blue-500 focus:border-blue-500',
      accent:
        'border-blue-400 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white focus:ring-blue-500 focus:border-blue-500',
      success:
        'border-green-400 data-[state=checked]:bg-green-600 data-[state=checked]:text-white focus:ring-green-500 focus:border-green-500',
      warning:
        'border-amber-400 data-[state=checked]:bg-amber-600 data-[state=checked]:text-white focus:ring-amber-500 focus:border-amber-500',
    },
    size: {
      default: 'h-4 w-4',
      sm: 'h-3 w-3',
      lg: 'h-5 w-5',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'>,
    VariantProps<typeof checkboxVariants> {
  label?: string;
  description?: string;
}

/**
 * Component: Checkbox
 * Description:
 * - Customizable checkbox component with label and description support
 * - Supports multiple visual variants and sizes
 * - Uses forwardRef for ref forwarding
 * - Generates unique ID automatically if not provided
 * - Accessible with proper label associations
 *
 * Parameters:
 * - className (string, optional): Additional CSS classes
 * - variant ('default' | 'accent' | 'success' | 'warning', optional): Visual variant (default: 'default')
 * - size ('default' | 'sm' | 'lg', optional): Size variant (default: 'default')
 * - label (string, optional): Label text for the checkbox
 * - description (string, optional): Description text below the label
 * - id (string, optional): Unique ID for the checkbox (auto-generated if not provided)
 * - checked (boolean, optional): Whether the checkbox is checked
 * - ...props (InputHTMLAttributes): Additional HTML input attributes
 *
 * Returns:
 * - React.ReactElement: The checkbox component
 *
 * Example:
 * ```tsx
 * <Checkbox label="Accept terms" description="Please read the terms" />
 * <Checkbox variant="success" size="lg" checked={true} />
 * ```
 */
const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, variant, size, label, description, id, checked, ...props }, ref) => {
    const generatedId = React.useId();
    const checkboxId = id || generatedId;

    return (
      <div className={CONTAINER_CLASSES}>
        <div className={CHECKBOX_WRAPPER_CLASSES}>
          <input
            type="checkbox"
            id={checkboxId}
            ref={ref}
            className={cn(checkboxVariants({ variant, size }), CHECKBOX_INPUT_CLASSES, className)}
            checked={checked}
            {...props}
          />
          <div
            className={cn(
              checkboxVariants({ variant, size }),
              CHECKBOX_DISPLAY_CLASSES,
              checked && 'bg-blue-600 border-blue-600 text-white',
              !checked && 'bg-white hover:bg-gray-100 border-opacity-80 hover:border-opacity-100',
            )}
          >
            {checked && <Check className={CHECK_ICON_CLASSES} />}
          </div>
        </div>
        {(label || description) && (
          <div className={LABEL_CONTAINER_CLASSES}>
            {label && (
              <label htmlFor={checkboxId} className={LABEL_CLASSES}>
                {label}
              </label>
            )}
            {description && <p className={DESCRIPTION_CLASSES}>{description}</p>}
          </div>
        )}
      </div>
    );
  },
);

Checkbox.displayName = DISPLAY_NAME;

export { Checkbox, checkboxVariants };
