// src/hooks/useAutoSave.ts
// Hook for auto-saving form data with debouncing and error handling

import { useEffect, useState, useRef, useCallback } from 'react';
import { toast } from 'react-hot-toast';

// ============================================================================
// AUTO-SAVE HOOK
// ============================================================================

interface UseAutoSaveOptions<T> {
  delay?: number; // Delay in milliseconds (default: 30 seconds)
  enabled?: boolean; // Whether auto-save is enabled
  showToast?: boolean; // Whether to show toast notifications
  onSuccess?: () => void; // Callback on successful save
  onError?: (error: unknown) => void; // Callback on save error
  isEqual?: (a: T, b: T) => boolean; // Custom equality function
}

interface AutoSaveState {
  isSaving: boolean;
  lastSaved: Date | null;
  error: unknown | null;
  hasUnsavedChanges: boolean;
}

/**
 * Hook for auto-saving data with debouncing
 * @param data - The data to save
 * @param saveFunction - Function that saves the data (returns a Promise)
 * @param options - Configuration options
 * @returns AutoSave state and manual save function
 */
export function useAutoSave<T>(
  data: T,
  saveFunction: (data: T) => Promise<void>,
  options: UseAutoSaveOptions<T> = {},
): AutoSaveState & { save: () => Promise<void> } {
  const {
    delay = 30000, // 30 seconds default
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

  // Check if data has changed
  const hasDataChanged = useCallback(() => {
    return !isEqual(data, lastSavedDataRef.current);
  }, [data, isEqual]);

  // Manual save function
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
        toast.success('自動保存されました', {
          duration: 2000,
          position: 'bottom-right',
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
        toast.error('自動保存に失敗しました', {
          duration: 4000,
          position: 'bottom-right',
        });
      }

      onError?.(error);
    } finally {
      savingRef.current = false;
    }
  }, [data, saveFunction, enabled, showToast, onSuccess, onError]);

  // Auto-save effect
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

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for auto-save
    timeoutRef.current = setTimeout(() => {
      save();
    }, delay);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, delay, enabled, hasDataChanged, save]);

  // Cleanup on unmount
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

// ============================================================================
// FORM PERSISTENCE HOOK
// ============================================================================

interface UseFormPersistenceOptions<T> {
  key: string; // localStorage key
  enabled?: boolean; // Whether persistence is enabled
  expiry?: number; // Expiry in milliseconds (default: 24 hours)
  onRestore?: (data: T) => void; // Callback when data is restored
  serialize?: (data: T) => string; // Custom serialization
  deserialize?: (data: string) => T; // Custom deserialization
}

/**
 * Hook for persisting form data in localStorage with expiry
 * @param data - The form data to persist
 * @param options - Configuration options
 * @returns Restore function and persistence state
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
    expiry = 24 * 60 * 60 * 1000, // 24 hours
    onRestore,
    serialize = JSON.stringify,
    deserialize = JSON.parse,
  } = options;

  const [persistenceState, setPersistenceState] = useState({
    hasPersistedData: false,
    isExpired: false,
  });

  // Save data to localStorage
  const persistData = useCallback(() => {
    if (!enabled || typeof window === 'undefined') {
      return;
    }

    try {
      const persistedData = {
        data,
        timestamp: Date.now(),
      };

      localStorage.setItem(key, serialize(persistedData));
    } catch (error) {
      console.error('Failed to persist form data:', error);
    }
  }, [data, enabled, key, serialize]);

  // Restore data from localStorage
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

      const persistedData = deserialize(stored);
      const { data: storedData, timestamp } = persistedData;

      const isExpired = Date.now() - timestamp > expiry;

      setPersistenceState({
        hasPersistedData: true,
        isExpired,
      });

      if (isExpired) {
        // Clear expired data
        localStorage.removeItem(key);
        return null;
      }

      onRestore?.(storedData);
      return storedData;
    } catch (error) {
      console.error('Failed to restore form data:', error);
      localStorage.removeItem(key);
      setPersistenceState({ hasPersistedData: false, isExpired: false });
      return null;
    }
  }, [enabled, key, expiry, onRestore, deserialize]);

  // Clear persisted data
  const clear = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      localStorage.removeItem(key);
      setPersistenceState({ hasPersistedData: false, isExpired: false });
    } catch (error) {
      console.error('Failed to clear persisted data:', error);
    }
  }, [key]);

  // Auto-persist on data change
  useEffect(() => {
    const timeoutId = setTimeout(persistData, 1000); // Debounce by 1 second
    return () => clearTimeout(timeoutId);
  }, [persistData]);

  // Check for persisted data on mount
  useEffect(() => {
    const initialRestore = () => {
      if (!enabled || typeof window === 'undefined') return;

      try {
        const stored = localStorage.getItem(key);
        if (!stored) {
          setPersistenceState({ hasPersistedData: false, isExpired: false });
          return;
        }

        const persistedData = deserialize(stored);
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
        console.error('Failed to check persisted data:', error);
        localStorage.removeItem(key);
        setPersistenceState({ hasPersistedData: false, isExpired: false });
      }
    };

    initialRestore();
  }, [enabled, key, expiry, deserialize]); // Include dependencies

  return {
    restore,
    clear,
    hasPersistedData: persistenceState.hasPersistedData,
    isExpired: persistenceState.isExpired,
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Default equality function using JSON.stringify
 */
function defaultIsEqual<T>(a: T, b: T): boolean {
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return a === b;
  }
}

/**
 * Shallow equality function for objects
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
 * Deep equality function using recursive comparison
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

// ============================================================================
// SPECIALIZED HOOKS
// ============================================================================

/**
 * Hook for auto-saving quiz draft data
 */
export function useQuizAutoSave<T>(
  data: T,
  saveFunction: (data: T) => Promise<void>,
  quizId?: string,
) {
  const autoSave = useAutoSave(data, saveFunction, {
    delay: 30000, // 30 seconds
    enabled: !!quizId, // Only enable if we have a quiz ID
    showToast: false, // Don't show toast for auto-saves
  });

  const persistence = useFormPersistence(data, {
    key: `quiz-draft-${quizId || 'new'}`,
    enabled: true,
    expiry: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return {
    ...autoSave,
    ...persistence,
  };
}
