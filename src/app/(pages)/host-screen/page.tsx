'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { PageContainer, Container, Main } from '@/components/ui';

export default function HostScreenPage() {
  const searchParams = useSearchParams();
  const roomCode = searchParams.get('code') || '';
  const quizId = searchParams.get('quizId') || '';

  return (
    <PageContainer>
      <Main className="flex-1">
        <Container
          size="sm"
          className="flex flex-col items-center justify-center py-4 md:py-2 space-y-4 md:space-y-6"
        >
          {/* Public Display Title */}
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 bg-clip-text text-transparent animate-pulse">
              クイズ画面
            </h1>
          </div>

          {/* Room Code Display - Large for audience */}
          <div className="text-center">
            <div className="relative inline-block">
              {/* Outer glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl blur-lg opacity-30 scale-110"></div>

              {/* Main container with 3D effect */}
              <div className="relative bg-gradient-to-br from-cyan-100 via-blue-50 to-cyan-100 px-12 py-8 rounded-xl border-2 border-cyan-300 shadow-2xl transform hover:scale-105 hover:shadow-cyan-200/50 transition-all duration-300">
                {/* Inner highlight */}
                <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent rounded-t-xl"></div>

                <span className="relative text-7xl md:text-8xl font-mono font-black bg-gradient-to-r from-cyan-700 via-blue-600 to-cyan-700 bg-clip-text text-transparent tracking-wider drop-shadow-sm">
                  {roomCode || '------'}
                </span>
              </div>

              {/* Decorative corner elements */}
              <div className="absolute -top-3 -left-3 w-6 h-6 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full shadow-lg"></div>
              <div className="absolute -bottom-3 -right-3 w-5 h-5 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full shadow-lg"></div>
              <div className="absolute top-1/2 -right-2 w-3 h-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full shadow-md"></div>
            </div>
          </div>

          {/* Waiting Message for Audience */}
          <div className="text-center max-w-md">
            <div className="relative inline-block">
              {/* Background glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-100 to-blue-100 rounded-2xl blur-sm opacity-50 scale-105"></div>

              {/* Message container */}
              <div className="relative bg-gradient-to-r from-cyan-50 to-blue-50 px-6 py-4 rounded-2xl border border-cyan-200">
                <p className="text-lg md:text-xl font-medium bg-gradient-to-r from-cyan-700 to-blue-700 bg-clip-text text-transparent leading-relaxed">
                  クイズ開始をお待ちください
                  <br />
                  ホストが準備中です
                </p>

                {/* Decorative dots */}
                <div className="flex justify-center space-x-2 mt-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0.1s' }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Quiz Content Placeholder */}
          <div className="text-center max-w-2xl">
            <div className="relative inline-block">
              {/* Background glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-100 to-blue-100 rounded-2xl blur-sm opacity-50 scale-105"></div>

              {/* Content container */}
              <div className="relative bg-gradient-to-r from-cyan-50 to-blue-50 px-8 py-6 rounded-2xl border border-cyan-200">
                <p className="text-lg md:text-xl font-medium bg-gradient-to-r from-cyan-700 to-blue-700 bg-clip-text text-transparent leading-relaxed">
                  クイズ問題がここに表示されます
                  <br />
                  <span className="text-sm text-gray-500">
                    (実装予定: 問題文、選択肢、タイマーなど)
                    {quizId && ` - クイズID: ${quizId}`}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </Container>
      </Main>
    </PageContainer>
  );
}
