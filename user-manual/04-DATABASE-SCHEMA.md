# Database Schema Documentation

## Table of Contents

1. [Overview](#overview)
2. [Entity Relationship Diagram](#entity-relationship-diagram)
3. [Active Tables](#active-tables)
4. [Analytics & Debugging Tables](#analytics--debugging-tables)
5. [Relationships](#relationships)
6. [Indexes](#indexes)
7. [Data Types](#data-types)
8. [Enums & Types](#enums--types)

---

## Overview

TUIZ uses **Supabase (PostgreSQL)** as its database. The database schema is managed through migrations in the backend repository. This document describes the complete database structure including both actively used tables and tables reserved for future analytics and debugging.

### Database System

- **Type**: PostgreSQL (via Supabase)
- **Location**: Managed by Supabase
- **Access**: Through Supabase client SDK and REST API
- **RLS**: Row Level Security enabled on all tables

### Table Categories

**Active Tables** (Currently Used):

- `profiles` - User profiles
- `quiz_sets` - Quiz definitions
- `questions` - Questions within quizzes
- `answers` - Answer choices for questions
- `games` - Active game sessions
- `players` - Players in game sessions
- `game_flows` - Game flow state tracking
- `game_player_data` - Player scores and answer reports

**Analytics & Debugging Tables** (Future Use):

- `websocket_connections` - WebSocket connection tracking
- `device_sessions` - Device session history
- `game_events` - Game event logging
- `room_participants` - Enhanced room participation tracking

---

## Entity Relationship Diagram

```
┌──────────────┐
│   profiles   │
└──────┬───────┘
       │
       │ 1:N
       │
       ▼
┌──────────────┐
│  quiz_sets   │
└──────┬───────┘
       │
       │ 1:N             1:N
       │                  │
       ▼                 ▼
┌──────────────┐  ┌──────────────┐
│  questions   │  │    games     │
└──────┬───────┘  └──────┬───────┘
       │                 │
       │ 1:N             │ 1:N
       │                 │
       ▼                 ▼
┌──────────────┐  ┌──────────────┐
│   answers    │  │   players    │
└──────────────┘  └──────┬───────┘
                         │
                         │ 1:1
                         │
                         ▼
                 ┌──────────────┐
                 │ game_flows   │
                 └──────────────┘
                         │
                         │ 1:N
                         │
                         ▼
                 ┌──────────────┐
                 │game_player_  │
                 │    data      │
                 └──────────────┘

┌─────────────────────────────────────┐
│  Analytics & Debugging Tables        │
│  (Future Use)                        │
├─────────────────────────────────────┤
│  websocket_connections              │
│  device_sessions                    │
│  game_events                        │
│  room_participants                  │
└─────────────────────────────────────┘
```

---

## Active Tables

### profiles

User profile information linked to Supabase auth.

| Column       | Type         | Constraints                     | Description                  |
| ------------ | ------------ | ------------------------------- | ---------------------------- |
| id           | uuid         | PRIMARY KEY, FK → auth.users.id | User ID (matches auth.users) |
| username     | varchar(50)  | UNIQUE                          | Unique username (3+ chars)   |
| display_name | varchar(100) | NOT NULL                        | Display name (1+ chars)      |
| role         | user_role    | NOT NULL, DEFAULT 'player'      | User role enum               |
| avatar_url   | text         |                                 | Avatar image URL             |
| created_at   | timestamptz  | NOT NULL, DEFAULT NOW()         | Creation timestamp           |
| updated_at   | timestamptz  | NOT NULL, DEFAULT NOW()         | Update timestamp             |
| last_active  | timestamptz  |                                 | Last active timestamp        |
| deleted_at   | timestamptz  |                                 | Soft delete timestamp        |

**User Roles:**

- `player`: Regular player
- `host`: Quiz creator/host
- `admin`: Administrator

**Frontend Usage:**

- Accessed via `useAuthStore` after login
- Used for displaying user information
- Updated through profile service

---

### quiz_sets

Quiz definitions created by users.

| Column           | Type             | Constraints                 | Description                 |
| ---------------- | ---------------- | --------------------------- | --------------------------- |
| id               | uuid             | PRIMARY KEY                 | Quiz ID                     |
| user_id          | uuid             | FK → profiles.id, NOT NULL  | Creator user ID             |
| title            | varchar(200)     | NOT NULL                    | Quiz title (1-200 chars)    |
| description      | text             | NOT NULL                    | Quiz description (1+ chars) |
| thumbnail_url    | text             |                             | Thumbnail image URL         |
| is_public        | boolean          | NOT NULL, DEFAULT false     | Public visibility           |
| difficulty_level | difficulty_level | NOT NULL, DEFAULT 'easy'    | Difficulty enum             |
| category         | varchar(100)     | NOT NULL, DEFAULT 'General' | Category                    |
| total_questions  | integer          | NOT NULL, DEFAULT 0         | Question count              |
| times_played     | integer          | NOT NULL, DEFAULT 0         | Play count                  |
| status           | quiz_status      | NOT NULL, DEFAULT 'draft'   | Status enum                 |
| tags             | text[]           | DEFAULT '{}'                | Array of tags               |
| last_played_at   | timestamptz      |                             | Last played timestamp       |
| play_settings    | jsonb            | NOT NULL, DEFAULT '{}'      | Play configuration          |
| cloned_from      | uuid             | FK → quiz_sets.id           | Original quiz if cloned     |
| deleted_at       | timestamptz      |                             | Soft delete timestamp       |
| created_at       | timestamptz      | NOT NULL, DEFAULT NOW()     | Creation timestamp          |
| updated_at       | timestamptz      | NOT NULL, DEFAULT NOW()     | Update timestamp            |

**Quiz Status:**

- `draft`: Not published
- `published`: Published and playable
- `archived`: Archived

**Difficulty Levels:**

- `easy`
- `medium`
- `hard`
- `expert`

**Play Settings (JSONB):**

```json
{
  "code": 123456,
  "show_question_only": true,
  "show_explanation": true,
  "time_bonus": false,
  "streak_bonus": false,
  "show_correct_answer": true,
  "max_players": 400
}
```

**Frontend Usage:**

- Managed through `quizLibraryService`
- Displayed in quiz library
- Created through quiz creation flow

---

### questions

Questions within quizzes.

| Column                | Type             | Constraints                 | Description                |
| --------------------- | ---------------- | --------------------------- | -------------------------- |
| id                    | uuid             | PRIMARY KEY                 | Question ID                |
| question_set_id       | uuid             | FK → quiz_sets.id, NOT NULL | Parent quiz ID             |
| question_text         | text             | NOT NULL                    | Question text (1+ chars)   |
| question_type         | question_type    | NOT NULL                    | Question type enum         |
| image_url             | text             |                             | Question image URL         |
| show_question_time    | integer          | NOT NULL, DEFAULT 10        | Time to show (seconds)     |
| answering_time        | integer          | NOT NULL, DEFAULT 30        | Time to answer (seconds)   |
| show_explanation_time | integer          | NOT NULL, DEFAULT 5         | Explanation time (seconds) |
| points                | integer          | NOT NULL, DEFAULT 1         | Points value               |
| difficulty            | difficulty_level | NOT NULL, DEFAULT 'easy'    | Difficulty                 |
| order_index           | integer          | NOT NULL                    | Question order (0+)        |
| explanation_title     | varchar(200)     |                             | Explanation title          |
| explanation_text      | text             |                             | Explanation text           |
| explanation_image_url | text             |                             | Explanation image URL      |
| deleted_at            | timestamptz      |                             | Soft delete timestamp      |
| created_at            | timestamptz      | NOT NULL, DEFAULT NOW()     | Creation timestamp         |
| updated_at            | timestamptz      | NOT NULL, DEFAULT NOW()     | Update timestamp           |

**Question Types:**

- `multiple_choice`: Multiple choice (2-4 options)
- `true_false`: True/False (2 options)

**Frontend Usage:**

- Created in quiz creation flow
- Displayed in game screens
- Fetched via `gameApi.getCurrentQuestion()`

---

### answers

Answer choices for questions.

| Column      | Type        | Constraints                 | Description            |
| ----------- | ----------- | --------------------------- | ---------------------- |
| id          | uuid        | PRIMARY KEY                 | Answer ID              |
| question_id | uuid        | FK → questions.id, NOT NULL | Parent question ID     |
| answer_text | text        | NOT NULL                    | Answer text (1+ chars) |
| image_url   | text        |                             | Answer image URL       |
| is_correct  | boolean     | NOT NULL, DEFAULT false     | Correct answer flag    |
| order_index | integer     | NOT NULL                    | Answer order (0+)      |
| deleted_at  | timestamptz |                             | Soft delete timestamp  |
| created_at  | timestamptz | NOT NULL, DEFAULT NOW()     | Creation timestamp     |
| updated_at  | timestamptz | NOT NULL, DEFAULT NOW()     | Update timestamp       |

**Constraints:**

- True/False questions: exactly 2 answers
- Multiple choice: 2-4 answers
- Exactly one correct answer per question

**Frontend Usage:**

- Created with questions
- Displayed as choices in game
- Used for answer validation

---

### games

Active game sessions.

| Column                      | Type        | Constraints                 | Description            |
| --------------------------- | ----------- | --------------------------- | ---------------------- |
| id                          | uuid        | PRIMARY KEY                 | Game ID                |
| user_id                     | uuid        | FK → profiles.id            | Host user ID           |
| quiz_set_id                 | uuid        | FK → quiz_sets.id, NOT NULL | Quiz being played      |
| game_code                   | varchar(10) | UNIQUE, NOT NULL            | Room code for joining  |
| current_players             | integer     | DEFAULT 0                   | Current player count   |
| status                      | game_status | DEFAULT 'waiting'           | Game status enum       |
| current_question_index      | integer     | DEFAULT 0                   | Current question index |
| current_question_start_time | timestamptz |                             | Question start time    |
| game_settings               | jsonb       | DEFAULT '{}'                | Game configuration     |
| locked                      | boolean     | DEFAULT false               | Room lock status       |
| created_at                  | timestamptz | DEFAULT NOW()               | Creation timestamp     |
| updated_at                  | timestamptz | DEFAULT NOW()               | Update timestamp       |
| started_at                  | timestamptz |                             | Game start time        |
| paused_at                   | timestamptz |                             | Game pause time        |
| resumed_at                  | timestamptz |                             | Game resume time       |
| ended_at                    | timestamptz |                             | Game end time          |

**Game Statuses:**

- `waiting`: Waiting for players
- `active`: Game in progress
- `paused`: Game paused
- `finished`: Game completed

**Frontend Usage:**

- Created when host starts game
- Accessed via `gameApi`
- Status tracked in `useGameFlow` hook

---

### game_flows

Game flow state tracking (1:1 with games).

| Column                      | Type        | Constraints                 | Description            |
| --------------------------- | ----------- | --------------------------- | ---------------------- |
| id                          | uuid        | PRIMARY KEY                 | Flow ID                |
| game_id                     | uuid        | FK → games.id, NOT NULL     | Game ID                |
| quiz_set_id                 | uuid        | FK → quiz_sets.id, NOT NULL | Quiz ID                |
| total_questions             | integer     | NOT NULL, DEFAULT 0         | Total questions        |
| current_question_id         | uuid        | FK → questions.id           | Current question       |
| next_question_id            | uuid        | FK → questions.id           | Next question          |
| current_question_index      | integer     | DEFAULT 0                   | Current question index |
| current_question_start_time | timestamptz |                             | Question start time    |
| current_question_end_time   | timestamptz |                             | Question end time      |
| created_at                  | timestamptz | NOT NULL, DEFAULT NOW()     | Creation timestamp     |
| updated_at                  | timestamptz | NOT NULL, DEFAULT NOW()     | Update timestamp       |

**Frontend Usage:**

- Managed by `useGameFlow` hook
- Synced via WebSocket
- Used for question progression

---

### players

Players in a game session (lightweight, guest-friendly).

| Column       | Type         | Constraints             | Description        |
| ------------ | ------------ | ----------------------- | ------------------ |
| id           | uuid         | PRIMARY KEY             | Player ID          |
| device_id    | varchar(100) |                         | Device identifier  |
| game_id      | uuid         | FK → games.id, NOT NULL | Game ID            |
| player_name  | varchar(100) | NOT NULL                | Player name        |
| is_logged_in | boolean      | NOT NULL, DEFAULT false | Login status       |
| is_host      | boolean      | NOT NULL, DEFAULT false | Host flag          |
| created_at   | timestamptz  | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at   | timestamptz  | NOT NULL, DEFAULT NOW() | Update timestamp   |

**Frontend Usage:**

- Created when player joins
- Listed in waiting room
- Tracked via `gameApi.getPlayers()`

---

### game_player_data

Player scores and answer reports (stores all answer data as JSONB).

| Column           | Type         | Constraints               | Description          |
| ---------------- | ------------ | ------------------------- | -------------------- |
| id               | uuid         | PRIMARY KEY               | Player data ID       |
| player_id        | uuid         | FK → players.id, NOT NULL | Player ID            |
| player_device_id | varchar(100) | NOT NULL                  | Device ID            |
| game_id          | uuid         | FK → games.id, NOT NULL   | Game ID              |
| score            | integer      | NOT NULL, DEFAULT 0       | Total score          |
| answer_report    | jsonb        | DEFAULT '{}'              | Complete answer data |
| created_at       | timestamptz  | NOT NULL, DEFAULT NOW()   | Creation timestamp   |
| updated_at       | timestamptz  | NOT NULL, DEFAULT NOW()   | Update timestamp     |

**Answer Report Structure (JSONB):**

```json
{
  "total_answers": 5,
  "correct_answers": 4,
  "incorrect_answers": 1,
  "questions": [
    {
      "question_id": "uuid",
      "question_number": 1,
      "answer_id": "uuid",
      "is_correct": true,
      "time_taken": 4.2,
      "points_earned": 10,
      "answered_at": "2025-01-08T12:00:00Z"
    }
  ],
  "streaks": {
    "current_streak": 3,
    "max_streak": 4
  },
  "timing": {
    "average_response_time": 3.5,
    "fastest_response": 1.2,
    "slowest_response": 8.9
  },
  "rank_history": [
    {
      "question_number": 1,
      "rank": 5,
      "score": 10,
      "points_earned": 10,
      "timestamp": "2025-01-08T12:00:00Z"
    }
  ]
}
```

**Frontend Usage:**

- Created via `gameApi.submitAnswer()`
- Used for leaderboard calculation
- Tracked in `useGameAnswer` hook
- Leaderboard fetched via `gameApi.getLeaderboard()`

**Note:** This table replaces separate `game_answers` and `game_results` tables. All answer data is stored in the `answer_report` JSONB field.

---

## Analytics & Debugging Tables

These tables are created and populated but are primarily used for future analytics, debugging, and system monitoring. They are not directly accessed by the frontend application.

### websocket_connections

Tracks active and historical WebSocket connections.

| Column          | Type              | Constraints                | Description                |
| --------------- | ----------------- | -------------------------- | -------------------------- |
| id              | uuid              | PRIMARY KEY                | Connection ID              |
| socket_id       | varchar(255)      | NOT NULL                   | Socket.IO connection ID    |
| device_id       | varchar(255)      | NOT NULL                   | Device identifier          |
| user_id         | uuid              | FK → auth.users.id         | User ID (if authenticated) |
| connected_at    | timestamptz       | NOT NULL, DEFAULT NOW()    | Connection time            |
| disconnected_at | timestamptz       |                            | Disconnection time         |
| last_heartbeat  | timestamptz       | NOT NULL, DEFAULT NOW()    | Last heartbeat             |
| reconnect_count | integer           | NOT NULL, DEFAULT 0        | Reconnection count         |
| ip_address      | varchar(45)       |                            | IP address                 |
| user_agent      | text              |                            | User agent string          |
| metadata        | jsonb             | DEFAULT '{}'               | Additional metadata        |
| status          | connection_status | NOT NULL, DEFAULT 'active' | Connection status          |

**Status Values:**

- `active`: Currently connected
- `disconnected`: Disconnected
- `timeout`: Connection timed out

**Purpose:**

- Connection audit trail
- Reconnection tracking
- Analytics on connection patterns
- Debugging connection issues

**Frontend Usage:** Not directly accessed by frontend

---

### device_sessions

Tracks device session history for user identification and analytics.

| Column              | Type         | Constraints             | Description                |
| ------------------- | ------------ | ----------------------- | -------------------------- |
| id                  | uuid         | PRIMARY KEY             | Session ID                 |
| device_id           | varchar(255) | UNIQUE, NOT NULL        | Device identifier          |
| user_id             | uuid         | FK → auth.users.id      | User ID (if authenticated) |
| first_seen          | timestamptz  | NOT NULL, DEFAULT NOW() | First connection time      |
| last_seen           | timestamptz  | NOT NULL, DEFAULT NOW() | Last connection time       |
| total_connections   | integer      | NOT NULL, DEFAULT 0     | Total connections          |
| total_reconnections | integer      | NOT NULL, DEFAULT 0     | Total reconnections        |
| browser_fingerprint | varchar(255) |                         | Browser fingerprint hash   |
| metadata            | jsonb        | DEFAULT '{}'            | Additional metadata        |

**Purpose:**

- Device identification across sessions
- Usage pattern analytics
- Multi-device detection
- User behavior tracking

**Frontend Usage:** Not directly accessed by frontend

---

### game_events

Logs all game actions and events for replay, analytics, debugging, and cheat detection.

| Column          | Type         | Constraints             | Description     |
| --------------- | ------------ | ----------------------- | --------------- |
| id              | uuid         | PRIMARY KEY             | Event ID        |
| game_id         | uuid         | FK → games.id, NOT NULL | Game ID         |
| event_type      | varchar(100) | NOT NULL                | Event type      |
| socket_id       | varchar(255) |                         | Socket ID       |
| device_id       | varchar(255) |                         | Device ID       |
| player_id       | uuid         | FK → players.id         | Player ID       |
| user_id         | uuid         | FK → auth.users.id      | User ID         |
| timestamp       | timestamptz  | NOT NULL, DEFAULT NOW() | Event timestamp |
| action          | varchar(255) | NOT NULL                | Action name     |
| payload         | jsonb        | DEFAULT '{}'            | Event payload   |
| sequence_number | integer      | NOT NULL                | Sequence number |

**Event Types:**

- `game:started`
- `game:ended`
- `game:paused`
- `game:resumed`
- `question:started`
- `question:ended`
- `answer:submitted`
- `player:joined`
- `player:left`
- `player:kicked`

**Purpose:**

- Game replay functionality
- Analytics on game flow
- Debugging game issues
- Cheat detection
- Event auditing

**Frontend Usage:** Not directly accessed by frontend

---

### room_participants

Enhanced room membership tracking with detailed connection history (complements players table).

| Column    | Type              | Constraints                | Description         |
| --------- | ----------------- | -------------------------- | ------------------- |
| id        | uuid              | PRIMARY KEY                | Participation ID    |
| game_id   | uuid              | FK → games.id, NOT NULL    | Game ID             |
| socket_id | varchar(255)      | NOT NULL                   | Socket ID           |
| device_id | varchar(255)      | NOT NULL                   | Device ID           |
| player_id | uuid              | FK → players.id, NOT NULL  | Player ID           |
| user_id   | uuid              | FK → auth.users.id         | User ID             |
| joined_at | timestamptz       | NOT NULL, DEFAULT NOW()    | Join time           |
| left_at   | timestamptz       |                            | Leave time          |
| role      | varchar(50)       | NOT NULL, DEFAULT 'player' | Participant role    |
| status    | connection_status | NOT NULL, DEFAULT 'active' | Connection status   |
| metadata  | jsonb             | DEFAULT '{}'               | Additional metadata |

**Roles:**

- `host`: Game host
- `player`: Regular player
- `spectator`: Spectator
- `moderator`: Moderator

**Purpose:**

- Enhanced participation tracking
- Connection quality monitoring
- Multi-server deployment support
- Analytics on participation patterns

**Frontend Usage:** Not directly accessed by frontend

---

## Relationships

### One-to-Many Relationships

1. **profiles → quiz_sets**
   - One user can create many quizzes
   - Foreign key: `quiz_sets.user_id`

2. **quiz_sets → questions**
   - One quiz contains many questions
   - Foreign key: `questions.question_set_id`

3. **questions → answers**
   - One question has many answer choices
   - Foreign key: `answers.question_id`

4. **quiz_sets → games**
   - One quiz can be played in many games
   - Foreign key: `games.quiz_set_id`

5. **profiles → games**
   - One user can host many games
   - Foreign key: `games.user_id`

6. **games → players**
   - One game has many players
   - Foreign key: `players.game_id`

7. **games → game_flows**
   - One game has one flow state (1:1)
   - Foreign key: `game_flows.game_id`

8. **players → game_player_data**
   - One player has one data record per game
   - Foreign key: `game_player_data.player_id`

9. **games → game_player_data**
   - One game has many player data records
   - Foreign key: `game_player_data.game_id`

### Analytics Table Relationships

10. **games → game_events**
    - One game has many events
    - Foreign key: `game_events.game_id`

11. **players → game_events**
    - One player generates many events
    - Foreign key: `game_events.player_id`

12. **games → room_participants**
    - One game has many participants
    - Foreign key: `room_participants.game_id`

13. **players → room_participants**
    - One player can have multiple participation records
    - Foreign key: `room_participants.player_id`

---

## Indexes

### Primary Indexes

- All tables have `id` as PRIMARY KEY (UUID)

### Foreign Key Indexes

**Active Tables:**

- `quiz_sets.user_id`
- `questions.question_set_id`
- `answers.question_id`
- `games.user_id`
- `games.quiz_set_id`
- `players.game_id`
- `game_flows.game_id`
- `game_flows.quiz_set_id`
- `game_player_data.player_id`
- `game_player_data.game_id`

**Analytics Tables:**

- `websocket_connections.user_id`
- `device_sessions.user_id`
- `game_events.game_id`
- `game_events.player_id`
- `room_participants.game_id`
- `room_participants.player_id`

### Unique Indexes

- `profiles.username` (UNIQUE, WHERE deleted_at IS NULL)
- `games.game_code` (UNIQUE)
- `device_sessions.device_id` (UNIQUE)

### Performance Indexes

**Quiz System:**

- `quiz_sets.user_id` (WHERE deleted_at IS NULL)
- `quiz_sets.status` (WHERE deleted_at IS NULL)
- `quiz_sets.is_public` (WHERE deleted_at IS NULL AND status = 'published')
- `quiz_sets.category` (WHERE deleted_at IS NULL)
- `quiz_sets.difficulty_level` (WHERE deleted_at IS NULL)
- `quiz_sets.created_at DESC` (WHERE deleted_at IS NULL)
- `quiz_sets.times_played DESC` (WHERE deleted_at IS NULL)
- `quiz_sets.tags` (GIN index for array search)
- `questions.question_set_id` (WHERE deleted_at IS NULL)
- `questions.order_index` (composite with question_set_id)
- `answers.question_id` (WHERE deleted_at IS NULL)
- `answers.order_index` (composite with question_id)
- `answers.is_correct` (composite with question_id)

**Game System:**

- `games.quiz_set_id`
- `games.status`
- `players.game_id`
- `players.device_id`
- `players.game_id, device_id` (composite)
- `game_flows.game_id`
- `game_flows.quiz_set_id`
- `game_player_data.game_id, score DESC` (for leaderboard)
- `game_player_data.player_id, game_id` (composite)
- `game_player_data.player_device_id, game_id` (composite)

**Analytics Tables:**

- `websocket_connections.device_id`
- `websocket_connections.user_id`
- `websocket_connections.status`
- `websocket_connections.connected_at DESC`
- `websocket_connections.socket_id`
- `websocket_connections.device_id, status` (composite, WHERE status = 'active')
- `device_sessions.user_id`
- `device_sessions.last_seen DESC`
- `game_events.game_id`
- `game_events.timestamp DESC`
- `game_events.event_type`
- `game_events.player_id`
- `game_events.game_id, sequence_number` (composite, for replay)
- `room_participants.game_id`
- `room_participants.device_id`
- `room_participants.socket_id`
- `room_participants.player_id`
- `room_participants.status`
- `room_participants.game_id, status` (composite, WHERE status = 'active')

---

## Data Types

### UUID

- Used for all primary keys
- Generated by database using `gen_random_uuid()`
- Format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

### Text / VARCHAR

- Used for strings of variable length
- VARCHAR with length limits where specified
- TEXT for unlimited length

### Integer

- Used for counts, indices, and numeric values
- 32-bit signed integer
- Constraints: `>= 0` for counts and indices

### Boolean

- Used for flags and status indicators
- `true` or `false`
- Default values specified

### Timestamp (TIMESTAMPTZ)

- Used for date/time values
- Stored in UTC
- Format: ISO 8601
- Default: `NOW()`

### Text Array (TEXT[])

- Used for tags in quizzes
- PostgreSQL array type
- Example: `['education', 'science', 'quiz']`
- GIN index for efficient search

### JSONB

- Used for flexible data structures
- `play_settings` in quiz_sets
- `game_settings` in games
- `answer_report` in game_player_data
- `metadata` in analytics tables
- `payload` in game_events

---

## Enums & Types

### user_role

```sql
CREATE TYPE user_role AS ENUM ('player', 'host', 'admin');
```

### quiz_status

```sql
CREATE TYPE quiz_status AS ENUM ('draft', 'published', 'archived');
```

### difficulty_level

```sql
CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard', 'expert');
```

### question_type

```sql
CREATE TYPE question_type AS ENUM ('multiple_choice', 'true_false');
```

### game_status

```sql
CREATE TYPE game_status AS ENUM ('waiting', 'active', 'paused', 'finished');
```

### connection_status

```sql
CREATE TYPE connection_status AS ENUM ('active', 'disconnected', 'timeout');
```

---

## Frontend Data Access Patterns

### Reading Data

1. **Quiz Library**

   ```typescript
   // Fetch user's quizzes
   quizLibraryService.getMyQuizzes();

   // Fetch public quizzes
   quizLibraryService.getPublicQuizzes();
   ```

2. **Game Data**

   ```typescript
   // Get game by room code
   gameApi.getGameByCode(roomCode);

   // Get current question
   gameApi.getCurrentQuestion(gameId);

   // Get players
   gameApi.getPlayers(gameId);
   ```

3. **Leaderboard**
   ```typescript
   // Get leaderboard (from game_player_data)
   gameApi.getLeaderboard(gameId);
   ```

### Writing Data

1. **Quiz Creation**

   ```typescript
   // Create quiz
   quizLibraryService.createQuiz(quizData);

   // Update quiz
   quizLibraryService.updateQuiz(quizId, updates);
   ```

2. **Game Actions**

   ```typescript
   // Create game
   gameApi.createGame(quizSetId);

   // Submit answer (stored in game_player_data.answer_report)
   gameApi.submitAnswer(gameId, answerData);
   ```

### Real-time Updates

- WebSocket events update game state
- No direct database access from frontend
- All updates go through backend API
- Analytics tables populated by backend services

---

## Important Notes

### Table Naming

- **Backend uses**: `quiz_sets` (not `quizzes`)
- **Frontend may reference**: Both `quiz_id` and `quiz_set_id` (for compatibility)
- **Actual column**: `games.quiz_set_id` (references `quiz_sets.id`)

### Answer Storage

- **No separate `game_answers` table**
- Answers stored in `game_player_data.answer_report` (JSONB)
- Each answer submission updates the JSONB structure
- Leaderboard calculated from `game_player_data` table

### Results Storage

- **No separate `game_results` table**
- Results calculated from `game_player_data` table
- Leaderboard queries aggregate from `game_player_data`
- Rank history stored in `answer_report.rank_history`

### Soft Deletes

- Most tables use `deleted_at` for soft deletes
- Queries filter with `WHERE deleted_at IS NULL`
- Indexes include `WHERE deleted_at IS NULL` for performance

### Analytics Tables

- Tables exist and are populated by backend
- Not directly accessed by frontend
- Used for:
  - System monitoring
  - Connection analytics
  - Game replay
  - Debugging
  - Future analytics dashboards

---

## Security Considerations

### Row Level Security (RLS)

All tables have RLS enabled with policies:

- Users can only access their own quizzes
- Public quizzes are readable by all authenticated users
- Game data accessible to participants only
- Analytics tables: Service role only (or admin access)

### Frontend Security

- No direct database access
- All operations through authenticated API
- Session tokens stored securely
- Device IDs for anonymous players
- Service role used for backend operations

---

**Last Updated**: January 2026
**Version**: 2.0
