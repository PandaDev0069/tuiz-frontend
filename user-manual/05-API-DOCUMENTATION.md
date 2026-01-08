# API Documentation

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Game API](#game-api)
4. [Quiz Library API](#quiz-library-api)
5. [WebSocket Events](#websocket-events)
6. [Error Handling](#error-handling)

---

## Overview

TUIZ Frontend communicates with the backend through:

- **REST API**: For CRUD operations and data queries
- **WebSocket (Socket.IO)**: For real-time game events

### Base URLs

- **Development**: `http://localhost:8080`
- **Production**: `https://tuiz-info-king-backend.onrender.com` (or env variable)

### Authentication

All API requests (except public endpoints) require authentication via Bearer token in the Authorization header:

```
Authorization: Bearer <session_token>
```

---

## Authentication

### Supabase Authentication

The frontend uses Supabase for authentication. All auth operations go through Supabase client SDK.

#### Login

```typescript
// Frontend implementation
authService.signIn(email, password);
```

**Request:**

- Method: POST (handled by Supabase)
- Endpoint: Supabase Auth API
- Body: `{ email, password }`

**Response:**

```typescript
{
  user: User,
  session: Session
}
```

#### Register

```typescript
// Frontend implementation
authService.signUp(email, password, userData);
```

**Request:**

- Method: POST (handled by Supabase)
- Endpoint: Supabase Auth API
- Body: `{ email, password, data: { username, display_name } }`

**Response:**

```typescript
{
  user: User,
  session: Session
}
```

#### Logout

```typescript
// Frontend implementation
authService.signOut();
```

**Request:**

- Method: POST (handled by Supabase)
- Endpoint: Supabase Auth API

---

## Game API

All game API methods are available through `gameApi` service.

### Get Game by Room Code

```typescript
gameApi.getGameByCode(roomCode: string)
```

**Request:**

- Method: GET
- Endpoint: `/games/by-code/:gameCode`
- Auth: Not required (public)

**Response:**

```typescript
{
  data: {
    id: string;
    game_code: string;
    quiz_set_id: string;
    status: 'waiting' | 'active' | 'paused' | 'finished';
    current_players: number;
    // ... other game fields
  } | null;
  error: string | null;
}
```

---

### Get Game by ID

```typescript
gameApi.getGame(gameId: string)
```

**Request:**

- Method: GET
- Endpoint: `/games/:gameId`
- Auth: Not required (public)

**Response:**

```typescript
{
  data: Game | null;
  error: string | null;
}
```

---

### Create Game

```typescript
gameApi.createGame(quizSetId: string, gameSettings?, deviceId?, playerName?)
```

**Request:**

- Method: POST
- Endpoint: `/games`
- Auth: Required
- Body: `{ 
  quiz_set_id: string;
  game_settings?: Record<string, unknown>;
  device_id?: string;
  player_name?: string;
}`

**Response:**

```typescript
{
  data: {
    game: Game;
    host_player?: Player;
  } | null;
  error: string | null;
}
```

---

### Get Game State

```typescript
gameApi.getGameState(gameId: string)
```

**Request:**

- Method: GET
- Endpoint: `/games/:gameId/state`
- Auth: Not required

**Response:**

```typescript
{
  data: {
    game: Game;
    gameFlow: GameFlow;
  } | null;
  error: string | null;
}
```

---

### Get Game Flow

```typescript
gameApi.getGameFlow(gameId: string)
```

**Request:**

- Method: GET
- Endpoint: `/games/:gameId/flow`
- Auth: Not required

**Response:**

```typescript
{
  data: GameFlow | null;
  error: string | null;
}
```

---

### Get Current Question

```typescript
gameApi.getCurrentQuestion(gameId: string)
```

**Request:**

- Method: GET
- Endpoint: `/games/:gameId/current-question`
- Auth: Not required

**Response:**

```typescript
{
  data: {
    question: {
      id: string;
      question_text: string;
      image_url: string | null;
      question_type: 'multiple_choice' | 'true_false';
      answering_time: number;
      show_question_time: number;
      show_explanation_time: number;
      // ... other question fields
    };
    answers: Array<{
      id: string;
      answer_text: string;
      is_correct: boolean;
      order_index: number;
    }>;
  } | null;
  error: string | null;
}
```

---

### Get Players

```typescript
gameApi.getPlayers(gameId: string, limit?: number, offset?: number)
```

**Request:**

- Method: GET
- Endpoint: `/games/:gameId/players`
- Query Params: `?limit=50&offset=0`
- Auth: Not required

**Response:**

```typescript
{
  data: {
    players: Player[];
    total: number;
    game_id: string;
    limit: number;
    offset: number;
  } | null;
  error: string | null;
}
```

---

### Join Game

```typescript
gameApi.joinGame(gameId: string, playerName: string, deviceId: string)
```

**Request:**

- Method: POST
- Endpoint: `/games/:gameId/players`
- Auth: Not required
- Body: `{ player_name: string, device_id: string }`

**Response:**

```typescript
{
  data: Player | null;
  error: string | null;
}
```

---

### Submit Answer

```typescript
gameApi.submitAnswer(
  gameId: string,
  playerId: string,
  questionId: string,
  questionNumber: number,
  answerId: string | null,
  responseTimeMs: number
)
```

**Request:**

- Method: POST
- Endpoint: `/games/:gameId/players/:playerId/answer`
- Auth: Not required (player can submit)
- Body: `{
  question_id: string;
  question_number: number;
  answer_id: string | null;
  is_correct?: boolean;
  time_taken: number;
  points_earned?: number;
}`

**Response:**

```typescript
{
  data: {
    success: boolean;
    player_data: GamePlayerData;
  } | null;
  error: string | null;
}
```

**Note:** Answer is stored in `game_player_data.answer_report` (JSONB), not a separate table.

---

### Get Player Data

```typescript
gameApi.getPlayerData(gameId: string, playerId: string)
```

**Request:**

- Method: GET
- Endpoint: `/games/:gameId/players/:playerId/data`
- Auth: Not required

**Response:**

```typescript
{
  data: GamePlayerData | null;
  error: string | null;
}
```

---

### Get Player Stats

```typescript
gameApi.getPlayerStats(gameId: string, playerId: string)
```

**Request:**

- Method: GET
- Endpoint: `/games/:gameId/players/:playerId/stats`
- Auth: Not required

**Response:**

```typescript
{
  data: {
    player_id: string;
    player_name: string;
    score: number;
    rank: number;
    total_answers: number;
    correct_answers: number;
    incorrect_answers: number;
    accuracy: number;
    current_streak: number;
    max_streak: number;
    average_response_time: number;
    fastest_response: number;
    slowest_response: number;
    questions: Array<{
      question_id: string;
      question_number: number;
      is_correct: boolean;
      time_taken: number;
      points_earned: number;
    }>;
  } | null;
  error: string | null;
}
```

---

### Get Leaderboard

```typescript
gameApi.getLeaderboard(gameId: string, limit?: number, offset?: number)
```

**Request:**

- Method: GET
- Endpoint: `/games/:gameId/leaderboard`
- Query Params: `?limit=100&offset=0`
- Auth: Not required

**Response:**

```typescript
{
  data: {
    game_id: string;
    entries: Array<{
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
    }>;
    total: number;
    limit: number;
    offset: number;
    updated_at: string;
  } | null;
  error: string | null;
}
```

---

### Start Game (Host Only)

```typescript
gameApi.startGame(gameId: string)
```

**Request:**

- Method: POST
- Endpoint: `/games/:gameId/start`
- Auth: Required (host only)

**Response:**

```typescript
{
  data: {
    game: Game;
    gameFlow: GameFlow;
  } | null;
  error: string | null;
}
```

---

### Start Question (Host Only)

```typescript
gameApi.startQuestion(gameId: string, questionId: string)
```

**Request:**

- Method: POST
- Endpoint: `/games/:gameId/flow/start-question`
- Auth: Required (host only)
- Body: `{ question_id: string }`

**Response:**

```typescript
{
  data: GameFlow | null;
  error: string | null;
}
```

---

### Reveal Answer (Host Only)

```typescript
gameApi.revealAnswer(gameId: string, questionId: string)
```

**Request:**

- Method: POST
- Endpoint: `/games/:gameId/flow/reveal-answer`
- Auth: Required (host only)
- Body: `{ question_id: string }`

**Response:**

```typescript
{
  data: GameFlow | null;
  error: string | null;
}
```

---

### Advance to Next Question (Host Only)

```typescript
gameApi.advanceToNextQuestion(gameId: string)
```

**Request:**

- Method: POST
- Endpoint: `/games/:gameId/flow/next`
- Auth: Required (host only)

**Response:**

```typescript
{
  data: GameFlow | null;
  error: string | null;
}
```

---

### Pause Game (Host Only)

```typescript
gameApi.pauseGame(gameId: string)
```

**Request:**

- Method: POST
- Endpoint: `/games/:gameId/pause`
- Auth: Required (host only)

**Response:**

```typescript
{
  data: Game | null;
  error: string | null;
}
```

---

### Resume Game (Host Only)

```typescript
gameApi.resumeGame(gameId: string)
```

**Request:**

- Method: POST
- Endpoint: `/games/:gameId/resume`
- Auth: Required (host only)

**Response:**

```typescript
{
  data: Game | null;
  error: string | null;
}
```

---

### Ban Player (Host Only)

```typescript
gameApi.banPlayer(gameId: string, playerId: string)
```

**Request:**

- Method: DELETE
- Endpoint: `/games/:gameId/players/:playerId`
- Auth: Required (host only)

**Response:**

```typescript
{
  data: { success: boolean } | null;
  error: string | null;
}
```

---

## Quiz Library API

All quiz library operations are available through `quizLibraryService`.

### Get My Quizzes

```typescript
quizLibraryService.getMyQuizzes(filters?: QuizFilters)
```

**Request:**

- Method: GET
- Endpoint: `/quiz-library/my`
- Auth: Required
- Query Params: `?search=...&difficulty=...&tags=...&status=...&page=...&limit=...&sort=...`

**Response:**

```typescript
{
  data: QuizSet[];
  total: number;
  page: number;
  limit: number;
  error: string | null;
}
```

---

### Get Public Quizzes

```typescript
quizLibraryService.getPublicQuizzes(filters?: QuizFilters)
```

**Request:**

- Method: GET
- Endpoint: `/quiz-library/public`
- Auth: Not required
- Query Params: `?search=...&difficulty=...&tags=...&category=...&page=...&limit=...&sort=...`

**Response:**

```typescript
{
  data: QuizSet[];
  total: number;
  page: number;
  limit: number;
  error: string | null;
}
```

---

### Get Quiz by ID

```typescript
quizLibraryService.getQuizById(quizId: string)
```

**Request:**

- Method: GET
- Endpoint: `/quiz/:quizId`
- Auth: Required (if private)

**Response:**

```typescript
{
  data: QuizSet | null;
  error: string | null;
}
```

---

### Create Quiz

```typescript
quizLibraryService.createQuiz(quizData: CreateQuizRequest)
```

**Request:**

- Method: POST
- Endpoint: `/quiz`
- Auth: Required
- Body: `{
  title: string;
  description: string;
  thumbnail_url?: string;
  difficulty_level?: 'easy' | 'medium' | 'hard' | 'expert';
  category?: string;
  tags?: string[];
  is_public?: boolean;
  play_settings?: JSONB;
}`

**Response:**

```typescript
{
  data: QuizSet | null;
  error: string | null;
}
```

---

### Update Quiz

```typescript
quizLibraryService.updateQuiz(quizId: string, updates: UpdateQuizRequest)
```

**Request:**

- Method: PATCH
- Endpoint: `/quiz/:quizId`
- Auth: Required (owner only)
- Body: Partial quiz data

**Response:**

```typescript
{
  data: QuizSet | null;
  error: string | null;
}
```

---

### Delete Quiz

```typescript
quizLibraryService.deleteQuiz(quizId: string)
```

**Request:**

- Method: DELETE
- Endpoint: `/quiz/:quizId`
- Auth: Required (owner only)

**Response:**

```typescript
{
  data: { success: boolean } | null;
  error: string | null;
}
```

---

### Clone Quiz

```typescript
quizLibraryService.cloneQuiz(quizId: string)
```

**Request:**

- Method: POST
- Endpoint: `/quiz-library/:quizId/clone`
- Auth: Required

**Response:**

```typescript
{
  data: QuizSet | null;
  error: string | null;
}
```

---

### Publish Quiz

```typescript
quizLibraryService.publishQuiz(quizId: string)
```

**Request:**

- Method: POST
- Endpoint: `/quiz/:quizId/publish`
- Auth: Required (owner only)

**Response:**

```typescript
{
  data: QuizSet | null;
  error: string | null;
}
```

---

### Create Question

```typescript
// Via quiz service
```

**Request:**

- Method: POST
- Endpoint: `/quiz/:quizId/questions`
- Auth: Required (owner only)
- Body: `{
  question_text: string;
  question_type: 'multiple_choice' | 'true_false';
  image_url?: string;
  show_question_time: number;
  answering_time: number;
  show_explanation_time: number;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  order_index: number;
  explanation_title?: string;
  explanation_text?: string;
  explanation_image_url?: string;
}`

**Response:**

```typescript
{
  data: Question | null;
  error: string | null;
}
```

---

### Create Answer

```typescript
// Via quiz service
```

**Request:**

- Method: POST
- Endpoint: `/quiz/:quizId/questions/:questionId/answers`
- Auth: Required (owner only)
- Body: `{
  answer_text: string;
  image_url?: string;
  is_correct: boolean;
  order_index: number;
}`

**Response:**

```typescript
{
  data: Answer | null;
  error: string | null;
}
```

---

### Generate Quiz Code

```typescript
// Via quiz service
```

**Request:**

- Method: POST
- Endpoint: `/quiz/:quizId/generate-code`
- Auth: Required (owner only)

**Response:**

```typescript
{
  data: {
    code: number;
    quiz_id: string;
  } | null;
  error: string | null;
}
```

---

### Check Quiz Code

```typescript
// Via quiz service
```

**Request:**

- Method: GET
- Endpoint: `/quiz/code/check/:code`
- Auth: Not required

**Response:**

```typescript
{
  data: {
    available: boolean;
    quiz_id?: string;
  } | null;
  error: string | null;
}
```

---

## WebSocket Events

### Client → Server Events

#### Join Room

```typescript
socket.emit('room:join', { gameId: string, deviceId: string });
```

#### Leave Room

```typescript
socket.emit('room:leave', { gameId: string });
```

#### Start Question (Host Only)

```typescript
socket.emit('game:question:start', { gameId: string, questionId: string });
```

#### Reveal Answer (Host Only)

```typescript
socket.emit('game:answer:reveal', { gameId: string, questionId: string });
```

#### Next Question (Host Only)

```typescript
socket.emit('game:next', { gameId: string });
```

#### Pause Game (Host Only)

```typescript
socket.emit('game:pause', { gameId: string });
```

#### Resume Game (Host Only)

```typescript
socket.emit('game:resume', { gameId: string });
```

---

### Server → Client Events

#### Question Started

```typescript
socket.on(
  'game:question:started',
  (data: { gameId: string; questionId: string; questionIndex: number }) => {},
);
```

#### Question Changed

```typescript
socket.on(
  'game:question:changed',
  (data: { gameId: string; questionId: string; questionIndex: number }) => {},
);
```

#### Question Ended

```typescript
socket.on('game:question:ended', (data: { gameId: string; questionId: string }) => {});
```

#### Answer Statistics Update

```typescript
socket.on(
  'game:answer:stats:update',
  (data: { questionId: string; statistics: AnswerStatistic[]; totalAnswered: number }) => {},
);
```

#### Phase Change

```typescript
socket.on(
  'game:phase:change',
  (data: {
    gameId: string;
    phase: 'question' | 'answer' | 'reveal' | 'explanation' | 'leaderboard';
  }) => {},
);
```

#### Game Started

```typescript
socket.on('game:started', (data: { gameId: string }) => {});
```

#### Game Ended

```typescript
socket.on('game:ended', (data: { gameId: string }) => {});
```

#### Player Joined

```typescript
socket.on('game:player-joined', (data: { player: Player; totalPlayers: number }) => {});
```

#### Player Left

```typescript
socket.on('game:player-left', (data: { playerId: string; totalPlayers: number }) => {});
```

#### Player Kicked

```typescript
socket.on('game:player-kicked', (data: { playerId: string; reason?: string }) => {});
```

---

## Analytics & Debugging APIs

These endpoints exist for future analytics and debugging features. They are not directly used by the frontend application.

### WebSocket Connections

**Base Path:** `/websocket-connections`

- `GET /` - Get connections (auth required)
- `GET /:connectionId` - Get connection by ID (auth required)
- `GET /device/:deviceId` - Get connections by device (auth required)

### Device Sessions

**Base Path:** `/device-sessions`

- `GET /` - Get device sessions (auth required)
- `GET /:device_id` - Get session by device ID (auth required)
- `PATCH /:device_id` - Update device session (auth required)
- `GET /:device_id/connections` - Get connections for device (auth required)
- `GET /stats/summary` - Get session statistics (auth required)

### Game Events

**Base Path:** `/games/:gameId/events`

- `POST /:gameId/events` - Create game event (auth required)
- `GET /:gameId/events` - Get game events (public)
- `GET /:gameId/replay` - Get event sequence for replay (public)
- `GET /:gameId/events/types` - Get available event types (public)

### Room Participants

**Base Path:** `/games/:gameId/participants` or `/room-participants`

- Various endpoints for room participant tracking
- Used for enhanced participation analytics

---

## Error Handling

### Error Response Format

All API errors follow this format:

```typescript
{
  error: string;
  message?: string;
  code?: string;
  details?: any;
  requestId?: string;
}
```

### Common Error Codes

- `network_error`: Network request failed
- `invalid_response`: Invalid response format
- `unauthorized`: Authentication required
- `forbidden`: Insufficient permissions
- `not_found`: Resource not found
- `validation_error`: Request validation failed
- `server_error`: Internal server error
- `database_error`: Database operation failed
- `event_creation_failed`: Failed to create event
- `data_creation_failed`: Failed to create data

### Frontend Error Handling

```typescript
// Example error handling
try {
  const { data, error } = await gameApi.getGameByCode(code);
  if (error) {
    toast.error('Failed to get game');
    return;
  }
  // Use data
} catch (err) {
  toast.error('Network error');
}
```

---

## Important Notes

### Table Naming

- Backend uses `quiz_sets` (not `quizzes`)
- Frontend may reference both `quiz_id` and `quiz_set_id` for compatibility
- Actual column: `games.quiz_set_id` references `quiz_sets.id`

### Answer Storage

- Answers are stored in `game_player_data.answer_report` (JSONB)
- No separate `game_answers` table
- Submit answer endpoint: `/games/:gameId/players/:playerId/answer`

### Leaderboard

- Calculated from `game_player_data` table
- No separate `game_results` table
- Endpoint: `/games/:gameId/leaderboard`

### Analytics Endpoints

- Analytics endpoints exist but are not used by frontend
- Reserved for future analytics dashboards and debugging tools

---

**Last Updated**: January 2026
**Version**: 2.0
