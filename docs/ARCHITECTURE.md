# Architecture (tuiz-frontend)

High-level map of where things live and how data flows.

## Goals

- Keep feature code close together (components + hooks + types).
- Keep shared UI tiny and composable.
- Centralize config/env reads.
- Make testing easy (unit/UI + MSW; E2E later).

## Layers

1. **App Router (src/app)**
   - Routes (`page.tsx`), layouts (`layout.tsx`), and metadata.
   - Prefer **Server Components** by default.
   - Add `'use client'` only for interactive islands.

2. **Features (src/features/\*)**
   - Feature-first folders: `quiz/`, `host/`, `player/` (TBD).
   - Each feature can own:
     - `components/` (client/server components)
     - `hooks/` (data fetching, state glue)
     - `types.ts` (feature-specific types)
   - No cross-feature imports except via shared `ui/`, `lib/`, or `state/`.

3. **UI Primitives (src/ui)**
   - Shared, low-level building blocks: `Button`, `Card`, `Input`, `Modal`.
   - CSS Modules + **tokens.css** variables only (no hardcoded colors/sizes).

4. **State (src/state)**
   - **Zustand** for game/session + small UI bits.
   - Keep stores small; avoid putting API logic here.

5. **Config (src/config/config.ts)**
   - Single source of truth for **public** env (`NEXT_PUBLIC_*`).
   - Example keys: `NEXT_PUBLIC_API_BASE`, Supabase public keys.

6. **Lib (src/lib)**
   - Small, framework-agnostic helpers:
     - `api-client.ts` (typed fetch wrapper; optional)
     - `time.ts`, `utils.ts`
     - `supabaseClient.ts` (already scaffolded)

7. **Styles (src/styles)**
   - `tokens.css` (design tokens), `globals.css`.
   - Components import tokens via CSS Modules.

8. **Tests**
   - `src/__tests__/` – Vitest + RTL component tests.
   - `src/test/msw/` – MSW server/handlers for API mocks.
   - `src/test/e2e/` – Playwright smoke tests (placeholder).

## Data Flow

```
[UI Component] --(calls)--> [Feature Hook] --(uses)--> [lib/api-client or supabase]
       |
       v
[state (zustand)]
```

- Components remain light; effects and network requests live in hooks/lib.
- Zustand holds minimal UI/game state. Server remains source of truth.

## Routing

- `src/app/` defines URL structure.
- Keep route handlers (`src/app/api/*`) light and only if necessary (most server logic should live in the backend repo).

## Error & Loading UX

- Use Next.js **loading.tsx** / **error.tsx** in route segments when helpful.
- Keep error shapes small; show friendly messages, log details only in dev.

## Future (TBD)

- `features/host`, `features/player` once flows are defined.
- Real-time: integrate sockets in client components only where needed.
- Analytics/perf hooks (Lighthouse checks in PR template).
