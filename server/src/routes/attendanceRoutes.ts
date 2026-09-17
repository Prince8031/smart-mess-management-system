import { Router } from 'express';
import {
  getAttendance,
  getTodayAttendance,
  getAttendanceReport,
  getStudentAttendance,
  getStudentSummary,
  markAttendance,
  updateAttendance,
  patchMealAttendance,
  deleteAttendance,
} from '../controllers/attendanceController';
import { authenticateUser, authorizeRoles } from '../middleware/auth';

const router = Router();

// Protect all attendance routes with authentication
router.use(authenticateUser);

// Today's summary (accessible to all logged-in users for dashboards)
router.get('/today', getTodayAttendance);

// Overall attendance listing and reports (Admin and Manager)
router.get('/', authorizeRoles('admin', 'manager'), getAttendance);
router.get('/report', authorizeRoles('admin', 'manager'), getAttendanceReport);

// Student individual attendance and monthly summary (Student checks own, Admin/Manager checks any)
router.get('/student/:studentId', getStudentAttendance);
router.get('/student/:studentId/summary', getStudentSummary);

// Mark / Update / Correct Attendance (Admin and Manager)
router.post('/', authorizeRoles('admin', 'manager'), markAttendance);
router.put('/:id', authorizeRoles('admin', 'manager'), updateAttendance);
router.patch('/:id/meal', authorizeRoles('admin', 'manager'), patchMealAttendance);

// Delete record (Admin only)
router.delete('/:id', authorizeRoles('admin'), deleteAttendance);

export default router;
