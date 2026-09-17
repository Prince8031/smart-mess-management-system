import { User } from '../models/User';
import { StudentProfile } from '../models/StudentProfile';
import { Menu } from '../models/Menu';
import { Attendance } from '../models/Attendance';
import { Bill } from '../models/Bill';
import { Payment } from '../models/Payment';
import { Inventory } from '../models/Inventory';
import { Complaint } from '../models/Complaint';
import { Notice } from '../models/Notice';
import { Settings } from '../models/Settings';

export const seedDatabase = async (force: boolean = false): Promise<void> => {
  const userCount = await User.countDocuments();
  if (userCount > 0 && !force) {
    console.log('Database already contains records. Skipping automatic seed.');
    return;
  }

  if (force) {
    console.log('Clearing existing collections for fresh seed...');
    await Promise.all([
      User.deleteMany({}),
      StudentProfile.deleteMany({}),
      Menu.deleteMany({}),
      Attendance.deleteMany({}),
      Bill.deleteMany({}),
      Payment.deleteMany({}),
      Inventory.deleteMany({}),
      Complaint.deleteMany({}),
      Notice.deleteMany({}),
      Settings.deleteMany({}),
    ]);
  }

  console.log('Seeding demo users and initial data...');

  const devPassword = 'Password@123';

  // 1. Demo Users
  const adminUser = await User.create({
    name: 'Prof. Ramesh Sharma',
    email: 'admin@messsystem.com',
    password: devPassword,
    role: 'admin',
    phone: '+91 98765 43210',
    isActive: true,
  });

  const managerUser = await User.create({
    name: 'Suresh Verma',
    email: 'manager@messsystem.com',
    password: devPassword,
    role: 'manager',
    phone: '+91 98765 43211',
    messHall: 'Annapurna Dining Hall',
    isActive: true,
  });

  const studentUser = await User.create({
    name: 'Aarav Patel',
    email: 'student@messsystem.com',
    password: devPassword,
    role: 'student',
    studentId: 'STU-1001',
    phone: '+91 98765 43212',
    roomNo: 'A-204',
    hostelBlock: 'Block A (Boys)',
    dietPreference: 'Veg',
    year: '3rd Year',
    branch: 'Computer Science',
    isActive: true,
  });

  const princeUser = await User.create({
    name: 'Prince Kumar',
    email: 'kumarprince3552@gmail.com',
    password: devPassword,
    role: 'student',
    studentId: 'ST001',
    phone: '+91 98765 43219',
    roomNo: 'H2-101',
    hostelBlock: 'Hostel 2 (Boys)',
    dietPreference: 'Veg',
    year: '3rd Year',
    branch: 'Computer Science',
    isActive: true,
  });

  // Additional sample students
  const studentData = [
    {
      name: 'Prince Kumar',
      email: 'kumarprince3552@gmail.com',
      studentId: 'ST001',
      userId: princeUser._id,
      roomNumber: 'H2-101',
      hostel: 'Hostel 2 (Boys)',
      department: 'Computer Science',
      semester: 'Semester 5',
      phone: '+91 98765 43219',
      dietPreference: 'Veg' as const,
      status: 'Active' as const,
    },
    {
      name: 'Aarav Patel',
      email: 'student@messsystem.com',
      studentId: 'STU-1001',
      userId: studentUser._id,
      roomNumber: 'A-204',
      hostel: 'Block A (Boys)',
      department: 'Computer Science',
      semester: 'Semester 5',
      phone: '+91 98765 43212',
      dietPreference: 'Veg' as const,
      status: 'Active' as const,
    },
    {
      name: 'Diya Sharma',
      email: 'diya.sharma@campus.edu',
      studentId: 'STU-1002',
      roomNumber: 'B-108',
      hostel: 'Block B (Girls)',
      department: 'Electronics & Comm.',
      semester: 'Semester 3',
      phone: '+91 98765 43213',
      dietPreference: 'Veg' as const,
      status: 'Active' as const,
    },
    {
      name: 'Rohan Mehra',
      email: 'rohan.mehra@campus.edu',
      studentId: 'STU-1003',
      roomNumber: 'A-312',
      hostel: 'Block A (Boys)',
      department: 'Mechanical Engg.',
      semester: 'Semester 7',
      phone: '+91 98765 43214',
      dietPreference: 'Non-Veg' as const,
      status: 'Active' as const,
    },
    {
      name: 'Ananya Iyer',
      email: 'ananya.iyer@campus.edu',
      studentId: 'STU-1004',
      roomNumber: 'B-215',
      hostel: 'Block B (Girls)',
      department: 'Information Tech.',
      semester: 'Semester 5',
      phone: '+91 98765 43215',
      dietPreference: 'Jain' as const,
      status: 'Active' as const,
    },
    {
      name: 'Vikramaditya Singh',
      email: 'vikram.singh@campus.edu',
      studentId: 'STU-1005',
      roomNumber: 'C-104',
      hostel: 'Block C (Boys)',
      department: 'Civil Engg.',
      semester: 'Semester 3',
      phone: '+91 98765 43216',
      dietPreference: 'Non-Veg' as const,
      status: 'Active' as const,
    },
    {
      name: 'Sneha Kulkarni',
      email: 'sneha.k@campus.edu',
      studentId: 'STU-1006',
      roomNumber: 'B-402',
      hostel: 'Block B (Girls)',
      department: 'Electrical Engg.',
      semester: 'Semester 5',
      phone: '+91 98765 43217',
      dietPreference: 'Veg' as const,
      status: 'On Leave' as const,
    },
  ];

  for (const s of studentData) {
    let uId = s.userId;
    if (!uId) {
      const createdU: any = await User.create({
        name: s.name,
        email: s.email,
        password: devPassword,
        role: 'student',
        studentId: s.studentId,
        phone: s.phone,
        roomNo: s.roomNumber,
        hostelBlock: s.hostel,
        dietPreference: s.dietPreference,
        isActive: s.status === 'Active',
      });
      uId = createdU._id;
    }

    await StudentProfile.create({
      userId: uId,
      studentId: s.studentId,
      name: s.name,
      department: s.department,
      semester: s.semester,
      hostel: s.hostel,
      roomNumber: s.roomNumber,
      phone: s.phone,
      email: s.email,
      dietPreference: s.dietPreference,
      status: s.status,
    });
  }

  // 2. Weekly Menu Items
  const days: Array<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'> = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

  const menuTemplates = [
    {
      category: 'Breakfast' as const,
      name: 'South Indian Idli Sambar & Upma',
      items: ['Steamed Idli (3 pcs)', 'Medhu Vada (1 pc)', 'Mixed Vegetable Sambar', 'Coconut Chutney', 'Tea / Coffee / Milk'],
      timing: '07:30 AM - 09:30 AM',
      calories: 420,
      dietType: 'Veg' as const,
      allergens: ['Dairy', 'Mustard'],
    },
    {
      category: 'Lunch' as const,
      name: 'North Indian Thali & Dal Makhani',
      items: ['Dal Makhani', 'Shahi Paneer / Chicken Curry', 'Jeera Pulao', 'Phulka Roti (4 pcs)', 'Boondi Raita', 'Green Salad'],
      timing: '12:30 PM - 02:30 PM',
      calories: 680,
      dietType: 'Special' as const,
      allergens: ['Gluten', 'Dairy'],
    },
    {
      category: 'Snacks' as const,
      name: 'Crispy Samosa & Masala Chai',
      items: ['Aloo Samosa (2 pcs)', 'Mint Coriander Chutney', 'Sweet Tamarind Dip', 'Kadak Masala Chai'],
      timing: '05:00 PM - 06:15 PM',
      calories: 310,
      dietType: 'Veg' as const,
      allergens: ['Gluten'],
    },
    {
      category: 'Dinner' as const,
      name: 'Healthy Khichdi & Aloo Gobi',
      items: ['Moong Dal Khichdi', 'Desi Ghee', 'Aloo Gobi Matar', 'Tawa Roti', 'Roasted Papad', 'Gulab Jamun (1 pc)'],
      timing: '07:45 PM - 09:45 PM',
      calories: 590,
      dietType: 'Veg' as const,
      allergens: ['Dairy', 'Gluten'],
    },
  ];

  for (const day of days) {
    for (const tmpl of menuTemplates) {
      await Menu.create({
        ...tmpl,
        dayOfWeek: day,
        breakfast: 'Idli, Sambar, Chutney, Tea',
        lunch: 'Paneer Butter Masala, Dal Tadka, Rice, Roti',
        snacks: 'Samosa, Mint Chutney, Chai',
        dinner: 'Mix Veg, Dal Fry, Jeera Rice, Chapati, Kheer',
        createdBy: 'Suresh Verma (Manager)',
      });
    }
  }

  // 3. Attendance Records
  // Generate 14 days of realistic attendance history (Sept 3 to Sept 16, 2026)
  const studentsToSeed = [
    { studentId: princeUser._id, rollNo: 'ST001', name: 'Prince Kumar', roomNo: 'H2-101', hostel: 'Hostel 2 (Boys)' },
    { studentId: studentUser._id, rollNo: 'STU-1001', name: 'Aarav Patel', roomNo: 'A-204', hostel: 'Block A (Boys)' },
    { studentId: new (await import('mongoose')).default.Types.ObjectId(), rollNo: 'STU-1002', name: 'Diya Sharma', roomNo: 'B-108', hostel: 'Block B (Girls)' },
    { studentId: new (await import('mongoose')).default.Types.ObjectId(), rollNo: 'STU-1003', name: 'Rohan Mehra', roomNo: 'A-312', hostel: 'Block A (Boys)' },
    { studentId: new (await import('mongoose')).default.Types.ObjectId(), rollNo: 'STU-1004', name: 'Ananya Iyer', roomNo: 'B-215', hostel: 'Block B (Girls)' },
    { studentId: new (await import('mongoose')).default.Types.ObjectId(), rollNo: 'STU-1005', name: 'Vikramaditya Singh', roomNo: 'C-401', hostel: 'Block C (Boys)' },
  ];

  const datesToSeed = [
    '2026-09-03', '2026-09-04', '2026-09-05', '2026-09-06', '2026-09-07',
    '2026-09-08', '2026-09-09', '2026-09-10', '2026-09-11', '2026-09-12',
    '2026-09-13', '2026-09-14', '2026-09-15', '2026-09-16'
  ];

  for (const dateStr of datesToSeed) {
    const isTargetToday = dateStr === '2026-09-16';
    const dateObj = new Date(`${dateStr}T00:00:00.000Z`);

    for (const st of studentsToSeed) {
      let bf = true;
      let lu = true;
      let sn = true;
      let di = true;

      if (st.rollNo === 'ST001' && isTargetToday) {
        // Explicit example from prompt:
        // Student: Prince Kumar, Date: 2026-09-16
        // Breakfast: Present, Lunch: Present, Snacks: Absent, Dinner: Present
        bf = true;
        lu = true;
        sn = false;
        di = true;
      } else if (isTargetToday) {
        // Variety on today
        if (st.rollNo === 'STU-1003') bf = false;
        if (st.rollNo === 'STU-1005') lu = false;
        if (st.rollNo === 'STU-1004') sn = false;
      } else {
        // Historical variations
        const hash = (st.rollNo.charCodeAt(st.rollNo.length - 1) + dateStr.charCodeAt(dateStr.length - 1)) % 10;
        if (hash === 1) bf = false;
        if (hash === 2) sn = false;
        if (hash === 3) di = false;
      }

      await Attendance.create({
        studentId: st.studentId,
        rollNo: st.rollNo,
        studentName: st.name,
        roomNo: st.roomNo,
        hostelBlock: st.hostel,
        date: dateObj,
        dateString: dateStr,
        breakfast: {
          status: bf,
          markedAt: new Date(`${dateStr}T08:30:00.000Z`),
          markedBy: managerUser._id,
        },
        lunch: {
          status: lu,
          markedAt: new Date(`${dateStr}T13:15:00.000Z`),
          markedBy: managerUser._id,
        },
        snacks: {
          status: sn,
          markedAt: new Date(`${dateStr}T17:45:00.000Z`),
          markedBy: managerUser._id,
        },
        dinner: {
          status: di,
          markedAt: new Date(`${dateStr}T20:30:00.000Z`),
          markedBy: managerUser._id,
        },
        updatedBy: managerUser._id,
      });
    }
  }

  // 4. Monthly Mess Bills (Phase 4: Monthly Bills Only)
  const sampleBills = [
    // Prince Kumar Canonical Bills
    {
      studentId: princeUser._id,
      rollNo: 'ST001',
      studentName: 'Prince Kumar',
      roomNo: 'H2-101',
      hostelBlock: 'Hostel 2 (Boys)',
      month: 9,
      year: 2026,
      monthName: 'September 2026',
      breakfastCount: 22,
      lunchCount: 24,
      snacksCount: 20,
      dinnerCount: 23,
      breakfastRate: 20,
      lunchRate: 40,
      snacksRate: 15,
      dinnerRate: 40,
      breakfastAmount: 440,
      lunchAmount: 960,
      snacksAmount: 300,
      dinnerAmount: 920,
      subtotal: 2620,
      adjustment: 0,
      totalAmount: 2620,
      status: 'PENDING',
      generatedAt: new Date('2026-09-01T09:00:00.000Z'),
      generatedBy: managerUser._id,
      generatedByName: 'Suresh Verma (Manager)',
    },
    {
      studentId: princeUser._id,
      rollNo: 'ST001',
      studentName: 'Prince Kumar',
      roomNo: 'H2-101',
      hostelBlock: 'Hostel 2 (Boys)',
      month: 8,
      year: 2026,
      monthName: 'August 2026',
      breakfastCount: 21,
      lunchCount: 22,
      snacksCount: 20,
      dinnerCount: 22,
      breakfastRate: 20,
      lunchRate: 40,
      snacksRate: 15,
      dinnerRate: 40,
      breakfastAmount: 420,
      lunchAmount: 880,
      snacksAmount: 300,
      dinnerAmount: 880,
      subtotal: 2480,
      adjustment: 0,
      totalAmount: 2480,
      status: 'PAID',
      paidAt: new Date('2026-08-28T14:30:00.000Z'),
      paidBy: managerUser._id,
      paidByName: 'Suresh Verma (Manager)',
      generatedAt: new Date('2026-08-01T09:00:00.000Z'),
      generatedBy: managerUser._id,
      generatedByName: 'Suresh Verma (Manager)',
    },
    {
      studentId: princeUser._id,
      rollNo: 'ST001',
      studentName: 'Prince Kumar',
      roomNo: 'H2-101',
      hostelBlock: 'Hostel 2 (Boys)',
      month: 7,
      year: 2026,
      monthName: 'July 2026',
      breakfastCount: 22,
      lunchCount: 23,
      snacksCount: 21,
      dinnerCount: 22,
      breakfastRate: 20,
      lunchRate: 40,
      snacksRate: 15,
      dinnerRate: 40,
      breakfastAmount: 440,
      lunchAmount: 920,
      snacksAmount: 315,
      dinnerAmount: 880,
      subtotal: 2555,
      adjustment: -5,
      adjustmentReason: 'Round-off adjustment',
      totalAmount: 2550,
      status: 'PAID',
      paidAt: new Date('2026-07-29T16:00:00.000Z'),
      paidBy: managerUser._id,
      paidByName: 'Suresh Verma (Manager)',
      generatedAt: new Date('2026-07-01T09:00:00.000Z'),
      generatedBy: managerUser._id,
      generatedByName: 'Suresh Verma (Manager)',
    },
    // Other students
    {
      studentId: studentUser._id,
      rollNo: 'STU-1001',
      studentName: 'Aarav Patel',
      roomNo: 'A-204',
      hostelBlock: 'Block A (Boys)',
      month: 9,
      year: 2026,
      monthName: 'September 2026',
      breakfastCount: 23,
      lunchCount: 24,
      snacksCount: 21,
      dinnerCount: 24,
      breakfastRate: 20,
      lunchRate: 40,
      snacksRate: 15,
      dinnerRate: 40,
      breakfastAmount: 460,
      lunchAmount: 960,
      snacksAmount: 315,
      dinnerAmount: 960,
      subtotal: 2695,
      adjustment: 0,
      totalAmount: 2695,
      status: 'PENDING',
      generatedAt: new Date('2026-09-01T09:00:00.000Z'),
      generatedBy: managerUser._id,
      generatedByName: 'Suresh Verma (Manager)',
    },
    {
      studentId: new (await import('mongoose')).default.Types.ObjectId(),
      rollNo: 'STU-1002',
      studentName: 'Diya Sharma',
      roomNo: 'B-108',
      hostelBlock: 'Block B (Girls)',
      month: 9,
      year: 2026,
      monthName: 'September 2026',
      breakfastCount: 24,
      lunchCount: 24,
      snacksCount: 22,
      dinnerCount: 23,
      breakfastRate: 20,
      lunchRate: 40,
      snacksRate: 15,
      dinnerRate: 40,
      breakfastAmount: 480,
      lunchAmount: 960,
      snacksAmount: 330,
      dinnerAmount: 920,
      subtotal: 2690,
      adjustment: -100,
      adjustmentReason: 'Approved medical leave rebate',
      totalAmount: 2590,
      status: 'PAID',
      paidAt: new Date('2026-09-10T11:00:00.000Z'),
      paidBy: managerUser._id,
      paidByName: 'Suresh Verma (Manager)',
      generatedAt: new Date('2026-09-01T09:00:00.000Z'),
      generatedBy: managerUser._id,
      generatedByName: 'Suresh Verma (Manager)',
    },
    {
      studentId: new (await import('mongoose')).default.Types.ObjectId(),
      rollNo: 'STU-1003',
      studentName: 'Rohan Mehra',
      roomNo: 'A-312',
      hostelBlock: 'Block A (Boys)',
      month: 9,
      year: 2026,
      monthName: 'September 2026',
      breakfastCount: 20,
      lunchCount: 22,
      snacksCount: 18,
      dinnerCount: 21,
      breakfastRate: 20,
      lunchRate: 40,
      snacksRate: 15,
      dinnerRate: 40,
      breakfastAmount: 400,
      lunchAmount: 880,
      snacksAmount: 270,
      dinnerAmount: 840,
      subtotal: 2390,
      adjustment: 0,
      totalAmount: 2390,
      status: 'PENDING',
      generatedAt: new Date('2026-09-01T09:00:00.000Z'),
      generatedBy: managerUser._id,
      generatedByName: 'Suresh Verma (Manager)',
    },
    {
      studentId: new (await import('mongoose')).default.Types.ObjectId(),
      rollNo: 'STU-1004',
      studentName: 'Ananya Iyer',
      roomNo: 'B-215',
      hostelBlock: 'Block B (Girls)',
      month: 9,
      year: 2026,
      monthName: 'September 2026',
      breakfastCount: 22,
      lunchCount: 23,
      snacksCount: 21,
      dinnerCount: 22,
      breakfastRate: 20,
      lunchRate: 40,
      snacksRate: 15,
      dinnerRate: 40,
      breakfastAmount: 440,
      lunchAmount: 920,
      snacksAmount: 315,
      dinnerAmount: 880,
      subtotal: 2555,
      adjustment: 0,
      totalAmount: 2555,
      status: 'PAID',
      paidAt: new Date('2026-09-12T15:30:00.000Z'),
      paidBy: managerUser._id,
      paidByName: 'Suresh Verma (Manager)',
      generatedAt: new Date('2026-09-01T09:00:00.000Z'),
      generatedBy: managerUser._id,
      generatedByName: 'Suresh Verma (Manager)',
    },
  ];

  for (const b of sampleBills) {
    await Bill.create(b);
  }

  // 5. Payments
  const samplePayments = [
    {
      studentId: 'STU-1001',
      rollNo: 'STU-1001',
      studentName: 'Aarav Patel',
      amount: 2000,
      paymentMethod: 'UPI',
      transactionId: 'TXN-98481230491',
      referenceNo: 'REF-20260901',
      status: 'Completed',
      paidAt: new Date(Date.now() - 3 * 86400000),
    },
    {
      studentId: 'STU-1002',
      rollNo: 'STU-1002',
      studentName: 'Diya Sharma',
      amount: 4290,
      paymentMethod: 'Net Banking',
      transactionId: 'TXN-98481230492',
      referenceNo: 'REF-20260902',
      status: 'Completed',
      paidAt: new Date(Date.now() - 5 * 86400000),
    },
    {
      studentId: 'STU-1004',
      rollNo: 'STU-1004',
      studentName: 'Ananya Iyer',
      amount: 4400,
      paymentMethod: 'Debit Card',
      transactionId: 'TXN-98481230493',
      referenceNo: 'REF-20260903',
      status: 'Completed',
      paidAt: new Date(Date.now() - 4 * 86400000),
    },
  ];

  for (const p of samplePayments) {
    await Payment.create(p);
  }

  // 6. Inventory Items
  const sampleInventory = [
    { itemName: 'Basmati Rice (Premium)', category: 'Grains & Pulses', quantity: 240, unit: 'kg', minimumStock: 80, supplier: 'Punjab Agro Corp', costPerUnit: 68 },
    { itemName: 'Chakki Fresh Atta', category: 'Grains & Pulses', quantity: 180, unit: 'kg', minimumStock: 100, supplier: 'ITC Mills', costPerUnit: 42 },
    { itemName: 'Toor Dal (Arhar)', category: 'Grains & Pulses', quantity: 45, unit: 'kg', minimumStock: 50, supplier: 'Desi Organics', costPerUnit: 145 }, // Low stock!
    { itemName: 'Refined Sunflower Oil', category: 'Oils & Fats', quantity: 12, unit: 'liters', minimumStock: 25, supplier: 'Fortune Foods', costPerUnit: 120 }, // Low stock!
    { itemName: 'Fresh Full Cream Milk', category: 'Dairy & Poultry', quantity: 120, unit: 'liters', minimumStock: 30, supplier: 'Amul Dairy Cooperative', costPerUnit: 58 },
    { itemName: 'Commercial LPG Cylinders (19kg)', category: 'Gas & Fuel', quantity: 2, unit: 'cylinders', minimumStock: 4, supplier: 'Indane Gas Agency', costPerUnit: 1850 }, // Low stock!
    { itemName: 'Fresh Onions (Nashik)', category: 'Vegetables & Fruits', quantity: 85, unit: 'kg', minimumStock: 40, supplier: 'Mandi Board', costPerUnit: 32 },
    { itemName: 'Potatoes (Cold Store)', category: 'Vegetables & Fruits', quantity: 110, unit: 'kg', minimumStock: 50, supplier: 'Mandi Board', costPerUnit: 24 },
  ];

  for (const inv of sampleInventory) {
    await Inventory.create(inv);
  }

  // 7. Complaints
  const sampleComplaints = [
    {
      studentId: 'STU-1001',
      rollNo: 'STU-1001',
      studentName: 'Aarav Patel',
      title: 'Water dispenser not cooling in Dining Hall 2',
      description: 'The RO water dispenser on the east side has been dispensing warm water since yesterday evening.',
      category: 'Hygiene & Cleanliness',
      priority: 'Normal' as const,
      status: 'In Progress' as const,
      response: 'Technician dispatched. Will be repaired by 4 PM today.',
      adminNotes: 'Assigned to campus maintenance team.',
    },
    {
      studentId: 'STU-1003',
      rollNo: 'STU-1003',
      studentName: 'Rohan Mehra',
      title: 'Chapati served cold during late dinner hours',
      description: 'Arrived at 9:15 PM and chapatis were cold and dry. Please keep hot casserole containers closed.',
      category: 'Food Quality',
      priority: 'Urgent' as const,
      status: 'Pending' as const,
      adminNotes: 'Notice given to head cook for evening shift.',
    },
    {
      studentId: 'STU-1002',
      rollNo: 'STU-1002',
      studentName: 'Diya Sharma',
      title: 'Request for Jain Food Counter separation',
      description: 'Please ensure separate serving ladles and plates are used for Jain dal and sabzi.',
      category: 'Dietary Preference',
      priority: 'High' as const,
      status: 'Resolved' as const,
      response: 'Dedicated Jain serving station marked with green signage and sanitized utensils.',
      resolutionNotes: 'Implemented on Sept 12.',
    },
  ];

  for (const c of sampleComplaints) {
    await Complaint.create(c);
  }

  // 8. Notices
  const sampleNotices = [
    {
      title: 'Festival Feast Menu for Dussehra Celebration',
      description: 'Special buffet dinner with Paneer Tikka, Veg Biryani, Gulab Jamun and Ice Cream will be served on October 2. Timing: 7:00 PM to 10:30 PM.',
      priority: 'Important' as const,
      postedBy: 'Chief Mess Warden',
      authorRole: 'Admin',
      targetAudience: 'All' as const,
    },
    {
      title: 'Monthly Mess Cut Deadline for October 2026',
      description: 'All mess cut leave applications for the upcoming Puja vacation must be submitted at least 24 hours in advance via the student portal.',
      priority: 'Normal' as const,
      postedBy: 'Suresh Verma (Manager)',
      authorRole: 'Mess Manager',
      targetAudience: 'Students' as const,
    },
    {
      title: 'Pest Control & Kitchen Sanitization Drive',
      description: 'Dining hall will undergo mandatory fogging on Sunday between 3:00 PM and 5:00 PM. High tea snacks will be served in the adjoining lawn.',
      priority: 'Urgent' as const,
      postedBy: 'Chief Mess Warden',
      authorRole: 'Admin',
      targetAudience: 'All' as const,
    },
  ];

  for (const n of sampleNotices) {
    await Notice.create(n);
  }

  // 9. Institutional Settings
  await Settings.create({});

  console.log('✅ Database successfully seeded with demo accounts and initial operational data.');
  console.log('----------------------------------------------------');
  console.log('DEMO ACCOUNTS:');
  console.log(`ADMIN:   admin@messsystem.com   | Password: ${devPassword}`);
  console.log(`MANAGER: manager@messsystem.com | Password: ${devPassword}`);
  console.log(`STUDENT: student@messsystem.com | Password: ${devPassword}`);
  console.log('----------------------------------------------------');
};

// If run directly via CLI (npm run seed)
if (process.argv[1]?.includes('seed')) {
  import('dotenv/config').then(async () => {
    const { connectDB, disconnectDB } = await import('../config/db');
    try {
      await connectDB();
      await seedDatabase(true);
      await disconnectDB();
      process.exit(0);
    } catch (err) {
      console.error('Seed execution failed:', err);
      process.exit(1);
    }
  });
}
