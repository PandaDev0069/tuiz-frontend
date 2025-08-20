import * as React from 'react';
import s from './Typography.module.css';

type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
type TextSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
type TextWeight = 'normal' | 'medium' | 'semibold' | 'bold';
type TextColor = 'default' | 'muted' | 'subtle' | 'primary' | 'success' | 'warning' | 'error';

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: HeadingLevel;
  size?: TextSize;
  weight?: TextWeight;
  color?: TextColor;
  gradient?: boolean;
}

interface TextProps extends React.HTMLAttributes<HTMLElement> {
  as?: 'p' | 'span' | 'div' | 'small';
  size?: TextSize;
  weight?: TextWeight;
  color?: TextColor;
  gradient?: boolean;
}

export function Heading({
  as: Component = 'h2',
  size = '2xl',
  weight = 'bold',
  color = 'default',
  gradient = false,
  className = '',
  children,
  ...rest
}: HeadingProps) {
  const classes = [s.heading, s[size], s[weight], s[color], gradient && s.gradient, className]
    .filter(Boolean)
    .join(' ');

  return (
    <Component className={classes} {...rest}>
      {children}
    </Component>
  );
}

export function Text({
  as: Component = 'p',
  size = 'base',
  weight = 'normal',
  color = 'default',
  gradient = false,
  className = '',
  children,
  ...rest
}: TextProps) {
  const classes = [s.text, s[size], s[weight], s[color], gradient && s.gradient, className]
    .filter(Boolean)
    .join(' ');

  return (
    <Component className={classes} {...rest}>
      {children}
    </Component>
  );
}
