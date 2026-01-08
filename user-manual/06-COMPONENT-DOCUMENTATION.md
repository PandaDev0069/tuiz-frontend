# Component Documentation

## Table of Contents

1. [Component Overview](#component-overview)
2. [Game Components](#game-components)
3. [Quiz Creation Components](#quiz-creation-components)
4. [UI Components](#ui-components)
5. [Provider Components](#provider-components)
6. [Component Patterns](#component-patterns)

---

## Component Overview

The frontend uses a component-based architecture with clear separation of concerns. Components are organized by feature and functionality.

### Component Structure

```
components/
├── game/                    # Game screen components
├── quiz-creation/           # Quiz creation UI
├── quiz-library/            # Quiz library UI
├── host-waiting-room/       # Host waiting room
├── providers/               # Context providers
├── SEO/                     # SEO components
└── ui/                      # Reusable UI primitives
```

---

## Game Components

### HostQuestionScreen

Displays the current question to the host.

**Location**: `components/game/HostQuestionScreen.tsx`

**Props:**

```typescript
interface HostQuestionScreenProps {
  question: Question;
  currentTime: number;
  questionNumber: number;
  totalQuestions: number;
}
```

**Usage:**

```typescript
<HostQuestionScreen
  question={currentQuestion}
  currentTime={timeRemaining}
  questionNumber={1}
  totalQuestions={10}
/>
```

---

### PlayerQuestionScreen

Displays the current question to players.

**Location**: `components/game/PlayerQuestionScreen.tsx`

**Props:**

```typescript
interface PlayerQuestionScreenProps {
  question: Question;
  currentTime: number;
  questionNumber: number;
  totalQuestions: number;
  isMobile?: boolean;
}
```

---

### HostAnswerScreen

Shows the answer phase to the host with player statistics.

**Location**: `components/game/HostAnswerScreen.tsx`

**Props:**

```typescript
interface HostAnswerScreenProps {
  question: Question;
  currentTime: number;
  questionNumber: number;
  totalQuestions: number;
  answerStatistics: AnswerStatistic[];
  totalAnswered: number;
  totalPlayers: number;
}
```

---

### PlayerAnswerScreen

Allows players to select and submit answers.

**Location**: `components/game/PlayerAnswerScreen.tsx`

**Props:**

```typescript
interface PlayerAnswerScreenProps {
  question: Question;
  currentTime: number;
  questionNumber: number;
  totalQuestions: number;
  onAnswerSelect: (answerId: string) => void;
  onAnswerSubmit: () => void;
  isMobile?: boolean;
  isSubmitted?: boolean;
}
```

**Features:**

- Answer selection
- Timer countdown
- Auto-submit on timeout
- Submit button

---

### HostAnswerRevealScreen

Shows answer reveal with statistics to the host.

**Location**: `components/game/HostAnswerRevealScreen.tsx`

**Props:**

```typescript
interface HostAnswerRevealScreenProps {
  question: Question;
  correctAnswer: Choice;
  answerStatistics: AnswerStatistic[];
  totalPlayers: number;
  totalAnswered: number;
  questionNumber: number;
  totalQuestions: number;
}
```

---

### PlayerAnswerRevealScreen

Shows answer reveal to players with their result.

**Location**: `components/game/PlayerAnswerRevealScreen.tsx`

**Props:**

```typescript
interface PlayerAnswerRevealScreenProps {
  question: Question;
  correctAnswer: Choice;
  playerAnswer?: Choice;
  isCorrect: boolean;
  answerStatistics: AnswerStatistic[];
  totalPlayers: number;
  questionNumber: number;
  totalQuestions: number;
  isMobile?: boolean;
}
```

---

### HostLeaderboardScreen

Displays leaderboard to the host.

**Location**: `components/game/HostLeaderboardScreen.tsx`

**Props:**

```typescript
interface HostLeaderboardScreenProps {
  leaderboard: LeaderboardEntry[];
  questionNumber: number;
  totalQuestions: number;
}
```

---

### PlayerLeaderboardScreen

Displays leaderboard to players.

**Location**: `components/game/PlayerLeaderboardScreen.tsx`

**Props:**

```typescript
interface PlayerLeaderboardScreenProps {
  leaderboard: LeaderboardEntry[];
  playerId: string;
  questionNumber: number;
  totalQuestions: number;
  isMobile?: boolean;
}
```

---

### HostPodiumScreen

Shows final podium to the host.

**Location**: `components/game/HostPodiumScreen.tsx`

**Props:**

```typescript
interface HostPodiumScreenProps {
  leaderboard: LeaderboardEntry[];
  totalQuestions: number;
}
```

---

### PlayerPodiumScreen

Shows final podium to players.

**Location**: `components/game/PlayerPodiumScreen.tsx`

**Props:**

```typescript
interface PlayerPodiumScreenProps {
  leaderboard: LeaderboardEntry[];
  playerId: string;
  totalQuestions: number;
  isMobile?: boolean;
}
```

---

## Quiz Creation Components

### BasicInfoStep

First step of quiz creation - basic information.

**Location**: `components/quiz-creation/BasicInfoStep.tsx`

**Features:**

- Title and description input
- Thumbnail upload
- Tags management
- Difficulty selection
- Visibility settings

**Sub-components:**

- `TitleDescriptionForm`: Title and description
- `ThumbnailUpload`: Image upload
- `TagsManager`: Tag management
- `DifficultyCategoryForm`: Difficulty selection
- `VisibilitySettings`: Public/private toggle

---

### QuestionCreationStep

Second step - create questions.

**Location**: `components/quiz-creation/QuestionCreationStep.tsx`

**Features:**

- Add/edit/delete questions
- Question type selection
- Answer choices management
- Image upload for questions
- Explanation text
- Time settings

**Sub-components:**

- `QuestionForm`: Question input form
- `QuestionList`: List of questions
- `QuestionNavigation`: Navigate between questions
- `MultipleChoicePanel`: Multiple choice options
- `TrueFalsePanel`: True/false options
- `ExplanationModal`: Explanation editor
- `QuestionControlPanel`: Question controls

---

### SettingsStep

Third step - game settings.

**Location**: `components/quiz-creation/SettingsStep.tsx`

**Features:**

- Player limit
- Question order
- Leaderboard settings
- Auto-advance settings

**Sub-components:**

- `PlaySettingsPanel`: Play settings
- `SettingsNavigation`: Settings navigation

---

### FinalStep

Final step - review and publish.

**Location**: `components/quiz-creation/FinalStep/FinalStep.tsx`

**Features:**

- Quiz overview
- Question review
- Settings review
- Publish button

---

## UI Components

### Core Components

#### Button

**Location**: `components/ui/core/button.tsx`

**Variants:**

- `default`, `gradient`, `outline`, `ghost`, `destructive`

**Sizes:**

- `sm`, `md`, `lg`, `tall`

**Usage:**

```typescript
<Button variant="gradient" size="lg" onClick={handleClick}>
  Click Me
</Button>
```

---

#### Card

**Location**: `components/ui/core/card.tsx`

**Variants:**

- `default`, `glass`, `accent`, `success`, `warning`, `error`

**Usage:**

```typescript
<Card variant="glass">
  <CardHeader>Title</CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

---

#### Input

**Location**: `components/ui/forms/input.tsx`

**Usage:**

```typescript
<Input
  type="text"
  value={value}
  onChange={(e) => setValue(e.target.value)}
  placeholder="Enter text"
/>
```

---

#### InputField

**Location**: `components/ui/forms/input-field.tsx`

**Features:**

- Label
- Error message
- Validation

**Usage:**

```typescript
<InputField
  label="Email"
  type="email"
  name="email"
  value={email}
  onChange={handleChange}
  error={errors.email}
  required
/>
```

---

### Form Components

#### PasswordField

**Location**: `components/ui/forms/password-field.tsx`

**Features:**

- Password visibility toggle
- Validation
- Error display

---

#### Checkbox

**Location**: `components/ui/forms/checkbox.tsx`

**Usage:**

```typescript
<Checkbox
  id="remember"
  checked={remember}
  onChange={(e) => setRemember(e.target.checked)}
  label="Remember me"
/>
```

---

#### Select

**Location**: `components/ui/forms/select.tsx`

**Usage:**

```typescript
<Select
  value={selected}
  onChange={setSelected}
  options={options}
/>
```

---

### Feedback Components

#### FormError

**Location**: `components/ui/feedback/form-error.tsx`

**Usage:**

```typescript
<FormError message="Error message" />
```

---

#### FormSuccess

**Location**: `components/ui/feedback/form-success.tsx`

**Usage:**

```typescript
<FormSuccess message="Success message" />
```

---

#### Loader

**Location**: `components/ui/feedback/loader.tsx`

**Usage:**

```typescript
<Loader size="md" />
```

---

### Layout Components

#### PageContainer

**Location**: `components/ui/core/page-container.tsx`

**Features:**

- Page layout wrapper
- Entrance animations
- Responsive design

**Usage:**

```typescript
<PageContainer entrance="fadeIn">
  {children}
</PageContainer>
```

---

#### Container

**Location**: `components/ui/core/layout.tsx`

**Sizes:**

- `sm`, `md`, `lg`, `xl`

**Usage:**

```typescript
<Container size="lg">
  {content}
</Container>
```

---

## Provider Components

### SocketProvider

Provides WebSocket connection context.

**Location**: `components/providers/SocketProvider.tsx`

**Usage:**

```typescript
<SocketProvider>
  {children}
</SocketProvider>
```

**Hook:**

```typescript
const { socket, isConnected, joinRoom, leaveRoom } = useSocket();
```

---

### AuthProvider

Provides authentication context.

**Location**: `components/ui/providers/AuthProvider.tsx`

**Usage:**

```typescript
<AuthProvider>
  {children}
</AuthProvider>
```

---

### AnimationProvider

Provides animation tuning based on network latency.

**Location**: `app/AnimationController.tsx`

**Usage:**

```typescript
<AnimationProvider>
  {children}
</AnimationProvider>
```

**Hook:**

```typescript
const { duration, easing, scale } = useAnimation();
```

---

## Component Patterns

### Controlled Components

All form inputs use controlled component pattern:

```typescript
const [value, setValue] = useState('');

<input
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>
```

### Compound Components

Complex components use compound pattern:

```typescript
<Card>
  <CardHeader>Title</CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

### Custom Hooks

Business logic extracted to custom hooks:

```typescript
// In component
const { gameFlow, startQuestion } = useGameFlow({
  gameId,
  autoSync: true,
});
```

### Error Boundaries

Error handling at component level:

```typescript
try {
  // Component logic
} catch (error) {
  toast.error('Error message');
}
```

### Loading States

Loading states handled with Suspense and loaders:

```typescript
<Suspense fallback={<Loader />}>
  <Component />
</Suspense>
```

---

## Component Best Practices

### Props Interface

Always define TypeScript interfaces for props:

```typescript
interface ComponentProps {
  title: string;
  optional?: boolean;
}

export function Component({ title, optional }: ComponentProps) {
  // ...
}
```

### Component Organization

- One component per file
- Export default for main component
- Named exports for sub-components
- Co-locate related components

### Styling

- Use Tailwind utility classes
- Extract repeated patterns to utilities
- Use design tokens for consistency
- Mobile-first responsive design

### Performance

- Use `React.memo` for expensive components
- Lazy load heavy components
- Optimize re-renders with proper dependencies
- Use `useCallback` and `useMemo` appropriately

---

**Last Updated**: January 2026
**Version**: 1.0
