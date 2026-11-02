import { config } from 'dotenv';
import pg from 'pg';
import { newPasswordHash } from '../controllers/auth-controller.js';

config();

const { Client } = pg;
const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;

if (!process.env.DATABASE_URL || !email || email.length > 254 || !password) {
  throw new Error('DATABASE_URL, ADMIN_EMAIL, and ADMIN_PASSWORD are required.');
}

const client = new Client({ connectionString: process.env.DATABASE_URL });
let connected = false;

try {
  const passwordHash = newPasswordHash(password);
  await client.connect();
  connected = true;
  await client.query(
    `INSERT INTO public.admins (email, password_hash) VALUES ($1, $2)
     ON CONFLICT (lower(email)) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
    [email, passwordHash],
  );
  console.log(`Admin account ${email} is ready.`);
} finally {
  if (connected) await client.end();
}
