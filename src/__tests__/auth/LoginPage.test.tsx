import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import LoginPage from '@/app/auth/login/page';
import { server } from '../msw/server';
import { http, HttpResponse } from 'msw';

// Mock Next.js router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
}));

// Mock the AnimationController and providers
vi.mock('@/app/AnimationController', () => ({
  useAnimation: () => ({
    latencyMs: null,
    duration: 3000,
    easing: 'ease-in-out',
    scale: 1,
    refresh: vi.fn(),
  }),
}));

describe('LoginPage', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form correctly', () => {
    render(<LoginPage />);

    // Logo should be present
    expect(
      screen.getByAltText(/TUIZ情報王 ロゴ - ログイン・リアルタイムクイズ作成・管理/i),
    ).toBeInTheDocument();

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

  it('updates form fields when user types', async () => {
    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/メールアドレス/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/パスワード/i) as HTMLInputElement;

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');

    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  it('toggles remember me checkbox', async () => {
    render(<LoginPage />);

    const rememberCheckbox = screen.getByRole('checkbox', {
      name: /次回からログイン情報を記憶する/i,
    }) as HTMLInputElement;

    expect(rememberCheckbox.checked).toBe(false);

    await user.click(rememberCheckbox);
    expect(rememberCheckbox.checked).toBe(true);

    await user.click(rememberCheckbox);
    expect(rememberCheckbox.checked).toBe(false);
  });

  it('shows validation errors for empty fields on submit', async () => {
    render(<LoginPage />);

    const submitButton = screen.getByRole('button', { name: /ログイン/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/メールアドレスを入力してください/i)).toBeInTheDocument();
      expect(screen.getByText(/パスワードを入力してください/i)).toBeInTheDocument();
    });
  });

  it('shows email validation error for invalid email format', async () => {
    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/メールアドレス/i);
    const submitButton = screen.getByRole('button', { name: /ログイン/i });

    await user.type(emailInput, 'invalid-email');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/有効なメールアドレスを入力してください/i)).toBeInTheDocument();
    });
  });

  it('clears field errors when user starts typing', async () => {
    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/メールアドレス/i);
    const submitButton = screen.getByRole('button', { name: /ログイン/i });

    // Trigger validation error
    await user.click(submitButton);
    await waitFor(() => {
      expect(screen.getByText(/メールアドレスを入力してください/i)).toBeInTheDocument();
    });

    // Start typing to clear error
    await user.type(emailInput, 'a');
    expect(screen.queryByText(/メールアドレスを入力してください/i)).not.toBeInTheDocument();
  });

  it('shows loading state during form submission', async () => {
    // Mock a delayed response to test loading state
    server.use(
      http.post('*/auth/login', async () => {
        // Add delay to simulate network request
        await new Promise((resolve) => setTimeout(resolve, 100));
        return HttpResponse.json({
          user: { id: '123', email: 'test@example.com' },
          session: { access_token: 'mock-token', expires_at: Date.now() + 3600000 },
        });
      }),
    );

    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/メールアドレス/i);
    const passwordInput = screen.getByLabelText(/パスワード/i);
    const submitButton = screen.getByRole('button', { name: /ログイン/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    // Check if button shows loading state or is disabled
    expect(submitButton).toBeDisabled();
  });

  it('calls login API when form is submitted with valid data', async () => {
    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/メールアドレス/i);
    const passwordInput = screen.getByLabelText(/パスワード/i);
    const submitButton = screen.getByRole('button', { name: /ログイン/i });

    await user.type(emailInput, 'test.user@example.com');
    await user.type(passwordInput, 'testPassword123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('redirects to dashboard on successful login', async () => {
    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/メールアドレス/i);
    const passwordInput = screen.getByLabelText(/パスワード/i);
    const submitButton = screen.getByRole('button', { name: /ログイン/i });

    await user.type(emailInput, 'test.user@example.com');
    await user.type(passwordInput, 'testPassword123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('shows error message on login failure', async () => {
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

    await user.type(emailInput, 'invalid@example.com');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Invalid email or password/i)).toBeInTheDocument();
    });
  });

  it('shows general error message on login failure', async () => {
    // Mock network error
    server.use(
      http.post('*/auth/login', () => {
        return HttpResponse.json({ message: 'Network error' }, { status: 500 });
      }),
    );

    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/メールアドレス/i);
    const passwordInput = screen.getByLabelText(/パスワード/i);
    const submitButton = screen.getByRole('button', { name: /ログイン/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Network error/i)).toBeInTheDocument();
    });
  });

  it('has accessible form structure', () => {
    render(<LoginPage />);

    // Check form has proper role
    expect(screen.getByRole('main')).toBeInTheDocument();

    // Check inputs have proper labels
    const emailInput = screen.getByLabelText(/メールアドレス/i);
    const passwordInput = screen.getByLabelText(/パスワード/i);

    expect(emailInput).toHaveAttribute('type', 'email');
    expect(passwordInput).toHaveAttribute('type', 'password');

    // Check required attributes
    expect(emailInput).toBeRequired();
    expect(passwordInput).toBeRequired();
  });

  it('displays error messages with proper ARIA attributes', async () => {
    render(<LoginPage />);

    const submitButton = screen.getByRole('button', { name: /ログイン/i });
    await user.click(submitButton);

    await waitFor(() => {
      const errorMessages = screen.getAllByRole('alert');
      expect(errorMessages.length).toBeGreaterThan(0);
    });
  });

  it('maintains focus management for keyboard users', async () => {
    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/メールアドレス/i);
    const passwordInput = screen.getByLabelText(/パスワード/i);
    const rememberCheckbox = screen.getByRole('checkbox', {
      name: /次回からログイン情報を記憶する/i,
    });
    const submitButton = screen.getByRole('button', { name: /ログイン/i });

    // Test tab navigation
    emailInput.focus();
    expect(document.activeElement).toBe(emailInput);

    fireEvent.keyDown(emailInput, { key: 'Tab' });
    fireEvent.keyDown(passwordInput, { key: 'Tab' });
    fireEvent.keyDown(rememberCheckbox, { key: 'Tab' });
    fireEvent.keyDown(submitButton, { key: 'Tab' });

    // All elements should be focusable
    expect(emailInput).not.toHaveAttribute('tabindex', '-1');
    expect(passwordInput).not.toHaveAttribute('tabindex', '-1');
    expect(rememberCheckbox).not.toHaveAttribute('tabindex', '-1');
    expect(submitButton).not.toHaveAttribute('tabindex', '-1');
  });
});
