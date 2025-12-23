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
  player_name: string; // Backend uses player_name, not display_name
  is_logged_in: boolean;
  is_host: boolean;
  created_at: string; // Backend uses created_at, not joined_at
  updated_at: string; // Backend uses updated_at, not last_active_at
  // Note: These fields don't exist in players table but may be in joined queries:
  // avatar_url - only in profiles table
  // score - only in game_player_data table
  // streak - not tracked
  // is_kicked - not implemented
}

export interface PlayersResponse {
  players: Player[];
  total: number;
  game_id: string;
  limit: number;
  offset: number;
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
  player_name: string; // Backend returns player_name, not display_name
  device_id?: string;
  score: number;
  rank: number;
  total_answers: number;
  correct_answers: number;
  accuracy: number;
  is_host?: boolean;
  is_logged_in?: boolean;
  // Note: avatar_url not in backend response (only in profiles table)
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

export interface AnswerReport {
  total_answers: number;
  correct_answers: number;
  incorrect_answers: number;
  questions: Array<{
    question_id: string;
    question_number: number;
    answer_id: string | null;
    is_correct: boolean;
    time_taken: number; // seconds
    points_earned: number;
    answered_at: string; // ISO timestamp
  }>;
  streaks?: {
    current_streak: number;
    max_streak: number;
  };
  timing?: {
    average_response_time: number;
    fastest_response: number;
    slowest_response: number;
  };
}

export interface GamePlayerData {
  id: string;
  player_id: string;
  player_device_id: string;
  game_id: string;
  score: number;
  answer_report: AnswerReport;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
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
      // Auth service stores session in 'tuiz_session' key
      const sessionStr = localStorage.getItem('tuiz_session');
      if (!sessionStr) return {};

      const session = JSON.parse(sessionStr);
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
   * Backend returns { game: Game, host_player?: Player }, so we need to unwrap it
   */
  async createGame(
    quizSetId: string,
    gameSettings?: Record<string, unknown>,
    deviceId?: string,
    playerName?: string,
  ) {
    const result = await this.request<{ game: Game; host_player?: Player }>('/games', {
      method: 'POST',
      body: JSON.stringify({
        quiz_set_id: quizSetId,
        game_settings: gameSettings || {},
        device_id: deviceId,
        player_name: playerName || 'Host',
      }),
    });

    // Unwrap the game from the response
    if (result.data?.game) {
      return {
        data: result.data.game,
        error: result.error,
      };
    }

    return {
      data: null,
      error: result.error || { error: 'invalid_response', message: 'Game not found in response' },
    };
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
   * GET /games/by-code/:gameCode
   * Get game details by room code
   * Public access (for players to join using room code)
   */
  async getGameByCode(gameCode: string) {
    return this.request<Game>(`/games/by-code/${gameCode}`, {
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

  /**
   * GET /games/:gameId/questions/current
   * Get current question with full metadata (images, answers, server timestamps)
   */
  async getCurrentQuestion(gameId: string) {
    return this.request<{
      question: {
        id: string;
        text: string;
        image_url: string | null;
        type: string;
        time_limit: number;
        points: number;
        difficulty: string;
        explanation_title: string | null;
        explanation_text: string | null;
        explanation_image_url: string | null;
        show_explanation_time: number;
      };
      answers: Array<{
        id: string;
        text: string;
        image_url: string | null;
        is_correct: boolean;
        order_index: number;
      }>;
      question_index: number;
      total_questions: number;
      server_time: string;
      start_time: string | null;
      remaining_ms: number;
      is_active: boolean;
    }>(`/games/${gameId}/questions/current`, {
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

  /**
   * POST /games/:gameId/questions/next
   * Advance to the next question
   */
  async nextQuestion(gameId: string) {
    return this.request<{
      message: string;
      gameFlow: GameFlow;
      nextQuestion?: { id: string; index: number };
      isComplete: boolean;
    }>(`/games/${gameId}/questions/next`, {
      method: 'POST',
    });
  }

  // ==========================================================================
  // PLAYER MANAGEMENT
  // ==========================================================================

  /**
   * POST /games/:gameId/join
   * Join a game as a player (public endpoint, no auth required)
   * Backend returns { success: true, player: Player, message: string }
   */
  async joinGame(gameId: string, playerName: string, deviceId: string) {
    const result = await this.request<{ success: boolean; player: Player; message: string }>(
      `/games/${gameId}/join`,
      {
        method: 'POST',
        body: JSON.stringify({
          player_name: playerName,
          device_id: deviceId,
        }),
      },
    );

    // Unwrap the player from the response
    if (result.data?.player) {
      return {
        data: result.data.player,
        error: result.error,
      };
    }

    return {
      data: null,
      error: result.error || { error: 'invalid_response', message: 'Player not found in response' },
    };
  }

  /**
   * GET /games/:gameId/players
   * Get all players in a game
   * Backend returns PlayersResponse with { players: Player[], total: number, ... }
   */
  async getPlayers(gameId: string) {
    return this.request<PlayersResponse>(`/games/${gameId}/players`, {
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

  /**
   * POST /games/:gameId/players/:playerId/data
   * Initialize player data for a game (creates game_player_data record)
   */
  async initializePlayerData(gameId: string, playerId: string, deviceId: string) {
    return this.request<{ id: string; player_id: string; game_id: string; score: number }>(
      `/games/${gameId}/players/${playerId}/data`,
      {
        method: 'POST',
        body: JSON.stringify({
          player_device_id: deviceId,
        }),
      },
    );
  }

  // ==========================================================================
  // ANSWER SUBMISSION
  // ==========================================================================

  /**
   * POST /games/:gameId/players/:playerId/answer
   * Submit an answer for a question
   * Backend expects: question_id, question_number, answer_id, is_correct, time_taken (seconds), points_earned
   */
  async submitAnswer(
    gameId: string,
    playerId: string,
    questionId: string,
    questionNumber: number,
    answerId: string | null,
    isCorrect: boolean,
    timeTakenSeconds: number,
    pointsEarned: number = 0,
  ) {
    return this.request<GamePlayerData>(`/games/${gameId}/players/${playerId}/answer`, {
      method: 'POST',
      body: JSON.stringify({
        question_id: questionId,
        question_number: questionNumber,
        answer_id: answerId,
        is_correct: isCorrect,
        time_taken: timeTakenSeconds,
        points_earned: pointsEarned,
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
