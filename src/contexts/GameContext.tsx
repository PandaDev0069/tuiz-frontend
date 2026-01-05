// ====================================================
// File Name   : GameContext.tsx
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-12-11
// Last Update : 2025-12-11
//
// Description:
// - React context for game state management
// - Provides game data, role, and loading states
// - Handles game loading and state clearing
// - Manages host/player role detection
//
// Notes:
// - Must be used within GameProvider component
// - Requires authentication for game loading
// - Auto-detects role based on user ID and game host
// ====================================================

'use client';

//----------------------------------------------------
// 1. Imports / Dependencies
//----------------------------------------------------
import React, { createContext, useContext, useState, useCallback } from 'react';

import { useAuthStore } from '@/state/useAuthStore';
import { gameApi, type Game } from '@/services/gameApi';

//----------------------------------------------------
// 2. Constants / Configuration
//----------------------------------------------------
const ERROR_MESSAGES = {
  NOT_AUTHENTICATED: 'Not authenticated',
  FAILED_TO_LOAD: 'Failed to load game',
  HOOK_OUTSIDE_PROVIDER: 'useGameContext must be used within a GameProvider',
} as const;

const GAME_ROLES = {
  HOST: 'host',
  PLAYER: 'player',
} as const;

//----------------------------------------------------
// 3. Types / Interfaces
//----------------------------------------------------
/**
 * Game context type interface
 */
interface GameContextType {
  gameId: string | null;
  gameCode: string | null;
  game: Game | null;
  role: 'host' | 'player' | null;
  loading: boolean;
  error: string | null;
  setGameId: (id: string | null) => void;
  setGameCode: (code: string | null) => void;
  setRole: (role: 'host' | 'player' | null) => void;
  loadGame: (gameId: string) => Promise<void>;
  clearGame: () => void;
  setError: (error: string | null) => void;
}

//----------------------------------------------------
// 4. Core Logic
//----------------------------------------------------
const GameContext = createContext<GameContextType | null>(null);

/**
 * Hook: useGameContext
 * Description:
 * - Accesses the game context
 * - Throws error if used outside GameProvider
 *
 * Returns:
 * - GameContextType: Game context value
 *
 * @throws {Error} If used outside GameProvider
 */
export function useGameContext() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error(ERROR_MESSAGES.HOOK_OUTSIDE_PROVIDER);
  }
  return context;
}

/**
 * Component: GameProvider
 * Description:
 * - Provides game context to child components
 * - Manages game state, loading, and error states
 * - Handles game loading from API
 * - Auto-detects user role (host/player) based on game ownership
 *
 * Parameters:
 * - children (React.ReactNode): Child components to wrap
 *
 * Returns:
 * - JSX.Element: Context provider with game state
 */
export function GameProvider({ children }: { children: React.ReactNode }) {
  const [gameId, setGameId] = useState<string | null>(null);
  const [gameCode, setGameCode] = useState<string | null>(null);
  const [game, setGame] = useState<Game | null>(null);
  const [role, setRole] = useState<'host' | 'player' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { session } = useAuthStore();

  const loadGame = useCallback(
    async (id: string) => {
      if (!session?.access_token) {
        setError(ERROR_MESSAGES.NOT_AUTHENTICATED);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { data: gameData, error: apiError } = await gameApi.getGame(id);

        if (apiError || !gameData) {
          throw new Error(apiError?.message || ERROR_MESSAGES.FAILED_TO_LOAD);
        }

        setGame(gameData);
        setGameId(id);

        const { user } = useAuthStore.getState();
        if (user && gameData.user_id === user.id) {
          setRole(GAME_ROLES.HOST);
        } else {
          setRole(GAME_ROLES.PLAYER);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : ERROR_MESSAGES.FAILED_TO_LOAD;
        setError(errorMessage);
        console.error('Failed to load game:', err);
      } finally {
        setLoading(false);
      }
    },
    [session],
  );

  const clearGame = useCallback(() => {
    setGameId(null);
    setGameCode(null);
    setGame(null);
    setRole(null);
    setError(null);
  }, []);

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

//----------------------------------------------------
// 5. Helper Functions
//----------------------------------------------------

//----------------------------------------------------
// 6. Export
//----------------------------------------------------
