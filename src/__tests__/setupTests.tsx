import '@testing-library/jest-dom';
import React from 'react';
import { beforeAll, afterEach, afterAll } from 'vitest';
import { render } from '@testing-library/react';
import { AnimationProvider } from '@/app/AnimationController';

// Load local env for tests so imports that read NEXT_PUBLIC_* do not throw.
// If .env.local is not present, continue using existing environment variables.
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const raw = fs.readFileSync(envPath, 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    // Remove surrounding quotes if present
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    // Only set if not already defined
    if (process.env[key] === undefined) {
      process.env[key] = val;
    }
  }
}

// Make React available globally for JSX
global.React = React;

import { server } from '@/__tests__/msw/server';

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Custom render function that includes necessary providers
export function renderWithProviders(ui: React.ReactElement) {
  return render(<AnimationProvider>{ui}</AnimationProvider>);
}
