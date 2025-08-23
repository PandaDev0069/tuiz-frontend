'use client';

import * as React from 'react';
import { cfg } from '@/config/config';

type AnimationTuning = {
  latencyMs: number | null;
  duration: number; // base animation duration in ms
  easing: string; // CSS timing function
  scale: number; // multiplier to slow down/speed up animations
  refresh: () => void;
};

const AnimationContext = React.createContext<AnimationTuning | undefined>(undefined);

async function measureLatency(endpoint: string): Promise<number | null> {
  try {
    const perf: Performance | undefined = (globalThis as unknown as { performance?: Performance })
      .performance;
    const now = typeof perf?.now === 'function' ? () => perf.now() : () => Date.now();
    const start = now();
    await fetch(endpoint, { cache: 'no-store' });
    return Math.max(0, Math.round(now() - start));
  } catch {
    return null;
  }
}

function deriveTuning(
  latencyMs: number | null,
): Pick<AnimationTuning, 'duration' | 'easing' | 'scale'> {
  // Fallbacks - use durations similar to the float animation (3s = 3000ms)
  if (latencyMs == null) return { duration: 3000, easing: 'ease', scale: 1 };

  // Map latency to animation scale: lower latency → snappier; higher → smoother/slower
  // Base durations are now aligned with the pleasant 3-second float speed
  if (latencyMs < 80)
    return { duration: 2000, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)', scale: 0.7 };
  if (latencyMs < 160) return { duration: 3000, easing: 'ease-out', scale: 0.8 };
  if (latencyMs < 300) return { duration: 4000, easing: 'ease-out', scale: 1 };
  return { duration: 5000, easing: 'ease-in-out', scale: 1.2 };
}

export function AnimationProvider({ children }: { children: React.ReactNode }) {
  const [latencyMs, setLatencyMs] = React.useState<number | null>(null);
  const tuning = React.useMemo(() => deriveTuning(latencyMs), [latencyMs]);

  const mountedRef = React.useRef(true);

  const refresh = React.useCallback(async () => {
    if (typeof window === 'undefined') return;
    const ms = await measureLatency(`${cfg.apiBase}/health`);
    if (mountedRef.current) {
      setLatencyMs(ms);
    }
  }, []);

  React.useEffect(() => {
    mountedRef.current = true;
    if (typeof window === 'undefined')
      return () => {
        mountedRef.current = false;
      };

    refresh();
    const id = setInterval(refresh, 20_000);
    return () => {
      mountedRef.current = false;
      clearInterval(id);
    };
  }, [refresh]);

  const value: AnimationTuning = React.useMemo(
    () => ({
      latencyMs,
      duration: tuning.duration,
      easing: tuning.easing,
      scale: tuning.scale,
      refresh,
    }),
    [latencyMs, tuning, refresh],
  );

  return <AnimationContext.Provider value={value}>{children}</AnimationContext.Provider>;
}

export function useAnimation() {
  const ctx = React.useContext(AnimationContext);
  if (!ctx) throw new Error('useAnimation must be used within AnimationProvider');
  return ctx;
}
