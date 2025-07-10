import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure Neon for WebSocket support
neonConfig.webSocketConstructor = ws;

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL must be set. Please set your database connection string.",
  );
}

// Use Neon serverless driver (works with both Neon cloud and local PostgreSQL via pooling)
export const pool = new Pool({ connectionString: databaseUrl });
export const db = drizzle({ client: pool, schema });