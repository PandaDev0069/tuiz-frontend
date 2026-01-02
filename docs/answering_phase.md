# Answering Phase - Complete Logic Documentation

## Overview

The answering phase is a critical component of the game flow where players select and submit their answers. This document provides comprehensive details on all aspects of the answering phase, including UI behavior, validation, point calculation, and submission logic.

## Phase Entry

### Trigger

- **Automatic Transition**: After the question display phase (`show_question_time`) expires
- **Phase Name**: `answering`
- **Page Route**: `/game-player?phase=answering&gameId={gameId}&playerId={playerId}`
- **Duration**: `question.answering_time` seconds (separate from question display time)

### Initialization

When the answering phase starts:

1. **Timer Initialization**:
   - Set `answerDurationMs = answering_time * 1000` (convert to milliseconds)
   - Set `answerRemainingMs = answerDurationMs` (start with full duration)
   - Start countdown timer (decrements every 1 second)

2. **State Initialization**:
   - `selectedAnswer = null`
   - `hasAnswered = false`
   - `isProcessing = false`
   - `submittedAt = null`
   - `submittedOption = null`

3. **Answer Choices Display**:
   - Answer choices become visible and clickable
   - Layout depends on question type (see Question Types section)

## Question Types and Answer Layouts

### 1. True/False (`true_false`)

**Layout**: 2-column grid

**Options**:

- Option 1: True (○, 正しい, はい, True)
- Option 2: False (×, 間違い, いいえ, False)

**Visual Design**:

- True: Green gradient background (`from-green-500 to-green-600`)
- False: Red gradient background (`from-red-500 to-red-600`)
- Large symbols (○ or ×) displayed prominently
- Text label below symbol

**Behavior**:

- Clicking either option immediately submits the answer
- Selected option is highlighted with brightness and ring effect
- Other option is dimmed (opacity reduced)

### 2. Multiple Choice - 2 Options (`multiple_choice_2`)

**Layout**: 2-column grid

**Options**: A, B (or custom labels)

**Visual Design**:

- Each option in a card with distinct color scheme
- Letter label (A, B) displayed prominently
- Answer text below letter

**Behavior**:

- Clicking any option immediately submits
- Selected option highlighted, others dimmed

### 3. Multiple Choice - 3 Options (`multiple_choice_3`)

**Layout**: 3-column grid (or 2+1 layout on mobile)

**Options**: A, B, C

**Visual Design**:

- Three equal-width columns
- Each option in a card
- Letter and text clearly visible

**Behavior**:

- Clicking any option immediately submits
- Selected option highlighted, others dimmed

### 4. Multiple Choice - 4 Options (`multiple_choice_4`)

**Layout**: 2x2 grid (or 4-column on larger screens)

**Options**: A, B, C, D

**Visual Design**:

- Grid layout with equal spacing
- Each option in a card with letter and text
- Responsive: stacks on mobile, grid on desktop

**Behavior**:

- Clicking any option immediately submits
- Selected option highlighted, others dimmed

## Answer Selection and Submission

### Click Behavior

**Critical Design Rule**: Clicking an answer choice **immediately submits** the answer. There is:

- ❌ No confirmation dialog
- ❌ No "Submit" button
- ❌ No ability to change the answer after clicking
- ✅ Immediate submission on click

### Selection Process

1. **Player Clicks Option**:

   ```typescript
   handleAnswerSelect(answerId: string) {
     // Prevent multiple submissions
     if (isSubmitted || hasAnswered) return;

     // Set selected answer
     setSelectedAnswerId(answerId);
     setHasAnswered(true);

     // Immediately trigger submission
     onAnswerSelect(answerId);
     onAnswerSubmit();
   }
   ```

2. **Time Calculation**:

   ```typescript
   // Calculate time taken from phase start to click
   const durationMs = answerDurationMs; // Total answering time
   const remainingMs = answerRemainingMs; // Time left on timer
   const responseTimeMs = durationMs - remainingMs; // Time taken
   const timeTakenSeconds = responseTimeMs / 1000; // Convert to seconds
   ```

3. **Submit Answer**:
   - Call `submitAnswer(selectedAnswerId, responseTimeMs)`
   - This triggers the full submission flow (see Submission Logic section)

### UI State After Selection

**Immediate Visual Feedback**:

- Selected answer: Highlighted with brightness increase and ring effect
- Other answers: Dimmed (opacity reduced to ~40-70%)
- All answer buttons: Disabled (cannot be clicked again)
- Status indicator: "回答済み" (Answered) displayed

**Timer Behavior**:

- Timer continues counting down (for visual consistency)
- But answer is already locked, so timer is informational only

## Time Tracking

### Time Calculation Method

**Implementation**: Timer-based calculation (not timestamp-based)

```typescript
// When answering phase starts
const answerDurationMs = answering_time * 1000; // e.g., 30 seconds = 30000ms
setAnswerRemainingMs(answerDurationMs);

// Timer decrements every second
setInterval(() => {
  setAnswerRemainingMs((prev) => Math.max(0, prev - 1000));
}, 1000);

// When answer is clicked
const responseTimeMs = answerDurationMs - answerRemainingMs;
const timeTakenSeconds = responseTimeMs / 1000;
```

**Why Timer-Based?**

- More reliable than timestamp differences (handles clock skew)
- Consistent with visual timer display
- Easier to handle pause/resume scenarios

### Time Validation

**`answeredInTime` Check**:

```typescript
const answeredInTime = timeTakenSeconds <= answeringTime;
```

**Rules**:

- If `timeTaken <= answeringTime`: Answer is valid, points can be earned
- If `timeTaken > answeringTime`: Answer is late, 0 points (even if correct)
- If no answer selected: `timeTaken = answeringTime` (full duration), `answer_id = null`

## Answer Submission Logic

### Pre-Submission Validation

**Client-Side Checks**:

1. **Required Parameters**:

   ```typescript
   if (!gameId || !playerId || !questionId) {
     throw new Error('Missing required parameters');
   }
   ```

2. **Question Number**:

   ```typescript
   if (!questionNumber || questionNumber < 1) {
     throw new Error('Question number is required');
   }
   ```

3. **Duplicate Submission Prevention**:

   ```typescript
   if (answerStatus.hasAnswered) {
     throw new Error('Answer already submitted for this question');
   }
   ```

4. **Answer Selection**:
   - `answer_id` can be `null` (if no answer selected before timer expires)
   - If `answer_id` is provided, it must be a valid UUID from question choices

### Answer Correctness Determination

**Client-Side Calculation**:

```typescript
const isCorrect = correctAnswerId && selectedOption ? selectedOption === correctAnswerId : false;
```

**Logic**:

- Compare `selectedOption` (answer_id) with `question.correctAnswerId`
- If they match: `isCorrect = true`
- If they don't match or no answer: `isCorrect = false`
- **Note**: Server validates this independently (authoritative)

### Streak Calculation

**Current Streak Logic**:

```typescript
let currentStreak = 0;
if (answersHistory.length > 0) {
  // Count consecutive correct answers from the end
  for (let i = answersHistory.length - 1; i >= 0; i--) {
    if (answersHistory[i].is_correct) {
      currentStreak++;
    } else {
      break; // Streak broken on first incorrect answer
    }
  }
}
```

**Streak Rules**:

- Streak starts at 0 for first question
- Increments by 1 for each consecutive correct answer
- Resets to 0 on first incorrect answer
- Maximum streak: 5 (capped for bonus calculation)
- Streak is calculated from `answersHistory` (previous answers in current game)

**Example**:

- Q1: Correct → streak = 1
- Q2: Correct → streak = 2
- Q3: Incorrect → streak = 0 (reset)
- Q4: Correct → streak = 1 (starts over)

### Point Calculation (Client-Side)

**Purpose**: Preview calculation before submission (server is authoritative)

**Function**: `calculatePoints(params)`

**Parameters**:

```typescript
{
  basePoints: number; // question.points (default: 100)
  answeringTime: number; // question.answering_time (seconds)
  isCorrect: boolean; // Whether answer is correct
  timeTaken: number; // Time taken in seconds
  answeredInTime: boolean; // Whether answered within time limit
  timeBonusEnabled: boolean; // From game_settings.time_bonus
  streakBonusEnabled: boolean; // From game_settings.streak_bonus
  currentStreak: number; // Current streak count
}
```

**Calculation Steps**:

1. **Early Exit for Invalid Answers**:

   ```typescript
   if (!isCorrect || !answeredInTime) {
     return { points: 0, breakdown: {...} };
   }
   ```

2. **Base Points**:

   ```typescript
   let points = basePoints; // Start with base points
   ```

3. **Time Bonus/Penalty** (if enabled):

   ```typescript
   if (timeBonusEnabled) {
     const timePenaltyFactor = basePoints / answeringTime;
     const timePenalty = Math.min(timeTaken * timePenaltyFactor, basePoints);
     points = Math.max(0, basePoints - timePenalty);
   }
   ```

   - Formula: `basePoints - (timeTaken * (basePoints / answeringTime))`
   - Faster answers = more points
   - If `timeTaken = 0`: points = `basePoints` (full points)
   - If `timeTaken = answeringTime`: points = `0` (no points)

4. **Streak Bonus** (if enabled):

   ```typescript
   if (streakBonusEnabled) {
     const cappedStreak = Math.min(currentStreak, 5); // Max streak = 5
     const streakMultiplier = 1 + cappedStreak * 0.1; // 0.1 per streak
     points = points * streakMultiplier;
   }
   ```

   - Formula: `points * (1 + min(streak, 5) * 0.1)`
   - Max streak: 5 (50% bonus = 1.5x multiplier)
   - Applied after time penalty

5. **Final Points**:
   ```typescript
   const finalPoints = Math.round(points);
   return { points: finalPoints, breakdown: {...} };
   ```

**Point Calculation Modes**:

- **Normal Mode**: `basePoints` if correct, `0` if incorrect
- **Time Bonus Mode**: `basePoints - timePenalty` (faster = more points)
- **Streak Bonus Mode**: `basePoints * streakMultiplier` (consecutive correct = bonus)
- **Combined Mode**: `(basePoints - timePenalty) * streakMultiplier`

### Submission Request

**API Endpoint**: `POST /games/{gameId}/players/{playerId}/answer`

**Request Body**:

```json
{
  "question_id": "uuid",
  "question_number": 1,
  "answer_id": "uuid" | null,
  "is_correct": true | false,
  "time_taken": 5.2,
  "points_earned": 85
}
```

**Field Descriptions**:

- `question_id`: UUID of the current question
- `question_number`: 1-indexed question number (first question = 1)
- `answer_id`: UUID of selected answer choice, or `null` if no answer
- `is_correct`: Boolean indicating if answer is correct (client-calculated)
- `time_taken`: Time in seconds from phase start to click
- `points_earned`: Calculated points (client-calculated, server validates)

**Note**: `question_number` is 1-indexed, while `current_question_index` in `game_flows` is 0-indexed.

### Submission Process

**Step-by-Step Flow**:

1. **Set Processing State**:

   ```typescript
   setAnswerStatus((prev) => ({ ...prev, isProcessing: true }));
   ```

2. **Calculate Values**:
   - Determine `isCorrect` (compare with `correctAnswerId`)
   - Calculate `timeTakenSeconds` (from timer)
   - Check `answeredInTime` (timeTaken <= answeringTime)
   - Get `currentStreak` (from answersHistory)
   - Calculate `pointsEarned` (using point calculation function)

3. **API Call**:

   ```typescript
   const { data, error } = await gameApi.submitAnswer(
     gameId,
     playerId,
     questionId,
     questionNumber,
     selectedOption, // answer_id
     isCorrect,
     timeTakenSeconds,
     pointsEarned,
   );
   ```

4. **Handle Response**:
   - If error: Set error state, show error message, allow retry
   - If success: Update local state with server response

5. **Update State**:

   ```typescript
   setAnswerStatus({
     hasAnswered: true,
     submittedAt: new Date(),
     submittedOption: selectedOption,
     isProcessing: false,
   });
   ```

6. **Emit WebSocket Event**:

   ```typescript
   socket.emit('game:answer:submit', {
     roomId: gameId,
     playerId: playerId,
     questionId: questionId,
     answer: selectedOption,
   });
   ```

7. **Update Answer History**:
   - Add answer to `answersHistory` for streak calculation
   - Update `answerResult` with server response
   - Store answer data for answer reveal phase display

8. **State Management**:
   - Answer state persists until next question
   - `answerResult` is used in answer_reveal phase
   - `answersHistory` is maintained for streak calculation across questions

### Backend Processing

**Server Actions**:

1. **Validation**:
   - Verify `question_id` exists and is current question
   - Verify `player_id` exists and is in game
   - Verify `answer_id` is valid choice for question (if not null)
   - Verify answer not already submitted for this question

2. **Answer Validation**:
   - Server independently checks if `answer_id` matches correct answer
   - Server's `is_correct` is authoritative (may differ from client)

3. **Point Calculation** (if not provided or server recalculates):
   - Uses same formula as client
   - Server's calculated points are authoritative
   - Updates player score with server-calculated points

4. **Update Database**:
   - Update `game_player_data.score` (increment by points earned)
   - Update `game_player_data.answer_report` JSONB:
     ```json
     {
       "question_id": "uuid",
       "question_number": 1,
       "answer_id": "uuid",
       "is_correct": true,
       "time_taken": 5.2,
       "points_earned": 85,
       "answered_at": "2024-01-01T12:00:00Z"
     }
     ```

5. **Emit WebSocket Events**:
   - `game:answer:stats:update` or `game:answer:stats` to all clients (aggregate counts)
   - `game:answer:accepted` to player (confirmation - may not be implemented)
     ```json
     {
       "roomId": "game_id",
       "playerId": "player_id",
       "questionId": "question_id"
     }
     ```

**Client-Side WebSocket Listeners**:

- `game:answer:accepted`: Confirms answer was received by server
- `game:answer:stats:update` or `game:answer:stats`: Receives aggregate answer statistics
  ```json
  {
    "roomId": "game_id",
    "questionId": "question_id",
    "counts": {
      "answer_id_1": 10,
      "answer_id_2": 5,
      "answer_id_3": 3,
      "answer_id_4": 2
    }
  }
  ```

## Auto-Submit on Timeout

### Behavior

If player does not click any answer before timer expires:

1. **Timer Reaches Zero**:

   ```typescript
   if (answeringRemainingMs <= 0 && !hasAnswered) {
     // Auto-submit with null answer
     submitAnswer(null, answerDurationMs);
   }
   ```

2. **Submission Parameters**:
   - `answer_id`: `null`
   - `is_correct`: `false`
   - `time_taken`: `answering_time` (full duration)
   - `points_earned`: `0`

3. **Prevention of Multiple Auto-Submits**:
   ```typescript
   const autoSubmittingRef = useRef(false);
   if (autoSubmittingRef.current) return;
   autoSubmittingRef.current = true;
   ```

## Error Handling

### Error Scenarios

1. **Network Error**:
   - Show error message to player
   - Allow retry (if answer not yet submitted)
   - Log error for debugging

2. **Validation Error**:
   - Show specific error message
   - Prevent submission
   - Log error

3. **Server Error**:
   - Show generic error message
   - Allow retry if possible
   - Log error details

### Error Recovery

**Retry Logic**:

- If submission fails and `hasAnswered = false`:
  - Set `isProcessing = false` to allow retry
  - Show error message to player
  - Player can click answer again to retry
- If submission fails but answer was already accepted:
  - Check server state to confirm
  - If confirmed, show success state
  - If not confirmed, allow retry
- **Note**: Current implementation does NOT automatically retry
  - Error is shown to player
  - Player must manually retry by clicking answer again
  - This prevents duplicate submissions

**Error State Management**:

```typescript
catch (err) {
  const errorMessage = err instanceof Error ? err.message : 'Failed to submit answer';
  setError(errorMessage);
  setAnswerStatus(prev => ({ ...prev, isProcessing: false }));
  // Error is thrown, allowing caller to handle retry
  throw err;
}
```

## UI Behavior Details

### Visual States

1. **Initial State** (No Selection):
   - All answer choices: Enabled, normal opacity
   - Timer: Counting down
   - Status: No status indicator

2. **Selected State** (After Click):
   - Selected answer: Highlighted (brightness + ring)
   - Other answers: Dimmed (opacity ~40-70%)
   - All buttons: Disabled (cursor: not-allowed)
   - Status: "回答済み" (Answered) displayed
   - Timer: Continues (informational only)

3. **Processing State** (During Submission):
   - All buttons: Disabled
   - Loading indicator: Optional (if submission takes time)
   - Status: "送信中..." (Submitting...) or "回答済み"

4. **Submitted State** (After Success):
   - Same as Selected State
   - Status: "回答済み" (Answered)
   - No further interactions possible

### Responsive Behavior

**Mobile**:

- Answer choices stack vertically or in compact grid
- Larger touch targets for easier clicking
- Timer displayed prominently

**Desktop**:

- Answer choices in grid layout
- Hover effects on choices (before selection)
- Timer in corner or top bar

### Accessibility

- Keyboard navigation: Tab through options, Enter to select
- Screen reader: Announce selected answer
- Focus management: Focus on selected answer after click

## Validation Logic Improvements

### Current Issues

1. **Time Validation**: Only checks if `timeTaken <= answeringTime`
2. **Answer Validation**: Basic comparison only
3. **No Duplicate Prevention**: Relies on client-side state only

### Improved Validation

**Client-Side** (Pre-Submission):

1. **Time Validation**:

   ```typescript
   const answeredInTime = timeTakenSeconds <= answeringTime;
   const isValidTime = timeTakenSeconds >= 0 && timeTakenSeconds <= answeringTime * 1.1; // 10% tolerance
   ```

2. **Answer Validation**:

   ```typescript
   const isValidAnswer = selectedOption
     ? question.choices.some((c) => c.id === selectedOption)
     : true; // null is valid (no answer)
   ```

3. **Duplicate Prevention**:
   ```typescript
   if (answerStatus.hasAnswered || isProcessing) {
     return; // Prevent duplicate submission
   }
   ```

**Server-Side** (Authoritative):

1. **Question Validation**:
   - Verify question is current question
   - Verify question is in answering phase
   - Verify question hasn't ended

2. **Player Validation**:
   - Verify player is in game
   - Verify player hasn't already answered this question
   - Verify player is not host (if hosts shouldn't answer)

3. **Answer Validation**:
   - Verify answer_id is valid choice (if not null)
   - Verify answer_id belongs to current question
   - Independently calculate is_correct

4. **Time Validation**:
   - Verify time_taken is reasonable (0 to answering_time + tolerance)
   - Verify submission is within answering window
   - Check for suspicious timing (too fast, negative, etc.)

5. **Point Validation**:
   - Recalculate points server-side
   - Verify client-calculated points match (within tolerance)
   - Use server-calculated points as authoritative

## Edge Cases

### Edge Case 1: Rapid Clicks

**Scenario**: Player clicks multiple options very quickly

**Handling**:

- First click sets `hasAnswered = true`
- Subsequent clicks are ignored (early return)
- Only first click is processed

### Edge Case 2: Network Delay

**Scenario**: Click happens but network is slow

**Handling**:

- Show processing state
- Disable all interactions
- Wait for response before allowing any other actions
- If timeout, show error and allow retry

### Edge Case 3: Timer Expires During Submission

**Scenario**: Player clicks just before timer expires, submission takes time

**Handling**:

- Submission proceeds with time_taken from click moment
- Auto-submit is prevented if submission is in progress
- Server validates timing independently

### Edge Case 4: Phase Change During Submission

**Scenario**: Host reveals answers while player is submitting

**Handling**:

- Submission completes (if already sent)
- If not sent, cancel submission
- Transition to answer_reveal phase
- Show appropriate message

## Testing Considerations

### Test Cases

1. **Normal Flow**:
   - Click answer → Immediate submission → Success

2. **Timeout Flow**:
   - Wait for timer → Auto-submit with null → Success

3. **Rapid Clicks**:
   - Click multiple options quickly → Only first processed

4. **Network Error**:
   - Click answer → Network error → Error shown → Retry works

5. **Validation Errors**:
   - Invalid answer_id → Validation error → Submission prevented

6. **Time Edge Cases**:
   - Click at 0.1 seconds → Valid
   - Click at answering_time + 0.1 seconds → Late (0 points)

7. **Streak Calculation**:
   - Multiple correct → Streak increments
   - One incorrect → Streak resets

## State Management Between Questions

### Answer State Cleanup

**When New Question Starts**:

1. **Clear Answer State**:

   ```typescript
   clearAnswer() {
     setAnswerStatus({
       hasAnswered: false,
       submittedAt: null,
       submittedOption: null,
       isProcessing: false,
     });
     setAnswerResult(null);
     setError(null);
   }
   ```

2. **Refresh Answer History** (Optional):

   ```typescript
   refreshAnswers() {
     // Fetch all player answers from API
     // Updates answersHistory for streak calculation
     // May not be implemented if endpoint doesn't exist
   }
   ```

3. **Reset Selection**:
   - `selectedAnswer = null`
   - `selectedAnswerId = null`
   - All UI states reset to initial

**Answer History Persistence**:

- `answersHistory` is maintained across questions
- Used for streak calculation
- Cleared only when game ends or player leaves

**Answer Result Usage**:

- `answerResult` is stored after successful submission
- Used in `answer_reveal` phase to display:
  - Selected answer
  - Correct answer
  - Whether player was correct
  - Points earned
  - Answer statistics

## WebSocket Event Handling

### Client-Side Listeners

**Setup**:

- Listeners are set up when `useGameAnswer` hook initializes
- Only set up once per question (using `listenersSetupRef`)
- Automatically cleaned up on unmount

**Events Received**:

1. **`game:answer:accepted`**:
   - Confirms server received the answer
   - Triggers `onAnswerConfirmed` callback
   - May not be implemented on backend

2. **`game:answer:stats:update`** or **`game:answer:stats`**:
   - Provides aggregate answer statistics
   - Updates answer distribution counts
   - Used for host analytics and public screen

**Events Emitted**:

1. **`room:join`**: Join game room when hook initializes
2. **`game:answer:submit`**: Emit after successful API submission

## Implementation Notes

### Hook Dependencies

The `useGameAnswer` hook requires:

- `gameId`: Current game ID
- `playerId`: Current player ID
- `questionId`: Current question ID
- `questionNumber`: 1-indexed question number
- `correctAnswerId`: Correct answer ID for validation
- `questionPoints`: Base points for question
- `answeringTime`: Time limit in seconds
- `timeBonusEnabled`: From game settings
- `streakBonusEnabled`: From game settings

### Hook Return Values

```typescript
{
  answerStatus: {
    hasAnswered: boolean;
    submittedAt: Date | null;
    submittedOption: string | null;
    isProcessing: boolean;
  };
  answerResult: AnswerResult | null;
  answersHistory: Answer[];
  submitAnswer: (selectedOption: string | null, responseTimeMs: number) => Promise<void>;
  clearAnswer: () => void;
  refreshAnswers: () => Promise<void>;
  loading: boolean;
  error: string | null;
}
```

## Future Enhancements

1. **Answer Change**: Allow changing answer within time limit (if design changes)
2. **Partial Points**: Award partial points for late but correct answers
3. **Hint System**: Show hints during answering phase (if implemented)
4. **Power-ups**: Special abilities during answering (if implemented)
5. **Team Mode**: Collaborative answering (if implemented)
6. **Automatic Retry**: Implement automatic retry on network errors
7. **Offline Support**: Queue answers when offline, submit when reconnected
8. **Answer Preview**: Show calculated points before submission (if design allows)
