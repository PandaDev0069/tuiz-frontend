# Contributing to tuiz-frontend

Thanks for helping improve **TUIZ** 🎉

## Local Setup

1. Node 22+ and npm installed
2. Install deps: `npm install`
3. Create `.env.local` (see `src/config/config.ts`)
4. Run dev: `npm run dev`

## Branch & PR

- Branch from `main`: `feat/<scope>-<desc>` or `fix/<scope>-<desc>`
- Keep PRs focused; include screenshots for UI changes
- Update docs when routes/contracts or major UX change

## Commits

- Conventional Commits:
  - `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `perf:`, `test:`, `build:`, `ci:`, `chore:`
- Example: `feat(host): add header nav`

## Code Style

- TypeScript strict; avoid `any`
- Feature-first structure under `src/features/*`
- Shared UI only in `src/ui/*`
- CSS Modules + BEM-ish class names

## Testing

- Unit/UI with Vitest + Testing Library
- MSW for API mocking (optional)
- E2E smoke with Playwright (later)

## Security

- Read only `NEXT_PUBLIC_*` client keys
- Never log secrets/PII to console

## Accessibility

- Prefer semantic elements, labels, and keyboard navigation
- Run Lighthouse/axe for new complex UI

## Performance

- Avoid unnecessary client components
- Memoize expensive renders; use `use`/Server Actions where fit
