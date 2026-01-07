// ====================================================
// File Name   : switch.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-02
// Last Update : 2025-09-02
//
// Description:
// - Toggle switch component with customizable variants and sizes
// - Supports multiple visual variants (default, primary, success, warning, error)
// - Supports multiple sizes (sm, md, lg)
// - Accessible with ARIA attributes
//
// Notes:
// - Client component (uses 'use client' directive)
// - Uses button element with role="switch" for accessibility
// ====================================================

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

const DEFAULT_DISABLED = false;
const DEFAULT_SIZE = 'md';
const DEFAULT_VARIANT = 'default';

const BASE_CLASSES =
  'relative inline-flex items-center rounded transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2';
const SHADOW_CLASSES = 'shadow-sm';
const DISABLED_CLASSES = 'opacity-50 cursor-not-allowed';

const THUMB_BASE_CLASSES =
  'inline-block bg-white rounded shadow-lg transform transition-all duration-300 ease-in-out';
const THUMB_BORDER_CLASSES = 'border border-gray-200';
const THUMB_CHECKED_SHADOW_CLASSES = 'shadow-md';

const ROLE_SWITCH = 'switch';

const sizeClasses = {
  sm: 'h-5 w-9',
  md: 'h-6 w-11',
  lg: 'h-7 w-13',
} as const;

const variantClasses = {
  default: (checked: boolean) =>
    checked
      ? 'bg-gray-400 focus:ring-gray-300 shadow-inner'
      : 'bg-gray-300 focus:ring-gray-200 shadow-inner',
  primary: (checked: boolean) =>
    checked
      ? 'bg-blue-500 focus:ring-blue-300 shadow-inner'
      : 'bg-gray-300 focus:ring-gray-200 shadow-inner',
  success: (checked: boolean) =>
    checked
      ? 'bg-green-500 focus:ring-green-300 shadow-inner'
      : 'bg-gray-300 focus:ring-gray-200 shadow-inner',
  warning: (checked: boolean) =>
    checked
      ? 'bg-yellow-500 focus:ring-yellow-300 shadow-inner'
      : 'bg-gray-300 focus:ring-gray-200 shadow-inner',
  error: (checked: boolean) =>
    checked
      ? 'bg-red-500 focus:ring-red-300 shadow-inner'
      : 'bg-gray-300 focus:ring-gray-200 shadow-inner',
} as const;

const thumbSizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
} as const;

const thumbPositionClasses = {
  sm: (checked: boolean) => (checked ? 'translate-x-4' : 'translate-x-0.5'),
  md: (checked: boolean) => (checked ? 'translate-x-5' : 'translate-x-0.5'),
  lg: (checked: boolean) => (checked ? 'translate-x-6' : 'translate-x-0.5'),
} as const;

export interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  className?: string;
  id?: string;
}

/**
 * Component: Switch
 * Description:
 * - Toggle switch component with customizable variants and sizes
 * - Supports multiple visual variants and sizes
 * - Accessible with ARIA attributes (role="switch", aria-checked)
 * - Handles click events to toggle checked state
 *
 * Parameters:
 * - checked (boolean): Whether the switch is checked
 * - onCheckedChange (function): Callback when switch state changes
 * - disabled (boolean, optional): Whether the switch is disabled (default: false)
 * - size ('sm' | 'md' | 'lg', optional): Size variant (default: 'md')
 * - variant ('default' | 'primary' | 'success' | 'warning' | 'error', optional): Visual variant (default: 'default')
 * - className (string, optional): Additional CSS classes
 * - id (string, optional): Unique ID for the switch
 *
 * Returns:
 * - React.ReactElement: The switch component
 *
 * Example:
 * ```tsx
 * <Switch checked={isEnabled} onCheckedChange={setIsEnabled} />
 * <Switch variant="success" size="lg" checked={true} onCheckedChange={handleChange} />
 * ```
 */
export const Switch: React.FC<SwitchProps> = ({
  checked,
  onCheckedChange,
  disabled = DEFAULT_DISABLED,
  size = DEFAULT_SIZE,
  variant = DEFAULT_VARIANT,
  className,
  id,
}) => {
  const handleClick = (): void => {
    if (!disabled) {
      onCheckedChange(!checked);
    }
  };

  return (
    <button
      type="button"
      id={id}
      className={cn(
        BASE_CLASSES,
        sizeClasses[size],
        variantClasses[variant](checked),
        disabled && DISABLED_CLASSES,
        SHADOW_CLASSES,
        className,
      )}
      onClick={handleClick}
      disabled={disabled}
      role={ROLE_SWITCH}
      aria-checked={checked}
    >
      <span
        className={cn(
          THUMB_BASE_CLASSES,
          THUMB_BORDER_CLASSES,
          thumbSizeClasses[size],
          thumbPositionClasses[size](checked),
          checked && THUMB_CHECKED_SHADOW_CLASSES,
        )}
      />
    </button>
  );
};
