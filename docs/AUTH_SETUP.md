# TUIZ Authentication Setup Guide

## Environment Variables Setup

### Backend (.env)

Copy the `.env.example` file to `.env` and fill in your Supabase credentials:

```bash
# Runtime
PORT=8080
NODE_ENV=development

# CORS (set your frontend origins; comma-separate for multiple)
CLIENT_ORIGINS=http://localhost:3000

# Logging
LOG_LEVEL=info

# Supabase Configuration (Required for authentication)
# Get these from your Supabase project dashboard
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Socket.IO
SOCKET_PATH=/socket.io
```

### Frontend (.env.local)

Copy the `.env.local.example` file to `.env.local`:

```bash
# API Base URL
NEXT_PUBLIC_API_BASE=http://localhost:8080

# Supabase Configuration (get these from your Supabase dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Getting Supabase Credentials

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In your project dashboard, go to Settings → API
3. Copy the following values:
   - **Project URL** → `SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `SUPABASE_ANON_KEY` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (backend only)

## Development Commands

### Backend

```bash
cd tuiz-backend
npm install
npm run dev        # Start development server
npm test          # Run tests
npm run typecheck # Check TypeScript
```

### Frontend

```bash
cd tuiz-frontend
npm install
npm run dev       # Start development server
npm test         # Run tests
npm run build    # Build for production
npm run e2e      # Run end-to-end tests
```

## Authentication Flow

### Registration Flow

1. User fills registration form at `/auth/register`
2. Frontend validates form data
3. POST to `/auth/register` with email, password, username (optional), displayName (optional)
4. Backend validates data and creates user in Supabase Auth
5. Returns user data and session tokens
6. Frontend stores auth data and redirects to `/dashboard`

### Login Flow

1. User fills login form at `/auth/login`
2. Frontend validates email and password
3. POST to `/auth/login` with credentials
4. Backend authenticates with Supabase
5. Returns user data and session tokens
6. Frontend stores auth data and redirects to `/dashboard`

## Error Handling

The system implements generic error messages to avoid information leakage:

- **400**: Invalid payload (validation errors)
- **401**: Invalid credentials (generic message)
- **409**: Duplicate email (for registration)
- **500**: Internal server error

## API Endpoints

- `POST /auth/register` - Create new user account
- `POST /auth/login` - Authenticate existing user
- `GET /health` - Health check endpoint

## Testing

Both frontend and backend include comprehensive test suites:

- **Unit tests**: Component and function level testing
- **Integration tests**: API endpoint testing
- **E2E tests**: Full user workflow testing (Playwright)

## Security Features

- Password validation (minimum 6 characters)
- Email format validation
- Generic error messages to prevent information disclosure
- Secure session management with Supabase Auth
- CORS configuration for production security
