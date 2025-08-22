// src/components/providers/AuthProvider.tsx
'use client';

import React, { useEffect } from 'react';
import { useAuthStore } from '@/state/useAuthStore';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return <>{children}</>;
}
