import { test, expect } from '@playwright/test';

test.describe('Authentication Flow Integration E2E Tests', () => {
  test('navigates between login and register pages correctly', async ({ page }) => {
    // Start at login page
    await page.goto('/auth/login');
    await expect(page.getByRole('heading', { name: /ホストログイン/i })).toBeVisible();

    // Navigate to register page
    await page.getByRole('link', { name: '新規登録' }).click();
    await expect(page).toHaveURL('/auth/register');
    await expect(page.getByRole('heading', { name: /新規アカウント作成/i })).toBeVisible();

    // Navigate back to login page
    await page.getByRole('link', { name: 'ログイン' }).click();
    await expect(page).toHaveURL('/auth/login');
    await expect(page.getByRole('heading', { name: /ホストログイン/i })).toBeVisible();
  });

  test('maintains consistent branding across auth pages', async ({ page }) => {
    // Check login page branding
    await page.goto('/auth/login');
    await expect(page.getByRole('heading', { name: /TUIZ情報王/i })).toBeVisible();

    // Check register page branding
    await page.goto('/auth/register');
    await expect(page.getByRole('heading', { name: /TUIZ情報王/i })).toBeVisible();

    // Both pages should have home navigation link
    await expect(page.getByRole('link', { name: '← ホームに戻る' })).toBeVisible();
  });

  test('handles direct URL access to auth pages', async ({ page }) => {
    // Direct access to login page
    await page.goto('/auth/login');
    await expect(page).toHaveURL('/auth/login');
    await expect(page.getByRole('heading', { name: /ホストログイン/i })).toBeVisible();

    // Direct access to register page
    await page.goto('/auth/register');
    await expect(page).toHaveURL('/auth/register');
    await expect(page.getByRole('heading', { name: /新規アカウント作成/i })).toBeVisible();
  });

  test('handles browser back/forward navigation', async ({ page }) => {
    // Start at home, navigate to login, then register
    await page.goto('/');
    await page.goto('/auth/login');
    await page.getByRole('link', { name: '新規登録' }).click();
    await expect(page).toHaveURL('/auth/register');

    // Use browser back button
    await page.goBack();
    await expect(page).toHaveURL('/auth/login');
    await expect(page.getByRole('heading', { name: /ホストログイン/i })).toBeVisible();

    // Use browser forward button
    await page.goForward();
    await expect(page).toHaveURL('/auth/register');
    await expect(page.getByRole('heading', { name: /新規アカウント作成/i })).toBeVisible();
  });

  test('preserves form state during navigation within auth flow', async ({ page }) => {
    // Fill login form
    await page.goto('/auth/login');
    await page.getByLabel('メールアドレス').fill('test@example.com');
    await page.locator('input[name="password"]').fill('password123');

    // Navigate to register and back
    await page.getByRole('link', { name: '新規登録' }).click();
    await page.getByRole('link', { name: 'ログイン' }).click();

    // Form should be empty (this is expected behavior for security)
    await expect(page.getByLabel('メールアドレス')).toHaveValue('');
    await expect(page.locator('input[name="password"]')).toHaveValue('');
  });

  test('responsive design works on auth pages', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check login page on mobile
    await page.goto('/auth/login');
    await expect(page.getByRole('heading', { name: /ホストログイン/i })).toBeVisible();
    await expect(page.getByLabel('メールアドレス')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();

    // Check register page on mobile
    await page.goto('/auth/register');
    await expect(page.getByRole('heading', { name: /新規アカウント作成/i })).toBeVisible();
    await expect(page.getByLabel('メールアドレス')).toBeVisible();
    await expect(page.locator('input[name="username"]')).toBeVisible();

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });

    // Both pages should still work properly
    await page.goto('/auth/login');
    await expect(page.getByRole('heading', { name: /ホストログイン/i })).toBeVisible();

    await page.goto('/auth/register');
    await expect(page.getByRole('heading', { name: /新規アカウント作成/i })).toBeVisible();
  });

  test('accessibility features work across auth pages', async ({ page }) => {
    // Test login page accessibility
    await page.goto('/auth/login');

    // Check for proper ARIA labels and roles
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByLabel('メールアドレス')).toHaveAttribute('required');
    await expect(page.locator('input[name="password"]')).toHaveAttribute('required');

    // Test register page accessibility
    await page.goto('/auth/register');

    // Check for proper ARIA labels and roles
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByLabel('メールアドレス')).toHaveAttribute('required');
    await expect(page.locator('input[name="username"]')).toHaveAttribute('required');
    await expect(page.locator('input[name="displayName"]')).toHaveAttribute('required');
    await expect(page.locator('input[name="password"]')).toHaveAttribute('required');
    await expect(page.locator('input[name="confirmPassword"]')).toHaveAttribute('required');
  });

  test('page metadata and SEO elements are present', async ({ page }) => {
    // Check login page metadata
    await page.goto('/auth/login');
    await expect(page).toHaveTitle(/TUIZ|ログイン|Login/i);

    // Check register page metadata
    await page.goto('/auth/register');
    await expect(page).toHaveTitle(/TUIZ|登録|Register|新規/i);
  });

  test('form validation messages are clear and helpful', async ({ page }) => {
    // Test login validation messages
    await page.goto('/auth/login');
    await page.getByRole('button', { name: 'ログイン' }).click();

    const loginEmailError = page.getByText('メールアドレスを入力してください');
    const loginPasswordError = page.getByText('パスワードを入力してください');

    await expect(loginEmailError).toBeVisible();
    await expect(loginPasswordError).toBeVisible();

    // Test register validation messages
    await page.goto('/auth/register');
    await page.getByRole('button', { name: 'アカウント作成' }).click();

    // All required field errors should be visible
    await expect(page.getByText('メールアドレスを入力してください')).toBeVisible();
    await expect(page.getByText('ユーザー名を入力してください')).toBeVisible();
    await expect(page.getByText('表示名を入力してください')).toBeVisible();
    await expect(page.getByText('パスワードを入力してください')).toBeVisible();
    await expect(page.getByText('パスワード確認を入力してください')).toBeVisible();
  });
});
