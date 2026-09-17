import mongoose, { Document, Schema } from 'mongoose';

export interface IAuditLog extends Document {
  action: string;
  category: 'BILLING' | 'PAYMENT' | 'REBATE' | 'ATTENDANCE' | 'MENU' | 'INVENTORY' | 'SYSTEM';
  details: string;
  performedBy: string; // user name or id
  role: 'admin' | 'manager' | 'system';
  targetId?: string;
  metadata?: any;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    action: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['BILLING', 'PAYMENT', 'REBATE', 'ATTENDANCE', 'MENU', 'INVENTORY', 'SYSTEM'],
      required: true,
    },
    details: {
      type: String,
      required: true,
    },
    performedBy: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'manager', 'system'],
      default: 'admin',
    },
    targetId: {
      type: String,
      default: '',
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const AuditLog = mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
export default AuditLog;
