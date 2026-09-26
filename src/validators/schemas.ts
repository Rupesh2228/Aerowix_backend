import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const projectSchema = z.object({
  title: z.string().min(2).max(160),
  category: z.enum(['Websites', 'Web Applications', 'Software', 'Mobile Apps', 'UI/UX', 'SEO', 'Digital Marketing']),
  status: z.enum(['draft', 'published']).default('draft'),
  is_featured: z.boolean().optional(),
  hero_image_url: z.string().url().optional().or(z.literal('')),
  screenshots: z.array(z.string().url()).optional(),
  overview: z.string().optional(),
  client_name: z.string().optional(),
  services_provided: z.array(z.string()).optional(),
  technologies: z.array(z.string()).optional(),
  key_features: z.array(z.string()).optional(),
  challenges: z.string().optional(),
  solution: z.string().optional(),
  results: z.string().optional(),
  live_url: z.string().url().optional().or(z.literal('')),
  github_url: z.string().url().optional().or(z.literal('')),
  completion_date: z.string().optional(),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
});

export const serviceSchema = z.object({
  title: z.string().min(2).max(120),
  short_description: z.string().optional(),
  icon: z.string().optional(),
  content: z.string().optional(),
  order_index: z.number().optional(),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
  is_active: z.boolean().optional(),
});

export const testimonialSchema = z.object({
  customer_name: z.string().min(2),
  company: z.string().optional(),
  position: z.string().optional(),
  profile_image_url: z.string().url().optional().or(z.literal('')),
  content: z.string().min(2),
  rating: z.number().min(1).max(5).optional(),
  is_active: z.boolean().optional(),
});

export const blogSchema = z.object({
  title: z.string().min(2).max(200),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  featured_image_url: z.string().url().optional().or(z.literal('')),
  author: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
  status: z.enum(['draft', 'published']).default('draft'),
});

export const teamSchema = z.object({
  name: z.string().min(2),
  role: z.string().optional(),
  photo_url: z.string().url().optional().or(z.literal('')),
  bio: z.string().optional(),
  social_links: z.record(z.string()).optional(),
  order_index: z.number().optional(),
  is_active: z.boolean().optional(),
});

export const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().optional(),
  service: z.string().optional(),
  budget: z.string().optional(),
  message: z.string().min(5),
});

export const projectRequestSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().optional(),
  service: z.string().optional(),
  project_type: z.string().optional(),
  budget: z.string().optional(),
  deadline: z.string().optional(),
  description: z.string().min(5),
});
