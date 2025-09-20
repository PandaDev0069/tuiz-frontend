'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { PageContainer, Container, Main } from '@/components/ui';
import { QRCode } from '@/components/ui/QRCode';

export default function HostScreenPage() {
  const searchParams = useSearchParams();
  const roomCode = searchParams.get('code') || '';
  const [joinUrl, setJoinUrl] = useState('');

  useEffect(() => {
    setJoinUrl(`https://tuiz-info-king.vercel.app/join`);
  }, [roomCode]);

  return (
    <PageContainer>
      <Main className="flex-1">
        <Container
          size="sm"
          className="flex flex-col items-center justify-center py-4 md:py-2 space-y-4 md:space-y-6"
        >
          {/* Public Display Title */}
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 bg-clip-text text-transparent animate-pulse">
              TUIZ情報王
            </h1>
            <div className="mt-3 relative inline-block">
              {/* Background glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-100 to-blue-100 rounded-xl blur-sm opacity-50 scale-105"></div>

              {/* Message container */}
              <div className="relative bg-gradient-to-r from-cyan-50 to-blue-50 px-6 py-3 rounded-xl border border-cyan-200">
                <p className="text-base md:text-lg font-semibold bg-gradient-to-r from-cyan-700 to-blue-700 bg-clip-text text-transparent">
                  参加コードでクイズに参加しよう！
                </p>
              </div>
            </div>
          </div>

          {/* Room Code Display - Large for audience */}
          <div className="text-center">
            <div className="relative inline-block">
              {/* Outer glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl blur-lg opacity-30 scale-110"></div>

              {/* Main container with 3D effect */}
              <div className="relative bg-gradient-to-br from-cyan-100 via-blue-50 to-cyan-100 px-16 py-10 rounded-xl border-2 border-cyan-300 shadow-2xl transform hover:scale-105 hover:shadow-cyan-200/50 transition-all duration-300">
                {/* Inner highlight */}
                <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent rounded-t-xl"></div>

                <div className="relative">
                  <span className="text-8xl md:text-9xl font-mono font-black bg-gradient-to-r from-cyan-700 via-blue-600 to-cyan-700 bg-clip-text text-transparent tracking-wider drop-shadow-sm">
                    {roomCode || '------'}
                  </span>
                </div>
              </div>

              {/* Decorative corner elements */}
              <div className="absolute -top-3 -left-3 w-6 h-6 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full shadow-lg"></div>
              <div className="absolute -bottom-3 -right-3 w-5 h-5 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full shadow-lg"></div>
              <div className="absolute top-1/2 -right-2 w-3 h-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full shadow-md"></div>
            </div>
          </div>
          {/* QR Code for Join Page */}
          <div className="text-center max-w-md">
            <div className="relative inline-block">
              {/* Background glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-100 to-blue-100 rounded-2xl blur-sm opacity-50 scale-105"></div>

              {/* QR Code container */}
              <div className="relative bg-gradient-to-r from-cyan-50 to-blue-50 px-8 py-6 rounded-2xl border border-cyan-200">
                <h3 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-cyan-700 to-blue-700 bg-clip-text text-transparent mb-4">
                  QRコードで参加
                </h3>

                {/* QR Code */}
                <div className="relative inline-block mb-4">
                  {/* Outer glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl blur-lg opacity-30 scale-110"></div>

                  {/* Main container with 3D effect */}
                  <div className="relative bg-gradient-to-br from-cyan-100 via-blue-50 to-cyan-100 px-8 py-8 rounded-xl border-2 border-cyan-300 shadow-2xl transform hover:scale-105 hover:shadow-cyan-200/50 transition-all duration-300">
                    {/* Inner highlight */}
                    <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent rounded-t-xl"></div>

                    {/* QR Code */}
                    {joinUrl ? (
                      <QRCode value={joinUrl} size={300} className="rounded-lg" />
                    ) : (
                      <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                        <p className="text-gray-500">QRコード生成中...</p>
                      </div>
                    )}

                    {/* Decorative corner elements */}
                    <div className="absolute -top-3 -left-3 w-6 h-6 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full shadow-lg"></div>
                    <div className="absolute -bottom-3 -right-3 w-5 h-5 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full shadow-lg"></div>
                    <div className="absolute top-1/2 -right-2 w-3 h-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full shadow-md"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Main>
    </PageContainer>
  );
}
