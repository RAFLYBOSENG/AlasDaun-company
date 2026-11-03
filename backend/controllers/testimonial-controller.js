import { getPool } from '../database.js';
import { isAdminRequest } from './auth-controller.js';

function response(status, body) {
  return { status, body, headers: {} };
}

function normalize(row) {
  return {
    id: row.id,
    name: row.name,
    rating: row.rating,
    textId: row.reviewText,
    status: row.status,
    createdAt: row.createdAt,
  };
}

const fields = `id, name, rating, review_text AS "reviewText",
  status, created_at AS "createdAt"`;

function validateReview(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return 'Data ulasan tidak valid.';
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const text = typeof body.text === 'string' ? body.text.trim() : '';
  const rating = Number(body.rating);
  if (name.length < 2 || name.length > 80) return 'Nama harus 2 sampai 80 karakter.';
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return 'Rating harus 1 sampai 5.';
  if (text.length < 10 || text.length > 1000) return 'Ulasan harus 10 sampai 1000 karakter.';
  return { name, text, rating };
}

async function findBlockedKeyword(text) {
  const result = await getPool().query(
    'SELECT keyword FROM public.testimonial_blocked_keywords ORDER BY char_length(keyword) DESC',
  );
  const normalized = text.toLocaleLowerCase('id-ID');
  return result.rows.find(({ keyword }) => normalized.includes(keyword.toLocaleLowerCase('id-ID')))?.keyword || null;
}

export async function listPublicTestimonials() {
  const result = await getPool().query(
    `SELECT ${fields} FROM public.testimonials
     WHERE status = 'approved' ORDER BY created_at DESC`,
  );
  return response(200, { data: result.rows.map(normalize) });
}

export async function createTestimonial(body) {
  const item = validateReview(body);
  if (typeof item === 'string') return response(400, { error: item });
  const blockedKeyword = await findBlockedKeyword(`${item.name} ${item.text}`);
  if (blockedKeyword) {
    return response(400, { error: 'Ulasan mengandung kata yang tidak diperbolehkan.' });
  }
  const result = await getPool().query(
    `INSERT INTO public.testimonials (name, rating, review_text)
     VALUES ($1, $2, $3) RETURNING ${fields}`,
    [item.name, item.rating, item.text],
  );
  return response(201, {
    data: normalize(result.rows[0]),
    message: 'Ulasan diterima dan menunggu persetujuan admin.',
  });
}

export async function listAdminTestimonials(request) {
  if (!(await isAdminRequest(request.headers))) return response(401, { error: 'Unauthorized' });
  const result = await getPool().query(`SELECT ${fields} FROM public.testimonials ORDER BY created_at DESC`);
  return response(200, { data: result.rows.map(normalize) });
}

export async function updateTestimonial(request, body, id) {
  if (!(await isAdminRequest(request.headers))) return response(401, { error: 'Unauthorized' });
  if (!/^[0-9a-f-]{36}$/i.test(id)) return response(400, { error: 'ID ulasan tidak valid.' });
  const status = ['pending', 'approved', 'rejected'].includes(body?.status) ? body.status : '';
  if (!status) return response(400, { error: 'Status ulasan tidak valid.' });
  if (status === 'approved') {
    const result = await getPool().query('SELECT name, review_text FROM public.testimonials WHERE id = $1', [id]);
    if (!result.rows[0]) return response(404, { error: 'Ulasan tidak ditemukan.' });
    const blockedKeyword = await findBlockedKeyword(`${result.rows[0].name} ${result.rows[0].review_text}`);
    if (blockedKeyword) return response(400, { error: 'Ulasan mengandung keyword terlarang dan tidak dapat ditampilkan.' });
  }
  const result = await getPool().query(
    `UPDATE public.testimonials SET status = $2 WHERE id = $1 RETURNING ${fields}`,
    [id, status],
  );
  if (!result.rows[0]) return response(404, { error: 'Ulasan tidak ditemukan.' });
  return response(200, { data: normalize(result.rows[0]) });
}

export async function deleteTestimonial(request, id) {
  if (!(await isAdminRequest(request.headers))) return response(401, { error: 'Unauthorized' });
  if (!/^[0-9a-f-]{36}$/i.test(id)) return response(400, { error: 'ID ulasan tidak valid.' });
  const result = await getPool().query('DELETE FROM public.testimonials WHERE id = $1', [id]);
  if (!result.rowCount) return response(404, { error: 'Ulasan tidak ditemukan.' });
  return response(204, {});
}

export async function listBlockedKeywords(request) {
  if (!(await isAdminRequest(request.headers))) return response(401, { error: 'Unauthorized' });
  const result = await getPool().query(
    'SELECT id, keyword, created_at AS "createdAt" FROM public.testimonial_blocked_keywords ORDER BY keyword',
  );
  return response(200, { data: result.rows });
}

export async function createBlockedKeyword(request, body) {
  if (!(await isAdminRequest(request.headers))) return response(401, { error: 'Unauthorized' });
  const keyword = typeof body?.keyword === 'string' ? body.keyword.trim().toLocaleLowerCase('id-ID') : '';
  if (keyword.length < 2 || keyword.length > 80) return response(400, { error: 'Keyword harus 2 sampai 80 karakter.' });
  const result = await getPool().query(
    `INSERT INTO public.testimonial_blocked_keywords (keyword) VALUES ($1)
     ON CONFLICT (lower(keyword)) DO NOTHING
     RETURNING id, keyword, created_at AS "createdAt"`,
    [keyword],
  );
  if (!result.rows[0]) return response(409, { error: 'Keyword sudah terdaftar.' });
  return response(201, { data: result.rows[0] });
}

export async function deleteBlockedKeyword(request, id) {
  if (!(await isAdminRequest(request.headers))) return response(401, { error: 'Unauthorized' });
  if (!/^[0-9a-f-]{36}$/i.test(id)) return response(400, { error: 'ID keyword tidak valid.' });
  const result = await getPool().query('DELETE FROM public.testimonial_blocked_keywords WHERE id = $1', [id]);
  if (!result.rowCount) return response(404, { error: 'Keyword tidak ditemukan.' });
  return response(204, {});
}
