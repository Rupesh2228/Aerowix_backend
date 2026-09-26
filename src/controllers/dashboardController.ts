import { pool } from '../config/db';
import { asyncHandler } from '../utils/asyncHandler';

export const getDashboardStats = asyncHandler(async (req, res) => {
  const [projects, posts, messages, testimonials, requests] = await Promise.all([
    pool.query(`SELECT COUNT(*) FROM projects`),
    pool.query(`SELECT COUNT(*) FROM blog_posts`),
    pool.query(`SELECT COUNT(*) FROM contact_messages WHERE status = 'new'`),
    pool.query(`SELECT COUNT(*) FROM testimonials`),
    pool.query(`SELECT COUNT(*) FROM project_requests WHERE status = 'new'`),
  ]);
  res.json({
    totalProjects: parseInt(projects.rows[0].count),
    totalBlogPosts: parseInt(posts.rows[0].count),
    newContactRequests: parseInt(messages.rows[0].count),
    totalTestimonials: parseInt(testimonials.rows[0].count),
    newProjectRequests: parseInt(requests.rows[0].count),
  });
});
