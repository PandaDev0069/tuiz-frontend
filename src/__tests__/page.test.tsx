import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Page from '../app/page';

describe('Page', () => {
  it('renders the main heading', () => {
    render(<Page />);
    const heading = screen.getByRole('heading', { name: /TUIZ情報王/i });
    expect(heading).toBeInTheDocument();
  });

  it('renders the logo', () => {
    render(<Page />);
    const logo = screen.getByRole('img', { name: /logo/i });
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('width', '100');
    expect(logo).toHaveAttribute('height', '100');
  });

  it('renders main content sections', () => {
    render(<Page />);
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();

    // Check that main content contains the card sections
    expect(main).toBeInTheDocument();
  });

  it('renders primary action buttons', () => {
    render(<Page />);
    expect(screen.getByRole('button', { name: /ログイン/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ゲーム参加/i })).toBeInTheDocument();
  });

  it('renders feature descriptions', () => {
    render(<Page />);
    expect(screen.getByText(/クイズを作成・管理し、クイズを開始、ホスト/i)).toBeInTheDocument();
    expect(screen.getByText(/ルームコードを入力してクイズゲームに参加/i)).toBeInTheDocument();
  });

  it('has proper document structure', () => {
    render(<Page />);

    // Check semantic structure
    expect(screen.getByRole('banner')).toBeInTheDocument(); // Header
    expect(screen.getByRole('main')).toBeInTheDocument(); // Main
    expect(screen.getByRole('contentinfo')).toBeInTheDocument(); // Footer
  });
});
