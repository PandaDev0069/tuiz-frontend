'use client';

import React from 'react';
import { useAuthStore } from '@/state/useAuthStore';
import { Container, PageContainer } from '@/components/ui';
import { StructuredData } from '@/components/SEO';

export default function CreateQuizPage() {
  const {} = useAuthStore();

  return (
    <>
      {/* Structured Data for SEO */}
      <StructuredData type="quiz" />
      <StructuredData type="software" />
      <PageContainer className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <main role="main">
          <Container size="lg" className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">クイズ作成</h1>
              <p className="text-lg text-gray-600">
                新しいクイズを作成して、学習者に素晴らしい体験を提供しましょう
              </p>
            </div>

            {/* Quiz Creation Form Placeholder */}
            <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
              <div className="text-center py-12">
                <div className="text-6xl text-gray-300 mb-4">📝</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">クイズ作成フォーム</h3>
                <p className="text-gray-500">ここにクイズ作成の詳細フォームが表示されます</p>
              </div>
            </div>
          </Container>
        </main>
      </PageContainer>
    </>
  );
}
