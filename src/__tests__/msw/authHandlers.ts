// src/test/msw/authHandlers.ts
import { http, HttpResponse } from 'msw';

// Mock user data for consistent testing
const mockUser = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'test.user@example.com',
  username: 'testuser',
  display_name: 'Test User',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const mockSession = {
  access_token: 'mock-access-token',
  token_type: 'bearer',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  refresh_token: 'mock-refresh-token',
};

const mockAuthResponse = {
  user: mockUser,
  session: mockSession,
};

export const authHandlers = [
  // Mock backend login endpoint
  http.post('*/auth/login', async ({ request }) => {
    const body = (await request.json()) as {
      email: string;
      password: string;
      rememberMe?: boolean;
    };
    const { email, password } = body;

    // Simulate authentication logic
    if (email === 'test.user@example.com' && password === 'testPassword123') {
      return HttpResponse.json(mockAuthResponse);
    }

    if (email === 'invalid@example.com' || password === 'wrongpassword') {
      return HttpResponse.json({ message: 'Invalid email or password' }, { status: 401 });
    }

    // Default success for other valid emails
    return HttpResponse.json(mockAuthResponse);
  }),

  // Mock backend register endpoint
  http.post('*/auth/register', async ({ request }) => {
    const body = (await request.json()) as {
      email: string;
      password: string;
      username?: string;
      displayName?: string;
    };
    const { email, username, displayName } = body;

    // Simulate validation
    if (email === 'existing@example.com') {
      return HttpResponse.json({ message: 'User already exists' }, { status: 409 });
    }

    const newUser = {
      ...mockUser,
      id: '987fcdeb-51a2-43d1-9f12-123456789abc',
      email: email,
      username: username || `user_${Date.now()}`,
      display_name: displayName || email.split('@')[0],
    };

    return HttpResponse.json({
      user: newUser,
      session: mockSession,
    });
  }),

  // Mock backend logout endpoint
  http.post('*/auth/logout', ({ request }) => {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.includes('Bearer')) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    return new HttpResponse(null, { status: 200 });
  }),

  // Mock backend profile/user info endpoint
  http.get('*/auth/me', ({ request }) => {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.includes('Bearer')) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    return HttpResponse.json(mockUser);
  }),
];
