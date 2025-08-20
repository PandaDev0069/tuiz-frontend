import * as React from 'react';
import s from './Container.module.css';

type Size = 'sm' | 'md' | 'lg' | 'xl' | 'full';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: Size;
  center?: boolean;
}

export function Container({
  size = 'lg',
  center = false,
  className = '',
  children,
  ...rest
}: ContainerProps) {
  const classes = [s.container, s[size], center && s.center, className].filter(Boolean).join(' ');

  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}
