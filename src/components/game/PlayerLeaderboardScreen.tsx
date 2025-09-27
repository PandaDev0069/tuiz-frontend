'use client';

import React, { useEffect, useRef, useState } from 'react';
import { PageContainer, Main, QuizBackground } from '@/components/ui';
import { TimeBar } from './TimeBar';
import { LeaderboardData, LeaderboardEntry, RankChange } from '@/types/game';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

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

const PlayerLeaderboardItem: React.FC<{ entry: LeaderboardEntry; index: number }> = ({
  entry,
  index,
}) => {
  const colors = [
    'bg-white/15 border-white/30',
    'bg-white/10 border-white/25',
    'bg-white/10 border-white/15',
    'bg-white/5 border-white/10',
    'bg-white/5 border-white/5',
  ];

  return (
    <div
      className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-white shadow-lg transition-all duration-200 ease-out ${colors[index] ?? 'bg-white/5 border-white/5'}`}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-lg font-bold">
          {entry.rank}
        </div>
        <div className="flex flex-col">
          <span className="text-base font-semibold tracking-wide">{entry.playerName}</span>
          <span className="flex items-center gap-2 text-xs text-white/70">
            {getRankChangeIcon(entry.rankChange, 14)}
            <span>順位変動</span>
          </span>
        </div>
      </div>

      <div className="text-right">
        <span className="block text-xl font-bold tracking-tight">{entry.score}</span>
        <span className="text-xs text-white/60">ポイント</span>
      </div>
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
  const timeoutTriggered = useRef(false);

  useEffect(() => {
    timeoutTriggered.current = false;
    setCurrentTime(timeLimit);
  }, [timeLimit, questionNumber]);

  useEffect(() => {
    if (!timeLimit || timeLimit <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev <= 1) {
          if (!timeoutTriggered.current) {
            timeoutTriggered.current = true;
            onTimeExpired?.();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onTimeExpired, timeLimit]);

  return (
    <PageContainer className="h-screen">
      <Main className="h-full relative">
        <TimeBar
          currentTime={currentTime}
          timeLimit={timeLimit}
          questionNumber={questionNumber}
          totalQuestions={totalQuestions}
        />

        <div className="absolute inset-0">
          <QuizBackground variant="question" animated={false} />
        </div>

        <div className="relative z-10 flex h-full flex-col pt-20 pb-8">
          <div className="px-6 pb-2 text-center">
            <h1 className="text-3xl font-semibold tracking-[0.35em] text-white/90">ランキング</h1>
            <p className="mt-2 text-sm text-white/60">
              問題 {questionNumber} / {totalQuestions} ・ 残り {Math.max(0, Math.ceil(currentTime))}
              秒
            </p>
          </div>

          <div className="flex-1 overflow-hidden px-4">
            <div className="mx-auto flex h-full max-w-md flex-col gap-3 overflow-y-auto pb-4">
              {entries.slice(0, 5).map((entry, index) => (
                <PlayerLeaderboardItem key={entry.playerId} entry={entry} index={index} />
              ))}
            </div>
          </div>

          <div className="px-6 pt-4 text-center text-sm text-white/70">トップ5の順位を表示中</div>
        </div>
      </Main>
    </PageContainer>
  );
};
