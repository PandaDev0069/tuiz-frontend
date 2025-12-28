# Complete Game Flow Documentation

## Overview

This document describes the complete game flow mechanics of the TUIZ quiz application. The game is a real-time multiplayer quiz system where a host creates and manages a quiz session, and multiple players join to answer questions.

## Three Perspectives

The game has three distinct perspectives, each with different UI and functionality:

1. **Host Perspective** - The quiz creator who controls the game flow
2. **Player Perspective** - Individual players who join and answer questions
3. **Public Screen Perspective** - A read-only display screen for the audience (shows questions, answers, leaderboard, etc.)

All three perspectives participate in the same game session and communicate via WebSockets and REST API.

## Game Requirements

- A **quiz set** (quiz_set) must exist in the database
- The host must be logged in (authenticated user)
- The quiz set must have at least one question with answers
- Players can join using a 6-digit game code

## Database Schema

### Core Tables

#### 1. `games` Table

Stores the main game session information.

```sql
    create table public.games (
  id uuid not null default gen_random_uuid(),
      quiz_set_id uuid not null,
      game_code character varying(10) not null,
      current_players integer null default 0,
      status public.game_status null default 'waiting'::game_status,
      current_question_index integer null default 0,
      current_question_start_time timestamp with time zone null,
      game_settings jsonb null default '{}'::jsonb,
      locked boolean null default false,
      created_at timestamp with time zone null default now(),
      updated_at timestamp with time zone null default now(),
      started_at timestamp with time zone null,
      paused_at timestamp with time zone null,
      resumed_at timestamp with time zone null,
      ended_at timestamp with time zone null,
      user_id uuid null,
      constraint games_pkey primary key (id),
      constraint games_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete set null
);
```

**Status Values:**

- `waiting` - Game created, waiting for players
- `active` - Game is in progress
- `paused` - Game is paused by host
- `completed` - Game has ended

#### 2. `game_flows` Table

Tracks the current question and flow state.

```sql
create table public.game_flows (
  id uuid not null default gen_random_uuid (),
  game_id uuid not null,
  quiz_set_id uuid not null,
  total_questions integer not null default 0,
  current_question_id uuid null,
  next_question_id uuid null,
  current_question_index integer null default 0,
  current_question_start_time timestamp with time zone null,
  current_question_end_time timestamp with time zone null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint game_flows_pkey primary key (id),
  constraint fk_game_flows_games foreign KEY (game_id) references games (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_game_flows_game_id on public.game_flows using btree (game_id) TABLESPACE pg_default;

create index IF not exists idx_game_flows_quiz_set_id on public.game_flows using btree (quiz_set_id) TABLESPACE pg_default;

create trigger update_game_flows_updated_at BEFORE
update on game_flows for EACH row
execute FUNCTION update_updated_at_column ();
```

#### 3. `players` Table

Stores all players who have joined the game.

```sql
create table public.players (
  id uuid not null default gen_random_uuid (),
  device_id character varying(100) null,
  game_id uuid not null,
  player_name character varying(100) not null,
  is_logged_in boolean not null default false,
  is_host boolean not null default false,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint players_pkey primary key (id),
  constraint fk_players_games foreign KEY (game_id) references games (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_players_game_id on public.players using btree (game_id) TABLESPACE pg_default;

create index IF not exists idx_players_device_id on public.players using btree (device_id) TABLESPACE pg_default;

create index IF not exists idx_players_game_device on public.players using btree (game_id, device_id) TABLESPACE pg_default;

create trigger update_players_updated_at BEFORE
update on players for EACH row
execute FUNCTION update_updated_at_column ();

create trigger update_game_player_count_trigger
after INSERT
or DELETE on players for EACH row
execute FUNCTION update_game_player_count ();
```

#### 4. `game_player_data` Table

Stores player scores and answer history.

```sql
create table public.game_player_data (
  id uuid not null default gen_random_uuid (),
  player_id uuid not null,
  player_device_id character varying(100) not null,
  game_id uuid not null,
  score integer not null default 0,
  answer_report jsonb null default '{}'::jsonb,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint game_player_data_pkey primary key (id),
  constraint fk_gpd_games foreign KEY (game_id) references games (id) on delete CASCADE,
  constraint fk_gpd_players foreign KEY (player_id) references players (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_gpd_game_score on public.game_player_data using btree (game_id, score desc) TABLESPACE pg_default;

create index IF not exists idx_gpd_player_game on public.game_player_data using btree (player_id, game_id) TABLESPACE pg_default;

create index IF not exists idx_gpd_device_game on public.game_player_data using btree (player_device_id, game_id) TABLESPACE pg_default;

create trigger update_game_player_data_updated_at BEFORE
update on game_player_data for EACH row
execute FUNCTION update_updated_at_column ();
```

**answer_report Structure:**

```json
{
  "total_answers": 5,
  "correct_answers": 3,
  "incorrect_answers": 2,
  "questions": [
    {
      "question_id": "uuid",
      "question_index": 1,
      "answer_id": "uuid",
      "is_correct": true,
      "time_taken": 5.2,
      "points_earned": 85,
      "answered_at": "2024-01-01T12:00:00Z"
    }
  ],
  "streaks": {
    "current_streak": 2,
    "max_streak": 3
  }
}
```

## Complete Game Flow

### Phase 1: Game Creation (Host)

1. **Host clicks "Start Game" in Dashboard**
   - Location: `/dashboard` page
   - Action: Click "ゲームを開始" button on a quiz set card
   - Requirements:
     - Host must be logged in
     - Quiz set must exist and be valid
     - Quiz set must have at least one question

2. **Backend Game Creation**
   - API Call: `POST /games`
   - Request Body:
     ```json
     {
       "quiz_set_id": "uuid",
       "game_settings": {
         "show_question_only": true,
         "show_explanation": true,
         "time_bonus": true,
         "streak_bonus": true,
         "show_correct_answer": false,
         "max_players": 400
       },
       "device_id": "device-uuid",
       "player_name": "Host"
     }
     ```
   - Backend Actions:
     - Creates `games` record with:
       - Unique 6-digit `game_code` (generated from quiz_set.play_settings.code or auto-generated)
       - `status` = 'waiting'
       - `user_id` = host's user ID
       - `quiz_set_id` = selected quiz set
     - Creates `game_flows` record with:
       - `game_id` = new game ID
       - `quiz_set_id` = selected quiz set
       - `total_questions` = count of questions in quiz set
       - `current_question_index` = 0
     - Creates `players` record for host:
       - `is_host` = true
       - `player_name` = "Host" or custom name
       - `device_id` = host's device ID
     - Creates `game_player_data` record for host (initialized with score = 0)
     - Creates WebSocket room (identified by `game_id`)
   - Response:
     ```json
     {
       "game": {
         "id": "uuid",
         "game_code": "123456",
         "status": "waiting",
         ...
       },
       "host_player": {
         "id": "uuid",
         "player_name": "Host",
         ...
       }
     }
     ```

3. **Host Redirected to Waiting Room**
   - URL: `/host-waiting-room?code={game_code}&quizId={quiz_id}&gameId={game_id}`
   - Page: `src/app/(pages)/host-waiting-room/page.tsx`
   - Actions:
     - Host joins WebSocket room (using `game_id`)
     - Displays game code for players to join
     - Shows list of joined players (updates in real-time)
     - Host can:
       - Lock/unlock the room
       - View player list
       - Kick players (BAN)
       - Open public screen in new window
       - Start the game

### Phase 2: Player Joining

1. **Player Navigates to Join Page**
   - URL: `/join`
   - Page: `src/app/(pages)/join/page.tsx`
   - Player enters:
     - Name (required, 1+ characters)
     - Room code (required, 6 digits)

2. **Player Redirected to Waiting Room**
   - URL: `/waiting-room?name={player_name}&code={room_code}`
   - Page: `src/app/(pages)/waiting-room/page.tsx`
   - Actions:
     - Resolve `game_id` from `room_code`:
       - Check sessionStorage: `game_{room_code}`
       - If not found, call API: `GET /games/by-code/{room_code}`
     - Join game via API: `POST /games/{game_id}/join`
       - Request Body:
         ```json
         {
           "player_name": "Player Name",
           "device_id": "device-uuid"
         }
         ```
       - Backend creates:
         - `players` record (if not exists for this device+game)
         - `game_player_data` record (if not exists)
       - Response: `{ success: true, player: {...}, message: "..." }`
     - Store `player_id` in sessionStorage: `player_{game_id}_{device_id}`
     - Join WebSocket room (using `game_id`)
     - Listen for game start events
     - Display waiting message until host starts game

3. **Real-time Player Updates**
   - WebSocket Events:
     - `room:user-joined` - New player joined
     - `room:user-left` - Player left
     - `game:player-kicked` - Player was kicked by host
     - `game:room-locked` - Room lock status changed
   - Host sees updated player list in real-time

### Phase 3: Game Start

1. **Host Clicks "Start Game" in Waiting Room**
   - Location: `/host-waiting-room` page
   - Action: Click "クイズを開始" button
   - Confirmation modal appears (shows player count, settings)

2. **Host Confirms Start**
   - API Call: `POST /games/{game_id}/start`
   - Backend Actions:
     - Updates `games.status` = 'active'
     - Sets `games.started_at` = current timestamp
     - Emits WebSocket events:
       - `game:started` to all room participants
       - `game:phase:change` with phase = 'countdown'
   - Host Redirected: `/game-host?gameId={game_id}&phase=countdown`
   - Players Redirected: `/game-player?gameId={game_id}&phase=countdown&playerId={player_id}`

### Phase 4: Question Flow (Repeats for Each Question)

#### 4.1 Countdown Phase

**All Perspectives:**

- Duration: 3 seconds
- Display: Countdown animation (3, 2, 1)
- Purpose: Prepare players for next question

**Host:**

- Page: `/game-host?phase=countdown`
- Auto-transitions to question phase after countdown

**Player:**

- Page: `/game-player?phase=countdown`
- Receives countdown start timestamp via WebSocket
- Syncs countdown timer with server

**Public Screen:**

- Shows countdown animation
- No controls

#### 4.2 Question Display Phase (Host Control Panel)

**Host:**

- Page: `/game-host?phase=question`
- Actions:
  - Click "問題を開始" button
  - API Call: `POST /games/{game_id}/questions/start`
    - Request Body:
      ```json
      {
        "questionId": "uuid",
        "questionIndex": 0
      }
      ```
  - Backend Actions:
    - Updates `game_flows`:
      - `current_question_id` = question ID
      - `current_question_index` = question index
      - `current_question_start_time` = current timestamp
      - `current_question_end_time` = start_time + question duration
    - Emits WebSocket event: `game:question:started`
      ```json
      {
        "roomId": "game_id",
        "question": {
          "id": "question_id",
          "index": 0
        },
        "startsAt": 1234567890,
        "endsAt": 1234567890
      }
      ```
  - Host sees:
    - Question content (text, image)
    - Answer choices
    - Timer countdown
    - Player list with current answers
    - Answer distribution statistics
    - Leaderboard
  - Controls:
    - "答えを表示" - Reveal answers
    - "一時停止" / "再開" - Pause/resume game
    - "次へ" - Move to next phase

**Player:**

- Page: `/game-player?phase=question`
- Receives `game:question:started` event
- Displays:
  - Question text and image
  - Answer choices (A, B, C, D)
  - Timer showing remaining time
  - Question number (e.g., "Question 1 of 10")
- Timer syncs with server timestamps
- After question display time expires, transitions to answering phase

#### 4.3 Answering Phase (Player Only)

**Player:**

- Page: `/game-player?phase=answering`
- Duration: `question.answering_time` seconds (separate from display time)
- Actions:
  - Select an answer choice
  - Click submit or auto-submit when time expires
  - API Call: `POST /games/{game_id}/players/{player_id}/answer`
    - Request Body:
      ```json
      {
        "question_id": "uuid",
        "question_number": 1,
        "answer_id": "uuid",
        "is_correct": true,
        "time_taken": 5.2,
        "points_earned": 85
      }
      ```
  - Backend Actions:
    - Validates answer (checks if `answer_id` matches correct answer)
    - Calculates points (if not provided):
      - Base points: `question.points`
      - Time bonus/penalty: Based on `time_bonus` setting
      - Streak bonus: Based on `streak_bonus` setting and current streak
    - Updates `game_player_data`:
      - Increments `score` by `points_earned`
      - Updates `answer_report` JSONB with new answer entry
    - Emits WebSocket events:
      - `game:answer:accepted` to player (confirmation)
      - `game:answer:stats:update` to all (aggregate counts)
  - Player sees:
    - Selected answer highlighted
    - "回答済み" (Answered) status
    - Cannot change answer after submission

**Point Calculation:**

- Formula depends on game settings:
  - **Normal Mode**: `basePoints` if correct, `0` if incorrect
  - **Time Bonus Mode**: `basePoints - (timeTaken * (basePoints / answeringTime))`
  - **Streak Bonus Mode**: `basePoints * (1 + min(streak, 5) * 0.1)`
  - **Combined Mode**: `(basePoints - timePenalty) * streakMultiplier`
- Points are calculated client-side for preview, but server is authoritative

#### 4.4 Answer Reveal Phase

**Trigger:**

- Host clicks "答えを表示" button, OR
- Timer expires (auto-reveal)

**Host Action:**

- API Call: `POST /games/{game_id}/questions/reveal`
- Backend Actions:
  - Updates `game_flows.current_question_end_time` = current timestamp
  - Calculates answer statistics (counts per answer choice)
  - Emits WebSocket event: `game:question:ended`
    ```json
    {
      "roomId": "game_id",
      "questionId": "uuid"
    }
    ```
- Host Redirected: `/game-host?phase=answer_reveal`

**All Perspectives:**

- Display:
  - Correct answer highlighted
  - Answer statistics (percentage of players who chose each option)
  - Player's own answer (if player perspective)
  - Whether player was correct/incorrect
  - Points earned (if player perspective)

**Host:**

- Sees full answer distribution
- Can see individual player answers
- Analytics panel shows:
  - Total answered
  - Answer rate percentage
  - Answer distribution chart

**Player:**

- Sees:
  - Their selected answer
  - Correct answer
  - Whether they were correct
  - Points earned for this question
  - Answer statistics

**Public Screen:**

- Shows:
  - Question and correct answer
  - Answer distribution (bar chart)
  - No player-specific information

#### 4.5 Leaderboard Phase (Not on Final Question)

**Trigger:**

- Host clicks "次へ" after answer reveal
- Only shown if NOT the final question

**Host Action:**

- Host clicks "次へ" button
- Phase changes to 'leaderboard'
- Emits WebSocket event: `game:phase:change` with phase = 'leaderboard'

**All Perspectives:**

- Display:
  - Current leaderboard (top players by score)
  - Player's current rank
  - Rank changes (up/down arrows)
  - Score differences
- Duration: ~5 seconds (configurable)

**Leaderboard Data:**

- API Call: `GET /games/{game_id}/leaderboard`
- Response:
  ```json
  [
    {
      "player_id": "uuid",
      "player_name": "Player Name",
      "score": 1250,
      "rank": 1,
      "total_answers": 5,
      "correct_answers": 4,
      "accuracy": 80
    }
  ]
  ```

#### 4.6 Explanation Phase

**Trigger:**

- Host clicks "次へ" after leaderboard (or after answer reveal if no leaderboard)
- Only shown if question has `explanation_text`

**All Perspectives:**

- Display:
  - Explanation title (if available)
  - Explanation text
  - Explanation image (if available)
  - Question number
- Duration: ~5 seconds (configurable)

**Host:**

- Can skip explanation if not available
- Clicks "次へ" to continue

#### 4.7 Next Question or End Game

**Host Action:**

- After explanation (or leaderboard if no explanation), host clicks "次へ"
- API Call: `POST /games/{game_id}/questions/next`
- Backend Actions:
  - Checks if more questions exist
  - If more questions:
    - Updates `game_flows.current_question_index` += 1
    - Sets `game_flows.current_question_id` = next question ID
    - Clears `current_question_start_time` and `current_question_end_time`
    - Emits `game:phase:change` with phase = 'countdown'
    - Returns: `{ isComplete: false, nextQuestion: {...} }`
  - If no more questions:
    - Sets `games.status` = 'completed'
    - Sets `games.ended_at` = current timestamp
    - Emits `game:phase:change` with phase = 'podium'
    - Returns: `{ isComplete: true }`

**Flow Continues:**

- If more questions: Return to Phase 4.1 (Countdown)
- If no more questions: Proceed to Phase 5 (Podium)

### Phase 5: Podium (Final Results)

**Trigger:**

- All questions completed
- Host clicks "次へ" after final question's explanation

**All Perspectives:**

- Display:
  - Top 3 players (Gold, Silver, Bronze)
  - Animated reveal (one by one with suspense)
  - Winner celebration
  - Full leaderboard after animation

**Host:**

- Page: `/game-host?phase=podium`
- After animation completes (5 seconds), transitions to 'ended' phase

**Player:**

- Page: `/game-player?phase=podium`
- Sees their final rank and score
- Can see full leaderboard

**Public Screen:**

- Shows podium with top 3 players
- Full leaderboard display

### Phase 6: Game End

**Host:**

- Page: `/game-host?phase=ended`
- Options:
  - "ルームを閉じる" (Dismiss Room) - Returns to dashboard
  - "新しいゲームを開始" (Start New Game) - Returns to dashboard to create new game
- Analytics available (future feature)

**Player:**

- Page: `/game-player?phase=ended`
- Display:
  - Final score
  - Final rank
  - Full leaderboard
  - Answer report summary
- Options:
  - "ホームに戻る" (Return Home)
  - "新しいゲームに参加" (Join New Game)

## WebSocket Events

### Client → Server Events

1. **`room:join`** - Join a game room

   ```json
   { "roomId": "game_id" }
   ```

2. **`room:leave`** - Leave a game room

   ```json
   { "roomId": "game_id" }
   ```

3. **`game:question:started`** - Host starts a question (also emitted by server)

   ```json
   {
     "roomId": "game_id",
     "question": { "id": "uuid", "index": 0 },
     "startsAt": 1234567890,
     "endsAt": 1234567890
   }
   ```

4. **`game:question:ended`** - Host ends a question (also emitted by server)

   ```json
   {
     "roomId": "game_id",
     "questionId": "uuid"
   }
   ```

5. **`game:answer:submit`** - Player submits answer (also sent via REST API)

   ```json
   {
     "roomId": "game_id",
     "playerId": "uuid",
     "questionId": "uuid",
     "answer": "answer_id"
   }
   ```

6. **`game:phase:change`** - Host changes game phase

   ```json
   {
     "roomId": "game_id",
     "phase": "countdown" | "question" | "answer_reveal" | "leaderboard" | "explanation" | "podium"
   }
   ```

7. **`game:started`** - Host starts the game

   ```json
   {
     "roomId": "game_id",
     "roomCode": "123456"
   }
   ```

8. **`game:pause`** - Host pauses the game

   ```json
   {
     "gameId": "game_id",
     "timestamp": "2024-01-01T12:00:00Z"
   }
   ```

9. **`game:resume`** - Host resumes the game

   ```json
   {
     "gameId": "game_id",
     "timestamp": "2024-01-01T12:00:00Z"
   }
   ```

10. **`game:end`** - Host ends the game
    ```json
    {
      "gameId": "game_id",
      "timestamp": "2024-01-01T12:00:00Z"
    }
    ```

### Server → Client Events

1. **`game:started`** - Game has started

   ```json
   {
     "roomId": "game_id",
     "roomCode": "123456",
     "startedAt": 1234567890
   }
   ```

2. **`game:phase:change`** - Phase changed

   ```json
   {
     "roomId": "game_id",
     "phase": "countdown",
     "startedAt": 1234567890
   }
   ```

3. **`game:question:started`** - Question started

   ```json
   {
     "roomId": "game_id",
     "question": { "id": "uuid", "index": 0 },
     "startsAt": 1234567890,
     "endsAt": 1234567890
   }
   ```

4. **`game:question:ended`** - Question ended

   ```json
   {
     "roomId": "game_id",
     "questionId": "uuid"
   }
   ```

5. **`game:answer:accepted`** - Answer submission accepted

   ```json
   {
     "roomId": "game_id",
     "playerId": "uuid",
     "questionId": "uuid",
     "submittedAt": "2024-01-01T12:00:00Z"
   }
   ```

6. **`game:answer:stats:update`** - Answer statistics updated

   ```json
   {
     "roomId": "game_id",
     "questionId": "uuid",
     "counts": {
       "answer_id_1": 10,
       "answer_id_2": 5,
       "answer_id_3": 3,
       "answer_id_4": 2
     }
   }
   ```

7. **`game:leaderboard:update`** - Leaderboard updated

   ```json
   {
     "roomId": "game_id"
   }
   ```

8. **`game:room-locked`** - Room lock status changed

   ```json
   {
     "gameId": "game_id",
     "locked": true
   }
   ```

9. **`game:player-kicked`** - Player was kicked

   ```json
   {
     "player_id": "uuid",
     "player_name": "Player Name",
     "game_id": "game_id",
     "kicked_by": "host_id",
     "timestamp": "2024-01-01T12:00:00Z"
   }
   ```

10. **`room:user-joined`** - User joined room

    ```json
    {
      "socketId": "socket_id",
      "roomId": "game_id"
    }
    ```

11. **`room:user-left`** - User left room
    ```json
    {
      "socketId": "socket_id",
      "roomId": "game_id"
    }
    ```

## API Endpoints

### Game Management

- `POST /games` - Create new game
- `GET /games/{gameId}` - Get game details
- `GET /games/by-code/{gameCode}` - Get game by room code
- `GET /games/{gameId}/state` - Get current game state
- `POST /games/{gameId}/start` - Start the game
- `PATCH /games/{gameId}/status` - Update game status (pause/resume/end)
- `PATCH /games/{gameId}/lock` - Lock/unlock room

### Question Management

- `GET /games/{gameId}/questions/current` - Get current question with full metadata
- `POST /games/{gameId}/questions/start` - Start a question
- `POST /games/{gameId}/questions/reveal` - Reveal answers
- `POST /games/{gameId}/questions/next` - Advance to next question

### Player Management

- `POST /games/{gameId}/join` - Join game as player
- `GET /games/{gameId}/players` - Get all players
- `GET /games/{gameId}/players/{playerId}/stats` - Get player statistics
- `PATCH /games/{gameId}/players/{playerId}` - Update player info
- `DELETE /games/{gameId}/players/{playerId}` - Kick player
- `POST /games/{gameId}/players/{playerId}/data` - Initialize player data

### Answer Submission

- `POST /games/{gameId}/players/{playerId}/answer` - Submit answer
- `GET /games/{gameId}/players/{playerId}/answers` - Get player's answers

### Leaderboard

- `GET /games/{gameId}/leaderboard` - Get leaderboard
- `GET /games/{gameId}/results` - Get final results (alias for leaderboard)

## Page Routes

### Host Routes

- `/dashboard` - Quiz management and game creation
- `/host-waiting-room` - Waiting room before game starts
- `/game-host` - Main game control panel
- `/host-question-screen` - Question display (legacy, may be merged)
- `/host-answer-screen` - Answer reveal (legacy)
- `/host-leaderboard-screen` - Leaderboard (legacy)
- `/host-explanation-screen` - Explanation (legacy)
- `/host-podium-screen` - Podium (legacy)
- `/host-control-panel` - Control panel (legacy, may be merged)
- `/host-screen` - Public screen view

### Player Routes

- `/join` - Join game page
- `/waiting-room` - Player waiting room
- `/game-player` - Main player game page (handles all phases)
- `/player-question-screen` - Question display (legacy)
- `/player-answer-screen` - Answer selection (legacy)
- `/player-answer-reveal-screen` - Answer reveal (legacy)
- `/player-leaderboard-screen` - Leaderboard (legacy)
- `/player-explanation-screen` - Explanation (legacy)
- `/player-podium-screen` - Podium (legacy)

## State Management

### Game Phases

1. **waiting** - Game created, waiting for players
2. **countdown** - 3-second countdown before question
3. **question** - Question display phase (host) / Question viewing (player)
4. **answering** - Answer selection phase (player only)
5. **answer_reveal** - Answers revealed
6. **leaderboard** - Leaderboard displayed (not on final question)
7. **explanation** - Explanation shown
8. **podium** - Final results with winners
9. **ended** - Game completed

### Phase Transitions

```
waiting → countdown → question → answering → answer_reveal → [leaderboard] → explanation → [next question or podium] → ended
```

- `[leaderboard]` - Only shown if NOT final question
- `explanation` - Only shown if question has explanation
- After final question: `answer_reveal` → `explanation` → `podium` → `ended`

## Scoring System

### Point Calculation

Points are calculated based on:

1. **Base Points**: `question.points` (default: 100)
2. **Time Bonus**: Enabled if `game_settings.time_bonus = true`
   - Formula: `basePoints - (timeTaken * (basePoints / answeringTime))`
   - Faster answers = more points
3. **Streak Bonus**: Enabled if `game_settings.streak_bonus = true`
   - Formula: `basePoints * (1 + min(streak, 5) * 0.1)`
   - Max streak: 5 (50% bonus)
   - Streak resets on incorrect answer

### Answer Validation

- Server validates all answers (client calculation is for preview only)
- Answer must be submitted within `question.answering_time` seconds
- Late answers receive 0 points (even if correct)
- No answer = 0 points

## Reconnection Handling

### Player Reconnection

1. Player refreshes page or reconnects
2. Check sessionStorage for `player_{gameId}_{deviceId}`
3. If found, use existing `player_id`
4. If not found, check API for existing player with same `device_id` and `game_id`
5. If player exists, restore state
6. If player doesn't exist, rejoin game
7. Sync current game phase from server
8. Rejoin WebSocket room

### State Synchronization

- On reconnect, fetch current game state: `GET /games/{gameId}/state`
- Determine current phase from:
  - `game.status` = 'completed' → 'ended'
  - `gameFlow.current_question_end_time` exists → 'answer_reveal'
  - `gameFlow.current_question_start_time` exists → 'question'
  - `game.status` = 'active' → 'countdown'
  - Otherwise → 'waiting'

## Error Handling

### Common Errors

1. **Game Not Found**
   - Error: `join_game_failed`
   - Action: Redirect to join page

2. **Room Locked**
   - Error: `join_game_failed` with message containing "locked"
   - Action: Show locked message, prevent join

3. **Game Already Started**
   - Error: `join_game_failed` with message containing "started"
   - Action: Allow join but sync to current phase

4. **Connection Lost**
   - Action: Auto-reconnect, restore state from server
   - Show reconnection indicator

5. **Player Kicked**
   - Event: `game:player-kicked`
   - Action: Clear session data, redirect to join page

## Performance Considerations

### Optimization Strategies

1. **Lightweight Player Events**: Minimal data for mobile devices
2. **Batch Processing**: Aggregate answers before broadcasting
3. **Connection Pooling**: Efficient WebSocket management
4. **Caching**: Store frequently accessed data in sessionStorage
5. **Polling Fallback**: Use REST API polling if WebSocket fails

### Scalability Targets

- **Concurrent Players**: 300-400 per session
- **Response Time**: <400ms for critical actions
- **Uptime**: 99.9% during festival hours
- **Data Transfer**: Minimize bandwidth usage

## Security Considerations

### Data Protection

- Player answers encrypted in transit (HTTPS/WSS)
- Secure WebSocket connections (WSS)
- Rate limiting on API endpoints
- Input validation and sanitization

### Anti-Cheating

- Server-side answer validation (authoritative)
- Timestamp verification for answer submission
- Connection monitoring
- Suspicious activity detection (future)

## Future Enhancements

1. **Analytics Dashboard**: Post-game analytics for host
2. **Replay System**: Ability to replay game sessions
3. **Team Mode**: Support for team-based gameplay
4. **Power-ups**: Special abilities for players
5. **Custom Themes**: Customizable game appearance
6. **Multi-language Support**: Support for multiple languages
7. **Accessibility**: Screen reader support, keyboard navigation
