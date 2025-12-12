/**
 * Game API Service
 * REST API client for game operations including CRUD, state management,
 * player operations, answer submission, and leaderboard queries.
 */

import { cfg } from '@/config/config';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface Game {
  id: string;
  room_code?: string; // Legacy field name
  game_code?: string; // Backend field name (preferred)
  quiz_id?: string; // Legacy field name
  quiz_set_id?: string; // Backend field name (preferred)
  user_id: string;
  status: 'waiting' | 'active' | 'paused' | 'completed';
  current_question_index: number | null;
  locked: boolean;
  started_at: string | null;
  ended_at: string | null;
  paused_at: string | null;
  resumed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface GameFlow {
  id: string;
  game_id: string;
  current_question_id: string | null;
  current_question_index: number | null;
  current_question_start_time: string | null;
  current_question_end_time: string | null;
  is_paused: boolean;
  created_at: string;
  updated_at: string;
}

export interface GameState {
  game: Game;
  gameFlow: GameFlow;
}

export interface Player {
  id: string;
  game_id: string;
  device_id: string;
  display_name: string;
  avatar_url: string | null;
  score: number;
  streak: number;
  is_host: boolean;
  is_kicked: boolean;
  joined_at: string;
  last_active_at: string;
}

export interface PlayerStats {
  total_answers: number;
  correct_answers: number;
  incorrect_answers: number;
  average_response_time: number;
  best_streak: number;
}

export interface LeaderboardEntry {
  player_id: string;
  display_name: string;
  avatar_url: string | null;
  score: number;
  rank: number;
  total_answers: number;
  correct_answers: number;
  accuracy: number;
}

export interface Answer {
  id: string;
  game_id: string;
  player_id: string;
  question_id: string;
  selected_option: string | null;
  is_correct: boolean | null;
  response_time_ms: number;
  points_earned: number;
  answered_at: string;
}

export interface ApiError {
  error: string;
  message?: string;
  requestId?: string;
}

// ============================================================================
// API CLIENT CLASS
// ============================================================================

class GameApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = cfg.apiBase || 'http://localhost:8080';
  }

  /**
   * Get authorization header from stored session
   */
  private getAuthHeader(): Record<string, string> {
    try {
      const authData = localStorage.getItem('tuiz_auth_data');
      if (!authData) return {};

      const { session } = JSON.parse(authData);
      if (!session?.access_token) return {};

      return {
        Authorization: `Bearer ${session.access_token}`,
      };
    } catch {
      return {};
    }
  }

  /**
   * Make HTTP request with unified error handling
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<{ data: T | null; error: ApiError | null }> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader(),
          ...options.headers,
        },
      });

      const json = await response.json();

      if (!response.ok) {
        return {
          data: null,
          error: json as ApiError,
        };
      }

      return {
        data: json as T,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: {
          error: 'network_error',
          message: error instanceof Error ? error.message : 'Network request failed',
        },
      };
    }
  }

  // ==========================================================================
  // GAME CRUD OPERATIONS
  // ==========================================================================

  /**
   * POST /games
   * Create a new game session
   */
  async createGame(quizSetId: string, gameSettings?: Record<string, unknown>) {
    return this.request<Game>('/games', {
      method: 'POST',
      body: JSON.stringify({
        quiz_set_id: quizSetId,
        game_settings: gameSettings || {},
      }),
    });
  }

  /**
   * GET /games/:gameId
   * Get game details
   */
  async getGame(gameId: string) {
    return this.request<Game>(`/games/${gameId}`, {
      method: 'GET',
    });
  }

  /**
   * GET /games/:gameId/state
   * Get current game state including flow information
   */
  async getGameState(gameId: string) {
    return this.request<GameState>(`/games/${gameId}/state`, {
      method: 'GET',
    });
  }

  // ==========================================================================
  // GAME STATE MANAGEMENT
  // ==========================================================================

  /**
   * POST /games/:gameId/start
   * Start a game - moves status from WAITING to ACTIVE
   */
  async startGame(gameId: string) {
    return this.request<Game>(`/games/${gameId}/start`, {
      method: 'POST',
    });
  }

  /**
   * PATCH /games/:gameId/status
   * Update game status (pause, resume, end)
   */
  async updateGameStatus(gameId: string, action: 'pause' | 'resume' | 'end') {
    return this.request<Game>(`/games/${gameId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ action }),
    });
  }

  /**
   * Pause the game
   */
  async pauseGame(gameId: string) {
    return this.updateGameStatus(gameId, 'pause');
  }

  /**
   * Resume the game
   */
  async resumeGame(gameId: string) {
    return this.updateGameStatus(gameId, 'resume');
  }

  /**
   * End the game
   */
  async endGame(gameId: string) {
    return this.updateGameStatus(gameId, 'end');
  }

  /**
   * PATCH /games/:gameId/lock
   * Lock or unlock the game room
   */
  async lockGame(gameId: string, locked: boolean) {
    return this.request<Game>(`/games/${gameId}/lock`, {
      method: 'PATCH',
      body: JSON.stringify({ locked }),
    });
  }

  // ==========================================================================
  // QUESTION CONTROL
  // ==========================================================================

  /**
   * POST /games/:gameId/questions/start
   * Start a specific question
   */
  async startQuestion(gameId: string, questionId: string, questionIndex?: number) {
    return this.request<GameFlow>(`/games/${gameId}/questions/start`, {
      method: 'POST',
      body: JSON.stringify({ questionId, questionIndex }),
    });
  }

  /**
   * POST /games/:gameId/questions/reveal
   * Trigger answer reveal for current question
   */
  async revealAnswer(gameId: string) {
    return this.request<{ message: string; gameFlow: GameFlow }>(
      `/games/${gameId}/questions/reveal`,
      {
        method: 'POST',
      },
    );
  }

  // ==========================================================================
  // PLAYER MANAGEMENT
  // ==========================================================================

  /**
   * POST /games/:gameId/join
   * Join a game as a player (public endpoint, no auth required)
   */
  async joinGame(gameId: string, playerName: string, deviceId: string) {
    return this.request<Player>(`/games/${gameId}/join`, {
      method: 'POST',
      body: JSON.stringify({
        player_name: playerName,
        device_id: deviceId,
      }),
    });
  }

  /**
   * GET /games/:gameId/players
   * Get all players in a game
   */
  async getPlayers(gameId: string) {
    return this.request<Player[]>(`/games/${gameId}/players`, {
      method: 'GET',
    });
  }

  /**
   * GET /games/:gameId/players/:playerId/stats
   * Get player statistics
   */
  async getPlayerStats(gameId: string, playerId: string) {
    return this.request<PlayerStats>(`/games/${gameId}/players/${playerId}/stats`, {
      method: 'GET',
    });
  }

  /**
   * PATCH /games/:gameId/players/:playerId
   * Update player information
   */
  async updatePlayer(gameId: string, playerId: string, updates: Partial<Player>) {
    return this.request<Player>(`/games/${gameId}/players/${playerId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  /**
   * DELETE /games/:gameId/players/:playerId
   * Remove/kick a player from the game
   */
  async kickPlayer(gameId: string, playerId: string) {
    return this.request<{ message: string }>(`/games/${gameId}/players/${playerId}`, {
      method: 'DELETE',
    });
  }

  // ==========================================================================
  // ANSWER SUBMISSION
  // ==========================================================================

  /**
   * POST /games/:gameId/players/:playerId/answers
   * Submit an answer for a question
   */
  async submitAnswer(
    gameId: string,
    playerId: string,
    questionId: string,
    selectedOption: string,
    responseTimeMs: number,
  ) {
    return this.request<Answer>(`/games/${gameId}/players/${playerId}/answers`, {
      method: 'POST',
      body: JSON.stringify({
        question_id: questionId,
        selected_option: selectedOption,
        response_time_ms: responseTimeMs,
      }),
    });
  }

  /**
   * GET /games/:gameId/players/:playerId/answers
   * Get all answers for a player in the game
   */
  async getPlayerAnswers(gameId: string, playerId: string) {
    return this.request<Answer[]>(`/games/${gameId}/players/${playerId}/answers`, {
      method: 'GET',
    });
  }

  // ==========================================================================
  // LEADERBOARD & RESULTS
  // ==========================================================================

  /**
   * GET /games/:gameId/leaderboard
   * Get game leaderboard with rankings
   */
  async getLeaderboard(gameId: string) {
    return this.request<LeaderboardEntry[]>(`/games/${gameId}/leaderboard`, {
      method: 'GET',
    });
  }

  /**
   * GET /games/:gameId/results
   * Get final game results (alias for leaderboard)
   */
  async getGameResults(gameId: string) {
    return this.getLeaderboard(gameId);
  }
}

// Export singleton instance
export const gameApi = new GameApiClient();
