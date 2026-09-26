import { pool } from '../config/db';
import { asyncHandler } from '../utils/asyncHandler';
import { makeSlug } from '../utils/slug';
import { blogSchema } from '../validators/schemas';

export const listPublicPosts = asyncHandler(async (req, res) => {
  const { category, page = '1', limit = '9' } = req.query as Record<string, string>;
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
  const offset = (pageNum - 1) * limitNum;

  const params: any[] = ['published'];
  let where = 'status = $1';
  if (category) { params.push(category); where += ` AND category = $${params.length}`; }

  const countRes = await pool.query(`SELECT COUNT(*) FROM blog_posts WHERE ${where}`, params);
  params.push(limitNum, offset);
  const dataRes = await pool.query(
    `SELECT id, title, slug, excerpt, featured_image_url, author, category, tags, published_at
     FROM blog_posts WHERE ${where} ORDER BY published_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );
  res.json({ posts: dataRes.rows, total: parseInt(countRes.rows[0].count), page: pageNum, limit: limitNum });
});

export const getPublicPostBySlug = asyncHandler(async (req, res) => {
  const result = await pool.query(`SELECT * FROM blog_posts WHERE slug = $1 AND status = 'published'`, [req.params.slug]);
  if (result.rows.length === 0) return res.status(404).json({ error: 'Post not found.' });
  res.json({ post: result.rows[0] });
});

export const listAdminPosts = asyncHandler(async (req, res) => {
  const result = await pool.query(`SELECT * FROM blog_posts ORDER BY created_at DESC`);
  res.json({ posts: result.rows });
});

export const createPost = asyncHandler(async (req, res) => {
  const parsed = blogSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0].message });
  const d = parsed.data;
  const slug = makeSlug(d.title);
  const publishedAt = d.status === 'published' ? new Date() : null;
  const result = await pool.query(
    `INSERT INTO blog_posts (title, slug, excerpt, content, featured_image_url, author, category, tags,
      seo_title, seo_description, status, published_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
    [d.title, slug, d.excerpt || null, d.content || null, d.featured_image_url || null, d.author || null,
     d.category || null, JSON.stringify(d.tags || []), d.seo_title || null, d.seo_description || null,
     d.status, publishedAt]
  );
  res.status(201).json({ post: result.rows[0] });
});

export const updatePost = asyncHandler(async (req, res) => {
  const parsed = blogSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0].message });
  const existing = await pool.query(`SELECT * FROM blog_posts WHERE id = $1`, [req.params.id]);
  if (existing.rows.length === 0) return res.status(404).json({ error: 'Post not found.' });
  const c = existing.rows[0];
  const d = parsed.data;
  const slug = d.title ? makeSlug(d.title) : c.slug;
  const publishedAt = d.status === 'published' && !c.published_at ? new Date() : c.published_at;
  const result = await pool.query(
    `UPDATE blog_posts SET title=$1, slug=$2, excerpt=$3, content=$4, featured_image_url=$5, author=$6,
     category=$7, tags=$8, seo_title=$9, seo_description=$10, status=$11, published_at=$12, updated_at=now()
     WHERE id=$13 RETURNING *`,
    [d.title ?? c.title, slug, d.excerpt ?? c.excerpt, d.content ?? c.content,
     d.featured_image_url ?? c.featured_image_url, d.author ?? c.author, d.category ?? c.category,
     JSON.stringify(d.tags ?? c.tags), d.seo_title ?? c.seo_title, d.seo_description ?? c.seo_description,
     d.status ?? c.status, publishedAt, req.params.id]
  );
  res.json({ post: result.rows[0] });
});

export const deletePost = asyncHandler(async (req, res) => {
  await pool.query(`DELETE FROM blog_posts WHERE id = $1`, [req.params.id]);
  res.json({ success: true });
});
