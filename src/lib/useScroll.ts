import { useEffect, useState, useRef, useCallback } from 'react';

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

export function useScroll(element?: HTMLElement | null) {
  const [scrollState, setScrollState] = useState<ScrollState>({
    x: 0,
    y: 0,
    isScrolling: false,
    direction: null,
    progress: { vertical: 0, horizontal: 0 },
  });

  const previousPosition = useRef({ x: 0, y: 0 });
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

    // Calculate direction
    let direction: 'up' | 'down' | 'left' | 'right' | null = null;
    if (scrollTop > previousPosition.current.y) direction = 'down';
    else if (scrollTop < previousPosition.current.y) direction = 'up';
    else if (scrollLeft > previousPosition.current.x) direction = 'right';
    else if (scrollLeft < previousPosition.current.x) direction = 'left';

    // Calculate progress
    const verticalProgress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    const horizontalProgress = scrollWidth > 0 ? (scrollLeft / scrollWidth) * 100 : 0;

    setScrollState({
      x: scrollLeft,
      y: scrollTop,
      isScrolling: true,
      direction,
      progress: {
        vertical: Math.max(0, Math.min(100, verticalProgress)),
        horizontal: Math.max(0, Math.min(100, horizontalProgress)),
      },
    });

    previousPosition.current = { x: scrollLeft, y: scrollTop };

    // Clear existing timeout
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }

    // Set isScrolling to false after scroll stops
    scrollTimeout.current = setTimeout(() => {
      setScrollState((prev) => ({ ...prev, isScrolling: false }));
    }, 150);
  }, []);

  useEffect(() => {
    const target = element || window;

    const handleScroll = () => updateScrollState(target);

    target.addEventListener('scroll', handleScroll, { passive: true });

    // Initial scroll state
    updateScrollState(target);

    return () => {
      target.removeEventListener('scroll', handleScroll);
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, [element, updateScrollState]);

  return scrollState;
}

// Hook for smooth scrolling to elements
export function useScrollTo() {
  const scrollTo = useCallback(
    (target: HTMLElement | string, options: ScrollIntoViewOptions = {}) => {
      const element =
        typeof target === 'string' ? (document.querySelector(target) as HTMLElement) : target;

      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest',
          ...options,
        });
      }
    },
    [],
  );

  const scrollToTop = useCallback((smooth = true) => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: smooth ? 'smooth' : 'auto',
    });
  }, []);

  const scrollToBottom = useCallback((smooth = true) => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      left: 0,
      behavior: smooth ? 'smooth' : 'auto',
    });
  }, []);

  return { scrollTo, scrollToTop, scrollToBottom };
}

// Hook for detecting if element is in viewport during scroll
export function useScrollIntoView(threshold = 0.1) {
  const [isInView, setIsInView] = useState(false);
  const [hasBeenInView, setHasBeenInView] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

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
