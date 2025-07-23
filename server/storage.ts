import {
  users,
  posts,
  contactSubmissions,
  newsletterSubscriptions,
  comments,
  tags,
  postTags,
  analytics,
  type User,
  type UpsertUser,
  type InsertPost,
  type Post,
  type PostWithAuthor,
  type InsertContactSubmission,
  type ContactSubmission,
  type InsertNewsletterSubscription,
  type NewsletterSubscription,
  type InsertComment,
  type Comment,
  type CommentWithAuthor,
  type InsertTag,
  type Tag,
  type InsertAnalytics,
  type Analytics,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, ilike, and, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUser(id: string, updates: Partial<UpsertUser>): Promise<User | undefined>;
  updateUserProfile(id: string, updates: { firstName?: string; lastName?: string; email?: string }): Promise<User | undefined>;
  changeUserPassword(id: string, newPasswordHash: string): Promise<boolean>;
  
  // Post operations
  getAllPosts(): Promise<PostWithAuthor[]>;
  getPostById(id: number): Promise<PostWithAuthor | undefined>;
  getPostBySlug(slug: string): Promise<PostWithAuthor | undefined>;
  getPostsByCategory(category: string): Promise<PostWithAuthor[]>;
  getPostsByAuthor(authorId: string): Promise<PostWithAuthor[]>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: number, updates: Partial<InsertPost>): Promise<Post | undefined>;
  deletePost(id: number): Promise<boolean>;
  incrementPostViews(id: number): Promise<void>;
  
  // Contact operations
  createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission>;
  getAllContactSubmissions(): Promise<ContactSubmission[]>;
  markContactSubmissionAsRead(id: number): Promise<void>;
  
  // Newsletter operations
  createNewsletterSubscription(subscription: InsertNewsletterSubscription): Promise<NewsletterSubscription>;
  getNewsletterSubscriptions(): Promise<NewsletterSubscription[]>;
  unsubscribeFromNewsletter(email: string): Promise<void>;
  
  // Comment operations
  createComment(comment: InsertComment): Promise<Comment>;
  getCommentsByPost(postId: number): Promise<CommentWithAuthor[]>;
  approveComment(id: number): Promise<void>;
  deleteComment(id: number): Promise<boolean>;
  
  // Tag operations
  createTag(tag: InsertTag): Promise<Tag>;
  getAllTags(): Promise<Tag[]>;
  getTagBySlug(slug: string): Promise<Tag | undefined>;
  updateTag(id: number, updates: Partial<InsertTag>): Promise<Tag | undefined>;
  deleteTag(id: number): Promise<boolean>;
  
  // Analytics operations
  trackEvent(event: InsertAnalytics): Promise<Analytics>;
  getAnalyticsByEvent(event: string, days?: number): Promise<Analytics[]>;
  getDashboardStats(): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async updateUser(id: string, updates: Partial<UpsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserProfile(id: string, updates: { firstName?: string; lastName?: string; email?: string }): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ 
        firstName: updates.firstName,
        lastName: updates.lastName,
        email: updates.email,
        updatedAt: new Date() 
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async changeUserPassword(id: string, newPasswordHash: string): Promise<boolean> {
    const result = await db
      .update(users)
      .set({ 
        passwordHash: newPasswordHash,
        updatedAt: new Date() 
      })
      .where(eq(users.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Post operations
  async getAllPosts(): Promise<PostWithAuthor[]> {
    return await db
      .select()
      .from(posts)
      .leftJoin(users, eq(posts.authorId, users.id))
      .orderBy(desc(posts.createdAt))
      .then(rows => rows.map(row => ({ ...row.posts, author: row.users! })));
  }

  async getPostById(id: number): Promise<PostWithAuthor | undefined> {
    const [result] = await db
      .select()
      .from(posts)
      .leftJoin(users, eq(posts.authorId, users.id))
      .where(eq(posts.id, id));
    
    return result ? { ...result.posts, author: result.users! } : undefined;
  }

  async getPostBySlug(slug: string): Promise<PostWithAuthor | undefined> {
    const [result] = await db
      .select()
      .from(posts)
      .leftJoin(users, eq(posts.authorId, users.id))
      .where(eq(posts.slug, slug));
    
    return result ? { ...result.posts, author: result.users! } : undefined;
  }

  async getPostsByCategory(category: string): Promise<PostWithAuthor[]> {
    return await db
      .select()
      .from(posts)
      .leftJoin(users, eq(posts.authorId, users.id))
      .where(eq(posts.category, category))
      .orderBy(desc(posts.createdAt))
      .then(rows => rows.map(row => ({ ...row.posts, author: row.users! })));
  }

  async getPostsByAuthor(authorId: string): Promise<PostWithAuthor[]> {
    return await db
      .select()
      .from(posts)
      .leftJoin(users, eq(posts.authorId, users.id))
      .where(eq(posts.authorId, authorId))
      .orderBy(desc(posts.createdAt))
      .then(rows => rows.map(row => ({ ...row.posts, author: row.users! })));
  }

  async createPost(post: InsertPost): Promise<Post> {
    const [newPost] = await db
      .insert(posts)
      .values(post)
      .returning();
    return newPost;
  }

  async updatePost(id: number, updates: Partial<InsertPost>): Promise<Post | undefined> {
    const [post] = await db
      .update(posts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(posts.id, id))
      .returning();
    return post;
  }

  async deletePost(id: number): Promise<boolean> {
    const result = await db
      .delete(posts)
      .where(eq(posts.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async incrementPostViews(id: number): Promise<void> {
    await db
      .update(posts)
      .set({ views: sql`${posts.views} + 1` })
      .where(eq(posts.id, id));
  }

  // Contact operations
  async createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission> {
    const [newSubmission] = await db
      .insert(contactSubmissions)
      .values(submission)
      .returning();
    return newSubmission;
  }

  async getAllContactSubmissions(): Promise<ContactSubmission[]> {
    return await db
      .select()
      .from(contactSubmissions)
      .orderBy(desc(contactSubmissions.createdAt));
  }

  async markContactSubmissionAsRead(id: number): Promise<void> {
    await db
      .update(contactSubmissions)
      .set({ isRead: true })
      .where(eq(contactSubmissions.id, id));
  }

  // Newsletter operations
  async createNewsletterSubscription(subscription: InsertNewsletterSubscription): Promise<NewsletterSubscription> {
    const [newSubscription] = await db
      .insert(newsletterSubscriptions)
      .values(subscription)
      .onConflictDoUpdate({
        target: newsletterSubscriptions.email,
        set: { isActive: true },
      })
      .returning();
    return newSubscription;
  }

  async getNewsletterSubscriptions(): Promise<NewsletterSubscription[]> {
    return await db
      .select()
      .from(newsletterSubscriptions)
      .where(eq(newsletterSubscriptions.isActive, true))
      .orderBy(desc(newsletterSubscriptions.createdAt));
  }

  async unsubscribeFromNewsletter(email: string): Promise<void> {
    await db
      .update(newsletterSubscriptions)
      .set({ isActive: false })
      .where(eq(newsletterSubscriptions.email, email));
  }

  // Comment operations
  async createComment(comment: InsertComment): Promise<Comment> {
    const [newComment] = await db
      .insert(comments)
      .values(comment)
      .returning();
    return newComment;
  }

  async getCommentsByPost(postId: number): Promise<CommentWithAuthor[]> {
    const result = await db
      .select()
      .from(comments)
      .leftJoin(users, eq(comments.authorId, users.id))
      .where(and(eq(comments.postId, postId), eq(comments.isApproved, true)))
      .orderBy(desc(comments.createdAt));
    
    return result.map(row => ({
      ...row.comments,
      author: row.users || undefined
    }));
  }

  async approveComment(id: number): Promise<void> {
    await db
      .update(comments)
      .set({ isApproved: true })
      .where(eq(comments.id, id));
  }

  async deleteComment(id: number): Promise<boolean> {
    const result = await db
      .delete(comments)
      .where(eq(comments.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Tag operations
  async createTag(tag: InsertTag): Promise<Tag> {
    const [newTag] = await db
      .insert(tags)
      .values(tag)
      .returning();
    return newTag;
  }

  async getAllTags(): Promise<Tag[]> {
    return await db
      .select()
      .from(tags)
      .orderBy(desc(tags.createdAt));
  }

  async getTagBySlug(slug: string): Promise<Tag | undefined> {
    const [tag] = await db
      .select()
      .from(tags)
      .where(eq(tags.slug, slug));
    return tag;
  }

  async updateTag(id: number, updates: Partial<InsertTag>): Promise<Tag | undefined> {
    const [tag] = await db
      .update(tags)
      .set(updates)
      .where(eq(tags.id, id))
      .returning();
    return tag;
  }

  async deleteTag(id: number): Promise<boolean> {
    const result = await db
      .delete(tags)
      .where(eq(tags.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Analytics operations
  async trackEvent(event: InsertAnalytics): Promise<Analytics> {
    const [newEvent] = await db
      .insert(analytics)
      .values(event)
      .returning();
    return newEvent;
  }

  async getAnalyticsByEvent(event: string, days: number = 30): Promise<Analytics[]> {
    return await db
      .select()
      .from(analytics)
      .where(and(
        eq(analytics.event, event),
        sql`${analytics.createdAt} >= NOW() - INTERVAL '${days} days'`
      ))
      .orderBy(desc(analytics.createdAt));
  }

  async getDashboardStats(): Promise<any> {
    const totalPosts = await db.select({ count: sql<number>`count(*)` }).from(posts);
    const totalUsers = await db.select({ count: sql<number>`count(*)` }).from(users);
    const totalContacts = await db.select({ count: sql<number>`count(*)` }).from(contactSubmissions);
    
    // Get total views
    const totalViewsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(analytics)
      .where(eq(analytics.event, 'post_view'));
    
    // Get daily views for the last 30 days
    const dailyViews = await db
      .select({
        date: sql<string>`DATE(${analytics.createdAt})`,
        views: sql<number>`count(*)`
      })
      .from(analytics)
      .where(
        and(
          eq(analytics.event, 'post_view'),
          sql`${analytics.createdAt} >= NOW() - INTERVAL '30 days'`
        )
      )
      .groupBy(sql`DATE(${analytics.createdAt})`)
      .orderBy(sql`DATE(${analytics.createdAt}) DESC`)
      .limit(30);

    // Get top posts by views
    const topPosts = await db
      .select({
        title: posts.title,
        slug: posts.slug,
        views: posts.views
      })
      .from(posts)
      .where(eq(posts.isPublished, true))
      .orderBy(desc(posts.views))
      .limit(10);

    // Get category breakdown
    const categoryBreakdown = await db
      .select({
        category: posts.category,
        count: sql<number>`count(*)`
      })
      .from(posts)
      .where(eq(posts.isPublished, true))
      .groupBy(posts.category)
      .orderBy(desc(sql<number>`count(*)`));

    // Get recent activity
    const recentActivity = await db
      .select({
        event: analytics.event,
        timestamp: analytics.createdAt,
        details: analytics.metadata
      })
      .from(analytics)
      .orderBy(desc(analytics.createdAt))
      .limit(20);

    return {
      totalPosts: totalPosts[0]?.count || 0,
      totalUsers: totalUsers[0]?.count || 0,
      totalContacts: totalContacts[0]?.count || 0,
      totalViews: totalViewsResult[0]?.count || 0,
      dailyViews: dailyViews.reverse(),
      topPosts: topPosts || [],
      categoryBreakdown: categoryBreakdown || [],
      recentActivity: (recentActivity || []).map(activity => ({
        event: activity.event,
        timestamp: activity.timestamp,
        details: typeof activity.details === 'object' 
          ? JSON.stringify(activity.details) 
          : activity.details || 'No details'
      }))
    };
  }
}

export const storage = new DatabaseStorage();
