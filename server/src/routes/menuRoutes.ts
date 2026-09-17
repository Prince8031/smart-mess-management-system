import { Router } from 'express';
import {
  getMenu,
  getMenuById,
  createMenu,
  updateMenu,
  deleteMenu,
} from '../controllers/menuController';
import { authenticateUser, authorizeRoles } from '../middleware/auth';

const router = Router();

// Menu view is open to authenticated users (or public students)
router.get('/', getMenu);
router.get('/:id', getMenuById);

router.post('/', authenticateUser, authorizeRoles('admin', 'manager'), createMenu);
router.put('/:id', authenticateUser, authorizeRoles('admin', 'manager'), updateMenu);
router.delete('/:id', authenticateUser, authorizeRoles('admin', 'manager'), deleteMenu);

export default router;
