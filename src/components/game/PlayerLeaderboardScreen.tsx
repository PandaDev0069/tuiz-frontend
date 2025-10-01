'use client';

import React, { useEffect, useRef, useState } from 'react';
import { PageContainer, Main, QuizBackground } from '@/components/ui';
import { TimeBar } from './TimeBar';
import { LeaderboardData, LeaderboardEntry, RankChange } from '@/types/game';
import { TrendingUp, TrendingDown, Minus, Trophy, Medal, Award } from 'lucide-react';

const getRankChangeIcon = (rankChange: RankChange, size: number = 16) => {
  switch (rankChange) {
    case 'up':
      return <TrendingUp size={size} className="text-emerald-400" />;
    case 'down':
      return <TrendingDown size={size} className="text-rose-400" />;
    case 'same':
    default:
      return <Minus size={size} className="text-slate-400" />;
  }
};

const getRankIcon = (rank: number, size: number = 24) => {
  switch (rank) {
    case 1:
      return <Trophy size={size} className="text-yellow-300" />;
    case 2:
      return <Medal size={size} className="text-slate-200" />;
    case 3:
      return <Award size={size} className="text-amber-500" />;
    default:
      return null;
  }
};

const getRankGradient = (rank: number) => {
  switch (rank) {
    case 1:
      return 'bg-gradient-to-r from-yellow-400/70 to-yellow-500/70 border-yellow-300/60';
    case 2:
      return 'bg-gradient-to-r from-slate-300/60 to-slate-400/60 border-slate-200/40';
    case 3:
      return 'bg-gradient-to-r from-amber-500/60 to-amber-600/60 border-amber-400/40';
    case 4:
      return 'bg-gradient-to-r from-blue-400/40 to-blue-500/40 border-blue-300/30';
    case 5:
      return 'bg-gradient-to-r from-purple-400/40 to-purple-500/40 border-purple-300/30';
    default:
      return 'bg-white/10 border-white/10';
  }
};

const PlayerLeaderboardItem: React.FC<{ entry: LeaderboardEntry }> = ({ entry }) => {
  const rankGradient = getRankGradient(entry.rank);
  const rankIcon = getRankIcon(entry.rank, 18);

  return (
    <div
      className={`relative rounded-2xl border px-4 py-4 text-white shadow-md backdrop-blur-sm ${rankGradient}`}
    >
      <div className="absolute -top-2 -left-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow">
        {getRankChangeIcon(entry.rankChange, 14)}
      </div>

      {rankIcon && (
        <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow">
          {rankIcon}
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-base font-semibold">
            {entry.rank}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-wide md:text-base">
              {entry.playerName}
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="block text-lg font-bold tracking-tight md:text-xl">{entry.score}</span>
          <span className="text-[11px] text-white/70">ポイント</span>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-2 left-2 h-2 w-2 rounded-full bg-white/25"></div>
      <div className="pointer-events-none absolute bottom-2 right-2 h-2 w-2 rounded-full bg-white/25"></div>
    </div>
  );
};

interface PlayerLeaderboardScreenProps {
  leaderboardData: LeaderboardData;
  onTimeExpired?: () => void;
}

export const PlayerLeaderboardScreen: React.FC<PlayerLeaderboardScreenProps> = ({
  leaderboardData,
  onTimeExpired,
}) => {
  const { entries, questionNumber, totalQuestions, timeLimit } = leaderboardData;
  const [currentTime, setCurrentTime] = useState(timeLimit);
  const [isTimeExpired, setIsTimeExpired] = useState(false);
  const timeoutTriggered = useRef(false);

  // Reset timer when data changes
  useEffect(() => {
    timeoutTriggered.current = false;
    setCurrentTime(timeLimit);
    setIsTimeExpired(false);
  }, [timeLimit, questionNumber]);

  // Internal timer countdown
  useEffect(() => {
    if (!timeLimit || timeLimit <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev <= 1) {
          if (!timeoutTriggered.current) {
            timeoutTriggered.current = true;
            setIsTimeExpired(true);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLimit]);

  // Handle timeout navigation in separate effect
  useEffect(() => {
    if (isTimeExpired && !timeoutTriggered.current) {
      timeoutTriggered.current = true;
      // Use setTimeout to ensure navigation happens after current render cycle
      const timeoutId = setTimeout(() => {
        onTimeExpired?.();
      }, 0);

      return () => clearTimeout(timeoutId);
    }
  }, [isTimeExpired, onTimeExpired]);

  return (
    <PageContainer className="h-screen">
      <Main className="relative h-full">
        <TimeBar
          currentTime={currentTime}
          timeLimit={timeLimit}
          questionNumber={questionNumber}
          totalQuestions={totalQuestions}
        />

        <div className="absolute inset-0">
          <QuizBackground variant="question" animated={false} />
        </div>

        <div className="relative z-10 flex h-full flex-col pt-24 pb-6">
          <div className="px-5">
            <div className="text-center text-white/90">
              <span className="text-4xl font-bold tracking-[0.25em] text-transparent drop-shadow-sm md:text-5xl bg-gradient-to-r from-cyan-600 via-blue-500 to-cyan-600 bg-clip-text">
                ランキング
              </span>
            </div>
          </div>

          <div className="flex-1 px-4 py-4">
            <div className="mx-auto flex h-full w-full max-w-3xl flex-col rounded-2xl border border-white/20 bg-white/10 p-4 shadow-2xl backdrop-blur-sm">
              <div className="flex-1 space-y-3 overflow-y-auto px-2 py-3 pb-3 pt-1 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                {entries.slice(0, 5).map((entry) => (
                  <PlayerLeaderboardItem key={entry.playerId} entry={entry} />
                ))}
              </div>

              {/* Bottom decoration */}
              <div className="mt-4 flex justify-center items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-white/30 rounded-full"></div>
                <div className="w-3 h-3 bg-gradient-to-r from-[#BFF098] to-[#6FD6FF] rounded-full shadow-lg"></div>
                <div className="w-1.5 h-1.5 bg-white/30 rounded-full"></div>
              </div>

              {/* Footer info */}
              <div className="mt-3 text-center">
                <p className="text-2xl md:text-3xl text-white/80 font-medium">上位5名</p>
              </div>
            </div>
          </div>
        </div>
      </Main>
    </PageContainer>
  );
};
