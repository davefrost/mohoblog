import { describe, it, expect, beforeEach } from '@jest/globals';
import { MockStorage } from './mockStorage';

describe('Comments Tests', () => {
  let mockStorage: MockStorage;
  let testUserId: string;
  let testPostId: number;
  
  beforeEach(async () => {
    mockStorage = new MockStorage();
    mockStorage.reset();
    
    testUserId = 'comment_author';
    await mockStorage.upsertUser({
      id: testUserId,
      email: 'commenter@example.com',
      firstName: 'Comment',
      lastName: 'Author',
      passwordHash: 'hash',
    });

    const post = await mockStorage.createPost({
      title: 'Post for Comments',
      slug: 'post-for-comments',
      content: 'Content',
      category: 'adventures',
      authorId: testUserId,
      isPublished: true,
    });
    testPostId = post.id;
  });

  describe('Comment Creation', () => {
    it('should create a comment by authenticated user', async () => {
      const comment = await mockStorage.createComment({
        postId: testPostId,
        authorId: testUserId,
        content: 'Great post!',
      });

      expect(comment).toBeDefined();
      expect(comment.postId).toBe(testPostId);
      expect(comment.authorId).toBe(testUserId);
      expect(comment.content).toBe('Great post!');
      expect(comment.isApproved).toBe(false);
    });

    it('should create an anonymous comment', async () => {
      const comment = await mockStorage.createComment({
        postId: testPostId,
        authorName: 'Anonymous',
        authorEmail: 'anonymous@example.com',
        content: 'Anonymous comment',
      });

      expect(comment).toBeDefined();
      expect(comment.authorId).toBeNull();
      expect(comment.authorName).toBe('Anonymous');
      expect(comment.authorEmail).toBe('anonymous@example.com');
    });

    it('should create a reply to a comment', async () => {
      const parent = await mockStorage.createComment({
        postId: testPostId,
        authorId: testUserId,
        content: 'Parent comment',
      });

      const reply = await mockStorage.createComment({
        postId: testPostId,
        authorId: testUserId,
        content: 'Reply comment',
        parentId: parent.id,
      });

      expect(reply.parentId).toBe(parent.id);
    });
  });

  describe('Comment Retrieval', () => {
    it('should get only approved comments for a post', async () => {
      const approved = await mockStorage.createComment({
        postId: testPostId,
        content: 'Approved comment',
        authorName: 'User1',
        authorEmail: 'user1@example.com',
      });

      await mockStorage.createComment({
        postId: testPostId,
        content: 'Unapproved comment',
        authorName: 'User2',
        authorEmail: 'user2@example.com',
      });

      await mockStorage.approveComment(approved.id);

      const comments = await mockStorage.getCommentsByPost(testPostId);
      
      expect(comments).toHaveLength(1);
      expect(comments[0].content).toBe('Approved comment');
    });

    it('should include author for authenticated comments', async () => {
      const comment = await mockStorage.createComment({
        postId: testPostId,
        authorId: testUserId,
        content: 'Authenticated comment',
      });

      await mockStorage.approveComment(comment.id);

      const comments = await mockStorage.getCommentsByPost(testPostId);
      
      expect(comments[0].author).toBeDefined();
      expect(comments[0].author!.id).toBe(testUserId);
    });
  });

  describe('Comment Approval', () => {
    it('should approve a comment', async () => {
      const comment = await mockStorage.createComment({
        postId: testPostId,
        content: 'To be approved',
        authorName: 'User',
        authorEmail: 'user@example.com',
      });

      expect(comment.isApproved).toBe(false);

      await mockStorage.approveComment(comment.id);

      const comments = await mockStorage.getCommentsByPost(testPostId);
      expect(comments).toHaveLength(1);
    });
  });

  describe('Comment Deletion', () => {
    it('should delete a comment', async () => {
      const comment = await mockStorage.createComment({
        postId: testPostId,
        content: 'To be deleted',
        authorName: 'User',
        authorEmail: 'user@example.com',
      });

      const deleted = await mockStorage.deleteComment(comment.id);
      expect(deleted).toBe(true);

      await mockStorage.approveComment(comment.id);
      const comments = await mockStorage.getCommentsByPost(testPostId);
      expect(comments).toHaveLength(0);
    });

    it('should return false for non-existent comment', async () => {
      const deleted = await mockStorage.deleteComment(99999);
      expect(deleted).toBe(false);
    });
  });
});

describe('Tags Tests', () => {
  let mockStorage: MockStorage;
  
  beforeEach(() => {
    mockStorage = new MockStorage();
    mockStorage.reset();
  });

  describe('Tag Creation', () => {
    it('should create a tag', async () => {
      const tag = await mockStorage.createTag({
        name: 'Travel',
        slug: 'travel',
        description: 'Travel related posts',
        color: '#FF5733',
      });

      expect(tag).toBeDefined();
      expect(tag.name).toBe('Travel');
      expect(tag.slug).toBe('travel');
      expect(tag.color).toBe('#FF5733');
    });

    it('should use default color if not provided', async () => {
      const tag = await mockStorage.createTag({
        name: 'Default',
        slug: 'default',
      });

      expect(tag.color).toBe('#3B82F6');
    });
  });

  describe('Tag Retrieval', () => {
    it('should get all tags', async () => {
      await mockStorage.createTag({ name: 'Tag1', slug: 'tag1' });
      await mockStorage.createTag({ name: 'Tag2', slug: 'tag2' });

      const tags = await mockStorage.getAllTags();
      
      expect(tags).toHaveLength(2);
    });

    it('should get tag by slug', async () => {
      await mockStorage.createTag({ name: 'Unique', slug: 'unique-tag' });

      const tag = await mockStorage.getTagBySlug('unique-tag');
      
      expect(tag).toBeDefined();
      expect(tag!.name).toBe('Unique');
    });

    it('should return undefined for non-existent slug', async () => {
      const tag = await mockStorage.getTagBySlug('non-existent');
      expect(tag).toBeUndefined();
    });
  });

  describe('Tag Update', () => {
    it('should update a tag', async () => {
      const tag = await mockStorage.createTag({
        name: 'Original',
        slug: 'original',
        color: '#000000',
      });

      const updated = await mockStorage.updateTag(tag.id, {
        name: 'Updated',
        color: '#FFFFFF',
      });

      expect(updated).toBeDefined();
      expect(updated!.name).toBe('Updated');
      expect(updated!.color).toBe('#FFFFFF');
      expect(updated!.slug).toBe('original');
    });

    it('should return undefined for non-existent tag', async () => {
      const updated = await mockStorage.updateTag(99999, { name: 'Test' });
      expect(updated).toBeUndefined();
    });
  });

  describe('Tag Deletion', () => {
    it('should delete a tag', async () => {
      const tag = await mockStorage.createTag({
        name: 'To Delete',
        slug: 'to-delete',
      });

      const deleted = await mockStorage.deleteTag(tag.id);
      expect(deleted).toBe(true);

      const found = await mockStorage.getTagBySlug('to-delete');
      expect(found).toBeUndefined();
    });

    it('should return false for non-existent tag', async () => {
      const deleted = await mockStorage.deleteTag(99999);
      expect(deleted).toBe(false);
    });
  });
});

describe('Analytics Tests', () => {
  let mockStorage: MockStorage;
  
  beforeEach(() => {
    mockStorage = new MockStorage();
    mockStorage.reset();
  });

  describe('Event Tracking', () => {
    it('should track an event', async () => {
      const event = await mockStorage.trackEvent({
        event: 'page_view',
        entityType: 'page',
        entityId: 'home',
        sessionId: 'session_123',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
      });

      expect(event).toBeDefined();
      expect(event.event).toBe('page_view');
      expect(event.entityType).toBe('page');
      expect(event.entityId).toBe('home');
    });

    it('should track post view', async () => {
      const event = await mockStorage.trackEvent({
        event: 'post_view',
        entityType: 'post',
        entityId: '1',
        userId: 'user_123',
      });

      expect(event.event).toBe('post_view');
      expect(event.entityType).toBe('post');
      expect(event.userId).toBe('user_123');
    });
  });

  describe('Analytics Retrieval', () => {
    it('should get events by type', async () => {
      await mockStorage.trackEvent({ event: 'page_view', entityId: '1' });
      await mockStorage.trackEvent({ event: 'page_view', entityId: '2' });
      await mockStorage.trackEvent({ event: 'post_view', entityId: '1' });

      const pageViews = await mockStorage.getAnalyticsByEvent('page_view');
      const postViews = await mockStorage.getAnalyticsByEvent('post_view');
      
      expect(pageViews).toHaveLength(2);
      expect(postViews).toHaveLength(1);
    });
  });

  describe('Dashboard Stats', () => {
    it('should return dashboard statistics', async () => {
      await mockStorage.upsertUser({
        id: 'user_1',
        email: 'user@example.com',
        firstName: 'User',
        lastName: 'One',
        passwordHash: 'hash',
      });

      await mockStorage.createPost({
        title: 'Post 1',
        slug: 'post-1',
        content: 'Content',
        category: 'adventures',
        authorId: 'user_1',
      });

      await mockStorage.createContactSubmission({
        firstName: 'Contact',
        lastName: 'User',
        email: 'contact@example.com',
        subject: 'Subject',
        message: 'Message',
      });

      const stats = await mockStorage.getDashboardStats();
      
      expect(stats.totalUsers).toBe(1);
      expect(stats.totalPosts).toBe(1);
      expect(stats.totalContacts).toBe(1);
    });
  });
});
