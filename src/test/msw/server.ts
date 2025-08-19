import { setupServer } from 'msw/node';

// Start with no handlers; features can register later.
export const server = setupServer();
