// Playwright E2E smoke test
import { test, expect } from '@playwright/test';

test('home page loads', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await expect(page.getByRole('heading', { name: /TUIZ/i })).toBeVisible();
});
