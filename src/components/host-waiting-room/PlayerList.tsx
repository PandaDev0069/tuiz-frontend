'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Input, Button } from '@/components/ui';
import { useWarningModal } from '@/components/ui/overlays';
import { Search, UserX, Users, Crown, Plus } from 'lucide-react';

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

export const PlayerList: React.FC<PlayerListProps> = ({
  players,
  onPlayerBan,
  onAddPlayer,
  className = '',
  isLoading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { openModal, WarningModalComponent } = useWarningModal();

  // Filter players based on search query and exclude banned players
  const filteredPlayers = useMemo(() => {
    // First filter out banned players
    const activePlayers = players.filter((player) => !player.isBanned);

    // Then apply search filter
    if (!searchQuery.trim()) return activePlayers;

    return activePlayers.filter((player) =>
      player.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [players, searchQuery]);

  // Show all players but limit initial display to 10
  const visiblePlayers = filteredPlayers;
  const hasMorePlayers = filteredPlayers.length > 10;

  const handlePlayerClick = (player: Player) => {
    if (player.isHost) return; // Don't allow banning the host

    // Show warning modal before banning
    openModal({
      title: 'プレイヤーをBANしますか？',
      description: `${player.name}をクイズから除外します。この操作は取り消せません。`,
      confirmText: 'BANする',
      cancelText: 'キャンセル',
      variant: 'danger',
      onConfirm: () => {
        onPlayerBan(player.id);
      },
    });
  };

  return (
    <Card
      className={`bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 shadow-lg flex flex-col h-full ${className}`}
    >
      <CardHeader className="pb-3 flex-shrink-0">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="w-5 h-5 text-blue-600" />
          参加プレイヤー ({players.length}人)
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 flex-1 flex flex-col overflow-hidden">
        {/* Search Bar and Add Button */}
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
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Players List */}
        <div className="flex-1 overflow-y-auto space-y-2 max-h-[400px]">
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
                  {player.isHost && <Crown className="w-4 h-4 text-yellow-600" />}
                  <div>
                    <p className="font-medium">{player.name}</p>
                    <p className="text-xs text-gray-500">
                      {player.joinedAt.toLocaleTimeString('ja-JP')} 参加
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
                    <UserX className="w-4 h-4 mr-1" />
                    BAN
                  </Button>
                )}
              </div>
            ))
          )}

          {/* Show More Indicator */}
          {hasMorePlayers && (
            <div className="text-center py-3 text-gray-500 border-t border-gray-200 bg-gray-50">
              <div className="text-sm font-medium">{filteredPlayers.length}人中10人を表示中</div>
              <div className="text-xs text-gray-400 mt-1">スクロールして他のプレイヤーを確認</div>
            </div>
          )}
        </div>

        {/* Player Count Summary */}
        <div className="text-sm text-gray-600 text-center pt-2 border-t border-gray-200 flex-shrink-0">
          {filteredPlayers.length}人が参加中
          {players.filter((p) => p.isBanned).length > 0 && (
            <span className="text-red-600 ml-2">
              ({players.filter((p) => p.isBanned).length}人BAN済み)
            </span>
          )}
        </div>
      </CardContent>

      {/* Warning Modal */}
      <WarningModalComponent />
    </Card>
  );
};
