import { getPool } from '../database.js';
import { isAdminRequest } from './auth-controller.js';

const CONTENT_FIELDS = 'content_key AS "key", value_id AS "id", value_en AS "en"';
const CONTENT_TYPES = {
  uniquenessLabel: 'text',
  uniquenessTagline: 'text',
  philosophy: 'list',
  uniquenessFeature1: 'feature',
  uniquenessFeature2: 'feature',
  uniquenessFeature3: 'feature',
  uniquenessFeature4: 'feature',
};

function response(status, body) {
  return { status, body, headers: {} };
}

function normalize(row) {
  return {
    key: row.key,
    id: row.id,
    en: row.en,
  };
}

function validateValue(key, value) {
  const type = CONTENT_TYPES[key];
  if (!type || !value || typeof value !== 'object' || Array.isArray(value)) {
    return 'Konten situs tidak valid.';
  }

  if (type === 'text') {
    const id = typeof value.id === 'string' ? value.id.trim() : '';
    const en = typeof value.en === 'string' ? value.en.trim() : '';
    if (!id || !en || id.length > 500 || en.length > 500) {
      return 'Tagline wajib diisi dan maksimal 500 karakter per bahasa.';
    }
    return { id, en };
  }

  if (type === 'feature') {
    const id = value.id && typeof value.id === 'object' ? value.id : {};
    const en = value.en && typeof value.en === 'object' ? value.en : {};
    const idTitle = typeof id.title === 'string' ? id.title.trim() : '';
    const idDescription = typeof id.description === 'string' ? id.description.trim() : '';
    const enTitle = typeof en.title === 'string' ? en.title.trim() : '';
    const enDescription = typeof en.description === 'string' ? en.description.trim() : '';
    if (!idTitle || !idDescription || !enTitle || !enDescription
      || idTitle.length > 120 || idDescription.length > 1000
      || enTitle.length > 120 || enDescription.length > 1000) {
      return 'Judul dan deskripsi kartu wajib diisi; judul maksimal 120 karakter dan deskripsi maksimal 1000 karakter.';
    }
    return {
      id: { title: idTitle, description: idDescription },
      en: { title: enTitle, description: enDescription },
    };
  }

  const id = Array.isArray(value.id) ? value.id.map((item) => String(item).trim()) : [];
  const en = Array.isArray(value.en) ? value.en.map((item) => String(item).trim()) : [];
  if (
    id.length === 0 || en.length === 0
    || id.length > 30 || en.length > 30
    || id.some((item) => !item || item.length > 120)
    || en.some((item) => !item || item.length > 120)
  ) {
    return 'Filosofi harus berisi 1 sampai 30 item dengan maksimal 120 karakter.';
  }
  return { id, en };
}

export async function listSiteContent() {
  const result = await getPool().query(
    `SELECT ${CONTENT_FIELDS} FROM public.site_content ORDER BY content_key`,
  );
  return response(200, {
    data: Object.fromEntries(result.rows.map((row) => [row.key, normalize(row)])),
  });
}

export async function listAdminSiteContent(request) {
  if (!(await isAdminRequest(request.headers))) return response(401, { error: 'Unauthorized' });
  return listSiteContent();
}

export async function updateSiteContent(request, body, key) {
  if (!(await isAdminRequest(request.headers))) return response(401, { error: 'Unauthorized' });
  const value = validateValue(key, body);
  if (typeof value === 'string') return response(400, { error: value });

  const result = await getPool().query(
    `INSERT INTO public.site_content (content_key, value_id, value_en)
     VALUES ($1, $2::jsonb, $3::jsonb)
     ON CONFLICT (content_key) DO UPDATE SET
       value_id = EXCLUDED.value_id,
       value_en = EXCLUDED.value_en,
       updated_at = now()
     RETURNING ${CONTENT_FIELDS}`,
    [key, JSON.stringify(value.id), JSON.stringify(value.en)],
  );
  return response(200, { data: normalize(result.rows[0]) });
}
