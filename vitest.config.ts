import { defineConfig } from 'vitest/config';
import path from 'path';
import { loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // Load env file
  const env = loadEnv(mode, process.cwd(), '');

  return {
    test: {
      environment: 'jsdom',
      setupFiles: ['src/__tests__/setupTests.tsx'],
      css: true,
      globals: true,
      include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
      exclude: ['src/test/e2e/**', 'node_modules/**'],
      env,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    esbuild: {
      jsx: 'automatic',
    },
  };
});
