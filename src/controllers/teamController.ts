import { pool } from '../config/db';
import { asyncHandler } from '../utils/asyncHandler';
import { teamSchema } from '../validators/schemas';

export const listPublicTeam = asyncHandler(async (req, res) => {
  const result = await pool.query(`SELECT * FROM team_members WHERE is_active = true ORDER BY order_index ASC, id ASC`);
  res.json({ team: result.rows });
});

export const listAdminTeam = asyncHandler(async (req, res) => {
  const result = await pool.query(`SELECT * FROM team_members ORDER BY order_index ASC, id ASC`);
  res.json({ team: result.rows });
});

export const createTeamMember = asyncHandler(async (req, res) => {
  const parsed = teamSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0].message });
  const d = parsed.data;
  const result = await pool.query(
    `INSERT INTO team_members (name, role, photo_url, bio, social_links, order_index, is_active)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [d.name, d.role || null, d.photo_url || null, d.bio || null, JSON.stringify(d.social_links || {}),
     d.order_index ?? 0, d.is_active ?? true]
  );
  res.status(201).json({ member: result.rows[0] });
});

export const updateTeamMember = asyncHandler(async (req, res) => {
  const parsed = teamSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0].message });
  const existing = await pool.query(`SELECT * FROM team_members WHERE id = $1`, [req.params.id]);
  if (existing.rows.length === 0) return res.status(404).json({ error: 'Team member not found.' });
  const c = existing.rows[0];
  const d = parsed.data;
  const result = await pool.query(
    `UPDATE team_members SET name=$1, role=$2, photo_url=$3, bio=$4, social_links=$5, order_index=$6, is_active=$7
     WHERE id=$8 RETURNING *`,
    [d.name ?? c.name, d.role ?? c.role, d.photo_url ?? c.photo_url, d.bio ?? c.bio,
     JSON.stringify(d.social_links ?? c.social_links), d.order_index ?? c.order_index,
     d.is_active ?? c.is_active, req.params.id]
  );
  res.json({ member: result.rows[0] });
});

export const deleteTeamMember = asyncHandler(async (req, res) => {
  await pool.query(`DELETE FROM team_members WHERE id = $1`, [req.params.id]);
  res.json({ success: true });
});
