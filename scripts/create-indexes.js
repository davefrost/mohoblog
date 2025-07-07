#!/usr/bin/env node

/**
 * Script to create performance indexes for the database
 * Usage: node scripts/create-indexes.js
 */

import { Pool, neonConfig } from '@neondatabase/serverless';
import { config } from 'dotenv';
import ws from 'ws';

// Load environment variables
config();

// Configure WebSocket for serverless
neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function createIndexes() {
  const indexes = [
    {
      name: 'idx_posts_published_created',
      sql: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_published_created ON posts (is_published, created_at DESC)',
      description: 'Optimize published posts by creation date'
    },
    {
      name: 'idx_posts_category_published',
      sql: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_category_published ON posts (category, is_published)',
      description: 'Optimize posts by category and published status'
    },
    {
      name: 'idx_posts_author_published',
      sql: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_author_published ON posts (author_id, is_published)',
      description: 'Optimize posts by author and published status'
    },
    {
      name: 'idx_posts_slug',
      sql: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_slug ON posts (slug)',
      description: 'Optimize post lookups by slug'
    },
    {
      name: 'idx_posts_views',
      sql: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_views ON posts (views DESC)',
      description: 'Optimize popular posts queries'
    },
    {
      name: 'idx_comments_post_approved',
      sql: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_comments_post_approved ON comments (post_id, is_approved)',
      description: 'Optimize comments by post and approval status'
    },
    {
      name: 'idx_comments_author',
      sql: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_comments_author ON comments (author_id)',
      description: 'Optimize comments by author'
    },
    {
      name: 'idx_analytics_event_created',
      sql: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analytics_event_created ON analytics (event, created_at)',
      description: 'Optimize analytics queries by event and date'
    },
    {
      name: 'idx_analytics_entity',
      sql: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analytics_entity ON analytics (entity_type, entity_id)',
      description: 'Optimize analytics queries by entity'
    },
    {
      name: 'idx_users_email',
      sql: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users (email)',
      description: 'Optimize user lookups by email'
    },
    {
      name: 'idx_newsletter_active',
      sql: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_newsletter_active ON newsletter_subscriptions (is_active)',
      description: 'Optimize active newsletter subscriptions'
    },
    {
      name: 'idx_tags_slug',
      sql: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tags_slug ON tags (slug)',
      description: 'Optimize tag lookups by slug'
    }
  ];

  console.log('Creating performance indexes...\n');

  let successCount = 0;
  let failCount = 0;

  for (const index of indexes) {
    try {
      console.log(`Creating ${index.name}...`);
      await pool.query(index.sql);
      console.log(`✅ ${index.name}: ${index.description}`);
      successCount++;
    } catch (error) {
      console.log(`❌ ${index.name}: ${error.message}`);
      failCount++;
    }
  }

  console.log(`\n📊 Results: ${successCount} successful, ${failCount} failed`);
  
  if (successCount > 0) {
    console.log('\n🚀 Database performance has been optimized!');
  }
}

createIndexes()
  .catch(console.error)
  .finally(() => pool.end());