'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/state/useAuthStore';
import { Loader2 } from 'lucide-react';
import { Container, PageContainer } from '@/components/ui';

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
  fallback?: React.ReactNode;
}

/**
 * Authentication guard component that protects routes requiring authentication
 * - Redirects unauthenticated users to login page
 * - Shows loading state while checking authentication
 * - Can be customized with custom fallback component
 */
export function AuthGuard({ children, redirectTo = '/auth/login', fallback }: AuthGuardProps) {
  const router = useRouter();
  const { user, session, loading, initializeAuth } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize auth state if not already done
    if (!isInitialized) {
      console.log('AuthGuard: Initializing auth state');
      initializeAuth();
      setIsInitialized(true);
    }
  }, [initializeAuth, isInitialized]);

  // Debug logging
  useEffect(() => {
    console.log('AuthGuard: Auth state changed', {
      user: !!user,
      session: !!session,
      loading,
      isInitialized,
      hasToken: !!session?.access_token,
    });
  }, [user, session, loading, isInitialized]);

  // Show loading state while checking authentication
  if (loading || !isInitialized) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <PageContainer className="min-h-screen flex items-center justify-center">
        <Container size="sm" className="text-center">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-gray-600">認証を確認中...</p>
          </div>
        </Container>
      </PageContainer>
    );
  }

  // Redirect to login if not authenticated
  if (!user || !session) {
    // Store the current URL to redirect back after login
    const currentPath = window.location.pathname + window.location.search;
    const redirectUrl = redirectTo + `?redirect=${encodeURIComponent(currentPath)}`;

    router.push(redirectUrl);
    return null;
  }

  // User is authenticated, render children
  return <>{children}</>;
}

/**
 * Higher-order component for protecting pages
 */
export function withAuthGuard<P extends object>(
  Component: React.ComponentType<P>,
  options?: { redirectTo?: string; fallback?: React.ReactNode },
) {
  return function AuthGuardedComponent(props: P) {
    return (
      <AuthGuard redirectTo={options?.redirectTo} fallback={options?.fallback}>
        <Component {...props} />
      </AuthGuard>
    );
  };
}
