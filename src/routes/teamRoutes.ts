import { Router } from 'express';
import * as ctrl from '../controllers/teamController';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.get('/', ctrl.listPublicTeam);

router.get('/admin/all', requireAuth, ctrl.listAdminTeam);
router.post('/admin', requireAuth, ctrl.createTeamMember);
router.put('/admin/:id', requireAuth, ctrl.updateTeamMember);
router.delete('/admin/:id', requireAuth, ctrl.deleteTeamMember);

export default router;
