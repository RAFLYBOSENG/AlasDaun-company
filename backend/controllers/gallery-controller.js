import { getPool } from '../database.js';
import { isAdminRequest } from './auth-controller.js';

const MAX_MEDIA_BYTES = 3 * 1024 * 1024;
const MEDIA_TYPES = {
  'image/jpeg': { type: 'image', matches: (data) => data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff },
  'image/png': { type: 'image', matches: (data) => data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) },
  'image/webp': { type: 'image', matches: (data) => data.toString('ascii', 0, 4) === 'RIFF' && data.toString('ascii', 8, 12) === 'WEBP' },
  'image/gif': { type: 'image', matches: (data) => ['GIF87a', 'GIF89a'].includes(data.toString('ascii', 0, 6)) },
  'video/mp4': { type: 'video', matches: (data) => data.toString('ascii', 4, 8) === 'ftyp' },
  'video/webm': { type: 'video', matches: (data) => data.toString('ascii', 0, 4) === '\x1aE\xdf\xa3' },
  'video/ogg': { type: 'video', matches: (data) => data.toString('ascii', 0, 4) === 'OggS' },
};

function response(status, body) {
  return { status, body, headers: {} };
}

function normalize(row) {
  return {
    id: row.id,
    type: row.mediaType,
    src: row.mediaUrl,
    alt: row.altText,
    sortOrder: row.sortOrder,
    isActive: row.isActive,
  };
}

const fields = `id, media_type AS "mediaType", media_url AS "mediaUrl",
  alt_text AS "altText", sort_order AS "sortOrder", is_active AS "isActive"`;

function validId(id) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

function validate(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return 'Data galeri tidak valid.';
  const type = body.type === 'video' ? 'video' : body.type === 'image' ? 'image' : '';
  const src = typeof body.src === 'string' ? body.src.trim() : '';
  const alt = typeof body.alt === 'string' ? body.alt.trim() : '';
  const sortOrder = body.sortOrder === '' || body.sortOrder === undefined ? 0 : Number(body.sortOrder);
  if (!type) return 'Jenis media harus berupa foto atau video.';
  if (!src || (!src.startsWith('http://') && !src.startsWith('https://') && !src.startsWith('data:'))) {
    return 'Sumber media harus berupa URL http/https atau file yang diunggah.';
  }
  if (!alt || alt.length > 160) return 'Deskripsi galeri wajib diisi (maksimal 160 karakter).';
  if (!Number.isSafeInteger(sortOrder) || sortOrder < 0) return 'Urutan harus berupa bilangan bulat 0 atau lebih.';
  return { type, src, alt, sortOrder, isActive: body.isActive !== false };
}

export async function listGallery() {
  const result = await getPool().query(
    `SELECT ${fields} FROM public.gallery_items
     WHERE is_active = TRUE ORDER BY sort_order, created_at`,
  );
  return response(200, { data: result.rows.map(normalize) });
}

export async function listAdminGallery(request) {
  if (!(await isAdminRequest(request.headers))) return response(401, { error: 'Unauthorized' });
  const result = await getPool().query(
    `SELECT ${fields} FROM public.gallery_items ORDER BY sort_order, created_at`,
  );
  return response(200, { data: result.rows.map(normalize) });
}

export async function uploadGalleryMedia(request, body) {
  if (!(await isAdminRequest(request.headers))) return response(401, { error: 'Unauthorized' });
  const contentType = typeof body.contentType === 'string' ? body.contentType.toLowerCase() : '';
  const mediaType = MEDIA_TYPES[contentType];
  if (!mediaType || typeof body.data !== 'string') {
    return response(400, { error: 'Format harus JPEG, PNG, WebP, GIF, MP4, WebM, atau OGG.' });
  }
  if (body.data.length > Math.ceil(MAX_MEDIA_BYTES * 4 / 3) + 4
    || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(body.data)) {
    return response(400, { error: 'File tidak valid atau ukurannya melebihi 3 MB.' });
  }
  const mediaData = Buffer.from(body.data, 'base64');
  if (mediaData.length === 0 || mediaData.length > MAX_MEDIA_BYTES || !mediaType.matches(mediaData)) {
    return response(400, { error: 'Isi file tidak cocok dengan format atau ukurannya melebihi 3 MB.' });
  }
  return response(201, {
    data: { type: mediaType.type, src: `data:${contentType};base64,${body.data}` },
  });
}

export async function createGallery(request, body) {
  if (!(await isAdminRequest(request.headers))) return response(401, { error: 'Unauthorized' });
  const item = validate(body);
  if (typeof item === 'string') return response(400, { error: item });
  const result = await getPool().query(
    `INSERT INTO public.gallery_items (media_type, media_url, alt_text, sort_order, is_active)
     VALUES ($1, $2, $3, $4, $5) RETURNING ${fields}`,
    [item.type, item.src, item.alt, item.sortOrder, item.isActive],
  );
  return response(201, { data: normalize(result.rows[0]) });
}

export async function updateGallery(request, body, id) {
  if (!(await isAdminRequest(request.headers))) return response(401, { error: 'Unauthorized' });
  if (!validId(id)) return response(400, { error: 'ID galeri tidak valid.' });
  const item = validate(body);
  if (typeof item === 'string') return response(400, { error: item });
  const result = await getPool().query(
    `UPDATE public.gallery_items SET media_type = $2, media_url = $3,
      alt_text = $4, sort_order = $5, is_active = $6
     WHERE id = $1 RETURNING ${fields}`,
    [id, item.type, item.src, item.alt, item.sortOrder, item.isActive],
  );
  if (!result.rows[0]) return response(404, { error: 'Media galeri tidak ditemukan.' });
  return response(200, { data: normalize(result.rows[0]) });
}

export async function deleteGallery(request, id) {
  if (!(await isAdminRequest(request.headers))) return response(401, { error: 'Unauthorized' });
  if (!validId(id)) return response(400, { error: 'ID galeri tidak valid.' });
  const result = await getPool().query('DELETE FROM public.gallery_items WHERE id = $1', [id]);
  if (!result.rowCount) return response(404, { error: 'Media galeri tidak ditemukan.' });
  return response(204, {});
}
