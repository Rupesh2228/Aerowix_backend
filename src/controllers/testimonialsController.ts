import { pool } from '../config/db';
import { asyncHandler } from '../utils/asyncHandler';
import { testimonialSchema } from '../validators/schemas';

export const listPublicTestimonials = asyncHandler(async (req, res) => {
  const result = await pool.query(`SELECT * FROM testimonials WHERE is_active = true ORDER BY created_at DESC`);
  res.json({ testimonials: result.rows });
});

export const listAdminTestimonials = asyncHandler(async (req, res) => {
  const result = await pool.query(`SELECT * FROM testimonials ORDER BY created_at DESC`);
  res.json({ testimonials: result.rows });
});

export const createTestimonial = asyncHandler(async (req, res) => {
  const parsed = testimonialSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0].message });
  const d = parsed.data;
  const result = await pool.query(
    `INSERT INTO testimonials (customer_name, company, position, profile_image_url, content, rating, is_active)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [d.customer_name, d.company || null, d.position || null, d.profile_image_url || null,
     d.content, d.rating ?? 5, d.is_active ?? true]
  );
  res.status(201).json({ testimonial: result.rows[0] });
});

export const updateTestimonial = asyncHandler(async (req, res) => {
  const parsed = testimonialSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0].message });
  const existing = await pool.query(`SELECT * FROM testimonials WHERE id = $1`, [req.params.id]);
  if (existing.rows.length === 0) return res.status(404).json({ error: 'Testimonial not found.' });
  const c = existing.rows[0];
  const d = parsed.data;
  const result = await pool.query(
    `UPDATE testimonials SET customer_name=$1, company=$2, position=$3, profile_image_url=$4,
     content=$5, rating=$6, is_active=$7 WHERE id=$8 RETURNING *`,
    [d.customer_name ?? c.customer_name, d.company ?? c.company, d.position ?? c.position,
     d.profile_image_url ?? c.profile_image_url, d.content ?? c.content, d.rating ?? c.rating,
     d.is_active ?? c.is_active, req.params.id]
  );
  res.json({ testimonial: result.rows[0] });
});

export const deleteTestimonial = asyncHandler(async (req, res) => {
  await pool.query(`DELETE FROM testimonials WHERE id = $1`, [req.params.id]);
  res.json({ success: true });
});
