// ====================================================
// File Name   : redirect-link.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-08-21
// Last Update : 2025-08-26
//
// Description:
// - Redirect link component with customizable variants
// - Supports internal Next.js links and external links
// - Supports multiple visual variants, font weights, and underline styles
// - Uses class-variance-authority for variant management
//
// Notes:
// - Server and client compatible (no 'use client' directive)
// - Uses forwardRef for ref forwarding
// - Handles external links with target and rel attributes
// ====================================================

import * as React from 'react';
import Link from 'next/link';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const BASE_CLASSES = 'text-sm transition-colors duration-200';

const DEFAULT_EXTERNAL = false;
const DISPLAY_NAME = 'RedirectLink';

const CONTAINER_CLASSES = 'text-center text-sm text-gray-600';
const EXTERNAL_TARGET = '_blank';
const EXTERNAL_REL = 'noopener noreferrer';

const redirectLinkVariants = cva(BASE_CLASSES, {
  variants: {
    variant: {
      default: 'text-gray-600 hover:text-gray-900',
      primary: 'text-blue-600 hover:text-blue-800',
      secondary: 'text-gray-500 hover:text-gray-700',
      muted: 'text-gray-400 hover:text-gray-600',
    },
    weight: {
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
    },
    underline: {
      none: 'no-underline hover:underline',
      always: 'underline',
      hover: 'no-underline hover:underline',
    },
  },
  defaultVariants: {
    variant: 'default',
    weight: 'normal',
    underline: 'hover',
  },
});

export interface RedirectLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof redirectLinkVariants> {
  href: string;
  text?: string;
  linkText: string;
  external?: boolean;
}

/**
 * Component: RedirectLink
 * Description:
 * - Redirect link component with customizable variants
 * - Supports internal Next.js links and external links
 * - Supports multiple visual variants, font weights, and underline styles
 * - Uses forwardRef for ref forwarding
 * - Handles external links with proper security attributes
 *
 * Parameters:
 * - className (string, optional): Additional CSS classes
 * - variant ('default' | 'primary' | 'secondary' | 'muted', optional): Visual variant (default: 'default')
 * - weight ('normal' | 'medium' | 'semibold', optional): Font weight (default: 'normal')
 * - underline ('none' | 'always' | 'hover', optional): Underline style (default: 'hover')
 * - href (string): Link URL
 * - text (string, optional): Text to display before the link
 * - linkText (string): Text for the link itself
 * - external (boolean, optional): Whether link is external (default: false)
 * - children (ReactNode, optional): Additional content after the link
 * - ...props (AnchorHTMLAttributes): Additional HTML anchor attributes
 *
 * Returns:
 * - React.ReactElement: The redirect link component
 *
 * Example:
 * ```tsx
 * <RedirectLink href="/login" linkText="Sign in" text="Already have an account?" />
 * <RedirectLink href="https://example.com" linkText="External Link" external />
 * ```
 */
const RedirectLink = React.forwardRef<HTMLAnchorElement, RedirectLinkProps>(
  (
    {
      className,
      variant,
      weight,
      underline,
      href,
      text,
      linkText,
      external = DEFAULT_EXTERNAL,
      children,
      ...props
    },
    ref,
  ) => {
    const LinkComponent = external ? 'a' : Link;
    const linkProps = external ? { href, target: EXTERNAL_TARGET, rel: EXTERNAL_REL } : { href };

    return (
      <div className={CONTAINER_CLASSES}>
        {text && <span>{text} </span>}
        <LinkComponent
          ref={ref}
          className={cn(redirectLinkVariants({ variant, weight, underline }), className)}
          {...linkProps}
          {...props}
        >
          {linkText}
        </LinkComponent>
        {children}
      </div>
    );
  },
);

RedirectLink.displayName = DISPLAY_NAME;

export { RedirectLink, redirectLinkVariants };
