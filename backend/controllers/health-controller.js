import { getPool } from '../database.js';

export async function databaseHealth() {
  const result = await getPool().query('SELECT current_database() AS database, now() AS server_time');
  return { status: 200, body: { connected: true, ...result.rows[0] }, headers: {} };
}
