/**
 * MSW Server Setup
 * Creates a mock server for Node.js test environment
 */

import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
