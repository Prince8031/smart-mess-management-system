import mongoose, { Document, Schema } from 'mongoose';

export interface IBill extends Document {
  studentId: any;
  studentName: string;
  rollNo: string;
  roomNo?: string;
  hostelBlock?: string;

  month: number; // 1 - 12
  year: number; // e.g. 2026
  monthName?: string; // e.g. "September 2026"

  breakfastCount: number;
  lunchCount: number;
  snacksCount: number;
  dinnerCount: number;

  breakfastRate: number;
  lunchRate: number;
  snacksRate: number;
  dinnerRate: number;

  breakfastAmount: number;
  lunchAmount: number;
  snacksAmount: number;
  dinnerAmount: number;

  subtotal: number;
  adjustment: number;
  adjustmentReason?: string;
  adjustedBy?: any;
  adjustedAt?: Date | null;
  totalAmount: number;

  status: 'PENDING' | 'PAID' | 'pending' | 'paid' | 'partial' | 'Partially Paid' | 'Overdue';

  paidAt?: Date | null;
  paidBy?: any;
  paidByName?: string;

  generatedAt: Date;
  generatedBy?: any;
  generatedByName?: string;

  updatedAt: Date;
  updatedBy?: any;
  updatedByName?: string;

  // Backward compatibility fields
  mealCount: number;
  totalMeals: number;
  ratePerMeal: number;
  extraCharges: number;
  discount: number;
  paidAmount: number;
  dueAmount: number;
  dueDate?: string;
  createdAt: Date;
}

const BillSchema = new Schema<IBill>(
  {
    studentId: {
      type: Schema.Types.Mixed,
      required: true,
      index: true,
    },
    studentName: {
      type: String,
      default: '',
    },
    rollNo: {
      type: String,
      required: true,
      index: true,
    },
    roomNo: {
      type: String,
      default: 'H2-101',
    },
    hostelBlock: {
      type: String,
      default: 'Hostel 2 (Boys)',
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
      default: 2026,
    },
    monthName: {
      type: String,
      default: '',
    },

    // Meal Counts
    breakfastCount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    lunchCount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    snacksCount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    dinnerCount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    // Meal Rates
    breakfastRate: {
      type: Number,
      required: true,
      default: 20,
      min: 0,
    },
    lunchRate: {
      type: Number,
      required: true,
      default: 40,
      min: 0,
    },
    snacksRate: {
      type: Number,
      required: true,
      default: 15,
      min: 0,
    },
    dinnerRate: {
      type: Number,
      required: true,
      default: 40,
      min: 0,
    },

    // Amounts
    breakfastAmount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    lunchAmount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    snacksAmount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    dinnerAmount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    subtotal: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    adjustment: {
      type: Number,
      default: 0,
    },
    adjustmentReason: {
      type: String,
      default: '',
    },
    adjustedBy: {
      type: Schema.Types.Mixed,
      default: null,
    },
    adjustedAt: {
      type: Date,
      default: null,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ['PENDING', 'PAID', 'pending', 'paid', 'partial', 'Partially Paid', 'Overdue'],
      default: 'PENDING',
    },

    paidAt: {
      type: Date,
      default: null,
    },
    paidBy: {
      type: Schema.Types.Mixed,
      default: null,
    },
    paidByName: {
      type: String,
      default: '',
    },

    generatedAt: {
      type: Date,
      default: Date.now,
    },
    generatedBy: {
      type: Schema.Types.Mixed,
      default: null,
    },
    generatedByName: {
      type: String,
      default: 'Admin',
    },

    updatedBy: {
      type: Schema.Types.Mixed,
      default: null,
    },
    updatedByName: {
      type: String,
      default: '',
    },

    // Legacy fields
    mealCount: {
      type: Number,
      default: 0,
    },
    totalMeals: {
      type: Number,
      default: 0,
    },
    ratePerMeal: {
      type: Number,
      default: 55,
    },
    extraCharges: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    dueAmount: {
      type: Number,
      default: 0,
    },
    dueDate: {
      type: String,
      default: '2026-10-05',
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, any>) => {
        ret.id = ret._id;
        // Total meals sum
        const mealsTotal =
          (ret.breakfastCount || 0) +
          (ret.lunchCount || 0) +
          (ret.snacksCount || 0) +
          (ret.dinnerCount || 0);
        ret.totalMeals = ret.totalMeals || mealsTotal || ret.mealCount;
        ret.mealCount = ret.totalMeals;

        // Ensure month string representation for frontend legacy views
        const monthNames = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];
        if (typeof ret.month === 'number' && ret.month >= 1 && ret.month <= 12) {
          ret.monthName = `${monthNames[ret.month - 1]} ${ret.year}`;
          // Keep ret.month display friendly if needed by legacy
          ret.monthDisplay = ret.monthName;
        }

        // Normalize status to uppercase standard
        if (ret.status === 'paid' || ret.status === 'Paid') ret.status = 'PAID';
        if (ret.status === 'pending' || ret.status === 'Pending') ret.status = 'PENDING';

        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound unique index to prevent duplicate monthly bills for the same student
BillSchema.index({ studentId: 1, month: 1, year: 1 }, { unique: true });

BillSchema.pre('save', function () {
  const bf = Number(this.breakfastCount) || 0;
  const lu = Number(this.lunchCount) || 0;
  const sn = Number(this.snacksCount) || 0;
  const di = Number(this.dinnerCount) || 0;

  const bfr = Number(this.breakfastRate) || 0;
  const lur = Number(this.lunchRate) || 0;
  const snr = Number(this.snacksRate) || 0;
  const dir = Number(this.dinnerRate) || 0;

  this.breakfastAmount = bf * bfr;
  this.lunchAmount = lu * lur;
  this.snacksAmount = sn * snr;
  this.dinnerAmount = di * dir;

  this.subtotal = this.breakfastAmount + this.lunchAmount + this.snacksAmount + this.dinnerAmount;
  const adj = Number(this.adjustment) || 0;
  this.totalAmount = Math.max(0, this.subtotal + adj);

  const totalM = bf + lu + sn + di;
  this.totalMeals = totalM || this.totalMeals || this.mealCount;
  this.mealCount = this.totalMeals;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  if (typeof this.month === 'number' && this.month >= 1 && this.month <= 12) {
    this.monthName = `${monthNames[this.month - 1]} ${this.year}`;
  }

  // Normalize status
  if (String(this.status).toUpperCase() === 'PAID') {
    this.status = 'PAID';
    this.paidAmount = this.totalAmount;
    this.dueAmount = 0;
  } else {
    this.status = 'PENDING';
    this.paidAmount = 0;
    this.dueAmount = this.totalAmount;
  }
});

export const Bill = mongoose.model<IBill>('Bill', BillSchema);

