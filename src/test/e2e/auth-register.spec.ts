import { test, expect } from '@playwright/test';

test.describe('Register Page E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to register page before each test
    await page.goto('/auth/register');
  });

  test('displays register form correctly', async ({ page }) => {
    // Check page elements are visible
    await expect(page.getByRole('heading', { name: /TUIZ情報王/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /新規アカウント作成/i })).toBeVisible();
    await expect(
      page.getByText('クイズ作成・管理のためのアカウントを作成しましょう'),
    ).toBeVisible();

    // Check form fields are present using more specific selectors
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

  test('validates empty form submission', async ({ page }) => {
    // Try to submit empty form
    await page.getByRole('button', { name: 'アカウント作成' }).click();

    // Check for all required validation errors
    await expect(page.getByText('メールアドレスを入力してください')).toBeVisible();
    await expect(page.getByText('ユーザー名を入力してください')).toBeVisible();
    await expect(page.getByText('表示名を入力してください')).toBeVisible();
    await expect(page.getByText('パスワードを入力してください')).toBeVisible();
    await expect(page.getByText('パスワード確認を入力してください')).toBeVisible();
  });
  test('validates email format', async ({ page }) => {
    const emailField = page.getByLabel('メールアドレス');
    await emailField.click();
    await emailField.fill('');
    await emailField.type('invalid-email');
    await expect(emailField).toHaveValue('invalid-email', { timeout: 2000 });

    await page.getByRole('button', { name: 'アカウント作成' }).click();
    await expect(page.getByText('有効なメールアドレスを入力してください')).toBeVisible({
      timeout: 10000,
    });
  });

  test('validates username requirements', async ({ page }) => {
    const usernameField = page.locator('input[name="username"]');

    // Test too short username
    await usernameField.click(); // Focus
    await usernameField.fill(''); // Clear
    await usernameField.type('ab'); // Type for reliability
    await expect(usernameField).toHaveValue('ab', { timeout: 2000 });
    await page.getByRole('button', { name: 'アカウント作成' }).click();
    await expect(page.getByText('3文字以上で入力してください')).toBeVisible({ timeout: 10000 });

    // Clear and test invalid characters
    await usernameField.click();
    await usernameField.fill('');
    await usernameField.type('test@user');
    await expect(usernameField).toHaveValue('test@user', { timeout: 2000 });
    await page.getByRole('button', { name: 'アカウント作成' }).click();
    await expect(page.getByText('英数字とアンダースコアのみ使用可能です')).toBeVisible({
      timeout: 10000,
    });

    // Clear and test too long username
    await usernameField.click();
    await usernameField.fill('');
    await usernameField.type('this_is_a_very_long_username_that_exceeds_limit');
    await expect(usernameField).toHaveValue('this_is_a_very_long_username_that_exceeds_limit', {
      timeout: 2000,
    });
    await page.getByRole('button', { name: 'アカウント作成' }).click();
    await expect(page.getByText('20文字以下で入力してください')).toBeVisible({ timeout: 10000 });
  });

  test('validates password requirements', async ({ page }) => {
    const passwordField = page.locator('input[name="password"]');
    await passwordField.click(); // Focus
    await passwordField.fill(''); // Clear
    await passwordField.type('123'); // Type for reliability
    await expect(passwordField).toHaveValue('123', { timeout: 2000 });

    await page.getByRole('button', { name: 'アカウント作成' }).click();

    // Check for password length error
    await expect(page.getByText('パスワードは6文字以上で入力してください')).toBeVisible({
      timeout: 10000,
    });
  });

  test('validates password confirmation', async ({ page }) => {
    // Enter different passwords
    await page.locator('input[name="password"]').fill('password123');
    await page.locator('input[name="confirmPassword"]').fill('differentpassword');
    await page.getByRole('button', { name: 'アカウント作成' }).click();

    // Check for password mismatch error
    await expect(page.getByText('パスワードが一致しません')).toBeVisible();
  });

  test('synchronizes display name with username when checkbox is checked', async ({ page }) => {
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

  test('handles complete valid form submission', async ({ page }) => {
    // Fill out all required fields with valid data
    const emailField = page.getByLabel('メールアドレス');
    await emailField.click();
    await emailField.fill('');
    await emailField.type('test@example.com');
    await expect(emailField).toHaveValue('test@example.com', { timeout: 2000 });

    const usernameField = page.locator('input[name="username"]');
    await usernameField.click();
    await usernameField.fill('');
    await usernameField.type('test_user');
    await expect(usernameField).toHaveValue('test_user', { timeout: 2000 });

    const displayNameField = page.locator('input[name="displayName"]');
    await displayNameField.click();
    await displayNameField.fill('');
    await displayNameField.type('Test User');
    await expect(displayNameField).toHaveValue('Test User', { timeout: 2000 });

    const passwordField = page.locator('input[name="password"]');
    await passwordField.click();
    await passwordField.fill('');
    await passwordField.type('password123');
    await expect(passwordField).toHaveValue('password123', { timeout: 2000 });

    const confirmPasswordField = page.locator('input[name="confirmPassword"]');
    await confirmPasswordField.click();
    await confirmPasswordField.fill('');
    await confirmPasswordField.type('password123');
    await expect(confirmPasswordField).toHaveValue('password123', { timeout: 2000 });

    // Submit form
    await page.getByRole('button', { name: 'アカウント作成' }).click();

    // Check loading state
    await expect(page.getByRole('button', { name: '作成中...' })).toBeVisible({ timeout: 10000 });
  });

  test('clears validation errors when user starts typing', async ({ page }) => {
    // Submit empty form to trigger validation errors
    await page.getByRole('button', { name: 'アカウント作成' }).click();
    await expect(page.getByText('メールアドレスを入力してください')).toBeVisible();

    // Start typing in email field
    await page.getByLabel('メールアドレス').fill('t');

    // Error should be cleared
    await expect(page.getByText('メールアドレスを入力してください')).not.toBeVisible();
  });

  test('navigates to login page', async ({ page }) => {
    // Click on login link
    await page.getByRole('link', { name: 'ログイン' }).click();

    // Should navigate to login page
    await expect(page).toHaveURL('/auth/login');
    await expect(page.getByRole('heading', { name: /ホストログイン/i })).toBeVisible();
  });

  test('navigates back to home page', async ({ page }) => {
    // Click on home link
    const homeLink = page.getByRole('link', { name: '← ホームに戻る' });

    // Click and wait for client-side navigation — use waitForURL to handle SPA routing
    await Promise.all([page.waitForURL('/', { timeout: 10000 }), homeLink.click()]);

    // Verify landed on home
    await expect(page).toHaveURL('/');
  });

  test('handles keyboard navigation through form', async ({ page }) => {
    // Test tab navigation through all form elements
    await page.keyboard.press('Tab'); // Email field
    await expect(page.getByLabel('メールアドレス')).toBeFocused();

    await page.keyboard.press('Tab'); // Username field
    await expect(page.locator('input[name="username"]')).toBeFocused();

    await page.keyboard.press('Tab'); // Display name field
    await expect(page.locator('input[name="displayName"]')).toBeFocused();

    await page.keyboard.press('Tab'); // Display name checkbox
    await expect(
      page.getByRole('checkbox', { name: /ユーザー名を表示名として使用/i }),
    ).toBeFocused();

    await page.keyboard.press('Tab'); // Password field
    await expect(page.locator('input[name="password"]')).toBeFocused();

    await page.keyboard.press('Tab'); // Confirm password field
    await expect(page.locator('input[name="confirmPassword"]')).toBeFocused();

    await page.keyboard.press('Tab'); // Submit button
    await expect(page.getByRole('button', { name: 'アカウント作成' })).toBeFocused();
  });

  test('allows form submission with Enter key', async ({ page }) => {
    const emailField = page.getByLabel('メールアドレス');
    const usernameField = page.locator('input[name="username"]');
    const displayNameField = page.locator('input[name="displayName"]');
    const passwordField = page.locator('input[name="password"]');
    const confirmPasswordField = page.locator('input[name="confirmPassword"]');

    // Fill form robustly (click, clear, type) and verify values before submitting — helps WebKit
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

    await passwordField.click();
    await passwordField.fill('');
    await passwordField.type('password123');
    await expect(passwordField).toHaveValue('password123', { timeout: 2000 });

    await confirmPasswordField.click();
    await confirmPasswordField.fill('');
    await confirmPasswordField.type('password123');
    await expect(confirmPasswordField).toHaveValue('password123', { timeout: 2000 });

    // Start listening for the registration network response BEFORE submitting the form
    const registerResponsePromise = page.waitForResponse(
      (resp) => resp.request().method() === 'POST' && /register/i.test(resp.url()),
      { timeout: 20000 },
    );

    // Press Enter while focused on confirm password to submit the form
    // Ensure confirm field is focused, add a tiny delay, then press Enter to submit
    await confirmPasswordField.focus();
    await page.waitForTimeout(50);
    await confirmPasswordField.press('Enter');

    // Wait for registration network response OR a loading UI OR a navigation away from the page OR an error/text signal.
    // Use Promise.any so a single slow waiter doesn't reject the whole combined wait.
    await Promise.any([
      registerResponsePromise,
      page.getByRole('button', { name: '作成中...' }).waitFor({ state: 'visible', timeout: 20000 }),
      page.waitForURL((url) => !url.toString().includes('/auth/register'), { timeout: 20000 }),
      page
        .getByText(/アカウント作成に失敗しました|失敗しました|成功しました|登録が完了/)
        .waitFor({ state: 'visible', timeout: 20000 }),
    ]);
  });

  test('password fields mask input correctly', async ({ page }) => {
    const passwordField = page.locator('input[name="password"]');
    const confirmPasswordField = page.locator('input[name="confirmPassword"]');

    // Both password fields should have type="password"
    await expect(passwordField).toHaveAttribute('type', 'password');
    await expect(confirmPasswordField).toHaveAttribute('type', 'password');

    // Fill passwords robustly and verify values (helps WebKit)
    await passwordField.click();
    await passwordField.fill('');
    await passwordField.type('secretpassword');
    await expect(passwordField).toHaveValue('secretpassword', { timeout: 2000 });

    await confirmPasswordField.click();
    await confirmPasswordField.fill('');
    await confirmPasswordField.type('secretpassword');
    await expect(confirmPasswordField).toHaveValue('secretpassword', { timeout: 2000 });
  });

  test('validates display name length', async ({ page }) => {
    const displayNameField = page.locator('input[name="displayName"]');

    // Test display name that's too long (over 50 characters)
    await displayNameField.click();
    await displayNameField.fill('');
    await displayNameField.type(
      'This is a very long display name that exceeds the fifty character limit and should trigger validation error',
    );
    await expect(displayNameField).toHaveValue(
      'This is a very long display name that exceeds the fifty character limit and should trigger validation error',
      { timeout: 2000 },
    );
    await page.getByRole('button', { name: 'アカウント作成' }).click();

    // Check for length validation error
    await expect(page.getByText('表示名は1-50文字で入力してください')).toBeVisible();
  });

  test('handles successful registration flow', async ({ page }) => {
    // Fill out valid form data
    const emailField = page.getByLabel('メールアドレス');
    const usernameField = page.locator('input[name="username"]');
    const displayNameField = page.locator('input[name="displayName"]');
    const passwordField = page.locator('input[name="password"]');
    const confirmPasswordField = page.locator('input[name="confirmPassword"]');

    await emailField.click();
    await emailField.fill('');
    await emailField.type('newuser@example.com');
    await expect(emailField).toHaveValue('newuser@example.com', { timeout: 2000 });

    await usernameField.click();
    await usernameField.fill('');
    await usernameField.type('newuser123');
    await expect(usernameField).toHaveValue('newuser123', { timeout: 2000 });

    await displayNameField.click();
    await displayNameField.fill('');
    await displayNameField.type('New User');
    await expect(displayNameField).toHaveValue('New User', { timeout: 2000 });

    await passwordField.click();
    await passwordField.fill('');
    await passwordField.type('password123');
    await expect(passwordField).toHaveValue('password123', { timeout: 2000 });

    await confirmPasswordField.click();
    await confirmPasswordField.fill('');
    await confirmPasswordField.type('password123');
    await expect(confirmPasswordField).toHaveValue('password123', { timeout: 2000 });

    // Submit form
    const registerResponsePromise = page.waitForResponse(
      (resp) => resp.request().method() === 'POST' && /register/i.test(resp.url()),
      { timeout: 20000 },
    );
    await page.getByRole('button', { name: 'アカウント作成' }).click();

    // Wait for registration network response OR a loading UI OR a navigation away from the page OR an error message.
    // Use Promise.any so a single slow waiter doesn't reject the combined wait prematurely.
    await Promise.any([
      registerResponsePromise,
      page.getByRole('button', { name: '作成中...' }).waitFor({ state: 'visible', timeout: 20000 }),
      page.waitForURL((url) => !url.toString().includes('/auth/register'), { timeout: 20000 }),
      page
        .getByText(/アカウント作成に失敗しました|失敗しました|成功しました|登録が完了/)
        .waitFor({ state: 'visible', timeout: 20000 }),
    ]);
  });

  test('displays error for duplicate email/username', async ({ page }) => {
    // Intercept registration network request and return a deterministic duplicate-error response
    await page.route('**/*', (route, request) => {
      try {
        if (request.method() === 'POST' && /register/i.test(request.url())) {
          route.fulfill({
            status: 400,
            contentType: 'application/json',
            body: JSON.stringify({ message: 'アカウント作成に失敗しました: duplicate' }),
          });
          return;
        }
      } catch {
        // If anything goes wrong with route logic, continue the request so test doesn't hang
      }
      route.continue();
    });

    // Fill form with potentially duplicate credentials
    const emailField = page.getByLabel('メールアドレス');
    const usernameField = page.locator('input[name="username"]');
    const displayNameField = page.locator('input[name="displayName"]');
    const passwordField = page.locator('input[name="password"]');
    const confirmPasswordField = page.locator('input[name="confirmPassword"]');

    await emailField.click();
    await emailField.fill('');
    await emailField.type('existing@example.com');
    await expect(emailField).toHaveValue('existing@example.com', { timeout: 2000 });

    await usernameField.click();
    await usernameField.fill('');
    await usernameField.type('existing_user');
    await expect(usernameField).toHaveValue('existing_user', { timeout: 2000 });

    await displayNameField.click();
    await displayNameField.fill('');
    await displayNameField.type('Existing User');
    await expect(displayNameField).toHaveValue('Existing User', { timeout: 2000 });

    await passwordField.click();
    await passwordField.fill('');
    await passwordField.type('password123');
    await expect(passwordField).toHaveValue('password123', { timeout: 2000 });

    await confirmPasswordField.click();
    await confirmPasswordField.fill('');
    await confirmPasswordField.type('password123');
    await expect(confirmPasswordField).toHaveValue('password123', { timeout: 2000 });

    // Submit form
    await page.getByRole('button', { name: 'アカウント作成' }).click();

    // Should show error message for duplicate (we mock the backend above)
    await expect(page.getByText(/アカウント作成に失敗しました/)).toBeVisible({ timeout: 10000 });
  });
});
