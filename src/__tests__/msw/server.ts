import { setupServer } from 'msw/node';
import { authHandlers } from './authHandlers';

// Setup MSW server with auth handlers
export const server = setupServer(...authHandlers);
