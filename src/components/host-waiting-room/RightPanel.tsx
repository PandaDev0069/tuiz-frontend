'use client';

import React from 'react';
import { RoomLockToggle } from './RoomLockToggle';

interface RightPanelProps {
  className?: string;
  isRoomLocked: boolean;
  onRoomLockToggle: (isLocked: boolean) => void;
  playerCount: number;
  maxPlayers: number;
}

export const RightPanel: React.FC<RightPanelProps> = ({
  className = '',
  isRoomLocked,
  onRoomLockToggle,
  playerCount,
  maxPlayers,
}) => {
  return (
    <div className={`h-full ${className}`}>
      <RoomLockToggle
        isLocked={isRoomLocked}
        onToggle={onRoomLockToggle}
        playerCount={playerCount}
        maxPlayers={maxPlayers}
        className="h-full"
      />
    </div>
  );
};
