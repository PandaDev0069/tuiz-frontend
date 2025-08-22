// src/__tests__/integration/RegisterPage.integration.test.tsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import RegisterPage from '@/app/auth/register/page';
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

describe('RegisterPage API Integration Tests', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders registration form correctly', () => {
    render(<RegisterPage />);

    // Check for main heading
    expect(screen.getByRole('heading', { name: /新規アカウント作成/i })).toBeInTheDocument();

    // Check for form fields
    expect(screen.getByRole('textbox', { name: /メールアドレス/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /^ユーザー名/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /表示名/i })).toBeInTheDocument();
    expect(screen.getAllByLabelText(/パスワード/i)).toHaveLength(2);

    // Check for username sync checkbox
    expect(
      screen.getByRole('checkbox', { name: /ユーザー名を表示名として使用/i }),
    ).toBeInTheDocument();

    // Check for submit button
    expect(screen.getByRole('button', { name: /アカウント作成/i })).toBeInTheDocument();

    // Check for navigation links
    expect(screen.getByText(/既にアカウントをお持ちの方は/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /ログイン/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /ホームに戻る/i })).toBeInTheDocument();
  });

  it('successfully registers a new user via API', async () => {
    render(<RegisterPage />);

    const emailInput = screen.getByRole('textbox', { name: /メールアドレス/i });
    const usernameInput = screen.getByRole('textbox', { name: /^ユーザー名/i });
    const displayNameInput = screen.getByRole('textbox', { name: /表示名/i });
    const passwordInputs = screen.getAllByLabelText(/パスワード/i);
    const passwordInput = passwordInputs[0];
    const confirmPasswordInput = passwordInputs[1];
    const submitButton = screen.getByRole('button', { name: /アカウント作成/i });

    // Fill in the form
    await user.type(emailInput, 'newuser@example.com');
    await user.type(usernameInput, 'newuser');
    await user.type(displayNameInput, 'New User');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'password123');
    await user.click(submitButton);

    // Wait for success message and navigation
    await waitFor(() => {
      expect(screen.getByText(/アカウントが正常に作成されました/i)).toBeInTheDocument();
    });

    // Should navigate to dashboard after timeout
    await waitFor(
      () => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      },
      { timeout: 3000 },
    );
  });

  it('shows error message for existing user via API', async () => {
    // Override MSW handler for this specific test
    server.use(
      http.post('*/auth/register', () => {
        return HttpResponse.json({ message: 'User already exists' }, { status: 409 });
      }),
    );

    render(<RegisterPage />);

    const emailInput = screen.getByRole('textbox', { name: /メールアドレス/i });
    const usernameInput = screen.getByRole('textbox', { name: /^ユーザー名/i });
    const displayNameInput = screen.getByRole('textbox', { name: /表示名/i });
    const passwordInputs = screen.getAllByLabelText(/パスワード/i);
    const passwordInput = passwordInputs[0];
    const confirmPasswordInput = passwordInputs[1];
    const submitButton = screen.getByRole('button', { name: /アカウント作成/i });

    // Fill in form
    await user.type(emailInput, 'existing@example.com');
    await user.type(usernameInput, 'existinguser');
    await user.type(displayNameInput, 'Existing User');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'password123');
    await user.click(submitButton);

    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByText(/User already exists/i)).toBeInTheDocument();
    });

    // Should not navigate on failure
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('shows loading state during API call', async () => {
    // Mock a delayed response to test loading state
    server.use(
      http.post('*/auth/register', async () => {
        // Add delay to simulate network request
        await new Promise((resolve) => setTimeout(resolve, 100));
        return HttpResponse.json({
          user: { id: '123', email: 'newuser@example.com' },
          session: { access_token: 'mock-token', expires_at: Date.now() + 3600000 },
        });
      }),
    );

    render(<RegisterPage />);

    const emailInput = screen.getByRole('textbox', { name: /メールアドレス/i });
    const usernameInput = screen.getByRole('textbox', { name: /^ユーザー名/i });
    const displayNameInput = screen.getByRole('textbox', { name: /表示名/i });
    const passwordInputs = screen.getAllByLabelText(/パスワード/i);
    const passwordInput = passwordInputs[0];
    const confirmPasswordInput = passwordInputs[1];
    const submitButton = screen.getByRole('button', { name: /アカウント作成/i });

    await user.type(emailInput, 'newuser@example.com');
    await user.type(usernameInput, 'newuser');
    await user.type(displayNameInput, 'New User');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'password123');
    await user.click(submitButton);

    // Check if button shows loading state immediately after click
    expect(screen.getByRole('button', { name: /作成中.../i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /作成中.../i })).toBeDisabled();

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText(/アカウントが正常に作成されました/i)).toBeInTheDocument();
    });
  });

  it('handles form validation errors correctly', async () => {
    render(<RegisterPage />);

    const submitButton = screen.getByRole('button', { name: /アカウント作成/i });

    // Submit empty form
    await user.click(submitButton);

    // Check validation errors appear
    await waitFor(() => {
      expect(screen.getByText(/メールアドレスを入力してください/i)).toBeInTheDocument();
      expect(screen.getByText(/ユーザー名を入力してください/i)).toBeInTheDocument();
      expect(screen.getByText(/表示名を入力してください/i)).toBeInTheDocument();
      expect(screen.getByText(/パスワードを入力してください/i)).toBeInTheDocument();
      expect(screen.getByText(/パスワード確認を入力してください/i)).toBeInTheDocument();
    });

    // Should not make API call or navigate
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('validates password mismatch correctly', async () => {
    render(<RegisterPage />);

    const passwordInputs = screen.getAllByLabelText(/パスワード/i);
    const passwordInput = passwordInputs[0];
    const confirmPasswordInput = passwordInputs[1];
    const submitButton = screen.getByRole('button', { name: /アカウント作成/i });

    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'differentpassword');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/パスワードが一致しません/i)).toBeInTheDocument();
    });

    // Should not make API call
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('syncs display name with username when checkbox is checked', async () => {
    render(<RegisterPage />);

    const usernameInput = screen.getByRole('textbox', { name: /^ユーザー名/i }) as HTMLInputElement;
    const displayNameInput = screen.getByRole('textbox', { name: /表示名/i }) as HTMLInputElement;
    const syncCheckbox = screen.getByRole('checkbox', {
      name: /ユーザー名を表示名として使用/i,
    }) as HTMLInputElement;

    // Check the sync checkbox
    await user.click(syncCheckbox);
    expect(syncCheckbox.checked).toBe(true);

    // Type in username and verify display name syncs
    await user.type(usernameInput, 'testuser');
    expect(displayNameInput.value).toBe('testuser');

    // Uncheck the sync checkbox
    await user.click(syncCheckbox);
    expect(syncCheckbox.checked).toBe(false);

    // Modify username - display name should not sync anymore
    await user.clear(usernameInput);
    await user.type(usernameInput, 'newuser');
    expect(displayNameInput.value).toBe('testuser'); // Should remain old value
  });
});
