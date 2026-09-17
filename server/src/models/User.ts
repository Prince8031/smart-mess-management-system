import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'manager' | 'student';
  studentId?: string;
  phone?: string;
  profileImage?: string;
  isActive: boolean;
  roomNo?: string;
  hostelBlock?: string;
  messHall?: string;
  dietPreference?: 'Veg' | 'Non-Veg' | 'Jain';
  year?: string;
  branch?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false, // Never return password by default
    },
    role: {
      type: String,
      enum: ['admin', 'manager', 'student'],
      default: 'student',
    },
    studentId: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    profileImage: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    roomNo: {
      type: String,
      default: '',
    },
    hostelBlock: {
      type: String,
      default: '',
    },
    messHall: {
      type: String,
      default: 'Annapurna Dining Hall',
    },
    dietPreference: {
      type: String,
      enum: ['Veg', 'Non-Veg', 'Jain'],
      default: 'Veg',
    },
    year: {
      type: String,
      default: '2nd Year',
    },
    branch: {
      type: String,
      default: 'Computer Science',
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, any>) => {
        delete ret.password;
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Hash password before saving
UserSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', UserSchema);
