// ====================================================
// File Name   : AuthProvider.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-08-22
// Last Update : 2025-08-22
//
// Description:
// - Authentication provider component for the application
// - Initializes authentication state on mount
// - Wraps children components to provide auth context
//
// Notes:
// - Client-only component (requires 'use client')
// - Uses Zustand store for authentication state management
// - Initializes auth on component mount via useEffect
// ====================================================

'use client';

import React, { useEffect } from 'react';

import { useAuthStore } from '@/state/useAuthStore';

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Component: AuthProvider
 * Description:
 * - Provider component that initializes authentication state
 * - Wraps application children to provide auth context
 * - Calls initializeAuth on mount to set up authentication
 *
 * Parameters:
 * - children (React.ReactNode): Child components to wrap with auth provider
 *
 * Returns:
 * - React.ReactElement: The provider component wrapping children
 *
 * Example:
 * ```tsx
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 * ```
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return <>{children}</>;
}
