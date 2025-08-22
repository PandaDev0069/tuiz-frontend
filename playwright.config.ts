import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './src/test/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0, // Reduce retries in CI
  workers: process.env.CI ? 2 : undefined, // Reduce workers in CI
  reporter: process.env.CI ? 'dot' : 'html', // Use dot reporter in CI for faster output
  timeout: 30000, // Global timeout
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    // Reduce timeouts in CI
    actionTimeout: process.env.CI ? 10000 : 30000,
    navigationTimeout: process.env.CI ? 15000 : 30000,
  },

  projects: process.env.CI
    ? [
        // CI: Only run on chromium for faster execution
        {
          name: 'chromium',
          use: { ...devices['Desktop Chrome'] },
        },
      ]
    : [
        // Local: Run on all browsers
        {
          name: 'chromium',
          use: { ...devices['Desktop Chrome'] },
        },
        {
          name: 'firefox',
          use: { ...devices['Desktop Firefox'] },
        },
        {
          name: 'webkit',
          use: { ...devices['Desktop Safari'] },
        },
      ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: process.env.CI ? 60000 : 120000, // Faster timeout in CI
  },
});
