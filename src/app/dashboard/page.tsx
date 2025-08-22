'use client';

import React from 'react';
import { useAuthStore } from '@/state/useAuthStore';
import { Container, Button, PageContainer } from '@/components/ui';
import Link from 'next/link';

export default function DashboardPage() {
  const { logout, loading } = useAuthStore();

  const handleLogout = async () => {
    try {
      await logout();
      // Optionally redirect to home page after logout
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
      // Still redirect even if logout failed
      window.location.href = '/';
    }
  };

  return (
    <PageContainer className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <main role="main">
        <Container size="lg" className="max-w-4xl mx-auto">
          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button variant="outline" size="lg">
                ホームに戻る
              </Button>
            </Link>
            <Button variant="destructive" size="lg" onClick={handleLogout} disabled={loading}>
              {loading ? 'ログアウト中...' : 'ログアウト'}
            </Button>
          </div>
        </Container>
      </main>
    </PageContainer>
  );
}
