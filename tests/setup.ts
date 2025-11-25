import { afterAll, beforeAll, jest } from '@jest/globals';

beforeAll(() => {
  process.env.NODE_ENV = 'test';
  process.env.SESSION_SECRET = 'test-session-secret';
});

afterAll(() => {
  jest.clearAllMocks();
});

jest.setTimeout(30000);
