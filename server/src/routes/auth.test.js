
import request from 'supertest';
import express from 'express';
import { jest } from '@jest/globals';

// Define mocks before importing the module under test
jest.unstable_mockModule('../db/init.js', () => ({
  query: jest.fn(),
  pool: {
    query: jest.fn()
  }
}));

jest.unstable_mockModule('bcryptjs', () => ({
  default: {
    hash: jest.fn().mockResolvedValue('hashed_password'),
    compare: jest.fn().mockResolvedValue(true)
  }
}));

jest.unstable_mockModule('jsonwebtoken', () => ({
  default: {
    sign: jest.fn().mockReturnValue('mock_token')
  }
}));

jest.unstable_mockModule('../middleware/auth.js', () => ({
  authenticateToken: (req, res, next) => {
    req.user = { id: 'user_id', tenantId: 'tenant_id' };
    next();
  },
  buildCsrfTokenForUser: jest.fn().mockReturnValue('mock_csrf_token')
}));

// Import modules after mocking
const { query } = await import('../db/init.js');
const authRouter = (await import('./auth.js')).default;

const app = express();
app.use(express.json());
app.use('/auth', authRouter);

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/register', () => {
    it('should use NULL for tenantId when it is missing', async () => {
      // Mock existing user check to return empty array (user doesn't exist)
      query.mockResolvedValueOnce({ rows: [] });

      // Mock insert user
      query.mockResolvedValueOnce({
        rows: [{ id: 'new_user_id', email: 'test@example.com', name: 'Test User', role: 'user' }]
      });

      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: 'user'
        // tenantId is intentionally missing
      };

      await request(app)
        .post('/auth/register')
        .send(userData);

      // Verify the second query (INSERT INTO users) arguments
      expect(query).toHaveBeenCalledTimes(2);

      const insertCall = query.mock.calls[1];
      const sql = insertCall[0];
      const params = insertCall[1];

      expect(sql).toContain('INSERT INTO users');
      // validatedData.email, passwordHash, validatedData.name, validatedData.role, tenantId
      // We expect it to be NULL, not undefined
      expect(params[4]).toBeNull();
    });
  });
});
