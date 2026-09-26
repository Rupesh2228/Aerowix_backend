import { Router } from 'express';
import * as ctrl from '../controllers/projectsController';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Public
router.get('/', ctrl.listPublicProjects);
router.get('/featured', ctrl.getFeaturedProject);
router.get('/:slug', ctrl.getPublicProjectBySlug);

// Admin
router.get('/admin/all', requireAuth, ctrl.listAdminProjects);
router.get('/admin/:id', requireAuth, ctrl.getAdminProject);
router.post('/admin', requireAuth, ctrl.createProject);
router.put('/admin/:id', requireAuth, ctrl.updateProject);
router.patch('/admin/:id/status', requireAuth, ctrl.setProjectStatus);
router.delete('/admin/:id', requireAuth, ctrl.deleteProject);

export default router;
