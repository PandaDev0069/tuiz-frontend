# Architecture & Data Flow Diagrams

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Data Flow Diagrams](#data-flow-diagrams)
3. [Component Interaction](#component-interaction)
4. [State Flow](#state-flow)
5. [WebSocket Flow](#websocket-flow)

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Browser                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐         ┌──────────────────┐        │
│  │   Next.js App    │         │   React App       │        │
│  │   (SSR/SSG)      │◄───────►│   (Client)        │        │
│  └────────┬─────────┘         └────────┬──────────┘        │
│           │                             │                    │
│           │                             │                    │
│  ┌────────▼─────────┐         ┌────────▼──────────┐        │
│  │  API Client      │         │  WebSocket Client  │        │
│  │  (REST)          │         │  (Socket.IO)       │        │
│  └────────┬─────────┘         └────────┬───────────┘        │
│           │                             │                    │
└───────────┼─────────────────────────────┼────────────────────┘
            │                             │
            │ HTTPS                       │ WebSocket
            │                             │
┌───────────▼─────────────────────────────▼────────────────────┐
│                    Backend Server                             │
├───────────────────────────────────────────────────────────────┤
│  ┌──────────────┐         ┌──────────────┐                   │
│  │  REST API    │         │  Socket.IO   │                   │
│  │  Server      │         │  Server      │                   │
│  └──────┬───────┘         └──────┬───────┘                   │
│         │                        │                            │
│         │                        │                            │
│         │                        │  Analytics                 │
│         │                        │  Logging                   │
│         │                        │                            │
│         └────────────┬───────────┘                            │
│                      │                                        │
│         ┌────────────▼──────────┐                             │
│         │   Business Logic      │                             │
│         └────────────┬──────────┘                             │
│                      │                                        │
│         ┌────────────▼──────────┐                             │
│         │   Database (Supabase)│                             │
│         │                      │                             │
│         │  Active Tables:      │                             │
│         │  - profiles          │                             │
│         │  - quiz_sets         │                             │
│         │  - questions          │                             │
│         │  - answers            │                             │
│         │  - games              │                             │
│         │  - players            │                             │
│         │  - game_flows         │                             │
│         │  - game_player_data   │                             │
│         │                      │                             │
│         │  Analytics Tables:   │                             │
│         │  - websocket_        │                             │
│         │    connections       │                             │
│         │  - device_sessions   │                             │
│         │  - game_events       │                             │
│         │  - room_participants │                             │
│         └──────────────────────┘                             │
└───────────────────────────────────────────────────────────────┘
```

### Frontend Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Pages      │  │  Components  │  │     UI       │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────▼─────────────────────────────────┐
│                    Business Logic Layer                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │    Hooks     │  │   Services   │  │   Utils      │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────▼─────────────────────────────────┐
│                    State Management Layer                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Zustand    │  │   Context    │  │ React Query  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────▼─────────────────────────────────┐
│                    Communication Layer                     │
│  ┌──────────────┐  ┌──────────────┐                      │
│  │  REST API    │  │  WebSocket   │                      │
│  └──────────────┘  └──────────────┘                      │
└─────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### Level 0: Context Diagram

```
                    ┌──────────────┐
                    │              │
         Quiz Data  │              │  Game Data
         ──────────►│   TUIZ       │◄──────────
                    │   Frontend   │
                    │              │
         User Input │              │  Display Output
         ──────────►│              │◄──────────
                    │              │
                    └──────┬───────┘
                           │
                           │ HTTP/WebSocket
                           │
                    ┌──────▼───────┐
                    │   Backend    │
                    │    Server    │
                    └──────┬───────┘
                           │
                           │ SQL
                           │
                    ┌──────▼───────┐
                    │   Database   │
                    │  (Supabase)  │
                    └──────────────┘
```

### Level 1: Game Flow DFD

```
┌─────────────┐
│   Host      │
└──────┬──────┘
       │
       │ Start Game
       ▼
┌─────────────────┐
│  Host Screen    │
└──────┬──────────┘
       │
       │ Create Game Session
       ▼
┌─────────────────┐      ┌──────────────┐
│  Game API       │─────►│   Backend    │
│  Service        │◄─────│   Server     │
└──────┬──────────┘      └──────────────┘
       │
       │ Game Created
       ▼
┌─────────────────┐
│  Waiting Room   │
└──────┬──────────┘
       │
       │ Players Join
       ▼
┌─────────────────┐      ┌──────────────┐
│  WebSocket      │─────►│   Socket.IO  │
│  Service        │◄─────│   Server     │
└──────┬──────────┘      └──────────────┘
       │
       │ Start Game
       ▼
┌─────────────────┐
│  Game Flow      │
│  Management     │
└──────┬──────────┘
       │
       │ Question Flow
       ▼
┌─────────────────┐
│  Question       │
│  Screens        │
└─────────────────┘
```

### Level 2: Answer Submission Flow

```
┌─────────────┐
│   Player    │
└──────┬──────┘
       │
       │ Select Answer
       ▼
┌─────────────────┐
│ Answer Screen   │
└──────┬──────────┘
       │
       │ Submit Answer
       ▼
┌─────────────────┐      ┌──────────────┐
│  Game API       │─────►│   Backend    │
│  (submitAnswer) │      │   Server     │
└──────┬──────────┘      └──────┬───────┘
       │                        │
       │                        │ Store Answer
       │                        ▼
       │                 ┌──────────────┐
       │                 │   Database   │
       │                 └──────┬───────┘
       │                        │
       │                        │ Update Stats
       │                        ▼
       │                 ┌──────────────┐
       │                 │  Statistics  │
       │                 └──────┬───────┘
       │                        │
       │                        │ Broadcast
       │                        ▼
       │                 ┌──────────────┐
       │                 │  Socket.IO   │
       │                 └──────┬───────┘
       │                        │
       │◄───────────────────────┘
       │
       │ Answer Stats Update
       ▼
┌─────────────────┐
│ Answer Reveal   │
│ Screen          │
└─────────────────┘
```

### Level 2: Quiz Creation Flow

```
┌─────────────┐
│   User      │
└──────┬──────┘
       │
       │ Create Quiz
       ▼
┌─────────────────┐
│ Quiz Creation   │
│ Form            │
└──────┬──────────┘
       │
       │ Step 1: Basic Info
       ▼
┌─────────────────┐
│ Basic Info      │
│ Component       │
└──────┬──────────┘
       │
       │ Step 2: Questions
       ▼
┌─────────────────┐
│ Question        │
│ Creation        │
└──────┬──────────┘
       │
       │ Step 3: Settings
       ▼
┌─────────────────┐
│ Settings        │
│ Component       │
└──────┬──────────┘
       │
       │ Publish
       ▼
┌─────────────────┐      ┌──────────────┐
│ Quiz Library    │─────►│   Backend    │
│ Service         │      │   Server     │
└─────────────────┘      └──────┬───────┘
                                │
                                │ Store Quiz
                                ▼
                         ┌──────────────┐
                         │   Database   │
                         └──────────────┘
```

---

## Component Interaction

### Game Session Interaction

```
┌──────────────┐         ┌──────────────┐
│ Host Screen  │         │Player Screen │
└──────┬───────┘         └──────┬───────┘
       │                        │
       │ Start Question          │
       ├────────────────────────►│
       │                        │
       │                        │ Display Question
       │                        │
       │                        │ Select Answer
       │                        │
       │                        │ Submit Answer
       │                        ├──────────────────┐
       │                        │                  │
       │                        │                  │
       │ Reveal Answer          │                  │
       ├────────────────────────┤                  │
       │                        │                  │
       │                        │                  ▼
       │                        │         ┌──────────────┐
       │                        │         │  Game API    │
       │                        │         └──────┬───────┘
       │                        │                │
       │                        │                │ Store
       │                        │                ▼
       │                        │         ┌──────────────┐
       │                        │         │  Database    │
       │                        │         └──────┬───────┘
       │                        │                │
       │                        │                │ Broadcast
       │                        │                ▼
       │                        │         ┌──────────────┐
       │                        │         │  Socket.IO   │
       │                        │         └──────┬───────┘
       │                        │                │
       │◄───────────────────────┴────────────────┘
       │
       │ Stats Update
       │
       │ Show Answer Reveal
       ├────────────────────────►│
       │                        │
       │                        │ Show Answer Reveal
       │                        │
```

### State Management Flow

```
┌──────────────┐
│  Component   │
└──────┬───────┘
       │
       │ Dispatch Action
       ▼
┌──────────────┐
│ Zustand Store│
└──────┬───────┘
       │
       │ Update State
       ▼
┌──────────────┐
│  Component    │
│  Re-renders   │
└──────────────┘
```

---

## State Flow

### Authentication Flow

```
User Action
    │
    ▼
┌──────────────┐
│ Login Form   │
└──────┬───────┘
       │
       │ Submit
       ▼
┌──────────────┐      ┌──────────────┐
│ Auth Service │─────►│  Supabase    │
└──────┬───────┘      └──────┬───────┘
       │                     │
       │ Auth Success         │
       ▼                     │
┌──────────────┐             │
│ Auth Store   │             │
│ (Zustand)    │             │
└──────┬───────┘             │
       │                     │
       │ Update State        │
       ▼                     │
┌──────────────┐             │
│ Components   │             │
│ Re-render    │             │
└──────────────┘             │
```

### Game State Flow

```
Host Action
    │
    ▼
┌──────────────┐
│ Host Control │
└──────┬───────┘
       │
       │ Start Question
       ▼
┌──────────────┐      ┌──────────────┐
│ useGameFlow  │─────►│  Game API    │
│ Hook         │      └──────┬───────┘
└──────┬───────┘             │
       │                     │
       │ Emit Socket Event   │
       ▼                     │
┌──────────────┐             │
│ Socket.IO    │             │
│ Client       │             │
└──────┬───────┘             │
       │                     │
       │ Broadcast           │
       ├─────────────────────┘
       │
       │ Receive Event
       ▼
┌──────────────┐
│ Player       │
│ Screens      │
└──────────────┘
```

---

## WebSocket Flow

### Connection Flow

```
Client                    Server
  │                         │
  │─── connect ────────────►│
  │                         │
  │◄── connected ───────────│
  │                         │
  │─── client:hello ───────►│
  │                         │
  │◄── server:hello ────────│
  │                         │
  │─── room:join ───────────►│
  │                         │
  │◄── room:joined ─────────│
  │                         │
```

### Game Event Flow

```
Host                        Server                    Players
  │                           │                          │
  │─── game:question:start ──►│                          │
  │                           │                          │
  │                           │─── game:question:started─►│
  │                           │                          │
  │                           │                          │─── Display Question
  │                           │                          │
  │                           │◄── game:answer:submit ───│
  │                           │                          │
  │                           │─── game:answer:stats ────►│
  │                           │                          │
  │─── game:answer:reveal ───►│                          │
  │                           │                          │
  │                           │─── game:answer:revealed ─►│
  │                           │                          │
  │                           │                          │─── Show Answer
```

### Reconnection Flow

```
Client                    Server
  │                         │
  │─── connected ──────────►│
  │                         │
  │◄── disconnect ───────────│
  │                         │
  │─── reconnect ───────────►│
  │                         │
  │◄── reconnected ─────────│
  │                         │
  │─── room:join ───────────►│
  │                         │
  │◄── room:joined ─────────│
  │                         │
```

---

## Data Flow Summary

### Read Operations (REST API)

1. Component requests data
2. Service layer calls API
3. HTTP request to backend
4. Backend queries database
5. Response returned to component
6. State updated
7. Component re-renders

### Write Operations (REST API)

1. User action in component
2. Service layer calls API
3. HTTP request to backend
4. Backend updates database
5. Success response returned
6. State updated
7. Component re-renders

### Real-time Operations (WebSocket)

1. Event occurs (host action or server event)
2. Socket.IO emits event
3. Server broadcasts to room
4. Clients receive event
5. Event handlers update state
6. Components re-render

---

**Last Updated**: January 2026
**Version**: 1.0
