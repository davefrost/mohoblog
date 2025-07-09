/* File: server/utils/db.ts */
import knex from 'knex';
import config from '../knexfile';

const db = knex(config.development);
export default db;

/* File: server/knexfile.ts */
import type { Knex } from 'knex';
import dotenv from 'dotenv';
dotenv.config();

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: './migrations',
    },
    seeds: {
      directory: './seeds',
    },
  },
};

export default config;
