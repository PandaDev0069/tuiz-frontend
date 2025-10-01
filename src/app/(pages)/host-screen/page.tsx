'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { PageContainer, Container, Main } from '@/components/ui';
import { QRCode } from '@/components/ui/QRCode';
import { PublicCountdownScreen } from '@/components/game';

function HostScreenContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomCode = searchParams.get('code') || '';
  const quizId = searchParams.get('quizId') || '';
  const [joinUrl, setJoinUrl] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdownTime] = useState(5);

  useEffect(() => {
    setJoinUrl(`https://tuiz-info-king.vercel.app/join`);
  }, [roomCode]);

  // Listen for game start events (this would be connected to real-time updates)
  useEffect(() => {
    const handleGameStart = () => {
      setShowCountdown(true);
    };

    // For now, we'll simulate this with a timeout for testing
    // In real implementation, this would listen to WebSocket events
    const timer = setTimeout(() => {
      // Only redirect if we're in the host screen (not already in question screen)
      if (window.location.pathname === '/host-screen') {
        handleGameStart();
      }
    }, 500000); // 5 second delay for testing

    return () => clearTimeout(timer);
  }, [roomCode, quizId, router]);

  const handleCountdownComplete = () => {
    setGameStarted(true);
    // Redirect to host question screen after countdown
    router.push(`/host-question-screen?code=${roomCode}&quizId=${quizId}`);
  };

  // Show countdown screen if countdown is active
  if (showCountdown) {
    return (
      <PublicCountdownScreen
        countdownTime={countdownTime}
        onCountdownComplete={handleCountdownComplete}
        message="準備してください！"
        questionNumber={1}
        totalQuestions={10}
      />
    );
  }

  // Show loading state if game is starting
  if (gameStarted) {
    return (
      <PageContainer>
        <Main className="flex-1">
          <Container
            size="sm"
            className="flex flex-col items-center justify-center py-4 md:py-2 space-y-4 md:space-y-6"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
                <div className="w-8 h-8 bg-white rounded-full"></div>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                ゲーム開始中...
              </h1>
              <p className="text-gray-600 mt-2">クイズ画面に移動しています</p>
            </div>
          </Container>
        </Main>
      </PageContainer>
    );
  }

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

                {/* Test Button for Development */}
                <div className="mt-4">
                  <button
                    onClick={() => setShowCountdown(true)}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg text-sm font-medium transition-all duration-200"
                  >
                    テスト: ゲーム開始
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Main>
    </PageContainer>
  );
}

export default function HostScreenPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HostScreenContent />
    </Suspense>
  );
}
