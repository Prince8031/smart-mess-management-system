import { Router } from 'express';
import {
  getNotices,
  createNotice,
  updateNotice,
  deleteNotice,
} from '../controllers/noticeController';
import { authenticateUser, authorizeRoles } from '../middleware/auth';

const router = Router();

// Viewing notices is accessible to authenticated users
router.get('/', authenticateUser, getNotices);

// Posting/updating/deleting notices is for admin/manager
router.post('/', authenticateUser, authorizeRoles('admin', 'manager'), createNotice);
router.put('/:id', authenticateUser, authorizeRoles('admin', 'manager'), updateNotice);
router.delete('/:id', authenticateUser, authorizeRoles('admin', 'manager'), deleteNotice);

export default router;
