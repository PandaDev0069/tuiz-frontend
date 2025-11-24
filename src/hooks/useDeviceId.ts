/**
 * React Hook for Device ID Management
 *
 * Provides access to the persistent device ID and ensures it's initialized
 * when the component mounts.
 */

import { useEffect, useState } from 'react';
import { getOrCreateDeviceId, resetDeviceId, getDeviceInfo } from '@/lib/deviceId';

interface UseDeviceIdReturn {
  deviceId: string | null;
  isLoading: boolean;
  resetDevice: () => void;
  deviceInfo: ReturnType<typeof getDeviceInfo>;
}

/**
 * Hook to get or create a persistent device ID
 *
 * The device ID is:
 * - Generated once and stored in localStorage
 * - Persists across browser sessions
 * - Used for WebSocket reconnection and anonymous user tracking
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { deviceId, isLoading } = useDeviceId();
 *
 *   if (isLoading) return <div>Loading...</div>;
 *
 *   return <div>Device ID: {deviceId}</div>;
 * }
 * ```
 */
export function useDeviceId(): UseDeviceIdReturn {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deviceInfo, setDeviceInfo] = useState<ReturnType<typeof getDeviceInfo>>({
    deviceId: null,
    version: null,
    hasDeviceId: false,
    isValid: false,
  });

  useEffect(() => {
    // Initialize device ID on mount
    try {
      const id = getOrCreateDeviceId();
      setDeviceId(id);
      setDeviceInfo(getDeviceInfo());
    } catch (error) {
      console.error('[useDeviceId] Failed to initialize device ID:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetDevice = () => {
    try {
      const newId = resetDeviceId();
      setDeviceId(newId);
      setDeviceInfo(getDeviceInfo());
      console.info('[useDeviceId] Device ID reset successfully');
    } catch (error) {
      console.error('[useDeviceId] Failed to reset device ID:', error);
    }
  };

  return {
    deviceId,
    isLoading,
    resetDevice,
    deviceInfo,
  };
}

/**
 * Hook to get device ID immediately (synchronous)
 *
 * This hook returns the device ID immediately without loading state.
 * It's useful when you need the device ID in an event handler or
 * synchronous operation.
 *
 * @example
 * ```tsx
 * function GameComponent() {
 *   const deviceId = useDeviceIdSync();
 *
 *   const handleJoinGame = () => {
 *     joinGame({ gameCode: 'ABC123', deviceId });
 *   };
 *
 *   return <button onClick={handleJoinGame}>Join Game</button>;
 * }
 * ```
 */
export function useDeviceIdSync(): string {
  const [deviceId] = useState(() => getOrCreateDeviceId());
  return deviceId;
}
