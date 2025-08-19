import * as React from 'react';
import s from './Button.module.css';

type Variant = 'primary' | 'ghost' | 'soft';
type Size = 'sm' | 'md' | 'lg';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  asChild?: false; // reserved if you later add Slot pattern
};

export function Button({ variant = 'primary', size = 'md', className = '', ...rest }: Props) {
  return <button className={`${s.btn} ${s[variant]} ${s[size]} ${className}`} {...rest} />;
}
