# tuiz-frontend

Next.js (App Router) + TypeScript frontend for **TUIZ**.

## ✨ Tech
- Next.js (App Router) + TypeScript (strict)
- CSS Modules + design tokens
- Zustand (game/session) + React Context (auth/theme)
- ESLint (flat) + Prettier
- Vitest + RTL (+ MSW), Playwright (later)
- Supabase client SDK (auth)

## 🧰 Requirements
- Node 22+ (Active LTS)
- npm (bundled with Node)

## 🚀 Dev
```bash
npm install
npm run dev
# open http://localhost:3000
```

## 🔐 Environment

- Create .env.local (see keys in src/config/config.ts):
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- (optional) NEXT_PUBLIC_API_BASE → your backend base URL

## 📦 Structure (high level)
```
src/
  app/           # App Router pages/layouts
  ui/            # shared UI primitives
  features/      # feature-first islands
  state/         # zustand stores
  styles/        # tokens.css, globals.css
  config/        # env reader (NEXT_PUBLIC_*)
  lib/           # small helpers (fetch, time, utils)
  __tests__/     # vitest + RTL
  test/          # msw/e2e (later)
```

## 🧪 Testing
- Vitest + Testing Library (unit/UI)
- MSW for API mocking (optional)
- Playwright (smoke E2E) later
