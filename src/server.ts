import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes';
import projectRoutes from './routes/projectRoutes';
import serviceRoutes from './routes/serviceRoutes';
import testimonialRoutes from './routes/testimonialRoutes';
import blogRoutes from './routes/blogRoutes';
import teamRoutes from './routes/teamRoutes';
import settingsRoutes from './routes/settingsRoutes';
import inquiryRoutes from './routes/inquiryRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import uploadRoutes from './routes/uploadRoutes';
import { getSitemap, getRobotsTxt } from './controllers/seoController';
import { notFound, errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();

app.use(helmet());

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim().replace(/\/$/, ''))
  : [];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.length === 0 || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));

// Basic rate limiting on public write endpoints (contact / project requests / login)
const writeLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30 });
app.use('/api/inquiries', writeLimiter);
app.use('/api/auth/login', rateLimit({ windowMs: 15 * 60 * 1000, max: 10 }));

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'aerowix-backend' }));

// Served at the API root so a reverse proxy can map them to /sitemap.xml
// and /robots.txt on the public domain (see README "Production SEO files").
app.get('/sitemap.xml', getSitemap);
app.get('/robots.txt', getRobotsTxt);

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/upload', uploadRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Aerowix API running on http://localhost:${PORT}`);
});
