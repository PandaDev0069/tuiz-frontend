// ====================================================
// File Name   : AnimationController.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-08-20
// Last Update : 2025-08-23
//
// Description:
// - Animation controller component for adaptive animation tuning
// - Measures network latency and adjusts animation parameters accordingly
// - Provides animation context for components throughout the app
//
// Notes:
// - Uses performance API to measure latency
// - Automatically refreshes latency measurements every 20 seconds
// - Provides tuning values (duration, easing, scale) based on latency
// ====================================================

'use client';

//----------------------------------------------------
// 1. React & Next.js Imports
//----------------------------------------------------
import * as React from 'react';

//----------------------------------------------------
// 2. External Library Imports
//----------------------------------------------------
// (No external libraries needed)

//----------------------------------------------------
// 3. Internal Component Imports
//----------------------------------------------------
// (No internal component imports)

//----------------------------------------------------
// 4. Service & Hook Imports
//----------------------------------------------------
// (No service or hook imports)

//----------------------------------------------------
// 5. Config & Type Imports
//----------------------------------------------------
import { cfg } from '@/config/config';

//----------------------------------------------------
// 6. Type Definitions
//----------------------------------------------------
type AnimationTuning = {
  latencyMs: number | null;
  duration: number;
  easing: string;
  scale: number;
  refresh: () => void;
};

//----------------------------------------------------
// 7. Context Setup
//----------------------------------------------------
const AnimationContext = React.createContext<AnimationTuning | undefined>(undefined);

//----------------------------------------------------
// 8. Utility Functions
//----------------------------------------------------
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
  if (latencyMs == null) return { duration: 3000, easing: 'ease', scale: 1 };

  if (latencyMs < 80)
    return { duration: 2000, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)', scale: 0.7 };
  if (latencyMs < 160) return { duration: 3000, easing: 'ease-out', scale: 0.8 };
  if (latencyMs < 300) return { duration: 4000, easing: 'ease-out', scale: 1 };
  return { duration: 5000, easing: 'ease-in-out', scale: 1.2 };
}

//----------------------------------------------------
// 9. Main Components
//----------------------------------------------------
/**
 * Component: AnimationProvider
 * Description:
 * - Provides animation tuning context based on network latency
 * - Automatically measures and refreshes latency periodically
 * - Adjusts animation parameters for optimal user experience
 */
export function AnimationProvider({ children }: { children: React.ReactNode }) {
  //----------------------------------------------------
  // 9.1. Setup & State
  //----------------------------------------------------
  const [latencyMs, setLatencyMs] = React.useState<number | null>(null);
  const tuning = React.useMemo(() => deriveTuning(latencyMs), [latencyMs]);
  const mountedRef = React.useRef(true);

  //----------------------------------------------------
  // 9.2. Event Handlers
  //----------------------------------------------------
  const refresh = React.useCallback(async () => {
    if (typeof window === 'undefined') return;
    const ms = await measureLatency(`${cfg.apiBase}/health`);
    if (mountedRef.current) {
      setLatencyMs(ms);
    }
  }, []);

  //----------------------------------------------------
  // 9.3. Effects
  //----------------------------------------------------
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

  //----------------------------------------------------
  // 9.4. Context Value
  //----------------------------------------------------
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

  //----------------------------------------------------
  // 9.5. Main Render
  //----------------------------------------------------
  return <AnimationContext.Provider value={value}>{children}</AnimationContext.Provider>;
}

/**
 * Hook: useAnimation
 * Description:
 * - Custom hook to access animation tuning context
 * - Must be used within AnimationProvider
 */
export function useAnimation() {
  const ctx = React.useContext(AnimationContext);
  if (!ctx) throw new Error('useAnimation must be used within AnimationProvider');
  return ctx;
}
