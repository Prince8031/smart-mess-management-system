import mongoose, { Document, Schema } from 'mongoose';

export interface IRebate extends Document {
  studentId: any;
  studentName: string;
  rollNo: string;
  hostelBlock?: string;
  roomNo?: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  days: number;
  reasonCategory: 'Medical Leave' | 'College Leave' | 'Hostel Leave' | 'Approved Absence' | 'Other';
  reasonDescription: string;
  approvedBy?: any;
  approvedByName?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  deductionAmount: number; // e.g. estimated rebate amount
  appliedToMonth?: number; // 1-12
  appliedToYear?: number;
  appliedToBillId?: any;
  createdAt: Date;
  updatedAt: Date;
}

const RebateSchema = new Schema<IRebate>(
  {
    studentId: {
      type: Schema.Types.Mixed,
      required: true,
      index: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    rollNo: {
      type: String,
      required: true,
      index: true,
    },
    hostelBlock: {
      type: String,
      default: 'Hostel 2',
    },
    roomNo: {
      type: String,
      default: '',
    },
    startDate: {
      type: String,
      required: true,
    },
    endDate: {
      type: String,
      required: true,
    },
    days: {
      type: Number,
      required: true,
      min: 1,
    },
    reasonCategory: {
      type: String,
      enum: ['Medical Leave', 'College Leave', 'Hostel Leave', 'Approved Absence', 'Other'],
      default: 'Approved Absence',
    },
    reasonDescription: {
      type: String,
      default: '',
    },
    approvedBy: {
      type: Schema.Types.Mixed,
      default: null,
    },
    approvedByName: {
      type: String,
      default: 'Mess Warden',
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'APPROVED',
    },
    deductionAmount: {
      type: Number,
      default: 0,
    },
    appliedToMonth: {
      type: Number,
    },
    appliedToYear: {
      type: Number,
    },
    appliedToBillId: {
      type: Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Rebate = mongoose.models.Rebate || mongoose.model<IRebate>('Rebate', RebateSchema);
export default Rebate;
