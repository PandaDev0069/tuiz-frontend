// ====================================================
// File Name   : deviceId.ts
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-11-23
// Last Update : 2025-12-26

// Description:
// - Device ID management utility for persistent device identification
// - Generates and manages UUID v4 device identifiers stored in localStorage
// - Used for tracking anonymous users, WebSocket reconnection, and host verification
// - Supports per-tab scoped device IDs for multi-tab scenarios

// Notes:
// - Device ID persists across browser sessions
// - Uses crypto.randomUUID() when available, falls back to manual generation
// - Includes versioning for future migrations
// ====================================================

//----------------------------------------------------
// 1. Imports / Dependencies
//----------------------------------------------------
// No external dependencies

//----------------------------------------------------
// 2. Constants / Configuration
//----------------------------------------------------
const DEVICE_ID_STORAGE_KEY = 'tuiz_device_id';
const DEVICE_ID_VERSION_KEY = 'tuiz_device_id_version';
const DEVICE_ID_TAB_KEY = 'tuiz_device_id_tab';
const DEVICE_ID_TAB_VERSION_KEY = 'tuiz_device_id_tab_version';
const CURRENT_VERSION = '1.0';

const UUID_TEMPLATE = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
const UUID_RANDOM_BASE = 16;
const UUID_VERSION_MASK = 0x3;
const UUID_VARIANT_MASK = 0x8;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const ERROR_MESSAGE_BROWSER_ONLY =
  'getOrCreateDeviceId can only be called in a browser environment';
const ERROR_MESSAGE_SCOPED_BROWSER_ONLY =
  'getOrCreateDeviceIdScoped can only be called in a browser environment';
const ERROR_MESSAGE_STORE_FAILED = 'Failed to store device ID in localStorage';

//----------------------------------------------------
// 3. Types / Interfaces
//----------------------------------------------------
// No additional types - using primitives and return types

//----------------------------------------------------
// 4. Core Logic
//----------------------------------------------------
/**
 * Function: getOrCreateDeviceId
 * Description:
 * - Gets existing device ID from storage or creates a new one
 * - Retrieves from localStorage, validates, and stores if needed
 *
 * Returns:
 * - string: Device ID (UUID v4)
 *
 * Throws:
 * - Error: If called in a non-browser environment
 */
export function getOrCreateDeviceId(): string {
  if (!isBrowser()) {
    throw new Error(ERROR_MESSAGE_BROWSER_ONLY);
  }

  const existingId = getStoredDeviceId();

  if (existingId) {
    return existingId;
  }

  const newDeviceId = generateUUID();
  storeDeviceId(newDeviceId);

  return newDeviceId;
}

/**
 * Function: getOrCreateDeviceIdScoped
 * Description:
 * - Gets or creates device ID with optional per-tab scope
 * - Per-tab IDs use sessionStorage to avoid conflicts with primary device ID
 *
 * Parameters:
 * - options ({ perTab?: boolean }, optional): Options for scoped device ID
 *
 * Returns:
 * - string: Device ID (UUID v4)
 *
 * Throws:
 * - Error: If called in a non-browser environment
 */
export function getOrCreateDeviceIdScoped(options?: { perTab?: boolean }): string {
  const perTab = options?.perTab;

  if (!isBrowser()) {
    throw new Error(ERROR_MESSAGE_SCOPED_BROWSER_ONLY);
  }

  if (!perTab) {
    return getOrCreateDeviceId();
  }

  try {
    const storedId = sessionStorage.getItem(DEVICE_ID_TAB_KEY);
    const storedVersion = sessionStorage.getItem(DEVICE_ID_TAB_VERSION_KEY);

    if (storedId && storedVersion === CURRENT_VERSION) {
      return storedId;
    }

    const newId = generateUUID();
    sessionStorage.setItem(DEVICE_ID_TAB_KEY, newId);
    sessionStorage.setItem(DEVICE_ID_TAB_VERSION_KEY, CURRENT_VERSION);
    return newId;
  } catch (error) {
    console.error('[DeviceID] Error handling per-tab device ID:', error);
    return getOrCreateDeviceId();
  }
}

/**
 * Function: resetDeviceId
 * Description:
 * - Resets device ID by generating and storing a new one
 * - Useful for testing or user privacy controls
 *
 * Returns:
 * - string: New device ID (UUID v4)
 */
export function resetDeviceId(): string {
  const newDeviceId = generateUUID();
  storeDeviceId(newDeviceId);
  return newDeviceId;
}

/**
 * Function: hasDeviceId
 * Description:
 * - Checks if a device ID exists in storage
 *
 * Returns:
 * - boolean: True if device ID exists, false otherwise
 */
export function hasDeviceId(): boolean {
  return getStoredDeviceId() !== null;
}

/**
 * Function: getDeviceId
 * Description:
 * - Gets device ID without creating one if it doesn't exist
 * - Use this to check for device ID without side effects
 *
 * Returns:
 * - string | null: Device ID or null if it doesn't exist
 */
export function getDeviceId(): string | null {
  return getStoredDeviceId();
}

/**
 * Function: clearDeviceId
 * Description:
 * - Clears device ID and version from localStorage
 *
 * Returns:
 * - void: No return value
 */
export function clearDeviceId(): void {
  if (!isBrowser()) {
    return;
  }

  try {
    localStorage.removeItem(DEVICE_ID_STORAGE_KEY);
    localStorage.removeItem(DEVICE_ID_VERSION_KEY);
  } catch (error) {
    console.error('[DeviceID] Error clearing device ID:', error);
  }
}

/**
 * Function: getDeviceInfo
 * Description:
 * - Gets device information for debugging purposes
 * - Returns device ID, version, and validation status
 *
 * Returns:
 * - { deviceId: string | null; version: string | null; hasDeviceId: boolean; isValid: boolean }: Device information object
 */
export function getDeviceInfo(): {
  deviceId: string | null;
  version: string | null;
  hasDeviceId: boolean;
  isValid: boolean;
} {
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

//----------------------------------------------------
// 5. Helper Functions
//----------------------------------------------------
/**
 * Function: isBrowser
 * Description:
 * - Checks if code is running in a browser environment
 * - Verifies window and localStorage are available
 *
 * Returns:
 * - boolean: True if in browser environment, false otherwise
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

/**
 * Function: generateUUID
 * Description:
 * - Generates a UUID v4 identifier
 * - Uses crypto.randomUUID() if available, otherwise falls back to manual generation
 *
 * Returns:
 * - string: UUID v4 string
 */
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return UUID_TEMPLATE.replace(/[xy]/g, (c) => {
    const r = (Math.random() * UUID_RANDOM_BASE) | 0;
    const v = c === 'x' ? r : (r & UUID_VERSION_MASK) | UUID_VARIANT_MASK;
    return v.toString(UUID_RANDOM_BASE);
  });
}

/**
 * Function: getStoredDeviceId
 * Description:
 * - Retrieves stored device ID from localStorage
 * - Validates format and version before returning
 *
 * Returns:
 * - string | null: Stored device ID or null if not found or invalid
 */
function getStoredDeviceId(): string | null {
  if (!isBrowser()) {
    return null;
  }

  try {
    const storedId = localStorage.getItem(DEVICE_ID_STORAGE_KEY);
    const storedVersion = localStorage.getItem(DEVICE_ID_VERSION_KEY);

    if (!storedId) {
      return null;
    }

    if (storedVersion !== CURRENT_VERSION) {
      return null;
    }

    if (!UUID_REGEX.test(storedId)) {
      return null;
    }

    return storedId;
  } catch (error) {
    console.error('[DeviceID] Error reading from localStorage:', error);
    return null;
  }
}

/**
 * Function: storeDeviceId
 * Description:
 * - Stores device ID and version in localStorage
 *
 * Parameters:
 * - deviceId (string): Device ID to store
 *
 * Returns:
 * - void: No return value
 *
 * Throws:
 * - Error: If storage fails
 */
function storeDeviceId(deviceId: string): void {
  if (!isBrowser()) {
    return;
  }

  try {
    localStorage.setItem(DEVICE_ID_STORAGE_KEY, deviceId);
    localStorage.setItem(DEVICE_ID_VERSION_KEY, CURRENT_VERSION);
  } catch (error) {
    console.error('[DeviceID] Error storing device ID:', error);
    throw new Error(ERROR_MESSAGE_STORE_FAILED);
  }
}
