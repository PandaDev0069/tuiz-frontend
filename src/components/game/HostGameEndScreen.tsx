'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PageContainer, Main, QuizBackground } from '@/components/ui';
import { Trophy, BarChart3, Users, Award, Home, Play } from 'lucide-react';
import { LeaderboardEntry } from '@/types/game';

interface GameAnalytics {
  totalPlayers: number;
  totalQuestions: number;
  averageScore: number;
  highestScore: number;
  completionRate: number;
  averageResponseTime: number;
}

interface HostGameEndScreenProps {
  entries: LeaderboardEntry[];
  analytics?: GameAnalytics;
  gameId?: string;
  onDismissRoom?: () => void;
  onStartNewGame?: () => void;
}

export const HostGameEndScreen: React.FC<HostGameEndScreenProps> = ({
  entries,
  analytics,
  onDismissRoom,
  onStartNewGame,
}) => {
  const router = useRouter();

  const calculatedAnalytics: GameAnalytics = analytics || {
    totalPlayers: entries.length,
    totalQuestions: 0, // Will be set from game flow
    averageScore:
      entries.length > 0
        ? Math.round(entries.reduce((sum, e) => sum + e.score, 0) / entries.length)
        : 0,
    highestScore: entries.length > 0 ? entries[0]?.score || 0 : 0,
    completionRate: 100, // Assume all players completed
    averageResponseTime: 0, // Would need to calculate from answer reports
  };

  const handleDismissRoom = () => {
    if (onDismissRoom) {
      onDismissRoom();
    } else {
      // Default: navigate to dashboard
      router.push('/dashboard');
    }
  };

  const handleStartNewGame = () => {
    if (onStartNewGame) {
      onStartNewGame();
    } else {
      // Default: navigate to dashboard
      router.push('/dashboard');
    }
  };

  return (
    <PageContainer className="h-screen">
      <Main className="h-full relative">
        {/* Background */}
        <div className="absolute inset-0">
          <QuizBackground variant="question" animated={false} />
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 py-8 overflow-y-auto">
          <div className="w-full max-w-4xl space-y-8">
            {/* Header */}
            <div className="text-center">
              <div className="relative inline-block">
                <span className="text-5xl md:text-7xl font-mono font-black bg-gradient-to-r from-cyan-700 via-blue-600 to-cyan-700 bg-clip-text text-transparent tracking-wider drop-shadow-sm">
                  ゲーム終了
                </span>
              </div>
              <div className="w-24 h-1.5 bg-gradient-to-r from-[#BFF098] to-[#6FD6FF] mx-auto rounded-lg shadow-lg mt-4"></div>
            </div>

            {/* Analytics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {/* Total Players */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-4 shadow-xl">
                <div className="flex items-center space-x-3 mb-2">
                  <Users className="w-6 h-6 text-cyan-400" />
                  <h3 className="text-sm font-semibold text-white">参加者数</h3>
                </div>
                <p className="text-3xl font-bold text-white">{calculatedAnalytics.totalPlayers}</p>
              </div>

              {/* Average Score */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-4 shadow-xl">
                <div className="flex items-center space-x-3 mb-2">
                  <BarChart3 className="w-6 h-6 text-blue-400" />
                  <h3 className="text-sm font-semibold text-white">平均スコア</h3>
                </div>
                <p className="text-3xl font-bold text-white">{calculatedAnalytics.averageScore}</p>
              </div>

              {/* Highest Score */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-4 shadow-xl">
                <div className="flex items-center space-x-3 mb-2">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                  <h3 className="text-sm font-semibold text-white">最高スコア</h3>
                </div>
                <p className="text-3xl font-bold text-white">{calculatedAnalytics.highestScore}</p>
              </div>
            </div>

            {/* Top 5 Leaderboard */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6 shadow-xl">
              <div className="flex items-center space-x-3 mb-4">
                <Award className="w-6 h-6 text-yellow-400" />
                <h3 className="text-xl font-bold text-white">最終順位</h3>
              </div>
              <div className="space-y-3">
                {entries.slice(0, 5).map((entry, index) => (
                  <div
                    key={entry.playerId}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                          index === 0
                            ? 'bg-gradient-to-r from-yellow-400 to-yellow-600'
                            : index === 1
                              ? 'bg-gradient-to-r from-gray-400 to-gray-600'
                              : index === 2
                                ? 'bg-gradient-to-r from-amber-500 to-amber-700'
                                : 'bg-gradient-to-r from-blue-400 to-blue-600'
                        }`}
                      >
                        {entry.rank}
                      </div>
                      <span className="text-white font-medium text-lg">{entry.playerName}</span>
                    </div>
                    <span className="text-white font-bold text-xl tabular-nums">{entry.score}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleStartNewGame}
                className="flex items-center justify-center space-x-2 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <Play className="w-5 h-5" />
                <span>新しいゲームを開始</span>
              </button>
              <button
                onClick={handleDismissRoom}
                className="flex items-center justify-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <Home className="w-5 h-5" />
                <span>ダッシュボードに戻る</span>
              </button>
            </div>
          </div>
        </div>
      </Main>
    </PageContainer>
  );
};
