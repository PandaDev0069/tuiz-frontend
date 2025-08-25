import { test, expect } from '@playwright/test';

test.describe('Login Page E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page before each test
    await page.goto('/auth/login');
  });

  test('displays login form correctly', async ({ page }) => {
    // Check page elements are visible
    await expect(page.getByRole('heading', { name: /TUIZ情報王/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /ホストログイン/i })).toBeVisible();
    await expect(page.getByText('クイズを作成・管理するためにログインしてください')).toBeVisible();

    // Check form fields are present
    await expect(page.getByLabel('メールアドレス')).toBeVisible();
    await expect(page.getByLabel('パスワード')).toBeVisible();
    await expect(
      page.getByRole('checkbox', { name: /次回からログイン情報を記憶する/i }),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'ログイン' })).toBeVisible();

    // Check navigation links
    await expect(page.getByRole('link', { name: '新規登録' })).toBeVisible();
    await expect(page.getByRole('link', { name: '← ホームに戻る' })).toBeVisible();
  });

  test('validates empty form submission', async ({ page }) => {
    // Try to submit empty form
    await page.getByRole('button', { name: 'ログイン' }).click();

    // Check for validation errors
    await expect(page.getByText('メールアドレスを入力してください')).toBeVisible();
    await expect(page.getByText('パスワードを入力してください')).toBeVisible();
  });

  test('validates invalid email format', async ({ page }) => {
    const emailField = page.getByLabel('メールアドレス');
    await emailField.click(); // Ensure field is focused
    await emailField.fill(''); // Clear any existing value
    await emailField.fill('invalid-email');
    await page.waitForTimeout(200); // Let browser process input

    await expect(emailField).toHaveValue('invalid-email', { timeout: 2000 });
    await page.getByLabel('パスワード').fill('password123');
    await page.getByRole('button', { name: 'ログイン' }).click();

    // Check for the format validation error
    await expect(page.getByText('有効なメールアドレスを入力してください')).toBeVisible({
      timeout: 10000,
    });
  });

  test('handles login form interaction correctly', async ({ page }) => {
    const emailField = page.getByLabel('メールアドレス');
    const passwordField = page.locator('input[name="password"]');

    await emailField.click(); // Focus the field
    await emailField.fill(''); // Clear any existing value
    await emailField.type('test@example.com'); // Type for reliability
    await passwordField.fill('password123');
    await page.waitForTimeout(100);

    // Check remember me checkbox
    const rememberMeCheckbox = page.getByRole('checkbox', {
      name: /次回からログイン情報を記憶する/i,
    });
    await rememberMeCheckbox.check();
    await expect(rememberMeCheckbox).toBeChecked();

    // Form should be filled correctly (with timeout for webkit)
    await expect(emailField).toHaveValue('test@example.com', { timeout: 2000 });
    await expect(passwordField).toHaveValue('password123', { timeout: 2000 });
  });

  test('clears validation errors when user starts typing', async ({ page }) => {
    // Submit empty form to trigger validation errors
    await page.getByRole('button', { name: 'ログイン' }).click();
    await expect(page.getByText('メールアドレスを入力してください')).toBeVisible();
    // Start typing in email field using a robust pattern (click + type)
    const email = page.getByLabel('メールアドレス');
    await email.click();
    await email.fill('');
    await email.type('t');

    // Error should be cleared (give browsers extra time)
    await expect(page.getByText('メールアドレスを入力してください')).not.toBeVisible({
      timeout: 10000,
    });
  });

  test('shows loading state during form submission', async ({ page }) => {
    const emailField = page.getByLabel('メールアドレス');
    await emailField.click(); // Focus the field
    await emailField.fill(''); // Clear any existing value
    await emailField.type('test@example.com'); // Type for reliability
    await expect(emailField).toHaveValue('test@example.com', { timeout: 2000 });

    const passwordField = page.locator('input[name="password"]');
    await passwordField.fill('password123');
    await expect(passwordField).toHaveValue('password123', { timeout: 2000 });

    await page.waitForTimeout(100); // Allow webkit to process input

    // Submit form and check loading state
    const submitButton = page.getByRole('button', { name: 'ログイン' });
    await submitButton.click();

    // Check that button shows loading state (with longer timeout for webkit)
    await expect(page.getByRole('button', { name: 'ログイン中...' })).toBeVisible({
      timeout: 10000,
    });
  });
  test('navigates to register page', async ({ page }) => {
    // Wait for the register link to be visible and clickable
    const registerLink = page.getByRole('link', { name: '新規登録' });
    await expect(registerLink).toBeVisible();

    // Click on register link
    await registerLink.click();

    // Wait for navigation to complete
    await page.waitForURL('/auth/register', { timeout: 10000 });

    // Should navigate to register page
    await expect(page).toHaveURL('/auth/register');
    await expect(page.getByRole('heading', { name: /新規アカウント作成/i })).toBeVisible();
  });

  test('navigates back to home page', async ({ page }) => {
    // Click on home link and wait for client-side navigation to complete.
    const homeLink = page.getByRole('link', { name: '← ホームに戻る' });

    // Use Promise.all to start waiting for the URL before clicking to avoid a race on slower browsers (Firefox).
    await Promise.all([
      // Use a DOMContentLoaded wait to be less strict than a full 'load' event which
      // can be flaky under heavier full-suite runs on Firefox.
      page.waitForURL('/', { timeout: 15000, waitUntil: 'domcontentloaded' }),
      homeLink.click({ force: true }),
    ]);

    // Final verification (shorter timeout because waitForURL already waited)
    await expect(page).toHaveURL('/');
  });

  test('handles login attempt with valid form data', async ({ page }) => {
    const emailField = page.getByLabel('メールアドレス');
    await emailField.click(); // Focus the field
    await emailField.fill(''); // Clear any existing value
    await emailField.type('test@example.com'); // Type for reliability
    await expect(emailField).toHaveValue('test@example.com', { timeout: 2000 });

    const passwordField = page.getByLabel('パスワード');
    await passwordField.fill('password123');
    await expect(passwordField).toHaveValue('password123', { timeout: 2000 });

    await page.waitForTimeout(100); // Allow webkit to process input
    await page.getByRole('button', { name: 'ログイン' }).click();

    // Should show loading state (this tests the form submission flow)
    await expect(page.getByRole('button', { name: 'ログイン中...' })).toBeVisible({
      timeout: 10000,
    });

    // Note: In a real E2E test environment, you would mock the API response
    // or have a test backend to verify actual authentication flows
  });
  test('handles keyboard navigation', async ({ page }) => {
    // Test tab navigation through form elements
    await page.keyboard.press('Tab'); // Email field
    await expect(page.getByLabel('メールアドレス')).toBeFocused();

    await page.keyboard.press('Tab'); // Password field
    await expect(page.locator('input[name="password"]')).toBeFocused();

    await page.keyboard.press('Tab'); // Remember me checkbox
    await expect(
      page.getByRole('checkbox', { name: /次回からログイン情報を記憶する/i }),
    ).toBeFocused();

    await page.keyboard.press('Tab'); // Login button
    await expect(page.getByRole('button', { name: 'ログイン' })).toBeFocused();
  });

  test('allows form submission with Enter key', async ({ page }) => {
    const emailField = page.getByLabel('メールアドレス');
    await emailField.click(); // Focus the field
    await emailField.fill(''); // Clear any existing value
    await emailField.type('test@example.com'); // Type for reliability
    await expect(emailField).toHaveValue('test@example.com', { timeout: 2000 });

    const passwordField = page.locator('input[name="password"]');
    await passwordField.fill('password123');
    await expect(passwordField).toHaveValue('password123', { timeout: 2000 });

    await page.waitForTimeout(100); // Allow webkit to process input

    // Press Enter to submit
    await page.keyboard.press('Enter');

    // Should show loading state (with longer timeout for webkit)
    await expect(page.getByRole('button', { name: 'ログイン中...' })).toBeVisible({
      timeout: 10000,
    });
  });

  test('password field masks input', async ({ page }) => {
    const passwordField = page.locator('input[name="password"]');
    await passwordField.click(); // Focus the field
    await passwordField.fill(''); // Clear any existing value
    await passwordField.type('secretpassword'); // Type for reliability
    await page.waitForTimeout(100); // Allow webkit to process input
    await expect(passwordField).toHaveValue('secretpassword', { timeout: 2000 });

    // Password field should have type="password"
    await expect(passwordField).toHaveAttribute('type', 'password');
  });
});
