import * as React from 'react';
import s from './Card.module.css';

export function Card(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={s.card} {...props} />;
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
