import mongoose, { Document, Schema } from 'mongoose';

export interface IMealStatus {
  status: boolean;
  markedAt?: Date | null;
  markedBy?: mongoose.Types.ObjectId | null;
}

export interface IAttendance extends Document {
  studentId: mongoose.Types.ObjectId;
  date: Date;
  dateString: string;
  breakfast: IMealStatus;
  lunch: IMealStatus;
  snacks: IMealStatus;
  dinner: IMealStatus;
  totalPresent: number;
  totalMeals: number;
  studentName?: string;
  rollNo?: string;
  hostelBlock?: string;
  roomNo?: string;
  updatedBy?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const MealStatusSchema = new Schema<IMealStatus>(
  {
    status: {
      type: Boolean,
      default: false,
    },
    markedAt: {
      type: Date,
      default: null,
    },
    markedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { _id: false }
);

const AttendanceSchema = new Schema<IAttendance>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'studentId is required'],
      index: true,
    },
    date: {
      type: Date,
      required: [true, 'date is required'],
      index: true,
    },
    dateString: {
      type: String,
      index: true,
    },
    breakfast: {
      type: MealStatusSchema,
      default: () => ({ status: false, markedAt: null, markedBy: null }),
    },
    lunch: {
      type: MealStatusSchema,
      default: () => ({ status: false, markedAt: null, markedBy: null }),
    },
    snacks: {
      type: MealStatusSchema,
      default: () => ({ status: false, markedAt: null, markedBy: null }),
    },
    dinner: {
      type: MealStatusSchema,
      default: () => ({ status: false, markedAt: null, markedBy: null }),
    },
    totalPresent: {
      type: Number,
      default: 0,
    },
    totalMeals: {
      type: Number,
      default: 4,
    },
    studentName: {
      type: String,
      default: '',
    },
    rollNo: {
      type: String,
      default: '',
      index: true,
    },
    hostelBlock: {
      type: String,
      default: 'Hostel 2 (Boys)',
    },
    roomNo: {
      type: String,
      default: 'H2-101',
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, any>) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound index to prevent duplicate attendance records for the same student on the same date
AttendanceSchema.index({ studentId: 1, date: 1 }, { unique: true });
AttendanceSchema.index({ studentId: 1, dateString: 1 });

AttendanceSchema.pre('save', function () {
  let count = 0;
  if (this.breakfast && this.breakfast.status) count++;
  if (this.lunch && this.lunch.status) count++;
  if (this.snacks && this.snacks.status) count++;
  if (this.dinner && this.dinner.status) count++;
  this.totalPresent = count;
  this.totalMeals = 4;

  if (this.date && !this.dateString) {
    const d = new Date(this.date);
    this.dateString = d.toISOString().split('T')[0];
  }
});

export const Attendance = mongoose.model<IAttendance>('Attendance', AttendanceSchema);
