import { Router } from 'express';
import { getPayments, recordPayment } from '../controllers/paymentController';
import { authenticateUser } from '../middleware/auth';

const router = Router();

router.use(authenticateUser);

router.get('/', getPayments);
router.post('/', recordPayment);

export default router;
