import { Router } from 'express';
import {
  getComplaints,
  getStudentComplaints,
  createComplaint,
  updateComplaint,
} from '../controllers/complaintController';
import { authenticateUser, authorizeRoles } from '../middleware/auth';

const router = Router();

router.use(authenticateUser);

router.get('/', getComplaints);
router.get('/student/:studentId', getStudentComplaints);
router.post('/', createComplaint);
router.put('/:id', authorizeRoles('admin', 'manager'), updateComplaint);

export default router;
