# TUIZ情報王 - Frontend

**Frontend repository for TUIZ情報王** - A real-time interactive quiz platform for education, training, and entertainment.

## 📖 About TUIZ情報王

TUIZ情報王 is a free, real-time quiz platform that enables:

- **Quiz Creation**: Build interactive quizzes with multiple choice questions, images, and explanations
- **Live Game Hosting**: Host real-time quiz games with instant synchronization across all participants
- **Player Participation**: Join games using room codes and compete in interactive quiz sessions
- **Real-time Leaderboards**: Track scores and rankings as questions progress
- **Educational Value**: Learn through explanations and detailed feedback

## 🎯 Quick Start

### For End Users

**Want to use TUIZ?** Visit the live application:

- **Production**: [tuiz-info-king.vercel.app](https://tuiz-info-king.vercel.app)

**Need help?** See the comprehensive user manual:

- **English**: [User Manual](./user-manual/01-USER-MANUAL.md)
- **日本語**: [ユーザーマニュアル](./user-manual/01-USER-MANUAL-JA.md)

The user manual includes:

- Step-by-step guides for hosts and players
- Complete game flow documentation
- Troubleshooting and best practices
- Feature overviews

### For Developers

**Want to contribute or run locally?**

1. **Clone the repository**

   ```bash
   git clone https://github.com/PandaDev0069/tuiz-frontend.git
   cd tuiz-frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Required variables:
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
   - `NEXT_PUBLIC_API_BASE` - Backend API URL (optional, defaults to localhost:8080)

4. **Run development server**
   ```bash
   npm run dev
   ```
   Opens at `http://localhost:3000`

## 🏗️ Project Overview

This is the **frontend** of TUIZ, built with:

- **Next.js 15** (App Router) - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Socket.IO Client** - Real-time communication
- **Supabase** - Authentication

### Architecture

The frontend communicates with:

- **Backend API**: REST endpoints for game operations, quiz management, and data queries
- **WebSocket Server**: Real-time game events and synchronization
- **Supabase**: User authentication and database access

## 📚 Documentation

Comprehensive documentation is available in the `user-manual` folder:

- **[User Manual (English)](./user-manual/01-USER-MANUAL.md)** - Complete user guide
- **[ユーザーマニュアル (日本語)](./user-manual/01-USER-MANUAL-JA.md)** - 完全なユーザーガイド
- **[Technical Documentation](./user-manual/02-TECHNICAL-DOCUMENTATION.md)** - Architecture and implementation details
- **[API Documentation](./user-manual/05-API-DOCUMENTATION.md)** - API reference
- **[Database Schema](./user-manual/04-DATABASE-SCHEMA.md)** - Database structure
- **[Component Documentation](./user-manual/06-COMPONENT-DOCUMENTATION.md)** - Component reference
- **[Architecture & DFD](./user-manual/03-ARCHITECTURE-DFD.md)** - System architecture and data flow

## 🔗 Related Repositories

- **Backend**: [tuiz-backend](https://github.com/PandaDev0069/tuiz-backend) - Express + TypeScript + Socket.IO backend API server

## 🚀 Features

### For Hosts

- Create and manage quiz libraries
- Host real-time quiz games
- Control game flow and timing
- View player statistics and participation
- Manage players (kick, view participants)

### For Players

- Join games with room codes
- Answer questions in real-time
- View answer statistics and explanations
- Track scores and rankings
- See final results and podium

### Platform Features

- Real-time synchronization across all devices
- Mobile-responsive design
- No installation required (web-based)
- Free to use
- Support for images in questions and explanations
- Multiple question types (multiple choice, true/false)
- Customizable time limits
- Educational explanations

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - TypeScript type checking

### Project Structure

```
src/
├── app/              # Next.js App Router pages
├── components/        # React components
├── hooks/            # Custom React hooks
├── services/         # API clients and services
├── state/            # State management (Zustand)
├── lib/              # Utilities and helpers
├── types/            # TypeScript type definitions
├── config/           # Configuration
└── styles/           # Global styles and design tokens
```

### Code Quality

- **TypeScript** - Strict type checking
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **Conventional Commits** - Commit message standards

## 📦 Dependencies

### Core

- Next.js 15.4.10
- React 19.1.0
- TypeScript 5
- Tailwind CSS 4.1.12

### State & Communication

- Zustand 5.0.7 - State management
- TanStack Query 5.87.4 - Server state
- Socket.IO Client 4.8.1 - WebSocket communication
- Supabase JS 2.55.0 - Authentication

### UI & Styling

- Framer Motion 12.23.12 - Animations
- React Hot Toast 2.6.0 - Notifications
- Radix UI - Accessible components
- Lucide React - Icons

## 🔐 Environment Variables

Create `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_BASE=http://localhost:8080
```

## 🧪 Testing

The project includes test infrastructure:

- **Vitest** - Unit and integration testing
- **React Testing Library** - Component testing
- **Playwright** - End-to-end testing

## 📄 License

Licensed under the Apache-2.0 License. See [LICENSE](./LICENSE) for details.

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## 📞 Support

- **User Manual**: See [user-manual](./user-manual/) folder for comprehensive guides
- **Issues**: Report bugs or request features via [GitHub Issues](https://github.com/PandaDev0069/tuiz-frontend/issues)
- **Documentation**: All technical documentation is in the `user-manual` folder

## 🌐 Live Application

- **Production**: [tuiz-info-king.vercel.app](https://tuiz-info-king.vercel.app)

---

**TUIZ情報王** - Making learning interactive, engaging, and fun! 🎮📚
