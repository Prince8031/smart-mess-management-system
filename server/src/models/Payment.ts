import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
  studentId: string;
  studentName: string;
  rollNo: string;
  billId?: string;
  amount: number;
  paymentMethod: 'UPI' | 'Credit Card' | 'Debit Card' | 'Net Banking' | 'Cash' | string;
  transactionId: string;
  status: 'Completed' | 'Pending' | 'Failed' | string;
  paidAt: Date;
  referenceNo?: string;
  date?: string;
}

const PaymentSchema = new Schema<IPayment>(
  {
    studentId: {
      type: String,
      required: true,
      index: true,
    },
    studentName: {
      type: String,
      default: '',
    },
    rollNo: {
      type: String,
      default: '',
    },
    billId: {
      type: String,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [1, 'Amount must be greater than 0'],
    },
    paymentMethod: {
      type: String,
      required: true,
      default: 'UPI',
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Completed', 'Pending', 'Failed', 'completed', 'pending', 'failed'],
      default: 'Completed',
    },
    paidAt: {
      type: Date,
      default: Date.now,
    },
    referenceNo: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, any>) => {
        ret.id = ret._id;
        ret.date = ret.paidAt ? new Date(ret.paidAt).toISOString().split('T')[0] : '';
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);
