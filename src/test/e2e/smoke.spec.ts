// Playwright E2E smoke test
import { test, expect } from '@playwright/test';

test('home page loads', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // Check main heading
  await expect(page.getByRole('heading', { name: /TUIZ情報王/i })).toBeVisible();

  // Check main action cards
  await expect(page.getByRole('heading', { name: /ホストとしてログイン/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /TUIZ参加 - ゲームに参加/i })).toBeVisible();

  // Check buttons
  await expect(page.getByRole('button', { name: /ログイン/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /TUIZ参加/i })).toBeVisible();

  // Check feature cards with new SEO content
  await expect(page.getByRole('heading', { name: /リアルタイムクイズ/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /学習クイズアプリ/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /クイズ作成/i })).toBeVisible();

  // Check SEO content section
  await expect(page.getByRole('heading', { name: /プラットフォームの詳細機能/i })).toBeVisible();
});
