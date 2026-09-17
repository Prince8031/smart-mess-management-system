export type UserRole = 'admin' | 'manager' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  studentId?: string;
  roomNo?: string;
  hostelBlock?: string;
  messHall?: string;
  phone?: string;
  dietPreference?: 'Veg' | 'Non-Veg' | 'Jain';
  status: 'Active' | 'Inactive' | 'On Leave';
  year?: string;
  branch?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  category: 'Breakfast' | 'Lunch' | 'Snacks' | 'Dinner';
  items: string[];
  timing: string;
  calories?: number;
  dietType: 'Veg' | 'Non-Veg' | 'Special';
  allergens?: string[];
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  date?: string; // YYYY-MM-DD
}

export interface MealStatusDetail {
  status: boolean;
  markedAt?: string | null;
  markedBy?: string | null;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  roomNo?: string;
  date: string; // YYYY-MM-DD
  breakfast: boolean;
  lunch: boolean;
  snacks: boolean;
  dinner: boolean;
  breakfastDetail?: MealStatusDetail;
  lunchDetail?: MealStatusDetail;
  snacksDetail?: MealStatusDetail;
  dinnerDetail?: MealStatusDetail;
  totalPresent?: number;
  totalMeals?: number;
  hostelBlock: string;
  markedBy?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface MealCountStats {
  present: number;
  absent: number;
  total?: number;
  percentage?: number;
}

export interface TodayAttendanceStats {
  date: string;
  totalStudents: number;
  breakfast: MealCountStats;
  lunch: MealCountStats;
  snacks: MealCountStats;
  dinner: MealCountStats;
  totalMealsServed: number;
  possibleMeals: number;
  attendancePercentage: number;
}

export interface StudentAttendanceSummary {
  studentId: string;
  studentName: string;
  totalDays: number;
  totalScheduledMeals: number;
  totalPresentMeals: number;
  breakfast: { present: number; total: number; percentage: number };
  lunch: { present: number; total: number; percentage: number };
  snacks: { present: number; total: number; percentage: number };
  dinner: { present: number; total: number; percentage: number };
  overallPercentage: number;
}

export interface StudentReportRow {
  studentName: string;
  studentId: string;
  rollNo: string;
  roomNo: string;
  hostelBlock: string;
  totalDays: number;
  breakfastPercentage: number;
  lunchPercentage: number;
  snacksPercentage: number;
  dinnerPercentage: number;
  overallPercentage: number;
}

export interface AttendanceReportData {
  summary: {
    totalStudents: number;
    totalMeals: number;
    presentMeals: number;
    absentMeals: number;
    attendancePercentage: number;
    startDate: string;
    endDate: string;
  };
  students: StudentReportRow[];
}

export interface MealRates {
  breakfast: number;
  lunch: number;
  snacks: number;
  dinner: number;
}

export interface BillRecord {
  id: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  roomNo?: string;
  hostelBlock?: string;
  month: string | number; // e.g. "September 2026" or 9
  monthNum?: number;
  monthName?: string;
  year: number;
  breakfastCount?: number;
  lunchCount?: number;
  snacksCount?: number;
  dinnerCount?: number;
  breakfastRate?: number;
  lunchRate?: number;
  snacksRate?: number;
  dinnerRate?: number;
  breakfastAmount?: number;
  lunchAmount?: number;
  snacksAmount?: number;
  dinnerAmount?: number;
  subtotal?: number;
  adjustment?: number;
  adjustmentReason?: string;
  adjustedBy?: string;
  adjustedAt?: string;
  totalMeals: number;
  ratePerMeal?: number;
  extraCharges?: number;
  discount?: number;
  totalAmount: number;
  paidAmount?: number;
  dueAmount?: number;
  status: 'PAID' | 'PENDING' | 'Paid' | 'Pending' | 'Overdue' | 'Partially Paid';
  dueDate?: string;
  paidAt?: string | null;
  paidByName?: string;
  generatedAt?: string;
  generatedByName?: string;
  updatedAt?: string;
  updatedByName?: string;
}

export interface PaymentRecord {
  id: string;
  transactionId: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  billId?: string;
  amount: number;
  date: string;
  method: 'Cash' | 'Counter Cash' | 'Bank Challan' | 'Office Deposit' | 'Offline Receipt';
  status: 'Completed' | 'Pending' | 'Failed';
  referenceNo?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Grains & Pulses' | 'Vegetables & Fruits' | 'Dairy & Poultry' | 'Spices & Condiments' | 'Oils & Fats' | 'Beverages & Snacks' | 'Cleaning & Hygiene' | 'Gas & Fuel';
  quantity: number;
  unit: 'kg' | 'liters' | 'packets' | 'cylinders' | 'bags' | 'units' | 'dozen';
  minimumStock: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  lastRestocked: string;
  supplier?: string;
  costPerUnit?: number;
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  date: string;
  category: string;
  status: 'Pending' | 'In Progress' | 'Resolved';
  priority: 'Normal' | 'Urgent' | 'Low' | 'Medium' | 'High';
  resolutionNotes?: string;
  response?: string;
  adminNotes?: string;
  resolvedAt?: string;
}

export interface Notice {
  id: string;
  title: string;
  description: string;
  date: string;
  postedBy: string;
  authorRole?: 'Admin' | 'Mess Manager' | string;
  priority: 'Normal' | 'Important' | 'Urgent';
  targetAudience: 'All' | 'Students' | 'Staff';
  attachment?: string;
}

export interface MessTiming {
  meal: 'Breakfast' | 'Lunch' | 'Snacks' | 'Dinner';
  startTime: string;
  endTime: string;
  active: boolean;
}

export interface MessSettings {
  messName: string;
  collegeName: string;
  hostelBlocks: string[];
  defaultMealRate: number;
  latePaymentFee: number;
  lateFeePerDay?: number;
  timings: MessTiming[] | any;
  allowMessCut: boolean;
  messCutMinHours: number;
  minDaysForMessCut?: number;
}
