import type { IStorage } from '../server/storage';
import type {
  User,
  UpsertUser,
  Post,
  InsertPost,
  PostWithAuthor,
  ContactSubmission,
  InsertContactSubmission,
  NewsletterSubscription,
  InsertNewsletterSubscription,
  Comment,
  InsertComment,
  CommentWithAuthor,
  Tag,
  InsertTag,
  Analytics,
  InsertAnalytics,
  PasswordResetToken,
} from '../shared/schema';

export class MockStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private posts: Map<number, Post> = new Map();
  private contactSubmissions: Map<number, ContactSubmission> = new Map();
  private newsletterSubscriptions: Map<number, NewsletterSubscription> = new Map();
  private comments: Map<number, Comment> = new Map();
  private tags: Map<number, Tag> = new Map();
  private analyticsEvents: Map<number, Analytics> = new Map();
  private passwordResetTokens: Map<string, PasswordResetToken> = new Map();
  
  private nextPostId = 1;
  private nextContactId = 1;
  private nextNewsletterId = 1;
  private nextCommentId = 1;
  private nextTagId = 1;
  private nextAnalyticsId = 1;
  private nextPasswordResetId = 1;

  reset(): void {
    this.users.clear();
    this.posts.clear();
    this.contactSubmissions.clear();
    this.newsletterSubscriptions.clear();
    this.comments.clear();
    this.tags.clear();
    this.analyticsEvents.clear();
    this.passwordResetTokens.clear();
    this.nextPostId = 1;
    this.nextContactId = 1;
    this.nextNewsletterId = 1;
    this.nextCommentId = 1;
    this.nextTagId = 1;
    this.nextAnalyticsId = 1;
    this.nextPasswordResetId = 1;
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existing = this.users.get(userData.id);
    const user: User = {
      id: userData.id,
      email: userData.email ?? existing?.email ?? null,
      firstName: userData.firstName ?? existing?.firstName ?? null,
      lastName: userData.lastName ?? existing?.lastName ?? null,
      profileImageUrl: userData.profileImageUrl ?? existing?.profileImageUrl ?? null,
      passwordHash: userData.passwordHash ?? existing?.passwordHash ?? null,
      isAdmin: userData.isAdmin ?? existing?.isAdmin ?? false,
      isActive: userData.isActive ?? existing?.isActive ?? true,
      lastLoginAt: userData.lastLoginAt ?? existing?.lastLoginAt ?? null,
      emailVerifiedAt: userData.emailVerifiedAt ?? existing?.emailVerifiedAt ?? null,
      createdAt: existing?.createdAt ?? new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values()).sort(
      (a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
  }

  async updateUser(id: string, updates: Partial<UpsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates, updatedAt: new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async updateUserProfile(id: string, updates: { firstName?: string; lastName?: string; email?: string }): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = {
      ...user,
      firstName: updates.firstName ?? user.firstName,
      lastName: updates.lastName ?? user.lastName,
      email: updates.email ?? user.email,
      updatedAt: new Date(),
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async changeUserPassword(id: string, newPasswordHash: string): Promise<boolean> {
    const user = this.users.get(id);
    if (!user) return false;
    
    user.passwordHash = newPasswordHash;
    user.updatedAt = new Date();
    this.users.set(id, user);
    return true;
  }

  async getAllPosts(): Promise<PostWithAuthor[]> {
    const postsArray = Array.from(this.posts.values());
    return postsArray
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      .map(post => ({
        ...post,
        author: this.users.get(post.authorId) as User,
      }));
  }

  async getPostById(id: number): Promise<PostWithAuthor | undefined> {
    const post = this.posts.get(id);
    if (!post) return undefined;
    return {
      ...post,
      author: this.users.get(post.authorId) as User,
    };
  }

  async getPostBySlug(slug: string): Promise<PostWithAuthor | undefined> {
    const post = Array.from(this.posts.values()).find(p => p.slug === slug);
    if (!post) return undefined;
    return {
      ...post,
      author: this.users.get(post.authorId) as User,
    };
  }

  async getPostsByCategory(category: string): Promise<PostWithAuthor[]> {
    return Array.from(this.posts.values())
      .filter(p => p.category === category)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      .map(post => ({
        ...post,
        author: this.users.get(post.authorId) as User,
      }));
  }

  async getPostsByAuthor(authorId: string): Promise<PostWithAuthor[]> {
    return Array.from(this.posts.values())
      .filter(p => p.authorId === authorId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      .map(post => ({
        ...post,
        author: this.users.get(post.authorId) as User,
      }));
  }

  async createPost(post: InsertPost): Promise<Post> {
    const newPost: Post = {
      id: this.nextPostId++,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt ?? null,
      content: post.content,
      featuredImage: post.featuredImage ?? null,
      category: post.category,
      authorId: post.authorId,
      isPublished: post.isPublished ?? false,
      isFeatured: post.isFeatured ?? false,
      views: 0,
      likes: 0,
      publishedAt: post.isPublished ? new Date() : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.posts.set(newPost.id, newPost);
    return newPost;
  }

  async updatePost(id: number, updates: Partial<InsertPost>): Promise<Post | undefined> {
    const post = this.posts.get(id);
    if (!post) return undefined;
    
    const updatedPost = { ...post, ...updates, updatedAt: new Date() };
    this.posts.set(id, updatedPost);
    return updatedPost;
  }

  async deletePost(id: number): Promise<boolean> {
    return this.posts.delete(id);
  }

  async incrementPostViews(id: number): Promise<void> {
    const post = this.posts.get(id);
    if (post) {
      post.views++;
      this.posts.set(id, post);
    }
  }

  async createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission> {
    const newSubmission: ContactSubmission = {
      id: this.nextContactId++,
      firstName: submission.firstName,
      lastName: submission.lastName,
      email: submission.email,
      subject: submission.subject,
      message: submission.message,
      isRead: false,
      createdAt: new Date(),
    };
    this.contactSubmissions.set(newSubmission.id, newSubmission);
    return newSubmission;
  }

  async getAllContactSubmissions(): Promise<ContactSubmission[]> {
    return Array.from(this.contactSubmissions.values()).sort(
      (a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
  }

  async markContactSubmissionAsRead(id: number): Promise<void> {
    const submission = this.contactSubmissions.get(id);
    if (submission) {
      submission.isRead = true;
      this.contactSubmissions.set(id, submission);
    }
  }

  async createNewsletterSubscription(subscription: InsertNewsletterSubscription): Promise<NewsletterSubscription> {
    const existing = Array.from(this.newsletterSubscriptions.values()).find(
      s => s.email === subscription.email
    );
    
    if (existing) {
      existing.isActive = true;
      this.newsletterSubscriptions.set(existing.id, existing);
      return existing;
    }
    
    const newSubscription: NewsletterSubscription = {
      id: this.nextNewsletterId++,
      email: subscription.email,
      isActive: true,
      unsubscribeToken: crypto.randomUUID(),
      createdAt: new Date(),
    };
    this.newsletterSubscriptions.set(newSubscription.id, newSubscription);
    return newSubscription;
  }

  async getNewsletterSubscriptions(): Promise<NewsletterSubscription[]> {
    return Array.from(this.newsletterSubscriptions.values())
      .filter(s => s.isActive)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async unsubscribeFromNewsletter(email: string): Promise<void> {
    const subscription = Array.from(this.newsletterSubscriptions.values()).find(
      s => s.email === email
    );
    if (subscription) {
      subscription.isActive = false;
      this.newsletterSubscriptions.set(subscription.id, subscription);
    }
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const newComment: Comment = {
      id: this.nextCommentId++,
      postId: comment.postId,
      authorId: comment.authorId ?? null,
      authorName: comment.authorName ?? null,
      authorEmail: comment.authorEmail ?? null,
      content: comment.content,
      isApproved: false,
      parentId: comment.parentId ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.comments.set(newComment.id, newComment);
    return newComment;
  }

  async getCommentsByPost(postId: number): Promise<CommentWithAuthor[]> {
    return Array.from(this.comments.values())
      .filter(c => c.postId === postId && c.isApproved)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      .map(comment => ({
        ...comment,
        author: comment.authorId ? this.users.get(comment.authorId) : undefined,
      }));
  }

  async approveComment(id: number): Promise<void> {
    const comment = this.comments.get(id);
    if (comment) {
      comment.isApproved = true;
      this.comments.set(id, comment);
    }
  }

  async deleteComment(id: number): Promise<boolean> {
    return this.comments.delete(id);
  }

  async createTag(tag: InsertTag): Promise<Tag> {
    const newTag: Tag = {
      id: this.nextTagId++,
      name: tag.name,
      slug: tag.slug,
      description: tag.description ?? null,
      color: tag.color ?? '#3B82F6',
      createdAt: new Date(),
    };
    this.tags.set(newTag.id, newTag);
    return newTag;
  }

  async getAllTags(): Promise<Tag[]> {
    return Array.from(this.tags.values()).sort(
      (a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
  }

  async getTagBySlug(slug: string): Promise<Tag | undefined> {
    return Array.from(this.tags.values()).find(t => t.slug === slug);
  }

  async updateTag(id: number, updates: Partial<InsertTag>): Promise<Tag | undefined> {
    const tag = this.tags.get(id);
    if (!tag) return undefined;
    
    const updatedTag = { ...tag, ...updates };
    this.tags.set(id, updatedTag);
    return updatedTag;
  }

  async deleteTag(id: number): Promise<boolean> {
    return this.tags.delete(id);
  }

  async trackEvent(event: InsertAnalytics): Promise<Analytics> {
    const newEvent: Analytics = {
      id: this.nextAnalyticsId++,
      event: event.event,
      entityType: event.entityType ?? null,
      entityId: event.entityId ?? null,
      userId: event.userId ?? null,
      sessionId: event.sessionId ?? null,
      ipAddress: event.ipAddress ?? null,
      userAgent: event.userAgent ?? null,
      referrer: event.referrer ?? null,
      metadata: event.metadata ?? null,
      createdAt: new Date(),
    };
    this.analyticsEvents.set(newEvent.id, newEvent);
    return newEvent;
  }

  async getAnalyticsByEvent(event: string, days: number = 30): Promise<Analytics[]> {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return Array.from(this.analyticsEvents.values())
      .filter(e => e.event === event && (e.createdAt?.getTime() || 0) >= cutoff.getTime())
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getDashboardStats(): Promise<any> {
    return {
      totalPosts: this.posts.size,
      totalUsers: this.users.size,
      totalContacts: this.contactSubmissions.size,
      totalViews: Array.from(this.analyticsEvents.values()).filter(e => e.event === 'post_view').length,
      dailyViews: [],
      topPosts: [],
      categoryBreakdown: [],
      recentActivity: [],
    };
  }

  async createPasswordResetToken(userId: string, token: string, expiresAt: Date): Promise<PasswordResetToken> {
    const resetToken: PasswordResetToken = {
      id: this.nextPasswordResetId++,
      userId,
      token,
      expiresAt,
      isUsed: false,
      createdAt: new Date(),
    };
    this.passwordResetTokens.set(token, resetToken);
    return resetToken;
  }

  async getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined> {
    const resetToken = this.passwordResetTokens.get(token);
    if (!resetToken) return undefined;
    if (resetToken.isUsed) return undefined;
    if (resetToken.expiresAt.getTime() <= Date.now()) return undefined;
    return resetToken;
  }

  async markPasswordResetTokenAsUsed(token: string): Promise<boolean> {
    const resetToken = this.passwordResetTokens.get(token);
    if (!resetToken) return false;
    resetToken.isUsed = true;
    this.passwordResetTokens.set(token, resetToken);
    return true;
  }

  async cleanupExpiredPasswordResetTokens(): Promise<void> {
    const now = Date.now();
    for (const [token, resetToken] of this.passwordResetTokens) {
      if (resetToken.expiresAt.getTime() <= now || resetToken.isUsed) {
        this.passwordResetTokens.delete(token);
      }
    }
  }
}

export const mockStorage = new MockStorage();
