# Technical Game Flow Implementation

## Real-time Event Flow

```mermaid
sequenceDiagram
    participant H as Host Control Panel
    participant P as Public Screen
    participant S as Server/Backend
    participant PD as Player Devices

    H->>S: Start Question (question_id, duration)
    S->>P: Broadcast question_start
    S->>PD: Broadcast question_start

    Note over PD: Players answer questions
    PD->>S: Submit Answer (API call)
    S->>S: Aggregate answers

    H->>S: Trigger answer_reveal
    S->>P: Broadcast answer_reveal
    S->>PD: Broadcast answer_reveal

    Note over P,PD: Show answer statistics

    alt Not Final Question
        S->>P: Broadcast leaderboard_update
        S->>PD: Broadcast leaderboard_update
    end

    S->>P: Broadcast explanation
    S->>PD: Broadcast explanation

    Note over H: Host triggers next question
```

## Screen Responsibilities

### Host Control Panel (Private)

- Question management controls
- Timer controls
- Answer reveal triggers
- Player management
- Game settings
- Analytics dashboard

### Public Display Screen (Audience)

- Question content display
- Answer choices (A, B, C, D)
- Timer countdown
- Answer statistics
- Leaderboard
- Explanations
- Podium view

### Player Devices (Mobile)

- Answer selection interface
- Timer display
- Results view
- Lightweight leaderboard
- Connection status

## Data Flow Architecture

```text
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Host Control  │    │  Public Screen  │    │ Player Devices  │
│     Panel       │    │                 │    │                 │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          │                      │                      │
          ▼                      ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Server/Backend                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   WebSocket │  │   Database  │  │   Analytics │            │
│  │   Manager   │  │   Layer     │  │   Engine    │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

## Game State Machine

```mermaid
stateDiagram-v2
    [*] --> Waiting: Host creates room
    Waiting --> QuestionActive: Host starts quiz
    QuestionActive --> AnswerReveal: Timer expires or host triggers
    AnswerReveal --> Leaderboard: Not final question
    AnswerReveal --> Explanation: Final question
    Leaderboard --> Explanation: Show explanations
    Explanation --> QuestionActive: More questions
    Explanation --> Podium: All questions done
    Podium --> Complete: Winners revealed
    Complete --> Waiting: New game or dismiss
```

## API Endpoints

### Question Management

- `POST /api/game/start` - Start quiz session
- `POST /api/game/question/start` - Start specific question
- `POST /api/game/question/reveal` - Reveal answers

### Player Actions

- `POST /api/game/answer` - Submit answer
- `GET /api/game/status` - Get current game state
- `GET /api/game/leaderboard` - Get current leaderboard

### Real-time Events

- `question_start` - Question begins
- `answer_reveal` - Answers revealed
- `leaderboard_update` - Rankings updated
- `game_end` - Quiz completed

## Performance Considerations

### Optimization Strategies

1. **Lightweight Player Events**: Minimal data for mobile devices
2. **Batch Processing**: Aggregate answers before broadcasting
3. **Connection Pooling**: Efficient WebSocket management
4. **Caching**: Store frequently accessed data
5. **CDN**: Static assets delivery

### Scalability Targets

- **Concurrent Players**: 300-400 per session
- **Response Time**: <400ms for critical actions
- **Uptime**: 99.9% during festival hours
- **Data Transfer**: Minimize bandwidth usage

## Error Handling

### Connection Recovery

```javascript
// Auto-reconnect with state restoration
const reconnect = async () => {
  const lastState = await fetch('/api/game/status');
  // Restore game state
  // Resume from last known position
};
```

### Graceful Degradation

- Offline mode for answer submission
- Cached leaderboard data
- Fallback UI for connection issues
- Retry mechanisms for failed requests

## Security Considerations

### Data Protection

- Player answer encryption
- Secure WebSocket connections
- Rate limiting on API endpoints
- Input validation and sanitization

### Anti-Cheating

- Server-side answer validation
- Timestamp verification
- Connection monitoring
- Suspicious activity detection

This technical flow provides the implementation roadmap for building the TUIZ quiz game system with proper real-time communication, state management, and performance optimization.
