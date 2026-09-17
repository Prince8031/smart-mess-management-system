import { Router } from 'express';
import {
  getMyBills,
  getBillById,
  getBillsByMonth,
  getStudentBills,
  generateMonthlyBill,
  recalculateBill,
  updateBillStatus,
  updateBillAdjustment,
  getMonthlyBillingReport,
  exportMonthlyBillingReport,
  getMealRates,
  updateMealRates,
  getBills,
  createBill,
  updateBill,
} from '../controllers/billController';
import { authenticateUser, authorizeRoles } from '../middleware/auth';

const router = Router();

router.use(authenticateUser);

// Student: view own bills only
router.get('/my', getMyBills);

// Settings / Rates
router.get('/rates', getMealRates);
router.put('/rates', authorizeRoles('admin'), updateMealRates);

// Reports & Export (Monthly only)
router.get('/reports/monthly', authorizeRoles('admin', 'manager'), getMonthlyBillingReport);
router.get('/export', authorizeRoles('admin', 'manager'), exportMonthlyBillingReport);

// Month-based bills list
router.get('/month/:year/:month', authorizeRoles('admin', 'manager'), getBillsByMonth);

// Student bills by studentId
router.get('/student/:studentId', getStudentBills);

// Monthly Bill generation & recalculation (Admin and Manager only)
router.post('/generate', authorizeRoles('admin', 'manager'), generateMonthlyBill);
router.post('/recalculate/:id', authorizeRoles('admin', 'manager'), recalculateBill);

// Manual Payment Status & Adjustment
router.patch('/:id/status', authorizeRoles('admin', 'manager'), updateBillStatus);
router.patch('/:id/adjustment', authorizeRoles('admin', 'manager'), updateBillAdjustment);

// Single bill view (Student owns or Staff)
router.get('/:id', getBillById);

// General list & legacy routes
router.get('/', authorizeRoles('admin', 'manager'), getBills);
router.post('/', authorizeRoles('admin', 'manager'), createBill);
router.put('/:id', authorizeRoles('admin', 'manager'), updateBill);

export default router;
