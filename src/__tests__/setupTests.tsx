import '@testing-library/jest-dom';
import React from 'react';
import { beforeAll, afterEach, afterAll } from 'vitest';
import { render } from '@testing-library/react';
import { AnimationProvider } from '@/app/AnimationController';

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
