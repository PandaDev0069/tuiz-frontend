# WebSocket Communication Flow

This document outlines the complete WebSocket communication patterns between Host, Public Screen, and Players during a game session.

## Communication Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   Host Control  │         │  Public Screen  │         │ Player Devices  │
│     Panel       │         │   (host-screen) │         │  (game-player)  │
└────────┬────────┘         └────────┬────────┘         └────────┬────────┘
         │                           │                           │
         │                           │                           │
         └───────────────────────────┴───────────────────────────┘
                                     │
                          ┌───────────▼───────────┐
                          │   WebSocket Server   │
                          │   (Socket.IO)        │
                          └──────────────────────┘
```

## Event Flow by Game Phase

### 1. Game Start (Waiting Room → Game Start)

**Host Action:**

- Host clicks "Start Game" in waiting room
- Emits: `game:started` event
- Backend API: `POST /games/:gameId/start`

**Events Broadcast:**

```javascript
// Emitted by host-waiting-room
socket.emit('game:started', {
  roomId: gameId,
  gameId: gameId,
  roomCode: gameCode,
});
```

**Listeners:**

- ✅ **Public Screen**: Listens to `game:started` → Transitions to `countdown` phase
- ✅ **Players**: Listen to `game:started` → Transitions to `countdown` phase
- ✅ **Host Control Panel**: Already in control, doesn't need to listen

---

### 2. Countdown Phase

**Current Implementation:**

- Host manually sets phase to `countdown` via `emitPhaseChange('countdown')`
- Public Screen and Players listen to `game:phase:change` event

**Events:**

```javascript
// Host emits
socket.emit('game:phase:change', { roomId: gameId, phase: 'countdown' });
```

**Listeners:**

- ✅ **Public Screen**: `game:phase:change` → Shows countdown screen
- ✅ **Players**: `game:phase:change` → Shows countdown screen

**Issue:** ⚠️ Countdown should auto-transition to question phase, but currently requires manual host action

---

### 3. Question Start Phase

**Host Action:**

- Host clicks "Start Question" button
- Backend API: `POST /games/:gameId/questions/start`
- `useGameFlow` hook emits: `game:question:started`

**Events:**

```javascript
// Emitted by useGameFlow hook (when host calls startQuestion)
socket.emit('game:question:started', {
  roomId: gameId,
  question: { id: questionId, index: questionIndex },
  startsAt: serverTimestamp,
  endsAt: serverEndTimestamp,
});

// Host also emits phase change
socket.emit('game:phase:change', { roomId: gameId, phase: 'question' });
```

**Listeners:**

- ✅ **Public Screen**:
  - `game:question:started` → Updates timer state
  - `game:phase:change` → Transitions to question display
- ✅ **Players**:
  - `game:question:started` → Clears previous answer, starts timer
  - `game:phase:change` → Transitions to question display
  - `useGameFlow` hook handles timer synchronization

**Answer Submission:**

```javascript
// Player emits (via useGameAnswer hook)
socket.emit('game:answer:submit', {
  roomId: gameId,
  playerId: playerId,
  questionId: questionId,
  answer: selectedOption,
});
```

---

### 4. Answer Reveal Phase

**Host Action:**

- Host clicks "Reveal Answer" button
- Backend API: `POST /games/:gameId/questions/reveal`
- `useGameFlow` hook emits: `game:question:ended`

**Events:**

```javascript
// Emitted by useGameFlow hook (when host calls revealAnswer)
socket.emit('game:question:ended', {
  roomId: gameId,
  questionId: currentQuestionId,
});

// Host also emits phase change
socket.emit('game:phase:change', { roomId: gameId, phase: 'answer_reveal' });
```

**Answer Statistics:**

```javascript
// Backend broadcasts answer statistics
socket.emit('game:answer:stats:update', {
  roomId: gameId,
  questionId: questionId,
  counts: { [answerId]: count, ... }
});
```

**Listeners:**

- ✅ **Public Screen**:
  - `game:phase:change` → Shows answer reveal with statistics
  - `game:answer:stats:update` → Updates answer statistics bar chart
- ✅ **Players**:
  - `game:phase:change` → Shows answer reveal with personal result
  - `game:answer:stats:update` → Updates statistics display
- ✅ **Host Control Panel**:
  - `game:answer:stats:update` → Updates answer statistics for analytics

---

### 5. Leaderboard Phase

**Host Action:**

- Host clicks "Next" button after answer reveal
- Host emits phase change (skipped on final question)

**Events:**

```javascript
// Host emits
socket.emit('game:phase:change', { roomId: gameId, phase: 'leaderboard' });
```

**Leaderboard Updates:**

```javascript
// Backend broadcasts (via useGameLeaderboard hook)
socket.emit('game:leaderboard:update', { roomId: gameId });
socket.emit('game:question:ended', { roomId: gameId }); // Triggers refresh
```

**Listeners:**

- ✅ **Public Screen**: `game:phase:change` → Shows leaderboard
- ✅ **Players**: `game:phase:change` → Shows leaderboard
- ✅ **Host Control Panel**: Shows leaderboard with controls

**Note:** Leaderboard is skipped on final question (goes directly to podium)

---

### 6. Explanation Phase (Optional)

**Host Action:**

- Host clicks "Next" button after leaderboard (if explanation exists)
- Host emits phase change

**Events:**

```javascript
// Host emits
socket.emit('game:phase:change', { roomId: gameId, phase: 'explanation' });
```

**Listeners:**

- ✅ **Public Screen**: `game:phase:change` → Shows explanation
- ✅ **Players**: `game:phase:change` → Shows explanation

---

### 7. Next Question / Countdown Loop

**Host Action:**

- Host clicks "Next" button after explanation/leaderboard
- Backend API: `POST /games/:gameId/questions/next`
- Host emits phase change to `countdown`

**Events:**

```javascript
// Host emits
socket.emit('game:phase:change', { roomId: gameId, phase: 'countdown' });
```

**Listeners:**

- ✅ **Public Screen**: `game:phase:change` → Shows countdown
- ✅ **Players**: `game:phase:change` → Shows countdown

**Flow repeats** until final question

---

### 8. Podium Phase (Final Question)

**Host Action:**

- After final question's answer reveal, host clicks "Next"
- Host emits phase change to `podium`

**Events:**

```javascript
// Host emits
socket.emit('game:phase:change', { roomId: gameId, phase: 'podium' });
```

**Listeners:**

- ✅ **Public Screen**: `game:phase:change` → Shows podium with winner animations
- ✅ **Players**: `game:phase:change` → Shows podium
- ✅ **Host Control Panel**: Shows podium, then transitions to game end

---

### 9. Game End Phase

**Host Action:**

- After podium animation completes, host transitions to `ended`
- Host emits phase change

**Events:**

```javascript
// Host emits
socket.emit('game:phase:change', { roomId: gameId, phase: 'ended' });
```

**Listeners:**

- ✅ **Public Screen**: `game:phase:change` → Shows game end message
- ✅ **Players**: `game:phase:change` → Shows game end message
- ✅ **Host Control Panel**: Shows game end screen with options

---

## Complete Event Summary

### Events Emitted by Host

| Event                   | When             | Payload                                  | Listeners       |
| ----------------------- | ---------------- | ---------------------------------------- | --------------- |
| `game:started`          | Game start       | `{ roomId, gameId, roomCode }`           | Public, Players |
| `game:phase:change`     | Phase transition | `{ roomId, phase }`                      | Public, Players |
| `game:question:started` | Question start   | `{ roomId, question, startsAt, endsAt }` | Public, Players |
| `game:question:ended`   | Answer reveal    | `{ roomId, questionId }`                 | Public, Players |

### Events Emitted by Backend/Server

| Event                      | When                     | Payload                          | Listeners             |
| -------------------------- | ------------------------ | -------------------------------- | --------------------- |
| `game:answer:stats:update` | Answer statistics update | `{ roomId, questionId, counts }` | Host, Public, Players |
| `game:leaderboard:update`  | Leaderboard refresh      | `{ roomId }`                     | Host, Public, Players |
| `game:player-kicked`       | Player banned            | `{ player_id, game_id, ... }`    | Players               |

### Events Emitted by Players

| Event                | When             | Payload                                    | Listeners           |
| -------------------- | ---------------- | ------------------------------------------ | ------------------- |
| `game:answer:submit` | Answer submitted | `{ roomId, playerId, questionId, answer }` | Backend (processes) |

---

## Current Implementation Status

### ✅ Working

1. **Phase Synchronization**: `game:phase:change` event properly syncs phases across all clients
2. **Question Start**: `game:question:started` with server timestamps for accurate timing
3. **Answer Statistics**: Real-time `game:answer:stats:update` for answer distribution
4. **Leaderboard Updates**: `game:leaderboard:update` triggers refresh
5. **Player Kicking**: `game:player-kicked` event redirects banned players

### ⚠️ Issues / Missing

1. **Countdown Auto-Transition**: Countdown doesn't auto-transition to question phase
   - **Current**: Host must manually click "Start Question"
   - **Expected**: Countdown completes → Auto-transition to question
   - **Fix Needed**: Add countdown completion handler that triggers question start

2. **Timer Synchronization**:
   - ✅ Server timestamps are used (`startsAt`, `endsAt`)
   - ✅ `useGameFlow` hook handles timer state
   - ⚠️ Need to verify all clients sync correctly

3. **Missing Events**:
   - ❌ No `game:pause` / `game:resume` events (implemented in hook but not used)
   - ❌ No `game:end` event (game end is handled via phase change)

4. **Room Joining**:
   - ✅ All clients join room via `room:join` event
   - ✅ All clients leave room via `room:leave` on unmount
   - ✅ Reconnection handling exists

---

## Recommended Improvements

### 1. Auto-Transition from Countdown

```typescript
// In host control panel, after countdown completes
useEffect(() => {
  if (currentPhase === 'countdown' && countdownComplete) {
    // Auto-start question
    handleStartQuestion();
  }
}, [currentPhase, countdownComplete]);
```

### 2. Add Pause/Resume Events

```typescript
// Host emits
socket.emit('game:pause', { gameId, timestamp });
socket.emit('game:resume', { gameId, timestamp });

// All clients listen
socket.on('game:pause', handlePause);
socket.on('game:resume', handleResume);
```

### 3. Add Game End Event

```typescript
// Host emits
socket.emit('game:end', { gameId, timestamp });

// All clients listen
socket.on('game:end', handleGameEnd);
```

### 4. Add Question Change Event

```typescript
// When moving to next question
socket.emit('game:question:changed', {
  roomId: gameId,
  question: { id: nextQuestionId, index: nextIndex },
});
```

---

## Testing Checklist

- [ ] Host starts game → All clients receive `game:started`
- [ ] Host changes phase → All clients sync via `game:phase:change`
- [ ] Host starts question → All clients show question with synchronized timer
- [ ] Players submit answers → Statistics update in real-time
- [ ] Host reveals answer → All clients show answer reveal
- [ ] Host moves to leaderboard → All clients show leaderboard
- [ ] Host moves to next question → All clients return to countdown
- [ ] Final question → Skips leaderboard, goes to podium
- [ ] Game ends → All clients show end screen
- [ ] Player kicked → Player redirected, others unaffected
- [ ] Reconnection → Client rejoins room and syncs state

---

## WebSocket Room Management

All clients join the same room using the `gameId`:

```typescript
// Join room
socket.emit('room:join', { roomId: gameId });

// Leave room (on unmount)
socket.emit('room:leave', { roomId: gameId });
```

This ensures all events are broadcast to all connected clients in the game session.
