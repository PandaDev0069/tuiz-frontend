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
  app/           # Next App Router pages/layouts
  ui/            # shared UI primitives only
  features/      # feature-first islands (components/hooks/types)
  state/         # zustand stores
  styles/        # tokens.css, globals.css
  config/        # env reader (NEXT_PUBLIC_* only)
  lib/           # small helpers (fetch, time, utils)
  __tests__/     # unit/UI tests (Vitest + RTL)
  test/          # MSW handlers + e2e (Playwright)
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
