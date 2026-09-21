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

export const INITIAL_STUDENTS: User[] = [
  {
    id: 'stu-101',
    name: 'Amit Kumar',
    email: 'student@messsystem.com',
    role: 'student',
    studentId: 'STU-101',
    roomNo: 'A-204',
    hostelBlock: 'Block A (Boys)',
    messHall: 'Annapurna Hall',
    phone: '+91 98765 43210',
    dietPreference: 'Veg',
    status: 'Active',
    year: '2nd Year',
    branch: 'Computer Science'
  },
  {
    id: 'stu-102',
    name: 'Rohit Sharma',
    email: 'rohit.sharma@hostel.edu',
    role: 'student',
    studentId: 'STU-102',
    roomNo: 'B-118',
    hostelBlock: 'Block B (Boys)',
    messHall: 'Annapurna Hall',
    phone: '+91 91234 56789',
    dietPreference: 'Non-Veg',
    status: 'Active',
    year: '3rd Year',
    branch: 'Electrical Engineering'
  },
  {
    id: 'stu-103',
    name: 'Priya Singh',
    email: 'priya.singh@hostel.edu',
    role: 'student',
    studentId: 'STU-103',
    roomNo: 'C-305',
    hostelBlock: 'Block C (Girls)',
    messHall: 'Ganga Hall',
    phone: '+91 99887 66554',
    dietPreference: 'Jain',
    status: 'On Leave',
    year: '1st Year',
    branch: 'Mechanical Engineering'
  }
];

export const INITIAL_MANAGERS: User[] = [
  {
    id: 'mgr-1',
    name: 'Mess Manager',
    email: 'manager@messsystem.com',
    role: 'manager',
    phone: '+91 98000 11111',
    messHall: 'Annapurna Hall (Main Mess)',
    status: 'Active',
    branch: 'Day Shift (6:30 AM - 3:30 PM)'
  }
];

export const INITIAL_ADMIN: User = {
  id: 'admin-1',
  name: 'System Administrator',
  email: 'admin@messsystem.com',
  role: 'admin',
  phone: '',
  messHall: 'Hostel Administration',
  status: 'Active'
};

export const INITIAL_MENUS: MenuItem[] = [
  {
    id: 'menu-monday-breakfast',
    name: 'Healthy Morning Breakfast',
    category: 'Breakfast',
    items: ['Aalu Paratha', 'Curd', 'Tea', 'Banana'],
    timing: '7:30 AM - 9:30 AM',
    calories: 480,
    dietType: 'Veg',
    allergens: ['Milk'],
    dayOfWeek: 'Monday'
  },
  {
    id: 'menu-monday-lunch',
    name: 'North Indian Lunch',
    category: 'Lunch',
    items: ['Rice', 'Dal Tadka', 'Mix Veg', 'Roti', 'Salad'],
    timing: '12:30 PM - 2:30 PM',
    calories: 620,
    dietType: 'Veg',
    allergens: ['Wheat'],
    dayOfWeek: 'Monday'
  },
  {
    id: 'menu-monday-snacks',
    name: 'Evening Snacks',
    category: 'Snacks',
    items: ['Samosa', 'Tea', 'Fruit Bowl'],
    timing: '5:00 PM - 6:15 PM',
    calories: 280,
    dietType: 'Veg',
    allergens: ['Wheat', 'Milk'],
    dayOfWeek: 'Monday'
  },
  {
    id: 'menu-monday-dinner',
    name: 'Dinner Special',
    category: 'Dinner',
    items: ['Jeera Rice', 'Paneer Curry', 'Chapati', 'Cucumber Raita'],
    timing: '7:45 PM - 9:45 PM',
    calories: 650,
    dietType: 'Veg',
    allergens: ['Milk'],
    dayOfWeek: 'Monday'
  },
  {
    id: 'menu-tuesday-breakfast',
    name: 'Poha & Sweets',
    category: 'Breakfast',
    items: ['Poha', 'Upma', 'Aloo Bhaji', 'Tea'],
    timing: '7:30 AM - 9:30 AM',
    calories: 430,
    dietType: 'Veg',
    allergens: ['Wheat'],
    dayOfWeek: 'Tuesday'
  },
  {
    id: 'menu-tuesday-lunch',
    name: 'Protein Rich Lunch',
    category: 'Lunch',
    items: ['Rice', 'Rajma', 'Seasonal Sabji', 'Roti'],
    timing: '12:30 PM - 2:30 PM',
    calories: 610,
    dietType: 'Veg',
    allergens: ['Wheat'],
    dayOfWeek: 'Tuesday'
  },
  {
    id: 'menu-wednesday-dinner',
    name: 'Classic Dinner',
    category: 'Dinner',
    items: ['Biryani', 'Raita', 'Salad'],
    timing: '7:45 PM - 9:45 PM',
    calories: 700,
    dietType: 'Non-Veg',
    allergens: ['Milk'],
    dayOfWeek: 'Wednesday'
  }
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'inv-1',
    name: 'Rice',
    category: 'Grains & Pulses',
    quantity: 48,
    unit: 'kg',
    minimumStock: 50,
    status: 'Low Stock',
    lastRestocked: '2026-09-15',
    supplier: 'Campus Supply Co.',
    costPerUnit: 30
  },
  {
    id: 'inv-2',
    name: 'Onions',
    category: 'Vegetables & Fruits',
    quantity: 22,
    unit: 'kg',
    minimumStock: 15,
    status: 'In Stock',
    lastRestocked: '2026-09-14',
    supplier: 'Fresh Market',
    costPerUnit: 22
  },
  {
    id: 'inv-3',
    name: 'Milk',
    category: 'Dairy & Poultry',
    quantity: 14,
    unit: 'liters',
    minimumStock: 18,
    status: 'Low Stock',
    lastRestocked: '2026-09-15',
    supplier: 'Dairy Unit',
    costPerUnit: 38
  },
  {
    id: 'inv-4',
    name: 'Cooking Oil',
    category: 'Oils & Fats',
    quantity: 10,
    unit: 'liters',
    minimumStock: 8,
    status: 'In Stock',
    lastRestocked: '2026-09-12',
    supplier: 'Agro Depot',
    costPerUnit: 120
  }
];

export const INITIAL_COMPLAINTS: Complaint[] = [
  {
    id: 'comp-1',
    title: 'Water not filtered properly',
    description: 'The drinking water filter in Block A was not cleaned today in the evening.',
    studentId: 'stu-101',
    studentName: 'Amit Kumar',
    rollNo: 'STU-101',
    date: '2026-09-20',
    category: 'Hygiene',
    status: 'Pending',
    priority: 'Medium',
    adminNotes: 'Maintenance team notified. Pending inspection.'
  }
];

export const INITIAL_NOTICES: Notice[] = [
  {
    id: 'notice-1',
    title: 'Mess Menu Updated for This Week',
    description: 'New seasonal vegetables and healthy breakfast options have been added for the next 7 days.',
    date: '2026-09-20',
    postedBy: 'System Administrator',
    authorRole: 'Admin',
    priority: 'Important',
    targetAudience: 'All'
  }
];

export const INITIAL_BILLS: BillRecord[] = [
  {
    id: 'bill-1',
    studentId: 'stu-101',
    studentName: 'Amit Kumar',
    rollNo: 'STU-101',
    roomNo: 'A-204',
    hostelBlock: 'Block A (Boys)',
    month: 'September',
    monthNum: 9,
    year: 2026,
    breakfastCount: 18,
    lunchCount: 20,
    snacksCount: 12,
    dinnerCount: 19,
    breakfastRate: 30,
    lunchRate: 45,
    snacksRate: 20,
    dinnerRate: 45,
    breakfastAmount: 540,
    lunchAmount: 900,
    snacksAmount: 240,
    dinnerAmount: 855,
    subtotal: 2535,
    adjustment: 0,
    totalMeals: 69,
    totalAmount: 2535,
    paidAmount: 2000,
    dueAmount: 535,
    status: 'Partially Paid',
    dueDate: '2026-09-30',
    generatedAt: '2026-09-01',
    updatedAt: '2026-09-20'
  }
];

export const INITIAL_PAYMENTS: PaymentRecord[] = [
  {
    id: 'pay-1',
    transactionId: 'TXN-1001',
    studentId: 'stu-101',
    studentName: 'Amit Kumar',
    rollNo: 'STU-101',
    billId: 'bill-1',
    amount: 2000,
    date: '2026-09-18',
    method: 'Offline Receipt',
    status: 'Completed',
    referenceNo: 'OFF-1001'
  }
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att-1',
    studentId: 'stu-101',
    studentName: 'Amit Kumar',
    rollNo: 'STU-101',
    roomNo: 'A-204',
    date: '2026-09-20',
    breakfast: true,
    lunch: true,
    snacks: false,
    dinner: true,
    hostelBlock: 'Block A (Boys)',
    markedBy: 'Admin'
  },
  {
    id: 'att-2',
    studentId: 'stu-102',
    studentName: 'Rohit Sharma',
    rollNo: 'STU-102',
    roomNo: 'B-118',
    date: '2026-09-20',
    breakfast: true,
    lunch: false,
    snacks: true,
    dinner: true,
    hostelBlock: 'Block B (Boys)',
    markedBy: 'Admin'
  }
];

export const INITIAL_SETTINGS: MessSettings = {
  messName: 'Annapurna Central Dining Hall',
  collegeName: 'GEC Sheikhpura',
  hostelBlocks: ['Block A (Boys)', 'Block B (Boys)', 'Block C (Girls)', 'Block D (Girls)'],
  defaultMealRate: 55,
  latePaymentFee: 100,
  lateFeePerDay: 15,
  timings: [
    { meal: 'Breakfast', startTime: '07:30 AM', endTime: '09:30 AM', active: true },
    { meal: 'Lunch', startTime: '12:30 PM', endTime: '02:30 PM', active: true },
    { meal: 'Snacks', startTime: '05:00 PM', endTime: '06:15 PM', active: true },
    { meal: 'Dinner', startTime: '07:45 PM', endTime: '09:45 PM', active: true }
  ],
  allowMessCut: true,
  messCutMinHours: 24
};
