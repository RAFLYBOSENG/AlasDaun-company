import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getPool } from '../database.js';
import { isAdminRequest } from './auth-controller.js';

const MAX_MENU_IMAGE_BYTES = 3 * 1024 * 1024;
const MENU_IMAGE_DIRECTORY = fileURLToPath(
  new URL('../../frontend/public/asset/images/menu/', import.meta.url),
);
const IMAGE_TYPES = {
  'image/jpeg': { extension: 'jpg', matches: (data) => data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff },
  'image/png': { extension: 'png', matches: (data) => data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) },
  'image/webp': { extension: 'webp', matches: (data) => data.toString('ascii', 0, 4) === 'RIFF' && data.toString('ascii', 8, 12) === 'WEBP' },
  'image/gif': { extension: 'gif', matches: (data) => ['GIF87a', 'GIF89a'].includes(data.toString('ascii', 0, 6)) },
};

function response(status, body, headers = {}) {
  return { status, body, headers };
}

function normalizeMenuItem(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    price: row.price,
    descriptionId: row.descriptionId,
    descriptionEn: row.descriptionEn,
    image: row.image,
    isBestSeller: row.isBestSeller,
    isNew: row.isNew,
    promo: row.promo,
    sortOrder: row.sortOrder,
  };
}

const menuFields = `id, name, category, price, description_id AS "descriptionId",
  description_en AS "descriptionEn", image_url AS image,
  is_best_seller AS "isBestSeller", is_new AS "isNew", promo,
  sort_order AS "sortOrder"`;

function validateMenuItem(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return 'Data menu tidak valid.';
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const category = typeof body.category === 'string' ? body.category.trim().toLowerCase() : '';
  const descriptionId = typeof body.descriptionId === 'string' ? body.descriptionId.trim() : '';
  const descriptionEn = typeof body.descriptionEn === 'string' ? body.descriptionEn.trim() : '';
  const image = typeof body.image === 'string' ? body.image.trim() : '';
  const price = Number(body.price);
  const promo = body.promo === '' || body.promo === null || body.promo === undefined
    ? null
    : Number(body.promo);

  if (!name || name.length > 120) return 'Nama menu wajib diisi (maksimal 120 karakter).';
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(category) || category.length > 60) {
    return 'Kategori harus berupa slug, misalnya paket-makanan.';
  }
  if (!Number.isSafeInteger(price) || price < 1) return 'Harga harus berupa bilangan bulat lebih dari 0.';
  if (!descriptionId || descriptionId.length > 1000) return 'Deskripsi Bahasa Indonesia wajib diisi (maksimal 1000 karakter).';
  if (!descriptionEn || descriptionEn.length > 1000) return 'Deskripsi Bahasa Inggris wajib diisi (maksimal 1000 karakter).';
  const isUploadedImage = /^\/asset\/images\/menu\/[0-9a-f-]+\.(?:jpg|png|webp|gif)$/i.test(image);
  if (!isUploadedImage) {
    try {
      const imageUrl = new URL(image);
      if (!['http:', 'https:'].includes(imageUrl.protocol)) throw new Error('invalid protocol');
    } catch {
      return 'Pilih file gambar atau gunakan URL gambar http/https yang valid.';
    }
  }
  if (promo !== null && (!Number.isInteger(promo) || promo < 1 || promo > 99)) {
    return 'Promo harus berupa persentase bilangan bulat dari 1 sampai 99.';
  }
  if (typeof body.isBestSeller !== 'boolean' || typeof body.isNew !== 'boolean') {
    return 'Status best seller dan menu baru harus berupa boolean.';
  }
  if (body.isActive !== undefined && typeof body.isActive !== 'boolean') {
    return 'Status tampil harus berupa boolean.';
  }
  const sortOrder = body.sortOrder === '' || body.sortOrder === null || body.sortOrder === undefined
    ? 0
    : Number(body.sortOrder);
  if (!Number.isSafeInteger(sortOrder) || sortOrder < 0) return 'Urutan harus berupa bilangan bulat 0 atau lebih.';

  return {
    name,
    category,
    price,
    descriptionId,
    descriptionEn,
    image,
    isBestSeller: body.isBestSeller,
    isNew: body.isNew,
    promo,
    sortOrder,
  };
}

export async function listMenu() {
  const result = await getPool().query(
    `SELECT ${menuFields} FROM public.menu_items
     WHERE is_active = TRUE ORDER BY sort_order, name`,
  );
  return response(200, { data: result.rows.map(normalizeMenuItem) });
}

export async function uploadMenuImage(request, body) {
  if (!(await isAdminRequest(request.headers))) return response(401, { error: 'Unauthorized' });

  const contentType = typeof body.contentType === 'string' ? body.contentType.toLowerCase() : '';
  const imageType = IMAGE_TYPES[contentType];
  if (!imageType || typeof body.data !== 'string') {
    return response(400, { error: 'Format gambar harus JPEG, PNG, WebP, atau GIF.' });
  }
  if (body.data.length > Math.ceil(MAX_MENU_IMAGE_BYTES * 4 / 3) + 4
    || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(body.data)) {
    return response(400, { error: 'Data gambar tidak valid atau ukurannya terlalu besar.' });
  }

  const imageData = Buffer.from(body.data, 'base64');
  if (imageData.length === 0 || imageData.length > MAX_MENU_IMAGE_BYTES || !imageType.matches(imageData)) {
    return response(400, { error: 'Isi file tidak cocok dengan format gambar atau ukurannya melebihi 3 MB.' });
  }

  await mkdir(MENU_IMAGE_DIRECTORY, { recursive: true });
  const filename = `${randomUUID()}.${imageType.extension}`;
  await writeFile(join(MENU_IMAGE_DIRECTORY, filename), imageData, { flag: 'wx' });
  return response(201, { data: { image: `/asset/images/menu/${filename}` } });
}

export async function listAdminMenu(request) {
  if (!(await isAdminRequest(request.headers))) return response(401, { error: 'Unauthorized' });
  const result = await getPool().query(
    `SELECT ${menuFields}, is_active AS "isActive" FROM public.menu_items
     ORDER BY sort_order, name`,
  );
  return response(200, { data: result.rows.map((row) => ({
    ...normalizeMenuItem(row),
    isActive: row.isActive,
  })) });
}

export async function createMenu(request, body) {
  if (!(await isAdminRequest(request.headers))) return response(401, { error: 'Unauthorized' });
  const item = validateMenuItem(body);
  if (typeof item === 'string') return response(400, { error: item });
  const result = await getPool().query(
    `INSERT INTO public.menu_items
      (name, category, price, description_id, description_en, image_url,
       is_best_seller, is_new, promo, sort_order)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING ${menuFields}`,
    [item.name, item.category, item.price, item.descriptionId, item.descriptionEn,
      item.image, item.isBestSeller, item.isNew, item.promo, item.sortOrder],
  );
  return response(201, { data: normalizeMenuItem(result.rows[0]) });
}

export async function updateMenu(request, body, id) {
  if (!(await isAdminRequest(request.headers))) return response(401, { error: 'Unauthorized' });
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    return response(400, { error: 'ID menu tidak valid.' });
  }
  const item = validateMenuItem(body);
  if (typeof item === 'string') return response(400, { error: item });
  const result = await getPool().query(
    `UPDATE public.menu_items SET
       name = $2, category = $3, price = $4, description_id = $5,
       description_en = $6, image_url = $7, is_best_seller = $8,
       is_new = $9, promo = $10, sort_order = $11, is_active = $12
     WHERE id = $1
     RETURNING ${menuFields}, is_active AS "isActive"`,
    [id, item.name, item.category, item.price, item.descriptionId,
      item.descriptionEn, item.image, item.isBestSeller, item.isNew,
      item.promo, item.sortOrder, body.isActive !== false],
  );
  if (!result.rows[0]) return response(404, { error: 'Menu tidak ditemukan.' });
  return response(200, { data: { ...normalizeMenuItem(result.rows[0]), isActive: result.rows[0].isActive } });
}

export async function deleteMenu(request, id) {
  if (!(await isAdminRequest(request.headers))) return response(401, { error: 'Unauthorized' });
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    return response(400, { error: 'ID menu tidak valid.' });
  }
  const result = await getPool().query(
    'DELETE FROM public.menu_items WHERE id = $1 RETURNING id',
    [id],
  );
  if (!result.rows[0]) return response(404, { error: 'Menu tidak ditemukan.' });
  return response(200, { deleted: true });
}
