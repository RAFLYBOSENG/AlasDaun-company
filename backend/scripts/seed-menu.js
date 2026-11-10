import { config } from 'dotenv';
import pg from 'pg';
import { menuItems } from '../../frontend/src/data/menu.js';
import { getMenuTable } from '../menu-repository.js';

config();

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required.');

const { Client } = pg;
const client = new Client({ connectionString: process.env.DATABASE_URL });
let connected = false;
let inTransaction = false;

try {
  await client.connect();
  connected = true;
  await client.query('BEGIN');
  inTransaction = true;
  const existing = await client.query(`
    SELECT count(*)::int AS count FROM (
      SELECT id FROM public.menu_ala_carte
      UNION ALL SELECT id FROM public.menu_paketan
      UNION ALL SELECT id FROM public.menu_minuman
      UNION ALL SELECT id FROM public.menu_hidangan_penutup
    ) AS all_menu_items
  `);
  if (existing.rows[0].count > 0) {
    throw new Error('menu_items sudah berisi data. Seed dibatalkan agar data admin tidak tertimpa.');
  }

  for (const [index, item] of menuItems.entries()) {
    await client.query(
      `INSERT INTO public.${getMenuTable(item.category)}
        (name, category, price, description_id, description_en, image_url,
         subcategory, is_recommended, is_new, promo, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        item.name,
        item.category,
        item.price,
        item.descriptionId,
        item.descriptionEn,
        item.image,
        item.subcategory,
        item.badge === 'Recommended',
        item.badge === 'Menu Baru',
        item.promo ?? null,
        index,
      ],
    );
  }

  await client.query('COMMIT');
  inTransaction = false;
  console.log(`${menuItems.length} menu berhasil disalin ke database.`);
} catch (error) {
  if (inTransaction) await client.query('ROLLBACK');
  throw error;
} finally {
  if (connected) await client.end();
}
