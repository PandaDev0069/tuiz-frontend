// ====================================================
// File Name   : password-field.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-08-21
// Last Update : 2025-08-29
//
// Description:
// - Password input field component with show/hide toggle functionality
// - Supports label, error, and success message display
// - Supports multiple variants (default, error, success)
// - Supports multiple sizes (default, sm, lg)
// - Optional password visibility toggle button
// - Uses class-variance-authority for variant management
//
// Notes:
// - Server and client compatible (no 'use client' directive)
// - Uses forwardRef for ref forwarding
// - Generates unique ID if not provided
// - Accessible with ARIA attributes and roles
// ====================================================

import * as React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const BASE_CLASSES =
  'flex w-full rounded-md border-2 bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2';

const DEFAULT_SHOW_TOGGLE = true;
const DEFAULT_SHOW_PASSWORD = false;

const DISPLAY_NAME = 'PasswordField';

const CONTAINER_CLASSES = 'space-y-2';
const LABEL_CLASSES =
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70';
const REQUIRED_INDICATOR_CLASSES = 'text-red-500 ml-1';
const INPUT_WRAPPER_CLASSES = 'relative';
const INPUT_PADDING_RIGHT = 'pr-10';
const TOGGLE_BUTTON_CLASSES =
  'absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
const TOGGLE_BUTTON_TAB_INDEX = -1;
const ICON_CLASSES = 'h-4 w-4';
const ERROR_MESSAGE_CLASSES = 'text-sm text-red-600 mt-1';
const SUCCESS_MESSAGE_CLASSES = 'text-sm text-green-600 mt-1';

const ROLE_ALERT = 'alert';
const ROLE_STATUS = 'status';
const ARIA_INVALID_TRUE = 'true';
const ARIA_INVALID_FALSE = 'false';

const passwordFieldVariants = cva(BASE_CLASSES, {
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

export interface PasswordFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'>,
    VariantProps<typeof passwordFieldVariants> {
  label?: string;
  error?: string;
  success?: string;
  required?: boolean;
  showToggle?: boolean;
}

/**
 * Component: PasswordField
 * Description:
 * - Password input field with show/hide toggle functionality
 * - Supports label, error, and success message display
 * - Supports multiple visual variants and sizes
 * - Optional password visibility toggle button
 * - Uses forwardRef for ref forwarding
 * - Generates unique ID automatically if not provided
 * - Accessible with ARIA attributes and roles
 * - Automatically switches to error/success variant based on error/success props
 * - Maintains focus on input after toggling password visibility
 *
 * Parameters:
 * - className (string, optional): Additional CSS classes
 * - variant ('default' | 'error' | 'success', optional): Visual variant (default: 'default', overridden by error/success props)
 * - size ('default' | 'sm' | 'lg', optional): Size variant (default: 'default')
 * - label (string, optional): Label text for the input
 * - error (string, optional): Error message to display
 * - success (string, optional): Success message to display
 * - required (boolean, optional): Whether the field is required
 * - showToggle (boolean, optional): Whether to show password toggle button (default: true)
 * - id (string, optional): Unique ID for the input (auto-generated if not provided)
 * - disabled (boolean, optional): Whether the input is disabled
 * - ...props (InputHTMLAttributes): Additional HTML input attributes
 *
 * Returns:
 * - React.ReactElement: The password field component
 *
 * Example:
 * ```tsx
 * <PasswordField label="Password" required />
 * <PasswordField label="Confirm Password" error="Passwords do not match" />
 * <PasswordField label="New Password" success="Password is strong" showToggle={true} />
 * ```
 */
const PasswordField = React.forwardRef<HTMLInputElement, PasswordFieldProps>(
  (
    {
      className,
      variant,
      size,
      label,
      error,
      success,
      required,
      showToggle = DEFAULT_SHOW_TOGGLE,
      id,
      disabled,
      ...props
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = React.useState(DEFAULT_SHOW_PASSWORD);
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const successId = `${inputId}-success`;

    const hasError = !!error;
    const hasSuccess = !!success && !hasError;
    const finalVariant = hasError ? 'error' : hasSuccess ? 'success' : variant;

    const togglePasswordVisibility = (): void => {
      setShowPassword(!showPassword);
      const input = document.getElementById(inputId) as HTMLInputElement;
      if (input) {
        input.focus();
      }
    };

    return (
      <div className={CONTAINER_CLASSES}>
        {label && (
          <label htmlFor={inputId} className={LABEL_CLASSES}>
            {label}
            {required && <span className={REQUIRED_INDICATOR_CLASSES}>*</span>}
          </label>
        )}
        <div className={INPUT_WRAPPER_CLASSES}>
          <input
            type={showPassword ? 'text' : 'password'}
            id={inputId}
            className={cn(
              passwordFieldVariants({ variant: finalVariant, size }),
              INPUT_PADDING_RIGHT,
              className,
            )}
            required={required}
            disabled={disabled}
            aria-invalid={hasError ? ARIA_INVALID_TRUE : ARIA_INVALID_FALSE}
            aria-describedby={hasError ? errorId : hasSuccess ? successId : undefined}
            ref={ref}
            {...props}
          />
          {showToggle && (
            <button
              type="button"
              onClick={togglePasswordVisibility}
              disabled={disabled}
              className={TOGGLE_BUTTON_CLASSES}
              tabIndex={TOGGLE_BUTTON_TAB_INDEX}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className={ICON_CLASSES} />
              ) : (
                <Eye className={ICON_CLASSES} />
              )}
            </button>
          )}
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

PasswordField.displayName = DISPLAY_NAME;

export { PasswordField, passwordFieldVariants };
