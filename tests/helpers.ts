import type { User, Post, ContactSubmission, NewsletterSubscription, Comment, Tag, Analytics, PasswordResetToken } from '../shared/schema';

export function createMockUser(overrides: Partial<User> = {}): User {
  const id = `user_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  return {
    id,
    email: `test-${id}@example.com`,
    firstName: 'Test',
    lastName: 'User',
    profileImageUrl: null,
    passwordHash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4aOf0Q.YxSWGKDUC', // 'password123'
    isAdmin: false,
    isActive: true,
    lastLoginAt: null,
    emailVerifiedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function createMockPost(authorId: string, overrides: Partial<Post> = {}): Post {
  const id = Math.floor(Math.random() * 10000);
  return {
    id,
    title: `Test Post ${id}`,
    slug: `test-post-${id}`,
    excerpt: 'This is a test post excerpt',
    content: '<p>This is the test post content.</p>',
    featuredImage: null,
    category: 'adventures',
    authorId,
    isPublished: true,
    isFeatured: false,
    views: 0,
    likes: 0,
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function createMockContactSubmission(overrides: Partial<ContactSubmission> = {}): ContactSubmission {
  const id = Math.floor(Math.random() * 10000);
  return {
    id,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    subject: 'Test Subject',
    message: 'This is a test message.',
    isRead: false,
    createdAt: new Date(),
    ...overrides,
  };
}

export function createMockNewsletterSubscription(overrides: Partial<NewsletterSubscription> = {}): NewsletterSubscription {
  const id = Math.floor(Math.random() * 10000);
  return {
    id,
    email: `subscriber-${id}@example.com`,
    isActive: true,
    unsubscribeToken: crypto.randomUUID(),
    createdAt: new Date(),
    ...overrides,
  };
}

export function createMockComment(postId: number, overrides: Partial<Comment> = {}): Comment {
  const id = Math.floor(Math.random() * 10000);
  return {
    id,
    postId,
    authorId: null,
    authorName: 'Anonymous User',
    authorEmail: 'anonymous@example.com',
    content: 'This is a test comment.',
    isApproved: false,
    parentId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function createMockTag(overrides: Partial<Tag> = {}): Tag {
  const id = Math.floor(Math.random() * 10000);
  return {
    id,
    name: `Tag ${id}`,
    slug: `tag-${id}`,
    description: 'A test tag',
    color: '#3B82F6',
    createdAt: new Date(),
    ...overrides,
  };
}

export function createMockAnalytics(overrides: Partial<Analytics> = {}): Analytics {
  const id = Math.floor(Math.random() * 10000);
  return {
    id,
    event: 'page_view',
    entityType: 'page',
    entityId: 'home',
    userId: null,
    sessionId: `session_${Date.now()}`,
    ipAddress: '127.0.0.1',
    userAgent: 'Mozilla/5.0 (Test)',
    referrer: null,
    metadata: null,
    createdAt: new Date(),
    ...overrides,
  };
}

export function createMockPasswordResetToken(userId: string, overrides: Partial<PasswordResetToken> = {}): PasswordResetToken {
  const id = Math.floor(Math.random() * 10000);
  return {
    id,
    userId,
    token: crypto.randomUUID(),
    expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
    isUsed: false,
    createdAt: new Date(),
    ...overrides,
  };
}

export const testCredentials = {
  email: 'testuser@example.com',
  password: 'TestPassword123!',
};

export const adminCredentials = {
  email: 'admin@example.com',
  password: 'AdminPassword123!',
};
