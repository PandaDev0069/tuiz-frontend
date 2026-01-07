// ====================================================
// File Name   : LibraryTabs.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-17
// Last Update : 2025-09-17
//
// Description:
// - Tab component for switching between my-library and public-browse views
// - Provides reusable tab components (Tabs, TabsList, TabsTrigger, TabsContent)
// - Displays library tabs with icons and labels
// - Supports active tab state and tab change callbacks
//
// Notes:
// - Client-only component (requires 'use client')
// - Uses React.cloneElement to pass props to children
// - Simple tabs implementation without external dependencies
// ====================================================

'use client';

import React from 'react';
import { Library, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

const TAB_VALUE_MY_LIBRARY = 'my-library';
const TAB_VALUE_PUBLIC_BROWSE = 'public-browse';

const ICON_SIZE_SMALL = 'w-4 h-4';

const TABS_CONTAINER_CLASSES = 'w-full';
const TABS_LIST_BASE_CLASSES =
  'inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500';
const TABS_LIST_GRID_CLASSES = 'grid w-full grid-cols-2 max-w-md mb-8';

const TABS_TRIGGER_BASE_CLASSES =
  'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all';
const TABS_TRIGGER_ACTIVE_CLASSES = 'bg-white text-gray-950 shadow-sm';
const TABS_TRIGGER_INACTIVE_CLASSES = 'text-gray-600 hover:text-gray-900';
const TABS_TRIGGER_WITH_ICON_CLASSES = 'flex items-center gap-2';

const TABS_CONTENT_CLASSES = 'mt-2';

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
  activeTab?: string;
  onTabChange?: (value: string) => void;
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  activeTab?: string;
  onTabChange?: (value: string) => void;
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  activeTab?: string;
}

interface LibraryTabsProps {
  activeTab: 'my-library' | 'public-browse';
  onTabChange: (tab: 'my-library' | 'public-browse') => void;
  children: React.ReactNode;
}

/**
 * Component: Tabs
 * Description:
 * - Root component for tab system
 * - Manages active tab state and provides it to children
 * - Uses React.cloneElement to pass props to child components
 *
 * Parameters:
 * - value (string): Currently active tab value
 * - onValueChange (function): Callback when tab changes
 * - children (React.ReactNode): Tab children components
 * - className (string, optional): Additional CSS classes
 *
 * Returns:
 * - React.ReactElement: The tabs container component
 */
const Tabs: React.FC<TabsProps> = ({ value, onValueChange, children, className }) => {
  return (
    <div className={cn(TABS_CONTAINER_CLASSES, className)}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(
            child as React.ReactElement<{
              activeTab?: string;
              onTabChange?: (value: string) => void;
            }>,
            { activeTab: value, onTabChange: onValueChange },
          );
        }
        return child;
      })}
    </div>
  );
};

/**
 * Component: TabsList
 * Description:
 * - Container component for tab triggers
 * - Provides styling for tab list background
 * - Passes active tab state to trigger children
 *
 * Parameters:
 * - children (React.ReactNode): Tab trigger components
 * - className (string, optional): Additional CSS classes
 * - activeTab (string, optional): Currently active tab value
 * - onTabChange (function, optional): Callback when tab changes
 *
 * Returns:
 * - React.ReactElement: The tabs list container component
 */
const TabsList: React.FC<TabsListProps> = ({ children, className, activeTab, onTabChange }) => {
  return (
    <div className={cn(TABS_LIST_BASE_CLASSES, className)}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(
            child as React.ReactElement<{
              activeTab?: string;
              onTabChange?: (value: string) => void;
            }>,
            { activeTab, onTabChange },
          );
        }
        return child;
      })}
    </div>
  );
};

/**
 * Component: TabsTrigger
 * Description:
 * - Individual tab trigger button
 * - Shows active/inactive states with different styling
 * - Handles click events to change active tab
 *
 * Parameters:
 * - value (string): Unique value for this tab
 * - children (React.ReactNode): Tab trigger content
 * - className (string, optional): Additional CSS classes
 * - activeTab (string, optional): Currently active tab value
 * - onTabChange (function, optional): Callback when tab changes
 *
 * Returns:
 * - React.ReactElement: The tab trigger button component
 */
const TabsTrigger: React.FC<TabsTriggerProps> = ({
  value,
  children,
  className,
  activeTab,
  onTabChange,
}) => {
  const isActive = value === activeTab;

  return (
    <button
      className={cn(
        TABS_TRIGGER_BASE_CLASSES,
        isActive ? TABS_TRIGGER_ACTIVE_CLASSES : TABS_TRIGGER_INACTIVE_CLASSES,
        className,
      )}
      onClick={() => onTabChange?.(value)}
    >
      {children}
    </button>
  );
};

/**
 * Component: TabsContent
 * Description:
 * - Content container for tab panels
 * - Only renders when its value matches active tab
 * - Provides spacing between tabs and content
 *
 * Parameters:
 * - value (string): Unique value for this content panel
 * - children (React.ReactNode): Content to display
 * - className (string, optional): Additional CSS classes
 * - activeTab (string, optional): Currently active tab value
 *
 * Returns:
 * - React.ReactElement | null: The tab content component or null if not active
 */
const TabsContent: React.FC<TabsContentProps> = ({ value, children, className, activeTab }) => {
  if (value !== activeTab) {
    return null;
  }

  return <div className={cn(TABS_CONTENT_CLASSES, className)}>{children}</div>;
};

/**
 * Component: LibraryTabs
 * Description:
 * - Main component for library tab navigation
 * - Provides tabs for switching between my-library and public-browse views
 * - Displays icons and labels for each tab
 * - Manages tab state and change callbacks
 *
 * Parameters:
 * - activeTab ('my-library' | 'public-browse'): Currently active tab
 * - onTabChange (function): Callback when tab changes
 * - children (React.ReactNode): Tab content components
 *
 * Returns:
 * - React.ReactElement: The library tabs component
 *
 * Example:
 * ```tsx
 * <LibraryTabs
 *   activeTab="my-library"
 *   onTabChange={(tab) => setActiveTab(tab)}
 * >
 *   <TabsContent value="my-library">My Library Content</TabsContent>
 *   <TabsContent value="public-browse">Public Browse Content</TabsContent>
 * </LibraryTabs>
 * ```
 */
export const LibraryTabs: React.FC<LibraryTabsProps> = ({ activeTab, onTabChange, children }) => {
  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => onTabChange(value as 'my-library' | 'public-browse')}
      className={TABS_CONTAINER_CLASSES}
    >
      <TabsList className={TABS_LIST_GRID_CLASSES}>
        <TabsTrigger value={TAB_VALUE_MY_LIBRARY} className={TABS_TRIGGER_WITH_ICON_CLASSES}>
          <Library className={ICON_SIZE_SMALL} />
          マイライブラリ
        </TabsTrigger>
        <TabsTrigger value={TAB_VALUE_PUBLIC_BROWSE} className={TABS_TRIGGER_WITH_ICON_CLASSES}>
          <Globe className={ICON_SIZE_SMALL} />
          パブリック
        </TabsTrigger>
      </TabsList>

      {children}
    </Tabs>
  );
};

export { Tabs, TabsList, TabsTrigger, TabsContent };
