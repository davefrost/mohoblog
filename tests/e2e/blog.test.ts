import request from 'supertest';
import { createApp } from '../../server/index';
import { db } from '../../server/db';
import { users, posts } from '../../shared/schema';

describe('End-to-End Blog Tests', () => {
  let app: any;
  let testUser: any;
  let testPost: any;

  beforeAll(async () => {
    app = await createApp();
    
    // Create test admin user
    const [user] = await db.insert(users).values({
      id: 'e2e-admin-user',
      email: 'admin@e2e-test.com',
      firstName: 'E2E',
      lastName: 'Admin',
      isAdmin: true,
    }).returning();
    testUser = user;
  });

  afterAll(async () => {
    // Cleanup
    if (testPost) {
      await db.delete(posts).where(posts.id.eq(testPost.id));
    }
    await db.delete(users).where(users.id.eq(testUser.id));
  });

  describe('Complete Blog Workflow', () => {
    it('should allow creating, reading, updating, and deleting a post', async () => {
      // 1. Create a new post
      const newPostData = {
        title: 'E2E Test Adventure',
        slug: 'e2e-test-adventure',
        content: 'This is a comprehensive end-to-end test for our motorhome blog.',
        excerpt: 'Testing our blog functionality from start to finish.',
        category: 'adventures',
        authorId: testUser.id,
        isPublished: true,
      };

      const createResponse = await request(app)
        .post('/api/posts')
        .send(newPostData)
        .expect(201);

      testPost = createResponse.body;
      expect(testPost.title).toBe(newPostData.title);
      expect(testPost.slug).toBe(newPostData.slug);

      // 2. Read the post from public API
      const readResponse = await request(app)
        .get(`/api/posts/${testPost.id}`)
        .expect(200);

      expect(readResponse.body.title).toBe(newPostData.title);
      expect(readResponse.body.content).toBe(newPostData.content);

      // 3. Verify post appears in public posts list
      const listResponse = await request(app)
        .get('/api/posts')
        .expect(200);

      const foundPost = listResponse.body.find((p: any) => p.id === testPost.id);
      expect(foundPost).toBeDefined();
      expect(foundPost.title).toBe(newPostData.title);

      // 4. Update the post
      const updatedData = {
        title: 'Updated E2E Test Adventure',
        content: 'This content has been updated during our end-to-end test.',
        excerpt: 'Updated excerpt for testing purposes.',
      };

      const updateResponse = await request(app)
        .patch(`/api/posts/${testPost.id}`)
        .send(updatedData)
        .expect(200);

      expect(updateResponse.body.title).toBe(updatedData.title);
      expect(updateResponse.body.content).toBe(updatedData.content);

      // 5. Verify the update persisted
      const verifyResponse = await request(app)
        .get(`/api/posts/${testPost.id}`)
        .expect(200);

      expect(verifyResponse.body.title).toBe(updatedData.title);
      expect(verifyResponse.body.content).toBe(updatedData.content);

      // 6. Delete the post
      await request(app)
        .delete(`/api/posts/${testPost.id}`)
        .expect(200);

      // 7. Verify post is deleted
      await request(app)
        .get(`/api/posts/${testPost.id}`)
        .expect(404);
    });

    it('should handle contact form submission workflow', async () => {
      const contactData = {
        firstName: 'E2E',
        lastName: 'Tester',
        email: 'e2e@test.com',
        subject: 'End-to-End Test Contact',
        message: 'This is a test message from our automated test suite.',
      };

      // Submit contact form
      const submitResponse = await request(app)
        .post('/api/contact')
        .send(contactData)
        .expect(201);

      expect(submitResponse.body.message).toBe('Message sent successfully');

      // Verify submission appears in admin list
      const submissionsResponse = await request(app)
        .get('/api/contact-submissions')
        .expect(200);

      const foundSubmission = submissionsResponse.body.find(
        (s: any) => s.email === contactData.email && s.subject === contactData.subject
      );
      expect(foundSubmission).toBeDefined();
      expect(foundSubmission.firstName).toBe(contactData.firstName);
      expect(foundSubmission.message).toBe(contactData.message);
    });

    it('should properly filter posts by category', async () => {
      // Create posts in different categories
      const adventurePost = await request(app)
        .post('/api/posts')
        .send({
          title: 'Adventure Test',
          slug: 'adventure-test',
          content: 'Adventure content',
          category: 'adventures',
          authorId: testUser.id,
          isPublished: true,
        })
        .expect(201);

      const mechanicalPost = await request(app)
        .post('/api/posts')
        .send({
          title: 'Mechanical Test',
          slug: 'mechanical-test',
          content: 'Mechanical content',
          category: 'mechanical',
          authorId: testUser.id,
          isPublished: true,
        })
        .expect(201);

      // Test adventure filter
      const adventureResponse = await request(app)
        .get('/api/posts?category=adventures')
        .expect(200);

      adventureResponse.body.forEach((post: any) => {
        expect(post.category).toBe('adventures');
      });

      // Test mechanical filter
      const mechanicalResponse = await request(app)
        .get('/api/posts?category=mechanical')
        .expect(200);

      mechanicalResponse.body.forEach((post: any) => {
        expect(post.category).toBe('mechanical');
      });

      // Cleanup
      await db.delete(posts).where(posts.id.eq(adventurePost.body.id));
      await db.delete(posts).where(posts.id.eq(mechanicalPost.body.id));
    });
  });
});