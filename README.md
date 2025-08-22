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

### Unit & Integration Tests

- **Vitest** + **React Testing Library** for component testing
- **MSW (Mock Service Worker)** for API integration tests
- **139 tests** covering authentication, form validation, and user interactions
- Test database helpers for realistic data scenarios

```bash
npm test            # Run all tests
npm run test:ui     # Vitest UI for debugging
npm run test:watch  # Watch mode
```

### E2E Tests

- **Playwright** for end-to-end testing across Chrome, Firefox, Safari
- **13 smoke tests** covering authentication flows
- Responsive design and accessibility testing

```bash
npm run e2e         # Run all E2E tests
npm run e2e -- --ui # Playwright UI mode
```

### Test Coverage

- ✅ Login & Register forms with full validation
- ✅ User authentication flows and state management
- ✅ Form field interactions and error handling
- ✅ Navigation between auth pages
- ✅ Responsive design across viewports
- ✅ Accessibility features (ARIA, keyboard navigation)
