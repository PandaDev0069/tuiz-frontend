import { test, expect } from '@playwright/test';

test.describe('Auth E2E Smoke Tests', () => {
  test('login page loads and displays correctly', async ({ page }) => {
    await page.goto('/auth/login');

    // Check page elements are visible
    await expect(page.getByRole('heading', { name: /TUIZ情報王/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /ホストログイン/i })).toBeVisible();
    await expect(page.getByText('クイズを作成・管理するためにログインしてください')).toBeVisible();

    // Check form fields are present
    await expect(page.getByLabel('メールアドレス')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(
      page.getByRole('checkbox', { name: /次回からログイン情報を記憶する/i }),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'ログイン' })).toBeVisible();

    // Check navigation links
    await expect(page.getByRole('link', { name: '新規登録' })).toBeVisible();
    await expect(page.getByRole('link', { name: '← ホームに戻る' })).toBeVisible();
  });

  test('register page loads and displays correctly', async ({ page }) => {
    await page.goto('/auth/register');

    // Check page elements are visible
    await expect(page.getByRole('heading', { name: /TUIZ情報王/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /新規アカウント作成/i })).toBeVisible();
    await expect(
      page.getByText('クイズ作成・管理のためのアカウントを作成しましょう'),
    ).toBeVisible();

    // Check form fields are present
    await expect(page.getByLabel('メールアドレス')).toBeVisible();
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="displayName"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
    await expect(
      page.getByRole('checkbox', { name: /ユーザー名を表示名として使用/i }),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'アカウント作成' })).toBeVisible();

    // Check validation messages
    await expect(page.getByText('3-20文字、英数字とアンダースコアのみ')).toBeVisible();
    await expect(page.getByText('6文字以上のパスワード')).toBeVisible();

    // Check navigation links
    await expect(page.getByRole('link', { name: 'ログイン' })).toBeVisible();
    await expect(page.getByRole('link', { name: '← ホームに戻る' })).toBeVisible();
  });

  test('navigation between login and register works', async ({ page }) => {
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

  test('login form validation works', async ({ page }) => {
    await page.goto('/auth/login');

    // Submit empty form
    await page.getByRole('button', { name: 'ログイン' }).click();

    // Check for validation errors
    await expect(page.getByText('メールアドレスを入力してください')).toBeVisible();
    await expect(page.getByText('パスワードを入力してください')).toBeVisible();

    // Test invalid email
    await page.getByLabel('メールアドレス').fill('invalid-email');
    await page.getByRole('button', { name: 'ログイン' }).click();
    await expect(page.getByText('有効なメールアドレスを入力してください')).toBeVisible();
  });

  test('register form validation works', async ({ page }) => {
    await page.goto('/auth/register');

    // Submit empty form
    await page.getByRole('button', { name: 'アカウント作成' }).click();

    // Check for validation errors
    await expect(page.getByText('メールアドレスを入力してください')).toBeVisible();
    await expect(page.getByText('ユーザー名を入力してください')).toBeVisible();
    await expect(page.getByText('表示名を入力してください')).toBeVisible();
    await expect(page.getByText('パスワードを入力してください')).toBeVisible();
    await expect(page.getByText('パスワード確認を入力してください')).toBeVisible();
  });

  test('register username validation works', async ({ page }) => {
    await page.goto('/auth/register');

    // Test too short username
    const usernameField = page.locator('input[name="username"]');
    await usernameField.click();
    await usernameField.fill('');
    await usernameField.type('ab');
    await expect(usernameField).toHaveValue('ab', { timeout: 2000 });
    await page.getByRole('button', { name: 'アカウント作成' }).click();
    await expect(page.getByText('3文字以上で入力してください')).toBeVisible();

    // Test invalid characters
    await usernameField.click();
    await usernameField.fill('');
    await usernameField.type('test@user');
    await expect(usernameField).toHaveValue('test@user', { timeout: 2000 });
    await page.getByRole('button', { name: 'アカウント作成' }).click();
    await expect(page.getByText('英数字とアンダースコアのみ使用可能です')).toBeVisible();

    // Test too long username
    await usernameField.click();
    await usernameField.fill('');
    await usernameField.type('this_is_a_very_long_username_that_exceeds_limit');
    await expect(usernameField).toHaveValue('this_is_a_very_long_username_that_exceeds_limit', {
      timeout: 2000,
    });
    await page.getByRole('button', { name: 'アカウント作成' }).click();
    await expect(page.getByText('20文字以下で入力してください')).toBeVisible();
  });

  test('register password validation works', async ({ page }) => {
    await page.goto('/auth/register');

    // Test short password
    const passwordField = page.locator('input[name="password"]');
    await passwordField.click();
    await passwordField.fill('');
    await passwordField.type('123');
    await expect(passwordField).toHaveValue('123', { timeout: 2000 });
    await page.getByRole('button', { name: 'アカウント作成' }).click();
    await expect(page.getByText('パスワードは6文字以上で入力してください')).toBeVisible();

    // Test password mismatch
    await passwordField.click();
    await passwordField.fill('');
    await passwordField.type('password123');
    await expect(passwordField).toHaveValue('password123', { timeout: 2000 });

    const confirmPasswordField = page.locator('input[name="confirmPassword"]');
    await confirmPasswordField.click();
    await confirmPasswordField.fill('');
    await confirmPasswordField.type('different123');
    await expect(confirmPasswordField).toHaveValue('different123', { timeout: 2000 });

    await page.getByRole('button', { name: 'アカウント作成' }).click();
    await expect(page.getByText('パスワードが一致しません')).toBeVisible();
  });

  test('register display name sync with username works', async ({ page }) => {
    await page.goto('/auth/register');

    const usernameField = page.locator('input[name="username"]');
    const displayNameField = page.locator('input[name="displayName"]');
    const checkbox = page.getByRole('checkbox', { name: /ユーザー名を表示名として使用/i });

    // Initially display name should be enabled
    await expect(displayNameField).not.toBeDisabled();

    // Check the checkbox
    await checkbox.check();
    await expect(checkbox).toBeChecked();

    // Display name field should be disabled
    await expect(displayNameField).toBeDisabled();

    // Type in username and verify it syncs to display name
    await usernameField.fill('test_user');
    await expect(displayNameField).toHaveValue('test_user');

    // Uncheck the checkbox
    await checkbox.uncheck();
    await expect(checkbox).not.toBeChecked();

    // Display name field should be enabled again
    await expect(displayNameField).not.toBeDisabled();
  });

  test('form fields can be filled', async ({ page }) => {
    // Test login form
    await page.goto('/auth/login');
    const loginEmail = page.getByLabel('メールアドレス');
    const loginPassword = page.locator('input[name="password"]');

    await loginEmail.click();
    await loginEmail.fill('');
    await loginEmail.type('test@example.com');
    await expect(loginEmail).toHaveValue('test@example.com', { timeout: 2000 });

    await loginPassword.click();
    await loginPassword.fill('');
    await loginPassword.type('password123');
    await expect(loginPassword).toHaveValue('password123', { timeout: 2000 });

    // Test register form
    await page.goto('/auth/register');
    const emailField = page.getByLabel('メールアドレス');
    const usernameField = page.locator('input[name="username"]');
    const displayNameField = page.locator('input[name="displayName"]');
    const passwordField2 = page.locator('input[name="password"]');
    const confirmPasswordField2 = page.locator('input[name="confirmPassword"]');

    await emailField.click();
    await emailField.fill('');
    await emailField.type('test@example.com');
    await expect(emailField).toHaveValue('test@example.com', { timeout: 2000 });

    await usernameField.click();
    await usernameField.fill('');
    await usernameField.type('test_user');
    await expect(usernameField).toHaveValue('test_user', { timeout: 2000 });

    await displayNameField.click();
    await displayNameField.fill('');
    await displayNameField.type('Test User');
    await expect(displayNameField).toHaveValue('Test User', { timeout: 2000 });

    await passwordField2.click();
    await passwordField2.fill('');
    await passwordField2.type('password123');
    await expect(passwordField2).toHaveValue('password123', { timeout: 2000 });

    await confirmPasswordField2.click();
    await confirmPasswordField2.fill('');
    await confirmPasswordField2.type('password123');
    await expect(confirmPasswordField2).toHaveValue('password123', { timeout: 2000 });
  });

  test('password fields mask input', async ({ page }) => {
    // Login password field
    await page.goto('/auth/login');
    const loginPasswordField = page.locator('input[name="password"]');
    await expect(loginPasswordField).toHaveAttribute('type', 'password');

    // Register password fields
    await page.goto('/auth/register');
    const passwordField = page.locator('input[name="password"]');
    const confirmPasswordField = page.locator('input[name="confirmPassword"]');

    await expect(passwordField).toHaveAttribute('type', 'password');
    await expect(confirmPasswordField).toHaveAttribute('type', 'password');
  });

  test('form accessibility features work', async ({ page }) => {
    // Test login page accessibility
    await page.goto('/auth/login');
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByLabel('メールアドレス')).toHaveAttribute('required');
    await expect(page.locator('input[name="password"]')).toHaveAttribute('required');

    // Test register page accessibility
    await page.goto('/auth/register');
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByLabel('メールアドレス')).toHaveAttribute('required');
    await expect(page.locator('input[name="username"]')).toHaveAttribute('required');
    await expect(page.locator('input[name="displayName"]')).toHaveAttribute('required');
    await expect(page.locator('input[name="password"]')).toHaveAttribute('required');
    await expect(page.locator('input[name="confirmPassword"]')).toHaveAttribute('required');
  });

  test('responsive design works', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/auth/login');
    await expect(page.getByRole('heading', { name: /ホストログイン/i })).toBeVisible();
    await expect(page.getByLabel('メールアドレス')).toBeVisible();

    await page.goto('/auth/register');
    await expect(page.getByRole('heading', { name: /新規アカウント作成/i })).toBeVisible();
    await expect(page.getByLabel('メールアドレス')).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });

    await page.goto('/auth/login');
    await expect(page.getByRole('heading', { name: /ホストログイン/i })).toBeVisible();

    await page.goto('/auth/register');
    await expect(page.getByRole('heading', { name: /新規アカウント作成/i })).toBeVisible();
  });

  test('home navigation works from both pages', async ({ page }) => {
    // From login page
    await page.goto('/auth/login');
    const homeLinkLogin = page.getByRole('link', { name: '← ホームに戻る' });
    await Promise.all([page.waitForURL('/', { timeout: 10000 }), homeLinkLogin.click()]);
    await expect(page).toHaveURL('/');

    // From register page
    await page.goto('/auth/register');
    const homeLinkRegister = page.getByRole('link', { name: '← ホームに戻る' });
    await Promise.all([page.waitForURL('/', { timeout: 10000 }), homeLinkRegister.click()]);
    await expect(page).toHaveURL('/');
  });
});
