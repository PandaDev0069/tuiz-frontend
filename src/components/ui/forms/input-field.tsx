// ====================================================
// File Name   : input-field.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-08-21
// Last Update : 2025-08-29
//
// Description:
// - Input field component with label, error, and success message support
// - Supports multiple variants (default, error, success)
// - Supports multiple sizes (default, sm, lg)
// - Optional icon display on left or right side
// - Uses class-variance-authority for variant management
//
// Notes:
// - Server and client compatible (no 'use client' directive)
// - Uses forwardRef for ref forwarding
// - Generates unique ID if not provided
// - Accessible with ARIA attributes and roles
// ====================================================

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const BASE_CLASSES =
  'flex w-full rounded-md border-2 bg-background px-3 py-2 text-sm transition-all duration-200 ease-in-out file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2';

const DEFAULT_TYPE = 'text';
const DEFAULT_ICON_POSITION = 'left';

const DISPLAY_NAME = 'InputField';

const CONTAINER_CLASSES = 'space-y-2';
const LABEL_CLASSES =
  'text-sm font-medium leading-none text-gray-700 peer-disabled:cursor-not-allowed peer-disabled:opacity-70';
const REQUIRED_INDICATOR_CLASSES = 'text-red-500 ml-1';
const INPUT_WRAPPER_CLASSES = 'relative';
const ICON_LEFT_CLASSES =
  'absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none';
const ICON_RIGHT_CLASSES = 'absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400';
const ICON_PADDING_LEFT = 'pl-10';
const ICON_PADDING_RIGHT = 'pr-10';
const ERROR_MESSAGE_CLASSES = 'text-sm text-red-600 mt-1';
const SUCCESS_MESSAGE_CLASSES = 'text-sm text-green-600 mt-1';

const ROLE_ALERT = 'alert';
const ROLE_STATUS = 'status';
const ARIA_INVALID_TRUE = 'true';
const ARIA_INVALID_FALSE = 'false';

const inputFieldVariants = cva(BASE_CLASSES, {
  variants: {
    variant: {
      default: 'border-gray-400 hover:border-gray-500 focus:border-blue-600 focus:ring-blue-600/20',
      error: 'border-red-500 hover:border-red-600 focus:border-red-600 focus:ring-red-600/20',
      success:
        'border-green-500 hover:border-green-600 focus:border-green-600 focus:ring-green-600/20',
    },
    size: {
      default: 'h-10',
      sm: 'h-9 px-2 text-xs',
      lg: 'h-11 px-4',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

export interface InputFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputFieldVariants> {
  label?: string;
  error?: string;
  success?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  required?: boolean;
}

/**
 * Component: InputField
 * Description:
 * - Input field component with label, error, and success message support
 * - Supports multiple visual variants and sizes
 * - Optional icon display on left or right side
 * - Uses forwardRef for ref forwarding
 * - Generates unique ID automatically if not provided
 * - Accessible with ARIA attributes and roles
 * - Automatically switches to error/success variant based on error/success props
 *
 * Parameters:
 * - className (string, optional): Additional CSS classes
 * - variant ('default' | 'error' | 'success', optional): Visual variant (default: 'default', overridden by error/success props)
 * - size ('default' | 'sm' | 'lg', optional): Size variant (default: 'default')
 * - type (string, optional): Input type (default: 'text')
 * - label (string, optional): Label text for the input
 * - error (string, optional): Error message to display
 * - success (string, optional): Success message to display
 * - icon (ReactNode, optional): Icon to display
 * - iconPosition ('left' | 'right', optional): Icon position (default: 'left')
 * - required (boolean, optional): Whether the field is required
 * - id (string, optional): Unique ID for the input (auto-generated if not provided)
 * - ...props (InputHTMLAttributes): Additional HTML input attributes
 *
 * Returns:
 * - React.ReactElement: The input field component
 *
 * Example:
 * ```tsx
 * <InputField label="Email" type="email" required />
 * <InputField label="Password" error="Password is required" icon={<Lock />} />
 * <InputField label="Username" success="Username available" />
 * ```
 */
const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  (
    {
      className,
      variant,
      size,
      type = DEFAULT_TYPE,
      label,
      error,
      success,
      icon,
      iconPosition = DEFAULT_ICON_POSITION,
      required,
      id,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const successId = `${inputId}-success`;

    const hasError = !!error;
    const hasSuccess = !!success && !hasError;

    const finalVariant = hasError ? 'error' : hasSuccess ? 'success' : variant;

    return (
      <div className={CONTAINER_CLASSES}>
        {label && (
          <label htmlFor={inputId} className={LABEL_CLASSES}>
            {label}
            {required && <span className={REQUIRED_INDICATOR_CLASSES}>*</span>}
          </label>
        )}
        <div className={INPUT_WRAPPER_CLASSES}>
          {icon && iconPosition === 'left' && <div className={ICON_LEFT_CLASSES}>{icon}</div>}
          <input
            type={type}
            id={inputId}
            className={cn(
              inputFieldVariants({ variant: finalVariant, size }),
              icon && iconPosition === 'left' && ICON_PADDING_LEFT,
              icon && iconPosition === 'right' && ICON_PADDING_RIGHT,
              className,
            )}
            required={required}
            aria-invalid={hasError ? ARIA_INVALID_TRUE : ARIA_INVALID_FALSE}
            aria-describedby={hasError ? errorId : hasSuccess ? successId : undefined}
            ref={ref}
            {...props}
          />
          {icon && iconPosition === 'right' && <div className={ICON_RIGHT_CLASSES}>{icon}</div>}
        </div>
        {error && (
          <p id={errorId} role={ROLE_ALERT} className={ERROR_MESSAGE_CLASSES}>
            {error}
          </p>
        )}
        {success && !error && (
          <p id={successId} role={ROLE_STATUS} className={SUCCESS_MESSAGE_CLASSES}>
            {success}
          </p>
        )}
      </div>
    );
  },
);

InputField.displayName = DISPLAY_NAME;

export { InputField, inputFieldVariants };
