import mongoose, { Document, Schema } from 'mongoose';

export interface ISettings extends Document {
  messName: string;
  collegeName: string;
  hostelBlocks: string[];
  defaultMealRate: number;
  mealRates: {
    breakfast: number;
    lunch: number;
    snacks: number;
    dinner: number;
  };
  latePaymentFee: number;
  lateFeePerDay: number;
  allowMessCut: boolean;
  messCutMinHours: number;
  minDaysForMessCut: number;
  timings: Array<{
    meal: string;
    startTime: string;
    endTime: string;
    active: boolean;
  }>;
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>(
  {
    messName: { type: String, default: 'Annapurna Central Dining Hall' },
    collegeName: { type: String, default: 'National Institute of Technology' },
    hostelBlocks: {
      type: [String],
      default: ['Block A (Boys)', 'Block B (Boys)', 'Block C (Girls)', 'Block D (Girls)'],
    },
    defaultMealRate: { type: Number, default: 55 },
    mealRates: {
      breakfast: { type: Number, default: 20, min: 0 },
      lunch: { type: Number, default: 40, min: 0 },
      snacks: { type: Number, default: 15, min: 0 },
      dinner: { type: Number, default: 40, min: 0 },
    },
    latePaymentFee: { type: Number, default: 100 },
    lateFeePerDay: { type: Number, default: 15 },
    allowMessCut: { type: Boolean, default: true },
    messCutMinHours: { type: Number, default: 24 },
    minDaysForMessCut: { type: Number, default: 3 },
    timings: {
      type: [
        {
          meal: { type: String },
          startTime: { type: String },
          endTime: { type: String },
          active: { type: Boolean, default: true },
        },
      ],
      default: [
        { meal: 'Breakfast', startTime: '07:30 AM', endTime: '09:30 AM', active: true },
        { meal: 'Lunch', startTime: '12:30 PM', endTime: '02:30 PM', active: true },
        { meal: 'Snacks', startTime: '05:00 PM', endTime: '06:15 PM', active: true },
        { meal: 'Dinner', startTime: '07:45 PM', endTime: '09:45 PM', active: true },
      ],
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

export const Settings = mongoose.model<ISettings>('Settings', SettingsSchema);
