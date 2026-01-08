// ====================================================
// File Name   : select.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-02
// Last Update : 2025-09-04
//
// Description:
// - Select dropdown component with portal-based positioning
// - Supports multiple variants and sizes
// - Auto-positions dropdown to fit within viewport
// - Handles click outside, scroll, and resize events
// - Includes additional sub-components for complex usage
//
// Notes:
// - Client component (uses 'use client' directive)
// - Uses React portals for dropdown positioning
// - Uses React hooks for state and event management
// ====================================================

'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { ChevronDown, Check } from 'lucide-react';

const DEFAULT_PLACEHOLDER = 'Select an option';
const DEFAULT_DISABLED = false;
const DEFAULT_VARIANT = 'default';
const DEFAULT_SIZE = 'md';
const DEFAULT_DISABLED_OPTION = false;

const ITEM_HEIGHT_PX = 44;
const DROPDOWN_PADDING_PX = 8;
const MAX_DROPDOWN_HEIGHT_PX = 240;
const DROPDOWN_OFFSET_PX = 4;
const VIEWPORT_MARGIN_PX = 10;
const SCROLL_THRESHOLD_PX = 50;
const CLICK_OUTSIDE_DELAY_MS = 10;

const BASE_CLASSES =
  'relative w-full border rounded-md shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1';
const TRIGGER_BUTTON_CLASSES = 'flex items-center justify-between text-left';
const TRIGGER_DISABLED_CLASSES = 'opacity-50 cursor-not-allowed bg-gray-50';
const SELECTED_TEXT_CLASSES = 'text-gray-900';
const PLACEHOLDER_TEXT_CLASSES = 'text-gray-500';
const CHEVRON_BASE_CLASSES = 'h-4 w-4 text-gray-400 transition-transform duration-200';
const DROPDOWN_PORTAL_CLASSES =
  'fixed z-[9999] bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto';
const DROPDOWN_FALLBACK_CLASSES =
  'absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto';
const OPTION_BUTTON_BASE_CLASSES =
  'w-full px-3 py-2 text-left text-sm transition-colors duration-150 flex items-center justify-between';
const OPTION_BUTTON_HOVER_CLASSES = 'hover:bg-blue-50 focus:bg-blue-50 focus:outline-none';
const OPTION_BUTTON_DISABLED_CLASSES = 'opacity-50 cursor-not-allowed';
const OPTION_BUTTON_SELECTED_CLASSES = 'bg-blue-100 text-blue-900';
const CHECK_ICON_CLASSES = 'h-4 w-4 text-blue-600';

const variantClasses = {
  default: 'border-2 border-blue-500 focus:ring-blue-500 focus:border-blue-600',
  primary: 'border-2 border-blue-500 focus:ring-blue-500 focus:border-blue-600',
  success: 'border-2 border-green-500 focus:ring-green-500 focus:border-green-600',
  warning: 'border-2 border-yellow-500 focus:ring-yellow-500 focus:border-yellow-600',
  error: 'border-2 border-red-500 focus:ring-red-500 focus:border-red-600',
} as const;

const sizeClasses = {
  sm: 'px-2 py-1 text-sm',
  md: 'px-3 py-2 text-sm',
  lg: 'px-4 py-3 text-base',
} as const;

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  id?: string;
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  options: SelectOption[];
  disabled?: boolean;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Function: calculateDropdownHeight
 * Description:
 * - Calculates the estimated dropdown height based on number of options
 * - Uses item height and padding, capped at maximum height
 *
 * Parameters:
 * - optionCount (number): Number of options in the dropdown
 *
 * Returns:
 * - number: Estimated dropdown height in pixels
 *
 * Example:
 * ```ts
 * const height = calculateDropdownHeight(5);
 * // Returns calculated height based on 5 items
 * ```
 */
const calculateDropdownHeight = (optionCount: number): number => {
  return Math.min(optionCount * ITEM_HEIGHT_PX + DROPDOWN_PADDING_PX, MAX_DROPDOWN_HEIGHT_PX);
};

/**
 * Function: calculateDropdownPosition
 * Description:
 * - Calculates optimal dropdown position relative to trigger
 * - Positions above or below based on available space
 * - Adjusts horizontal position to fit within viewport
 * - Ensures dropdown stays within viewport bounds
 *
 * Parameters:
 * - rect (DOMRect): Bounding rectangle of the trigger element
 * - dropdownHeight (number): Height of the dropdown
 * - dropdownWidth (number): Width of the dropdown
 *
 * Returns:
 * - { top: number; left: number; width: number }: Dropdown position
 *
 * Example:
 * ```ts
 * const position = calculateDropdownPosition(rect, 200, 300);
 * // Returns { top: 100, left: 50, width: 300 }
 * ```
 */
const calculateDropdownPosition = (
  rect: DOMRect,
  dropdownHeight: number,
  dropdownWidth: number,
): { top: number; left: number; width: number } => {
  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;

  let top = rect.bottom + DROPDOWN_OFFSET_PX;
  let left = rect.left;

  const spaceBelow = viewportHeight - rect.bottom;
  const spaceAbove = rect.top;

  if (spaceBelow < dropdownHeight + VIEWPORT_MARGIN_PX && spaceAbove > spaceBelow) {
    top = rect.top - dropdownHeight - DROPDOWN_OFFSET_PX;
  }

  if (left + dropdownWidth > viewportWidth - VIEWPORT_MARGIN_PX) {
    left = viewportWidth - dropdownWidth - VIEWPORT_MARGIN_PX;
  }
  if (left < VIEWPORT_MARGIN_PX) {
    left = VIEWPORT_MARGIN_PX;
  }

  if (top < VIEWPORT_MARGIN_PX) {
    top = VIEWPORT_MARGIN_PX;
  } else if (top + dropdownHeight > viewportHeight - VIEWPORT_MARGIN_PX) {
    top = viewportHeight - dropdownHeight - VIEWPORT_MARGIN_PX;
  }

  return { top, left, width: dropdownWidth };
};

/**
 * Component: Select
 * Description:
 * - Select dropdown component with portal-based positioning
 * - Supports multiple visual variants and sizes
 * - Auto-positions dropdown to fit within viewport
 * - Handles click outside, scroll, and resize events
 * - Closes dropdown when trigger is scrolled out of view
 * - Uses React portals for proper z-index stacking
 *
 * Parameters:
 * - id (string, optional): Unique ID for the select trigger
 * - value (string, optional): Selected option value
 * - onValueChange (function): Callback when option is selected
 * - placeholder (string, optional): Placeholder text (default: 'Select an option')
 * - options (SelectOption[]): Array of select options
 * - disabled (boolean, optional): Whether select is disabled (default: false)
 * - variant ('default' | 'primary' | 'success' | 'warning' | 'error', optional): Visual variant (default: 'default')
 * - size ('sm' | 'md' | 'lg', optional): Size variant (default: 'md')
 * - className (string, optional): Additional CSS classes
 *
 * Returns:
 * - React.ReactElement: The select component
 *
 * Example:
 * ```tsx
 * <Select
 *   options={[{ value: '1', label: 'Option 1' }]}
 *   onValueChange={(value) => console.log(value)}
 * />
 * ```
 */
export const Select: React.FC<SelectProps> = ({
  id,
  value,
  onValueChange,
  placeholder = DEFAULT_PLACEHOLDER,
  options,
  disabled = DEFAULT_DISABLED,
  variant = DEFAULT_VARIANT,
  size = DEFAULT_SIZE,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);
  const selectRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const updateDropdownPosition = useCallback((): void => {
    if (!triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const dropdownHeight = calculateDropdownHeight(options.length);
    const dropdownWidth = rect.width;
    const position = calculateDropdownPosition(rect, dropdownHeight, dropdownWidth);

    setDropdownPosition(position);
  }, [options.length]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      const target = event.target as Node;

      if (selectRef.current && selectRef.current.contains(target)) {
        return;
      }

      if (dropdownRef.current && dropdownRef.current.contains(target)) {
        return;
      }

      setIsOpen(false);
    };

    const handleScroll = (): void => {
      if (isOpen && triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        if (rect.bottom < -SCROLL_THRESHOLD_PX || rect.top > viewportHeight + SCROLL_THRESHOLD_PX) {
          setIsOpen(false);
        } else {
          updateDropdownPosition();
        }
      }
    };

    const handleResize = (): void => {
      if (isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, CLICK_OUTSIDE_DELAY_MS);

      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('mousedown', handleClickOutside);
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [isOpen, updateDropdownPosition]);

  useEffect(() => {
    if (isOpen) {
      updateDropdownPosition();
    } else {
      setDropdownPosition(null);
    }
  }, [isOpen, updateDropdownPosition]);

  const selectedOption = options.find((option) => option.value === value);

  const handleOptionClick = (option: SelectOption): void => {
    if (!option.disabled) {
      onValueChange(option.value);
      setIsOpen(false);
    }
  };

  const renderOption = (option: SelectOption): React.ReactElement => (
    <button
      key={option.value}
      type="button"
      className={cn(
        OPTION_BUTTON_BASE_CLASSES,
        OPTION_BUTTON_HOVER_CLASSES,
        option.disabled && OPTION_BUTTON_DISABLED_CLASSES,
        value === option.value && OPTION_BUTTON_SELECTED_CLASSES,
      )}
      onClick={() => handleOptionClick(option)}
      disabled={option.disabled}
    >
      <span>{option.label}</span>
      {value === option.value && <Check className={CHECK_ICON_CLASSES} />}
    </button>
  );

  return (
    <div ref={selectRef} className="relative">
      <button
        ref={triggerRef}
        id={id}
        type="button"
        className={cn(
          BASE_CLASSES,
          variantClasses[variant],
          sizeClasses[size],
          TRIGGER_BUTTON_CLASSES,
          disabled && TRIGGER_DISABLED_CLASSES,
          className,
        )}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <span className={cn(selectedOption ? SELECTED_TEXT_CLASSES : PLACEHOLDER_TEXT_CLASSES)}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={cn(CHEVRON_BASE_CLASSES, isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <>
          {dropdownPosition ? (
            createPortal(
              <div
                ref={dropdownRef}
                className={DROPDOWN_PORTAL_CLASSES}
                style={{
                  top: `${dropdownPosition.top}px`,
                  left: `${dropdownPosition.left}px`,
                  width: `${dropdownPosition.width}px`,
                }}
              >
                {options.map(renderOption)}
              </div>,
              document.body,
            )
          ) : (
            <div className={DROPDOWN_FALLBACK_CLASSES}>{options.map(renderOption)}</div>
          )}
        </>
      )}
    </div>
  );
};

/**
 * Component: SelectTrigger
 * Description:
 * - Wrapper component for select trigger content
 * - Provides consistent layout for trigger elements
 *
 * Parameters:
 * - children (ReactNode): Trigger content
 * - className (string, optional): Additional CSS classes
 *
 * Returns:
 * - React.ReactElement: The select trigger wrapper
 */
export const SelectTrigger: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <div className={cn('flex items-center justify-between', className)}>{children}</div>
);

/**
 * Component: SelectValue
 * Description:
 * - Displays the selected value or placeholder
 * - Changes text color based on whether value is selected
 *
 * Parameters:
 * - placeholder (string, optional): Placeholder text
 * - children (ReactNode, optional): Selected value content
 *
 * Returns:
 * - React.ReactElement: The select value display
 */
export const SelectValue: React.FC<{
  placeholder?: string;
  children?: React.ReactNode;
}> = ({ placeholder, children }) => (
  <span className={cn(children ? SELECTED_TEXT_CLASSES : PLACEHOLDER_TEXT_CLASSES)}>
    {children || placeholder}
  </span>
);

/**
 * Component: SelectContent
 * Description:
 * - Container component for select dropdown content
 * - Provides consistent styling for dropdown menu
 *
 * Parameters:
 * - children (ReactNode): Dropdown content
 * - className (string, optional): Additional CSS classes
 *
 * Returns:
 * - React.ReactElement: The select content container
 */
export const SelectContent: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <div className={cn(DROPDOWN_FALLBACK_CLASSES, className)}>{children}</div>
);

/**
 * Component: SelectItem
 * Description:
 * - Individual option item component for select dropdown
 * - Handles click events and disabled state
 *
 * Parameters:
 * - value (string): Option value
 * - children (ReactNode): Option label content
 * - disabled (boolean, optional): Whether option is disabled (default: false)
 * - onSelect (function, optional): Callback when option is selected
 *
 * Returns:
 * - React.ReactElement: The select item component
 */
export const SelectItem: React.FC<{
  value: string;
  children: React.ReactNode;
  disabled?: boolean;
  onSelect?: (value: string) => void;
}> = ({ value, children, disabled = DEFAULT_DISABLED_OPTION, onSelect }) => (
  <button
    type="button"
    className={cn(
      OPTION_BUTTON_BASE_CLASSES,
      OPTION_BUTTON_HOVER_CLASSES,
      disabled && OPTION_BUTTON_DISABLED_CLASSES,
    )}
    onClick={() => !disabled && onSelect?.(value)}
    disabled={disabled}
  >
    {children}
  </button>
);
