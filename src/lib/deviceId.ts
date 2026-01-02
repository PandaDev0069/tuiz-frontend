/**
 * Device ID Management Utility
 *
 * Generates and manages a persistent device identifier stored in localStorage.
 * This device ID is used for:
 * - Tracking anonymous users
 * - WebSocket reconnection
 * - Host verification in game sessions
 *
 * The device ID persists across browser sessions and will not disappear
 * even after closing the browser.
 */

const DEVICE_ID_STORAGE_KEY = 'tuiz_device_id';
const DEVICE_ID_VERSION_KEY = 'tuiz_device_id_version';
const CURRENT_VERSION = '1.0';

/**
 * Check if we're in a browser environment
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

/**
 * Generate a UUID v4
 * Uses crypto.randomUUID() if available, otherwise falls back to manual generation
 */
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback UUID v4 generation for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Get the stored device ID from localStorage
 * Returns null if no device ID exists or if it's invalid
 */
function getStoredDeviceId(): string | null {
  // Check if we're in a browser environment
  if (!isBrowser()) {
    return null;
  }

  try {
    const storedId = localStorage.getItem(DEVICE_ID_STORAGE_KEY);
    const storedVersion = localStorage.getItem(DEVICE_ID_VERSION_KEY);

    // Validate stored device ID
    if (!storedId) {
      return null;
    }

    // Check if version matches (for future migrations)
    if (storedVersion !== CURRENT_VERSION) {
      console.info('[DeviceID] Version mismatch, regenerating device ID');
      return null;
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(storedId)) {
      console.warn('[DeviceID] Invalid UUID format, regenerating');
      return null;
    }

    return storedId;
  } catch (error) {
    console.error('[DeviceID] Error reading from localStorage:', error);
    return null;
  }
}

/**
 * Store device ID in localStorage
 */
function storeDeviceId(deviceId: string): void {
  // Check if we're in a browser environment
  if (!isBrowser()) {
    console.warn('[DeviceID] Cannot store device ID: not in browser environment');
    return;
  }

  try {
    localStorage.setItem(DEVICE_ID_STORAGE_KEY, deviceId);
    localStorage.setItem(DEVICE_ID_VERSION_KEY, CURRENT_VERSION);
    console.info('[DeviceID] Device ID stored successfully:', deviceId);
  } catch (error) {
    console.error('[DeviceID] Error storing device ID:', error);
    throw new Error('Failed to store device ID in localStorage');
  }
}

/**
 * Get or create a device ID
 *
 * This function will:
 * 1. Try to retrieve existing device ID from localStorage
 * 2. If not found or invalid, generate a new UUID
 * 3. Store the device ID for future use
 *
 * @returns {string} The device ID (UUID v4)
 * @throws {Error} If called in a non-browser environment
 */
export function getOrCreateDeviceId(): string {
  // Check if we're in a browser environment
  if (!isBrowser()) {
    // During SSR, we can't access localStorage, so we throw an error
    // Components should use useDeviceId hook which handles this gracefully
    throw new Error('getOrCreateDeviceId can only be called in a browser environment');
  }

  const existingId = getStoredDeviceId();

  if (existingId) {
    console.info('[DeviceID] Using existing device ID:', existingId);
    return existingId;
  }

  // Generate new device ID
  const newDeviceId = generateUUID();
  console.info('[DeviceID] Generated new device ID:', newDeviceId);

  // Store for future use
  storeDeviceId(newDeviceId);

  return newDeviceId;
}

/**
 * Get or create a device ID with optional per-tab scope.
 * Per-tab IDs use sessionStorage (different per browser tab/window) to avoid
 * clobbering the primary device ID used by the host.
 */
export function getOrCreateDeviceIdScoped(options?: { perTab?: boolean }): string {
  const perTab = options?.perTab;

  if (!isBrowser()) {
    throw new Error('getOrCreateDeviceIdScoped can only be called in a browser environment');
  }

  if (!perTab) {
    return getOrCreateDeviceId();
  }

  // Per-tab scope: sessionStorage key
  const TAB_KEY = 'tuiz_device_id_tab';
  const VERSION_KEY = 'tuiz_device_id_tab_version';

  try {
    const storedId = sessionStorage.getItem(TAB_KEY);
    const storedVersion = sessionStorage.getItem(VERSION_KEY);

    if (storedId && storedVersion === CURRENT_VERSION) {
      console.info('[DeviceID] Using existing per-tab device ID:', storedId);
      return storedId;
    }

    const newId = generateUUID();
    sessionStorage.setItem(TAB_KEY, newId);
    sessionStorage.setItem(VERSION_KEY, CURRENT_VERSION);
    console.info('[DeviceID] Generated per-tab device ID:', newId);
    return newId;
  } catch (error) {
    console.error('[DeviceID] Error handling per-tab device ID:', error);
    // Fallback to global ID if sessionStorage fails
    return getOrCreateDeviceId();
  }
}

/**
 * Reset device ID (useful for testing or user privacy controls)
 * Generates and stores a new device ID
 *
 * @returns {string} The new device ID
 */
export function resetDeviceId(): string {
  const newDeviceId = generateUUID();
  storeDeviceId(newDeviceId);
  console.info('[DeviceID] Device ID reset:', newDeviceId);
  return newDeviceId;
}

/**
 * Check if a device ID exists in storage
 *
 * @returns {boolean} True if device ID exists, false otherwise
 */
export function hasDeviceId(): boolean {
  return getStoredDeviceId() !== null;
}

/**
 * Get device ID without creating one
 * Use this when you want to check if a device ID exists without side effects
 *
 * @returns {string | null} The device ID or null if it doesn't exist
 */
export function getDeviceId(): string | null {
  return getStoredDeviceId();
}

/**
 * Clear device ID from storage
 * This will remove the device ID and version from localStorage
 */
export function clearDeviceId(): void {
  // Check if we're in a browser environment
  if (!isBrowser()) {
    console.warn('[DeviceID] Cannot clear device ID: not in browser environment');
    return;
  }

  try {
    localStorage.removeItem(DEVICE_ID_STORAGE_KEY);
    localStorage.removeItem(DEVICE_ID_VERSION_KEY);
    console.info('[DeviceID] Device ID cleared from storage');
  } catch (error) {
    console.error('[DeviceID] Error clearing device ID:', error);
  }
}

/**
 * Get device info for debugging purposes
 *
 * @returns Object containing device ID and related info
 */
export function getDeviceInfo(): {
  deviceId: string | null;
  version: string | null;
  hasDeviceId: boolean;
  isValid: boolean;
} {
  // Check if we're in a browser environment
  if (!isBrowser()) {
    return {
      deviceId: null,
      version: null,
      hasDeviceId: false,
      isValid: false,
    };
  }

  const deviceId = getStoredDeviceId();
  const version = localStorage.getItem(DEVICE_ID_VERSION_KEY);

  return {
    deviceId,
    version,
    hasDeviceId: deviceId !== null,
    isValid: deviceId !== null && version === CURRENT_VERSION,
  };
}
