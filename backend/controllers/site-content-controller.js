import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getPool } from '../database.js';
import { isAdminRequest } from './auth-controller.js';

const CONTENT_FIELDS = 'content_key AS "key", value_id AS "id", value_en AS "en"';
const ABOUT_VIDEO_DIRECTORY = fileURLToPath(
  new URL('../../frontend/public/vidaboutus/', import.meta.url),
);
const HERO_IMAGE_DIRECTORY = fileURLToPath(
  new URL('../../frontend/public/asset/images/hero/', import.meta.url),
);
const MAX_ABOUT_VIDEO_BYTES = 70 * 1024 * 1024;
const MAX_HERO_IMAGE_BYTES = 5 * 1024 * 1024;
const HERO_IMAGE_TYPES = {
  'image/jpeg': { extension: 'jpg', matches: (data) => data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff },
  'image/png': { extension: 'png', matches: (data) => data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) },
  'image/webp': { extension: 'webp', matches: (data) => data.toString('ascii', 0, 4) === 'RIFF' && data.toString('ascii', 8, 12) === 'WEBP' },
};
const VIDEO_TYPES = {
  'video/mp4': { extension: 'mp4', matches: (data) => data.toString('ascii', 4, 8) === 'ftyp' },
  'video/webm': { extension: 'webm', matches: (data) => data.toString('ascii', 0, 4) === '\x1aE\xdf\xa3' },
  'video/ogg': { extension: 'ogv', matches: (data) => data.toString('ascii', 0, 4) === 'OggS' },
};
const CONTENT_TYPES = {
  hero: 'hero',
  uniquenessLabel: 'text',
  uniquenessTagline: 'text',
  philosophy: 'list',
  uniquenessFeature1: 'feature',
  uniquenessFeature2: 'feature',
  uniquenessFeature3: 'feature',
  uniquenessFeature4: 'feature',
  about: 'about',
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

  if (type === 'hero') {
    const id = value.id && typeof value.id === 'object' ? value.id : {};
    const en = value.en && typeof value.en === 'object' ? value.en : {};
    const idImageUrls = Array.isArray(id.imageUrls)
      ? id.imageUrls.map((item) => typeof item === 'string' ? item.trim() : '').filter(Boolean)
      : typeof id.imageUrl === 'string' ? [id.imageUrl.trim()].filter(Boolean) : [];
    const validImageUrl = (item) => (
      item.startsWith('/asset/images/hero/')
      || item.startsWith('/vidaboutus/')
      || item.startsWith('http://')
      || item.startsWith('https://')
      || /^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/i.test(item)
    );
    if (idImageUrls.length === 0 || idImageUrls.length > 20
      || idImageUrls.some((item) => item.length > 8 * 1024 * 1024 || !validImageUrl(item))) {
      return 'Gambar banner wajib diisi, maksimal 20 gambar, dan format URL tidak valid.';
    }
    return { id: { imageUrls: idImageUrls }, en: { imageUrls: idImageUrls } };
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

  if (type === 'about') {
    const validateLanguage = (language) => {
      if (!language || typeof language !== 'object' || Array.isArray(language)) return null;
      const text = (field, max) => typeof language[field] === 'string'
        && language[field].trim() && language[field].trim().length <= max
        ? language[field].trim() : null;
      const list = (field, maxItems = 30, maxLength = 500) => (
        Array.isArray(language[field])
          && language[field].length > 0
          && language[field].length <= maxItems
          && language[field].every((item) => typeof item === 'string'
            && item.trim() && item.trim().length <= maxLength)
          ? language[field].map((item) => item.trim()) : null
      );
      const result = {
        sectionLabel: text('sectionLabel', 200),
        sectionTitle: text('sectionTitle', 300),
        welcomeMessage: text('welcomeMessage', 300),
        founded: text('founded', 120),
        locationStory: text('locationStory', 120),
        story: list('story', 10, 2000),
        vision: text('vision', 1000),
        mission: list('mission', 30, 1000),
        philosophy: list('philosophy', 30, 120),
        tagline: text('tagline', 300),
        diningDescription: text('diningDescription', 1000),
        milestones: list('milestones', 30, 500),
        signatureDishes: list('signatureDishes', 30, 120),
        signatureBeverages: list('signatureBeverages', 30, 120),
        capacity: text('capacity', 120),
        areas: list('areas', 30, 120),
        facilities: list('facilities', 50, 160),
        videoUrl: text('videoUrl', 2000),
        youtubeUrl: text('youtubeUrl', 500),
      };
      return Object.values(result).some((item) => item === null) ? null : result;
    };
    const id = validateLanguage(value.id);
    const en = validateLanguage(value.en);
    if (!id || !en) return 'Data Tentang Kami belum lengkap atau melebihi batas karakter.';
    return { id, en };
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

export async function uploadHeroImage(request, body) {
  if (!(await isAdminRequest(request.headers))) return response(401, { error: 'Unauthorized' });
  const contentType = typeof body.contentType === 'string' ? body.contentType.toLowerCase() : '';
  const imageType = HERO_IMAGE_TYPES[contentType];
  if (!imageType || typeof body.data !== 'string') {
    return response(400, { error: 'Format gambar banner harus JPEG, PNG, atau WebP.' });
  }
  if (body.data.length > Math.ceil(MAX_HERO_IMAGE_BYTES * 4 / 3) + 4
    || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(body.data)) {
    return response(400, { error: 'Gambar tidak valid atau ukurannya melebihi 5 MB.' });
  }
  const imageData = Buffer.from(body.data, 'base64');
  if (imageData.length === 0 || imageData.length > MAX_HERO_IMAGE_BYTES || !imageType.matches(imageData)) {
    return response(400, { error: 'Isi gambar tidak cocok dengan format atau ukurannya melebihi 5 MB.' });
  }
  if (process.env.VERCEL) {
    return response(201, { data: { imageUrl: `data:${contentType};base64,${body.data}` } });
  }
  await mkdir(HERO_IMAGE_DIRECTORY, { recursive: true });
  const filename = `hero-${randomUUID()}.${imageType.extension}`;
  await writeFile(join(HERO_IMAGE_DIRECTORY, filename), imageData, { flag: 'wx' });
  return response(201, { data: { imageUrl: `/asset/images/hero/${filename}` } });
}

export async function uploadAboutVideo(request, body) {
  if (!(await isAdminRequest(request.headers))) return response(401, { error: 'Unauthorized' });
  const contentType = typeof body.contentType === 'string' ? body.contentType.toLowerCase() : '';
  const videoType = VIDEO_TYPES[contentType];
  if (!videoType || typeof body.data !== 'string') {
    return response(400, { error: 'Format video harus MP4, WebM, atau OGG.' });
  }
  if (body.data.length > Math.ceil(MAX_ABOUT_VIDEO_BYTES * 4 / 3) + 4
    || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(body.data)) {
    return response(400, { error: 'Video tidak valid atau ukurannya melebihi 70 MB.' });
  }
  const videoData = Buffer.from(body.data, 'base64');
  if (videoData.length === 0 || videoData.length > MAX_ABOUT_VIDEO_BYTES || !videoType.matches(videoData)) {
    return response(400, { error: 'Isi video tidak cocok dengan format atau ukurannya melebihi 70 MB.' });
  }
  if (process.env.VERCEL) {
    return response(201, { data: { videoUrl: `data:${contentType};base64,${body.data}` } });
  }
  await mkdir(ABOUT_VIDEO_DIRECTORY, { recursive: true });
  const filename = `about-${Date.now()}.${videoType.extension}`;
  await writeFile(join(ABOUT_VIDEO_DIRECTORY, filename), videoData, { flag: 'wx' });
  return response(201, { data: { videoUrl: `/vidaboutus/${filename}` } });
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
