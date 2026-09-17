import mongoose, { Document, Schema } from 'mongoose';

export interface IComplaint extends Document {
  studentId: string;
  studentName: string;
  rollNo: string;
  title: string;
  description: string;
  category: string;
  priority: 'Normal' | 'Urgent' | 'Low' | 'Medium' | 'High';
  status: 'Pending' | 'In Progress' | 'Resolved';
  response?: string;
  resolutionNotes?: string;
  adminNotes?: string;
  date: string;
  createdAt: Date;
  updatedAt: Date;
}

const ComplaintSchema = new Schema<IComplaint>(
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
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    category: {
      type: String,
      required: true,
      default: 'Food Quality',
    },
    priority: {
      type: String,
      enum: ['Normal', 'Urgent', 'Low', 'Medium', 'High'],
      default: 'Normal',
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Resolved'],
      default: 'Pending',
    },
    response: {
      type: String,
      default: '',
    },
    resolutionNotes: {
      type: String,
      default: '',
    },
    adminNotes: {
      type: String,
      default: '',
    },
    date: {
      type: String,
      default: () => new Date().toISOString().split('T')[0],
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

export const Complaint = mongoose.model<IComplaint>('Complaint', ComplaintSchema);
