# Engineering Conventions (tuiz-frontend)

Practical rules that keep the codebase consistent and maintainable.

## Components

- Prefer **Server Components**; add `use client` only when needed.
- Co-locate small components with their feature; put shared primitives in `src/ui`.
- Keep components ≤ 150 lines; extract subcomponents/hooks if bigger.
- Props are typed; avoid `any`.

## Hooks

- Keep async/data-fetching in `hooks/` or `lib/`, not in UI.
- Name hooks by behavior: `useRoom`, `useHostActions`.
- Hooks should accept plain values, not entire objects (makes testing easier).

## State (Zustand)

- One store per purpose (e.g., `useGameStore`, `useUiStore`).
- Stores contain **state + simple setters** only; avoid heavy logic or I/O.
- Derive values in selectors (e.g., `useGameStore(s => s.status)`).

## Styles

- CSS Modules + tokens; no inline constant colors/sizes.
- BEM-ish classes: `.block`, `.block__elem`, `.block--variant`.

## Imports

- Group: core → third-party → aliases → relative.
- Avoid deep relative paths (`../../..`); use `@/*` alias.

## Config & Env

- Only read `NEXT_PUBLIC_*` in the frontend (`src/config/config.ts`).
- Backend secrets live in the backend repo.

## Error Handling

- Show friendly UI; log details only in dev.
- Avoid `alert()` in real UI; use proper toasts later.

## Accessibility

- Keyboard-first: every interactive control is reachable & labeled.
- Use semantic elements. Prefer `button` over clickable `div`.
- Ensure visible focus outlines and adequate contrast.

## Performance

- Minimize client boundaries; prefer RSC.
- Memoize hot paths; stabilize props.
- Lazy-load non-critical chunks.

## Docs & Hygiene

- Keep `docs/` up to date alongside changes.
- PRs must include a11y and Lighthouse note (see template).
- Conventional Commits; Prettier + ESLint enforced on pre-commit.
