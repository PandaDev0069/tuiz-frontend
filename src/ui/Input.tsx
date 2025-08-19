import * as React from 'react';
import s from './Input.module.css';

type Props = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className = '', ...rest }: Props) {
  return <input className={`${s.input} ${className}`} {...rest} />;
}
