import {
  getSession,
  login,
  logout,
} from '../controllers/auth-controller.js';
import { databaseHealth } from '../controllers/health-controller.js';
import {
  createMenu,
  deleteMenu,
  listAdminMenu,
  listMenu,
  updateMenu,
  uploadMenuImage,
} from '../controllers/menu-controller.js';

const routes = [
  { method: 'POST', path: '/api/auth/login', handler: ({ request, body }) => login(request, body) },
  { method: 'POST', path: '/api/auth/logout', handler: () => logout() },
  { method: 'GET', path: '/api/auth/session', handler: ({ request }) => getSession(request) },
  { method: 'GET', path: '/api/health/db', handler: () => databaseHealth() },
  { method: 'GET', path: '/api/menu', handler: () => listMenu() },
  { method: 'POST', path: '/api/admin/menu/image', handler: ({ request, body }) => uploadMenuImage(request, body) },
  { method: 'GET', path: '/api/admin/menu', handler: ({ request }) => listAdminMenu(request) },
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
];

export async function dispatchApiRoute(request, path, body = {}) {
  const method = request.method.toUpperCase();
  const route = routes.find((candidate) => {
    if (candidate.method !== method) return false;
    return candidate.path ? candidate.path === path : candidate.match.test(path);
  });
  if (!route) return null;

  const match = route.match?.exec(path);
  return route.handler({ request, body, match });
}
