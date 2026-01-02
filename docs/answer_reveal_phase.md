# Answer Reveal Phase - Complete Logic Documentation

## Overview

The answer reveal phase is a critical component of the game flow where the correct answer is displayed to all participants along with answer statistics. This phase occurs after the answering phase completes and provides feedback to players about their performance. This document provides comprehensive details on all aspects of the answer reveal phase, including UI behavior, data aggregation, statistics calculation, and phase transitions.

## Phase Entry

### Trigger

- **Host Action**: Host clicks "答えを表示" (Reveal Answer) button in the control panel
- **Auto-Reveal**: Timer expires (if host hasn't manually revealed)
- **Phase Name**: `answer_reveal`
- **Page Route**:
  - Host Control Panel: `/game-host?phase=answer_reveal&gameId={gameId}` (stays in control panel view)
  - Public Screen: `/host-screen?phase=answer_reveal&gameId={gameId}` (shows HostAnswerRevealScreen)
  - Player: `/game-player?phase=answer_reveal&gameId={gameId}&playerId={playerId}`
- **Duration**: Configurable (default: 5 seconds), can be manually advanced

### Initialization

When the answer reveal phase starts:

1. **API Call** (Host Only):

   ```typescript
   POST / games / { gameId } / questions / reveal;
   ```

   - Backend locks answer submissions (no more answers accepted)
   - Backend calculates answer statistics
   - Backend sets `game_flows.current_question_end_time` = current timestamp
   - Backend emits WebSocket events

2. **WebSocket Events**:
   - `game:question:ended` - Broadcast to all clients
     ```json
     {
       "roomId": "game_id",
       "questionId": "question_id"
     }
     ```
   - `game:answer:locked` - Broadcast with statistics (if implemented)
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

3. **State Initialization**:
   - `answerResult` populated with question, correct answer, player answer, and statistics
   - Answer statistics aggregated from all player submissions
   - Player's answer result retrieved from `useGameAnswer` hook
   - Statistics calculated from `answerStats` (WebSocket updates)

## Data Structure

### AnswerResult Interface

**Location**: `src/types/game.ts`

**Note**: There are two different `AnswerResult` interfaces in the codebase:

1. **This one** (in `src/types/game.ts`) - Used for answer reveal screens
2. **Another one** (in `src/hooks/useGameAnswer.ts`) - Used internally by the hook for submission tracking

The reveal screens use the interface from `src/types/game.ts`:

```typescript
interface AnswerResult {
  question: Question;
  correctAnswer: Choice;
  playerAnswer?: Choice; // Only for player perspective
  isCorrect: boolean; // Only for player perspective
  statistics: AnswerStatistic[];
  totalPlayers: number;
  totalAnswered: number;
}

interface Question {
  id: string;
  text: string;
  image?: string;
  timeLimit: number;
  show_question_time: number;
  answering_time: number;
  choices: Choice[];
  correctAnswerId: string;
  explanation?: string;
  type: 'multiple_choice_2' | 'multiple_choice_3' | 'multiple_choice_4' | 'true_false';
}

interface Choice {
  id: string;
  text: string;
  letter: string;
}

interface AnswerStatistic {
  choiceId: string;
  count: number;
  percentage: number;
}
```

### Data Construction (Player Perspective)

**Location**: `src/app/(pages)/game-player/page.tsx`

```typescript
const revealPayload: AnswerResult = useMemo(() => {
  // Safety check for empty choices
  if (!currentQuestion.choices || currentQuestion.choices.length === 0) {
    return {
      question: currentQuestion,
      correctAnswer: { id: '', text: '読み込み中...', letter: 'A' },
      playerAnswer: undefined,
      isCorrect: false,
      statistics: [],
      totalPlayers: 0,
      totalAnswered: 0,
    };
  }

  // Get player's selected answer
  const playerChoice = answerResult?.selectedOption
    ? currentQuestion.choices.find((c) => c.id === answerResult.selectedOption)
    : selectedAnswer
      ? currentQuestion.choices.find((c) => c.id === selectedAnswer)
      : undefined;

  // Calculate statistics from answerStats (WebSocket updates)
  const totalAnswered = Object.values(answerStats).reduce((sum, count) => sum + count, 0);
  const statistics = currentQuestion.choices.map((choice) => {
    const count = answerStats[choice.id] || 0;
    return {
      choiceId: choice.id,
      count,
      percentage: totalAnswered > 0 ? (count / totalAnswered) * 100 : 0,
    };
  });

  // Determine if answer is correct
  const isCorrect =
    answerResult?.isCorrect ??
    (playerChoice ? playerChoice.id === currentQuestion.correctAnswerId : false);

  const correctAnswerChoice =
    currentQuestion.choices.find((c) => c.id === currentQuestion.correctAnswerId) ||
    currentQuestion.choices[0]; // Fallback

  return {
    question: currentQuestion,
    correctAnswer: correctAnswerChoice,
    playerAnswer: playerChoice,
    isCorrect,
    statistics,
    totalPlayers: Array.isArray(leaderboard) ? leaderboard.length : 0,
    totalAnswered,
  };
}, [answerResult, currentQuestion, selectedAnswer, answerStats, leaderboard]);
```

## Answer Statistics Aggregation

### Data Sources

1. **WebSocket Events**:
   - `game:answer:stats:update` or `game:answer:stats`
   - Provides real-time aggregate counts per answer choice
   - Updated periodically as players submit answers

2. **Answer Stats State**:

   ```typescript
   const [answerStats, setAnswerStats] = useState<Record<string, number>>({});
   ```

3. **WebSocket Listener**:
   ```typescript
   socket.on(
     'game:answer:stats:update',
     (data: { roomId: string; questionId: string; counts: Record<string, number> }) => {
       if (data.roomId === gameId && data.questionId === gameFlow?.current_question_id) {
         setAnswerStats(data.counts);
       }
     },
   );
   ```

### Statistics Calculation

**Formula**:

```typescript
const totalAnswered = Object.values(answerStats).reduce((sum, count) => sum + count, 0);

const statistics = choices.map((choice) => {
  const count = answerStats[choice.id] || 0;
  return {
    choiceId: choice.id,
    count,
    percentage: totalAnswered > 0 ? (count / totalAnswered) * 100 : 0,
  };
});
```

**Rules**:

- Each answer choice gets a count (number of players who selected it)
- Percentage calculated as: `(count / totalAnswered) * 100`
- If `totalAnswered = 0`, all percentages are `0`
- Statistics are calculated client-side from aggregated counts (not individual submissions)

## UI Components

### HostAnswerRevealScreen

**Location**: `src/components/game/HostAnswerRevealScreen.tsx`

**Usage**:

- **Public Screen**: Used in `src/app/(pages)/host-screen/page.tsx` for the public display
- **Host Control Panel**: The host control panel (`src/app/(pages)/game-host/page.tsx`) does NOT render this component - it stays in the control panel view and only shows the phase status

**Features**:

- Animated bar chart showing answer distribution
- Correct answer highlighted with checkmark
- Answer choices displayed in 2x2 grid
- Timer countdown (default: 5 seconds)
- Manual "次へ" (Next) button
- Auto-navigation on timer expiration

**Visual Elements**:

- **Bar Chart**: Animated bars showing percentage of players who chose each option
- **Correct Answer Indicator**: CheckCircle icon on correct answer
- **Statistics Summary**: Total answered count displayed
- **Color Coding**: Different colors per question type (true/false, multiple choice)

**Layout**:

- Question text at top
- Bar chart in center (animated)
- Answer choices in 2x2 grid at bottom
- Timer bar at top showing countdown

### PlayerAnswerRevealScreen

**Location**: `src/components/game/PlayerAnswerRevealScreen.tsx`

**Features**:

- Same bar chart as host (lightweight version)
- Player's selected answer highlighted
- Correct answer indicator
- Whether player was correct/incorrect
- Points earned (if available)
- Responsive design (mobile and desktop layouts)

**Visual Elements**:

- **Bar Chart**: Same animated bars as host
- **Player Answer Highlight**: Player's selected choice is visually distinct
- **Correct Answer Indicator**: CheckCircle icon on correct answer
- **Statistics**: Same aggregate statistics as host

**Layout**:

- Mobile: Compact layout with smaller bars
- Desktop: Full layout with larger bars
- Question text at top
- Bar chart in center
- Answer choices in 2x2 grid at bottom

## Animation Details

### Bar Chart Animation

**Implementation**: `AnimatedBar` component

**Animation Flow**:

1. **Initial State**: Bars at 0 height, count at 0
2. **Trigger**: Animation starts 200ms after component mount
3. **Staggered Start**: Each bar starts with delay: `300ms + (index * 150ms)`
4. **Duration**: 2000ms (2 seconds) total animation
5. **Easing**: `easeOutQuart` (1 - (1 - progress)^4)
6. **Final State**: Bars at target height, count at target value

**Animation Code**:

```typescript
useEffect(() => {
  if (!shouldAnimate) {
    setAnimatedCount(0);
    setAnimatedHeight(0);
    return;
  }

  const delay = 300 + animationIndex * 150;
  const timer = setTimeout(() => {
    let startTime: number;
    const totalDuration = 2000;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / totalDuration, 1);

      // EaseOutQuart
      const easeOut = 1 - Math.pow(1 - progress, 4);

      setAnimatedCount(Math.round(targetCount * easeOut));
      setAnimatedHeight(targetPercentage * easeOut);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, delay);

  return () => clearTimeout(timer);
}, [shouldAnimate, count, percentage, index]);
```

**Bar Height Calculation**:

```typescript
const barHeightPercent = useMemo(() => {
  if (animatedHeight <= 0) return 0;
  const scaledPercent = maxPercentage > 0 ? (animatedHeight / maxPercentage) * 100 : 0;
  return Math.min(Math.max(scaledPercent, 8), 100); // Min 8%, max 100%
}, [animatedHeight, maxPercentage]);
```

## Question Type Layouts

### 1. True/False (`true_false`)

**Layout**: 2-column grid

**Visual Design**:

- True: Green gradient (`from-green-500 to-green-600`)
- False: Red gradient (`from-red-500 to-red-600`)
- Symbols: ○ for True, × for False
- Correct answer: Highlighted with checkmark, brightness increase, ring effect
- Incorrect answers: Dimmed (opacity ~40%)

**Bar Chart**:

- 2 bars side by side
- Green bar for True, Red bar for False
- Checkmark on correct answer bar (if bar height > 20%)

### 2. Multiple Choice - 2 Options (`multiple_choice_2`)

**Layout**: 2-column grid

**Visual Design**:

- Option A: Purple gradient
- Option B: Orange gradient
- Letter labels (A, B) displayed prominently
- Correct answer highlighted, others dimmed

**Bar Chart**:

- 2 bars with distinct colors
- Checkmark on correct answer bar

### 3. Multiple Choice - 3 Options (`multiple_choice_3`)

**Layout**: 3-column grid (or 2+1 on mobile)

**Visual Design**:

- Option A: Emerald gradient
- Option B: Pink gradient
- Option C: Cyan gradient
- Letter labels (A, B, C)

**Bar Chart**:

- 3 bars with distinct colors
- Checkmark on correct answer bar

### 4. Multiple Choice - 4 Options (`multiple_choice_4`)

**Layout**: 2x2 grid

**Visual Design**:

- Option A: Red gradient
- Option B: Yellow gradient
- Option C: Green gradient
- Option D: Blue gradient
- Letter labels (A, B, C, D)

**Bar Chart**:

- 4 bars with distinct colors
- Checkmark on correct answer bar

## Color Schemes

### Choice Colors by Question Type

```typescript
const getChoiceColors = (questionType: string) => {
  switch (questionType) {
    case 'true_false':
      return [
        'bg-gradient-to-br from-green-500 to-green-600 border-green-400', // True/○
        'bg-gradient-to-br from-red-500 to-red-600 border-red-400', // False/×
      ];
    case 'multiple_choice_2':
      return [
        'bg-gradient-to-r from-purple-500 to-purple-600 border-purple-400',
        'bg-gradient-to-r from-orange-500 to-orange-600 border-orange-400',
      ];
    case 'multiple_choice_3':
      return [
        'bg-gradient-to-r from-emerald-500 to-emerald-600 border-emerald-400',
        'bg-gradient-to-r from-pink-500 to-pink-600 border-pink-400',
        'bg-gradient-to-r from-cyan-500 to-cyan-600 border-cyan-400',
      ];
    case 'multiple_choice_4':
    default:
      return [
        'bg-gradient-to-br from-red-500 to-red-600 border-red-400', // A
        'bg-gradient-to-br from-yellow-500 to-yellow-600 border-yellow-400', // B
        'bg-gradient-to-br from-green-500 to-green-600 border-green-400', // C
        'bg-gradient-to-br from-blue-500 to-blue-600 border-blue-400', // D
      ];
  }
};
```

## Timer Behavior

### Host Timer

**Default Duration**: 5 seconds

**Behavior**:

- Countdown timer displayed in TimeBar component
- Auto-navigation to next phase when timer expires
- Manual "次へ" button available to advance early
- Timer can be customized via `timeLimit` prop

**Implementation**:

```typescript
const [currentTime, setCurrentTime] = useState(timeLimit);

useEffect(() => {
  const timer = setInterval(() => {
    setCurrentTime((prev) => {
      if (prev <= 1) {
        setIsTimeExpired(true);
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(timer);
}, [timeLimit]);

useEffect(() => {
  if (isTimeExpired) {
    setTimeout(() => {
      if (onTimeExpired) {
        onTimeExpired();
      } else {
        router.push('/host-leaderboard-screen');
      }
    }, 0);
  }
}, [isTimeExpired, onTimeExpired, router]);
```

### Player Timer

**Default Duration**: 5 seconds

**Behavior**:

- Same countdown as host
- Auto-navigation to leaderboard when timer expires
- No manual control (player cannot advance)

**Implementation**:

```typescript
useEffect(() => {
  if (!timeLimit || timeLimit <= 0) return;

  const timer = setInterval(() => {
    setCurrentTime((prev) => {
      if (prev <= 1) {
        if (onTimeExpired) {
          onTimeExpired();
        } else {
          router.push('/player-leaderboard-screen');
        }
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(timer);
}, [onTimeExpired, router, timeLimit]);
```

## Phase Transitions

### From Answer Reveal

**Next Phase Logic**:

1. **If NOT Final Question**:
   - `answer_reveal` → `leaderboard` (if host clicks "次へ")
   - Timer expires → `leaderboard` (auto-transition)

2. **If Final Question**:
   - `answer_reveal` → `explanation` (if explanation exists)
   - `answer_reveal` → `podium` (if no explanation)

**Host Control**:

```typescript
const handleNextPhase = useCallback(async () => {
  const isLastQuestion = currentQuestionIndex >= totalQuestions - 1;

  if (currentPhase === 'answer_reveal') {
    if (isLastQuestion) {
      if (currentQuestion?.explanation_text) {
        setCurrentPhase('explanation');
        emitPhaseChange('explanation');
      } else {
        setCurrentPhase('podium');
        emitPhaseChange('podium');
      }
    } else {
      setCurrentPhase('leaderboard');
      emitPhaseChange('leaderboard');
    }
  }
  // ... other phase transitions
}, [currentPhase, currentQuestionIndex, totalQuestions, currentQuestion, emitPhaseChange]);
```

**Player Behavior**:

- Players follow host's phase changes via WebSocket
- Players cannot manually advance phases
- Players auto-transition on timer expiration (if host doesn't advance)

## WebSocket Event Handling

### Client-Side Listeners

**Setup**:

- Listeners set up in `useGameFlow` hook
- Listeners set up in `game-player/page.tsx` for answer stats
- Automatically cleaned up on unmount

**Events Received**:

1. **`game:question:ended`**:
   - Handled by `useGameFlow` hook's `onQuestionEnd` callback
   - Triggers transition to `answer_reveal` phase

   ```typescript
   // In useGameFlow hook
   socket.on('game:question:ended', (data: { roomId: string }) => {
     if (data.roomId === gameId) {
       eventsRef.current?.onQuestionEnd?.(questionId);
     }
   });

   // In game-player page
   onQuestionEnd: () => {
     setCurrentPhase('answer_reveal');
     router.replace(`/game-player?gameId=${gameId}&phase=answer_reveal&playerId=${playerId}`);
   };
   ```

2. **`game:answer:locked`**:
   - Alternative event that also triggers transition to `answer_reveal`
   - May include statistics in the event payload

   ```typescript
   socket.on(
     'game:answer:locked',
     (data: { roomId: string; questionId: string; counts?: Record<string, number> }) => {
       if (data.roomId === gameId) {
         if (data.counts && data.questionId === gameFlow?.current_question_id) {
           setAnswerStats(data.counts);
         }
         setCurrentPhase('answer_reveal');
         router.replace(`/game-player?gameId=${gameId}&phase=answer_reveal&playerId=${playerId}`);
       }
     },
   );
   ```

3. **`game:answer:stats:update`** or **`game:answer:stats`**:

   ```typescript
   socket.on(
     'game:answer:stats:update',
     (data: { roomId: string; questionId: string; counts: Record<string, number> }) => {
       if (data.roomId === gameId && data.questionId === gameFlow?.current_question_id) {
         setAnswerStats(data.counts);
       }
     },
   );
   ```

4. **`game:phase:change`**:
   ```typescript
   socket.on('game:phase:change', (data: { roomId: string; phase: string }) => {
     if (data.roomId === gameId && data.phase === 'answer_reveal') {
       setCurrentPhase('answer_reveal');
       router.replace(`/game-player?gameId=${gameId}&phase=answer_reveal&playerId=${playerId}`);
     }
   });
   ```

**Events Emitted**:

1. **`game:question:ended`** (Host only):
   - Emitted by `useGameFlow.revealAnswer()` after API call succeeds
   - Broadcasts to all clients that question has ended

## Backend Processing

### API Endpoint: POST /games/:gameId/questions/reveal

**Server Actions**:

1. **Validation**:
   - Verify game exists and is active
   - Verify user is host (if host-only endpoint)
   - Verify current question exists
   - Verify question hasn't already been revealed

2. **Lock Answer Submissions**:
   - Set `game_flows.current_question_end_time` = current timestamp
   - This prevents further answer submissions (backend validates timestamp)

3. **Calculate Statistics**:
   - Query all answer submissions for current question
   - Aggregate counts per answer choice
   - Calculate percentages
   - Store in database (if needed)

4. **Emit WebSocket Events**:
   - `game:question:ended` to all room participants
   - `game:answer:locked` with statistics (if implemented)
   - `game:answer:stats:update` with aggregated counts

5. **Update Database**:
   - Update `game_flows.current_question_end_time`
   - Update `game_flows.updated_at`
   - May update answer statistics cache (if implemented)

**Response**:

```json
{
  "message": "Answer revealed successfully",
  "gameFlow": {
    "id": "uuid",
    "game_id": "uuid",
    "current_question_id": "uuid",
    "current_question_index": 0,
    "current_question_start_time": "2024-01-01T12:00:00Z",
    "current_question_end_time": "2024-01-01T12:05:00Z",
    ...
  }
}
```

## Error Handling

### Error Scenarios

1. **Network Error**:
   - Show error message to host
   - Allow retry (if answer not yet revealed)
   - Log error for debugging

2. **Validation Error**:
   - Show specific error message
   - Prevent reveal action
   - Log error

3. **Server Error**:
   - Show generic error message
   - Allow retry if possible
   - Log error details

4. **Missing Data**:
   - Show loading state if question data missing
   - Show fallback UI if statistics unavailable
   - Gracefully handle empty answer stats

### Error Recovery

**Retry Logic**:

- If reveal fails and question not yet ended:
  - Show error message to host
  - Allow host to retry by clicking "答えを表示" again
- If reveal fails but question already ended:
  - Check server state to confirm
  - If confirmed, show answer reveal screen
  - If not confirmed, allow retry

**Error State Management**:

```typescript
try {
  await revealAnswer();
  setCurrentPhase('answer_reveal');
  emitPhaseChange('answer_reveal');
  toast.success('答えを表示しました');
} catch (e) {
  console.error('Failed to reveal answer:', e);
  toast.error('答えの表示に失敗しました');
}
```

## State Management

### Answer Result State

**Source**: `useGameAnswer` hook

**Data Flow**:

1. Player submits answer in answering phase
2. `answerResult` populated with submission data
3. `answerResult` used in answer reveal phase
4. `answerResult` persists until next question

**State Structure** (from `useGameAnswer` hook):

```typescript
interface AnswerResult {
  questionId: string;
  selectedOption: string;
  isCorrect: boolean;
  pointsEarned: number;
  correctAnswer: string;
  responseTimeMs: number;
}
```

**Note**: This is the internal `AnswerResult` from `useGameAnswer` hook. It's transformed into the reveal screen's `AnswerResult` format in the `revealPayload` construction.

### Statistics State

**Source**: WebSocket events (`game:answer:stats:update`)

**State Structure**:

```typescript
const [answerStats, setAnswerStats] = useState<Record<string, number>>({});
// Example: { "answer_id_1": 10, "answer_id_2": 5, "answer_id_3": 3, "answer_id_4": 2 }
```

**Update Flow**:

1. Players submit answers → Backend aggregates
2. Backend emits `game:answer:stats:update` periodically
3. Client receives event → Updates `answerStats` state
4. `answerStats` used to calculate statistics in `revealPayload`

## Responsive Design

### Mobile Layout

**PlayerAnswerRevealScreen**:

- Compact bar chart (height: 200px)
- Smaller text sizes
- Reduced padding and spacing
- Stacked layout for answer choices
- Smaller checkmark icons

**Breakpoint**: `window.innerWidth < 768` (md breakpoint)

### Desktop Layout

**PlayerAnswerRevealScreen**:

- Full bar chart (height: 280px)
- Larger text sizes
- More padding and spacing
- Grid layout for answer choices
- Larger checkmark icons

**HostAnswerRevealScreen** (Public Screen):

- Always desktop layout (public screen is typically on large display)
- Full bar chart (height: 330px)
- Large text and spacing

**Host Control Panel**:

- Does not render HostAnswerRevealScreen component
- Stays in control panel view with analytics and player list
- Shows phase status indicator ("答え表示")

## Accessibility

### Keyboard Navigation

- Tab through answer choices
- Enter to activate (if interactive elements)
- Escape to close (if applicable)

### Screen Reader Support

- Announce correct answer
- Announce player's answer
- Announce whether player was correct
- Announce statistics (counts and percentages)

### Focus Management

- Focus on correct answer after reveal
- Focus on "次へ" button (host only)
- Maintain focus during animations

## Performance Considerations

### Optimization Strategies

1. **Memoization**:
   - `revealPayload` memoized with `useMemo`
   - `barHeightPercent` memoized in `AnimatedBar`
   - Color classes calculated once per question type

2. **Animation Performance**:
   - Use `requestAnimationFrame` for smooth animations
   - GPU acceleration with `transform: translateZ(0)`
   - `will-change-transform` CSS property
   - Staggered animations to avoid jank

3. **Data Loading**:
   - Statistics loaded via WebSocket (real-time)
   - Question data cached from previous phase
   - Answer result cached from submission

4. **Rendering Optimization**:
   - Conditional rendering based on mobile/desktop
   - Lazy loading of images (if applicable)
   - Virtual scrolling for large player lists (if implemented)

## Edge Cases

### Edge Case 1: No Answers Submitted

**Scenario**: No players submitted answers before reveal

**Handling**:

- All statistics show 0 count, 0%
- Bar chart shows all bars at minimum height (8%)
- Total answered = 0
- UI gracefully handles empty state

### Edge Case 2: Late Answer Submissions

**Scenario**: Player submits answer after reveal triggered but before backend locks

**Handling**:

- Backend validates `current_question_end_time`
- Late submissions rejected (return error)
- Client shows error message if submission fails
- Statistics already calculated, late answer not included

### Edge Case 3: Network Disconnection During Reveal

**Scenario**: Player loses connection when answer is revealed

**Handling**:

- On reconnect, fetch current game state
- Check `game_flows.current_question_end_time`
- If set, transition to `answer_reveal` phase
- Fetch answer statistics from API (if available)
- Restore player's answer from `answerResult`

### Edge Case 4: Host Reveals Before All Players Answer

**Scenario**: Host clicks "答えを表示" while players are still answering

**Handling**:

- Backend locks submissions immediately
- Players who haven't answered see answer reveal
- Players who were submitting get error (answer locked)
- Statistics calculated from submitted answers only
- No partial submissions included

### Edge Case 5: Statistics Not Available

**Scenario**: WebSocket events not received, statistics missing

**Handling**:

- Fallback to empty statistics (all 0%)
- Show question and correct answer
- Show player's answer (if available)
- Log warning for debugging
- UI gracefully handles missing data

## Testing Considerations

### Test Cases

1. **Normal Flow**:
   - Host reveals answer → All clients show answer reveal → Statistics displayed → Timer counts down

2. **Auto-Reveal Flow**:
   - Timer expires → Auto-reveal triggered → All clients show answer reveal

3. **Statistics Accuracy**:
   - Multiple players submit → Statistics calculated correctly → Percentages sum to 100%

4. **Animation**:
   - Bars animate smoothly → Counts animate correctly → Staggered timing works

5. **Phase Transitions**:
   - Host clicks "次へ" → Phase changes → Players follow via WebSocket

6. **Responsive Design**:
   - Mobile layout displays correctly → Desktop layout displays correctly → Breakpoints work

7. **Error Handling**:
   - Network error → Error shown → Retry works
   - Missing data → Fallback UI shown → No crashes

8. **Reconnection**:
   - Disconnect during reveal → Reconnect → State restored → Answer reveal shown

## Implementation Notes

### Component Dependencies

**HostAnswerRevealScreen** requires:

- `answerResult: AnswerResult` - Complete answer result with statistics
- `timeLimit?: number` - Timer duration (default: 5)
- `questionNumber?: number` - Current question number
- `totalQuestions?: number` - Total questions
- `onTimeExpired?: () => void` - Callback for timer expiration
- `onNext?: () => void` - Callback for manual next action

**PlayerAnswerRevealScreen** requires:

- `answerResult: AnswerResult` - Complete answer result with statistics
- `timeLimit?: number` - Timer duration (default: 5)
- `questionNumber?: number` - Current question number
- `totalQuestions?: number` - Total questions
- `onTimeExpired?: () => void` - Callback for timer expiration

### Hook Dependencies

**useGameFlow**:

- Provides `revealAnswer()` function (host only)
- Handles WebSocket events for phase changes
- Manages timer state

**useGameAnswer**:

- Provides `answerResult` with player's submission
- Provides `answerStatus` for submission state
- Handles answer submission logic

**useGameLeaderboard**:

- Provides `leaderboard` for total players count
- Used in statistics calculation

### Data Flow Summary

```
1. Answering Phase
   ↓
2. Players Submit Answers
   ↓
3. Backend Aggregates Statistics
   ↓
4. WebSocket: game:answer:stats:update (periodic)
   ↓
5. Client Updates answerStats State
   ↓
6. Host Clicks "答えを表示"
   ↓
7. API: POST /games/:gameId/questions/reveal
   ↓
8. Backend Locks Submissions, Calculates Final Statistics
   ↓
9. WebSocket: game:question:ended
   ↓
10. All Clients Transition to answer_reveal Phase
   ↓
11. revealPayload Constructed from answerResult + answerStats
   ↓
12. HostAnswerRevealScreen / PlayerAnswerRevealScreen Rendered
   ↓
13. Animations Play, Statistics Displayed
   ↓
14. Timer Expires or Host Clicks "次へ"
   ↓
15. Transition to Next Phase (leaderboard / explanation / podium)
```

## Future Enhancements

### Potential Improvements

1. **Real-time Statistics Updates**:
   - Update bar chart in real-time as answers come in
   - Show live countdown of submissions
   - Animate bars as statistics update

2. **Enhanced Animations**:
   - Confetti for correct answers
   - Sound effects for reveal
   - More sophisticated bar animations

3. **Additional Statistics**:
   - Average response time per choice
   - Fastest/slowest response times
   - Answer distribution by player rank

4. **Social Features**:
   - Show which players chose each answer (optional)
   - Highlight friends' answers
   - Show player reactions

5. **Accessibility Improvements**:
   - Better screen reader announcements
   - High contrast mode
   - Reduced motion option

6. **Performance Optimizations**:
   - Virtual scrolling for large player counts
   - Lazy loading of images
   - Code splitting for reveal screen

## Related Documentation

- [Answering Phase](./answering_phase.md) - Previous phase where players submit answers
- [Game Flow](./game_flow.md) - Complete game flow documentation
- [WebSocket Communication](./WEBSOCKET_COMMUNICATION.md) - WebSocket event details
- [API Documentation](../backend/docs/GAME_STATE_IMPLEMENTATION.md) - Backend API details
