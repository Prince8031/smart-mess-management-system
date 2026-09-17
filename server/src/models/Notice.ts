import mongoose, { Document, Schema } from 'mongoose';

export interface INotice extends Document {
  title: string;
  description: string;
  priority: 'Normal' | 'Important' | 'Urgent';
  postedBy: string;
  authorRole?: string;
  targetAudience?: 'All' | 'Students' | 'Staff';
  date: string;
  createdAt: Date;
  updatedAt: Date;
}

const NoticeSchema = new Schema<INotice>(
  {
    title: {
      type: String,
      required: [true, 'Notice title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Notice description is required'],
      trim: true,
    },
    priority: {
      type: String,
      enum: ['Normal', 'Important', 'Urgent'],
      default: 'Normal',
    },
    postedBy: {
      type: String,
      default: 'Chief Mess Warden',
    },
    authorRole: {
      type: String,
      default: 'Admin',
    },
    targetAudience: {
      type: String,
      enum: ['All', 'Students', 'Staff'],
      default: 'All',
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

export const Notice = mongoose.model<INotice>('Notice', NoticeSchema);
