// ====================================================
// File Name   : gameApi.ts
// Project     : TUIZ
// Author      : PandaDev0069 / Panta Aashish
// Created     : 2025-12-11
// Last Update : 2026-01-03

// Description:
// - REST API client for game operations
// - Handles CRUD operations, state management, player operations
// - Manages answer submission and leaderboard queries
// - Provides typed interfaces for all game-related API interactions

// Notes:
// - Uses singleton pattern for service instance
// - Handles authentication via localStorage session token
// - All methods return typed promises with error handling
// ====================================================

//----------------------------------------------------
// 1. Imports / Dependencies
//----------------------------------------------------
import { cfg } from '@/config/config';

//----------------------------------------------------
// 2. Constants / Configuration
//----------------------------------------------------
const STORAGE_KEY_SESSION = 'tuiz_session';
const DEFAULT_API_BASE_URL = 'http://localhost:8080';
const DEFAULT_PLAYER_NAME = 'Host';
const DEFAULT_POINTS_EARNED = 0;

const AUTH_BEARER_PREFIX = 'Bearer ';
const HEADER_CONTENT_TYPE = 'application/json';

const ERROR_CODE_NETWORK = 'network_error';
const ERROR_CODE_INVALID_RESPONSE = 'invalid_response';
const ERROR_CODE_DATA_CREATION_FAILED = 'data_creation_failed';

const ERROR_MESSAGE_NETWORK_FAILED = 'Network request failed';
const ERROR_MESSAGE_GAME_NOT_FOUND = 'Game not found in response';
const ERROR_MESSAGE_PLAYER_NOT_FOUND = 'Player not found in response';
const ERROR_MESSAGE_ALREADY_EXISTS = 'already exists';
const ERROR_MESSAGE_PLAYER_DATA_EXISTS = 'Player data already exists';

//----------------------------------------------------
// 3. Types / Interfaces
//----------------------------------------------------
export interface Game {
  id: string;
  room_code?: string;
  game_code?: string;
  quiz_id?: string;
  quiz_set_id?: string;
  user_id: string;
  status: 'waiting' | 'active' | 'paused' | 'finished';
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
  next_question_id: string | null;
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
  player_name: string;
  is_logged_in: boolean;
  is_host: boolean;
  created_at: string;
  updated_at: string;
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
  player_name: string;
  device_id?: string;
  score: number;
  rank: number;
  previous_rank?: number;
  rank_change?: 'up' | 'down' | 'same';
  score_change?: number;
  total_answers: number;
  correct_answers: number;
  accuracy: number;
  is_host?: boolean;
  is_logged_in?: boolean;
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
    time_taken: number;
    points_earned: number;
    answered_at: string;
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
  created_at: string;
  updated_at: string;
}

export interface ApiError {
  error: string;
  message?: string;
  requestId?: string;
  statusCode?: number;
}

//----------------------------------------------------
// 4. Core Logic
//----------------------------------------------------
/**
 * Class: GameApiClient
 * Description:
 * - REST API client for game operations
 * - Handles authentication, request formatting, and response parsing
 * - Provides methods for game CRUD, state management, player operations, and leaderboard queries
 */
class GameApiClient {
  private baseUrl: string;

  /**
   * Constructor: GameApiClient
   * Description:
   * - Initializes the client with API base URL from configuration
   * - Falls back to default localhost URL if configuration is missing
   */
  constructor() {
    this.baseUrl = cfg.apiBase || DEFAULT_API_BASE_URL;

    // Log API base URL in development for debugging cross-browser issues
    if (process.env.NODE_ENV === 'development' || typeof window !== 'undefined') {
      console.log('[GameApi] Initialized with base URL:', this.baseUrl);
    }
  }

  /**
   * Method: createGame
   * Description:
   * - Creates a new game session
   * - Unwraps game from backend response format
   *
   * Parameters:
   * - quizSetId (string): Quiz set identifier
   * - gameSettings (Record<string, unknown>, optional): Game configuration settings
   * - deviceId (string, optional): Host device identifier
   * - playerName (string, optional): Host player name (defaults to 'Host')
   *
   * Returns:
   * - Promise<{ data: Game | null; error: ApiError | null }>: Created game or error
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
        player_name: playerName || DEFAULT_PLAYER_NAME,
      }),
    });

    if (result.data?.game) {
      return {
        data: result.data.game,
        error: result.error,
      };
    }

    return {
      data: null,
      error: result.error || {
        error: ERROR_CODE_INVALID_RESPONSE,
        message: ERROR_MESSAGE_GAME_NOT_FOUND,
      },
    };
  }

  /**
   * Method: getGame
   * Description:
   * - Fetches game details by game ID
   *
   * Parameters:
   * - gameId (string): Game identifier
   *
   * Returns:
   * - Promise<{ data: Game | null; error: ApiError | null }>: Game data or error
   */
  async getGame(gameId: string) {
    return this.request<Game>(`/games/${gameId}`, {
      method: 'GET',
    });
  }

  /**
   * Method: getGameByCode
   * Description:
   * - Fetches game details by room code
   * - Public access endpoint for players to join using room code
   *
   * Parameters:
   * - gameCode (string): Game room code
   *
   * Returns:
   * - Promise<{ data: Game | null; error: ApiError | null }>: Game data or error
   */
  async getGameByCode(gameCode: string) {
    return this.request<Game>(`/games/by-code/${gameCode}`, {
      method: 'GET',
    });
  }

  /**
   * Method: getGameState
   * Description:
   * - Fetches current game state including flow information
   *
   * Parameters:
   * - gameId (string): Game identifier
   *
   * Returns:
   * - Promise<{ data: GameState | null; error: ApiError | null }>: Game state or error
   */
  async getGameState(gameId: string) {
    return this.request<GameState>(`/games/${gameId}/state`, {
      method: 'GET',
    });
  }

  /**
   * Method: getCurrentQuestion
   * Description:
   * - Fetches current question with full metadata including images, answers, and server timestamps
   *
   * Parameters:
   * - gameId (string): Game identifier
   *
   * Returns:
   * - Promise<{ data: CurrentQuestionResponse | null; error: ApiError | null }>: Question data or error
   */
  async getCurrentQuestion(gameId: string) {
    const result = await this.request<{
      question: {
        id: string;
        text: string;
        image_url: string | null;
        type: string;
        time_limit: number;
        show_question_time: number;
        answering_time: number;
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
    return result;
  }

  /**
   * Method: startGame
   * Description:
   * - Starts a game by moving status from WAITING to ACTIVE
   *
   * Parameters:
   * - gameId (string): Game identifier
   *
   * Returns:
   * - Promise<{ data: Game | null; error: ApiError | null }>: Updated game or error
   */
  async startGame(gameId: string) {
    return this.request<Game>(`/games/${gameId}/start`, {
      method: 'POST',
    });
  }

  /**
   * Method: updateGameStatus
   * Description:
   * - Updates game status (pause, resume, or end)
   *
   * Parameters:
   * - gameId (string): Game identifier
   * - action ('pause' | 'resume' | 'end'): Status action to perform
   *
   * Returns:
   * - Promise<{ data: Game | null; error: ApiError | null }>: Updated game or error
   */
  async updateGameStatus(gameId: string, action: 'pause' | 'resume' | 'end') {
    return this.request<Game>(`/games/${gameId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ action }),
    });
  }

  /**
   * Method: pauseGame
   * Description:
   * - Pauses the game
   *
   * Parameters:
   * - gameId (string): Game identifier
   *
   * Returns:
   * - Promise<{ data: Game | null; error: ApiError | null }>: Updated game or error
   */
  async pauseGame(gameId: string) {
    return this.updateGameStatus(gameId, 'pause');
  }

  /**
   * Method: resumeGame
   * Description:
   * - Resumes the game
   *
   * Parameters:
   * - gameId (string): Game identifier
   *
   * Returns:
   * - Promise<{ data: Game | null; error: ApiError | null }>: Updated game or error
   */
  async resumeGame(gameId: string) {
    return this.updateGameStatus(gameId, 'resume');
  }

  /**
   * Method: endGame
   * Description:
   * - Ends the game
   *
   * Parameters:
   * - gameId (string): Game identifier
   *
   * Returns:
   * - Promise<{ data: Game | null; error: ApiError | null }>: Updated game or error
   */
  async endGame(gameId: string) {
    return this.updateGameStatus(gameId, 'end');
  }

  /**
   * Method: lockGame
   * Description:
   * - Locks or unlocks the game room
   *
   * Parameters:
   * - gameId (string): Game identifier
   * - locked (boolean): Lock state to set
   *
   * Returns:
   * - Promise<{ data: Game | null; error: ApiError | null }>: Updated game or error
   */
  async lockGame(gameId: string, locked: boolean) {
    return this.request<Game>(`/games/${gameId}/lock`, {
      method: 'PATCH',
      body: JSON.stringify({ locked }),
    });
  }

  /**
   * Method: startQuestion
   * Description:
   * - Starts a specific question in the game
   *
   * Parameters:
   * - gameId (string): Game identifier
   * - questionId (string): Question identifier
   * - questionIndex (number, optional): Question index number
   *
   * Returns:
   * - Promise<{ data: GameFlow | null; error: ApiError | null }>: Updated game flow or error
   */
  async startQuestion(gameId: string, questionId: string, questionIndex?: number) {
    return this.request<GameFlow>(`/games/${gameId}/questions/start`, {
      method: 'POST',
      body: JSON.stringify({ questionId, questionIndex }),
    });
  }

  /**
   * Method: revealAnswer
   * Description:
   * - Triggers answer reveal for current question
   *
   * Parameters:
   * - gameId (string): Game identifier
   *
   * Returns:
   * - Promise<{ data: RevealAnswerResponse | null; error: ApiError | null }>: Reveal response or error
   */
  async revealAnswer(gameId: string) {
    return this.request<{
      message: string;
      gameFlow: GameFlow;
      answerStats?: Record<string, number>;
    }>(`/games/${gameId}/questions/reveal`, {
      method: 'POST',
    });
  }

  /**
   * Method: nextQuestion
   * Description:
   * - Advances to the next question in the game
   *
   * Parameters:
   * - gameId (string): Game identifier
   *
   * Returns:
   * - Promise<{ data: NextQuestionResponse | null; error: ApiError | null }>: Next question response or error
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

  /**
   * Method: showExplanation
   * Description:
   * - Shows explanation for current question
   *
   * Parameters:
   * - gameId (string): Game identifier
   *
   * Returns:
   * - Promise<{ data: ExplanationResponse | null; error: ApiError | null }>: Explanation data or error
   */
  async showExplanation(gameId: string) {
    return this.request<{
      message: string;
      explanation: {
        title: string | null;
        text: string | null;
        image_url: string | null;
        show_time: number | null;
      };
    }>(`/games/${gameId}/questions/explanation/show`, {
      method: 'POST',
    });
  }

  /**
   * Method: hideExplanation
   * Description:
   * - Hides explanation for current question
   *
   * Parameters:
   * - gameId (string): Game identifier
   *
   * Returns:
   * - Promise<{ data: { message: string } | null; error: ApiError | null }>: Success message or error
   */
  async hideExplanation(gameId: string) {
    return this.request<{ message: string }>(`/games/${gameId}/questions/explanation/hide`, {
      method: 'POST',
    });
  }

  /**
   * Method: getExplanation
   * Description:
   * - Fetches explanation data for a specific question
   *
   * Parameters:
   * - gameId (string): Game identifier
   * - questionId (string): Question identifier
   *
   * Returns:
   * - Promise<{ data: QuestionExplanation | null; error: ApiError | null }>: Explanation data or error
   */
  async getExplanation(gameId: string, questionId: string) {
    const result = await this.request<{
      question_id: string;
      explanation_title: string | null;
      explanation_text: string | null;
      explanation_image_url: string | null;
      show_explanation_time: number;
    }>(`/games/${gameId}/questions/${questionId}/explanation`, {
      method: 'GET',
    });

    // Handle 404 Not Found (explanation doesn't exist) - return null gracefully
    if (result.error && result.error.statusCode === 404) {
      return {
        data: null,
        error: null,
      };
    }

    return result;
  }

  /**
   * Method: joinGame
   * Description:
   * - Joins a game as a player
   * - Public endpoint that does not require authentication
   * - Unwraps player from backend response format
   *
   * Parameters:
   * - gameId (string): Game identifier
   * - playerName (string): Player display name
   * - deviceId (string): Device identifier
   *
   * Returns:
   * - Promise<{ data: Player | null; error: ApiError | null }>: Player data or error
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

    if (result.data?.player) {
      return {
        data: result.data.player,
        error: result.error,
      };
    }
    return {
      data: null,
      error: result.error || {
        error: ERROR_CODE_INVALID_RESPONSE,
        message: ERROR_MESSAGE_PLAYER_NOT_FOUND,
      },
    };
  }

  /**
   * Method: getPlayers
   * Description:
   * - Fetches all players in a game
   *
   * Parameters:
   * - gameId (string): Game identifier
   *
   * Returns:
   * - Promise<{ data: PlayersResponse | null; error: ApiError | null }>: Players data or error
   */
  async getPlayers(gameId: string) {
    return this.request<PlayersResponse>(`/games/${gameId}/players`, {
      method: 'GET',
    });
  }

  /**
   * Method: getPlayerStats
   * Description:
   * - Fetches player statistics for a game
   *
   * Parameters:
   * - gameId (string): Game identifier
   * - playerId (string): Player identifier
   *
   * Returns:
   * - Promise<{ data: PlayerStats | null; error: ApiError | null }>: Player stats or error
   */
  async getPlayerStats(gameId: string, playerId: string) {
    return this.request<PlayerStats>(`/games/${gameId}/players/${playerId}/stats`, {
      method: 'GET',
    });
  }

  /**
   * Method: updatePlayer
   * Description:
   * - Updates player information
   *
   * Parameters:
   * - gameId (string): Game identifier
   * - playerId (string): Player identifier
   * - updates (Partial<Player>): Player fields to update
   *
   * Returns:
   * - Promise<{ data: Player | null; error: ApiError | null }>: Updated player or error
   */
  async updatePlayer(gameId: string, playerId: string, updates: Partial<Player>) {
    return this.request<Player>(`/games/${gameId}/players/${playerId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  /**
   * Method: kickPlayer
   * Description:
   * - Removes or kicks a player from the game
   *
   * Parameters:
   * - gameId (string): Game identifier
   * - playerId (string): Player identifier
   *
   * Returns:
   * - Promise<{ data: { message: string } | null; error: ApiError | null }>: Success message or error
   */
  async kickPlayer(gameId: string, playerId: string) {
    return this.request<{ message: string }>(`/games/${gameId}/players/${playerId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Method: initializePlayerData
   * Description:
   * - Initializes player data for a game by creating game_player_data record
   * - Returns success even if data already exists (409 Conflict) as this is expected behavior
   * - Note: Browser console may show 409 errors - these are expected and handled gracefully
   *
   * Parameters:
   * - gameId (string): Game identifier
   * - playerId (string): Player identifier
   * - deviceId (string): Device identifier
   *
   * Returns:
   * - Promise<{ data: PlayerDataInitResponse | null; error: ApiError | null }>: Initialization result or error
   */
  async initializePlayerData(gameId: string, playerId: string, deviceId: string) {
    const result = await this.request<{
      id: string;
      player_id: string;
      game_id: string;
      score: number;
    }>(`/games/${gameId}/players/${playerId}/data`, {
      method: 'POST',
      body: JSON.stringify({
        player_device_id: deviceId,
      }),
    });

    // Handle 409 Conflict (player data already exists) - this is expected and not an error
    // The browser console may show this as an error, but it's handled gracefully here
    if (
      result.error &&
      (result.error.statusCode === 409 ||
        result.error.error === ERROR_CODE_DATA_CREATION_FAILED ||
        result.error.message?.includes(ERROR_MESSAGE_ALREADY_EXISTS) ||
        result.error.message?.includes(ERROR_MESSAGE_PLAYER_DATA_EXISTS))
    ) {
      return {
        data: null,
        error: null,
      };
    }

    return result;
  }

  /**
   * Method: submitAnswer
   * Description:
   * - Submits an answer for a question
   *
   * Parameters:
   * - gameId (string): Game identifier
   * - playerId (string): Player identifier
   * - questionId (string): Question identifier
   * - questionNumber (number): Question number in sequence
   * - answerId (string | null): Selected answer identifier
   * - isCorrect (boolean): Whether answer is correct
   * - timeTakenSeconds (number): Time taken to answer in seconds
   * - pointsEarned (number, optional): Points earned for answer (defaults to 0)
   *
   * Returns:
   * - Promise<{ data: GamePlayerData | null; error: ApiError | null }>: Updated player data or error
   */
  async submitAnswer(
    gameId: string,
    playerId: string,
    questionId: string,
    questionNumber: number,
    answerId: string | null,
    isCorrect: boolean,
    timeTakenSeconds: number,
    pointsEarned: number = DEFAULT_POINTS_EARNED,
  ) {
    // Validate required parameters before making the request
    if (!gameId || !playerId || !questionId) {
      return {
        data: null,
        error: {
          error: 'validation_error',
          message: 'Missing required parameters: gameId, playerId, or questionId',
          statusCode: 400,
        },
      };
    }

    if (!questionNumber || questionNumber < 1) {
      return {
        data: null,
        error: {
          error: 'validation_error',
          message: 'Invalid question number',
          statusCode: 400,
        },
      };
    }

    if (
      typeof timeTakenSeconds !== 'number' ||
      timeTakenSeconds < 0 ||
      !Number.isFinite(timeTakenSeconds)
    ) {
      return {
        data: null,
        error: {
          error: 'validation_error',
          message: 'Invalid time taken value',
          statusCode: 400,
        },
      };
    }

    const result = await this.request<GamePlayerData>(
      `/games/${gameId}/players/${playerId}/answer`,
      {
        method: 'POST',
        body: JSON.stringify({
          question_id: questionId,
          question_number: questionNumber,
          answer_id: answerId,
          is_correct: isCorrect,
          time_taken: timeTakenSeconds,
          points_earned: pointsEarned,
        }),
      },
    );

    // Handle 409 Conflict (answer already submitted) - mark as "already answered" error
    if (result.error && result.error.statusCode === 409) {
      return {
        data: null,
        error: {
          ...result.error,
          error: 'answer_already_submitted',
          message: result.error.message || 'Answer already submitted for this question',
        },
      };
    }

    // Handle 400 Bad Request - provide more context
    if (result.error && result.error.statusCode === 400) {
      return {
        data: null,
        error: {
          ...result.error,
          error: result.error.error || 'bad_request',
          message: result.error.message || 'Invalid request parameters',
        },
      };
    }

    return result;
  }

  /**
   * Method: getPlayerAnswers
   * Description:
   * - Fetches all answers for a player in the game
   * - Returns empty array if player hasn't submitted answers yet (404 is expected)
   * - Note: Browser console may show 404 errors - these are expected and handled gracefully
   *
   * Parameters:
   * - gameId (string): Game identifier
   * - playerId (string): Player identifier
   *
   * Returns:
   * - Promise<{ data: Answer[] | null; error: ApiError | null }>: Player answers or error
   */
  async getPlayerAnswers(gameId: string, playerId: string) {
    const result = await this.request<Answer[]>(`/games/${gameId}/players/${playerId}/answers`, {
      method: 'GET',
    });

    // Handle 404 Not Found (player hasn't submitted answers yet) - return empty array instead of error
    // The browser console may show this as an error, but it's handled gracefully here
    if (result.error && result.error.statusCode === 404) {
      return {
        data: [],
        error: null,
      };
    }

    return result;
  }

  /**
   * Method: getLeaderboard
   * Description:
   * - Fetches game leaderboard with rankings
   *
   * Parameters:
   * - gameId (string): Game identifier
   *
   * Returns:
   * - Promise<{ data: LeaderboardResponse | null; error: ApiError | null }>: Leaderboard data or error
   */
  async getLeaderboard(gameId: string) {
    return this.request<
      LeaderboardEntry[] | { entries: LeaderboardEntry[]; total: number; game_id: string }
    >(`/games/${gameId}/leaderboard`, {
      method: 'GET',
    });
  }

  /**
   * Method: getGameResults
   * Description:
   * - Fetches final game results (alias for leaderboard)
   *
   * Parameters:
   * - gameId (string): Game identifier
   *
   * Returns:
   * - Promise<{ data: LeaderboardResponse | null; error: ApiError | null }>: Game results or error
   */
  async getGameResults(gameId: string) {
    return this.getLeaderboard(gameId);
  }

  //----------------------------------------------------
  // 5. Helper Functions
  //----------------------------------------------------
  /**
   * Method: getAuthHeader
   * Description:
   * - Retrieves authorization header from stored session
   * - Safely handles browser environment and parsing errors
   *
   * Returns:
   * - Record<string, string>: Authorization header object or empty object
   */
  private getAuthHeader(): Record<string, string> {
    try {
      const sessionStr = localStorage.getItem(STORAGE_KEY_SESSION);
      if (!sessionStr) return {};

      const session = JSON.parse(sessionStr);
      if (!session?.access_token) return {};

      return {
        Authorization: `${AUTH_BEARER_PREFIX}${session.access_token}`,
      };
    } catch {
      return {};
    }
  }

  /**
   * Method: request
   * Description:
   * - Makes HTTP request with unified error handling
   * - Handles authentication token injection
   * - Parses JSON responses and handles errors gracefully
   *
   * Parameters:
   * - endpoint (string): API endpoint path
   * - options (RequestInit): Optional fetch request options
   *
   * Returns:
   * - Promise<{ data: T | null; error: ApiError | null }>: Typed response data or error
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<{ data: T | null; error: ApiError | null }> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': HEADER_CONTENT_TYPE,
          ...this.getAuthHeader(),
          ...options.headers,
        },
      });

      // Handle empty responses (e.g., 204 No Content, or empty error responses)
      const contentType = response.headers.get('content-type');
      const hasJsonContent = contentType?.includes('application/json');
      const text = await response.text();
      const json = hasJsonContent && text ? JSON.parse(text) : {};

      if (!response.ok) {
        return {
          data: null,
          error: {
            ...(json as ApiError),
            statusCode: response.status,
            error: (json as ApiError).error || `HTTP ${response.status}`,
            message: (json as ApiError).message || response.statusText,
          },
        };
      }

      return {
        data: (hasJsonContent && text ? json : null) as T,
        error: null,
      };
    } catch (error) {
      // Enhanced error logging for network issues
      const errorMessage = error instanceof Error ? error.message : ERROR_MESSAGE_NETWORK_FAILED;

      // Log network errors for debugging (especially useful for cross-browser issues)
      if (process.env.NODE_ENV === 'development' || typeof window !== 'undefined') {
        console.error('[GameApi] Network error:', {
          endpoint: `${this.baseUrl}${endpoint}`,
          method: options.method || 'GET',
          error: errorMessage,
          baseUrl: this.baseUrl,
        });
      }

      return {
        data: null,
        error: {
          error: ERROR_CODE_NETWORK,
          message: errorMessage,
        },
      };
    }
  }
}

//----------------------------------------------------
// 6. Export
//----------------------------------------------------
export const gameApi = new GameApiClient();

export default gameApi;
