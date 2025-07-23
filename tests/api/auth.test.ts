import request from 'supertest';
import express from 'express';
import { createApp } from '../../server/index';

describe('Authentication API', () => {
  let app: express.Application;

  beforeAll(async () => {
    app = await createApp();
  });

  describe('GET /api/user', () => {
    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get('/api/user')
        .expect(401);

      expect(response.body).toEqual({
        message: 'Not authenticated'
      });
    });
  });

  describe('POST /api/login', () => {
    it('should redirect to auth provider', async () => {
      const response = await request(app)
        .post('/api/login')
        .expect(302);

      expect(response.headers.location).toBeDefined();
    });
  });

  describe('POST /api/logout', () => {
    it('should successfully logout', async () => {
      const response = await request(app)
        .post('/api/logout')
        .expect(200);

      expect(response.body).toEqual({
        message: 'Logged out successfully'
      });
    });
  });
});