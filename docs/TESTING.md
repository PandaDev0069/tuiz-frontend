# Testing (tuiz-frontend)

## Tools

- **Vitest** – test runner with UI mode
- **React Testing Library** – component testing with user-centric approach
- **jest-dom** – enhanced DOM matchers
- **MSW (Mock Service Worker)** – API mocking and network interception
- **Playwright** – E2E testing (configured, ready for implementation)

## Tech Stack Integration

- **Next.js 15** with App Router testing patterns
- **TypeScript** strict mode for type-safe tests
- **Tailwind CSS** class testing with proper selectors
- **React 19** concurrent features testing support
- **shadcn/ui + CVA** component variant testing

## Structure

```
src/__tests__/                    # Component and unit tests
├── Badge.test.tsx               # UI component tests
├── button.test.tsx              # Button variant tests
├── Card.test.tsx                # Card component tests
├── Container.test.tsx           # Layout container tests
├── Flex.test.tsx                # Flex layout tests
├── Home.test.tsx                # Home page component tests
├── HomePage.integration.test.tsx # Integration tests
├── Input.test.tsx               # Input component tests
├── page.test.tsx                # Page-level tests
├── Typography.test.tsx          # Typography component tests
└── setupTests.ts                # Global test configuration

src/test/msw/
├── server.ts                    # MSW server setup
└── handlers/                    # API mock handlers

src/test/e2e/
└── smoke.spec.ts               # Playwright E2E tests
```

## Running

```bash
npm test              # Vitest run mode (CI-friendly, --run flag)
npm run test:ui       # Vitest UI mode for interactive debugging
npm run test:coverage # Test coverage report
npm run e2e          # Playwright E2E tests
npm run typecheck    # TypeScript type checking
npm run lint         # ESLint validation
npm run build        # Production build validation
```

## Patterns

### 1) Component Tests

- Test user-visible behavior using `getByRole`, `getByText`, `getByLabelText`
- Use `@testing-library/user-event` for realistic user interactions
- Test component variants using class-variance-authority (CVA) patterns
- Handle Next.js Image component optimization in tests with proper selectors

**Example:**

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/ui';

describe('Button Component', () => {
  it('renders with gradient variant', () => {
    render(<Button variant="gradient">Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
  });

  it('handles tall size variant', () => {
    render(<Button size="tall">Tall Button</Button>);
    const button = screen.getByRole('button', { name: /tall button/i });
    expect(button).toBeInTheDocument();
  });

  it('handles click interactions', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<Button onClick={handleClick}>Interactive</Button>);
    await user.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### 2) Tailwind CSS Testing

- Test component behavior, not specific CSS classes
- Use semantic queries over className assertions
- Test responsive behavior with container queries when needed

```typescript
// Good: Test behavior
expect(screen.getByRole('button')).toBeEnabled();

// Avoid: Testing implementation details
expect(button).toHaveClass('bg-gradient-to-r');
```

### 3) Network Mocking (MSW)

- Use MSW for API mocking and Supabase SDK calls
- Handlers configured in `src/test/msw/server.ts` with auto-setup
- Mock Socket.io connections for real-time features

```typescript
// Example API handler
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/health', () => HttpResponse.json({ status: 'ok' })),
  http.post('/api/quiz/create', () => HttpResponse.json({ id: '123', title: 'Test Quiz' })),
];

// Example component test with MSW
import { server } from '@/test/msw/server';

beforeEach(() => {
  server.use(
    http.get('/api/user/profile', () =>
      HttpResponse.json({ name: 'Test User', avatar: '/test.jpg' }),
    ),
  );
});
```

### 4) Integration Tests

- Test complete user flows across multiple components
- Use realistic data and user interactions
- Test Japanese content rendering and internationalization

```typescript
describe('HomePage Integration Tests', () => {
  it('renders Japanese content correctly', () => {
    render(<HomePage />);
    expect(screen.getByRole('heading', { name: /TUIZ情報王/i })).toBeInTheDocument();
    expect(screen.getByText(/ホストとしてログイン/i)).toBeInTheDocument();
  });
});
```

### 5) E2E Testing (Playwright)

- Comprehensive smoke tests for critical user journeys
- Test real browser interactions and network requests
- Validate responsive design and accessibility

```typescript
import { test, expect } from '@playwright/test';

test('homepage loads and displays main elements', async ({ page }) => {
  await page.goto('http://localhost:3000');

  await expect(page.getByRole('heading', { name: /TUIZ情報王/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /ログイン/i })).toBeVisible();
  await expect(page.getByRole('img', { name: /logo/i })).toBeVisible();
});
```

## Current Test Coverage

- **80+ tests** across all component and integration suites
- **Component tests**: Button, Card, Typography, Layout, Flex, Badge, Input
- **Page tests**: Homepage with Japanese content, integration flows
- **Accessibility tests**: ARIA labels, keyboard navigation, semantic HTML
- **Responsive design**: Grid layouts, mobile-first approach

## CI Pipeline

```bash
# Complete CI validation
npm run lint        # ESLint + Prettier validation
npm run typecheck   # TypeScript strict mode checking
npm test           # Vitest component and unit tests
npm run build      # Next.js production build validation
npm run e2e        # Playwright E2E tests (when implemented)
```
