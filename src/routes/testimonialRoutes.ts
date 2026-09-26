import { Router } from 'express';
import * as ctrl from '../controllers/testimonialsController';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.get('/', ctrl.listPublicTestimonials);

router.get('/admin/all', requireAuth, ctrl.listAdminTestimonials);
router.post('/admin', requireAuth, ctrl.createTestimonial);
router.put('/admin/:id', requireAuth, ctrl.updateTestimonial);
router.delete('/admin/:id', requireAuth, ctrl.deleteTestimonial);

export default router;
