// ====================================================
// File Name   : AuthGuard.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-11
// Last Update : 2025-09-13
//
// Description:
// - Authentication guard component that protects routes requiring authentication
// - Redirects unauthenticated users to login page
// - Shows loading state while checking authentication
// - Provides higher-order component for protecting pages
//
// Notes:
// - Uses Next.js router for navigation
// - Integrates with auth store for authentication state
// - Supports custom fallback components and redirect paths
// ====================================================

'use client';

//----------------------------------------------------
// 1. Imports / Dependencies
//----------------------------------------------------
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { Container, PageContainer } from '@/components/ui';
import { useAuthStore } from '@/state/useAuthStore';

//----------------------------------------------------
// 2. Constants / Configuration
//----------------------------------------------------
const DEFAULT_REDIRECT_PATH = '/auth/login';
const REDIRECT_QUERY_PARAM = 'redirect';
const LOADING_MESSAGE = '認証を確認中...';
const CONTAINER_SIZE = 'sm' as const;

//----------------------------------------------------
// 3. Types / Interfaces
//----------------------------------------------------
export interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
  fallback?: React.ReactNode;
}

export interface WithAuthGuardOptions {
  redirectTo?: string;
  fallback?: React.ReactNode;
}

//----------------------------------------------------
// 4. Core Logic
//----------------------------------------------------
/**
 * Component: AuthGuard
 * Description:
 * - Protects routes requiring authentication
 * - Redirects unauthenticated users to login page
 * - Shows loading state while checking authentication
 * - Stores current URL for post-login redirect
 *
 * Parameters:
 * - children (React.ReactNode): Content to render when authenticated
 * - redirectTo (string, optional): Path to redirect unauthenticated users (default: '/auth/login')
 * - fallback (React.ReactNode, optional): Custom component to show during loading
 *
 * Returns:
 * - JSX.Element: Protected content or loading/redirect UI
 */
export function AuthGuard({
  children,
  redirectTo = DEFAULT_REDIRECT_PATH,
  fallback,
}: AuthGuardProps) {
  const router = useRouter();
  const { user, session, loading, initializeAuth } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isInitialized) {
      initializeAuth();
      setIsInitialized(true);
    }
  }, [initializeAuth, isInitialized]);

  if (loading || !isInitialized) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <PageContainer className="min-h-screen flex items-center justify-center">
        <Container size={CONTAINER_SIZE} className="text-center">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-gray-600">{LOADING_MESSAGE}</p>
          </div>
        </Container>
      </PageContainer>
    );
  }

  if (!user || !session) {
    const currentPath = window.location.pathname + window.location.search;
    const redirectUrl = `${redirectTo}?${REDIRECT_QUERY_PARAM}=${encodeURIComponent(currentPath)}`;

    router.push(redirectUrl);
    return null;
  }

  return <>{children}</>;
}

/**
 * Function: withAuthGuard
 * Description:
 * - Higher-order component that wraps a component with authentication guard
 * - Provides convenient way to protect pages with authentication
 *
 * Parameters:
 * - Component (React.ComponentType<P>): Component to protect
 * - options (WithAuthGuardOptions, optional): Configuration options
 *   - redirectTo (string, optional): Path to redirect unauthenticated users
 *   - fallback (React.ReactNode, optional): Custom loading component
 *
 * Returns:
 * - React.ComponentType<P>: Wrapped component with authentication guard
 *
 * Example:
 * ```typescript
 * const ProtectedPage = withAuthGuard(MyPage, { redirectTo: '/login' });
 * ```
 */
export function withAuthGuard<P extends object>(
  Component: React.ComponentType<P>,
  options?: WithAuthGuardOptions,
) {
  return function AuthGuardedComponent(props: P) {
    return (
      <AuthGuard redirectTo={options?.redirectTo} fallback={options?.fallback}>
        <Component {...props} />
      </AuthGuard>
    );
  };
}

//----------------------------------------------------
// 5. Helper Functions
//----------------------------------------------------

//----------------------------------------------------
// 6. Export
//----------------------------------------------------
