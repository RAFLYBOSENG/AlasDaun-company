import { config } from 'dotenv';
import { dispatchApiRoute } from './routes/api-routes.js';

config();

const MAX_JSON_BODY_BYTES = 4.25 * 1024 * 1024;

function getBody(request) {
  if (request.body === undefined || request.body === null) return {};
  const serialized = typeof request.body === 'string'
    ? request.body
    : JSON.stringify(request.body);
  if (Buffer.byteLength(serialized) > MAX_JSON_BODY_BYTES) {
    const error = new Error('Ukuran request terlalu besar.');
    error.statusCode = 413;
    throw error;
  }
  return typeof request.body === 'string' ? JSON.parse(request.body || '{}') : request.body;
}

export default async function handler(request, response) {
  if (request.method === 'OPTIONS') {
    response.status(204).end();
    return;
  }

  try {
    const url = new URL(request.url, `https://${request.headers.host || 'localhost'}`);
    const result = await dispatchApiRoute(request, url.pathname, getBody(request));
    if (!result) {
      response.status(404).json({ error: 'Not found' });
      return;
    }

    for (const [name, value] of Object.entries(result.headers || {})) {
      response.setHeader(name, value);
    }
    response.status(result.status).json(result.body);
  } catch (error) {
    console.error(error);
    response.status(error.statusCode || 500).json({
      error: error.statusCode === 413 ? error.message : 'Terjadi kesalahan pada server',
    });
  }
}
