import { getPool } from './database.js';

const MENU_TABLES = Object.freeze({
  'ala-carte': 'menu_ala_carte',
  paketan: 'menu_paketan',
  minuman: 'menu_minuman',
  'hidangan-penutup': 'menu_hidangan_penutup',
});

export const MENU_CATEGORIES = Object.freeze(Object.keys(MENU_TABLES));
export const MENU_FIELDS = `id, name, category, price, description_id AS "descriptionId",
  description_en AS "descriptionEn", image_url AS image,
  subcategory,
  is_recommended AS "isRecommended", is_new AS "isNew", promo,
  sort_order AS "sortOrder", is_active AS "isActive"`;

const MENU_UNION = Object.entries(MENU_TABLES)
  .map(([, table]) => `SELECT ${MENU_FIELDS} FROM public.${table}`)
  .join(' UNION ALL ');

export function getMenuTable(category) {
  return MENU_TABLES[category] || null;
}

export function getMenuUnionQuery() {
  return MENU_UNION;
}

export async function findMenuTable(client, id) {
  for (const table of Object.values(MENU_TABLES)) {
    const result = await client.query(`SELECT 1 FROM public.${table} WHERE id = $1`, [id]);
    if (result.rowCount > 0) return table;
  }
  return null;
}

export function getMenuPool() {
  return getPool();
}
