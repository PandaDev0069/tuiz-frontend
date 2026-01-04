// ====================================================
// File Name   : useScroll.ts
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-08-20
// Last Update : 2025-08-20
//
// Description:
// - React hooks for scroll detection and manipulation
// - Provides scroll state tracking, smooth scrolling, and viewport detection
// - Supports both window and element scrolling
//
// Notes:
// - Uses IntersectionObserver for viewport detection
// - Implements passive event listeners for performance
// - Handles cleanup of timeouts and observers
// ====================================================

//----------------------------------------------------
// 1. Imports / Dependencies
//----------------------------------------------------
import { useEffect, useState, useRef, useCallback } from 'react';

//----------------------------------------------------
// 2. Constants / Configuration
//----------------------------------------------------
const SCROLL_STOP_DELAY_MS = 150;
const PROGRESS_PERCENTAGE_MULTIPLIER = 100;
const PROGRESS_MIN = 0;
const PROGRESS_MAX = 100;
const INITIAL_SCROLL_POSITION = 0;
const DEFAULT_SCROLL_THRESHOLD = 0.1;

const SCROLL_BEHAVIOR_SMOOTH = 'smooth';
const SCROLL_BEHAVIOR_AUTO = 'auto';
const SCROLL_BLOCK_START = 'start';
const SCROLL_INLINE_NEAREST = 'nearest';

const EVENT_SCROLL = 'scroll';
const EVENT_LISTENER_OPTIONS_PASSIVE = { passive: true };

//----------------------------------------------------
// 3. Types / Interfaces
//----------------------------------------------------
/**
 * Interface: ScrollState
 * Description:
 * - State object for scroll position and direction
 * - Contains scroll coordinates, scrolling status, direction, and progress
 */
export interface ScrollState {
  x: number;
  y: number;
  isScrolling: boolean;
  direction: 'up' | 'down' | 'left' | 'right' | null;
  progress: {
    vertical: number;
    horizontal: number;
  };
}

//----------------------------------------------------
// 4. Core Logic
//----------------------------------------------------
/**
 * Hook: useScroll
 * Description:
 * - Tracks scroll position, direction, and progress for window or element
 * - Detects when scrolling stops and calculates scroll progress
 *
 * Parameters:
 * - element (HTMLElement | null, optional): Element to track, defaults to window
 *
 * Returns:
 * - ScrollState: Current scroll state with position, direction, and progress
 */
export function useScroll(element?: HTMLElement | null) {
  const [scrollState, setScrollState] = useState<ScrollState>({
    x: INITIAL_SCROLL_POSITION,
    y: INITIAL_SCROLL_POSITION,
    isScrolling: false,
    direction: null,
    progress: { vertical: INITIAL_SCROLL_POSITION, horizontal: INITIAL_SCROLL_POSITION },
  });

  const previousPosition = useRef({ x: INITIAL_SCROLL_POSITION, y: INITIAL_SCROLL_POSITION });
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  const updateScrollState = useCallback((target: HTMLElement | Window) => {
    const isWindow = target === window;
    const scrollLeft = isWindow ? window.scrollX : (target as HTMLElement).scrollLeft;
    const scrollTop = isWindow ? window.scrollY : (target as HTMLElement).scrollTop;

    const scrollWidth = isWindow
      ? document.documentElement.scrollWidth - window.innerWidth
      : (target as HTMLElement).scrollWidth - (target as HTMLElement).clientWidth;

    const scrollHeight = isWindow
      ? document.documentElement.scrollHeight - window.innerHeight
      : (target as HTMLElement).scrollHeight - (target as HTMLElement).clientHeight;

    let direction: 'up' | 'down' | 'left' | 'right' | null = null;
    if (scrollTop > previousPosition.current.y) {
      direction = 'down';
    } else if (scrollTop < previousPosition.current.y) {
      direction = 'up';
    } else if (scrollLeft > previousPosition.current.x) {
      direction = 'right';
    } else if (scrollLeft < previousPosition.current.x) {
      direction = 'left';
    }

    const verticalProgress =
      scrollHeight > INITIAL_SCROLL_POSITION
        ? (scrollTop / scrollHeight) * PROGRESS_PERCENTAGE_MULTIPLIER
        : INITIAL_SCROLL_POSITION;
    const horizontalProgress =
      scrollWidth > INITIAL_SCROLL_POSITION
        ? (scrollLeft / scrollWidth) * PROGRESS_PERCENTAGE_MULTIPLIER
        : INITIAL_SCROLL_POSITION;

    setScrollState({
      x: scrollLeft,
      y: scrollTop,
      isScrolling: true,
      direction,
      progress: {
        vertical: Math.max(PROGRESS_MIN, Math.min(PROGRESS_MAX, verticalProgress)),
        horizontal: Math.max(PROGRESS_MIN, Math.min(PROGRESS_MAX, horizontalProgress)),
      },
    });

    previousPosition.current = { x: scrollLeft, y: scrollTop };

    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }

    scrollTimeout.current = setTimeout(() => {
      setScrollState((prev) => ({ ...prev, isScrolling: false }));
    }, SCROLL_STOP_DELAY_MS);
  }, []);

  useEffect(() => {
    const target = element || window;

    const handleScroll = () => updateScrollState(target);

    target.addEventListener(EVENT_SCROLL, handleScroll, EVENT_LISTENER_OPTIONS_PASSIVE);

    updateScrollState(target);

    return () => {
      target.removeEventListener(EVENT_SCROLL, handleScroll);
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, [element, updateScrollState]);

  return scrollState;
}

/**
 * Hook: useScrollTo
 * Description:
 * - Provides functions for smooth scrolling to elements or positions
 * - Supports scrolling to specific elements, top, or bottom of page
 *
 * Returns:
 * - { scrollTo, scrollToTop, scrollToBottom }: Scroll functions
 */
export function useScrollTo() {
  const scrollTo = useCallback(
    (target: HTMLElement | string, options: ScrollIntoViewOptions = {}) => {
      const element =
        typeof target === 'string' ? (document.querySelector(target) as HTMLElement) : target;

      if (element) {
        element.scrollIntoView({
          behavior: SCROLL_BEHAVIOR_SMOOTH,
          block: SCROLL_BLOCK_START,
          inline: SCROLL_INLINE_NEAREST,
          ...options,
        });
      }
    },
    [],
  );

  const scrollToTop = useCallback((smooth = true) => {
    window.scrollTo({
      top: INITIAL_SCROLL_POSITION,
      left: INITIAL_SCROLL_POSITION,
      behavior: smooth ? SCROLL_BEHAVIOR_SMOOTH : SCROLL_BEHAVIOR_AUTO,
    });
  }, []);

  const scrollToBottom = useCallback((smooth = true) => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      left: INITIAL_SCROLL_POSITION,
      behavior: smooth ? SCROLL_BEHAVIOR_SMOOTH : SCROLL_BEHAVIOR_AUTO,
    });
  }, []);

  return { scrollTo, scrollToTop, scrollToBottom };
}

/**
 * Hook: useScrollIntoView
 * Description:
 * - Detects if element is in viewport during scroll
 * - Tracks both current visibility and whether element has ever been in view
 *
 * Parameters:
 * - threshold (number, optional): Intersection threshold (default: 0.1)
 *
 * Returns:
 * - { elementRef, isInView, hasBeenInView }: Element ref and visibility state
 */
export function useScrollIntoView(threshold = DEFAULT_SCROLL_THRESHOLD) {
  const [isInView, setIsInView] = useState(false);
  const [hasBeenInView, setHasBeenInView] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const inView = entry.isIntersecting;
        setIsInView(inView);
        if (inView) {
          setHasBeenInView(true);
        }
      },
      { threshold },
    );

    observer.observe(element);

    return () => observer.unobserve(element);
  }, [threshold]);

  return { elementRef, isInView, hasBeenInView };
}

//----------------------------------------------------
// 5. Helper Functions
//----------------------------------------------------

//----------------------------------------------------
// 6. Export
//----------------------------------------------------
