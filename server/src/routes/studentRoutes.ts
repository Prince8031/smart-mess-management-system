import { Router } from 'express';
import {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
} from '../controllers/studentController';
import { authenticateUser, authorizeRoles } from '../middleware/auth';

const router = Router();

router.use(authenticateUser);

router.get('/', getStudents);
router.get('/:id', getStudentById);
router.post('/', authorizeRoles('admin', 'manager'), createStudent);
router.put('/:id', authorizeRoles('admin', 'manager'), updateStudent);
router.delete('/:id', authorizeRoles('admin'), deleteStudent);

export default router;
