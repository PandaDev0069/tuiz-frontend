# TUIZ Frontend - User Manual & Documentation

Welcome to the comprehensive documentation for the TUIZ Frontend application. This manual provides detailed information about using, understanding, and working with the TUIZ platform.

## 📚 Documentation Index

### 1. [User Manual](./01-USER-MANUAL.md) / [ユーザーマニュアル（日本語）](./01-USER-MANUAL-JA.md)

Complete guide for end users on how to use TUIZ as both a host and a player. Includes step-by-step instructions, features overview, troubleshooting, and best practices.

**Available Languages:**

- English: [User Manual](./01-USER-MANUAL.md)
- Japanese: [ユーザーマニュアル](./01-USER-MANUAL-JA.md)

**Sections:**

- Getting Started
- Host Guide (Creating quizzes, managing games)
- Player Guide (Joining games, playing quizzes)
- Game Flow & Phases (Detailed phase-by-phase documentation)
- Features Overview
- Troubleshooting
- Best Practices

---

### 2. [Technical Documentation](./02-TECHNICAL-DOCUMENTATION.md)

Comprehensive technical documentation covering the architecture, technology stack, project structure, and implementation details.

**Sections:**

- Architecture Overview
- Technology Stack
- Project Structure
- State Management
- API Integration
- WebSocket Communication
- Component Architecture
- Routing & Styling
- Build & Deployment

---

### 3. [Architecture & Data Flow Diagrams](./03-ARCHITECTURE-DFD.md)

Detailed architecture documentation with data flow diagrams (DFD) showing how data moves through the system.

**Sections:**

- System Architecture
- Data Flow Diagrams (Level 0, 1, 2)
- Component Interaction
- State Flow
- WebSocket Flow

**Diagrams Include:**

- High-level system architecture
- Game flow data flow
- Answer submission flow
- Quiz creation flow
- WebSocket event flow

---

### 4. [Database Schema Documentation](./04-DATABASE-SCHEMA.md)

Complete database schema documentation with entity relationships, table structures, and data access patterns.

**Sections:**

- Database Overview
- Entity Relationship Diagram
- Table Definitions
- Relationships
- Indexes
- Data Types
- Frontend Data Access Patterns

**Tables Documented:**

**Active Tables:**

- profiles
- quiz_sets
- questions
- answers
- games
- game_flows
- players
- game_player_data

**Analytics Tables (Future Use):**

- websocket_connections
- device_sessions
- game_events
- room_participants

---

### 5. [API Documentation](./05-API-DOCUMENTATION.md)

Complete API reference for all REST endpoints and WebSocket events used by the frontend.

**Sections:**

- API Overview
- Authentication
- Game API (all endpoints)
- Quiz Library API
- WebSocket Events
- Error Handling

**API Categories:**

- Game operations (create, join, submit answers)
- Quiz library operations (CRUD)
- Real-time WebSocket events
- Authentication endpoints
- Analytics endpoints (future use)

---

### 6. [Component Documentation](./06-COMPONENT-DOCUMENTATION.md)

Detailed documentation of all React components, their props, usage, and patterns.

**Sections:**

- Component Overview
- Game Components
- Quiz Creation Components
- UI Components
- Provider Components
- Component Patterns

**Component Categories:**

- Game screen components (host & player)
- Quiz creation components
- Reusable UI primitives
- Context providers
- Form components

---

## 🚀 Quick Start

### For End Users

Start with the [User Manual](./01-USER-MANUAL.md) to learn how to:

- Create an account
- Create and manage quizzes
- Host game sessions
- Join and play games

### For Developers

Start with the [Technical Documentation](./02-TECHNICAL-DOCUMENTATION.md) to understand:

- Project structure
- Technology stack
- Development setup
- Architecture patterns

### For System Architects

Review the [Architecture & Data Flow Diagrams](./03-ARCHITECTURE-DFD.md) to understand:

- System architecture
- Data flow patterns
- Component interactions
- WebSocket communication

---

## 📖 Document Structure

Each document is self-contained but cross-referenced:

- **User Manual**: End-user focused, no technical details
- **Technical Documentation**: Developer-focused, implementation details
- **Architecture DFD**: System design and data flow
- **Database Schema**: Data structure and relationships
- **API Documentation**: API reference and usage
- **Component Documentation**: Component reference and patterns

---

## 🔍 Finding Information

### By Role

**End User:**

- [User Manual](./01-USER-MANUAL.md) - Complete usage guide (English)
- [ユーザーマニュアル](./01-USER-MANUAL-JA.md) - 完全な使用ガイド（日本語）

**Frontend Developer:**

- [Technical Documentation](./02-TECHNICAL-DOCUMENTATION.md) - Implementation details
- [Component Documentation](./06-COMPONENT-DOCUMENTATION.md) - Component reference
- [API Documentation](./05-API-DOCUMENTATION.md) - API usage

**Backend Developer:**

- [API Documentation](./05-API-DOCUMENTATION.md) - API contracts
- [Database Schema](./04-DATABASE-SCHEMA.md) - Data structure

**System Architect:**

- [Architecture & Data Flow Diagrams](./03-ARCHITECTURE-DFD.md) - System design
- [Technical Documentation](./02-TECHNICAL-DOCUMENTATION.md) - Architecture overview

### By Topic

**Authentication:**

- User Manual → Getting Started
- Technical Documentation → State Management
- API Documentation → Authentication

**Game Flow:**

- User Manual → Host Guide / Player Guide
- Architecture DFD → Game Flow DFD
- API Documentation → Game API

**Quiz Creation:**

- User Manual → Host Guide → Creating a Quiz
- Component Documentation → Quiz Creation Components
- API Documentation → Quiz Library API

**Real-time Features:**

- Technical Documentation → WebSocket Communication
- Architecture DFD → WebSocket Flow
- API Documentation → WebSocket Events

---

## 📝 Document Conventions

### Code Examples

All code examples use TypeScript and React patterns consistent with the codebase.

### Diagrams

Diagrams use ASCII art format for compatibility and version control.

### Terminology

- **Host**: Quiz creator and game manager
- **Player**: Game participant
- **Quiz**: Collection of questions
- **Game**: Active quiz session
- **Room Code**: Unique identifier for joining games

---

## 🔄 Document Updates

**Last Updated**: January 2026
**Version**: 1.0

Documents are updated as the codebase evolves. Check individual document headers for specific update dates.

---

## 📞 Support

For questions or issues:

1. Check the relevant documentation section
2. Review troubleshooting guides
3. Check component/API documentation
4. Contact the development team

---

## 📄 License

This documentation is part of the TUIZ project and follows the same license as the codebase.

---

**Happy Learning with TUIZ情報王!** 🎮📚
