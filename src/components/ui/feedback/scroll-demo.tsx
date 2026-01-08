// ====================================================
// File Name   : scroll-demo.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-08-20
// Last Update : 2025-08-22
//
// Description:
// - Demo component showcasing ScrollArea and ScrollIndicator features
// - Interactive demo with scrollbar variant controls
// - Demonstrates vertical and horizontal scrolling
// - Includes scroll navigation functions and visual indicators
//
// Notes:
// - Client component (uses 'use client' directive)
// - Uses React hooks for state management
// - Demo/development component for testing scroll features
// ====================================================

'use client';

import * as React from 'react';
import { ScrollArea, ScrollIndicator } from './scroll-area';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '@/components/ui';

const DEFAULT_SCROLL_VARIANT = 'default';
const DEFAULT_SHOW_INDICATOR = false;
const DEFAULT_UTILITY_CLASS = '';

const DEMO_ITEMS_COUNT = 50;
const SCROLL_TARGET_INDEX = 25;
const HORIZONTAL_CARDS_COUNT = 20;

const SCROLL_AREA_HEIGHT = 'h-96';
const SCROLL_BEHAVIOR = 'smooth';

const CATEGORIES = ['Feature', 'Demo', 'UI', 'Component'] as const;

const SCROLLBAR_VARIANTS = ['default', 'thin', 'hidden'] as const;
const UTILITY_CLASSES = {
  GLOW: 'scrollbar-glow',
  WIDE: 'scrollbar-wide',
  AUTO_HIDE: 'scrollbar-auto-hide',
} as const;

interface DemoItem {
  id: number;
  title: string;
  description: string;
  category: string;
}

/**
 * Function: generateContent
 * Description:
 * - Generates demo content items for scroll demonstration
 * - Creates array of items with id, title, description, and category
 *
 * Parameters:
 * - count (number): Number of items to generate
 *
 * Returns:
 * - DemoItem[]: Array of demo items
 *
 * Example:
 * ```ts
 * const items = generateContent(10);
 * // Returns array of 10 demo items
 * ```
 */
const generateContent = (count: number): DemoItem[] =>
  Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    title: `Demo Item ${i + 1}`,
    description: `This is a demo item with some content to showcase the custom scrollbar. Item number ${i + 1} contains interesting information about scrolling behavior and visual feedback.`,
    category: CATEGORIES[i % CATEGORIES.length],
  }));

/**
 * Function: scrollToTop
 * Description:
 * - Scrolls the target element to the top
 * - Uses smooth scroll behavior
 *
 * Parameters:
 * - element (HTMLDivElement | null): The element to scroll
 *
 * Returns:
 * - void
 *
 * Example:
 * ```ts
 * scrollToTop(scrollRef.current);
 * ```
 */
const scrollToTop = (element: HTMLDivElement | null): void => {
  if (element) {
    element.scrollTo({ top: 0, behavior: SCROLL_BEHAVIOR });
  }
};

/**
 * Function: scrollToBottom
 * Description:
 * - Scrolls the target element to the bottom
 * - Uses smooth scroll behavior
 *
 * Parameters:
 * - element (HTMLDivElement | null): The element to scroll
 *
 * Returns:
 * - void
 *
 * Example:
 * ```ts
 * scrollToBottom(scrollRef.current);
 * ```
 */
const scrollToBottom = (element: HTMLDivElement | null): void => {
  if (element) {
    element.scrollTo({
      top: element.scrollHeight,
      behavior: SCROLL_BEHAVIOR,
    });
  }
};

/**
 * Function: scrollToMiddle
 * Description:
 * - Scrolls to a target element in the middle of the scroll area
 * - Uses smooth scroll behavior with center alignment
 *
 * Parameters:
 * - element (HTMLDivElement | null): The element to scroll within
 *
 * Returns:
 * - void
 *
 * Example:
 * ```ts
 * scrollToMiddle(scrollRef.current);
 * ```
 */
const scrollToMiddle = (element: HTMLDivElement | null): void => {
  if (element) {
    const target = element.querySelector('.scroll-target');
    if (target) {
      target.scrollIntoView({ behavior: SCROLL_BEHAVIOR, block: 'center' });
    }
  }
};

/**
 * Component: ScrollDemo
 * Description:
 * - Interactive demo component for ScrollArea and ScrollIndicator
 * - Allows users to test different scrollbar variants and utilities
 * - Demonstrates vertical and horizontal scrolling
 * - Includes scroll navigation controls and visual indicators
 *
 * Returns:
 * - React.ReactElement: The scroll demo component
 *
 * Example:
 * ```tsx
 * <ScrollDemo />
 * ```
 */
export const ScrollDemo: React.FC = () => {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [scrollVariant, setScrollVariant] = React.useState<'default' | 'thin' | 'hidden'>(
    DEFAULT_SCROLL_VARIANT,
  );
  const [showIndicator, setShowIndicator] = React.useState(DEFAULT_SHOW_INDICATOR);
  const [utilityClass, setUtilityClass] = React.useState(DEFAULT_UTILITY_CLASS);

  const demoItems = generateContent(DEMO_ITEMS_COUNT);

  const handleScrollToTop = (): void => {
    scrollToTop(scrollRef.current);
  };

  const handleScrollToBottom = (): void => {
    scrollToBottom(scrollRef.current);
  };

  const handleScrollToMiddle = (): void => {
    scrollToMiddle(scrollRef.current);
  };

  const handleVariantChange = (variant: 'default' | 'thin' | 'hidden'): void => {
    setScrollVariant(variant);
    setUtilityClass(DEFAULT_UTILITY_CLASS);
  };

  const handleUtilityClassChange = (utility: string): void => {
    setScrollVariant(DEFAULT_SCROLL_VARIANT);
    setUtilityClass(utility);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Custom Scrollbar Demo
            <div className="flex gap-2 flex-wrap">
              <Badge variant={scrollVariant === 'default' ? 'default' : 'outline'}>
                {scrollVariant}
              </Badge>
              {utilityClass && <Badge variant="secondary">{utilityClass}</Badge>}
              {showIndicator && <Badge variant="success">Indicator On</Badge>}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {SCROLLBAR_VARIANTS.map((variant) => (
                <Button
                  key={variant}
                  variant={scrollVariant === variant && !utilityClass ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleVariantChange(variant)}
                >
                  {variant.charAt(0).toUpperCase() + variant.slice(1)}
                </Button>
              ))}
              <Button
                variant={utilityClass === UTILITY_CLASSES.GLOW ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleUtilityClassChange(UTILITY_CLASSES.GLOW)}
              >
                Glow Effect
              </Button>
              <Button
                variant={utilityClass === UTILITY_CLASSES.WIDE ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleUtilityClassChange(UTILITY_CLASSES.WIDE)}
              >
                Wide
              </Button>
              <Button
                variant={utilityClass === UTILITY_CLASSES.AUTO_HIDE ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleUtilityClassChange(UTILITY_CLASSES.AUTO_HIDE)}
              >
                Auto-hide
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant={showIndicator ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowIndicator(!showIndicator)}
              >
                Toggle Indicator
              </Button>
              <Button variant="outline" size="sm" onClick={handleScrollToTop}>
                Scroll to Top
              </Button>
              <Button variant="outline" size="sm" onClick={handleScrollToMiddle}>
                Scroll to Middle
              </Button>
              <Button variant="outline" size="sm" onClick={handleScrollToBottom}>
                Scroll to Bottom
              </Button>
            </div>

            <div className="relative">
              <ScrollArea
                ref={scrollRef}
                variant={scrollVariant}
                className={`${SCROLL_AREA_HEIGHT} p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 ${utilityClass}`}
              >
                <div className="space-y-4">
                  {demoItems.map((item, index) => (
                    <div
                      key={item.id}
                      className={`p-4 bg-white/20 rounded-lg border border-white/30 hover:bg-white/30 transition-colors ${
                        index === SCROLL_TARGET_INDEX ? 'scroll-target' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-800">{item.title}</h3>
                        <Badge variant="secondary" size="sm">
                          {item.category}
                        </Badge>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {item.description}
                        {index === SCROLL_TARGET_INDEX && ' 🎯 This is the scroll target!'}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {showIndicator && <ScrollIndicator target={scrollRef} />}
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Horizontal Scroll Example</h3>
              <ScrollArea
                orientation="horizontal"
                variant={scrollVariant}
                className="w-full p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20"
              >
                <div className="flex gap-4 pb-2" style={{ width: 'max-content' }}>
                  {Array.from({ length: HORIZONTAL_CARDS_COUNT }, (_, i) => (
                    <Card key={i} className="flex-shrink-0 w-64">
                      <CardContent className="p-4">
                        <h4 className="font-medium mb-2">Horizontal Card {i + 1}</h4>
                        <p className="text-sm text-gray-600">
                          This card demonstrates horizontal scrolling with custom scrollbars.
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scrollbar Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Styling Features:</h4>
              <ul className="space-y-1 text-gray-700">
                <li>• Custom gradient colors matching theme</li>
                <li>• Smooth hover animations</li>
                <li>• Dark mode support</li>
                <li>• Multiple variants (default, thin, hidden)</li>
                <li>• Cross-browser compatibility</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Interactive Elements:</h4>
              <ul className="space-y-1 text-gray-700">
                <li>• Scroll progress indicator</li>
                <li>• Hover effects on scrollbar thumb</li>
                <li>• Orientation support (vertical/horizontal)</li>
                <li>• Customizable through CSS classes</li>
                <li>• React component wrapper for consistency</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScrollDemo;
