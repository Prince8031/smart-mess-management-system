import mongoose, { Document, Schema } from 'mongoose';

export interface IInventory extends Document {
  itemName: string;
  name: string; // alias for itemName
  category: string;
  quantity: number;
  unit: string;
  minimumStock: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  updatedBy: string;
  supplier?: string;
  costPerUnit?: number;
  lastRestocked?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InventorySchema = new Schema<IInventory>(
  {
    itemName: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: true,
      default: 'Grains & Pulses',
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    unit: {
      type: String,
      required: true,
      default: 'kg',
    },
    minimumStock: {
      type: Number,
      required: true,
      default: 10,
    },
    status: {
      type: String,
      enum: ['In Stock', 'Low Stock', 'Out of Stock'],
      default: 'In Stock',
    },
    updatedBy: {
      type: String,
      default: 'Mess Manager',
    },
    supplier: {
      type: String,
      default: 'Govt Agro Agency',
    },
    costPerUnit: {
      type: Number,
      default: 40,
    },
    lastRestocked: {
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
        ret.name = ret.itemName; // Provide both name and itemName
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Automatic status calculation
InventorySchema.pre('save', function () {
  if (this.quantity <= 0) {
    this.status = 'Out of Stock';
  } else if (this.quantity <= this.minimumStock) {
    this.status = 'Low Stock';
  } else {
    this.status = 'In Stock';
  }
});

export const Inventory = mongoose.model<IInventory>('Inventory', InventorySchema);
