'use client';

import * as React from 'react';

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
    const start = performance.now();
    await fetch(endpoint, { cache: 'no-store' });
    return Math.max(0, Math.round(performance.now() - start));
  } catch {
    return null;
  }
}

function deriveTuning(
  latencyMs: number | null,
): Pick<AnimationTuning, 'duration' | 'easing' | 'scale'> {
  // Fallbacks
  if (latencyMs == null) return { duration: 250, easing: 'ease', scale: 1 };

  // Map latency to animation scale: lower latency → snappier; higher → smoother/slower
  if (latencyMs < 80) return { duration: 200, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)', scale: 1 };
  if (latencyMs < 160) return { duration: 250, easing: 'ease-out', scale: 1.1 };
  if (latencyMs < 300) return { duration: 300, easing: 'ease-out', scale: 1.2 };
  return { duration: 350, easing: 'ease-in-out', scale: 1.35 };
}

export function AnimationProvider({ children }: { children: React.ReactNode }) {
  const [latencyMs, setLatencyMs] = React.useState<number | null>(null);
  const tuning = React.useMemo(() => deriveTuning(latencyMs), [latencyMs]);

  const refresh = React.useCallback(async () => {
    const ms = await measureLatency('http://localhost:8080/health');
    setLatencyMs(ms);
  }, []);

  React.useEffect(() => {
    refresh();
    const id = setInterval(refresh, 20_000);
    return () => clearInterval(id);
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
