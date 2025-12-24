'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PageContainer, Main, QuizBackground } from '@/components/ui';
import { Trophy, Home, LogIn } from 'lucide-react';
import { LeaderboardEntry } from '@/types/game';

interface PlayerGameEndScreenProps {
  playerEntry?: LeaderboardEntry;
  entries: LeaderboardEntry[];
  onReturnHome?: () => void;
  onJoinNewGame?: () => void;
}

export const PlayerGameEndScreen: React.FC<PlayerGameEndScreenProps> = ({
  playerEntry,
  entries,
  onReturnHome,
  onJoinNewGame,
}) => {
  const router = useRouter();

  const handleReturnHome = () => {
    if (onReturnHome) {
      onReturnHome();
    } else {
      // Default: navigate to join page
      router.push('/');
    }
  };

  const handleJoinNewGame = () => {
    if (onJoinNewGame) {
      onJoinNewGame();
    } else {
      // Default: navigate to join page
      router.push('/');
    }
  };

  // Find player's rank
  const playerRank =
    playerEntry?.rank || entries.findIndex((e) => e.playerId === playerEntry?.playerId) + 1 || 0;
  const playerScore = playerEntry?.score || 0;
  const playerName = playerEntry?.playerName || 'プレイヤー';

  return (
    <PageContainer className="h-screen">
      <Main className="h-full relative">
        {/* Background */}
        <div className="absolute inset-0">
          <QuizBackground variant="question" animated={false} />
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 py-8 overflow-y-auto">
          <div className="w-full max-w-2xl space-y-8">
            {/* Header */}
            <div className="text-center">
              <div className="relative inline-block">
                <span className="text-4xl md:text-6xl font-mono font-black bg-gradient-to-r from-cyan-700 via-blue-600 to-cyan-700 bg-clip-text text-transparent tracking-wider drop-shadow-sm">
                  ゲーム終了
                </span>
              </div>
              <div className="w-24 h-1.5 bg-gradient-to-r from-[#BFF098] to-[#6FD6FF] mx-auto rounded-lg shadow-lg mt-4"></div>
              <p className="mt-6 text-xl text-gray-200">ありがとうございました！</p>
            </div>

            {/* Player Result Card */}
            {playerEntry && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-8 shadow-xl">
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center space-x-4">
                    <Trophy
                      className={`w-12 h-12 ${
                        playerRank === 1
                          ? 'text-yellow-400'
                          : playerRank === 2
                            ? 'text-gray-300'
                            : playerRank === 3
                              ? 'text-orange-400'
                              : 'text-blue-400'
                      }`}
                    />
                    <div>
                      <div className="text-2xl font-bold text-white">{playerName}</div>
                      <div className="text-sm text-gray-300">最終順位</div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <div className="flex items-center justify-center space-x-8">
                      <div>
                        <div className="text-5xl font-bold text-white">{playerRank}</div>
                        <div className="text-sm text-gray-300">位</div>
                      </div>
                      <div className="w-px h-16 bg-white/20"></div>
                      <div>
                        <div className="text-5xl font-bold text-cyan-400">
                          {playerScore.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-300">ポイント</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Top 3 Leaderboard */}
            {entries.length > 0 && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6 shadow-xl">
                <h3 className="text-xl font-bold text-white mb-4 text-center">トップ3</h3>
                <div className="space-y-3">
                  {entries.slice(0, 3).map((entry, index) => (
                    <div
                      key={entry.playerId}
                      className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                        entry.playerId === playerEntry?.playerId
                          ? 'bg-cyan-500/20 border-cyan-400/50'
                          : 'bg-white/5 border-white/10'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                            index === 0
                              ? 'bg-gradient-to-r from-yellow-400 to-yellow-600'
                              : index === 1
                                ? 'bg-gradient-to-r from-gray-400 to-gray-600'
                                : 'bg-gradient-to-r from-amber-500 to-amber-700'
                          }`}
                        >
                          {entry.rank}
                        </div>
                        <span className="text-white font-medium">{entry.playerName}</span>
                      </div>
                      <span className="text-white font-bold tabular-nums">
                        {entry.score.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleJoinNewGame}
                className="flex items-center justify-center space-x-2 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <LogIn className="w-5 h-5" />
                <span>新しいゲームに参加</span>
              </button>
              <button
                onClick={handleReturnHome}
                className="flex items-center justify-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <Home className="w-5 h-5" />
                <span>ホームに戻る</span>
              </button>
            </div>
          </div>
        </div>
      </Main>
    </PageContainer>
  );
};
