import * as React from 'react';
import { cn } from '@/lib/utils';

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'thin' | 'hidden';
  orientation?: 'vertical' | 'horizontal' | 'both';
  children: React.ReactNode;
}

const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, variant = 'default', orientation = 'vertical', children, ...props }, ref) => {
    const scrollClasses = {
      default: '',
      thin: 'scrollbar-thin',
      hidden: 'scrollbar-hidden',
    };

    const orientationClasses = {
      vertical: 'overflow-y-auto overflow-x-hidden',
      horizontal: 'overflow-x-auto overflow-y-hidden',
      both: 'overflow-auto',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'relative',
          orientationClasses[orientation],
          scrollClasses[variant],
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);
ScrollArea.displayName = 'ScrollArea';

// Scroll indicator component for visual feedback
interface ScrollIndicatorProps {
  target: React.RefObject<HTMLElement | null>;
  orientation?: 'vertical' | 'horizontal';
  className?: string;
}

const ScrollIndicator: React.FC<ScrollIndicatorProps> = ({
  target,
  orientation = 'vertical',
  className,
}) => {
  const [scrollPercentage, setScrollPercentage] = React.useState(0);

  React.useEffect(() => {
    const element = target.current;
    if (!element) return;

    const handleScroll = () => {
      if (orientation === 'vertical') {
        const scrollTop = element.scrollTop;
        const scrollHeight = element.scrollHeight - element.clientHeight;
        const percentage = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
        setScrollPercentage(percentage);
      } else {
        const scrollLeft = element.scrollLeft;
        const scrollWidth = element.scrollWidth - element.clientWidth;
        const percentage = scrollWidth > 0 ? (scrollLeft / scrollWidth) * 100 : 0;
        setScrollPercentage(percentage);
      }
    };

    element.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial calculation

    return () => element.removeEventListener('scroll', handleScroll);
  }, [target, orientation]);

  if (orientation === 'vertical') {
    return (
      <div className={cn('fixed right-2 top-0 h-full w-1 bg-white/20 rounded-full', className)}>
        <div
          className="w-full bg-gradient-to-b from-[#6fd6ff] to-[#bff098] rounded-full transition-all duration-300"
          style={{ height: `${scrollPercentage}%` }}
        />
      </div>
    );
  }

  return (
    <div className={cn('fixed bottom-2 left-0 w-full h-1 bg-white/20 rounded-full', className)}>
      <div
        className="h-full bg-gradient-to-r from-[#6fd6ff] to-[#bff098] rounded-full transition-all duration-300"
        style={{ width: `${scrollPercentage}%` }}
      />
    </div>
  );
};

export { ScrollArea, ScrollIndicator };
