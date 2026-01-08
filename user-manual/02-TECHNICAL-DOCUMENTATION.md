# TUIZ Frontend - Technical Documentation

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [State Management](#state-management)
5. [API Integration](#api-integration)
6. [WebSocket Communication](#websocket-communication)
7. [Component Architecture](#component-architecture)
8. [Routing](#routing)
9. [Styling](#styling)
10. [Build & Deployment](#build--deployment)

---

## Architecture Overview

TUIZ Frontend is built using **Next.js 15** with the **App Router** architecture, providing:

- Server-side rendering (SSR) capabilities
- Client-side interactivity
- Optimized performance
- SEO-friendly structure

### Architecture Pattern

The application follows a **feature-based architecture** with clear separation of concerns:

```
┌─────────────────────────────────────┐
│         Next.js App Router          │
├─────────────────────────────────────┤
│  Pages (Route Handlers)             │
│  ├── Host Screens                   │
│  ├── Player Screens                 │
│  └── Auth & Dashboard               │
├─────────────────────────────────────┤
│  Components (UI Layer)              │
│  ├── Game Components                │
│  ├── Quiz Creation                  │
│  └── UI Primitives                  │
├─────────────────────────────────────┤
│  Services (Business Logic)          │
│  ├── API Clients                    │
│  ├── WebSocket                      │
│  └── Utilities                      │
├─────────────────────────────────────┤
│  State Management                   │
│  ├── Zustand Stores                 │
│  └── React Context                  │
└─────────────────────────────────────┘
```

---

## Technology Stack

### Core Framework

- **Next.js 15.4.10**: React framework with App Router
- **React 19.1.0**: UI library
- **TypeScript 5**: Type safety

### State Management

- **Zustand 5.0.7**: Lightweight state management
- **React Context**: Provider-based state (Auth, Socket)
- **TanStack Query 5.87.4**: Server state management

### Real-time Communication

- **Socket.IO Client 4.8.1**: WebSocket communication
- **Custom WebSocket Service**: Abstraction layer

### UI & Styling

- **Tailwind CSS 4.1.12**: Utility-first CSS
- **Framer Motion 12.23.12**: Animation library
- **Radix UI**: Accessible component primitives
- **Lucide React**: Icon library
- **React Icons**: Additional icons

### Authentication

- **Supabase JS 2.55.0**: Authentication client
- **Custom Auth Service**: Auth abstraction

### Utilities

- **React Hot Toast 2.6.0**: Toast notifications
- **QRCode 1.5.4**: QR code generation
- **Class Variance Authority**: Component variants

### Development Tools

- **ESLint 9**: Code linting
- **Prettier 3.6.2**: Code formatting
- **Husky 9.1.7**: Git hooks
- **Vitest 3.2.4**: Unit testing
- **Playwright 1.56.1**: E2E testing

---

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (pages)/                 # Route group for game pages
│   │   ├── host-*/              # Host screens
│   │   ├── player-*/            # Player screens
│   │   ├── dashboard/           # Dashboard pages
│   │   ├── create/              # Quiz creation
│   │   └── join/                # Join game page
│   ├── auth/                    # Authentication pages
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Homepage
│   └── metadata.ts              # SEO metadata
│
├── components/                   # React components
│   ├── game/                    # Game screen components
│   ├── quiz-creation/           # Quiz creation UI
│   ├── quiz-library/            # Library components
│   ├── host-waiting-room/       # Host waiting room
│   ├── providers/               # Context providers
│   ├── SEO/                     # SEO components
│   └── ui/                      # UI primitives
│
├── hooks/                        # Custom React hooks
│   ├── useGameFlow.ts           # Game flow management
│   ├── useGameAnswer.ts         # Answer handling
│   ├── useGameRoom.ts           # Room management
│   └── ...                      # Other hooks
│
├── services/                     # Business logic
│   ├── gameApi.ts               # Game API client
│   ├── quizLibraryService.ts    # Quiz library API
│   └── websocket/               # WebSocket service
│
├── state/                        # State management
│   ├── useAuthStore.ts          # Auth state (Zustand)
│   ├── useQuizLibraryStore.ts   # Quiz library state
│   └── useUiStore.ts            # UI state
│
├── lib/                          # Utilities
│   ├── apiClient.ts             # HTTP client
│   ├── auth.ts                  # Auth utilities
│   ├── quizService.ts           # Quiz utilities
│   └── ...                      # Other utilities
│
├── types/                        # TypeScript types
│   ├── game.ts                  # Game types
│   ├── quiz.ts                  # Quiz types
│   ├── auth.ts                  # Auth types
│   └── api.ts                   # API types
│
├── config/                       # Configuration
│   ├── config.ts                # App config
│   └── constants.ts             # Constants
│
└── styles/                       # Global styles
    ├── globals.css              # Global styles
    ├── tokens.css               # Design tokens
    └── ...                      # Other styles
```

---

## State Management

### Zustand Stores

#### Auth Store (`useAuthStore`)

Manages authentication state:

- User information
- Session management
- Login/logout operations
- Device ID management

```typescript
interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
}
```

#### Quiz Library Store (`useQuizLibraryStore`)

Manages quiz library state:

- Quiz list
- Search and filters
- Library operations

#### UI Store (`useUiStore`)

Manages UI state:

- Toast notifications
- Modal states
- UI preferences

### React Context

#### Socket Context (`SocketProvider`)

Provides WebSocket connection:

- Socket instance
- Connection status
- Room management
- Event handling

#### Auth Context (`AuthProvider`)

Provides authentication context:

- User state
- Auth methods
- Session management

### TanStack Query

Used for server state management:

- API data caching
- Automatic refetching
- Optimistic updates
- Error handling

### Database Tables

**Active Tables (Used by Frontend):**

- `profiles` - User profiles
- `quiz_sets` - Quiz definitions
- `questions` - Questions within quizzes
- `answers` - Answer choices
- `games` - Game sessions
- `players` - Players in games
- `game_flows` - Game flow state
- `game_player_data` - Player scores and answers (JSONB)

**Analytics Tables (Future Use):**

- `websocket_connections` - Connection tracking
- `device_sessions` - Device session history
- `game_events` - Game event logging
- `room_participants` - Enhanced participation tracking

See [Database Schema Documentation](./04-DATABASE-SCHEMA.md) for complete details.

---

## API Integration

### API Client Architecture

The application uses a centralized API client pattern:

```
┌─────────────────┐
│   Components    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Service Layer  │
│  (gameApi.ts)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  HTTP Client    │
│  (apiClient.ts) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Backend API    │
└─────────────────┘
```

### API Base Paths

- `/games` - Game operations
- `/quiz` - Quiz CRUD operations
- `/quiz-library` - Quiz library operations
- `/quiz/:quizId/questions` - Question operations
- `/quiz/:quizId/questions/:questionId/answers` - Answer operations
- `/auth` - Authentication (Supabase)
- `/profile` - User profile
- `/upload` - File uploads
- `/websocket-connections` - Analytics (future use)
- `/device-sessions` - Analytics (future use)

### API Services

#### Game API (`gameApi.ts`)

Handles all game-related operations:

- Game CRUD operations
- Player management
- Answer submission
- Leaderboard queries
- Game flow management

**Key Methods:**

- `getGameByCode(code)`: Get game by room code
- `createGame(quizId)`: Create new game session
- `getPlayers(gameId)`: Get game players
- `submitAnswer(gameId, answer)`: Submit player answer
- `getLeaderboard(gameId)`: Get game leaderboard

#### Quiz Library Service (`quizLibraryService.ts`)

Handles quiz library operations:

- Quiz CRUD
- Search and filtering
- Publishing
- Cloning

### API Configuration

API base URL is configured in `config/config.ts`:

- Development: `http://localhost:8080`
- Production: Environment variable or default

### Authentication

API requests include authentication:

- Bearer token from localStorage
- Automatic token refresh
- Error handling for auth failures

---

## WebSocket Communication

### Socket.IO Integration

The application uses Socket.IO for real-time communication:

```typescript
// Connection setup
const socket = io(apiBase, {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 5,
});
```

### Socket Events

#### Client → Server Events

- `room:join`: Join a game room
- `room:leave`: Leave a game room
- `game:question:start`: Start a question (host only)
- `game:answer:reveal`: Reveal answer (host only)
- `game:next`: Advance to next question (host only)
- `game:pause`: Pause game (host only)
- `game:resume`: Resume game (host only)

#### Server → Client Events

- `game:question:started`: Question started
- `game:question:changed`: Question changed
- `game:question:ended`: Question ended
- `game:answer:stats:update`: Answer statistics update
- `game:phase:change`: Game phase changed
- `game:started`: Game started
- `game:ended`: Game ended
- `game:player-joined`: Player joined
- `game:player-left`: Player left
- `game:player-kicked`: Player kicked

### Room Management

Rooms are identified by game ID:

- Each game session has a unique room
- Players join the room when entering the game
- Host controls room access (lock/unlock)

### Reconnection Handling

Automatic reconnection with:

- 5 reconnection attempts
- Exponential backoff
- Connection state tracking
- Event queue for missed events

---

## Component Architecture

### Component Hierarchy

```
App Layout
├── AuthProvider
│   ├── AnimationProvider
│   │   ├── SocketProvider
│   │   │   └── Page Components
│   │   │       ├── Game Components
│   │   │       ├── UI Components
│   │   │       └── Form Components
```

### Component Categories

#### Game Components (`components/game/`)

- `HostQuestionScreen`: Host question display
- `PlayerQuestionScreen`: Player question display
- `HostAnswerScreen`: Host answer phase
- `PlayerAnswerScreen`: Player answer selection
- `HostAnswerRevealScreen`: Answer reveal (host)
- `PlayerAnswerRevealScreen`: Answer reveal (player)
- `HostLeaderboardScreen`: Leaderboard (host)
- `PlayerLeaderboardScreen`: Leaderboard (player)
- `HostPodiumScreen`: Final podium (host)
- `PlayerPodiumScreen`: Final podium (player)

#### Quiz Creation Components (`components/quiz-creation/`)

- `BasicInfoStep`: Quiz basic information
- `QuestionCreationStep`: Question creation
- `SettingsStep`: Game settings
- `FinalStep`: Review and publish

#### UI Components (`components/ui/`)

- Core: Button, Card, Input, etc.
- Forms: Form fields, validation
- Feedback: Toasts, loaders, errors
- Navigation: Links, tabs
- Overlays: Modals, sidebars

### Component Patterns

#### Controlled Components

All form inputs use controlled component pattern:

```typescript
const [value, setValue] = useState('');
<input value={value} onChange={(e) => setValue(e.target.value)} />
```

#### Compound Components

Complex components use compound pattern:

```typescript
<Card>
  <CardHeader>Title</CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

#### Custom Hooks

Business logic extracted to custom hooks:

- `useGameFlow`: Game flow management
- `useGameAnswer`: Answer handling
- `useGameRoom`: Room management

---

## Routing

### Next.js App Router

Routes are defined by file structure:

```
app/
├── page.tsx                    # / (homepage)
├── auth/
│   ├── login/page.tsx          # /auth/login
│   └── register/page.tsx       # /auth/register
├── (pages)/
│   ├── dashboard/page.tsx      # /dashboard
│   ├── join/page.tsx           # /join
│   ├── host-screen/page.tsx    # /host-screen
│   └── waiting-room/page.tsx   # /waiting-room
```

### Route Groups

`(pages)` is a route group that doesn't affect URL structure but groups related routes.

### Dynamic Routes

Not currently used, but can be added:

```
app/
└── quiz/
    └── [id]/
        └── page.tsx            # /quiz/[id]
```

### Navigation

Navigation uses Next.js `Link` component:

```typescript
import Link from 'next/link';
<Link href="/dashboard">Dashboard</Link>
```

Programmatic navigation:

```typescript
import { useRouter } from 'next/navigation';
const router = useRouter();
router.push('/dashboard');
```

---

## Styling

### Tailwind CSS

Utility-first CSS framework:

- Responsive design with breakpoints
- Dark mode support (if implemented)
- Custom design tokens

### Design Tokens

Defined in `styles/tokens.css`:

- Colors
- Typography
- Spacing
- Shadows
- Animations

### Component Styling

Components use:

- Tailwind utility classes
- CSS Modules (if needed)
- Inline styles (for dynamic values)
- Framer Motion (for animations)

### Responsive Design

Breakpoints:

- Mobile: `< 768px`
- Tablet: `768px - 1024px`
- Desktop: `> 1024px`

---

## Build & Deployment

### Development

```bash
npm install
npm run dev
```

Runs on `http://localhost:3000`

### Build

```bash
npm run build
npm start
```

### Environment Variables

Required:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_API_BASE` (optional)

### Deployment

The application can be deployed to:

- Vercel (recommended for Next.js)
- Netlify
- Any Node.js hosting service

### Build Output

Next.js generates:

- Static pages (where possible)
- Server components
- API routes (if any)
- Optimized assets

---

## Performance Optimization

### Code Splitting

- Automatic route-based splitting
- Dynamic imports for heavy components
- Lazy loading for images

### Caching

- TanStack Query caching
- Next.js image optimization
- Static asset caching

### Bundle Optimization

- Tree shaking
- Minification
- Compression

---

**Last Updated**: January 2026
**Version**: 1.0
