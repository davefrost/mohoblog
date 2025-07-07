import { sql } from 'drizzle-orm';
import { db } from '../db';

/**
 * Execute raw SQL queries safely
 */
export async function executeRawQuery(query: string, params: any[] = []) {
  return await db.execute(sql.raw(query, params));
}

/**
 * Get database statistics
 */
export async function getDatabaseStats() {
  const [userCount] = await db.execute(sql`SELECT COUNT(*) as count FROM users`);
  const [postCount] = await db.execute(sql`SELECT COUNT(*) as count FROM posts`);
  const [publishedPostCount] = await db.execute(sql`SELECT COUNT(*) as count FROM posts WHERE is_published = true`);
  const [commentCount] = await db.execute(sql`SELECT COUNT(*) as count FROM comments`);
  const [subscriberCount] = await db.execute(sql`SELECT COUNT(*) as count FROM newsletter_subscriptions WHERE is_active = true`);
  
  return {
    users: userCount.count,
    posts: postCount.count,
    publishedPosts: publishedPostCount.count,
    comments: commentCount.count,
    subscribers: subscriberCount.count,
  };
}

/**
 * Get popular posts by views
 */
export async function getPopularPosts(limit: number = 10) {
  return await db.execute(sql`
    SELECT p.*, u.first_name, u.last_name, u.email
    FROM posts p
    LEFT JOIN users u ON p.author_id = u.id
    WHERE p.is_published = true
    ORDER BY p.views DESC
    LIMIT ${limit}
  `);
}

/**
 * Get recent activity analytics
 */
export async function getRecentActivity(days: number = 7) {
  return await db.execute(sql`
    SELECT 
      DATE(created_at) as date,
      event,
      COUNT(*) as count
    FROM analytics
    WHERE created_at >= NOW() - INTERVAL '${days} days'
    GROUP BY DATE(created_at), event
    ORDER BY date DESC
  `);
}

/**
 * Clean up old analytics data
 */
export async function cleanupOldAnalytics(daysToKeep: number = 90) {
  return await db.execute(sql`
    DELETE FROM analytics 
    WHERE created_at < NOW() - INTERVAL '${daysToKeep} days'
  `);
}

/**
 * Get post engagement metrics
 */
export async function getPostEngagement(postId: number) {
  const [views] = await db.execute(sql`
    SELECT COUNT(*) as count 
    FROM analytics 
    WHERE event = 'post_view' AND entity_id = ${postId.toString()}
  `);
  
  const [comments] = await db.execute(sql`
    SELECT COUNT(*) as count 
    FROM comments 
    WHERE post_id = ${postId} AND is_approved = true
  `);
  
  return {
    views: views.count,
    comments: comments.count,
  };
}

/**
 * Search posts with full-text search
 */
export async function searchPosts(query: string, limit: number = 20) {
  return await db.execute(sql`
    SELECT p.*, u.first_name, u.last_name,
           ts_rank(to_tsvector('english', p.title || ' ' || p.content), plainto_tsquery('english', ${query})) as rank
    FROM posts p
    LEFT JOIN users u ON p.author_id = u.id
    WHERE p.is_published = true
      AND (to_tsvector('english', p.title || ' ' || p.content) @@ plainto_tsquery('english', ${query}))
    ORDER BY rank DESC, p.created_at DESC
    LIMIT ${limit}
  `);
}

/**
 * Backup critical data
 */
export async function backupCriticalData() {
  const users = await db.execute(sql`SELECT * FROM users`);
  const posts = await db.execute(sql`SELECT * FROM posts WHERE is_published = true`);
  const comments = await db.execute(sql`SELECT * FROM comments WHERE is_approved = true`);
  
  return {
    users,
    posts,
    comments,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Create database indexes for performance
 */
export async function createPerformanceIndexes() {
  const indexes = [
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_published_created ON posts (is_published, created_at DESC)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_category_published ON posts (category, is_published)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_author_published ON posts (author_id, is_published)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_comments_post_approved ON comments (post_id, is_approved)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analytics_event_created ON analytics (event, created_at)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analytics_entity ON analytics (entity_type, entity_id)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_slug ON posts (slug)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users (email)',
  ];
  
  const results = [];
  for (const indexSql of indexes) {
    try {
      await db.execute(sql.raw(indexSql));
      results.push({ query: indexSql, success: true });
    } catch (error) {
      results.push({ query: indexSql, success: false, error: error.message });
    }
  }
  
  return results;
}