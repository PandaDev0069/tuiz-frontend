'use client';

import { MotionConfig } from 'framer-motion';

export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig>{children}</MotionConfig>;
}
