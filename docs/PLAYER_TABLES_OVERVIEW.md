# Player, Device, and Socket Tables Overview

This document provides a comprehensive overview of all database tables related to players, device IDs, and socket connections in the TUIZ application.

## Table Summary

### Core Player Tables

#### 1. `players` (Core Player Identity)

**Purpose**: Lightweight player identity per game session (guest-friendly)

**Schema**:

```sql
CREATE TABLE public.players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id varchar(100),              -- Browser device ID for guest reconnection
  game_id uuid NOT NULL,               -- Foreign key to games
  player_name varchar(100) NOT NULL,   -- Display name
  is_logged_in boolean DEFAULT false,  -- Whether player is authenticated
  is_host boolean DEFAULT false,       -- Whether player is the game host
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**Key Features**:

- Supports both authenticated and guest players
- One player record per game session
- Device ID enables reconnection for guests
- Indexed on `game_id`, `device_id`, and composite `(game_id, device_id)`

**Relationships**:

- `game_id` → `games.id` (CASCADE DELETE)
- Referenced by `game_player_data.player_id`
- Referenced by `room_participants.player_id`

---

#### 2. `game_player_data` (Player Game Statistics)

**Purpose**: Per-player per-game final/ongoing stats (score + analytics)

**Schema**:

```sql
CREATE TABLE public.game_player_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL,            -- Foreign key to players
  player_device_id varchar(100) NOT NULL,  -- Device ID for quick lookups
  game_id uuid NOT NULL,              -- Foreign key to games
  score integer DEFAULT 0,            -- Current game score
  answer_report jsonb DEFAULT '{}',   -- Detailed answer analytics
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**Key Features**:

- Stores score and answer analytics per player per game
- `answer_report` JSONB structure:
  ```json
  {
    "total_answers": 10,
    "correct_answers": 8,
    "incorrect_answers": 2,
    "questions": {
      "q1": {
        "answer": "B",
        "is_correct": true,
        "time_taken": 4200,
        "answered_at": "2024-01-01T12:00:00Z"
      }
    }
  }
  ```
- Indexed for leaderboard queries: `(game_id, score DESC)`

**Relationships**:

- `player_id` → `players.id` (CASCADE DELETE)
- `game_id` → `games.id` (CASCADE DELETE)

---

### WebSocket & Connection Tables

#### 3. `websocket_connections` (Active Connection Tracking)

**Purpose**: Tracks active and historical WebSocket connections for audit, analytics, and reconnection handling

**Schema**:

```sql
CREATE TABLE public.websocket_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  socket_id varchar(255) NOT NULL,    -- Socket.IO connection identifier
  device_id varchar(255) NOT NULL,     -- Unique device identifier (format: tuiz_device_{uuid})
  user_id uuid,                        -- Optional: authenticated user ID
  connected_at timestamptz DEFAULT now(),
  disconnected_at timestamptz,        -- NULL if still connected
  last_heartbeat timestamptz DEFAULT now(),
  reconnect_count integer DEFAULT 0,   -- Number of reconnections in this session
  ip_address varchar(45),              -- IPv4 or IPv6 address
  user_agent text,                     -- Browser user agent string
  metadata jsonb DEFAULT '{}',         -- Additional connection metadata
  status connection_status DEFAULT 'active'  -- Enum: 'active', 'disconnected', 'timeout'
);
```

**Key Features**:

- Tracks all WebSocket connections (active and historical)
- Supports reconnection tracking
- Heartbeat monitoring for timeout detection
- Indexed on `device_id`, `user_id`, `status`, `socket_id`
- Composite index for active connection lookups: `(device_id, status) WHERE status = 'active'`

**Relationships**:

- `user_id` → `auth.users.id` (SET NULL on delete)

---

#### 4. `device_sessions` (Device Session History)

**Purpose**: Aggregates device session history for user identification and usage patterns

**Schema**:

```sql
CREATE TABLE public.device_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id varchar(255) UNIQUE NOT NULL,  -- Unique device identifier
  user_id uuid,                           -- Optional: authenticated user ID
  first_seen timestamptz DEFAULT now(),   -- First time device was seen
  last_seen timestamptz DEFAULT now(),    -- Last time device was active
  total_connections integer DEFAULT 0,     -- Total connections across all time
  total_reconnections integer DEFAULT 0, -- Total reconnections across all time
  browser_fingerprint varchar(255),        -- Browser fingerprint hash
  metadata jsonb DEFAULT '{}'              -- Additional device metadata
);
```

**Key Features**:

- One record per device (UNIQUE on `device_id`)
- Tracks device lifetime statistics
- Supports user-device association
- Auto-updated via triggers on `websocket_connections` insert
- Indexed on `device_id`, `user_id`, `last_seen`

**Relationships**:

- `user_id` → `auth.users.id` (SET NULL on delete)

---

#### 5. `room_participants` (Enhanced Room Membership)

**Purpose**: Enhanced tracking of room membership with detailed connection history (complements players table)

**Schema**:

```sql
CREATE TABLE public.room_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL,               -- Foreign key to games
  socket_id varchar(255) NOT NULL,    -- Current socket connection ID
  device_id varchar(255) NOT NULL,     -- Device identifier
  player_id uuid NOT NULL,             -- Foreign key to players
  user_id uuid,                        -- Optional: authenticated user ID
  joined_at timestamptz DEFAULT now(),
  left_at timestamptz,                 -- NULL if still in room
  role varchar(50) DEFAULT 'player',   -- 'host', 'player', 'spectator', 'moderator'
  status connection_status DEFAULT 'active',  -- Enum: 'active', 'disconnected', 'timeout'
  metadata jsonb DEFAULT '{}'          -- Additional participant metadata
);
```

**Key Features**:

- Tracks socket-level participation in game rooms
- Complements `players` table with connection-level details
- Supports role-based access control
- Tracks connection status (active/disconnected/timeout)
- Indexed on `game_id`, `device_id`, `socket_id`, `player_id`, `status`
- Composite index for active participants: `(game_id, status) WHERE status = 'active'`

**Relationships**:

- `game_id` → `games.id` (CASCADE DELETE)
- `player_id` → `players.id` (CASCADE DELETE)
- `user_id` → `auth.users.id` (optional)

---

#### 6. `game_events` (Game Event Logging)

**Purpose**: Logs all game actions and events for replay, analytics, debugging, and cheat detection

**Schema**:

```sql
CREATE TABLE public.game_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL,              -- Foreign key to games
  event_type varchar(100) NOT NULL,   -- Event category
  socket_id varchar(255),              -- Socket that triggered event
  device_id varchar(255),               -- Device that triggered event
  player_id uuid,                      -- Optional: player who triggered event
  user_id uuid,                        -- Optional: authenticated user
  timestamp timestamptz DEFAULT now(),
  action varchar(255) NOT NULL,       -- Specific action name
  payload jsonb DEFAULT '{}',         -- Event-specific data
  sequence_number integer NOT NULL     -- Auto-incrementing sequence per game
);
```

**Key Features**:

- Complete audit trail of all game events
- Ordered sequence for replay capability
- Supports event replay and debugging
- Indexed on `game_id`, `timestamp`, `event_type`, `player_id`
- Composite index for ordered replay: `(game_id, sequence_number)`

**Relationships**:

- `game_id` → `games.id` (CASCADE DELETE)
- `player_id` → `players.id` (SET NULL on delete)

---

## Table Relationships Diagram

```
┌─────────────────┐
│     games       │
│  (game_id)      │
└────────┬────────┘
         │
         ├─────────────────────────────────────┐
         │                                     │
         ▼                                     ▼
┌─────────────────┐                  ┌──────────────────┐
│    players      │                  │  game_player_data│
│  (player_id)    │◄─────────────────┤  (player_id)     │
│  device_id      │                  │  player_device_id│
└────────┬────────┘                  └──────────────────┘
         │
         │
         ▼
┌──────────────────────┐
│  room_participants   │
│  (player_id)         │
│  socket_id           │
│  device_id           │
│  game_id             │
└──────────────────────┘

┌──────────────────────┐
│ websocket_connections│
│  device_id           │
│  socket_id           │
│  user_id             │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│   device_sessions     │
│   device_id (UNIQUE)  │
│   user_id            │
└──────────────────────┘

┌──────────────────────┐
│    game_events       │
│    game_id            │
│    player_id          │
│    device_id          │
│    socket_id          │
└──────────────────────┘
```

## Key Concepts

### Device ID Flow

1. **Frontend**: Generates/retrieves device ID from `localStorage` (format: `tuiz_device_{uuid}`)
2. **WebSocket Connection**: Device ID sent on connection via `ws:connect` event
3. **Backend**:
   - Creates/updates `websocket_connections` record
   - Auto-updates `device_sessions` via trigger
   - Links to `players` table via `device_id`

### Player Join Flow

1. **Player enters room code** → Frontend gets `gameId` from sessionStorage or API
2. **Join Game API** (`POST /games/:gameId/players`):
   - Creates `players` record with `device_id`, `game_id`, `player_name`
   - Creates `game_player_data` record (initialized with score 0)
   - Returns player object
3. **WebSocket Connection**:
   - Player connects with `device_id` and `game_id`
   - Backend creates `room_participants` record
   - Backend creates `websocket_connections` record
   - Emits `room:user-joined` event to all room participants

### Player Leave Flow

1. **WebSocket Disconnect**:
   - Updates `room_participants.status` to 'disconnected'
   - Updates `websocket_connections.status` to 'disconnected'
   - Sets `disconnected_at` timestamp
   - Emits `room:user-left` event
2. **Player Deletion** (optional):
   - Can delete `players` record (CASCADE deletes `game_player_data` and `room_participants`)

## Services

### Backend Services

1. **`playerService`** (`src/services/playerService.ts`)
   - `createPlayer()` - Create new player
   - `getPlayers()` - Get all players in a game
   - `getPlayer()` - Get single player
   - `updatePlayer()` - Update player data
   - `deletePlayer()` - Delete player

2. **`roomParticipantService`** (`src/services/roomParticipantService.ts`)
   - `addParticipant()` - Add participant to room
   - `getParticipantBySocketId()` - Get participant by socket ID
   - `updateParticipantStatus()` - Update connection status
   - `getActiveParticipants()` - Get all active participants in a game

3. **`gamePlayerDataService`** (`src/services/gamePlayerDataService.ts`)
   - `createPlayerData()` - Initialize player data
   - `updateScore()` - Update player score
   - `updateAnswerReport()` - Update answer analytics
   - `getLeaderboard()` - Get game leaderboard

4. **WebSocket Services** (`src/services/websocket/`)
   - `WebSocketManager` - Manages socket connections
   - `ConnectionStore` - In-memory connection tracking
   - `WebSocketPersistence` - Database persistence for connections

## Frontend Integration Points

### Player Waiting Room Requirements

1. **Join Game Flow**:
   - Get `gameId` from URL params or sessionStorage
   - Get `deviceId` from `useDeviceId()` hook
   - Call `gameApi.joinGame(gameId, playerName, deviceId)`
   - Store returned `playerId` in state

2. **WebSocket Connection**:
   - Connect to socket with `deviceId` and `gameId`
   - Listen for `room:user-joined` and `room:user-left` events
   - Listen for `game:started` event to redirect to game
   - Listen for `game:room-locked` event for room status

3. **Real-time Updates**:
   - Player list updates via WebSocket events
   - Room lock status updates
   - Game start notifications

4. **State Management**:
   - `gameId` - Current game ID
   - `playerId` - Current player ID
   - `deviceId` - Device identifier
   - `playerName` - Player display name
   - `isRoomLocked` - Room lock status
   - `players` - List of players in room

## Database Functions

### Helper Functions Available

1. **`update_device_session()`** - Upsert device session on connection
2. **`record_reconnection()`** - Increment reconnection count
3. **`log_game_event()`** - Log game event with auto-incrementing sequence
4. **`get_game_leaderboard()`** - Get leaderboard for a game
5. **`get_active_connections_count()`** - Get count of active connections
6. **`get_device_reconnect_count()`** - Get reconnection count for device
7. **`mark_stale_connections()`** - Mark connections as timed out
8. **`cleanup_old_websocket_connections()`** - Cleanup old connection records

## Security & RLS Policies

All tables have Row Level Security (RLS) enabled:

- **Players**: Viewable by everyone, insertable by anyone, updatable by own device
- **Game Player Data**: Viewable by everyone, insertable/updatable by own device
- **WebSocket Connections**: Service role only (for security)
- **Device Sessions**: Service role only
- **Room Participants**: Viewable by everyone, insertable by own device
- **Game Events**: Viewable by game participants or service role

## Field Mapping Notes

### Backend vs Frontend Field Names

**Important**: There's a field name mismatch between backend and frontend:

- **Backend `players` table**: Uses `player_name` (varchar)
- **Frontend `Player` interface**: Expects `display_name` (string)
- **Frontend mapping**: Currently tries to access `player.display_name` but should use `player.player_name`

**Fix Required**: ✅ **COMPLETED** - Updated frontend mapping in:

- `host-waiting-room/page.tsx` - Fixed to use `player.player_name` and `player.created_at`
- `game-player/page.tsx` - Fixed leaderboard to use `entry.player_name`
- `game-host/page.tsx` - Fixed leaderboard to use `entry.player_name`
- `gameApi.ts` - Updated `Player` and `LeaderboardEntry` interfaces to match backend

**Additional Fields**: ✅ **FIXED** - Updated frontend `Player` interface to match backend:

- ✅ Changed `display_name` → `player_name`
- ✅ Changed `joined_at` → `created_at`
- ✅ Changed `last_active_at` → `updated_at`
- ✅ Removed non-existent fields: `avatar_url`, `score`, `streak`, `is_kicked`
- ✅ Updated `LeaderboardEntry` interface to use `player_name` instead of `display_name`

**Recommendation**: Either:

1. Update frontend to use correct field names from backend
2. Transform backend response to match frontend expectations
3. Update backend to return transformed data with aliases

## Next Steps for Player Waiting Room

1. ✅ Understand all table structures
2. ✅ Fix field mapping between backend and frontend
3. ✅ Implement player join flow with proper error handling
4. ✅ Implement WebSocket connection and room joining
5. ✅ Implement real-time player list updates (WebSocket events registered)
6. ✅ Handle room lock status
7. ✅ Handle game start event and redirect
8. ✅ Handle player reconnection scenarios
9. ✅ Add loading states and error handling

## Implementation Status

### Completed ✅

- **Field Mapping Fixed**: Updated `Player` interface in `gameApi.ts` to use `player_name` and `created_at` instead of `display_name` and `joined_at`
- **Player Join Flow**: Complete implementation with error handling
- **Database Initialization**: All required tables initialized on player join:
  - `players` table (via `joinGame` API)
  - `game_player_data` table (via `initializePlayerData` API)
  - `room_participants` table (via WebSocket `room:join` event)
  - `websocket_connections` table (via WebSocket connection)
  - `device_sessions` table (auto-updated via trigger)
- **Reconnection Handling**:
  - Checks for existing player on page load/refresh
  - Handles WebSocket reconnection with player verification
  - Automatically rejoins room if player exists
- **Error Handling**: Comprehensive error messages and user feedback
- **Loading States**: Proper loading indicators during join process
- **WebSocket Integration**: Full event listener setup for game events

### Future Enhancements (Optional)

1. **API Endpoint for Game Lookup**: Add `GET /games/by-code/:code` endpoint to backend
2. **Real-time Player Count**: Display live player count in waiting room
3. **Player List Display**: Show list of players in waiting room (for players)
4. **Connection Quality Indicator**: Show connection status to players
