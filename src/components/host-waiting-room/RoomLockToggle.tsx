'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Lock, Unlock, Users, Shield } from 'lucide-react';

interface RoomLockToggleProps {
  isLocked: boolean;
  onToggle: (isLocked: boolean) => void;
  playerCount: number;
  maxPlayers: number;
  className?: string;
}

export const RoomLockToggle: React.FC<RoomLockToggleProps> = ({
  isLocked,
  onToggle,
  playerCount,
  maxPlayers,
  className = '',
}) => {
  const handleToggle = () => {
    onToggle(!isLocked);
  };

  const isNearCapacity = playerCount >= maxPlayers * 0.8;

  return (
    <Card
      className={`bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 shadow-lg ${className}`}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="w-5 h-5 text-amber-600" />
          ルーム管理
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Room Lock Toggle */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isLocked ? (
                <Lock className="w-5 h-5 text-red-500" />
              ) : (
                <Unlock className="w-5 h-5 text-green-500" />
              )}
              <span className="font-medium text-gray-700">
                {isLocked ? 'ルームロック中' : 'ルーム開放中'}
              </span>
            </div>

            <button
              onClick={handleToggle}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
                isLocked ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-200 hover:bg-gray-300'
              }`}
              role="switch"
              aria-checked={isLocked}
              aria-label={isLocked ? 'ルームをアンロック' : 'ルームをロック'}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isLocked ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <p className="text-sm text-gray-600">
            {isLocked ? '新しいプレイヤーは参加できません' : 'プレイヤーは自由に参加できます'}
          </p>
        </div>

        {/* Player Count Info */}
        <div className="pt-3 border-t border-amber-200">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-600" />
              <span className="text-gray-700">参加者数</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`font-medium ${isNearCapacity ? 'text-orange-600' : 'text-gray-700'}`}
              >
                {playerCount}
              </span>
              <span className="text-gray-400">/ {maxPlayers}</span>
            </div>
          </div>

          {isNearCapacity && (
            <div className="mt-2 p-2 bg-orange-100 rounded-md">
              <p className="text-xs text-orange-700">ルームが満員に近づいています</p>
            </div>
          )}
        </div>

        {/* Status Indicator */}
        <div className="pt-2">
          <div className="flex items-center gap-2 text-xs">
            <div className={`w-2 h-2 rounded-full ${isLocked ? 'bg-red-400' : 'bg-green-400'}`} />
            <span className="text-gray-500">{isLocked ? 'ロック状態' : '開放状態'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
