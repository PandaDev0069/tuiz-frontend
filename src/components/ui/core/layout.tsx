// ====================================================
// File Name   : layout.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-08-20
// Last Update : 2025-08-26
//
// Description:
// - Layout components for semantic HTML structure
// - Provides Header, Main, Footer, and Container components
// - Container supports multiple size variants
// - Uses forwardRef for ref forwarding
//
// Notes:
// - Server and client compatible (no 'use client' directive)
// - All components support className prop for customization
// ====================================================

import * as React from 'react';
import { cn } from '@/lib/utils';

const DEFAULT_CONTAINER_SIZE = 'lg';

const HEADER_BASE_CLASSES = 'w-full py-8 text-center';
const MAIN_BASE_CLASSES = 'flex-1';
const FOOTER_BASE_CLASSES = 'w-full py-8 text-center text-muted-foreground';
const CONTAINER_BASE_CLASSES = 'mx-auto w-full px-4 sm:px-6 lg:px-8';

const CONTAINER_SIZES = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
} as const;

const BOX_SIZING_STYLE = { boxSizing: 'border-box' as const };

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Component: Header
 * Description:
 * - Semantic header component for page headers
 * - Provides consistent styling with padding and center alignment
 * - Supports custom className for additional styling
 *
 * Parameters:
 * - className (string, optional): Additional CSS classes
 * - ...props (React.HTMLAttributes<HTMLElement>): Additional header attributes
 *
 * Returns:
 * - React.ReactElement: The header component
 *
 * Example:
 * ```tsx
 * <Header className="bg-primary">
 *   <h1>Page Title</h1>
 * </Header>
 * ```
 */
const Header = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className, ...props }, ref) => (
    <header ref={ref} className={cn(HEADER_BASE_CLASSES, className)} {...props} />
  ),
);
Header.displayName = 'Header';

/**
 * Component: Main
 * Description:
 * - Semantic main content component
 * - Provides flex-1 styling for flexible layouts
 * - Supports custom className for additional styling
 *
 * Parameters:
 * - className (string, optional): Additional CSS classes
 * - ...props (React.HTMLAttributes<HTMLElement>): Additional main attributes
 *
 * Returns:
 * - React.ReactElement: The main component
 *
 * Example:
 * ```tsx
 * <Main className="bg-background">
 *   <p>Main content</p>
 * </Main>
 * ```
 */
const Main = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className, ...props }, ref) => (
    <main ref={ref} className={cn(MAIN_BASE_CLASSES, className)} {...props} />
  ),
);
Main.displayName = 'Main';

/**
 * Component: Footer
 * Description:
 * - Semantic footer component for page footers
 * - Provides consistent styling with padding, center alignment, and muted text
 * - Supports custom className for additional styling
 *
 * Parameters:
 * - className (string, optional): Additional CSS classes
 * - ...props (React.HTMLAttributes<HTMLElement>): Additional footer attributes
 *
 * Returns:
 * - React.ReactElement: The footer component
 *
 * Example:
 * ```tsx
 * <Footer>
 *   <p>Copyright 2025</p>
 * </Footer>
 * ```
 */
const Footer = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className, ...props }, ref) => (
    <footer ref={ref} className={cn(FOOTER_BASE_CLASSES, className)} {...props} />
  ),
);
Footer.displayName = 'Footer';

/**
 * Component: Container
 * Description:
 * - Responsive container component with size variants
 * - Provides max-width constraints and responsive padding
 * - Supports multiple size options (sm, md, lg, xl)
 * - Includes box-sizing style for consistent sizing
 *
 * Parameters:
 * - className (string, optional): Additional CSS classes
 * - size ('sm' | 'md' | 'lg' | 'xl', optional): Container size variant (default: 'lg')
 * - ...props (React.HTMLAttributes<HTMLDivElement>): Additional div attributes
 *
 * Returns:
 * - React.ReactElement: The container component
 *
 * Example:
 * ```tsx
 * <Container size="lg">
 *   <p>Content here</p>
 * </Container>
 * ```
 */
const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size = DEFAULT_CONTAINER_SIZE, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(CONTAINER_BASE_CLASSES, CONTAINER_SIZES[size], className)}
        style={BOX_SIZING_STYLE}
        {...props}
      />
    );
  },
);
Container.displayName = 'Container';

export { Header, Main, Footer, Container };
