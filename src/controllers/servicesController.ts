import { pool } from '../config/db';
import { asyncHandler } from '../utils/asyncHandler';
import { makeSlug } from '../utils/slug';
import { serviceSchema } from '../validators/schemas';

export const listPublicServices = asyncHandler(async (req, res) => {
  const result = await pool.query(
    `SELECT * FROM services WHERE is_active = true ORDER BY order_index ASC, id ASC`
  );
  res.json({ services: result.rows });
});

export const getPublicServiceBySlug = asyncHandler(async (req, res) => {
  const result = await pool.query(`SELECT * FROM services WHERE slug = $1 AND is_active = true`, [req.params.slug]);
  if (result.rows.length === 0) return res.status(404).json({ error: 'Service not found.' });
  res.json({ service: result.rows[0] });
});

export const listAdminServices = asyncHandler(async (req, res) => {
  const result = await pool.query(`SELECT * FROM services ORDER BY order_index ASC, id ASC`);
  res.json({ services: result.rows });
});

export const createService = asyncHandler(async (req, res) => {
  const parsed = serviceSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0].message });
  const d = parsed.data;
  const slug = makeSlug(d.title);
  const result = await pool.query(
    `INSERT INTO services (title, slug, short_description, icon, content, order_index, seo_title, seo_description, is_active)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [d.title, slug, d.short_description || null, d.icon || null, d.content || null,
     d.order_index ?? 0, d.seo_title || null, d.seo_description || null, d.is_active ?? true]
  );
  res.status(201).json({ service: result.rows[0] });
});

export const updateService = asyncHandler(async (req, res) => {
  const parsed = serviceSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0].message });
  const existing = await pool.query(`SELECT * FROM services WHERE id = $1`, [req.params.id]);
  if (existing.rows.length === 0) return res.status(404).json({ error: 'Service not found.' });
  const c = existing.rows[0];
  const d = parsed.data;
  const slug = d.title ? makeSlug(d.title) : c.slug;
  const result = await pool.query(
    `UPDATE services SET title=$1, slug=$2, short_description=$3, icon=$4, content=$5, order_index=$6,
     seo_title=$7, seo_description=$8, is_active=$9, updated_at=now() WHERE id=$10 RETURNING *`,
    [d.title ?? c.title, slug, d.short_description ?? c.short_description, d.icon ?? c.icon,
     d.content ?? c.content, d.order_index ?? c.order_index, d.seo_title ?? c.seo_title,
     d.seo_description ?? c.seo_description, d.is_active ?? c.is_active, req.params.id]
  );
  res.json({ service: result.rows[0] });
});

export const deleteService = asyncHandler(async (req, res) => {
  await pool.query(`DELETE FROM services WHERE id = $1`, [req.params.id]);
  res.json({ success: true });
});

export const reorderServices = asyncHandler(async (req, res) => {
  const { order } = req.body as { order: { id: number; order_index: number }[] };
  for (const item of order) {
    await pool.query(`UPDATE services SET order_index = $1 WHERE id = $2`, [item.order_index, item.id]);
  }
  res.json({ success: true });
});
