# TUIZ Frontend Agent Brief

## Snapshot

- Next.js 15 App Router + React 19, strict TS 5.7; code lives under `src/`.
- Styling = CSS Modules + Tailwind tokens (#BFF098→#6FD6FF) via shadcn-style primitives in `src/ui`.
- Global providers (`AuthProvider`, `AnimationProvider`, `SocketProvider`) are composed in `src/app/layout.tsx`.

## Architecture map

- Routes in `src/app` default to Server Components; add `'use client'` only for interactive islands (animations, sockets).
- Feature work belongs in `src/features/<feature>/{components,hooks,types}`; share via `@/ui`, `@/lib`, `@/state` only.
- UI primitives live in `src/components/ui` and are re-exported from `src/ui/index.ts` (always import with `@/ui`).

## Integration & data

- Supabase auth is handled client-side (`src/lib/supabaseClient.ts`, `useAuthStore`); forward `session.access_token` on backend fetches.
- Configuration comes from `src/config/config.ts` (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, optional `NEXT_PUBLIC_API_BASE`).
- Real-time flows use `SocketProvider` (Socket.IO); mirror backend `server:*`/`client:*` events and keep business logic in feature hooks.

## Styling & conventions

- Compose classes with `cn` from `@/lib/utils` and CVA variants (see `src/components/ui/button.tsx`) instead of ad-hoc strings.
- Respect design tokens in `src/styles/tokens.css`; never hard-code gradients or brand colors.
- Imports follow React → third-party → `@/` aliases → relative; avoid deep `../../` paths thanks to the alias.

## State & async flows

- Create domain-specific Zustand stores under `src/state` (patterned after `useUiStore.ts`); keep them serialization-friendly and side-effect free.
- Co-locate data-fetching hooks inside the owning feature; use `src/lib/api-client.ts` for shared fetch helpers and include Supabase session when needed.
- Validate Supabase payloads with feature-specific types to keep Vitest suites reliable.

## Developer workflows

- Setup: `npm install`, `.env.local` with required `NEXT_PUBLIC_*`, then `npm run dev` (http://localhost:3000).
- Quality gates: `npm run lint`, `npm run typecheck`, `npm run build` before raising a PR.
- Tests: run `vitest` or `npm run test:watch` for unit/ui suites; Playwright smoke tests via `npm run e2e:ui` when touching flows.
- Husky + lint-staged auto-run Prettier and `eslint --max-warnings=0` on staged files.

## Testing expectations

- RTL suites live in `src/__tests__`; rely on role/label queries and reuse MSW handlers from `src/test/msw/server.ts`.
- For new primitives, add variant/accessibility coverage similar to `Button.test.tsx`; mock Supabase via MSW instead of stubbing fetch.
- Storybook is not present—lean on unit tests + docs for UI behavior notes.

## When extending

- New shared primitives go in `src/components/ui/` + `src/ui/index.ts`; document variant intent inside the file.
- Feature routes should render inside existing route groups under `src/app/(pages)/`; keep server components thin and delegate logic to feature hooks.
- Update the living docs in `docs/ARCHITECTURE.md` and `docs/FRONTEND-STANDARDS.md` whenever patterns or workflows shift.
