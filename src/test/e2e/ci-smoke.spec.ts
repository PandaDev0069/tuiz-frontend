// CI-optimized smoke tests - only essential functionality
import { test, expect } from '@playwright/test';

test.describe('CI Smoke Tests', () => {
  test('home page loads', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /TUIZ/i })).toBeVisible();
  });

  test('login page loads', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page.getByRole('heading', { name: /TUIZ情報王/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /ホストログイン/i })).toBeVisible();
  });

  test('register page loads', async ({ page }) => {
    await page.goto('/auth/register');
    await expect(page.getByRole('heading', { name: /TUIZ情報王/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /新規アカウント作成/i })).toBeVisible();
  });

  test('basic navigation works', async ({ page }) => {
    // Test home -> login navigation
    await page.goto('/');
    await page.getByRole('link', { name: /ログイン/i }).click();
    await expect(page).toHaveURL('/auth/login');

    // Test login -> register navigation
    await page.getByRole('link', { name: '新規登録' }).click();
    await expect(page).toHaveURL('/auth/register');
  });

  test('form validation basics', async ({ page }) => {
    await page.goto('/auth/login');

    // Submit empty form
    await page.getByRole('button', { name: 'ログイン' }).click();

    // Check for basic validation errors
    await expect(page.getByText('メールアドレスを入力してください')).toBeVisible();
    await expect(page.getByText('パスワードを入力してください')).toBeVisible();
  });
});
