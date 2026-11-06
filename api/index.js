import express from 'express';
import { config } from 'dotenv';
import { dispatchApiRoute } from '../backend/routes/api-routes.js';

config({ path: ['backend/.env', '.env'] });

const app = express();
const frontendOrigin = process.env.FRONTEND_ORIGIN || '*';

app.use(express.json({ limit: '4.25mb' }));
app.use((request, response, next) => {
  response.setHeader('Access-Control-Allow-Origin', frontendOrigin);
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.setHeader('Vary', 'Origin');

  if (request.method === 'OPTIONS') {
    response.status(204).end();
    return;
  }
  next();
});

app.use(async (request, response, next) => {
  try {
    const url = new URL(request.originalUrl, `https://${request.headers.host || 'localhost'}`);
    const result = await dispatchApiRoute(request, url.pathname, request.body || {});

    if (!result) {
      response.status(404).json({ error: 'Not found' });
      return;
    }

    for (const [name, value] of Object.entries(result.headers || {})) {
      response.setHeader(name, value);
    }
    response.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
});

app.use((error, request, response, next) => {
  if (error.type === 'entity.too.large') {
    response.status(413).json({ error: 'Ukuran request terlalu besar.' });
    return;
  }

  console.error(error);
  response.status(error.statusCode || 500).json({
    error: error.statusCode === 413 ? error.message : 'Terjadi kesalahan pada server',
  });
});

export default app;
