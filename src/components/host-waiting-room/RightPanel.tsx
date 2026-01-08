// ====================================================
// File Name   : RightPanel.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-19
// Last Update : 2025-09-21
//
// Description:
// - Right panel component for the host waiting room
// - Wraps the RoomLockToggle component
// - Provides room lock functionality and player count display
//
// Notes:
// - Client-only component (requires 'use client')
// - Simple wrapper component that delegates to RoomLockToggle
// ====================================================

'use client';

import React from 'react';

import { RoomLockToggle } from './RoomLockToggle';

const DEFAULT_CLASS_NAME = '';

interface RightPanelProps {
  className?: string;
  isRoomLocked: boolean;
  onRoomLockToggle: (isLocked: boolean) => void;
  playerCount: number;
  maxPlayers: number;
}

/**
 * Component: RightPanel
 * Description:
 * - Renders the right panel in the host waiting room
 * - Wraps the RoomLockToggle component to provide room lock functionality
 * - Displays player count and maximum players information
 *
 * Parameters:
 * - className (string, optional): Additional CSS classes to apply to the container
 * - isRoomLocked (boolean): Whether the room is currently locked
 * - onRoomLockToggle (function): Callback function when room lock state changes
 * - playerCount (number): Current number of players in the room
 * - maxPlayers (number): Maximum number of players allowed in the room
 *
 * Returns:
 * - React.ReactElement: The right panel component
 *
 * Example:
 * ```tsx
 * <RightPanel
 *   isRoomLocked={false}
 *   onRoomLockToggle={(isLocked) => handleLockToggle(isLocked)}
 *   playerCount={5}
 *   maxPlayers={10}
 * />
 * ```
 */
export const RightPanel: React.FC<RightPanelProps> = ({
  className = DEFAULT_CLASS_NAME,
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
