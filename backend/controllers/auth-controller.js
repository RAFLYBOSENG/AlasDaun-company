import {
  createHmac,
  randomBytes,
  scrypt as scryptCallback,
  scryptSync,
  timingSafeEqual,
} from 'node:crypto';
import { promisify } from 'node:util';
import { getPool } from '../database.js';

const scrypt = promisify(scryptCallback);
const SESSION_COOKIE = 'alasdaun_session';
const CSRF_COOKIE = 'alasdaun_csrf';
const SESSION_MAX_AGE = 8 * 60 * 60;
const loginAttempts = new Map();

function response(status, body, headers = {}) {
  return { status, body, headers };
}

function sessionSecret() {
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
    throw new Error('SESSION_SECRET must contain at least 32 characters');
  }
  return process.env.SESSION_SECRET;
}

function cookieOptions(maxAge) {
  const secure = process.env.NODE_ENV === 'production' || process.env.VERCEL ? '; Secure' : '';
  return `${SESSION_COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}${secure}`;
}

function sessionCookie(value, maxAge) {
  const secure = process.env.NODE_ENV === 'production' || process.env.VERCEL ? '; Secure' : '';
  return `${SESSION_COOKIE}=${value}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}${secure}`;
}

function csrfCookie(value, maxAge) {
  const secure = process.env.NODE_ENV === 'production' || process.env.VERCEL ? '; Secure' : '';
  return `${CSRF_COOKIE}=${value}; SameSite=Lax; Path=/; Max-Age=${maxAge}${secure}`;
}

function createSession(adminId) {
  const csrfToken = randomBytes(32).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    adminId,
    csrfToken,
    exp: Date.now() + SESSION_MAX_AGE * 1000,
  })).toString('base64url');
  const signature = createHmac('sha256', sessionSecret()).update(payload).digest('base64url');
  return { token: `${payload}.${signature}`, csrfToken };
}

function getSessionToken(headers) {
  const cookies = headers.cookie?.split(';') ?? [];
  const session = cookies.find((cookie) => cookie.trim().startsWith(`${SESSION_COOKIE}=`));
  return session?.trim().slice(SESSION_COOKIE.length + 1);
}

function verifySession(token) {
  if (!token) return null;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;
  const expected = createHmac('sha256', sessionSecret()).update(payload).digest();
  const received = Buffer.from(signature, 'base64url');
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (data.exp <= Date.now()
      || typeof data.adminId !== 'string'
      || typeof data.csrfToken !== 'string') return null;
    return { adminId: data.adminId, csrfToken: data.csrfToken };
  } catch {
    return null;
  }
}

function getCookie(headers, name) {
  return headers.cookie?.split(';')
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${name}=`) )
    ?.slice(name.length + 1);
}

function pruneLoginAttempts() {
  const now = Date.now();
  for (const [key, attempt] of loginAttempts) {
    if (attempt.resetAt <= now) loginAttempts.delete(key);
  }
}

function loginKey(request, email) {
  const forwarded = request.headers['x-forwarded-for'];
  const ip = typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : 'local';
  return `${ip}:${email}`;
}

async function verifyPassword(password, storedHash) {
  const [algorithm, salt, hash] = storedHash.split('$');
  if (algorithm !== 'scrypt' || !salt || !hash) return false;
  const expected = Buffer.from(hash, 'base64url');
  const actual = await scrypt(password, Buffer.from(salt, 'base64url'), expected.length);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export async function isAdminRequest(headers) {
  const session = verifySession(getSessionToken(headers));
  if (!session) return false;
  const adminId = session.adminId;
  const result = await getPool().query('SELECT 1 FROM public.admins WHERE id = $1', [adminId]);
  return result.rowCount > 0;
}

export function validateAdminMutation(headers) {
  const session = verifySession(getSessionToken(headers));
  if (!session?.csrfToken) return false;
  const csrfHeader = headers['x-csrf-token'];
  const csrfCookie = getCookie(headers, CSRF_COOKIE);
  return csrfHeader === session.csrfToken && csrfCookie === session.csrfToken;
}

export async function login(request, body) {
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  if (!email || !password || email.length > 254 || password.length > 256) {
    return response(400, { error: 'Email dan password wajib diisi.' });
  }

  pruneLoginAttempts();
  const key = loginKey(request, email);
  const failed = loginAttempts.get(key);
  if (failed && failed.count >= 5 && failed.resetAt > Date.now()) {
    return response(429, { error: 'Terlalu banyak percobaan login. Coba lagi 15 menit kemudian.' });
  }

  const result = await getPool().query(
    'SELECT id, email, password_hash FROM public.admins WHERE lower(email) = $1',
    [email],
  );
  const admin = result.rows[0];
  if (!admin || !(await verifyPassword(password, admin.password_hash))) {
    const now = Date.now();
    const attempt = loginAttempts.get(key);
    loginAttempts.set(key, {
      count: (attempt?.resetAt > now ? attempt.count : 0) + 1,
      resetAt: attempt?.resetAt > now ? attempt.resetAt : now + 15 * 60 * 1000,
    });
    return response(401, { error: 'Email atau password salah.' });
  }

  loginAttempts.delete(key);
  const session = createSession(admin.id);
  return response(200, { authenticated: true, email: admin.email, csrfToken: session.csrfToken }, {
    'Set-Cookie': [
      sessionCookie(session.token, SESSION_MAX_AGE),
      csrfCookie(session.csrfToken, SESSION_MAX_AGE),
    ],
  });
}

export function logout() {
  return response(200, { authenticated: false }, {
    'Set-Cookie': [
      cookieOptions(0),
      `${CSRF_COOKIE}=; SameSite=Lax; Path=/; Max-Age=0`,
    ],
  });
}

export async function getSession(request) {
  const session = verifySession(getSessionToken(request.headers));
  if (!session) {
    return response(200, { authenticated: false }, { 'Set-Cookie': cookieOptions(0) });
  }
  const result = await getPool().query('SELECT email FROM public.admins WHERE id = $1', [session.adminId]);
  if (!result.rows[0]) {
    return response(200, { authenticated: false }, { 'Set-Cookie': cookieOptions(0) });
  }
  return response(200, {
    authenticated: true,
    email: result.rows[0].email,
    csrfToken: session.csrfToken,
  });
}

export function newPasswordHash(password) {
  if (typeof password !== 'string' || password.length < 12 || password.length > 256) {
    throw new Error('Password admin harus memiliki panjang 12 sampai 256 karakter.');
  }
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return `scrypt$${salt.toString('base64url')}$${hash.toString('base64url')}`;
}
