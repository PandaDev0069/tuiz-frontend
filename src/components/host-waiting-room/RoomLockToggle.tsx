// ====================================================
// File Name   : RoomLockToggle.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-21
// Last Update : 2025-09-21
//
// Description:
// - Room lock toggle component for the host waiting room
// - Allows host to lock/unlock the room to control player access
// - Displays player count and capacity warnings
// - Shows visual status indicators for room lock state
//
// Notes:
// - Client-only component (requires 'use client')
// - Uses toggle switch UI pattern with accessibility attributes
// - Shows warning when room is near capacity (80% full)
// ====================================================

'use client';

import React from 'react';
import { Lock, Unlock, Users, Shield } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

const DEFAULT_CLASS_NAME = '';

const CAPACITY_WARNING_THRESHOLD = 0.8;

const ICON_SIZE_LARGE = 'w-5 h-5';
const ICON_SIZE_SMALL = 'w-4 h-4';
const STATUS_DOT_SIZE = 'w-2 h-2';

const TOGGLE_SWITCH_HEIGHT = 'h-6';
const TOGGLE_SWITCH_WIDTH = 'w-11';
const TOGGLE_KNOB_SIZE = 'h-4 w-4';
const TOGGLE_KNOB_TRANSLATE_LOCKED = 'translate-x-6';
const TOGGLE_KNOB_TRANSLATE_UNLOCKED = 'translate-x-1';

interface RoomLockToggleProps {
  isLocked: boolean;
  onToggle: (isLocked: boolean) => void;
  playerCount: number;
  maxPlayers: number;
  className?: string;
}

/**
 * Calculates whether the room is near capacity based on player count and max players.
 *
 * @param {number} playerCount - Current number of players
 * @param {number} maxPlayers - Maximum number of players allowed
 * @returns {boolean} True if room is at or above capacity warning threshold
 */
const calculateIsNearCapacity = (playerCount: number, maxPlayers: number): boolean => {
  return playerCount >= maxPlayers * CAPACITY_WARNING_THRESHOLD;
};

/**
 * Component: RoomLockToggle
 * Description:
 * - Renders a room lock toggle control for the host
 * - Displays current lock state with visual indicators
 * - Shows player count and capacity information
 * - Warns when room is near capacity (80% full)
 * - Provides toggle switch to lock/unlock the room
 *
 * Parameters:
 * - isLocked (boolean): Whether the room is currently locked
 * - onToggle (function): Callback function when lock state changes
 * - playerCount (number): Current number of players in the room
 * - maxPlayers (number): Maximum number of players allowed
 * - className (string, optional): Additional CSS classes to apply to the card
 *
 * Returns:
 * - React.ReactElement: The room lock toggle component
 *
 * Example:
 * ```tsx
 * <RoomLockToggle
 *   isLocked={false}
 *   onToggle={(isLocked) => handleLockToggle(isLocked)}
 *   playerCount={8}
 *   maxPlayers={10}
 * />
 * ```
 */
export const RoomLockToggle: React.FC<RoomLockToggleProps> = ({
  isLocked,
  onToggle,
  playerCount,
  maxPlayers,
  className = DEFAULT_CLASS_NAME,
}) => {
  const handleToggle = () => {
    onToggle(!isLocked);
  };

  const isNearCapacity = calculateIsNearCapacity(playerCount, maxPlayers);

  return (
    <Card
      className={`bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 shadow-lg ${className}`}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className={`${ICON_SIZE_LARGE} text-amber-600`} />
          ルーム管理
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isLocked ? (
                <Lock className={`${ICON_SIZE_LARGE} text-red-500`} />
              ) : (
                <Unlock className={`${ICON_SIZE_LARGE} text-green-500`} />
              )}
              <span className="font-medium text-gray-700">
                {isLocked ? 'ルームロック中' : 'ルーム開放中'}
              </span>
            </div>

            <button
              onClick={handleToggle}
              className={`relative inline-flex ${TOGGLE_SWITCH_HEIGHT} ${TOGGLE_SWITCH_WIDTH} items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
                isLocked ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-200 hover:bg-gray-300'
              }`}
              role="switch"
              aria-checked={isLocked}
              aria-label={isLocked ? 'ルームをアンロック' : 'ルームをロック'}
            >
              <span
                className={`inline-block ${TOGGLE_KNOB_SIZE} transform rounded-full bg-white transition-transform ${
                  isLocked ? TOGGLE_KNOB_TRANSLATE_LOCKED : TOGGLE_KNOB_TRANSLATE_UNLOCKED
                }`}
              />
            </button>
          </div>

          <p className="text-sm text-gray-600">
            {isLocked ? '新しいプレイヤーは参加できません' : 'プレイヤーは自由に参加できます'}
          </p>
        </div>

        <div className="pt-3 border-t border-amber-200">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Users className={`${ICON_SIZE_SMALL} text-amber-600`} />
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

        <div className="pt-2">
          <div className="flex items-center gap-2 text-xs">
            <div
              className={`${STATUS_DOT_SIZE} rounded-full ${isLocked ? 'bg-red-400' : 'bg-green-400'}`}
            />
            <span className="text-gray-500">{isLocked ? 'ロック状態' : '開放状態'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
