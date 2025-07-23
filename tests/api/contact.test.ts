import request from 'supertest';
import express from 'express';
import { createApp } from '../../server/index';

describe('Contact API', () => {
  let app: express.Application;

  beforeAll(async () => {
    app = await createApp();
  });

  describe('POST /api/contact', () => {
    it('should submit contact form successfully', async () => {
      const contactData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        subject: 'Test Subject',
        message: 'This is a test message',
      };

      const response = await request(app)
        .post('/api/contact')
        .send(contactData)
        .expect(201);

      expect(response.body.message).toBe('Message sent successfully');
    });

    it('should return 400 for invalid contact data', async () => {
      const invalidData = {
        firstName: '',
        email: 'invalid-email',
        message: '',
      };

      await request(app)
        .post('/api/contact')
        .send(invalidData)
        .expect(400);
    });

    it('should return 400 for missing required fields', async () => {
      const incompleteData = {
        firstName: 'John',
        // Missing required fields
      };

      await request(app)
        .post('/api/contact')
        .send(incompleteData)
        .expect(400);
    });
  });

  describe('GET /api/contact-submissions', () => {
    it('should return contact submissions for admin', async () => {
      const response = await request(app)
        .get('/api/contact-submissions')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});