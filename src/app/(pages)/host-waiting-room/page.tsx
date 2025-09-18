'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header, PageContainer, Container, Main } from '@/components/ui';
import { HostSettingsModal } from '@/components/ui/overlays/host-settings-modal';
import { Settings } from 'lucide-react';
import { QuizPlaySettings } from '@/types/quiz';

export default function HostWaitingRoomPage() {
  const searchParams = useSearchParams();
  const roomCode = searchParams.get('code') || '';
  const quizId = searchParams.get('quizId') || '';

  // Settings modal state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [playSettings, setPlaySettings] = useState<Partial<QuizPlaySettings>>({
    show_question_only: true,
    show_explanation: true,
    time_bonus: true,
    streak_bonus: true,
    show_correct_answer: false,
    max_players: 400,
  });

  // Mock player data for now - will be replaced with real-time data
  const [players, setPlayers] = useState([
    { id: '1', name: 'プレイヤー1', joinedAt: new Date() },
    { id: '2', name: 'プレイヤー2', joinedAt: new Date() },
    { id: '3', name: 'プレイヤー3', joinedAt: new Date() },
  ]);

  // TODO: setPlayers will be used for real-time player updates via WebSocket
  const addTestPlayer = () => {
    const newPlayer = {
      id: (players.length + 1).toString(),
      name: `プレイヤー${players.length + 1}`,
      joinedAt: new Date(),
    };
    setPlayers([...players, newPlayer]);
  };

  return (
    <PageContainer>
      {/* Settings Button - Fixed Top Right */}
      <button
        onClick={() => setIsSettingsOpen(true)}
        className="fixed top-4 right-4 z-40 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        title="ゲーム設定"
      >
        <Settings className="w-5 h-5" />
      </button>

      <Header>
        <Container size="sm">
          <div className="flex flex-col items-center space-y-2 md:space-y-3">
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
        <div className="flex h-full">
          {/* Left Side - Player List */}
          <div className="w-80 bg-gradient-to-br from-cyan-50 to-blue-50 border-r border-cyan-200 p-4 overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-cyan-100 to-blue-100 rounded-lg p-3 mb-4 border border-cyan-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {players.length}
                  </div>
                  参加プレイヤー
                </h3>
                <button
                  onClick={addTestPlayer}
                  className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded transition-colors"
                  title="テストプレイヤーを追加"
                >
                  + テスト
                </button>
              </div>
              <p className="text-sm text-gray-600">
                最大 {playSettings.max_players || 400} 人まで参加可能
              </p>
            </div>

            {/* Player List */}
            <div className="space-y-2">
              {players.map((player, index) => (
                <div
                  key={player.id}
                  className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    {/* Player Avatar */}
                    <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {index + 1}
                    </div>

                    {/* Player Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{player.name}</p>
                      <p className="text-xs text-gray-500">
                        {player.joinedAt.toLocaleTimeString('ja-JP', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        に参加
                      </p>
                    </div>

                    {/* Status Indicator */}
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                </div>
              ))}

              {/* Empty State */}
              {players.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <div className="text-2xl text-gray-400">👥</div>
                  </div>
                  <p className="text-sm text-gray-500">まだプレイヤーが参加していません</p>
                  <p className="text-xs text-gray-400 mt-1">ルームコードを共有してください</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Main Content */}
          <div className="flex-1 flex items-center justify-center">
            <Container
              size="sm"
              className="flex flex-col items-center justify-center py-4 md:py-2 space-y-4 md:space-y-6"
            >
              {/* Host Waiting Room Title */}
              <div className="text-center">
                <h1 className="text-4xl md:text-3xl font-bold bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 bg-clip-text text-transparent animate-pulse">
                  ルームコード
                </h1>
              </div>

              {/* Room Code Display */}
              <div className="text-center">
                <div className="relative inline-block">
                  {/* Outer glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl blur-lg opacity-30 scale-110"></div>

                  {/* Main container with 3D effect */}
                  <div className="relative bg-gradient-to-br from-cyan-100 via-blue-50 to-cyan-100 px-8 py-6 rounded-xl border-2 border-cyan-300 shadow-2xl transform hover:scale-105 hover:shadow-cyan-200/50 transition-all duration-300">
                    {/* Inner highlight */}
                    <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent rounded-t-xl"></div>

                    <span className="relative text-6xl md:text-6xl font-mono font-black bg-gradient-to-r from-cyan-700 via-blue-600 to-cyan-700 bg-clip-text text-transparent tracking-wider drop-shadow-sm">
                      {roomCode || '------'}
                    </span>
                  </div>

                  {/* Decorative corner elements */}
                  <div className="absolute -top-3 -left-3 w-6 h-6 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full shadow-lg"></div>
                  <div className="absolute -bottom-3 -right-3 w-5 h-5 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full shadow-lg"></div>
                  <div className="absolute top-1/2 -right-2 w-3 h-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full shadow-md"></div>
                </div>
              </div>

              {/* Host Controls */}
              <div className="text-center max-w-md">
                <div className="relative inline-block">
                  {/* Background glow */}
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-100 to-blue-100 rounded-2xl blur-sm opacity-50 scale-105"></div>

                  {/* Controls container */}
                  <div className="relative bg-gradient-to-r from-cyan-50 to-blue-50 px-6 py-4 rounded-2xl border border-cyan-200">
                    <p className="text-lg md:text-xl font-medium bg-gradient-to-r from-cyan-700 to-blue-700 bg-clip-text text-transparent leading-relaxed mb-4">
                      ホストコントロールパネル
                    </p>

                    {/* Show Screen Button */}
                    <button
                      onClick={() => {
                        // Open host screen in new window
                        const hostScreenUrl = `/host-screen?code=${roomCode}&quizId=${quizId}`;
                        window.open(
                          hostScreenUrl,
                          'host-screen',
                          'width=1200,height=800,scrollbars=yes,resizable=yes',
                        );
                      }}
                      className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 mb-3"
                    >
                      画面表示
                    </button>

                    {/* Start Quiz Button */}
                    <button
                      onClick={() => {
                        // TODO: Implement actual quiz start logic
                        alert('クイズ開始機能は実装予定です');
                      }}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    >
                      クイズ開始
                    </button>

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
            </Container>
          </div>
        </div>
      </Main>

      {/* Settings Modal */}
      <HostSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        playSettings={playSettings}
        onPlaySettingsChange={setPlaySettings}
        roomCode={roomCode}
      />
    </PageContainer>
  );
}
