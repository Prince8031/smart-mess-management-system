import { Router } from 'express';
import {
  getAdminDashboard,
  getManagerDashboard,
  getStudentDashboard,
} from '../controllers/dashboardController';
import { authenticateUser, authorizeRoles } from '../middleware/auth';

const router = Router();

router.use(authenticateUser);

router.get('/admin', authorizeRoles('admin'), getAdminDashboard);
router.get('/manager', authorizeRoles('admin', 'manager'), getManagerDashboard);
router.get('/student', authorizeRoles('student', 'admin', 'manager'), getStudentDashboard);

export default router;
