// ====================================================
// File Name   : tabs.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-17
// Last Update : 2025-09-17
//
// Description:
// - Tabs component system with context-based state management
// - Provides Tabs, TabsList, TabsTrigger, and TabsContent components
// - Supports controlled tab switching with accessibility features
//
// Notes:
// - Client-only component (requires 'use client')
// - Uses React Context for state management
// - Includes ARIA attributes for accessibility
// ====================================================

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

const DEFAULT_CONTEXT_VALUE = '';
const DEFAULT_ON_VALUE_CHANGE = (): void => {};

const TABS_BASE_CLASSES = 'w-full';
const TABS_LIST_BASE_CLASSES =
  'inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500';
const TABS_TRIGGER_BASE_CLASSES =
  'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
const TABS_TRIGGER_ACTIVE_CLASSES = 'bg-white text-gray-950 shadow-sm';
const TABS_TRIGGER_INACTIVE_CLASSES = 'text-gray-600 hover:text-gray-900';
const TABS_CONTENT_BASE_CLASSES =
  'mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2';

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue>({
  value: DEFAULT_CONTEXT_VALUE,
  onValueChange: DEFAULT_ON_VALUE_CHANGE,
});

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Component: Tabs
 * Description:
 * - Root tabs component that provides context for tab state
 * - Manages active tab value and change handler
 * - Wraps tab list and content components
 *
 * Parameters:
 * - value (string): Currently active tab value
 * - onValueChange (function): Callback when tab value changes
 * - children (React.ReactNode): Tab children (TabsList, TabsContent)
 * - className (string, optional): Additional CSS classes
 *
 * Returns:
 * - React.ReactElement: The tabs component
 *
 * Example:
 * ```tsx
 * <Tabs value="tab1" onValueChange={setValue}>
 *   <TabsList>...</TabsList>
 *   <TabsContent value="tab1">Content</TabsContent>
 * </Tabs>
 * ```
 */
const Tabs: React.FC<TabsProps> = ({ value, onValueChange, children, className }) => {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={cn(TABS_BASE_CLASSES, className)}>{children}</div>
    </TabsContext.Provider>
  );
};

/**
 * Component: TabsList
 * Description:
 * - Container component for tab triggers
 * - Provides styling and ARIA role for tab list
 * - Wraps multiple TabsTrigger components
 *
 * Parameters:
 * - children (React.ReactNode): Tab trigger components
 * - className (string, optional): Additional CSS classes
 *
 * Returns:
 * - React.ReactElement: The tabs list component
 *
 * Example:
 * ```tsx
 * <TabsList>
 *   <TabsTrigger value="tab1">Tab 1</TabsTrigger>
 *   <TabsTrigger value="tab2">Tab 2</TabsTrigger>
 * </TabsList>
 * ```
 */
const TabsList: React.FC<TabsListProps> = ({ children, className }) => {
  return (
    <div className={cn(TABS_LIST_BASE_CLASSES, className)} role="tablist">
      {children}
    </div>
  );
};

/**
 * Component: TabsTrigger
 * Description:
 * - Individual tab trigger button component
 * - Handles tab selection and displays active state
 * - Includes accessibility attributes and keyboard support
 *
 * Parameters:
 * - value (string): Unique value for this tab
 * - children (React.ReactNode): Tab trigger content
 * - className (string, optional): Additional CSS classes
 *
 * Returns:
 * - React.ReactElement: The tabs trigger component
 *
 * Example:
 * ```tsx
 * <TabsTrigger value="tab1">Tab 1</TabsTrigger>
 * ```
 */
const TabsTrigger: React.FC<TabsTriggerProps> = ({ value, children, className }) => {
  const { value: activeValue, onValueChange } = React.useContext(TabsContext);
  const isActive = value === activeValue;

  return (
    <button
      className={cn(
        TABS_TRIGGER_BASE_CLASSES,
        isActive ? TABS_TRIGGER_ACTIVE_CLASSES : TABS_TRIGGER_INACTIVE_CLASSES,
        className,
      )}
      onClick={() => onValueChange(value)}
      role="tab"
      aria-selected={isActive}
    >
      {children}
    </button>
  );
};

/**
 * Component: TabsContent
 * Description:
 * - Content panel component for tab content
 * - Only renders when its value matches active tab
 * - Provides ARIA role for tab panel
 *
 * Parameters:
 * - value (string): Unique value for this content panel
 * - children (React.ReactNode): Tab content
 * - className (string, optional): Additional CSS classes
 *
 * Returns:
 * - React.ReactElement | null: The tabs content component or null if not active
 *
 * Example:
 * ```tsx
 * <TabsContent value="tab1">
 *   <p>Tab 1 content</p>
 * </TabsContent>
 * ```
 */
const TabsContent: React.FC<TabsContentProps> = ({ value, children, className }) => {
  const { value: activeValue } = React.useContext(TabsContext);

  if (value !== activeValue) {
    return null;
  }

  return (
    <div className={cn(TABS_CONTENT_BASE_CLASSES, className)} role="tabpanel">
      {children}
    </div>
  );
};

export { Tabs, TabsList, TabsTrigger, TabsContent };
