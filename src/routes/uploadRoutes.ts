import { Router } from 'express';
import { upload } from '../middleware/upload';
import { handleUpload } from '../controllers/uploadController';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.post('/', requireAuth, upload.single('file'), handleUpload);
export default router;
