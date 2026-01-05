// ====================================================
// File Name   : useDeviceId.ts
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-11-23
// Last Update : 2025-12-22
//
// Description:
// - React hooks for device ID management
// - Provides persistent device ID access and initialization
// - Supports both async (with loading state) and sync access patterns
// - Used for WebSocket reconnection and anonymous user tracking
//
// Notes:
// - Device ID is stored in localStorage and persists across sessions
// - Hooks handle SSR scenarios by checking for window object
// - Provides reset functionality for device ID regeneration
// ====================================================

//----------------------------------------------------
// 1. Imports / Dependencies
//----------------------------------------------------
import { useEffect, useState } from 'react';

import { getOrCreateDeviceId, resetDeviceId, getDeviceInfo } from '@/lib/deviceId';

//----------------------------------------------------
// 2. Constants / Configuration
//----------------------------------------------------
const DEFAULT_DEVICE_ID_SSR = '';
const DEFAULT_DEVICE_INFO = {
  deviceId: null,
  version: null,
  hasDeviceId: false,
  isValid: false,
} as const;

//----------------------------------------------------
// 3. Types / Interfaces
//----------------------------------------------------
/**
 * Return type for useDeviceId hook
 */
interface UseDeviceIdReturn {
  deviceId: string | null;
  isLoading: boolean;
  resetDevice: () => void;
  deviceInfo: ReturnType<typeof getDeviceInfo>;
}

//----------------------------------------------------
// 4. Core Logic
//----------------------------------------------------
/**
 * Hook: useDeviceId
 * Description:
 * - Gets or creates a persistent device ID with loading state
 * - Initializes device ID on component mount
 * - Provides device info and reset functionality
 * - Handles SSR scenarios gracefully
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
 *
 * @returns {UseDeviceIdReturn} Object containing deviceId, isLoading, resetDevice, and deviceInfo
 */
export function useDeviceId(): UseDeviceIdReturn {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deviceInfo, setDeviceInfo] =
    useState<ReturnType<typeof getDeviceInfo>>(DEFAULT_DEVICE_INFO);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }

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
 * Hook: useDeviceIdSync
 * Description:
 * - Returns device ID immediately without loading state
 * - Synchronous access pattern for event handlers
 * - Useful when device ID is needed in synchronous operations
 * - Handles SSR scenarios by returning empty string
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
 *
 * @returns {string} Device ID string, or empty string if unavailable (SSR or error)
 */
export function useDeviceIdSync(): string {
  const [deviceId] = useState(() => {
    if (typeof window === 'undefined') {
      return DEFAULT_DEVICE_ID_SSR;
    }
    try {
      return getOrCreateDeviceId();
    } catch (error) {
      console.error('[useDeviceIdSync] Failed to get device ID:', error);
      return DEFAULT_DEVICE_ID_SSR;
    }
  });
  return deviceId;
}

//----------------------------------------------------
// 5. Helper Functions
//----------------------------------------------------

//----------------------------------------------------
// 6. Export
//----------------------------------------------------
