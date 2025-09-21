'use client';

import React, { Suspense, useState, useEffect } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Header, PageContainer, Container, Main } from '@/components/ui';
import { PlayerCountdownScreen } from '@/components/game';

function WaitingRoomContent() {
  const searchParams = useSearchParams();
  const playerName = searchParams.get('name') || '';
  const roomCode = searchParams.get('code') || '';

  // Mobile detection
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Countdown state
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdownTime] = useState(5);

  const handleCountdownComplete = () => {
    // Navigate to player question screen after countdown
    window.location.href = `/player-question-screen?code=${roomCode}&playerId=test&name=${encodeURIComponent(playerName)}`;
  };

  const handleManualStart = () => {
    // Show countdown first
    setShowCountdown(true);
  };

  // Show countdown screen if countdown is active
  if (showCountdown) {
    return (
      <PlayerCountdownScreen
        countdownTime={countdownTime}
        onCountdownComplete={handleCountdownComplete}
        message="準備してください！"
        questionNumber={1}
        totalQuestions={10}
        isMobile={isMobile}
      />
    );
  }

  return (
    <PageContainer>
      <Header>
        <Container size="sm">
          <div className="flex flex-col items-center space-y-2 md:space-y-3">
            {/* Logo with enhanced styling */}
            <div className="relative">
              {/* Outer glow for logo */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full blur-lg opacity-40 scale-110"></div>

              {/* Logo container with 3D effect */}
              <div className="relative bg-gradient-to-br from-cyan-100 to-blue-100 p-3 rounded-full border-2 border-cyan-300 shadow-lg">
                <Image
                  src="/logo.png"
                  alt="TUIZ情報王 ロゴ - リアルタイムクイズプラットフォーム"
                  width={80}
                  height={80}
                  priority
                  className="rounded-full"
                />
              </div>

              {/* Decorative elements around logo */}
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full animate-pulse"></div>
              <div
                className="absolute -bottom-2 -left-2 w-3 h-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full animate-pulse"
                style={{ animationDelay: '0.5s' }}
              ></div>
            </div>

            {/* Enhanced title */}
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text text-transparent animate-pulse">
                TUIZ情報王
              </h1>
              <div className="mt-2 flex justify-center space-x-1">
                <div className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce"></div>
                <div
                  className="w-1 h-1 bg-blue-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                ></div>
                <div
                  className="w-1 h-1 bg-purple-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0.4s' }}
                ></div>
              </div>
            </div>
          </div>
        </Container>
      </Header>
      <Main className="flex-1">
        <Container
          size="sm"
          className="flex flex-col items-center justify-center py-4 md:py-2 space-y-4 md:space-y-6"
        >
          {/* Large Waiting Room Title with Gradient */}
          <div className="text-center">
            <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 bg-clip-text text-transparent animate-pulse">
              待機中
            </h1>
          </div>
          {/* Player Info with Avatar and Name */}
          <div className="flex flex-col items-center space-y-4">
            {/* Avatar */}
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
            </div>

            {/* Player Name in Colorful Parallelogram */}
            <div className="relative inline-block">
              {/* Outer glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 transform -skew-x-12 rounded-lg blur-lg opacity-40 scale-110"></div>

              {/* Main parallelogram with 3D effect */}
              <div className="relative bg-gradient-to-br from-cyan-500 via-blue-500 to-cyan-600 transform -skew-x-12 px-8 py-4 rounded-lg hover:scale-105 transition-all duration-300">
                {/* Inner highlight */}
                <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent rounded-t-lg transform -skew-x-12"></div>

                <span className="relative text-2xl md:text-3xl font-black text-white transform skew-x-12 inline-block">
                  {playerName || 'プレイヤー'}
                </span>
              </div>

              {/* Decorative corner elements */}
              <div className="absolute -top-2 -left-2 w-4 h-4 bg-gradient-to-br from-cyan-300 to-cyan-500 rounded-full transform -skew-x-12"></div>
              <div className="absolute -bottom-2 -right-2 w-3 h-3 bg-gradient-to-br from-blue-300 to-blue-500 rounded-full transform -skew-x-12"></div>
              <div className="absolute top-1/2 -right-1 w-2 h-2 bg-gradient-to-br from-white to-cyan-200 rounded-full transform -skew-x-12"></div>
            </div>
          </div>
          {/* Waiting Message */}
          <div className="text-center max-w-md">
            <div className="relative inline-block">
              {/* Background glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-100 to-blue-100 rounded-2xl blur-sm opacity-50 scale-105"></div>

              {/* Message container */}
              <div className="relative bg-gradient-to-r from-cyan-50 to-blue-50 px-6 py-4 rounded-2xl border border-cyan-200">
                <p className="text-lg md:text-xl font-medium bg-gradient-to-r from-cyan-700 to-blue-700 bg-clip-text text-transparent leading-relaxed">
                  ホストがクイズ開始するのを待っています
                  <br />
                  お待ちください
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

          {/* Room Code */}
          <div className="text-center">
            <p className="text-2xl md:text-3xl font-semibold text-gray-700 mb-4">ルームコード</p>
            <div className="relative inline-block">
              {/* Outer glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl blur-lg opacity-30 scale-110"></div>

              {/* Main container with 3D effect */}
              <div className="relative bg-gradient-to-br from-cyan-100 via-blue-50 to-cyan-100 px-8 py-6 rounded-xl border-2 border-cyan-300  transform hover:scale-105 hover:shadow-cyan-200/50 transition-all duration-300">
                {/* Inner highlight */}
                <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent rounded-t-xl"></div>

                <span className="relative text-3xl md:text-4xl font-mono font-black bg-gradient-to-r from-cyan-700 via-blue-600 to-cyan-700 bg-clip-text text-transparent tracking-wider">
                  {roomCode || '------'}
                </span>
              </div>

              {/* Decorative corner elements */}
              <div className="absolute -top-3 -left-3 w-6 h-6 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full shadow-lg"></div>
              <div className="absolute -bottom-3 -right-3 w-5 h-5 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full shadow-lg"></div>
              <div className="absolute top-1/2 -right-2 w-3 h-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full shadow-md"></div>
            </div>
          </div>

          {/* Manual Start Game Button for Testing */}
          <div className="text-center max-w-md">
            <button
              onClick={handleManualStart}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <span className="text-lg">🚀</span>
              <span>テスト: ゲーム開始</span>
            </button>
            <p className="text-xs text-gray-500 text-center mt-2">
              開発用: カウントダウン後にプレイヤー画面に移動
            </p>
          </div>
        </Container>
      </Main>
    </PageContainer>
  );
}

export default function WaitingRoomPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WaitingRoomContent />
    </Suspense>
  );
}
