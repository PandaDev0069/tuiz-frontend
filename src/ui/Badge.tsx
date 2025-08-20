import * as React from 'react';
import s from './Badge.module.css';

type Variant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
type Size = 'sm' | 'md' | 'lg';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
  size?: Size;
  pill?: boolean;
}

export function Badge({
  variant = 'default',
  size = 'md',
  pill = false,
  className = '',
  children,
  ...rest
}: BadgeProps) {
  const classes = [s.badge, s[variant], s[size], pill && s.pill, className]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classes} {...rest}>
      {children}
    </span>
  );
}
