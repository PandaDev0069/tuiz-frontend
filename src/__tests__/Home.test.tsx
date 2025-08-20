import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Home from '@/app/page';

describe('Home page', () => {
  it('renders the main title', () => {
    render(<Home />);
    expect(screen.getByRole('heading', { name: /TUIZ情報王/i })).toBeInTheDocument();
  });

  it('renders the logo image', () => {
    render(<Home />);
    const logo = screen.getByRole('img', { name: /logo/i });
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('alt', 'logo');
  });

  it('renders main action cards', () => {
    render(<Home />);

    // Host login card
    expect(screen.getByRole('heading', { name: /ホストとしてログイン/i })).toBeInTheDocument();
    expect(screen.getByText(/クイズを作成・管理し、クイズを開始、ホスト/i)).toBeInTheDocument();

    // Join game card
    expect(screen.getByRole('heading', { name: /ゲームに参加/i })).toBeInTheDocument();
    expect(screen.getByText(/ルームコードを入力してクイズゲームに参加/i)).toBeInTheDocument();
  });

  it('renders action buttons', () => {
    render(<Home />);
    expect(screen.getByRole('button', { name: /ログイン/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ゲーム参加/i })).toBeInTheDocument();
  });

  it('renders feature cards', () => {
    render(<Home />);

    // Real-time feature
    expect(screen.getByRole('heading', { name: /リアルタイム/i })).toBeInTheDocument();
    expect(screen.getByText(/瞬時に同期/i)).toBeInTheDocument();

    // Educational feature
    expect(screen.getByRole('heading', { name: /教育的/i })).toBeInTheDocument();
    expect(screen.getByText(/学習に最適/i)).toBeInTheDocument();

    // Interactive feature
    expect(screen.getByRole('heading', { name: /インタラクティブ/i })).toBeInTheDocument();
    expect(screen.getByText(/魅力的な体験/i)).toBeInTheDocument();
  });

  it('renders layout sections correctly', () => {
    render(<Home />);

    // Check for main layout elements
    expect(screen.getByRole('banner')).toBeInTheDocument(); // Header
    expect(screen.getByRole('main')).toBeInTheDocument(); // Main
    expect(screen.getByRole('contentinfo')).toBeInTheDocument(); // Footer
  });

  it('renders footer with copyright information', () => {
    render(<Home />);
    expect(screen.getByText(/© 2025 TUIZ情報王. All rights reserved./i)).toBeInTheDocument();
    expect(screen.getByText(/Next.js \+ Socket.IO • Real-time Quiz Platform/i)).toBeInTheDocument();
  });

  it('renders cards with proper structure', () => {
    render(<Home />);

    // Should have 5 cards total (2 main action cards + 3 feature cards)
    const cards = screen.getAllByRole('generic').filter(
      (element) => element.className.includes('rounded-3xl'), // Our card component class
    );
    expect(cards.length).toBeGreaterThanOrEqual(5);
  });

  it('has proper accessibility attributes', () => {
    render(<Home />);

    // Check that buttons are accessible
    const loginButton = screen.getByRole('button', { name: /ログイン/i });
    const joinButton = screen.getByRole('button', { name: /ゲーム参加/i });

    expect(loginButton).toBeInTheDocument();
    expect(joinButton).toBeInTheDocument();

    // Check that logo has alt text
    const logo = screen.getByRole('img', { name: /logo/i });
    expect(logo).toHaveAttribute('alt', 'logo');
  });
});
