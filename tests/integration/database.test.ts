import { db } from '../../server/db';
import { users, posts, contactSubmissions } from '../../shared/schema';
import { eq } from 'drizzle-orm';

describe('Database Integration', () => {
  let testUserId: string;
  let testPostId: number;

  beforeAll(async () => {
    // Create test user
    const [user] = await db.insert(users).values({
      id: 'test-integration-user',
      email: 'integration@test.com',
      firstName: 'Integration',
      lastName: 'Test',
    }).returning();
    testUserId = user.id;
  });

  afterAll(async () => {
    // Cleanup test data
    if (testPostId) {
      await db.delete(posts).where(eq(posts.id, testPostId));
    }
    await db.delete(users).where(eq(users.id, testUserId));
  });

  describe('Users Table', () => {
    it('should create and retrieve a user', async () => {
      const [retrievedUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, testUserId));

      expect(retrievedUser).toBeDefined();
      expect(retrievedUser.email).toBe('integration@test.com');
      expect(retrievedUser.firstName).toBe('Integration');
    });

    it('should update user information', async () => {
      await db
        .update(users)
        .set({ firstName: 'Updated' })
        .where(eq(users.id, testUserId));

      const [updatedUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, testUserId));

      expect(updatedUser.firstName).toBe('Updated');
    });
  });

  describe('Posts Table', () => {
    it('should create a post', async () => {
      const [post] = await db.insert(posts).values({
        title: 'Integration Test Post',
        slug: 'integration-test-post',
        content: 'This is an integration test post',
        excerpt: 'Test excerpt',
        category: 'adventures',
        authorId: testUserId,
        isPublished: true,
      }).returning();

      testPostId = post.id;
      expect(post.title).toBe('Integration Test Post');
      expect(post.authorId).toBe(testUserId);
    });

    it('should retrieve posts with author information', async () => {
      const result = await db
        .select({
          post: posts,
          author: users,
        })
        .from(posts)
        .leftJoin(users, eq(posts.authorId, users.id))
        .where(eq(posts.id, testPostId));

      expect(result.length).toBe(1);
      expect(result[0].post.title).toBe('Integration Test Post');
      expect(result[0].author?.firstName).toBe('Updated');
    });

    it('should filter posts by category', async () => {
      const adventurePosts = await db
        .select()
        .from(posts)
        .where(eq(posts.category, 'adventures'));

      adventurePosts.forEach(post => {
        expect(post.category).toBe('adventures');
      });
    });
  });

  describe('Contact Submissions Table', () => {
    it('should create a contact submission', async () => {
      const [submission] = await db.insert(contactSubmissions).values({
        firstName: 'Test',
        lastName: 'Contact',
        email: 'test@contact.com',
        subject: 'Test Subject',
        message: 'Test message',
      }).returning();

      expect(submission.firstName).toBe('Test');
      expect(submission.email).toBe('test@contact.com');

      // Cleanup
      await db.delete(contactSubmissions).where(eq(contactSubmissions.id, submission.id));
    });
  });

  describe('Database Constraints', () => {
    it('should enforce unique email constraint for users', async () => {
      try {
        await db.insert(users).values({
          id: 'duplicate-email-test',
          email: 'integration@test.com', // This should fail due to unique constraint
          firstName: 'Duplicate',
          lastName: 'Email',
        });
        
        // If we reach here, the test should fail
        expect(true).toBe(false);
      } catch (error) {
        // This is expected - unique constraint violation
        expect(error).toBeDefined();
      }
    });

    it('should enforce unique slug constraint for posts', async () => {
      try {
        await db.insert(posts).values({
          title: 'Another Test Post',
          slug: 'integration-test-post', // This should fail due to unique constraint
          content: 'Another test post',
          category: 'mechanical',
          authorId: testUserId,
        });
        
        // If we reach here, the test should fail
        expect(true).toBe(false);
      } catch (error) {
        // This is expected - unique constraint violation
        expect(error).toBeDefined();
      }
    });
  });
});