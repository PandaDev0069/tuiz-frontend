# Navigation Update: Auto-Navigation from Answer Reveal to Leaderboard

## 📋 Summary

Added auto-navigation functionality to the `HostAnswerRevealScreen` component. When the timer expires (default 5 seconds), the component will automatically navigate to the leaderboard screen.

## 🔄 Changes Made

### 1. Updated `HostAnswerRevealScreen` Component

**File:** `src/components/game/HostAnswerRevealScreen.tsx`

#### New Props:

- `onTimeExpired?: () => void` - Optional callback for custom navigation logic

#### New Functionality:

- Automatically navigates to `/host-leaderboard-screen` when timer reaches 0
- Uses Next.js `useRouter` for navigation
- Supports custom navigation via `onTimeExpired` callback prop
- Updated timer logic to trigger navigation instead of just stopping

#### Code Changes:

```tsx
// Added import
import { useRouter } from 'next/navigation';

// Updated interface
interface HostAnswerRevealScreenProps {
  answerResult: AnswerResult;
  timeLimit?: number;
  questionNumber?: number;
  totalQuestions?: number;
  onTimeExpired?: () => void; // New callback prop
}

// Updated timer logic
useEffect(() => {
  const timer = setInterval(() => {
    setCurrentTime((prev) => {
      if (prev <= 1) {
        // Timer expired - trigger navigation
        if (onTimeExpired) {
          onTimeExpired();
        } else {
          // Default navigation to leaderboard screen
          router.push('/host-leaderboard-screen');
        }
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(timer);
}, [onTimeExpired, router]); // Added dependencies
```

## 🎯 Usage Examples

### Default Behavior (Auto-navigation to leaderboard):

```tsx
<HostAnswerRevealScreen
  answerResult={mockAnswerResult}
  timeLimit={5}
  questionNumber={2}
  totalQuestions={10}
/>
```

### Custom Navigation Logic:

```tsx
<HostAnswerRevealScreen
  answerResult={mockAnswerResult}
  timeLimit={5}
  questionNumber={2}
  totalQuestions={10}
  onTimeExpired={() => {
    // Custom navigation logic
    router.push('/custom-next-screen');
  }}
/>
```

## 🏃‍♂️ Flow Sequence

1. **Answer Reveal Screen loads** → Timer starts at `timeLimit` (default: 5 seconds)
2. **Timer counts down** → Visual timer bar updates every second
3. **Timer reaches 0** → Auto-navigation triggers
4. **Navigation occurs** → Either custom callback or default navigation to leaderboard

## 🔗 Navigation Path

```
Host Answer Screen → Host Answer Reveal Screen → Host Leaderboard Screen
      (answers)           (5 sec timer)           (auto-navigation)
```

## 🎮 User Experience

- **Seamless Flow**: Host doesn't need to manually navigate between screens
- **Visual Feedback**: Timer bar shows remaining time clearly
- **Consistent Timing**: Standardized 5-second reveal period
- **Flexible**: Can override navigation behavior if needed

## 🧪 Testing

The functionality can be tested by:

1. Navigating to `/host-answer-reveal-screen`
2. Waiting for the 5-second timer to expire
3. Verifying automatic navigation to `/host-leaderboard-screen`

## 📝 Notes

- Timer logic was already implemented but only stopped at 0
- Added navigation functionality without breaking existing behavior
- Component remains backward compatible (navigation is optional)
- Uses consistent Next.js navigation patterns from other game components
