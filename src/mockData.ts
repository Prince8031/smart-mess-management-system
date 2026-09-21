import {
  User,
  MenuItem,
  AttendanceRecord,
  BillRecord,
  PaymentRecord,
  InventoryItem,
  Complaint,
  Notice,
  MessSettings
} from './types';

export const INITIAL_STUDENTS: User[] = [];

export const INITIAL_MANAGERS: User[] = [];

export const INITIAL_ADMIN: User = {
  id: 'admin-1',
  name: 'System Administrator',
  email: 'admin@messsystem.com',
  role: 'admin',
  phone: '',
  messHall: 'Hostel Administration',
  status: 'Active'
};

export const INITIAL_MENUS: MenuItem[] = [];

export const INITIAL_INVENTORY: InventoryItem[] = [];

export const INITIAL_COMPLAINTS: Complaint[] = [];

export const INITIAL_NOTICES: Notice[] = [];

export const INITIAL_BILLS: BillRecord[] = [];

export const INITIAL_PAYMENTS: PaymentRecord[] = [];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [];

export const INITIAL_SETTINGS: MessSettings = {
  messName: '',
  collegeName: '',
  hostelBlocks: [],
  defaultMealRate: 0,
  latePaymentFee: 0,
  timings: [],
  allowMessCut: false,
  messCutMinHours: 0
};
