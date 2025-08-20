# Frontend Coding Standards (Next.js + TypeScript)

Opinionated, lightweight rules so features stay consistent and easy to maintain.

---

## 1) Naming & File Layout

**Files/Folders**

- Components: `PascalCase` → `QuizCard.tsx`
- Hooks: `useThing.ts` → `useGameStore.ts`
- Utilities: `camelCase.ts` → `apiClient.ts`, `time.ts`
- CSS Modules: `Component.module.css`
- Tests: `Component.test.tsx`, `page.test.tsx`

**Structure (high level)**

```
src/
├── app/                           # ✅ Next.js App Router (keep as is)
│   ├── (auth)/                    # 🆕 Route groups for organization
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/               # 🆕 Protected routes
│   │   ├── host/
│   │   └── player/
│   ├── (game)/                    # 🆕 Game-specific routes
│   │   ├── room/
│   │   │   └── [id]/
│   │   └── join/
│   ├── api/                       # 🆕 API routes (minimal)
│   │   └── health/
│   ├── globals.css → ../styles/   # ⚠️ Move to styles
│   ├── layout.tsx                 # ✅ Root layout
│   ├── loading.tsx                # 🆕 Global loading UI
│   ├── error.tsx                  # 🆕 Global error UI
│   ├── not-found.tsx             # 🆕 404 page
│   ├── page.tsx                   # ✅ Home page
│   ├── AnimationController.tsx    # ✅ Keep
│   └── SocketProvider.tsx         # ✅ Keep
│
├── components/                    # 🔄 Restructure for better organization
│   ├── ui/                        # ✅ Shared primitives (current)
│   │   ├── forms/                 # 🆕 Form-specific components
│   │   │   ├── FormField.tsx
│   │   │   ├── FormError.tsx
│   │   │   └── index.ts
│   │   ├── feedback/              # 🆕 User feedback components
│   │   │   ├── Toast.tsx
│   │   │   ├── Alert.tsx
│   │   │   ├── Loading.tsx
│   │   │   └── index.ts
│   │   ├── navigation/            # 🆕 Navigation components
│   │   │   ├── Navbar.tsx
│   │   │   ├── Breadcrumb.tsx
│   │   │   └── index.ts
│   │   ├── data-display/          # 🆕 Data visualization
│   │   │   ├── Table.tsx
│   │   │   ├── List.tsx
│   │   │   ├── Avatar.tsx
│   │   │   └── index.ts
│   │   └── overlays/              # 🆕 Modal, Dialog, etc.
│   │       ├── Modal.tsx
│   │       ├── Dialog.tsx
│   │       ├── Popover.tsx
│   │       └── index.ts
│   └── providers/                 # 🆕 Reusable provider components
│       ├── ThemeProvider.tsx
│       ├── ToastProvider.tsx
│       └── index.ts
│
├── features/                      # 🆕 Feature-first organization
│   ├── auth/                      # Authentication feature
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── AuthGuard.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useLogin.ts
│   │   │   └── useRegister.ts
│   │   ├── services/
│   │   │   └── authService.ts
│   │   ├── types/
│   │   │   └── auth.types.ts
│   │   └── index.ts               # Export everything
│   │
│   ├── quiz/                      # Quiz management feature
│   │   ├── components/
│   │   │   ├── QuizCard.tsx
│   │   │   ├── QuizList.tsx
│   │   │   ├── QuizForm.tsx
│   │   │   ├── QuestionEditor.tsx
│   │   │   └── QuizPreview.tsx
│   │   ├── hooks/
│   │   │   ├── useQuiz.ts
│   │   │   ├── useQuizList.ts
│   │   │   └── useQuizValidation.ts
│   │   ├── services/
│   │   │   └── quizService.ts
│   │   ├── types/
│   │   │   └── quiz.types.ts
│   │   └── index.ts
│   │
│   ├── game/                      # Real-time game feature
│   │   ├── components/
│   │   │   ├── GameRoom.tsx
│   │   │   ├── PlayerList.tsx
│   │   │   ├── QuestionDisplay.tsx
│   │   │   ├── AnswerInput.tsx
│   │   │   ├── Leaderboard.tsx
│   │   │   └── GameControls.tsx
│   │   ├── hooks/
│   │   │   ├── useGameRoom.ts
│   │   │   ├── useGameSocket.ts
│   │   │   ├── useGameState.ts
│   │   │   └── usePlayerActions.ts
│   │   ├── services/
│   │   │   ├── gameService.ts
│   │   │   └── socketService.ts
│   │   ├── types/
│   │   │   └── game.types.ts
│   │   └── index.ts
│   │
│   ├── dashboard/                 # Dashboard feature
│   │   ├── components/
│   │   │   ├── DashboardStats.tsx
│   │   │   ├── RecentGames.tsx
│   │   │   └── QuickActions.tsx
│   │   ├── hooks/
│   │   │   └── useDashboard.ts
│   │   ├── services/
│   │   │   └── dashboardService.ts
│   │   ├── types/
│   │   │   └── dashboard.types.ts
│   │   └── index.ts
│   │
│   └── profile/                   # User profile feature
│       ├── components/
│       │   ├── ProfileCard.tsx
│       │   ├── ProfileForm.tsx
│       │   └── AvatarUpload.tsx
│       ├── hooks/
│       │   ├── useProfile.ts
│       │   └── useProfileUpdate.ts
│       ├── services/
│       │   └── profileService.ts
│       ├── types/
│       │   └── profile.types.ts
│       └── index.ts
│
├── hooks/                         # 🆕 Global/shared hooks
│   ├── useLocalStorage.ts
│   ├── useDebounce.ts
│   ├── useMediaQuery.ts
│   ├── useScrollPosition.ts
│   └── index.ts
│
├── lib/                           # ✅ Keep and expand
│   ├── api/                       # 🆕 API layer organization
│   │   ├── client.ts              # Base API client
│   │   ├── endpoints.ts           # API endpoints
│   │   ├── types.ts              # API response types
│   │   └── index.ts
│   ├── validations/               # 🆕 Validation schemas
│   │   ├── auth.schemas.ts
│   │   ├── quiz.schemas.ts
│   │   ├── game.schemas.ts
│   │   └── index.ts
│   ├── constants/                 # 🆕 App constants
│   │   ├── routes.ts
│   │   ├── gameStates.ts
│   │   ├── errorMessages.ts
│   │   └── index.ts
│   ├── formatters/                # 🆕 Data formatting utilities
│   │   ├── date.ts
│   │   ├── number.ts
│   │   ├── text.ts
│   │   └── index.ts
│   ├── supabaseClient.ts          # ✅ Keep
│   ├── utils.ts                   # ✅ Keep
│   └── index.ts                   # 🆕 Export everything
│
├── state/                         # ✅ Keep Zustand stores
│   ├── slices/                    # 🆕 Organize stores by domain
│   │   ├── authStore.ts
│   │   ├── gameStore.ts
│   │   ├── quizStore.ts
│   │   └── uiStore.ts             # ✅ Current useUiStore
│   ├── middleware/                # 🆕 Store middleware
│   │   ├── logger.ts
│   │   ├── persist.ts
│   │   └── index.ts
│   ├── types/                     # 🆕 Store type definitions
│   │   └── store.types.ts
│   └── index.ts                   # 🆕 Export all stores
│
├── styles/                        # ✅ Keep and enhance
│   ├── components/                # 🆕 Component-specific styles
│   │   ├── Button.module.css
│   │   ├── Card.module.css
│   │   └── Modal.module.css
│   ├── layouts/                   # 🆕 Layout-specific styles
│   │   ├── Dashboard.module.css
│   │   └── Game.module.css
│   ├── tokens.css                 # ✅ Design tokens
│   ├── globals.css                # ✅ Global styles
│   ├── utilities.css              # ✅ Utility classes
│   ├── animations.css             # 🆕 Animation definitions
│   └── themes/                    # 🆕 Theme variations
│       ├── light.css
│       ├── dark.css
│       └── high-contrast.css
│
├── types/                         # 🆕 Global type definitions
│   ├── api.types.ts               # API response types
│   ├── common.types.ts            # Shared types
│   ├── env.types.ts              # Environment types
│   └── index.ts
│
├── config/                        # ✅ Keep
│   ├── config.ts                  # ✅ Current config
│   ├── database.ts                # 🆕 Database configuration
│   ├── routes.ts                  # 🆕 Route definitions
│   └── index.ts
│
├── ui/                            # ✅ Keep current re-export pattern
│   └── index.ts                   # ✅ Clean imports
│
├── __tests__/                     # ✅ Keep test structure
│   ├── __mocks__/                 # 🆕 Test mocks
│   │   ├── supabase.ts
│   │   ├── socket.ts
│   │   └── index.ts
│   ├── components/                # 🆕 Organize by type
│   │   ├── ui/
│   │   └── features/
│   ├── hooks/                     # 🆕 Hook tests
│   ├── pages/                     # 🆕 Page tests
│   ├── setupTests.ts              # ✅ Keep
│   └── test-utils.tsx             # 🆕 Testing utilities
│
├── test/                          # ✅ Keep
│   ├── msw/
│   │   ├── handlers/              # 🆕 Organize handlers
│   │   │   ├── auth.handlers.ts
│   │   │   ├── quiz.handlers.ts
│   │   │   ├── game.handlers.ts
│   │   │   └── index.ts
│   │   ├── server.ts              # ✅ Keep
│   │   └── browser.ts             # 🆕 Browser MSW setup
│   ├── e2e/
│   │   ├── auth.spec.ts           # 🆕 Feature-based E2E
│   │   ├── quiz.spec.ts
│   │   ├── game.spec.ts
│   │   └── smoke.spec.ts          # ✅ Keep
│   ├── fixtures/                  # 🆕 Test data
│   │   ├── quiz.fixtures.ts
│   │   ├── user.fixtures.ts
│   │   └── game.fixtures.ts
│   └── utils/                     # 🆕 Test utilities
│       ├── render.tsx             # Custom render function
│       ├── mocks.ts               # Mock helpers
│       └── index.ts
│
└── docs/                          # ✅ Keep documentation
    ├── components/                # 🆕 Component documentation
    │   └── ui-components.md
    ├── features/                  # 🆕 Feature documentation
    │   ├── authentication.md
    │   ├── quiz-management.md
    │   └── game-flow.md
    ├── ARCHITECTURE.md            # ✅ Keep
    ├── ENGINEERING.md             # ✅ Keep
    ├── FRONTEND-STANDARDS.md      # ✅ Keep
    └── TESTING.md                 # ✅ Keep          # MSW handlers + e2e (Playwright)
```

---

## 2) TypeScript & Components

- Functional components only.
- Props as explicit interfaces/types; avoid `any`.
- Keep components ≤ ~150 lines; split if longer.
- Prefer server components by default; add `'use client'` only when needed.

**Component template**

```tsx
import s from './Component.module.css';

type Props = { title: string };

export default function Component({ title }: Props) {
  return <section className={s.component}>{title}</section>;
}
```

---

## 3) CSS Modules & Tokens

- Use CSS Modules with BEM-ish classes.
- No hardcoded colors/spacing; use `tokens.css` vars.
- Keep styles local to the component.

**Class naming**

```css
.block {
}
.block__elem {
}
.block--variant {
}
```

**Example**

```css
/* Button.module.css */
.button {
  padding: var(--space-2) var(--space-4);
}
.button--primary {
  background: var(--accent);
  color: var(--accent-ink);
}
.button__icon {
  margin-inline-start: var(--space-2);
}
```

---

## 4) Imports & Order

1. Node/React/Next
2. Third-party libs
3. Aliases (`@/state`, `@/ui`, `@/lib`, etc.)
4. Relative (`./`, `../`)

Group with an empty line between groups; alphabetize within groups.

---

## 5) State & Data

- Zustand for game/session and small UI state (`src/state/*`).
- React Context only for cross-app concerns (auth/theme).
- Side effects and async live in hooks or lib, not UI components.

---

## 6) API & Config

- Read only `NEXT_PUBLIC_*` keys via `src/config/config.ts`.
- Centralized fetch helpers in `src/lib/api-client.ts` (when added).
- Never log tokens/PII to console.

---

## 7) Comments & Docs

- Prefer self-documenting code; use JSDoc for exported functions/hooks and non-obvious logic.
- Write **WHY** comments, not **WHAT**:

```tsx
// WHY: avoid double-submit in rapid clicks; disable button until server ack
```

---

## 8) Accessibility (a11y)

- Semantic HTML first (`button`, `label`, `nav`, `main`).
- Every interactive element has discernible text.
- Keyboard focus visible and logical.
- Use `aria-*` only when semantics aren't enough.

---

## 9) Testing

- Vitest + RTL for components; one test file per component/page.
- MSW for network mocking.
- Keep tests fast and focused (happy path + key errors).
- E2E: Playwright smoke test(s) later.

---

## 10) Performance

- Prefer server components; minimize client boundaries.
- Avoid unnecessary re-renders: memoize hot paths, stable deps.
- Keep payloads small; lazy-load non-critical features.

---

## 11) Git Hygiene

- Conventional Commits enforced.
- Pre-commit runs Prettier + ESLint (lint-staged).
- PRs must include a11y + Lighthouse notes for UI changes.
