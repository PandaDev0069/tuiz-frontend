# Frontend Coding Standards (Next.js + TypeScript)

Opinionated, lightweight rules so features stay consistent and easy to maintain.

**Current Tech Stack:**

- **Next.js 15.4.7** with App Router and React Server Components
- **React 19.1.0** with concurrent features and JSX transform
- **TypeScript 5.7.5** in strict mode
- **Tailwind CSS 4.1.12** with custom design tokens
- **shadcn/ui architecture** with Radix primitives and CVA variants
- **Vitest + React Testing Library** with 80+ tests

---

## 1) Naming & File Layout

**Files/Folders**

- Components: `PascalCase` → `QuizCard.tsx`
- Hooks: `useThing.ts` → `useGameStore.ts`
- Utilities: `camelCase.ts` → `apiClient.ts`, `time.ts`
- CSS Modules: `Component.module.css`
- Tests: `Component.test.tsx`, `page.test.tsx`

**Structure (current implementation)**

```
src/
├── app/                           # ✅ Next.js App Router
│   ├── layout.tsx                 # ✅ Root layout with providers
│   ├── page.tsx                   # ✅ Home page with Japanese UI
│   ├── AnimationController.tsx    # ✅ Animation provider
│   └── SocketProvider.tsx         # ✅ Socket.io integration
│
├── components/                    # ✅ shadcn/ui architecture
│   └── ui/                        # ✅ Shared UI primitives
│       ├── badge.tsx              # ✅ Badge with CVA variants
│       ├── button.tsx             # ✅ Button with gradient/tall variants
│       ├── card.tsx               # ✅ Card with glass/accent variants
│       ├── flex.tsx               # ✅ Flex layout component
│       ├── input.tsx              # ✅ Input with variant support
│       ├── layout.tsx             # ✅ Header/Main/Footer/Container
│       ├── scroll-area.tsx        # ✅ Custom scrollbar system
│       ├── scroll-demo.tsx        # ✅ Scrollbar demo component
│       ├── typography.tsx         # ✅ Heading/Text components
│       └── index.ts               # ✅ Component exports
│
├── ui/                            # ✅ Clean re-export layer
│   └── index.ts                   # ✅ import { Button } from '@/ui'
│
├── lib/                           # ✅ Utilities and helpers
│   ├── supabaseClient.ts          # ✅ Supabase integration
│   ├── utils.ts                   # ✅ cn() class merger
│   └── useScroll.ts               # ✅ Custom scroll hooks
│
├── state/                         # ✅ Zustand stores
│   └── useUiStore.ts              # ✅ UI state management
│
├── styles/                        # ✅ Styling system
│   ├── globals.css                # ✅ Global styles + scrollbar
│   ├── scrollbar.css              # ✅ Custom scrollbar utilities
│   ├── tokens.css                 # ✅ Design tokens (#BFF098 → #6FD6FF)
│   └── utilities.css              # ✅ Utility classes
│
├── config/                        # ✅ Configuration
│   └── config.ts                  # ✅ NEXT_PUBLIC_* env vars
│
├── __tests__/                     # ✅ Comprehensive test suite (80+ tests)
│   ├── Badge.test.tsx             # ✅ Component tests
│   ├── button.test.tsx            # ✅ Button variant tests
│   ├── Card.test.tsx              # ✅ Card component tests
│   ├── Container.test.tsx         # ✅ Layout tests
│   ├── Flex.test.tsx              # ✅ Flex layout tests
│   ├── Home.test.tsx              # ✅ Home page tests
│   ├── HomePage.integration.test.tsx # ✅ Integration tests
│   ├── Input.test.tsx             # ✅ Input component tests
│   ├── page.test.tsx              # ✅ Page-level tests
│   ├── Typography.test.tsx        # ✅ Typography tests
│   └── setupTests.ts              # ✅ Test configuration
│
├── test/                          # ✅ Testing infrastructure
│   ├── msw/
│   │   └── server.ts              # ✅ MSW server setup
│   └── e2e/
│       └── smoke.spec.ts          # ✅ Playwright E2E
│
└── docs/                          # ✅ Documentation
    ├── ARCHITECTURE.md            # ✅ Architecture overview
    ├── ENGINEERING.md             # ✅ Engineering conventions
    ├── FRONTEND-STANDARDS.md      # ✅ This file
    ├── SCROLLBAR.md               # ✅ Scrollbar system docs
    └── TESTING.md                 # ✅ Testing guidelines
```

---

## 2) TypeScript & Components

### Current Implementation

- **React.forwardRef pattern** for all UI components with proper ref typing
- **Class-variance-authority (CVA)** for systematic variant management
- **shadcn/ui architecture** with Radix primitives and clean re-exports
- **Strict TypeScript** with no implicit any, proper interface definitions
- **Server Components** by default; add `'use client'` only when needed

**Component Template (Current Pattern)**

```tsx
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const componentVariants = cva('base-classes', {
  variants: {
    variant: {
      default: 'variant-classes',
      accent: 'accent-classes',
    },
    size: {
      sm: 'small-classes',
      lg: 'large-classes',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'sm',
  },
});

export interface ComponentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof componentVariants> {}

const Component = React.forwardRef<HTMLDivElement, ComponentProps>(
  ({ className, variant, size, ...props }, ref) => (
    <div ref={ref} className={cn(componentVariants({ variant, size }), className)} {...props} />
  ),
);
Component.displayName = 'Component';

export { Component, componentVariants };
```

---

## 3) Tailwind CSS & Design System

### Current Implementation

- **Tailwind CSS 4.1.12** with custom configuration and design tokens
- **CSS Variables** in `tokens.css` for consistent theming (#BFF098 → #6FD6FF gradient)
- **Class merging** with `cn()` utility from `@/lib/utils` (clsx + tailwind-merge)
- **Custom scrollbar system** with cross-browser support and gradient integration
- **Component variants** using CVA for systematic styling patterns

**Design Token Usage**

```css
/* tokens.css - Design system foundation */
:root {
  --primary: 221.2 83.2% 53.3%;
  --gradient-start: #bff098;
  --gradient-end: #6fd6ff;
  /* ... more tokens */
}
```

**Class Naming & Patterns**

```tsx
// Use cn() for safe class merging
className={cn(baseStyles, variants[variant], className)}

// Design token integration
'bg-gradient-to-r from-primary to-secondary'

// Consistent spacing and sizing
'h-12 px-6 py-3' // tall button variant
'rounded-3xl'     // more rounded cards
'hover:shadow-2xl hover:shadow-black/20' // dark hover shadows
```

**Custom Scrollbar Example**

```tsx
import { ScrollArea } from '@/ui';

<ScrollArea variant="thin" orientation="vertical">
  <div className="space-y-4">{/* scrollable content */}</div>
</ScrollArea>;
```

---

## 4) Imports & Organization

### Current Import Conventions

- **Alias mapping**: `@/` maps to `src/` (configured in tsconfig.json and vitest.config.ts)
- **UI imports**: Always use `import { Component } from '@/ui'` (not direct component paths)
- **Import grouping**: React → Third-party → Aliases → Relative
- **Alphabetical ordering**: Within each group, maintain alphabetical order

**Import Order Example**

```tsx
// 1. React and Next.js
import * as React from 'react';
import Image from 'next/image';

// 2. Third-party libraries
import { cva, type VariantProps } from 'class-variance-authority';
import { FaBolt, MdSchool } from 'react-icons';

// 3. Internal aliases (@/)
import { Button, Card, CardContent } from '@/ui';
import { cn } from '@/lib/utils';
import { useGameStore } from '@/state';

// 4. Relative imports
import './Component.module.css';
```

### File Organization

- **Components**: `src/components/ui/` with individual component files
- **Re-exports**: `src/ui/index.ts` for clean import paths
- **Tests**: `src/__tests__/` with matching component names
- **Utilities**: `src/lib/` for shared helpers and hooks

---

## 5) State Management & Data Flow

### Current Implementation

- **Zustand stores** for global state (`src/state/useUiStore.ts`)
- **React Context** for provider patterns (`SocketProvider`, `AnimationProvider` in layout)
- **No Redux** - prefer Zustand for simplicity and performance
- **Server Components** handle data fetching where possible

**State Management Patterns**

```tsx
// Zustand store example (current useUiStore pattern)
import { create } from 'zustand';

interface UiState {
  isLoading: boolean;
  theme: 'light' | 'dark';
  setLoading: (loading: boolean) => void;
  toggleTheme: () => void;
}

export const useUiStore = create<UiState>((set, get) => ({
  isLoading: false,
  theme: 'light',
  setLoading: (loading) => set({ isLoading: loading }),
  toggleTheme: () => set({ theme: get().theme === 'light' ? 'dark' : 'light' }),
}));
```

**Context Providers (Current Layout Integration)**

```tsx
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body>
        <AnimationProvider>
          <SocketProvider>{children}</SocketProvider>
        </AnimationProvider>
      </body>
    </html>
  );
}
```

---

## 6) Configuration & Environment

### Current Configuration System

- **Centralized config**: `src/config/config.ts` reads all `NEXT_PUBLIC_*` environment variables
- **Type safety**: Proper interfaces for all configuration objects
- **Frontend scope**: Only public environment variables (`NEXT_PUBLIC_API_BASE`, Supabase keys)
- **Backend separation**: Server secrets remain in backend repository

**Configuration Example**

```tsx
// src/config/config.ts
export const config = {
  apiBase: process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080',
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  },
  isDevelopment: process.env.NODE_ENV === 'development',
};
```

### Integration Points

- **Socket.io**: Real-time connection auto-connects to localhost:8080
- **Supabase**: Client SDK for authentication and data management
- **API Communication**: Express backend on port 8080 with unified error contracts

---

## 7) Documentation & Code Quality

### Current Practices

- **Self-documenting code** with meaningful component and variable names
- **JSDoc comments** for exported functions, custom hooks, and complex logic
- **WHY over WHAT** - explain reasoning rather than restating obvious code
- **Living documentation** - keep docs updated with implementation changes

**Documentation Examples**

```tsx
/**
 * Custom scroll area component with gradient-themed scrollbars
 * Supports multiple variants and orientations for consistent UX
 */
export const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ variant = 'default', orientation = 'vertical', children }) => {
    // WHY: Different scroll classes provide visual consistency across browsers
    const scrollClasses = {
      default: '',
      thin: 'scrollbar-thin',
      hidden: 'scrollbar-hidden',
    };

    // ... implementation
  },
);
```

### Code Quality Standards

- **Meaningful naming**: `isGameActive` over `flag`, `userProfile` over `data`
- **Component documentation**: Props interface with JSDoc descriptions
- **Architecture decisions**: Document significant technical choices in `/docs`

---

## 8) Accessibility Standards

### Current Implementation

- **Semantic HTML**: Use proper elements (`button`, `nav`, `main`, `header`, `footer`)
- **ARIA compliance**: Comprehensive labeling with `aria-label`, `aria-describedby`
- **Keyboard navigation**: All interactive elements reachable and properly focused
- **Screen reader support**: Meaningful text content and proper heading hierarchy
- **Focus management**: Visible focus outlines and logical tab order

**Accessibility Patterns**

```tsx
// Semantic structure (current page.tsx pattern)
<Header>
  <Container>
    <h1>TUIZ情報王</h1> {/* Proper heading hierarchy */}
  </Container>
</Header>

<Main>
  {/* Main content area */}
</Main>

<Footer role="contentinfo">
  {/* Footer information */}
</Footer>

// Interactive elements with proper labeling
<Button
  variant="gradient"
  aria-label="ホストとしてログイン"
>
  ログイン
</Button>

// Images with descriptive alt text
<Image
  src="/logo.png"
  alt="TUIZ quiz platform logo"
  width={100}
  height={100}
/>
```

### Testing Integration

- **Accessibility testing** in component test suites
- **Role-based queries**: Use `getByRole`, `getByLabelText` in tests
- **Keyboard testing**: Validate tab order and keyboard interactions

---

## 9) Testing Strategy

### Current Test Suite (80+ tests)

- **Vitest + React Testing Library** for component and unit testing
- **MSW (Mock Service Worker)** for API mocking and network interception
- **Playwright** configured for E2E testing (ready for implementation)
- **User-centric testing** with `getByRole`, `getByText`, `getByLabelText`

**Testing Patterns**

```tsx
// Component testing (current pattern)
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/ui';

describe('Button Component', () => {
  it('renders with gradient variant', () => {
    render(<Button variant="gradient">Test Button</Button>);
    expect(screen.getByRole('button', { name: /test button/i })).toBeInTheDocument();
  });

  it('handles user interactions', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<Button onClick={handleClick}>Click me</Button>);
    await user.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Test Organization

- **Component tests**: `src/__tests__/Component.test.tsx` matching component names
- **Integration tests**: `HomePage.integration.test.tsx` for complete user flows
- **Accessibility testing**: Validate ARIA labels and keyboard navigation
- **Japanese content**: Proper handling of internationalized text content

### Quality Metrics

- **Comprehensive coverage**: All UI components and critical user flows tested
- **Behavior over implementation**: Test user-visible outcomes, not internal structure
- **Fast and focused**: Keep tests quick and isolated for reliable CI/CD

---

## 10) Performance Optimization

### Current Implementation

- **Server Components** by default to minimize client-side JavaScript
- **React.forwardRef** with proper memoization to prevent unnecessary re-renders
- **Stable prop references** in CVA variants and className merging
- **Next.js Image optimization** with automatic format selection and lazy loading

**Performance Patterns**

```tsx
// Server Component (default - no 'use client')
export default function QuizCard({ title, description }) {
  return (
    <Card variant="glass">
      <CardContent>
        <h3>{title}</h3>
        <p>{description}</p>
      </CardContent>
    </Card>
  );
}

// Client Component (only when needed)
('use client');
export function InteractiveButton() {
  const [isActive, setIsActive] = useState(false);
  // ... client-side logic
}

// Image optimization (current pattern)
<Image
  src="/logo.png"
  alt="logo"
  width={100}
  height={100}
  className="animate-float rounded-full"
  priority // for above-the-fold images
/>;
```

### Real-time Features

- **Socket.io optimization**: Efficient connection management in `SocketProvider`
- **Animation performance**: Framer Motion integrated via `AnimationProvider` with latency-aware tuning
- **Custom scrollbar system**: Optimized rendering with minimal performance impact

---

## 11) Development Workflow

### Current Quality Pipeline

- **Conventional Commits** with structured commit messages (type, scope, description)
- **Pre-commit hooks** with husky + lint-staged running Prettier + ESLint
- **TypeScript strict mode** with comprehensive type checking (`npm run typecheck`)
- **Automated testing** with 80+ tests covering components and integration flows

**Git Workflow**

```bash
# Quality assurance commands
npm run lint        # ESLint + Prettier validation
npm run typecheck   # TypeScript strict checking
npm test           # Vitest test suite (80+ tests)
npm run build      # Next.js production build validation
npm run e2e        # Playwright E2E tests
```

**Commit Standards**

```bash
# Examples of conventional commits
feat: add gradient variant to Button component
fix: resolve TypeScript errors in Typography tests
test: update component tests for Tailwind CSS compatibility
docs: update FRONTEND-STANDARDS with current tech stack
style: improve card border radius and hover shadows
```

### Pull Request Requirements

- **Accessibility validation**: ARIA compliance and keyboard navigation testing
- **Performance check**: Bundle size impact and Lighthouse scores for UI changes
- **Documentation updates**: Keep `/docs` directory current with architectural changes
- **Test coverage**: New components require corresponding test files

### Integration Points

- **Real-time communication**: Socket.io auto-connection with error handling
- **Database integration**: Supabase client SDK for authentication and persistence
- **API communication**: Unified error contracts with Express backend
- **Animation system**: Latency-aware animation tuning via `AnimationController`
