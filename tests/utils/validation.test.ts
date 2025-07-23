import { insertPostSchema, insertContactSubmissionSchema, POST_CATEGORIES } from '../../shared/schema';

describe('Schema Validation', () => {
  describe('Post Schema', () => {
    it('should validate a valid post', () => {
      const validPost = {
        title: 'Test Post',
        slug: 'test-post',
        content: 'This is test content',
        excerpt: 'Test excerpt',
        category: 'adventures',
        authorId: 'user-123',
        isPublished: true,
      };

      const result = insertPostSchema.safeParse(validPost);
      expect(result.success).toBe(true);
    });

    it('should reject post with invalid category', () => {
      const invalidPost = {
        title: 'Test Post',
        content: 'This is test content',
        category: 'invalid-category',
        authorId: 'user-123',
      };

      const result = insertPostSchema.safeParse(invalidPost);
      expect(result.success).toBe(false);
    });

    it('should reject post without required fields', () => {
      const incompletePost = {
        title: 'Test Post',
        // Missing content and authorId
      };

      const result = insertPostSchema.safeParse(incompletePost);
      expect(result.success).toBe(false);
    });
  });

  describe('Contact Schema', () => {
    it('should validate a valid contact submission', () => {
      const validContact = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        subject: 'Test Subject',
        message: 'This is a test message',
      };

      const result = insertContactSubmissionSchema.safeParse(validContact);
      expect(result.success).toBe(true);
    });

    it('should reject contact with invalid email', () => {
      const invalidContact = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email',
        subject: 'Test Subject',
        message: 'This is a test message',
      };

      const result = insertContactSubmissionSchema.safeParse(invalidContact);
      expect(result.success).toBe(false);
    });
  });

  describe('Constants', () => {
    it('should have valid post categories', () => {
      expect(POST_CATEGORIES).toContain('adventures');
      expect(POST_CATEGORIES).toContain('mechanical');
      expect(POST_CATEGORIES).toContain('dog');
      expect(POST_CATEGORIES.length).toBe(3);
    });
  });
});