import {
  getSession,
  login,
  logout,
  validateAdminMutation,
} from '../controllers/auth-controller.js';
import { databaseHealth } from '../controllers/health-controller.js';
import {
  createGallery,
  deleteGallery,
  listAdminGallery,
  listGallery,
  updateGallery,
  uploadGalleryMedia,
} from '../controllers/gallery-controller.js';
import {
  createMenu,
  deleteMenu,
  listAdminMenu,
  listMenu,
  updateMenu,
  uploadMenuImage,
} from '../controllers/menu-controller.js';
import {
  listAdminSiteContent,
  listSiteContent,
  uploadHeroImage,
  uploadAboutVideo,
  updateSiteContent,
} from '../controllers/site-content-controller.js';
import {
  createBlockedKeyword,
  createTestimonial,
  deleteBlockedKeyword,
  deleteTestimonial,
  listAdminTestimonials,
  listBlockedKeywords,
  listPublicTestimonials,
  updateTestimonial,
} from '../controllers/testimonial-controller.js';

const routes = [
  { method: 'POST', path: '/api/auth/login', handler: ({ request, body }) => login(request, body) },
  { method: 'POST', path: '/api/auth/logout', handler: () => logout() },
  { method: 'GET', path: '/api/auth/session', handler: ({ request }) => getSession(request) },
  { method: 'GET', path: '/api/health/db', handler: () => databaseHealth() },
  { method: 'GET', path: '/api/menu', handler: () => listMenu() },
  { method: 'GET', path: '/api/gallery', handler: () => listGallery() },
  { method: 'GET', path: '/api/testimonials', handler: () => listPublicTestimonials() },
  { method: 'GET', path: '/api/content', handler: () => listSiteContent() },
  { method: 'POST', path: '/api/testimonials', handler: ({ body }) => createTestimonial(body) },
  { method: 'GET', path: '/api/admin/testimonials', handler: ({ request }) => listAdminTestimonials(request) },
  { method: 'GET', path: '/api/admin/testimonial-keywords', handler: ({ request }) => listBlockedKeywords(request) },
  { method: 'POST', path: '/api/admin/testimonial-keywords', handler: ({ request, body }) => createBlockedKeyword(request, body) },
  { method: 'POST', path: '/api/admin/gallery/media', handler: ({ request, body }) => uploadGalleryMedia(request, body) },
  { method: 'GET', path: '/api/admin/gallery', handler: ({ request }) => listAdminGallery(request) },
  { method: 'POST', path: '/api/admin/gallery', handler: ({ request, body }) => createGallery(request, body) },
  { method: 'POST', path: '/api/admin/menu/image', handler: ({ request, body }) => uploadMenuImage(request, body) },
  { method: 'GET', path: '/api/admin/menu', handler: ({ request }) => listAdminMenu(request) },
  { method: 'GET', path: '/api/admin/content', handler: ({ request }) => listAdminSiteContent(request) },
  { method: 'POST', path: '/api/admin/content/hero-image', handler: ({ request, body }) => uploadHeroImage(request, body) },
  { method: 'POST', path: '/api/admin/content/about-video', handler: ({ request, body }) => uploadAboutVideo(request, body) },
  { method: 'POST', path: '/api/admin/menu', handler: ({ request, body }) => createMenu(request, body) },
  {
    method: 'PUT',
    match: /^\/api\/admin\/menu\/([^/]+)$/,
    handler: ({ request, body, match }) => updateMenu(request, body, match[1]),
  },
  {
    method: 'DELETE',
    match: /^\/api\/admin\/menu\/([^/]+)$/,
    handler: ({ request, match }) => deleteMenu(request, match[1]),
  },
  {
    method: 'PUT',
    match: /^\/api\/admin\/gallery\/([^/]+)$/,
    handler: ({ request, body, match }) => updateGallery(request, body, match[1]),
  },
  {
    method: 'DELETE',
    match: /^\/api\/admin\/gallery\/([^/]+)$/,
    handler: ({ request, match }) => deleteGallery(request, match[1]),
  },
  {
    method: 'PUT',
    match: /^\/api\/admin\/testimonials\/([^/]+)$/,
    handler: ({ request, body, match }) => updateTestimonial(request, body, match[1]),
  },
  {
    method: 'DELETE',
    match: /^\/api\/admin\/testimonials\/([^/]+)$/,
    handler: ({ request, match }) => deleteTestimonial(request, match[1]),
  },
  {
    method: 'PUT',
    match: /^\/api\/admin\/content\/([^/]+)$/,
    handler: ({ request, body, match }) => updateSiteContent(request, body, match[1]),
  },
  {
    method: 'DELETE',
    match: /^\/api\/admin\/testimonial-keywords\/([^/]+)$/,
    handler: ({ request, match }) => deleteBlockedKeyword(request, match[1]),
  },
];

export async function dispatchApiRoute(request, path, body = {}) {
  const method = request.method.toUpperCase();
  const route = routes.find((candidate) => {
    if (candidate.method !== method) return false;
    return candidate.path ? candidate.path === path : candidate.match.test(path);
  });
  if (!route) return null;

  const match = route.match?.exec(path);
  if (path.startsWith('/api/admin/') && ['POST', 'PUT', 'DELETE'].includes(method)
    && !validateAdminMutation(request.headers)) {
    return {
      status: 403,
      body: { error: 'Permintaan admin tidak valid atau sesi kedaluwarsa.' },
      headers: { 'Cache-Control': 'no-store, private', 'X-Robots-Tag': 'noindex, nofollow' },
    };
  }
  const result = await route.handler({ request, body, match });
  if (path.startsWith('/api/admin/') || path.startsWith('/api/auth/')) {
    result.headers = {
      ...(result.headers || {}),
      'Cache-Control': 'no-store, private',
      'X-Robots-Tag': 'noindex, nofollow',
    };
  }
  return result;
}
