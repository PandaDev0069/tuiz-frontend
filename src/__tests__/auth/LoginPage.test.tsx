import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import LoginPage from '@/app/auth/login/page';

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

describe('LoginPage', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form correctly', () => {
    render(<LoginPage />);

    // Check for main heading
    expect(screen.getByRole('heading', { name: /ログイン/i })).toBeInTheDocument();

    // Check for form fields
    expect(screen.getByLabelText(/メールアドレス/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/パスワード/i)).toBeInTheDocument();

    // Check for remember me checkbox
    expect(screen.getByRole('checkbox', { name: /ログイン状態を保持/i })).toBeInTheDocument();

    // Check for submit button
    expect(screen.getByRole('button', { name: /ログイン/i })).toBeInTheDocument();

    // Check for navigation links
    expect(screen.getByText(/アカウントをお持ちでない方/i)).toBeInTheDocument();
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
      name: /ログイン状態を保持/i,
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
    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/メールアドレス/i);
    const passwordInput = screen.getByLabelText(/パスワード/i);
    const submitButton = screen.getByRole('button', { name: /ログイン/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    // Check if button shows loading state
    expect(submitButton).toHaveTextContent(/ログイン中.../i);
    expect(submitButton).toBeDisabled();
  });

  it('handles form submission and shows mock error', async () => {
    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/メールアドレス/i);
    const passwordInput = screen.getByLabelText(/パスワード/i);
    const submitButton = screen.getByRole('button', { name: /ログイン/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(
          /ログインに失敗しました。メールアドレスまたはパスワードをご確認ください。/i,
        ),
      ).toBeInTheDocument();
    });
  });

  it('shows general error message on login failure', async () => {
    // Mock failed API response
    const mockFetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ message: 'Invalid credentials' }),
      }),
    );
    global.fetch = mockFetch as unknown as typeof fetch;

    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/メールアドレス/i);
    const passwordInput = screen.getByLabelText(/パスワード/i);
    const submitButton = screen.getByRole('button', { name: /ログイン/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/ログインに失敗しました/i)).toBeInTheDocument();
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
    const rememberCheckbox = screen.getByRole('checkbox', { name: /ログイン状態を保持/i });
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
