'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useSocket } from '@/components/providers/SocketProvider';
import { useAuthStore } from '@/state/useAuthStore';
import { gameApi } from '@/services/gameApi';
import type { Game } from '@/types/game';

// Game context type
interface GameContextType {
  // Game state
  gameId: string | null;
  gameCode: string | null;
  game: Game | null;
  role: 'host' | 'player' | null;
  
  // Loading & error states
  loading: boolean;
  error: string | null;
  
  // Actions
  setGameId: (id: string | null) => void;
  setGameCode: (code: string | null) => void;
  setRole: (role: 'host' | 'player' | null) => void;
  loadGame: (gameId: string) => Promise<void>;
  clearGame: () => void;
  setError: (error: string | null) => void;
}

// Create Game context
const GameContext = createContext<GameContextType | null>(null);

// Hook to access game context
export function useGameContext() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
}

// Game Provider component
export function GameProvider({ children }: { children: React.ReactNode }) {
  const [gameId, setGameId] = useState<string | null>(null);
  const [gameCode, setGameCode] = useState<string | null>(null);
  const [game, setGame] = useState<Game | null>(null);
  const [role, setRole] = useState<'host' | 'player' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isConnected } = useSocket();
  const { session } = useAuthStore();

  // Load game data from API
  const loadGame = useCallback(async (id: string) => {
    if (!session?.access_token) {
      setError('Not authenticated');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const gameData = await gameApi.getGame(id, session.access_token);
      setGame(gameData);
      setGameId(id);
      
      // Auto-set role based on user ID and game host
      const { user } = useAuthStore.getState();
      if (user && gameData.host_id === user.id) {
        setRole('host');
      } else {
        setRole('player');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load game';
      setError(errorMessage);
      console.error('Failed to load game:', err);
    } finally {
      setLoading(false);
    }
  }, [session]);

  // Clear game state
  const clearGame = useCallback(() => {
    setGameId(null);
    setGameCode(null);
    setGame(null);
    setRole(null);
    setError(null);
  }, []);

  // Log connection status for debugging
  useEffect(() => {
    if (gameId) {
      console.log('GameContext:', {
        gameId,
        gameCode,
        role,
        socketConnected: isConnected,
        hasGame: !!game,
      });
    }
  }, [gameId, gameCode, role, isConnected, game]);

  const value: GameContextType = {
    gameId,
    gameCode,
    game,
    role,
    loading,
    error,
    setGameId,
    setGameCode,
    setRole,
    loadGame,
    clearGame,
    setError,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
