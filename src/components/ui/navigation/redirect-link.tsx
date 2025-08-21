import * as React from 'react';
import Link from 'next/link';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const redirectLinkVariants = cva('text-sm transition-colors duration-200', {
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
      external = false,
      children,
      ...props
    },
    ref,
  ) => {
    const LinkComponent = external ? 'a' : Link;
    const linkProps = external ? { href, target: '_blank', rel: 'noopener noreferrer' } : { href };

    return (
      <p className="text-center text-sm text-gray-600">
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
      </p>
    );
  },
);

RedirectLink.displayName = 'RedirectLink';

export { RedirectLink, redirectLinkVariants };
