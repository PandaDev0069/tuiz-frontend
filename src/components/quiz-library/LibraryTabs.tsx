'use client';

import React from 'react';
import { Library, Globe } from 'lucide-react';

// Simple tabs implementation
const Tabs: React.FC<{
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}> = ({ value, onValueChange, children, className }) => {
  return (
    <div className={`w-full ${className || ''}`}>
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

const TabsList: React.FC<{
  children: React.ReactNode;
  className?: string;
  activeTab?: string;
  onTabChange?: (value: string) => void;
}> = ({ children, className, activeTab, onTabChange }) => {
  return (
    <div
      className={`inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500 ${className || ''}`}
    >
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

const TabsTrigger: React.FC<{
  value: string;
  children: React.ReactNode;
  className?: string;
  activeTab?: string;
  onTabChange?: (value: string) => void;
}> = ({ value, children, className, activeTab, onTabChange }) => {
  const isActive = value === activeTab;

  return (
    <button
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all ${
        isActive ? 'bg-white text-gray-950 shadow-sm' : 'text-gray-600 hover:text-gray-900'
      } ${className || ''}`}
      onClick={() => onTabChange?.(value)}
    >
      {children}
    </button>
  );
};

const TabsContent: React.FC<{
  value: string;
  children: React.ReactNode;
  className?: string;
  activeTab?: string;
}> = ({ value, children, className, activeTab }) => {
  if (value !== activeTab) {
    return null;
  }

  return <div className={`mt-2 ${className || ''}`}>{children}</div>;
};

interface LibraryTabsProps {
  activeTab: 'my-library' | 'public-browse';
  onTabChange: (tab: 'my-library' | 'public-browse') => void;
  children: React.ReactNode;
}

export const LibraryTabs: React.FC<LibraryTabsProps> = ({ activeTab, onTabChange, children }) => {
  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => onTabChange(value as 'my-library' | 'public-browse')}
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-2 max-w-md mb-8">
        <TabsTrigger value="my-library" className="flex items-center gap-2">
          <Library className="w-4 h-4" />
          マイライブラリ
        </TabsTrigger>
        <TabsTrigger value="public-browse" className="flex items-center gap-2">
          <Globe className="w-4 h-4" />
          パブリック
        </TabsTrigger>
      </TabsList>

      {children}
    </Tabs>
  );
};

export { Tabs, TabsList, TabsTrigger, TabsContent };
