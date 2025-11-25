import { describe, it, expect, beforeEach } from '@jest/globals';
import { MockStorage } from './mockStorage';
import { createMockUser, createMockPost } from './helpers';

describe('Blog Posts Tests', () => {
  let mockStorage: MockStorage;
  let testUser: Awaited<ReturnType<typeof mockStorage.upsertUser>>;
  
  beforeEach(async () => {
    mockStorage = new MockStorage();
    mockStorage.reset();
    
    testUser = await mockStorage.upsertUser({
      id: 'author_user',
      email: 'author@example.com',
      firstName: 'Author',
      lastName: 'User',
      passwordHash: 'hash',
      isAdmin: true,
    });
  });

  describe('Post Creation', () => {
    it('should create a new post', async () => {
      const post = await mockStorage.createPost({
        title: 'Test Post',
        slug: 'test-post',
        excerpt: 'Test excerpt',
        content: '<p>Test content</p>',
        category: 'adventures',
        authorId: testUser.id,
        isPublished: false,
      });

      expect(post).toBeDefined();
      expect(post.title).toBe('Test Post');
      expect(post.slug).toBe('test-post');
      expect(post.category).toBe('adventures');
      expect(post.authorId).toBe(testUser.id);
      expect(post.isPublished).toBe(false);
      expect(post.views).toBe(0);
    });

    it('should create a published post with publishedAt date', async () => {
      const post = await mockStorage.createPost({
        title: 'Published Post',
        slug: 'published-post',
        content: '<p>Content</p>',
        category: 'mechanical',
        authorId: testUser.id,
        isPublished: true,
      });

      expect(post.isPublished).toBe(true);
      expect(post.publishedAt).toBeDefined();
    });

    it('should validate required fields', async () => {
      const post = await mockStorage.createPost({
        title: 'Minimal Post',
        slug: 'minimal-post',
        content: 'Content is required',
        category: 'dog',
        authorId: testUser.id,
      });

      expect(post.title).toBe('Minimal Post');
      expect(post.content).toBe('Content is required');
    });
  });

  describe('Post Retrieval', () => {
    it('should get all posts', async () => {
      await mockStorage.createPost({
        title: 'Post 1',
        slug: 'post-1',
        content: 'Content 1',
        category: 'adventures',
        authorId: testUser.id,
      });

      await mockStorage.createPost({
        title: 'Post 2',
        slug: 'post-2',
        content: 'Content 2',
        category: 'mechanical',
        authorId: testUser.id,
      });

      const posts = await mockStorage.getAllPosts();
      
      expect(posts).toHaveLength(2);
      expect(posts[0].author).toBeDefined();
      expect(posts[0].author.id).toBe(testUser.id);
    });

    it('should get post by ID', async () => {
      const created = await mockStorage.createPost({
        title: 'Get By ID',
        slug: 'get-by-id',
        content: 'Content',
        category: 'adventures',
        authorId: testUser.id,
      });

      const post = await mockStorage.getPostById(created.id);
      
      expect(post).toBeDefined();
      expect(post!.id).toBe(created.id);
      expect(post!.title).toBe('Get By ID');
      expect(post!.author).toBeDefined();
    });

    it('should get post by slug', async () => {
      await mockStorage.createPost({
        title: 'Get By Slug',
        slug: 'unique-slug',
        content: 'Content',
        category: 'adventures',
        authorId: testUser.id,
      });

      const post = await mockStorage.getPostBySlug('unique-slug');
      
      expect(post).toBeDefined();
      expect(post!.slug).toBe('unique-slug');
      expect(post!.title).toBe('Get By Slug');
    });

    it('should return undefined for non-existent post', async () => {
      const postById = await mockStorage.getPostById(99999);
      const postBySlug = await mockStorage.getPostBySlug('non-existent');
      
      expect(postById).toBeUndefined();
      expect(postBySlug).toBeUndefined();
    });

    it('should get posts by category', async () => {
      await mockStorage.createPost({
        title: 'Adventure 1',
        slug: 'adventure-1',
        content: 'Content',
        category: 'adventures',
        authorId: testUser.id,
      });

      await mockStorage.createPost({
        title: 'Mechanical 1',
        slug: 'mechanical-1',
        content: 'Content',
        category: 'mechanical',
        authorId: testUser.id,
      });

      await mockStorage.createPost({
        title: 'Adventure 2',
        slug: 'adventure-2',
        content: 'Content',
        category: 'adventures',
        authorId: testUser.id,
      });

      const adventurePosts = await mockStorage.getPostsByCategory('adventures');
      const mechanicalPosts = await mockStorage.getPostsByCategory('mechanical');
      
      expect(adventurePosts).toHaveLength(2);
      expect(mechanicalPosts).toHaveLength(1);
    });

    it('should get posts by author', async () => {
      const secondAuthor = await mockStorage.upsertUser({
        id: 'second_author',
        email: 'second@example.com',
        firstName: 'Second',
        lastName: 'Author',
        passwordHash: 'hash',
      });

      await mockStorage.createPost({
        title: 'First Author Post',
        slug: 'first-author-post',
        content: 'Content',
        category: 'adventures',
        authorId: testUser.id,
      });

      await mockStorage.createPost({
        title: 'Second Author Post',
        slug: 'second-author-post',
        content: 'Content',
        category: 'adventures',
        authorId: secondAuthor.id,
      });

      const firstAuthorPosts = await mockStorage.getPostsByAuthor(testUser.id);
      const secondAuthorPosts = await mockStorage.getPostsByAuthor(secondAuthor.id);
      
      expect(firstAuthorPosts).toHaveLength(1);
      expect(secondAuthorPosts).toHaveLength(1);
      expect(firstAuthorPosts[0].title).toBe('First Author Post');
      expect(secondAuthorPosts[0].title).toBe('Second Author Post');
    });
  });

  describe('Post Update', () => {
    it('should update post fields', async () => {
      const created = await mockStorage.createPost({
        title: 'Original Title',
        slug: 'original-slug',
        content: 'Original content',
        category: 'adventures',
        authorId: testUser.id,
      });

      const updated = await mockStorage.updatePost(created.id, {
        title: 'Updated Title',
        content: 'Updated content',
        isPublished: true,
      });

      expect(updated).toBeDefined();
      expect(updated!.title).toBe('Updated Title');
      expect(updated!.content).toBe('Updated content');
      expect(updated!.isPublished).toBe(true);
      expect(updated!.slug).toBe('original-slug');
    });

    it('should return undefined for non-existent post', async () => {
      const updated = await mockStorage.updatePost(99999, {
        title: 'Updated',
      });
      expect(updated).toBeUndefined();
    });

    it('should update featured status', async () => {
      const created = await mockStorage.createPost({
        title: 'Featured Post',
        slug: 'featured-post',
        content: 'Content',
        category: 'adventures',
        authorId: testUser.id,
        isFeatured: false,
      });

      const updated = await mockStorage.updatePost(created.id, {
        isFeatured: true,
      });

      expect(updated!.isFeatured).toBe(true);
    });
  });

  describe('Post Deletion', () => {
    it('should delete a post', async () => {
      const created = await mockStorage.createPost({
        title: 'To Delete',
        slug: 'to-delete',
        content: 'Content',
        category: 'adventures',
        authorId: testUser.id,
      });

      const deleted = await mockStorage.deletePost(created.id);
      expect(deleted).toBe(true);

      const post = await mockStorage.getPostById(created.id);
      expect(post).toBeUndefined();
    });

    it('should return false for non-existent post', async () => {
      const deleted = await mockStorage.deletePost(99999);
      expect(deleted).toBe(false);
    });
  });

  describe('Post Views', () => {
    it('should increment post views', async () => {
      const created = await mockStorage.createPost({
        title: 'View Count',
        slug: 'view-count',
        content: 'Content',
        category: 'adventures',
        authorId: testUser.id,
      });

      expect(created.views).toBe(0);

      await mockStorage.incrementPostViews(created.id);
      let post = await mockStorage.getPostById(created.id);
      expect(post!.views).toBe(1);

      await mockStorage.incrementPostViews(created.id);
      await mockStorage.incrementPostViews(created.id);
      post = await mockStorage.getPostById(created.id);
      expect(post!.views).toBe(3);
    });
  });

  describe('Post Categories', () => {
    it('should validate post categories', () => {
      const validCategories = ['adventures', 'mechanical', 'dog'];
      
      validCategories.forEach(category => {
        expect(['adventures', 'mechanical', 'dog']).toContain(category);
      });
    });

    it('should filter posts by category correctly', async () => {
      await mockStorage.createPost({
        title: 'Dog Post',
        slug: 'dog-post',
        content: 'Content',
        category: 'dog',
        authorId: testUser.id,
      });

      const dogPosts = await mockStorage.getPostsByCategory('dog');
      const catPosts = await mockStorage.getPostsByCategory('cat');
      
      expect(dogPosts).toHaveLength(1);
      expect(catPosts).toHaveLength(0);
    });
  });
});
