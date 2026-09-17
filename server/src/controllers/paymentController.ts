import { Request, Response, NextFunction } from 'express';
import { Payment } from '../models/Payment';
import { Bill } from '../models/Bill';
import { StudentProfile } from '../models/StudentProfile';

export const getPayments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { studentId, billId, status } = req.query;
    const filter: Record<string, any> = {};

    if (studentId) {
      filter.$or = [{ studentId }, { rollNo: studentId }];
    }

    if (billId) {
      filter.billId = billId;
    }

    if (status) {
      filter.status = status;
    }

    const payments = await Payment.find(filter).sort({ paidAt: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      data: payments,
    });
  } catch (error) {
    next(error);
  }
};

export const recordPayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { studentId, rollNo, billId, amount, paymentMethod, transactionId, referenceNo } = req.body;

    const resolvedRoll = rollNo || studentId;
    if (!resolvedRoll || !amount) {
      res.status(400).json({
        success: false,
        message: 'Student identifier and amount are required.',
      });
      return;
    }

    const student = await StudentProfile.findOne({
      $or: [{ studentId: resolvedRoll }, { studentId }],
    });

    const txId = transactionId || `TXN-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const payment = await Payment.create({
      studentId: student?.studentId || resolvedRoll,
      rollNo: student?.studentId || resolvedRoll,
      studentName: student?.name || 'Student',
      billId,
      amount: Number(amount),
      paymentMethod: paymentMethod || 'UPI',
      transactionId: txId,
      referenceNo: referenceNo || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'Completed',
      paidAt: new Date(),
    });

    // Update associated Bill if billId is supplied
    if (billId) {
      const bill = await Bill.findOne({
        $or: [{ _id: billId }, { id: billId }],
      });

      if (bill) {
        bill.paidAmount = (bill.paidAmount || 0) + Number(amount);
        bill.dueAmount = Math.max(0, bill.totalAmount - bill.paidAmount);
        if (bill.dueAmount <= 0) {
          bill.status = 'paid';
        } else {
          bill.status = 'partial';
        }
        await bill.save();
      }
    }

    res.status(201).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};
