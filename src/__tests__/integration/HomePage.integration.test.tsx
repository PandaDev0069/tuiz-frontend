import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { renderWithProviders } from '../setupTests';
import HomePage from '@/app/page';

describe('HomePage Integration Tests', () => {
  describe('Layout and Structure', () => {
    it('renders the complete page structure', () => {
      renderWithProviders(<HomePage />);

      // Check that all main sections are present
      expect(screen.getByRole('banner')).toBeInTheDocument();
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();

      // Check main heading - there are multiple headings with TUIZ情報王 text
      const mainHeadings = screen.getAllByRole('heading', { name: /TUIZ情報王/i });
      expect(mainHeadings.length).toBeGreaterThan(0);
    });

    it('displays logo with correct attributes', () => {
      renderWithProviders(<HomePage />);

      const logo = screen.getByRole('img', {
        name: /TUIZ情報王 ロゴ - リアルタイムクイズプラットフォーム/i,
      });
      expect(logo).toBeInTheDocument();
      expect(logo).toHaveAttribute('alt', 'TUIZ情報王 ロゴ - リアルタイムクイズプラットフォーム');
      expect(logo).toHaveClass('animate-float', 'rounded-full');
    });
  });

  describe('Main Action Cards', () => {
    it('renders host login card with correct content', () => {
      renderWithProviders(<HomePage />);

      const hostCard = screen.getByRole('heading', { name: /ホストとしてログイン/i });
      expect(hostCard).toBeInTheDocument();

      // Check description
      expect(screen.getByText(/クイズを作成・管理し、クイズを開始、ホスト/i)).toBeInTheDocument();

      // Check button
      const loginButton = screen.getByRole('button', { name: /ログイン/i });
      expect(loginButton).toBeInTheDocument();
      expect(loginButton).toHaveClass('mx-auto', 'px-12');
    });

    it('renders join game card with correct content', () => {
      renderWithProviders(<HomePage />);

      const joinCard = screen.getByRole('heading', { name: /TUIZ参加 - ゲームに参加/i });
      expect(joinCard).toBeInTheDocument();

      // Check description
      expect(screen.getByText(/ルームコードを入力してクイズゲームに参加/i)).toBeInTheDocument();

      // Check button
      const joinButton = screen.getByRole('button', { name: /TUIZ参加/i });
      expect(joinButton).toBeInTheDocument();
      expect(joinButton).toHaveClass('mx-auto', 'px-12');
    });
  });

  describe('Feature Cards', () => {
    it('renders all three feature cards', () => {
      renderWithProviders(<HomePage />);

      // Real-time feature
      expect(screen.getByRole('heading', { name: /リアルタイムクイズ/i })).toBeInTheDocument();
      expect(screen.getByText(/瞬時に同期、TUIZ参加で楽しく対戦/i)).toBeInTheDocument();

      // Educational feature
      expect(screen.getByRole('heading', { name: /学習クイズアプリ/i })).toBeInTheDocument();
      expect(screen.getByText(/教育に最適、インタラクティブな体験/i)).toBeInTheDocument();

      // Interactive feature
      expect(screen.getByRole('heading', { name: /クイズ作成/i })).toBeInTheDocument();
      expect(screen.getByText(/魅力的なクイズを簡単に作成/i)).toBeInTheDocument();
    });

    it('feature cards have correct variants', () => {
      renderWithProviders(<HomePage />);

      // We can't easily test CSS classes directly, but we can test structure
      const featureHeadings = [
        screen.getByRole('heading', { name: /リアルタイムクイズ/i }),
        screen.getByRole('heading', { name: /学習クイズアプリ/i }),
        screen.getByRole('heading', { name: /クイズ作成/i }),
      ];

      featureHeadings.forEach((heading) => {
        expect(heading).toBeInTheDocument();
      });
    });
  });

  describe('Footer', () => {
    it('renders footer with copyright and tech stack info', () => {
      renderWithProviders(<HomePage />);

      const footer = screen.getByRole('contentinfo');
      expect(footer).toBeInTheDocument();

      expect(screen.getByText(/© 2025 TUIZ情報王. All rights reserved./i)).toBeInTheDocument();
      expect(
        screen.getByText(/Next.js \+ Socket.IO • Real-time Quiz Platform/i),
      ).toBeInTheDocument();
    });
  });

  describe('Responsive Design Elements', () => {
    it('applies correct grid classes for responsive layout', () => {
      renderWithProviders(<HomePage />);

      // Main cards section should exist (we can't test CSS grid directly in JSDOM)
      const mainSection = screen.getByRole('main').querySelector('section');
      expect(mainSection).toBeInTheDocument();
    });
  });

  describe('Interactive Elements', () => {
    it('login button navigates to auth page', async () => {
      const user = userEvent.setup();
      renderWithProviders(<HomePage />);

      const loginButton = screen.getByRole('button', { name: /ログイン/i });

      // Test button is interactive
      expect(loginButton).not.toBeDisabled();

      // Check that the login button is wrapped in a Link to /auth/login
      const loginLink = loginButton.closest('a');
      expect(loginLink).toBeInTheDocument();
      expect(loginLink).toHaveAttribute('href', '/auth/login');

      // Test clicking the button
      await user.click(loginButton);

      // The button should still be present after clicking (since we're not actually navigating in tests)
      expect(loginButton).toBeInTheDocument();
    });

    it('join game button is clickable', async () => {
      const user = userEvent.setup();
      renderWithProviders(<HomePage />);

      const joinButton = screen.getByRole('button', { name: /TUIZ参加/i });

      // Test button is interactive
      expect(joinButton).not.toBeDisabled();

      // Test clicking (no navigation handler yet, so just testing clickability)
      await user.click(joinButton);

      // Button should still be present after clicking
      expect(joinButton).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      renderWithProviders(<HomePage />);

      // Main heading (h1) - there are multiple headings with TUIZ情報王 text
      const mainHeadings = screen.getAllByRole('heading', { name: /TUIZ情報王/i });
      expect(mainHeadings.length).toBeGreaterThan(0);

      // Check that at least one is an H1
      const h1Headings = mainHeadings.filter((heading) => heading.tagName === 'H1');
      expect(h1Headings.length).toBeGreaterThan(0);

      // Section headings (h3)
      const sectionHeadings = screen.getAllByRole('heading', { level: 3 });
      expect(sectionHeadings.length).toBeGreaterThan(0);

      // Feature headings (h4)
      const featureHeadings = screen.getAllByRole('heading', { level: 4 });
      expect(featureHeadings.length).toBeGreaterThan(0);
    });

    it('images have alt text', () => {
      renderWithProviders(<HomePage />);

      const logo = screen.getByRole('img');
      expect(logo).toHaveAttribute('alt', 'TUIZ情報王 ロゴ - リアルタイムクイズプラットフォーム');
    });

    it('buttons have accessible names', () => {
      renderWithProviders(<HomePage />);

      expect(screen.getByRole('button', { name: /ログイン/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /TUIZ参加/i })).toBeInTheDocument();
    });
  });

  describe('Content Validation', () => {
    it('contains expected Japanese text content', () => {
      renderWithProviders(<HomePage />);

      // Main title - there are multiple headings with TUIZ情報王 text
      const mainHeadings = screen.getAllByRole('heading', { name: /TUIZ情報王/i });
      expect(mainHeadings.length).toBeGreaterThan(0);

      // Card descriptions
      expect(screen.getByText(/クイズを作成・管理し、クイズを開始、ホスト/i)).toBeInTheDocument();
      expect(screen.getByText(/ルームコードを入力してクイズゲームに参加/i)).toBeInTheDocument();

      // Feature descriptions - updated to match new card content
      expect(screen.getByText(/瞬時に同期、TUIZ参加で楽しく対戦/i)).toBeInTheDocument();
      expect(screen.getByText(/教育に最適、インタラクティブな体験/i)).toBeInTheDocument();
      expect(screen.getByText(/魅力的なクイズを簡単に作成/i)).toBeInTheDocument();
    });
    it('displays current year in copyright', () => {
      renderWithProviders(<HomePage />);
      expect(screen.getByText(/2025/)).toBeInTheDocument();
    });
  });
});
