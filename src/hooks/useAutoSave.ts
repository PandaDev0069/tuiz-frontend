// ====================================================
// File Name   : useAutoSave.ts
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-11
// Last Update : 2025-09-11
//
// Description:
// - Hook for auto-saving form data with debouncing and error handling
// - Provides form persistence in localStorage with expiry
// - Includes utility functions for equality comparison
// - Specialized hook for quiz auto-save with persistence
//
// Notes:
// - Uses debouncing to prevent excessive save operations
// - Supports custom equality functions for change detection
// - Provides localStorage persistence with automatic expiry
// - Includes shallow and deep equality comparison utilities
// ====================================================

//----------------------------------------------------
// 1. Imports / Dependencies
//----------------------------------------------------
import { useEffect, useState, useRef, useCallback } from 'react';
import { toast } from 'react-hot-toast';

//----------------------------------------------------
// 2. Constants / Configuration
//----------------------------------------------------
const DEFAULT_AUTO_SAVE_DELAY_MS = 30000;
const DEFAULT_PERSISTENCE_EXPIRY_MS = 24 * 60 * 60 * 1000;
const QUIZ_PERSISTENCE_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;
const PERSISTENCE_DEBOUNCE_MS = 1000;
const TOAST_DURATION_SUCCESS_MS = 2000;
const TOAST_DURATION_ERROR_MS = 4000;
const TOAST_POSITION = 'bottom-right';

const TOAST_MESSAGES = {
  AUTO_SAVE_SUCCESS: '自動保存されました',
  AUTO_SAVE_ERROR: '自動保存に失敗しました',
} as const;

const ERROR_MESSAGES = {
  PERSIST_FAILED: 'Failed to persist form data:',
  RESTORE_FAILED: 'Failed to restore form data:',
  CLEAR_FAILED: 'Failed to clear persisted data:',
  CHECK_FAILED: 'Failed to check persisted data:',
} as const;

const STORAGE_KEY_PREFIX = 'quiz-draft-';
const STORAGE_KEY_NEW = 'new';

//----------------------------------------------------
// 3. Types / Interfaces
//----------------------------------------------------
/**
 * Options for useAutoSave hook
 */
interface UseAutoSaveOptions<T> {
  delay?: number;
  enabled?: boolean;
  showToast?: boolean;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
  isEqual?: (a: T, b: T) => boolean;
}

/**
 * Auto-save state interface
 */
interface AutoSaveState {
  isSaving: boolean;
  lastSaved: Date | null;
  error: unknown | null;
  hasUnsavedChanges: boolean;
}

/**
 * Options for useFormPersistence hook
 */
interface UseFormPersistenceOptions<T> {
  key: string;
  enabled?: boolean;
  expiry?: number;
  onRestore?: (data: T) => void;
  serialize?: (data: T) => string;
  deserialize?: (data: string) => T;
}

/**
 * Persisted data structure in localStorage
 */
interface PersistedData<T> {
  data: T;
  timestamp: number;
}

//----------------------------------------------------
// 4. Core Logic
//----------------------------------------------------
/**
 * Hook: useAutoSave
 * Description:
 * - Auto-saves data with debouncing to prevent excessive operations
 * - Tracks save state, last saved time, and unsaved changes
 * - Supports custom equality functions for change detection
 * - Provides manual save function and automatic debounced saving
 *
 * Parameters:
 * - data (T): The data to save
 * - saveFunction (function): Function that saves the data (returns Promise)
 * - options (UseAutoSaveOptions, optional): Configuration options
 *   - delay (number, optional): Delay in milliseconds (default: 30 seconds)
 *   - enabled (boolean, optional): Whether auto-save is enabled (default: true)
 *   - showToast (boolean, optional): Whether to show toast notifications (default: false)
 *   - onSuccess (function, optional): Callback on successful save
 *   - onError (function, optional): Callback on save error
 *   - isEqual (function, optional): Custom equality function
 *
 * Returns:
 * - AutoSaveState & { save: () => Promise<void> }: State object with manual save function
 */
export function useAutoSave<T>(
  data: T,
  saveFunction: (data: T) => Promise<void>,
  options: UseAutoSaveOptions<T> = {},
): AutoSaveState & { save: () => Promise<void> } {
  const {
    delay = DEFAULT_AUTO_SAVE_DELAY_MS,
    enabled = true,
    showToast = false,
    onSuccess,
    onError,
    isEqual = defaultIsEqual,
  } = options;

  const [state, setState] = useState<AutoSaveState>({
    isSaving: false,
    lastSaved: null,
    error: null,
    hasUnsavedChanges: false,
  });

  const lastSavedDataRef = useRef<T>(data);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const savingRef = useRef(false);

  const hasDataChanged = useCallback(() => {
    return !isEqual(data, lastSavedDataRef.current);
  }, [data, isEqual]);

  const save = useCallback(async (): Promise<void> => {
    if (savingRef.current || !enabled) {
      return;
    }

    try {
      savingRef.current = true;
      setState((prev) => ({ ...prev, isSaving: true, error: null }));

      await saveFunction(data);

      lastSavedDataRef.current = data;
      const now = new Date();

      setState((prev) => ({
        ...prev,
        isSaving: false,
        lastSaved: now,
        hasUnsavedChanges: false,
      }));

      if (showToast) {
        toast.success(TOAST_MESSAGES.AUTO_SAVE_SUCCESS, {
          duration: TOAST_DURATION_SUCCESS_MS,
          position: TOAST_POSITION,
        });
      }

      onSuccess?.();
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isSaving: false,
        error,
      }));

      if (showToast) {
        toast.error(TOAST_MESSAGES.AUTO_SAVE_ERROR, {
          duration: TOAST_DURATION_ERROR_MS,
          position: TOAST_POSITION,
        });
      }

      onError?.(error);
    } finally {
      savingRef.current = false;
    }
  }, [data, saveFunction, enabled, showToast, onSuccess, onError]);

  useEffect(() => {
    if (!enabled || savingRef.current) {
      return;
    }

    const dataChanged = hasDataChanged();

    setState((prev) => ({
      ...prev,
      hasUnsavedChanges: dataChanged,
    }));

    if (!dataChanged) {
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      save();
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, delay, enabled, hasDataChanged, save]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    ...state,
    save,
  };
}

/**
 * Hook: useFormPersistence
 * Description:
 * - Persists form data in localStorage with expiry support
 * - Automatically saves data with debouncing
 * - Provides restore and clear functions
 * - Checks for persisted data on mount
 *
 * Parameters:
 * - data (T): The form data to persist
 * - options (UseFormPersistenceOptions): Configuration options
 *   - key (string): localStorage key
 *   - enabled (boolean, optional): Whether persistence is enabled (default: true)
 *   - expiry (number, optional): Expiry in milliseconds (default: 24 hours)
 *   - onRestore (function, optional): Callback when data is restored
 *   - serialize (function, optional): Custom serialization (default: JSON.stringify)
 *   - deserialize (function, optional): Custom deserialization (default: JSON.parse)
 *
 * Returns:
 * - Object containing:
 *   - restore (function): Function to restore persisted data
 *   - clear (function): Function to clear persisted data
 *   - hasPersistedData (boolean): Whether persisted data exists
 *   - isExpired (boolean): Whether persisted data is expired
 */
export function useFormPersistence<T>(
  data: T,
  options: UseFormPersistenceOptions<T>,
): {
  restore: () => T | null;
  clear: () => void;
  hasPersistedData: boolean;
  isExpired: boolean;
} {
  const {
    key,
    enabled = true,
    expiry = DEFAULT_PERSISTENCE_EXPIRY_MS,
    onRestore,
    serialize = JSON.stringify,
    deserialize = JSON.parse,
  } = options;

  const [persistenceState, setPersistenceState] = useState({
    hasPersistedData: false,
    isExpired: false,
  });

  const persistData = useCallback(() => {
    if (!enabled || typeof window === 'undefined') {
      return;
    }

    try {
      const persistedData: PersistedData<T> = {
        data,
        timestamp: Date.now(),
      };

      localStorage.setItem(key, serialize(persistedData));
    } catch (error) {
      console.error(ERROR_MESSAGES.PERSIST_FAILED, error);
    }
  }, [data, enabled, key, serialize]);

  const restore = useCallback((): T | null => {
    if (!enabled || typeof window === 'undefined') {
      return null;
    }

    try {
      const stored = localStorage.getItem(key);
      if (!stored) {
        setPersistenceState({ hasPersistedData: false, isExpired: false });
        return null;
      }

      const persistedData = deserialize(stored) as PersistedData<T>;
      const { data: storedData, timestamp } = persistedData;

      const isExpired = Date.now() - timestamp > expiry;

      setPersistenceState({
        hasPersistedData: true,
        isExpired,
      });

      if (isExpired) {
        localStorage.removeItem(key);
        return null;
      }

      onRestore?.(storedData);
      return storedData;
    } catch (error) {
      console.error(ERROR_MESSAGES.RESTORE_FAILED, error);
      localStorage.removeItem(key);
      setPersistenceState({ hasPersistedData: false, isExpired: false });
      return null;
    }
  }, [enabled, key, expiry, onRestore, deserialize]);

  const clear = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      localStorage.removeItem(key);
      setPersistenceState({ hasPersistedData: false, isExpired: false });
    } catch (error) {
      console.error(ERROR_MESSAGES.CLEAR_FAILED, error);
    }
  }, [key]);

  useEffect(() => {
    const timeoutId = setTimeout(persistData, PERSISTENCE_DEBOUNCE_MS);
    return () => clearTimeout(timeoutId);
  }, [persistData]);

  useEffect(() => {
    const initialRestore = () => {
      if (!enabled || typeof window === 'undefined') return;

      try {
        const stored = localStorage.getItem(key);
        if (!stored) {
          setPersistenceState({ hasPersistedData: false, isExpired: false });
          return;
        }

        const persistedData = deserialize(stored) as PersistedData<T>;
        const { timestamp } = persistedData;
        const isExpired = Date.now() - timestamp > expiry;

        setPersistenceState({
          hasPersistedData: true,
          isExpired,
        });

        if (isExpired) {
          localStorage.removeItem(key);
        }
      } catch (error) {
        console.error(ERROR_MESSAGES.CHECK_FAILED, error);
        localStorage.removeItem(key);
        setPersistenceState({ hasPersistedData: false, isExpired: false });
      }
    };

    initialRestore();
  }, [enabled, key, expiry, deserialize]);

  return {
    restore,
    clear,
    hasPersistedData: persistenceState.hasPersistedData,
    isExpired: persistenceState.isExpired,
  };
}

/**
 * Hook: useQuizAutoSave
 * Description:
 * - Specialized hook for auto-saving quiz draft data
 * - Combines useAutoSave and useFormPersistence
 * - Uses quiz-specific storage key and expiry (7 days)
 * - Only enables auto-save when quizId is provided
 *
 * Parameters:
 * - data (T): The quiz data to save
 * - saveFunction (function): Function that saves the data (returns Promise)
 * - quizId (string, optional): Quiz ID for storage key and enabling auto-save
 *
 * Returns:
 * - Combined return values from useAutoSave and useFormPersistence
 */
export function useQuizAutoSave<T>(
  data: T,
  saveFunction: (data: T) => Promise<void>,
  quizId?: string,
) {
  const autoSave = useAutoSave(data, saveFunction, {
    delay: DEFAULT_AUTO_SAVE_DELAY_MS,
    enabled: !!quizId,
    showToast: false,
  });

  const persistence = useFormPersistence(data, {
    key: `${STORAGE_KEY_PREFIX}${quizId || STORAGE_KEY_NEW}`,
    enabled: true,
    expiry: QUIZ_PERSISTENCE_EXPIRY_MS,
  });

  return {
    ...autoSave,
    ...persistence,
  };
}

//----------------------------------------------------
// 5. Helper Functions
//----------------------------------------------------
/**
 * Function: defaultIsEqual
 * Description:
 * - Default equality function using JSON.stringify
 * - Falls back to strict equality if JSON.stringify fails
 *
 * Parameters:
 * - a (T): First value to compare
 * - b (T): Second value to compare
 *
 * Returns:
 * - boolean: True if values are equal, false otherwise
 */
function defaultIsEqual<T>(a: T, b: T): boolean {
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return a === b;
  }
}

/**
 * Function: shallowEqual
 * Description:
 * - Shallow equality function for objects
 * - Compares object keys and values at first level only
 *
 * Parameters:
 * - a (T): First object to compare
 * - b (T): Second object to compare
 *
 * Returns:
 * - boolean: True if objects are shallowly equal, false otherwise
 */
export function shallowEqual<T extends Record<string, unknown>>(a: T, b: T): boolean {
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) {
    return false;
  }

  for (const key of keysA) {
    if (a[key] !== b[key]) {
      return false;
    }
  }

  return true;
}

/**
 * Function: deepEqual
 * Description:
 * - Deep equality function using recursive comparison
 * - Handles null, undefined, and type mismatches
 * - Recursively compares nested objects
 *
 * Parameters:
 * - a (unknown): First value to compare
 * - b (unknown): Second value to compare
 *
 * Returns:
 * - boolean: True if values are deeply equal, false otherwise
 */
export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) {
    return true;
  }

  if (a == null || b == null) {
    return a === b;
  }

  if (typeof a !== typeof b) {
    return false;
  }

  if (typeof a === 'object') {
    const aObj = a as Record<string, unknown>;
    const bObj = b as Record<string, unknown>;

    const keysA = Object.keys(aObj);
    const keysB = Object.keys(bObj);

    if (keysA.length !== keysB.length) {
      return false;
    }

    for (const key of keysA) {
      if (!deepEqual(aObj[key], bObj[key])) {
        return false;
      }
    }

    return true;
  }

  return false;
}

//----------------------------------------------------
// 6. Export
//----------------------------------------------------
