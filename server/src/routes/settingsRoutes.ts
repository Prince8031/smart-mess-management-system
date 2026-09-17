import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController';
import { authenticateUser, authorizeRoles } from '../middleware/auth';

const router = Router();

router.use(authenticateUser);

router.get('/', getSettings);
router.put('/', authorizeRoles('admin'), updateSettings);

export default router;
