#!/usr/bin/env node

/**
 * Script to make a user an admin
 * Usage: node scripts/make-admin.js <user-email-or-id>
 */

import { Pool, neonConfig } from '@neondatabase/serverless';
import { config } from 'dotenv';
import ws from 'ws';

// Load environment variables
config();

// Configure WebSocket for serverless
neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function makeUserAdmin(emailOrId) {
  try {
    console.log(`Looking for user: ${emailOrId}`);
    
    // First, try to find the user by email or ID
    const findUserQuery = `
      SELECT id, email, first_name, last_name, is_admin 
      FROM users 
      WHERE email = $1 OR id = $1
    `;
    
    const result = await pool.query(findUserQuery, [emailOrId]);
    
    if (result.rows.length === 0) {
      console.error(`User not found: ${emailOrId}`);
      console.log('Available users:');
      
      const allUsersResult = await pool.query('SELECT id, email, first_name, last_name, is_admin FROM users ORDER BY created_at DESC');
      allUsersResult.rows.forEach(user => {
        const adminStatus = user.is_admin ? ' (ADMIN)' : '';
        console.log(`- ${user.email} (ID: ${user.id})${adminStatus}`);
      });
      
      return;
    }
    
    const user = result.rows[0];
    
    if (user.is_admin) {
      console.log(`User ${user.email} is already an admin!`);
      return;
    }
    
    // Make the user an admin
    const updateQuery = `
      UPDATE users 
      SET is_admin = true, updated_at = NOW() 
      WHERE id = $1
    `;
    
    await pool.query(updateQuery, [user.id]);
    
    console.log(`✅ Success! ${user.email} (${user.first_name} ${user.last_name}) is now an admin.`);
    console.log(`They can now access the admin dashboard at /admin`);
    
  } catch (error) {
    console.error('Error making user admin:', error);
  } finally {
    await pool.end();
  }
}

// Get command line argument
const userInput = process.argv[2];

if (!userInput) {
  console.error('Usage: node scripts/make-admin.js <user-email-or-id>');
  console.log('Example: node scripts/make-admin.js user@example.com');
  process.exit(1);
}

makeUserAdmin(userInput);