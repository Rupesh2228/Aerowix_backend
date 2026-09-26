-- Aerowix Group database schema (PostgreSQL)

CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(30) NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  title VARCHAR(120) NOT NULL,
  slug VARCHAR(140) UNIQUE NOT NULL,
  short_description TEXT,
  icon VARCHAR(80),
  content TEXT,
  order_index INT DEFAULT 0,
  seo_title VARCHAR(160),
  seo_description VARCHAR(300),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  title VARCHAR(160) NOT NULL,
  slug VARCHAR(180) UNIQUE NOT NULL,
  category VARCHAR(60) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  is_featured BOOLEAN DEFAULT false,
  hero_image_url TEXT,
  screenshots JSONB DEFAULT '[]',
  overview TEXT,
  client_name VARCHAR(160),
  services_provided JSONB DEFAULT '[]',
  technologies JSONB DEFAULT '[]',
  key_features JSONB DEFAULT '[]',
  challenges TEXT,
  solution TEXT,
  results TEXT,
  live_url TEXT,
  github_url TEXT,
  completion_date DATE,
  seo_title VARCHAR(160),
  seo_description VARCHAR(300),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS testimonials (
  id SERIAL PRIMARY KEY,
  customer_name VARCHAR(120) NOT NULL,
  company VARCHAR(120),
  position VARCHAR(120),
  profile_image_url TEXT,
  content TEXT NOT NULL,
  rating INT DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS blog_posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(220) UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT,
  featured_image_url TEXT,
  author VARCHAR(120),
  category VARCHAR(80),
  tags JSONB DEFAULT '[]',
  seo_title VARCHAR(160),
  seo_description VARCHAR(300),
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS team_members (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  role VARCHAR(120),
  photo_url TEXT,
  bio TEXT,
  social_links JSONB DEFAULT '{}',
  order_index INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL,
  phone VARCHAR(40),
  company VARCHAR(160),
  service VARCHAR(120),
  budget VARCHAR(80),
  message TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS project_requests (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL,
  phone VARCHAR(40),
  company VARCHAR(160),
  service VARCHAR(120),
  project_type VARCHAR(120),
  budget VARCHAR(80),
  deadline VARCHAR(80),
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS site_settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(80) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO site_settings (key, value) VALUES
  ('company_info', '{"name":"Aerowix Group","tagline":"Building Digital Experiences That Move Businesses Forward.","description":"We build modern websites, powerful software, scalable applications, and digital strategies that help businesses grow.","email":"hello@aerowix.com","phone":"","address":"","social":{"facebook":"","instagram":"","linkedin":"","github":""}}'),
  ('stats', '{"projects_completed":0,"technologies_used":0,"clients_served":0,"years_experience":0}')
ON CONFLICT (key) DO NOTHING;
