'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header, PageContainer, Container, Main } from '@/components/ui';
import { Users, BarChart3, Clock, Trophy, Eye, EyeOff } from 'lucide-react';

function HostControlPanelContent() {
  const searchParams = useSearchParams();
  const roomCode = searchParams.get('code') || '';
  const quizId = searchParams.get('quizId') || '';

  // Mock state for now
  const [isPublicScreenVisible, setIsPublicScreenVisible] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [totalQuestions] = useState(10);

  // Mock player data
  const [players] = useState([
    { id: '1', name: 'プレイヤー1', score: 1250, isConnected: true, currentAnswer: 'A' },
    { id: '2', name: 'プレイヤー2', score: 980, isConnected: true, currentAnswer: 'B' },
    { id: '3', name: 'プレイヤー3', score: 750, isConnected: false, currentAnswer: null },
    { id: '4', name: 'プレイヤー4', score: 650, isConnected: true, currentAnswer: 'A' },
    { id: '5', name: 'プレイヤー5', score: 420, isConnected: true, currentAnswer: 'C' },
  ]);

  const handleTogglePublicScreen = () => {
    setIsPublicScreenVisible(!isPublicScreenVisible);
    if (!isPublicScreenVisible) {
      // Open public screen in new window
      const publicScreenUrl = `/host-screen?code=${roomCode}&quizId=${quizId}`;
      window.open(
        publicScreenUrl,
        'public-screen',
        'width=1200,height=800,scrollbars=yes,resizable=yes',
      );
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };
  return (
    <PageContainer>
      {/* Header */}
      <Header>
        <Container size="sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                ホストコントロールパネル
              </h1>
              <div className="text-sm text-gray-600 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                ルームコード: {roomCode}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleTogglePublicScreen}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  isPublicScreenVisible
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-gray-600 hover:bg-gray-700 text-white'
                }`}
              >
                {isPublicScreenVisible ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
                <span>パブリック画面</span>
              </button>
            </div>
          </div>
        </Container>
      </Header>

      <Main className="flex-1">
        <Container size="lg" className="h-full">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full py-6">
            {/* Left Panel - Game Controls */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="text-lg font-semibold text-blue-600 mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  ゲーム制御
                </h3>

                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {currentQuestionIndex + 1} / {totalQuestions}
                    </div>
                    <div className="text-sm text-blue-300">現在の問題</div>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={handleNext}
                      disabled={currentQuestionIndex >= totalQuestions - 1}
                      className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-gray-500 disabled:to-gray-600 text-white py-2 px-4 rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
                    >
                      次のへ
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Center Panel - Player Rankings */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 h-full">
                <h3 className="text-lg font-semibold text-blue-600 mb-4 flex items-center">
                  <Trophy className="w-5 h-5 mr-2" />
                  プレイヤーランキング
                </h3>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {players
                    .sort((a, b) => b.score - a.score)
                    .map((player, index) => (
                      <div
                        key={player.id}
                        className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                          index === 0
                            ? 'bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 border border-yellow-400/30'
                            : index === 1
                              ? 'bg-gradient-to-r from-gray-300/20 to-gray-500/20 border border-gray-300/30'
                              : index === 2
                                ? 'bg-gradient-to-r from-orange-400/20 to-orange-600/20 border border-orange-400/30'
                                : 'bg-white/5 border border-white/10'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              index === 0
                                ? 'bg-yellow-400 text-yellow-900'
                                : index === 1
                                  ? 'bg-gray-300 text-gray-900'
                                  : index === 2
                                    ? 'bg-orange-400 text-orange-900'
                                    : 'bg-gray-600 text-white'
                            }`}
                          >
                            {index + 1}
                          </div>
                          <div>
                            <div className="text-white font-medium">{player.name}</div>
                            <div className="text-xs text-blue-400">
                              {player.isConnected ? 'オンライン' : 'オフライン'}
                              {player.currentAnswer && ` • 回答: ${player.currentAnswer}`}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-bold">
                            {player.score.toLocaleString()}
                          </div>
                          <div className="text-xs text-blue-400">ポイント</div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Right Panel - Analytics */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  分析
                </h3>

                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {players.filter((p) => p.isConnected).length}
                    </div>
                    <div className="text-sm text-blue-400">接続中プレイヤー</div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-cyan-400">
                      {players.filter((p) => p.currentAnswer).length}
                    </div>
                    <div className="text-sm text-blue-400">回答済み</div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">
                      {Math.round(
                        (players.filter((p) => p.currentAnswer).length / players.length) * 100,
                      )}
                      %
                    </div>
                    <div className="text-sm text-blue-400">回答率</div>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  回答分布
                </h3>

                <div className="space-y-2">
                  {['A', 'B', 'C', 'D'].map((option) => {
                    const count = players.filter((p) => p.currentAnswer === option).length;
                    const percentage = players.length > 0 ? (count / players.length) * 100 : 0;

                    return (
                      <div key={option} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-white">選択肢 {option}</span>
                          <span className="text-blue-400">
                            {count}人 ({Math.round(percentage)}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-700  h-2">
                          <div
                            className="bg-gradient-to-r from-cyan-400 to-blue-400 h-2 transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Main>
    </PageContainer>
  );
}

export default function HostControlPanelPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HostControlPanelContent />
    </Suspense>
  );
}
