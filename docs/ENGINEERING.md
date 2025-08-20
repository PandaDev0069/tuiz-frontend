# Engineering Conventions (tuiz-frontend)

Practical rules that keep the codebase consistent and maintainable.

## Tech Stack Overview

- **Next.js 15.4.7** with App Router and React Server Components
- **React 19.1.0** with concurrent features and new JSX transform
- **TypeScript 5.7.5** in strict mode with enhanced type checking
- **Tailwind CSS 4.1.12** with custom design tokens and gradient theme
- **Vitest + React Testing Library** for comprehensive testing
- **shadcn/ui architecture** with Radix primitives and CVA variants

## Components

- Use **React.forwardRef** pattern for all UI components with proper ref typing
- Implement **class-variance-authority (CVA)** for consistent variant patterns
- Follow **shadcn/ui architecture**: components in `src/components/ui/`, re-exported via `src/ui/`
- Prefer **Server Components** by default; add `'use client'` only for interactivity
- Keep components ≤ 150 lines; extract subcomponents or custom hooks if larger
- Use **strict TypeScript**: all props typed, avoid `any`, proper interface definitions

**Component Pattern:**

```typescript
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

## Hooks

- Keep async/data-fetching in `hooks/` or `lib/`, not in UI.
- Name hooks by behavior: `useRoom`, `useHostActions`.
- Hooks should accept plain values, not entire objects (makes testing easier).

## State Management

### Zustand Stores

- **Global state**: One store per domain (`useGameStore`, `useUiStore`)
- **Store pattern**: State + simple setters only, avoid complex logic or side effects
- **Selectors**: Derive computed values (`useGameStore(s => s.isGameActive)`)
- **Type safety**: Proper TypeScript interfaces for all store state

### React Context

- **Provider patterns**: App-wide concerns (`SocketProvider`, `AnimationProvider`)
- **Layout integration**: Providers wrapped in `app/layout.tsx`
- **Avoid prop drilling**: Use Context for deeply nested component communication

### No Redux

- Prefer **Zustand** for simple global state management
- Use **React Context** for provider-based state sharing
- Keep state management lightweight and focused

## Styling System

### Design Tokens

- **CSS Variables**: `src/styles/tokens.css` defines the gradient theme (#BFF098 → #6FD6FF)
- **Tailwind Config**: Uses CSS variables for consistent theming across components
- **Component Variants**: CVA for systematic variant patterns

### Tailwind CSS Patterns

- **Class Utilities**: Always use `cn()` from `@/lib/utils` to merge classes safely
- **Responsive Design**: Mobile-first approach with systematic breakpoints
- **Custom Scrollbars**: Comprehensive scrollbar system with gradient theme integration

### Component Styling

```typescript
// Use cn() for class merging
className={cn(baseStyles, variants[variant], className)}

// Design token integration
'bg-gradient-to-r from-primary to-secondary'

// Consistent spacing and sizing
'h-12 px-6 py-3' // tall button variant
```

## Imports & File Organization

### Import Conventions

- **Alias mapping**: `@/` maps to `src/` (configured in tsconfig.json)
- **UI imports**: Always use `import { Component } from '@/ui'` (not direct paths)
- **Import order**: React → Third-party → Aliases → Relative
- **Avoid deep paths**: Use `@/*` aliases instead of `../../..`

### File Structure

```
src/
├── components/ui/        # shadcn/ui-style components
├── ui/index.ts          # Clean re-exports for components
├── app/                 # Next.js App Router pages and layouts
├── lib/                 # Utilities and helpers (utils.ts, hooks)
├── styles/              # Global styles and design tokens
├── state/               # Zustand stores
├── config/              # Environment and configuration
└── __tests__/           # Component and integration tests
```

## Configuration & Environment

### Single Source Config

- **Centralized**: `src/config/config.ts` reads all `NEXT_PUBLIC_*` environment variables
- **Type safety**: Proper interfaces for configuration objects
- **Frontend only**: Only public env vars (`NEXT_PUBLIC_API_BASE`, Supabase keys)
- **Backend separation**: Server secrets remain in backend repository

### Integration Points

- **API Communication**: Default backend URL http://localhost:8080 (configurable)
- **Socket.io**: Real-time connection configured in `SocketProvider`
- **Supabase**: Client SDK for authentication and data management
- **Environment files**: `.env.local`, `.env` for development configuration

## Error Handling & UX

### User Experience

- **Graceful degradation**: Components handle loading and error states
- **Toast notifications**: Use Zustand `useUiStore` for user feedback
- **Friendly UI**: Show user-friendly messages, log technical details in development
- **No alert()**: Use proper toast/modal patterns for user notifications

### Error Boundaries

- **Component-level**: Handle errors locally where possible
- **Page-level**: `error.tsx` files in App Router for route-level error handling
- **Global handling**: Unified error contract patterns from backend integration

## Accessibility Standards

### Core Principles

- **Keyboard-first**: Every interactive element accessible via keyboard navigation
- **Semantic HTML**: Use proper elements (`button` over clickable `div`)
- **ARIA labels**: Comprehensive labeling for screen readers
- **Focus management**: Visible focus outlines and logical tab order
- **Color contrast**: Adequate contrast ratios for all text and interactive elements

### Implementation

- **Component testing**: Accessibility validation in component tests
- **Role-based queries**: Use `getByRole`, `getByLabelText` in tests
- **Responsive design**: Accessible across all device sizes and orientations

## Performance Optimization

### React Performance

- **Server Components**: Minimize client boundaries, prefer RSC by default
- **Memoization**: `React.memo`, `useMemo`, `useCallback` for hot paths
- **Prop stability**: Stable object references to prevent unnecessary re-renders
- **Code splitting**: Lazy loading with `React.lazy()` for non-critical components

### Next.js Optimizations

- **Image optimization**: Built-in `next/image` with automatic optimization
- **Bundle analysis**: Regular bundle size monitoring and optimization
- **Static generation**: Leverage SSG where possible for better performance
- **Edge functions**: Utilize Edge Runtime for improved response times

### Real-time Features

- **Socket.io optimization**: Efficient event handling and connection management
- **Animation performance**: Framer Motion integration via `AnimationProvider`
- **Scroll performance**: Custom scrollbar system with optimized rendering

## Development Workflow

### Quality Assurance

- **Code formatting**: Prettier + ESLint with pre-commit hooks (husky + lint-staged)
- **Type checking**: TypeScript strict mode with `npm run typecheck`
- **Testing**: Comprehensive test suite with `npm test` (80+ tests)
- **Build validation**: Production build checks with `npm run build`

### Git Workflow

- **Conventional Commits**: Structured commit messages with scope and type
- **Branch strategy**: Feature branches with descriptive names
- **PR template**: Includes accessibility and performance validation checklist
- **Automated checks**: ESLint, TypeScript, and test validation on commit

### Documentation Maintenance

- **Living docs**: Keep `docs/` directory updated with architectural changes
- **API documentation**: Component props and usage patterns documented
- **Architecture decisions**: Record significant technical decisions and rationale

## Integration Architecture

### Real-time Communication

- **Socket.io**: Auto-connects to localhost:8080 in `SocketProvider`
- **Event handling**: Structured event patterns for quiz interactions
- **Connection management**: Automatic reconnection and error handling

### Data Layer

- **Supabase**: Authentication and persistent data storage
- **API integration**: RESTful communication with Express backend
- **Type safety**: Shared types between frontend and backend where possible
