import { Router } from 'express';
import {
  getInventory,
  createInventory,
  updateInventory,
  deleteInventory,
} from '../controllers/inventoryController';
import { authenticateUser, authorizeRoles } from '../middleware/auth';

const router = Router();

router.use(authenticateUser);

router.get('/', getInventory);
router.post('/', authorizeRoles('admin', 'manager'), createInventory);
router.put('/:id', authorizeRoles('admin', 'manager'), updateInventory);
router.delete('/:id', authorizeRoles('admin', 'manager'), deleteInventory);

export default router;
