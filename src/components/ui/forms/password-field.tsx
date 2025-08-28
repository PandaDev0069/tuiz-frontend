import * as React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const passwordFieldVariants = cva(
  'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-gray-300',
        error: 'border-red-500',
        success: 'border-green-500',
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
  },
);

export interface PasswordFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'>,
    VariantProps<typeof passwordFieldVariants> {
  label?: string;
  error?: string;
  success?: string;
  required?: boolean;
  showToggle?: boolean;
}

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
      showToggle = true,
      id,
      disabled,
      ...props
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const successId = `${inputId}-success`;

    const hasError = !!error;
    const hasSuccess = !!success && !hasError;
    const finalVariant = hasError ? 'error' : hasSuccess ? 'success' : variant;

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
      // Maintain focus on the input after toggling
      const input = document.getElementById(inputId) as HTMLInputElement;
      if (input) {
        input.focus();
      }
    };

    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            id={inputId}
            className={cn(
              passwordFieldVariants({ variant: finalVariant, size }),
              'pr-10',
              className,
            )}
            required={required}
            disabled={disabled}
            aria-invalid={hasError ? 'true' : 'false'}
            aria-describedby={hasError ? errorId : hasSuccess ? successId : undefined}
            ref={ref}
            {...props}
          />
          {showToggle && (
            <button
              type="button"
              onClick={togglePasswordVisibility}
              disabled={disabled}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
        </div>
        {error && (
          <p id={errorId} role="alert" className="text-sm text-red-600 mt-1">
            {error}
          </p>
        )}
        {success && !error && (
          <p id={successId} role="status" className="text-sm text-green-600 mt-1">
            {success}
          </p>
        )}
      </div>
    );
  },
);

PasswordField.displayName = 'PasswordField';

export { PasswordField, passwordFieldVariants };
