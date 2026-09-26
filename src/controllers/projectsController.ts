import { pool } from '../config/db';
import { asyncHandler } from '../utils/asyncHandler';
import { makeSlug } from '../utils/slug';
import { projectSchema } from '../validators/schemas';

// PUBLIC: list published projects, optional category filter + pagination
export const listPublicProjects = asyncHandler(async (req, res) => {
  const { category, page = '1', limit = '12' } = req.query as Record<string, string>;
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
  const offset = (pageNum - 1) * limitNum;

  const params: any[] = ['published'];
  let where = 'status = $1';
  if (category && category !== 'All') {
    params.push(category);
    where += ` AND category = $${params.length}`;
  }

  const countRes = await pool.query(`SELECT COUNT(*) FROM projects WHERE ${where}`, params);
  params.push(limitNum, offset);
  const dataRes = await pool.query(
    `SELECT id, title, slug, category, hero_image_url, is_featured, completion_date, overview
     FROM projects WHERE ${where} ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  res.json({
    projects: dataRes.rows,
    total: parseInt(countRes.rows[0].count),
    page: pageNum,
    limit: limitNum,
  });
});

export const getPublicProjectBySlug = asyncHandler(async (req, res) => {
  const result = await pool.query(
    `SELECT * FROM projects WHERE slug = $1 AND status = 'published'`,
    [req.params.slug]
  );
  if (result.rows.length === 0) return res.status(404).json({ error: 'Project not found.' });
  res.json({ project: result.rows[0] });
});

export const getFeaturedProject = asyncHandler(async (req, res) => {
  const result = await pool.query(
    `SELECT * FROM projects WHERE is_featured = true AND status = 'published' ORDER BY updated_at DESC LIMIT 1`
  );
  res.json({ project: result.rows[0] || null });
});

// ADMIN
export const listAdminProjects = asyncHandler(async (req, res) => {
  const result = await pool.query(`SELECT * FROM projects ORDER BY created_at DESC`);
  res.json({ projects: result.rows });
});

export const getAdminProject = asyncHandler(async (req, res) => {
  const result = await pool.query(`SELECT * FROM projects WHERE id = $1`, [req.params.id]);
  if (result.rows.length === 0) return res.status(404).json({ error: 'Project not found.' });
  res.json({ project: result.rows[0] });
});

export const createProject = asyncHandler(async (req, res) => {
  const parsed = projectSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0].message });
  const d = parsed.data;
  const slug = makeSlug(d.title);

  const result = await pool.query(
    `INSERT INTO projects
      (title, slug, category, status, is_featured, hero_image_url, screenshots, overview, client_name,
       services_provided, technologies, key_features, challenges, solution, results, live_url, github_url,
       completion_date, seo_title, seo_description)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
     RETURNING *`,
    [
      d.title, slug, d.category, d.status, !!d.is_featured, d.hero_image_url || null,
      JSON.stringify(d.screenshots || []), d.overview || null, d.client_name || null,
      JSON.stringify(d.services_provided || []), JSON.stringify(d.technologies || []),
      JSON.stringify(d.key_features || []), d.challenges || null, d.solution || null,
      d.results || null, d.live_url || null, d.github_url || null,
      d.completion_date || null, d.seo_title || null, d.seo_description || null,
    ]
  );

  if (d.is_featured) {
    await pool.query(`UPDATE projects SET is_featured = false WHERE id != $1`, [result.rows[0].id]);
  }

  res.status(201).json({ project: result.rows[0] });
});

export const updateProject = asyncHandler(async (req, res) => {
  const parsed = projectSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0].message });
  const d = parsed.data;

  const existing = await pool.query(`SELECT * FROM projects WHERE id = $1`, [req.params.id]);
  if (existing.rows.length === 0) return res.status(404).json({ error: 'Project not found.' });
  const current = existing.rows[0];

  const slug = d.title ? makeSlug(d.title) : current.slug;

  const result = await pool.query(
    `UPDATE projects SET
      title=$1, slug=$2, category=$3, status=$4, is_featured=$5, hero_image_url=$6, screenshots=$7,
      overview=$8, client_name=$9, services_provided=$10, technologies=$11, key_features=$12,
      challenges=$13, solution=$14, results=$15, live_url=$16, github_url=$17, completion_date=$18,
      seo_title=$19, seo_description=$20, updated_at=now()
     WHERE id=$21 RETURNING *`,
    [
      d.title ?? current.title, slug, d.category ?? current.category, d.status ?? current.status,
      d.is_featured ?? current.is_featured, d.hero_image_url ?? current.hero_image_url,
      JSON.stringify(d.screenshots ?? current.screenshots), d.overview ?? current.overview,
      d.client_name ?? current.client_name, JSON.stringify(d.services_provided ?? current.services_provided),
      JSON.stringify(d.technologies ?? current.technologies), JSON.stringify(d.key_features ?? current.key_features),
      d.challenges ?? current.challenges, d.solution ?? current.solution, d.results ?? current.results,
      d.live_url ?? current.live_url, d.github_url ?? current.github_url,
      d.completion_date ?? current.completion_date, d.seo_title ?? current.seo_title,
      d.seo_description ?? current.seo_description, req.params.id,
    ]
  );

  if (result.rows[0].is_featured) {
    await pool.query(`UPDATE projects SET is_featured = false WHERE id != $1`, [req.params.id]);
  }

  res.json({ project: result.rows[0] });
});

export const deleteProject = asyncHandler(async (req, res) => {
  await pool.query(`DELETE FROM projects WHERE id = $1`, [req.params.id]);
  res.json({ success: true });
});

export const setProjectStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['draft', 'published'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status.' });
  }
  const result = await pool.query(
    `UPDATE projects SET status = $1, updated_at = now() WHERE id = $2 RETURNING *`,
    [status, req.params.id]
  );
  res.json({ project: result.rows[0] });
});
