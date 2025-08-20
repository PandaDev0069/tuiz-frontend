import * as React from 'react';
import s from './Flex.module.css';

type Direction = 'row' | 'column' | 'row-reverse' | 'column-reverse';
type Justify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
type Align = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
type Wrap = 'nowrap' | 'wrap' | 'wrap-reverse';
type Gap = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '8' | '10' | '12';

interface FlexProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: Direction;
  justify?: Justify;
  align?: Align;
  wrap?: Wrap;
  gap?: Gap;
  grow?: boolean;
  shrink?: boolean;
}

export function Flex({
  direction = 'row',
  justify = 'start',
  align = 'start',
  wrap = 'nowrap',
  gap = '0',
  grow = false,
  shrink = false,
  className = '',
  children,
  ...rest
}: FlexProps) {
  const classes = [
    s.flex,
    s[`direction-${direction}`],
    s[`justify-${justify}`],
    s[`align-${align}`],
    s[`wrap-${wrap}`],
    s[`gap-${gap}`],
    grow && s.grow,
    shrink && s.shrink,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}
