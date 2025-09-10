import * as React from 'react';
import { Check } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const checkboxVariants = cva(
  'peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow-sm hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-1 sm:focus:ring-offset-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 active:scale-95',
  {
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
  },
);

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'>,
    VariantProps<typeof checkboxVariants> {
  label?: string;
  description?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, variant, size, label, description, id, checked, ...props }, ref) => {
    const generatedId = React.useId();
    const checkboxId = id || generatedId;

    return (
      <div className="flex items-start space-x-2">
        <div className="relative flex items-center">
          <input
            type="checkbox"
            id={checkboxId}
            ref={ref}
            className={cn(
              checkboxVariants({ variant, size }),
              'absolute opacity-0 cursor-pointer h-full w-full',
              className,
            )}
            checked={checked}
            {...props}
          />
          <div
            className={cn(
              checkboxVariants({ variant, size }),
              'flex items-center justify-center transition-all duration-200',
              checked && 'bg-blue-600 border-blue-600 text-white',
              !checked && 'bg-white hover:bg-gray-100 border-opacity-80 hover:border-opacity-100',
            )}
          >
            {checked && <Check className="h-3 w-3 stroke-[3]" />}
          </div>
        </div>
        {(label || description) && (
          <div className="flex flex-col min-h-[1.5rem] sm:min-h-[1.25rem]">
            {label && (
              <label
                htmlFor={checkboxId}
                className="text-sm font-medium leading-tight sm:leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{description}</p>
            )}
          </div>
        )}
      </div>
    );
  },
);

Checkbox.displayName = 'Checkbox';

export { Checkbox, checkboxVariants };
