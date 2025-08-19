# Testing (tuiz-frontend)

## Tools

- **Vitest** – test runner
- **React Testing Library** – component testing
- **jest-dom** – better matchers
- **MSW** – mock network
- **Playwright** – E2E smoke (later)

## Structure

```
src/__tests__/              # component/unit tests
src/test/msw/server.ts      # MSW setup
src/test/e2e/smoke.spec.ts  # Playwright smoke (later)
```

## Running

```bash
npm test         # Vitest (CI-friendly)
npm run test:ui  # Vitest UI (optional)
npm run e2e      # Playwright (after installing @playwright/test)
```

## Patterns

### 1) Component Tests

- Prefer testing by user-visible behavior (text, roles) rather than implementation.
- Keep each test focused; avoid deep render trees.

**Example:**

```typescript
import { render, screen } from '@testing-library/react';
import { Button } from '@/ui';

test('renders label', () => {
  render(<Button>Click</Button>);
  expect(screen.getByRole('button', { name: /click/i })).toBeInTheDocument();
});
```

### 2) Network Mocking (MSW)

- Use MSW to intercept fetch or client SDK calls.
- Handlers live near features or inside `src/test/msw/handlers.ts`.

```typescript
// example handler
import { http, HttpResponse } from 'msw';

export const handlers = [http.get('/api/health', () => HttpResponse.json({ ok: true }))];
```

### 3) E2E (Playwright)

- Keep just a smoke spec at first (homepage loads).
- Add more only when a user flow stabilizes (e.g., join room).

## CI

- Run `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`.
- Add `e2e` to CI only after Playwright is installed and the flow is stable.
