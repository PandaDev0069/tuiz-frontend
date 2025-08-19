import '@testing-library/jest-dom';
import React from 'react';
import { beforeAll, afterEach, afterAll } from 'vitest';

// Make React available globally for JSX
global.React = React;

import { server } from '@/test/msw/server';

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
