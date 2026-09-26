import { pool } from '../config/db';
import { asyncHandler } from '../utils/asyncHandler';

export const getPublicSettings = asyncHandler(async (req, res) => {
  const result = await pool.query(`SELECT key, value FROM site_settings`);
  const settings: Record<string, any> = {};
  result.rows.forEach((row) => { settings[row.key] = row.value; });
  res.json({ settings });
});

export const getAdminSettings = getPublicSettings;

export const updateSetting = asyncHandler(async (req, res) => {
  const { key } = req.params;
  const { value } = req.body;
  const result = await pool.query(
    `INSERT INTO site_settings (key, value) VALUES ($1, $2)
     ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = now() RETURNING *`,
    [key, JSON.stringify(value)]
  );
  res.json({ setting: result.rows[0] });
});
