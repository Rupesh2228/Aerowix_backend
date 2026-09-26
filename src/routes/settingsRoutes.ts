import { Router } from 'express';
import * as ctrl from '../controllers/settingsController';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.get('/', ctrl.getPublicSettings);
router.put('/admin/:key', requireAuth, ctrl.updateSetting);

export default router;
