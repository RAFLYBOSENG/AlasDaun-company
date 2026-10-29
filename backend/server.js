import { createServer } from 'node:http';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { config } from 'dotenv';
import pg from 'pg';

config();

const { Pool } = pg;
const port = Number(process.env.PORT || 3001);
const frontendOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;
const sessionSecret = process.env.SESSION_SECRET;

if (!process.env.DATABASE_URL || !adminEmail || !adminPassword || !sessionSecret) {
  throw new Error('DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD, and SESSION_SECRET are required');
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 10 });

function sendJson(response, status, body) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': frontendOrigin,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    Vary: 'Origin',
  });
  response.end(JSON.stringify(body));
}

function createToken() {
  const payload = Buffer.from(JSON.stringify({ email: adminEmail, exp: Date.now() + 8 * 60 * 60 * 1000 })).toString('base64url');
  const signature = createHmac('sha256', sessionSecret).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

function isValidToken(request) {
  const value = request.headers.authorization;
  if (!value?.startsWith('Bearer ')) return false;
  const [payload, signature] = value.slice(7).split('.');
  if (!payload || !signature) return false;
  const expected = createHmac('sha256', sessionSecret).update(payload).digest();
  const received = Buffer.from(signature, 'base64url');
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return false;
  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString()).exp > Date.now();
  } catch {
    return false;
  }
}

async function readJson(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString() || '{}');
}

const server = createServer(async (request, response) => {
  if (request.method === 'OPTIONS') return sendJson(response, 204, {});

  try {
    if (request.method === 'POST' && request.url === '/api/auth/login') {
      const body = await readJson(request);
      if (body.email !== adminEmail || body.password !== adminPassword) {
        return sendJson(response, 401, { error: 'Email atau password salah' });
      }
      return sendJson(response, 200, { token: createToken() });
    }

    if (request.method === 'GET' && request.url === '/api/auth/session') {
      return sendJson(response, isValidToken(request) ? 200 : 401, { authenticated: isValidToken(request) });
    }

    if (request.method === 'GET' && request.url === '/api/health/db') {
      const result = await pool.query('SELECT current_database() AS database, now() AS server_time');
      return sendJson(response, 200, { connected: true, ...result.rows[0] });
    }

    if (request.method === 'POST' && request.url === '/api/reservations') {
      const body = await readJson(request);
      const result = await pool.query(
        `INSERT INTO reservations (name, phone, date, time, guests, area, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, name, phone, date, time, guests, area, notes, status, created_at`,
        [body.name, body.phone, body.date, body.time, body.guests, body.area || null, body.notes || null],
      );
      return sendJson(response, 201, { data: result.rows[0] });
    }

    if (request.method === 'GET' && request.url === '/api/reservations') {
      if (!isValidToken(request)) return sendJson(response, 401, { error: 'Unauthorized' });
      const result = await pool.query(
        `SELECT id, name, phone, date, time, guests, area, notes, status, created_at
         FROM reservations ORDER BY created_at DESC`,
      );
      return sendJson(response, 200, { data: result.rows });
    }

    return sendJson(response, 404, { error: 'Not found' });
  } catch (error) {
    console.error(error);
    return sendJson(response, 500, { error: 'Terjadi kesalahan pada server' });
  }
});

server.listen(port, () => {
  console.log(`Alas Daun API listening on http://localhost:${port}`);
});
