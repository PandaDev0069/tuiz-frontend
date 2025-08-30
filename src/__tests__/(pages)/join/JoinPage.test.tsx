import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import JoinPage from '@/app/(pages)/join/page';

// Mock the AnimationController used by the page
vi.mock('@/app/AnimationController', () => ({
  useAnimation: () => ({
    latencyMs: null,
    duration: 3000,
    easing: 'ease-in-out',
    scale: 1,
    refresh: vi.fn(),
  }),
}));

describe('JoinPage', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders join UI correctly', () => {
    render(<JoinPage />);

    // Logo and explanatory text
    expect(
      screen.getByAltText(/TUIZ情報王 ロゴ - TUIZ参加・クイズゲーム参加/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/ルームに参加するには、以下に名前と6桁のルームコードを入力してください/i),
    ).toBeInTheDocument();

    // Inputs and labels
    expect(screen.getByLabelText(/名前/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/ルームコード/i)).toBeInTheDocument();

    // Submit button should start disabled
    expect(screen.getByRole('button', { name: /TUIZ参加する/i })).toBeDisabled();

    // Back link present
    expect(screen.getByRole('link', { name: /ホームに戻る/i })).toBeInTheDocument();
  });

  it('enables submit when inputs are valid', async () => {
    render(<JoinPage />);

    const nameInput = screen.getByLabelText(/名前/i) as HTMLInputElement;
    const codeInput = screen.getByLabelText(/ルームコード/i) as HTMLInputElement;
    const submit = screen.getByRole('button', { name: /TUIZ参加する/i });

    await user.type(nameInput, 'テストユーザー');
    await user.type(codeInput, '123456');

    await waitFor(() => expect(submit).toBeEnabled());
  });

  it('filters non-digits from the code input and limits to 6 digits', async () => {
    render(<JoinPage />);

    const codeInput = screen.getByLabelText(/ルームコード/i) as HTMLInputElement;
    await user.type(codeInput, '12ab34cd5678');

    // Component enforces digits-only and max 6 characters
    expect(codeInput.value).toBe('123456');
  });

  it('shows validation errors for invalid inputs after submit', async () => {
    render(<JoinPage />);

    const nameInput = screen.getByLabelText(/名前/i);

    await user.type(nameInput, 'abc');
    // blur code to trigger validation for empty code
    const codeInput = screen.getByLabelText(/ルームコード/i);
    await user.tab();
    await user.click(codeInput);
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText(/名前は4文字以上/i)).toBeInTheDocument();
      expect(screen.getByText(/コードは6桁の数字で入力してください/i)).toBeInTheDocument();
    });
  });

  it('has accessible main role', () => {
    render(<JoinPage />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });
});
