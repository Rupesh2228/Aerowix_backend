import { Router } from 'express';
import * as ctrl from '../controllers/blogController';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.get('/', ctrl.listPublicPosts);
router.get('/:slug', ctrl.getPublicPostBySlug);

router.get('/admin/all', requireAuth, ctrl.listAdminPosts);
router.post('/admin', requireAuth, ctrl.createPost);
router.put('/admin/:id', requireAuth, ctrl.updatePost);
router.delete('/admin/:id', requireAuth, ctrl.deletePost);

export default router;
