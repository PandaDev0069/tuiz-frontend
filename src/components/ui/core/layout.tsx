import * as React from 'react';
import { cn } from '@/lib/utils';

const Header = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className, ...props }, ref) => (
    <header ref={ref} className={cn('w-full py-8 text-center', className)} {...props} />
  ),
);
Header.displayName = 'Header';

const Main = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className, ...props }, ref) => (
    <main ref={ref} className={cn('flex-1', className)} {...props} />
  ),
);
Main.displayName = 'Main';

const Footer = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className, ...props }, ref) => (
    <footer
      ref={ref}
      className={cn('w-full py-8 text-center text-muted-foreground', className)}
      {...props}
    />
  ),
);
Footer.displayName = 'Footer';

const Container = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    size?: 'sm' | 'md' | 'lg' | 'xl';
  }
>(({ className, size = 'lg', ...props }, ref) => {
  const sizes = {
    sm: 'max-w-screen-sm', // 640px
    md: 'max-w-screen-md', // 768px
    lg: 'max-w-screen-lg', // 1024px
    xl: 'max-w-screen-xl', // 1280px
  };

  return (
    <div
      ref={ref}
      className={cn('mx-auto w-full px-4 sm:px-6 lg:px-8 overflow-hidden', sizes[size], className)}
      style={{
        maxWidth: '100vw',
        boxSizing: 'border-box',
      }}
      {...props}
    />
  );
});
Container.displayName = 'Container';

export { Header, Main, Footer, Container };
