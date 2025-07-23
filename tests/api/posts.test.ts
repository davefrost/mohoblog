import request from 'supertest';
import express from 'express';
import { createApp } from '../../server/index';
import { db } from '../../server/db';
import { posts, users } from '../../shared/schema';

describe('Posts API', () => {
  let app: express.Application;
  let testUser: any;
  let testPost: any;

  beforeAll(async () => {
    app = await createApp();
    
    // Create a test user
    const [user] = await db.insert(users).values({
      id: 'test-user-id',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      isAdmin: true,
    }).returning();
    testUser = user;
  });

  afterAll(async () => {
    // Cleanup test data
    await db.delete(posts).where(posts.authorId.eq(testUser.id));
    await db.delete(users).where(users.id.eq(testUser.id));
  });

  describe('GET /api/posts', () => {
    it('should return published posts', async () => {
      const response = await request(app)
        .get('/api/posts')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should filter posts by category', async () => {
      const response = await request(app)
        .get('/api/posts?category=adventures')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((post: any) => {
        expect(post.category).toBe('adventures');
      });
    });

    it('should search posts by query', async () => {
      const response = await request(app)
        .get('/api/posts?search=test')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /api/posts', () => {
    it('should create a new post when authenticated as admin', async () => {
      const newPost = {
        title: 'Test Post',
        slug: 'test-post',
        content: 'This is a test post content',
        excerpt: 'Test excerpt',
        category: 'adventures',
        authorId: testUser.id,
        isPublished: true,
      };

      const response = await request(app)
        .post('/api/posts')
        .send(newPost)
        .expect(201);

      expect(response.body).toMatchObject({
        title: newPost.title,
        slug: newPost.slug,
        content: newPost.content,
        category: newPost.category,
      });

      testPost = response.body;
    });

    it('should return 400 for invalid post data', async () => {
      const invalidPost = {
        title: '', // Empty title should fail
        content: 'Test content',
      };

      await request(app)
        .post('/api/posts')
        .send(invalidPost)
        .expect(400);
    });
  });

  describe('GET /api/posts/:id', () => {
    it('should return a specific post', async () => {
      if (!testPost) return;

      const response = await request(app)
        .get(`/api/posts/${testPost.id}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: testPost.id,
        title: testPost.title,
        content: testPost.content,
      });
    });

    it('should return 404 for non-existent post', async () => {
      await request(app)
        .get('/api/posts/99999')
        .expect(404);
    });
  });

  describe('PATCH /api/posts/:id', () => {
    it('should update an existing post when authenticated as admin', async () => {
      if (!testPost) return;

      const updates = {
        title: 'Updated Test Post',
        content: 'Updated content',
      };

      const response = await request(app)
        .patch(`/api/posts/${testPost.id}`)
        .send(updates)
        .expect(200);

      expect(response.body.title).toBe(updates.title);
      expect(response.body.content).toBe(updates.content);
    });
  });

  describe('DELETE /api/posts/:id', () => {
    it('should delete a post when authenticated as admin', async () => {
      if (!testPost) return;

      await request(app)
        .delete(`/api/posts/${testPost.id}`)
        .expect(200);

      // Verify post is deleted
      await request(app)
        .get(`/api/posts/${testPost.id}`)
        .expect(404);
    });
  });
});