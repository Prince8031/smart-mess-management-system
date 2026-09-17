import mongoose, { Document, Schema } from 'mongoose';

export interface IStudentProfile extends Document {
  userId: mongoose.Types.ObjectId;
  studentId: string;
  name: string;
  department: string;
  semester: string;
  hostel: string;
  roomNumber: string;
  phone: string;
  email: string;
  dietPreference: 'Veg' | 'Non-Veg' | 'Jain';
  status: 'Active' | 'Inactive' | 'On Leave';
  createdAt: Date;
  updatedAt: Date;
}

const StudentProfileSchema = new Schema<IStudentProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    studentId: {
      type: String,
      required: [true, 'Student ID / Roll Number is required'],
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
    },
    department: {
      type: String,
      default: 'Computer Science',
    },
    semester: {
      type: String,
      default: 'Semester 4',
    },
    hostel: {
      type: String,
      default: 'Block A (Boys)',
    },
    roomNumber: {
      type: String,
      default: 'A-101',
    },
    phone: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    dietPreference: {
      type: String,
      enum: ['Veg', 'Non-Veg', 'Jain'],
      default: 'Veg',
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'On Leave'],
      default: 'Active',
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

export const StudentProfile = mongoose.model<IStudentProfile>('StudentProfile', StudentProfileSchema);
