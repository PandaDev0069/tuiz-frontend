import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './src/test/e2e',
  fullyParallel: true,
  forbidOnly: true, // Always forbid only in CI
  retries: 1, // Minimal retries
  workers: 2, // Limited workers for CI
  reporter: 'dot', // Fast dot reporter
  timeout: 20000, // Shorter global timeout
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'off', // Disable tracing in CI for speed
    // Aggressive timeouts for CI
    actionTimeout: 8000,
    navigationTimeout: 12000,
  },

  projects: [
    // CI: Only run on chromium for fastest execution
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Only run CI smoke tests
  testMatch: '**/ci-smoke.spec.ts',

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: false,
    timeout: 45000, // Faster timeout
  },
});
