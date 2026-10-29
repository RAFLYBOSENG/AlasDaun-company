import { createHmac, timingSafeEqual } from 'node:crypto';
import pg from 'pg';

const { Pool } = pg;
let pool;

function getPool() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured');
  pool ||= new Pool({ connectionString: process.env.DATABASE_URL, max: 5 });
  return pool;
}

function json(response, status, body) {
  response.status(status).setHeader('Cache-Control', 'no-store').json(body);
}

function createToken() {
  const payload = Buffer.from(JSON.stringify({
    email: process.env.ADMIN_EMAIL,
    exp: Date.now() + 8 * 60 * 60 * 1000,
  })).toString('base64url');
  const signature = createHmac('sha256', process.env.SESSION_SECRET).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

function isValidToken(request) {
  const value = request.headers.authorization;
  if (!value?.startsWith('Bearer ')) return false;
  const [payload, signature] = value.slice(7).split('.');
  if (!payload || !signature || !process.env.SESSION_SECRET) return false;
  const expected = createHmac('sha256', process.env.SESSION_SECRET).update(payload).digest();
  const received = Buffer.from(signature, 'base64url');
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return false;
  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString()).exp > Date.now();
  } catch {
    return false;
  }
}

export default async function handler(request, response) {
  const path = `/api/${Array.isArray(request.query.path) ? request.query.path.join('/') : request.query.path || ''}`;

  try {
    if (request.method === 'POST' && path === '/api/auth/login') {
      if (request.body?.email !== process.env.ADMIN_EMAIL || request.body?.password !== process.env.ADMIN_PASSWORD) {
        return json(response, 401, { error: 'Email atau password salah' });
      }
      return json(response, 200, { token: createToken() });
    }

    if (request.method === 'GET' && path === '/api/auth/session') {
      const authenticated = isValidToken(request);
      return json(response, authenticated ? 200 : 401, { authenticated });
    }

    if (request.method === 'GET' && path === '/api/health/db') {
      const result = await getPool().query('SELECT current_database() AS database, now() AS server_time');
      return json(response, 200, { connected: true, ...result.rows[0] });
    }

    if (request.method === 'POST' && path === '/api/reservations') {
      const body = request.body || {};
      const result = await getPool().query(
        `INSERT INTO reservations (name, phone, date, time, guests, area, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, name, phone, date, time, guests, area, notes, status, created_at`,
        [body.name, body.phone, body.date, body.time, body.guests, body.area || null, body.notes || null],
      );
      return json(response, 201, { data: result.rows[0] });
    }

    if (request.method === 'GET' && path === '/api/reservations') {
      if (!isValidToken(request)) return json(response, 401, { error: 'Unauthorized' });
      const result = await getPool().query(
        `SELECT id, name, phone, date, time, guests, area, notes, status, created_at
         FROM reservations ORDER BY created_at DESC`,
      );
      return json(response, 200, { data: result.rows });
    }

    return json(response, 404, { error: 'Not found' });
  } catch (error) {
    console.error(error);
    return json(response, 500, { error: 'Terjadi kesalahan pada server' });
  }
}
