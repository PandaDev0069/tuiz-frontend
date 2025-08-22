// src/__tests__/integration/LoginPage.integration.test.tsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import LoginPage from '@/app/auth/login/page';
import { server } from '../msw/server';
import { http, HttpResponse } from 'msw';

// Mock only the router and animation components, not the stores
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock('@/app/AnimationController', () => ({
  useAnimation: () => ({
    latencyMs: null,
    duration: 3000,
    easing: 'ease-in-out',
    scale: 1,
    refresh: vi.fn(),
  }),
}));

describe('LoginPage API Integration Tests', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form correctly', () => {
    render(<LoginPage />);

    // Check for main heading
    expect(screen.getByRole('heading', { name: /ホストログイン/i })).toBeInTheDocument();

    // Check for form fields
    expect(screen.getByLabelText(/メールアドレス/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/パスワード/i)).toBeInTheDocument();

    // Check for remember me checkbox
    expect(
      screen.getByRole('checkbox', { name: /次回からログイン情報を記憶する/i }),
    ).toBeInTheDocument();

    // Check for submit button
    expect(screen.getByRole('button', { name: /ログイン/i })).toBeInTheDocument();

    // Check for navigation links
    expect(screen.getByText(/アカウントをお持ちでない方は/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /新規登録/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /ホームに戻る/i })).toBeInTheDocument();
  });

  it('successfully logs in with valid credentials via API', async () => {
    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/メールアドレス/i);
    const passwordInput = screen.getByLabelText(/パスワード/i);
    const submitButton = screen.getByRole('button', { name: /ログイン/i });

    // Fill in the form with credentials that match our MSW mock
    await user.type(emailInput, 'test.user@example.com');
    await user.type(passwordInput, 'testPassword123');
    await user.click(submitButton);

    // Wait for the login process to complete and navigation to occur
    await waitFor(
      () => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      },
      { timeout: 10000 },
    );
  });

  it('shows error message for invalid credentials via API', async () => {
    // Override MSW handler for this specific test
    server.use(
      http.post('*/auth/login', () => {
        return HttpResponse.json({ message: 'Invalid email or password' }, { status: 401 });
      }),
    );

    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/メールアドレス/i);
    const passwordInput = screen.getByLabelText(/パスワード/i);
    const submitButton = screen.getByRole('button', { name: /ログイン/i });

    // Fill in form with any credentials
    await user.type(emailInput, 'invalid@example.com');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(submitButton);

    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByText(/Invalid email or password/i)).toBeInTheDocument();
    });

    // Should not navigate on failure
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('shows loading state during API call', async () => {
    // Mock a delayed response to test loading state
    server.use(
      http.post('*/auth/login', async () => {
        // Add delay to simulate network request
        await new Promise((resolve) => setTimeout(resolve, 100));
        return HttpResponse.json({
          user: { id: '123', email: 'test.user@example.com' },
          session: { access_token: 'mock-token', expires_at: Date.now() + 3600000 },
        });
      }),
    );

    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/メールアドレス/i);
    const passwordInput = screen.getByLabelText(/パスワード/i);
    const submitButton = screen.getByRole('button', { name: /ログイン/i });

    await user.type(emailInput, 'test.user@example.com');
    await user.type(passwordInput, 'testPassword123');
    await user.click(submitButton);

    // Check if button shows loading state immediately after click
    expect(screen.getByRole('button', { name: /ログイン中.../i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ログイン中.../i })).toBeDisabled();

    // Wait for loading to complete
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });
});
