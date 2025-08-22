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
├── auth/                        # Authentication test suites
│   ├── LoginPage.test.tsx       # Login form and validation
│   └── RegisterPage.test.tsx    # Registration flow and validation
├── components/                  # UI component tests
│   ├── Badge.test.tsx           # Badge component variants
│   ├── button.test.tsx          # Button interactions and variants
│   ├── Card.test.tsx            # Card component layouts
│   ├── Container.test.tsx       # Container responsive behavior
│   ├── Flex.test.tsx            # Flex layout system
│   └── Typography.test.tsx      # Typography variants and hierarchy
├── integration/                 # Cross-component integration tests
│   ├── auth-flow.test.ts        # Complete authentication flows
│   ├── login-integration.test.tsx # Login page integration
│   └── register-integration.test.tsx # Register page integration
├── pages/                       # Page-level component tests
│   ├── Home.test.tsx            # Homepage component
│   └── HomePage.integration.test.tsx # Homepage integration
├── helpers/                     # Test utilities and helpers
│   ├── testDatabase.ts          # Database test helpers
│   └── testUtils.tsx            # Common test utilities
├── msw/                         # Mock Service Worker setup
│   ├── auth-handlers.ts         # Authentication API mocks
│   └── server.ts               # MSW server configuration
└── setupTests.tsx               # Global test configuration

src/test/e2e/                    # End-to-end tests
├── auth-smoke.spec.ts           # Authentication smoke tests
├── auth-login.spec.ts           # Comprehensive login tests
├── auth-register.spec.ts        # Comprehensive register tests
├── auth-integration.spec.ts     # Auth flow integration tests
└── smoke.spec.ts               # Basic smoke tests
```

## Running

```bash
npm test              # Vitest run mode (CI-friendly, --run flag)
npm run test:ui       # Vitest UI mode for interactive debugging
npm run test:coverage # Test coverage report
npm run e2e          # Playwright E2E tests (runs locally or in CI)
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

### Unit Tests (117 tests)

- **Components**: All UI components with variant testing (Button, Card, Typography, Layout, Flex, Badge, Input)
- **State Management**: Zustand stores and React hooks
- **Utilities**: Helper functions and custom logic
- **Authentication**: Login/register form validation

### Integration Tests (22 tests)

- **Authentication Flows**: Complete login/register workflows
- **Page Components**: Multi-component interactions (Homepage with Japanese content)
- **API Integration**: With MSW mocked backends
- **State Persistence**: Cross-component state management

### E2E Tests (13 smoke tests + 39 comprehensive)

- **Authentication**: Login and registration user journeys
- **Cross-browser**: Chrome, Firefox, Safari testing
- **Responsive**: Mobile and desktop viewports
- **Accessibility**: Keyboard navigation and ARIA compliance

**Total Coverage**: 139 unit/integration tests + 52 E2E tests = 191 tests

## CI Pipeline

```bash
# Complete CI validation
npm run lint        # ESLint + Prettier validation
npm run typecheck   # TypeScript strict mode checking
npm test           # Vitest component and unit tests (139 tests)
npm run build      # Next.js production build validation
npm run e2e        # Playwright E2E tests (52 tests across browsers)

Notes:
- The GitHub Actions workflow runs a dedicated `e2e` job which installs Playwright browsers, runs `npm run e2e`, and uploads the generated `playwright-report` as a build artifact for review.
```
