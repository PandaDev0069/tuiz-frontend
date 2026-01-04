// ====================================================
// File Name   : useUiStore.ts
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-08-20
// Last Update : 2025-08-20
//
// Description:
// - Zustand store for UI state management
// - Manages theme and toast notification state
// - Provides reactive state updates for UI components
//
// Notes:
// - Uses Zustand for lightweight state management
// - Theme state persists across component re-renders
// - Toast state is ephemeral and should be cleared after display
// ====================================================

//----------------------------------------------------
// 1. Imports / Dependencies
//----------------------------------------------------
import { create } from 'zustand';

//----------------------------------------------------
// 2. Types / Interfaces
//----------------------------------------------------
/**
 * Interface: UiState
 * Description:
 * - UI state interface for Zustand store
 * - Manages theme preference and toast notifications
 */
interface UiState {
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;
  toast: string | null;
  setToast: (msg: string | null) => void;
}

//----------------------------------------------------
// 3. Core Logic
//----------------------------------------------------
/**
 * Hook: useUiStore
 * Description:
 * - Zustand store hook for UI state management
 * - Provides theme and toast state with setter functions
 *
 * Returns:
 * - UiState: UI state object with theme, toast, and their setters
 */
export const useUiStore = create<UiState>((set) => ({
  theme: 'light',
  setTheme: (theme) => set({ theme }),
  toast: null,
  setToast: (toast) => set({ toast }),
}));
