# Backend-Frontend Integration Verification

## Overview

This document verifies that all backend and frontend components are properly linked for the answer reveal phase implementation.

## API Endpoint Verification

### 1. Answer Reveal Endpoint

**Backend Route**: `POST /games/:gameId/questions/reveal`

- **Location**: `tuiz-backend/src/routes/game-state.ts` (line 281-395)
- **Middleware**: `authMiddleware` (requires authentication)
- **Request**: No body required
- **Response**:
  ```typescript
  {
    message: string;
    gameFlow: GameFlow;
    answerStats?: Record<string, number>;
  }
  ```

**Frontend Call**: `gameApi.revealAnswer(gameId)`

- **Location**: `tuiz-frontend/src/services/gameApi.ts` (line 405-413)
- **Method**: `POST`
- **Endpoint**: `/games/${gameId}/questions/reveal`
- **Expected Response**: Matches backend response ✓

**Status**: ✅ **VERIFIED** - Endpoint paths match, response structure matches

### 2. Answer Submission Endpoint

**Backend Route**: `POST /games/:gameId/players/:playerId/answer`

- **Location**: `tuiz-backend/src/routes/game-player-data.ts` (line 73-130)
- **Middleware**: Public (no auth required)
- **Request Body** (SubmitAnswerSchema):
  ```typescript
  {
    question_id: string (UUID)
    question_number: number (int, min 1)
    answer_id: string (UUID) | null
    is_correct: boolean (optional, ignored)
    time_taken: number (min 0, seconds)
    points_earned: number (optional, ignored)
  }
  ```

**Frontend Call**: `gameApi.submitAnswer(...)`

- **Location**: `tuiz-frontend/src/services/gameApi.ts` (line 532-553)
- **Request Body**: Matches backend schema exactly ✓

**Status**: ✅ **VERIFIED** - Request structure matches backend schema

## WebSocket Event Verification

### Backend Events Emitted

#### 1. `game:question:ended`

- **Emitted By**: `tuiz-backend/src/routes/game-state.ts` (line 367-370)
- **Payload**:
  ```typescript
  {
    roomId: string;
    questionId: string;
  }
  ```
- **When**: After answer reveal API call succeeds

#### 2. `game:answer:locked`

- **Emitted By**: `tuiz-backend/src/routes/game-state.ts` (line 373-377)
- **Payload**:
  ```typescript
  {
    roomId: string;
    questionId: string;
    counts?: Record<string, number>;
  }
  ```
- **When**: After answer reveal with final statistics

#### 3. `game:answer:stats:update`

- **Emitted By**:
  - `tuiz-backend/src/routes/game-state.ts` (line 380-384) - On reveal
  - `tuiz-backend/src/routes/game-player-data.ts` (line 102-106) - On answer submission
  - `tuiz-backend/src/services/websocket/WebSocketManager.ts` (line 483-487) - On answer submit via WebSocket
- **Payload**:
  ```typescript
  {
    roomId: string;
    questionId: string;
    counts: Record<string, number>;
  }
  ```
- **When**: Real-time updates as answers are submitted, and final update on reveal

#### 4. `game:answer:stats` (Legacy/Alternative)

- **Emitted By**: `tuiz-backend/src/routes/game-player-data.ts` (line 102-106)
- **Payload**: Same as `game:answer:stats:update`
- **When**: On answer submission (for backward compatibility)

### Frontend Event Listeners

#### Host Control Panel (`game-host/page.tsx`)

- ✅ Listens: `game:answer:stats:update` (line 172)
- ✅ Updates: `answerStats` state
- ✅ Uses: For analytics display

#### Public Screen (`host-screen/page.tsx`)

- ✅ Listens: `game:answer:stats:update` (line 311)
- ✅ Listens: `game:question:ended` (line 251-258)
- ✅ Listens: `game:answer:locked` (line 260-268)
- ✅ Updates: `answerStats` state and transitions to `answer_reveal` phase

#### Player (`game-player/page.tsx`)

- ✅ Listens: `game:answer:stats:update` (line 486)
- ✅ Listens: `game:answer:stats` (line 487) - Legacy support
- ✅ Listens: `game:answer:locked` (line 488)
- ✅ Listens: `game:question:ended` (via `useGameFlow` hook)
- ✅ Updates: `answerStats` state and transitions to `answer_reveal` phase

#### useGameFlow Hook

- ✅ Listens: `game:question:ended` (line 752)
- ✅ Triggers: `onQuestionEnd` callback
- ✅ Updates: Timer state

#### useGameAnswer Hook

- ✅ Listens: `game:answer:stats:update` (line 471)
- ✅ Listens: `game:answer:stats` (line 472) - Legacy support
- ✅ Updates: Answer statistics

**Status**: ✅ **VERIFIED** - All events properly connected

## Data Structure Verification

### Answer Statistics Calculation

**Backend Logic** (`game-state.ts` lines 335-362):

```typescript
// Aggregates from game_player_data.answer_report.questions[]
// Filters by question_id === currentQuestionId
// Counts occurrences of each answer_id
answerStats = {
  "answer_id_1": count1,
  "answer_id_2": count2,
  ...
}
```

**Frontend Logic** (`game-player/page.tsx` lines 880-888):

```typescript
// Receives counts via WebSocket
// Calculates percentages: (count / totalAnswered) * 100
statistics = choices.map((choice) => ({
  choiceId: choice.id,
  count: answerStats[choice.id] || 0,
  percentage: totalAnswered > 0 ? (count / totalAnswered) * 100 : 0,
}));
```

**Status**: ✅ **VERIFIED** - Calculation logic matches

### Answer Locking Validation

**Backend Logic** (`gamePlayerDataService.ts` lines 282-306):

```typescript
// Checks game_flows.current_question_end_time
// Rejects if question has ended (with 1 second grace period)
if (gameFlow.current_question_end_time && now > endTime + 1000) {
  return { success: false, error: 'Question has ended. Answers are locked.' };
}
```

**Frontend Logic**:

- Frontend doesn't need to validate (backend is authoritative)
- Frontend shows error message if submission fails

**Status**: ✅ **VERIFIED** - Backend validates, frontend handles errors

## Error Handling Verification

### Backend Error Responses

**Reveal Endpoint Errors**:

- `404` - Game not found or unauthorized
- `404` - Game flow not found
- `400` - No active question to reveal
- `500` - Update failed or server error

**Submit Answer Errors**:

- `400` - Invalid payload (validation error)
- `400` - Question already answered
- `400` - Question has ended (answers locked)
- `404` - Player data not found
- `500` - Server error

### Frontend Error Handling

**Reveal Answer** (`useGameFlow.ts` lines 377-403):

- ✅ Catches API errors
- ✅ Shows error message via `onError` callback
- ✅ Throws error for caller to handle

**Submit Answer** (`useGameAnswer.ts` lines 229-240):

- ✅ Catches API errors
- ✅ Shows error message
- ✅ Allows retry if not already answered

**Status**: ✅ **VERIFIED** - Error handling is consistent

## Route Registration Verification

### Backend Routes

**Main App** (`tuiz-backend/src/app.ts`):

- ✅ `gameStateRoutes` registered at `/games` (line 56)
- ✅ Route: `POST /games/:gameId/questions/reveal` → `game-state.ts` router

**Route Definition** (`tuiz-backend/src/routes/game-state.ts`):

- ✅ Router: `Router()` (line 11)
- ✅ Route: `router.post('/:gameId/questions/reveal', ...)` (line 281)

**Status**: ✅ **VERIFIED** - Routes properly registered

### Frontend API Client

**Base URL** (`tuiz-frontend/src/config/config.ts`):

- ✅ Development: `http://localhost:8080`
- ✅ Production: `process.env.NEXT_PUBLIC_API_BASE` or `https://tuiz-info-king-backend.onrender.com`

**API Client** (`tuiz-frontend/src/services/gameApi.ts`):

- ✅ Uses: `cfg.apiBase` from config
- ✅ Endpoint: `/games/${gameId}/questions/reveal`
- ✅ Full URL: `${baseUrl}/games/${gameId}/questions/reveal`

**Status**: ✅ **VERIFIED** - API client properly configured

## WebSocket Connection Verification

### Backend WebSocket Manager

**Server Setup** (`tuiz-backend/src/server.ts`):

- ✅ Socket.IO server initialized (line 43)
- ✅ WebSocketManager created (line 66)
- ✅ Exported as `wsManager` (line 69)

**Event Broadcasting** (`tuiz-backend/src/routes/game-state.ts`):

- ✅ Uses: `wsManager.broadcastToRoom(gameId, event, payload)`
- ✅ Events: `game:question:ended`, `game:answer:locked`, `game:answer:stats:update`

**Status**: ✅ **VERIFIED** - WebSocket events properly broadcast

### Frontend WebSocket Connection

**Socket Provider** (`tuiz-frontend/src/components/providers/SocketProvider.tsx`):

- ✅ Connects to backend WebSocket server
- ✅ Uses: `cfg.apiBase` for connection URL
- ✅ Handles: Connection, disconnection, reconnection

**Event Listeners**:

- ✅ All perspectives listen to required events
- ✅ Proper cleanup on unmount
- ✅ Event handlers match backend payload structure

**Status**: ✅ **VERIFIED** - WebSocket connection properly established

## Integration Flow Verification

### Complete Answer Reveal Flow

1. **Host Clicks "答えを表示"**
   - Frontend: `game-host/page.tsx` → `handleRevealAnswer()` (line 231)
   - Calls: `useGameFlow.revealAnswer()` (line 234)
   - API: `gameApi.revealAnswer(gameId)` (line 377)

2. **Backend Processes Request**
   - Route: `POST /games/:gameId/questions/reveal` (line 281)
   - Validates: Game ownership, game flow exists, active question
   - Updates: `game_flows.current_question_end_time`
   - Calculates: Final answer statistics
   - Emits: WebSocket events

3. **WebSocket Events Broadcast**
   - `game:question:ended` → All clients
   - `game:answer:locked` → All clients (with statistics)
   - `game:answer:stats:update` → All clients (with statistics)

4. **Frontend Receives Events**
   - Host Control Panel: Updates `answerStats`, shows enhanced analytics
   - Public Screen: Transitions to `answer_reveal`, shows `HostAnswerRevealScreen`
   - Player: Transitions to `answer_reveal`, shows `PlayerAnswerRevealScreen`

5. **Answer Reveal Display**
   - All perspectives: Show animated bar chart with statistics
   - Host/Public: Show correct answer highlighted
   - Player: Show player's answer and whether correct

**Status**: ✅ **VERIFIED** - Complete flow is properly linked

## Data Flow Verification

### Answer Statistics Flow

```
1. Players Submit Answers
   ↓
2. Backend: gamePlayerDataService.submitAnswer()
   ↓
3. Backend: Calculates answerStats from answer_report
   ↓
4. Backend: Emits game:answer:stats:update (real-time)
   ↓
5. Frontend: Receives event → Updates answerStats state
   ↓
6. Host Clicks Reveal
   ↓
7. Backend: Calculates final answerStats (all submissions)
   ↓
8. Backend: Emits game:answer:locked + game:answer:stats:update
   ↓
9. Frontend: Receives events → Updates answerStats → Shows reveal screen
```

**Status**: ✅ **VERIFIED** - Data flow is correct

## Type Safety Verification

### Backend Types

**WebSocket Events** (`tuiz-backend/src/services/websocket/types.ts`):

- ✅ `ServerEvents` interface includes all emitted events
- ✅ `game:answer:locked` defined (line 151)
- ✅ `game:answer:stats:update` defined (line 146)
- ✅ `game:answer:stats` defined (line 146) - Added for compatibility

**API Response Types**:

- ✅ `GameFlow` interface matches database schema
- ✅ `answerStats` type: `Record<string, number>`

### Frontend Types

**API Response Types** (`tuiz-frontend/src/services/gameApi.ts`):

- ✅ `revealAnswer` return type includes `answerStats?`
- ✅ `GameFlow` interface matches backend

**WebSocket Event Types**:

- ✅ Event handlers use correct payload types
- ✅ Type-safe event listeners

**Status**: ✅ **VERIFIED** - Types are consistent

## Summary

### ✅ All Integration Points Verified

1. **API Endpoints**: ✅ All endpoints match between frontend and backend
2. **Request/Response Structures**: ✅ All data structures match
3. **WebSocket Events**: ✅ All events properly connected
4. **Error Handling**: ✅ Consistent error handling on both sides
5. **Data Flow**: ✅ Complete flow is properly linked
6. **Type Safety**: ✅ Types are consistent across frontend and backend

### Changes Made

1. **Backend**:
   - ✅ Enhanced reveal endpoint with statistics calculation
   - ✅ Added WebSocket event emissions
   - ✅ Added answer locking validation
   - ✅ Added `game:answer:locked` event type
   - ✅ Added `game:answer:stats` event emission for compatibility

2. **Frontend**:
   - ✅ Removed duplicate WebSocket emission (backend handles it)
   - ✅ Updated API response type to include `answerStats`
   - ✅ All perspectives properly listen to WebSocket events
   - ✅ Enhanced analytics in host control panel

### Verification Status

**All backend and frontend components are properly linked and verified.** ✅
