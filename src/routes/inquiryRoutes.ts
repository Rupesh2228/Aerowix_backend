import { Router } from 'express';
import * as ctrl from '../controllers/inquiriesController';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Public submissions
router.post('/contact', ctrl.submitContactMessage);
router.post('/project-request', ctrl.submitProjectRequest);

// Admin
router.get('/admin/contact', requireAuth, ctrl.listAdminContactMessages);
router.patch('/admin/contact/:id/status', requireAuth, ctrl.updateContactStatus);
router.delete('/admin/contact/:id', requireAuth, ctrl.deleteContactMessage);

router.get('/admin/project-requests', requireAuth, ctrl.listAdminProjectRequests);
router.patch('/admin/project-requests/:id/status', requireAuth, ctrl.updateProjectRequestStatus);
router.delete('/admin/project-requests/:id', requireAuth, ctrl.deleteProjectRequest);

export default router;
