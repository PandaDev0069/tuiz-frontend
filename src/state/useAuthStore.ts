// ====================================================
// File Name   : useAuthStore.ts
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-08-22
// Last Update : 2025-12-22
//
// Description:
// - Zustand store for authentication state management
// - Handles user login, registration, logout, and session management
// - Manages user and session state with device ID support
//
// Notes:
// - Clears user-specific data on login/logout
// - Integrates with auth service and query client
// - Provides device ID for WebSocket connections
// ====================================================

//----------------------------------------------------
// 1. Imports / Dependencies
//----------------------------------------------------
import { create } from 'zustand';

import { authService } from '@/lib/auth';
import { getOrCreateDeviceId } from '@/lib/deviceId';
import { clearUserSpecificQueries } from '@/lib/queryClient';

import type { User, Session, AuthState, LoginRequest, RegisterRequest } from '@/types/auth';

import { useQuizLibraryStore } from './useQuizLibraryStore';

//----------------------------------------------------
// 3. Types / Interfaces
//----------------------------------------------------
/**
 * Interface: AuthActions
 * Description:
 * - Action methods for authentication store
 * - Provides login, register, logout, and state management methods
 */
interface AuthActions {
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: (clearCredentials?: boolean) => Promise<void>;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
  initializeAuth: () => void;
  getDeviceId: () => string;
}

//----------------------------------------------------
// 5. Helper Functions
//----------------------------------------------------
/**
 * Function: clearUserSpecificData
 * Description:
 * - Clears all user-specific data from stores and caches
 * - Resets quiz library store and React Query caches
 *
 * Returns:
 * - void
 */
function clearUserSpecificData(): void {
  useQuizLibraryStore.getState().resetAllState();

  clearUserSpecificQueries();
}

//----------------------------------------------------
// 4. Core Logic
//----------------------------------------------------
/**
 * Hook: useAuthStore
 * Description:
 * - Main Zustand store hook for authentication state
 * - Manages user, session, and loading states
 * - Provides authentication actions and device ID
 *
 * Returns:
 * - AuthState & AuthActions: Combined state and actions
 */
export const useAuthStore = create<AuthState & AuthActions>()((set) => ({
  user: null,
  session: null,
  loading: false,

  login: async (data: LoginRequest) => {
    try {
      set({ loading: true });

      clearUserSpecificData();

      const response = await authService.login(data);

      set({
        user: response.user,
        session: response.session,
        loading: false,
      });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  register: async (data: RegisterRequest) => {
    try {
      set({ loading: true });

      clearUserSpecificData();

      const response = await authService.register(data);

      set({
        user: response.user,
        session: response.session,
        loading: false,
      });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  logout: async (clearCredentials: boolean = false) => {
    try {
      set({ loading: true });
      await authService.logout(clearCredentials);

      clearUserSpecificData();

      set({
        user: null,
        session: null,
        loading: false,
      });
    } catch (error) {
      console.warn('Logout failed, but clearing local state:', error);
      authService.clearAuthData();

      clearUserSpecificData();

      set({
        user: null,
        session: null,
        loading: false,
      });
    }
  },

  setUser: (user: User | null) => {
    const currentUser = useAuthStore.getState().user;

    if (currentUser && user && currentUser.id !== user.id) {
      clearUserSpecificData();
    }

    set({ user });
  },

  setSession: (session: Session | null) => set({ session }),

  setLoading: (loading: boolean) => set({ loading }),

  clearAuth: () => {
    clearUserSpecificData();

    set({
      user: null,
      session: null,
      loading: false,
    });
  },

  initializeAuth: () => {
    const authData = authService.getStoredAuthData();
    if (authData && !authService.isSessionExpired(authData.session)) {
      set({
        user: authData.user as User,
        session: authData.session as Session,
      });
    } else {
      authService.clearAuthData();
      set({
        user: null,
        session: null,
      });
    }
  },

  getDeviceId: () => {
    if (typeof window === 'undefined') {
      return '';
    }
    try {
      return getOrCreateDeviceId();
    } catch (error) {
      console.error('[useAuthStore] Failed to get device ID:', error);
      return '';
    }
  },
}));
