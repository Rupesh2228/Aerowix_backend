import { Router } from 'express';
import * as ctrl from '../controllers/servicesController';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.get('/', ctrl.listPublicServices);
router.get('/:slug', ctrl.getPublicServiceBySlug);

router.get('/admin/all', requireAuth, ctrl.listAdminServices);
router.post('/admin', requireAuth, ctrl.createService);
router.put('/admin/:id', requireAuth, ctrl.updateService);
router.delete('/admin/:id', requireAuth, ctrl.deleteService);
router.post('/admin/reorder', requireAuth, ctrl.reorderServices);

export default router;
