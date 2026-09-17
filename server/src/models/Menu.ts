import mongoose, { Document, Schema } from 'mongoose';

export interface IMenu extends Document {
  name: string;
  category: 'Breakfast' | 'Lunch' | 'Snacks' | 'Dinner';
  items: string[];
  timing: string;
  calories: number;
  dietType: 'Veg' | 'Non-Veg' | 'Special';
  allergens: string[];
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  date?: string;
  breakfast?: string;
  lunch?: string;
  snacks?: string;
  dinner?: string;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MenuSchema = new Schema<IMenu>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['Breakfast', 'Lunch', 'Snacks', 'Dinner'],
      required: true,
    },
    items: {
      type: [String],
      default: [],
    },
    timing: {
      type: String,
      required: true,
    },
    calories: {
      type: Number,
      default: 450,
    },
    dietType: {
      type: String,
      enum: ['Veg', 'Non-Veg', 'Special'],
      default: 'Veg',
    },
    allergens: {
      type: [String],
      default: [],
    },
    dayOfWeek: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: true,
    },
    date: {
      type: String,
    },
    breakfast: {
      type: String,
    },
    lunch: {
      type: String,
    },
    snacks: {
      type: String,
    },
    dinner: {
      type: String,
    },
    createdBy: {
      type: String,
      default: 'Admin',
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

export const Menu = mongoose.model<IMenu>('Menu', MenuSchema);
