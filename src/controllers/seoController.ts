import { Request, Response } from 'express';
import { pool } from '../config/db';
import { asyncHandler } from '../utils/asyncHandler';

// Dynamic sitemap.xml — pulls in every published project, blog post and
// active service so new content is indexed automatically without a rebuild.
export const getSitemap = asyncHandler(async (req: Request, res: Response) => {
  const siteUrl = (process.env.SITE_URL || 'https://aerowix.example.com').replace(/\/$/, '');

  const staticPages = ['', '/services', '/projects', '/about', '/blog', '/contact', '/start-a-project'];

  const [projects, posts, services] = await Promise.all([
    pool.query(`SELECT slug, updated_at FROM projects WHERE status = 'published'`),
    pool.query(`SELECT slug, updated_at FROM blog_posts WHERE status = 'published'`),
    pool.query(`SELECT slug, updated_at FROM services WHERE is_active = true`),
  ]);

  const urls: { loc: string; lastmod?: string }[] = [
    ...staticPages.map((p) => ({ loc: `${siteUrl}${p}` })),
    ...projects.rows.map((r) => ({ loc: `${siteUrl}/projects/${r.slug}`, lastmod: r.updated_at })),
    ...posts.rows.map((r) => ({ loc: `${siteUrl}/blog/${r.slug}`, lastmod: r.updated_at })),
    ...services.rows.map((r) => ({ loc: `${siteUrl}/services/${r.slug}`, lastmod: r.updated_at })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>
    <loc>${u.loc}</loc>${u.lastmod ? `\n    <lastmod>${new Date(u.lastmod).toISOString()}</lastmod>` : ''}
  </url>`).join('\n')}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml');
  res.send(xml);
});

export const getRobotsTxt = asyncHandler(async (req: Request, res: Response) => {
  const siteUrl = (process.env.SITE_URL || 'https://aerowix.example.com').replace(/\/$/, '');
  res.setHeader('Content-Type', 'text/plain');
  res.send(`User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: ${siteUrl}/sitemap.xml\n`);
});
