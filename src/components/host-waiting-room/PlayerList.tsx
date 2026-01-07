// ====================================================
// File Name   : PlayerList.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-09-19
// Last Update : 2025-12-22
//
// Description:
// - Player list component for the host waiting room
// - Displays list of active players with search functionality
// - Allows host to ban players with confirmation modal
// - Shows player count, loading states, and empty states
// - Supports adding test players
//
// Notes:
// - Client-only component (requires 'use client')
// - Uses warning modal for ban confirmation
// - Filters out banned players and hosts from display
// - Implements search functionality with case-insensitive matching
// ====================================================

'use client';

import React, { useState, useMemo } from 'react';
import { Search, UserX, Users, Crown, Plus } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, Input, Button } from '@/components/ui';
import { useWarningModal } from '@/components/ui/overlays';

const DEFAULT_CLASS_NAME = '';
const DEFAULT_IS_LOADING = false;
const DEFAULT_SEARCH_QUERY = '';

const DISPLAY_LIMIT_THRESHOLD = 10;
const MAX_LIST_HEIGHT_PX = 400;
const LOCALE_JA_JP = 'ja-JP';
const MODAL_VARIANT_DANGER = 'danger';

const ICON_SIZE_LARGE = 'w-5 h-5';
const ICON_SIZE_SMALL = 'w-4 h-4';

interface Player {
  id: string;
  name: string;
  joinedAt: Date;
  isBanned?: boolean;
  isHost?: boolean;
}

interface PlayerListProps {
  players: Player[];
  onPlayerBan: (playerId: string) => void;
  onAddPlayer: () => void;
  className?: string;
  isLoading?: boolean;
}

/**
 * Filters active players (non-banned, non-host) and applies search query filter.
 *
 * @param {Player[]} players - Array of all players
 * @param {string} searchQuery - Search query string
 * @returns {Player[]} Filtered array of active players matching search query
 */
const filterActivePlayers = (players: Player[], searchQuery: string): Player[] => {
  const activePlayers = players.filter((player) => !player.isBanned && !player.isHost);

  if (!searchQuery.trim()) {
    return activePlayers;
  }

  const queryLower = searchQuery.toLowerCase();
  return activePlayers.filter((player) => player.name.toLowerCase().includes(queryLower));
};

/**
 * Component: PlayerList
 * Description:
 * - Renders a list of active players in the host waiting room
 * - Provides search functionality to filter players by name
 * - Allows host to ban players with confirmation modal
 * - Displays player count, loading states, and empty states
 * - Supports adding test players via add button
 *
 * Parameters:
 * - players (Player[]): Array of all players including banned and host
 * - onPlayerBan (function): Callback function when a player is banned
 * - onAddPlayer (function): Callback function when add player button is clicked
 * - className (string, optional): Additional CSS classes to apply to the card
 * - isLoading (boolean, optional): Whether the player list is loading (default: false)
 *
 * Returns:
 * - React.ReactElement: The player list component
 *
 * Example:
 * ```tsx
 * <PlayerList
 *   players={players}
 *   onPlayerBan={(playerId) => handleBanPlayer(playerId)}
 *   onAddPlayer={() => handleAddTestPlayer()}
 *   isLoading={false}
 * />
 * ```
 */
export const PlayerList: React.FC<PlayerListProps> = ({
  players,
  onPlayerBan,
  onAddPlayer,
  className = DEFAULT_CLASS_NAME,
  isLoading = DEFAULT_IS_LOADING,
}) => {
  const [searchQuery, setSearchQuery] = useState(DEFAULT_SEARCH_QUERY);
  const { openModal, WarningModalComponent } = useWarningModal();

  const filteredPlayers = useMemo(
    () => filterActivePlayers(players, searchQuery),
    [players, searchQuery],
  );

  const visiblePlayers = filteredPlayers;
  const hasMorePlayers = filteredPlayers.length > DISPLAY_LIMIT_THRESHOLD;

  const handlePlayerClick = (player: Player) => {
    if (player.isHost) {
      return;
    }

    openModal({
      title: 'プレイヤーをBANしますか？',
      description: `${player.name}をクイズから除外します。この操作は取り消せません。`,
      confirmText: 'BANする',
      cancelText: 'キャンセル',
      variant: MODAL_VARIANT_DANGER,
      onConfirm: () => {
        onPlayerBan(player.id);
      },
    });
  };

  const activePlayerCount = players.filter((p) => !p.isHost).length;
  const bannedPlayerCount = players.filter((p) => p.isBanned).length;

  return (
    <Card
      className={`bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 shadow-lg flex flex-col h-full ${className}`}
    >
      <CardHeader className="pb-3 flex-shrink-0">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className={`${ICON_SIZE_LARGE} text-blue-600`} />
          参加プレイヤー ({activePlayerCount}人)
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 flex-1 flex flex-col overflow-hidden">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="プレイヤーを検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-blue-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <Button
            onClick={onAddPlayer}
            className="bg-green-500 hover:bg-green-600 text-white px-3"
            title="テスト用プレイヤーを追加"
          >
            <Plus className={ICON_SIZE_SMALL} />
          </Button>
        </div>

        <div
          className="flex-1 overflow-y-auto space-y-2"
          style={{ maxHeight: `${MAX_LIST_HEIGHT_PX}px` }}
        >
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2">プレイヤーを読み込み中...</p>
            </div>
          ) : visiblePlayers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchQuery ? '検索結果が見つかりません' : 'プレイヤーがいません'}
            </div>
          ) : (
            visiblePlayers.map((player) => (
              <div
                key={player.id}
                className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                  player.isBanned
                    ? 'bg-red-50 border-red-200 text-red-700'
                    : player.isHost
                      ? 'bg-yellow-50 border-yellow-200 text-yellow-700'
                      : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                }`}
                onClick={() => handlePlayerClick(player)}
              >
                <div className="flex items-center gap-3">
                  {player.isHost && <Crown className={`${ICON_SIZE_SMALL} text-yellow-600`} />}
                  <div>
                    <p className="font-medium">{player.name}</p>
                    <p className="text-xs text-gray-500">
                      {player.joinedAt.toLocaleTimeString(LOCALE_JA_JP)} 参加
                    </p>
                  </div>
                </div>

                {!player.isHost && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-500 text-red-600 hover:bg-red-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayerClick(player);
                    }}
                  >
                    <UserX className={`${ICON_SIZE_SMALL} mr-1`} />
                    BAN
                  </Button>
                )}
              </div>
            ))
          )}

          {hasMorePlayers && (
            <div className="text-center py-3 text-gray-500 border-t border-gray-200 bg-gray-50">
              <div className="text-sm font-medium">
                {filteredPlayers.length}人中{DISPLAY_LIMIT_THRESHOLD}人を表示中
              </div>
              <div className="text-xs text-gray-400 mt-1">スクロールして他のプレイヤーを確認</div>
            </div>
          )}
        </div>

        <div className="text-sm text-gray-600 text-center pt-2 border-t border-gray-200 flex-shrink-0">
          {filteredPlayers.length}人が参加中
          {bannedPlayerCount > 0 && (
            <span className="text-red-600 ml-2">({bannedPlayerCount}人BAN済み)</span>
          )}
        </div>
      </CardContent>

      <WarningModalComponent />
    </Card>
  );
};
