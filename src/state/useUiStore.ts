// src/state/useUiStore.ts
import { create } from 'zustand';

interface UiState {
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;
  toast: string | null;
  setToast: (msg: string | null) => void;
}

export const useUiStore = create<UiState>((set) => ({
  theme: 'light',
  setTheme: (theme) => set({ theme }),
  toast: null,
  setToast: (toast) => set({ toast }),
}));
