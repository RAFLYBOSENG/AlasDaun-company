import pg from 'pg';

const { Pool } = pg;
let pool;

export function getPool() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured');
  pool ||= new Pool({ connectionString: process.env.DATABASE_URL, max: 10 });
  return pool;
}
