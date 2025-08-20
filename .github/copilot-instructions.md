# TUIZ Frontend - AI Coding Agent Instructions

## Project Context

TUIZ is an interactive quiz platform with a Next.js 15 frontend and Express backend. The frontend uses App Router with strict TypeScript, emphasizing component-driven UI with a distinctive bright gradient design system.

## Architecture Overview

### Dual UI System Pattern

- **Components**: `src/components/ui/` - shadcn/ui-style components with Radix primitives
- **UI Exports**: `src/ui/index.ts` - Re-exports all components for clean imports (`import { Button } from '@/ui'`)
- Components use React.forwardRef, class-variance-authority (cva) for variants, and the `cn()` utility for class merging

### State Management Strategy

- **Zustand**: Global state (see `src/state/useUiStore.ts` for theme, toast patterns)
- **React Context**: Provider pattern for app-wide concerns (`SocketProvider`, `AnimationProvider` in layout)
- **No Redux**: Prefer Zustand for simple global state, Context for provider-based state

### Styling System

- **Design Tokens**: `src/styles/tokens.css` defines the primary gradient theme (#BFF098 → #6FD6FF)
- **Tailwind Config**: Uses CSS variables from tokens.css for consistent theming
- **Component Variants**: Use cva for consistent variant patterns across components
- **Class Utilities**: Always use `cn()` from `@/lib/utils` to merge classes safely

## Key Development Patterns

### Component Development

```typescript
// Standard component pattern
const Component = React.forwardRef<HTMLElement, ComponentProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <Element
      ref={ref}
      className={cn(baseStyles, variants[variant], className)}
      {...props}
    />
  )
);
```

### Testing Approach

- **Unit Tests**: `src/__tests__/` using Vitest + React Testing Library
- **Test by Behavior**: Use `getByRole`, `getByText` rather than implementation details
- **MSW Setup**: `src/test/msw/server.ts` for API mocking (already configured in setupTests.ts)
- **E2E**: Playwright specs in `src/test/e2e/` (minimal smoke tests)

### Import Conventions

- **Alias**: `@/` maps to `src/` (configured in tsconfig.json and vitest.config.ts)
- **UI Imports**: Always use `import { Component } from '@/ui'` (not direct component paths)
- **Config Pattern**: Single source config in `src/config/config.ts` reading `NEXT_PUBLIC_*` env vars

### Environment & Integration

- **Backend Communication**: Socket.io client auto-connects to localhost:8080 in SocketProvider
- **Supabase**: Client SDK configured via env vars (NEXT_PUBLIC_SUPABASE_URL/ANON_KEY)
- **API Integration**: Default backend URL http://localhost:8080 (configurable via NEXT_PUBLIC_API_BASE)

## Development Workflow

### Essential Commands

```bash
npm run dev          # Next.js dev server (port 3000)
npm test            # Vitest unit tests
npm run test:ui     # Vitest UI for debugging
npm run build       # Production build
npm run typecheck   # TypeScript validation
npm run e2e         # Playwright E2E tests
```

### Error Handling Patterns

- Components should handle loading/error states gracefully
- Use Zustand toast state (`useUiStore`) for user notifications
- Follow the unified error contract pattern from backend integration

### Code Quality Standards

- **Strict TypeScript**: No implicit any, proper interface definitions
- **ESLint + Prettier**: Auto-formatted via lint-staged pre-commit hooks
- **Import Organization**: Alphabetized imports enforced by ESLint
- **Accessibility**: Prefer semantic HTML, proper ARIA labels, keyboard navigation

## Integration Points

- **Real-time**: Socket.io connection established in SocketProvider for quiz interactions
- **Authentication**: Supabase client SDK for user management
- **Animation**: Framer Motion integrated via AnimationProvider wrapper
- **Backend API**: Express server on port 8080 with unified JSON error contracts

When adding new features:

1. Create components in `src/components/ui/` following the forwardRef + cva pattern
2. Export from `src/components/ui/index.ts` and re-export from `src/ui/index.ts`
3. Add corresponding unit tests in `src/__tests__/`
4. Use design tokens from `tokens.css` for consistent theming
5. Follow the existing Zustand patterns for state management
