import * as React from 'react';
import s from './Card.module.css';

type CardVariant = 'default' | 'accent' | 'success' | 'warning' | 'error' | 'glass';

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: CardVariant;
};

export function Card({ variant = 'default', className = '', ...props }: CardProps) {
  return <div className={`${s.card} ${s[variant]} ${className}`} {...props} />;
}

export function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className={s.header}>{children}</div>;
}

export function CardBody({ children }: { children: React.ReactNode }) {
  return <div className={s.body}>{children}</div>;
}

export function CardFooter({ children }: { children: React.ReactNode }) {
  return <div className={s.footer}>{children}</div>;
}
