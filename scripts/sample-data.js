#!/usr/bin/env node

/**
 * Script to create sample blog data
 * Usage: node scripts/sample-data.js
 */

import { Pool, neonConfig } from '@neondatabase/serverless';
import { config } from 'dotenv';
import ws from 'ws';

// Load environment variables
config();

// Configure WebSocket for serverless
neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const samplePosts = [
  {
    title: "Our First Cross-Country Adventure",
    slug: "our-first-cross-country-adventure",
    category: "adventures",
    excerpt: "Starting our journey from California to Maine, we never expected the amazing experiences that awaited us.",
    content: `<h2>The Beginning of Something Amazing</h2>
<p>When we first decided to hit the road in our motorhome, we had no idea what we were getting ourselves into. What started as a simple vacation turned into the adventure of a lifetime.</p>

<h3>The Route</h3>
<p>We planned a route that would take us through some of America's most beautiful landscapes:</p>
<ul>
<li>California's stunning coastline</li>
<li>The majestic Rocky Mountains</li>
<li>The vast plains of the Midwest</li>
<li>New England's charming small towns</li>
</ul>

<h3>What We Learned</h3>
<p>The road taught us valuable lessons about flexibility, adventure, and the kindness of strangers. Every day brought new challenges and new rewards.</p>

<p>Stay tuned for more stories from our incredible journey!</p>`
  },
  {
    title: "Dealing with Engine Trouble in Colorado",
    slug: "dealing-with-engine-trouble-colorado",
    category: "mechanical",
    excerpt: "Nothing prepares you for your engine overheating in the middle of the Rocky Mountains. Here's how we handled it.",
    content: `<h2>When Things Go Wrong</h2>
<p>It was a beautiful sunny morning when we started climbing through the Colorado Rockies. The views were breathtaking, but our engine temperature gauge had other plans.</p>

<h3>The Problem</h3>
<p>About halfway up a particularly steep grade, our temperature gauge started climbing into the red zone. We knew we had to act fast to prevent serious damage.</p>

<h3>The Solution</h3>
<p>Here's what we did to get back on the road:</p>
<ol>
<li>Pulled over safely at the first opportunity</li>
<li>Let the engine cool down completely</li>
<li>Checked coolant levels and radiator</li>
<li>Found a local RV mechanic in the nearby town</li>
</ol>

<h3>Lessons Learned</h3>
<p>Always carry extra coolant and know the signs of overheating. Mountain driving puts extra stress on your engine, so take breaks and watch your gauges!</p>`
  },
  {
    title: "Max's Adventures at Yellowstone",
    slug: "max-adventures-yellowstone",
    category: "dog",
    excerpt: "Our four-legged travel companion had the time of his life exploring Yellowstone National Park with us.",
    content: `<h2>A Dog's Paradise</h2>
<p>If you've ever wondered what paradise looks like to a dog, just watch Max experience Yellowstone National Park. From the moment we arrived, his tail hasn't stopped wagging.</p>

<h3>Pet-Friendly Trails</h3>
<p>While dogs aren't allowed on most trails in Yellowstone, there are still plenty of places for them to explore:</p>
<ul>
<li>Paved trails around the geyser basins</li>
<li>Campground areas for morning walks</li>
<li>Lakeshores for a refreshing drink</li>
<li>Parking areas with amazing views</li>
</ul>

<h3>Wildlife Encounters</h3>
<p>Max was fascinated by the local wildlife (from a safe distance, of course). His ears perked up every time we spotted:</p>
<ul>
<li>Bison grazing in the distance</li>
<li>Eagles soaring overhead</li>
<li>Ground squirrels darting around</li>
</ul>

<h3>Travel Tips for Dogs</h3>
<p>Traveling with a dog in Yellowstone requires some planning:</p>
<ul>
<li>Always keep your dog on a leash</li>
<li>Bring plenty of water</li>
<li>Check park regulations before visiting</li>
<li>Have a backup plan for hot days</li>
</ul>

<p>Max's favorite spot? The geyser viewing areas where he could people-watch to his heart's content!</p>`
  }
];

async function createSampleData() {
  try {
    console.log('Creating sample blog posts...\n');

    // First, find an admin user to be the author
    const adminQuery = 'SELECT id, email FROM users WHERE is_admin = true LIMIT 1';
    const adminResult = await pool.query(adminQuery);
    
    if (adminResult.rows.length === 0) {
      console.error('No admin user found. Please create an admin user first using make-admin.js');
      return;
    }

    const authorId = adminResult.rows[0].id;
    console.log(`Using admin user ${adminResult.rows[0].email} as author\n`);

    let createdCount = 0;

    for (const post of samplePosts) {
      try {
        // Check if post already exists
        const existingPost = await pool.query('SELECT id FROM posts WHERE slug = $1', [post.slug]);
        
        if (existingPost.rows.length > 0) {
          console.log(`⏭️  Post "${post.title}" already exists, skipping...`);
          continue;
        }

        // Create the post
        const insertQuery = `
          INSERT INTO posts (title, slug, category, excerpt, content, author_id, is_published, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, true, NOW(), NOW())
          RETURNING id
        `;
        
        const result = await pool.query(insertQuery, [
          post.title,
          post.slug,
          post.category,
          post.excerpt,
          post.content,
          authorId
        ]);

        console.log(`✅ Created post: "${post.title}" (ID: ${result.rows[0].id})`);
        createdCount++;

      } catch (error) {
        console.error(`❌ Failed to create post "${post.title}": ${error.message}`);
      }
    }

    console.log(`\n📊 Created ${createdCount} sample posts`);

    if (createdCount > 0) {
      console.log('\n🎉 Sample data created successfully!');
      console.log('Your blog now has some content to showcase the features.');
    }

  } catch (error) {
    console.error('Error creating sample data:', error);
  } finally {
    await pool.end();
  }
}

createSampleData();