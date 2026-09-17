import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { User } from '../models/User';
import { StudentProfile } from '../models/StudentProfile';
import { Attendance } from '../models/Attendance';
import { Bill } from '../models/Bill';
import { Payment } from '../models/Payment';
import { Inventory } from '../models/Inventory';
import { Complaint } from '../models/Complaint';
import { Menu } from '../models/Menu';
import { Notice } from '../models/Notice';

export const getAdminDashboard = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const [totalStudents, activeStudents, lowStock, pendingComplaints, bills, todayAttendance, recentPayments] = await Promise.all([
      StudentProfile.countDocuments(),
      StudentProfile.countDocuments({ status: 'Active' }),
      Inventory.find({ status: { $in: ['Low Stock', 'Out of Stock'] } }),
      Complaint.find({ status: 'Pending' }).sort({ createdAt: -1 }).limit(5),
      Bill.find(),
      Attendance.find({ date: today }),
      Payment.find().sort({ paidAt: -1 }).limit(5),
    ]);

    const totalRevenue = bills.reduce((acc, b) => acc + (b.paidAmount || 0), 0);
    const pendingRevenue = bills.reduce((acc, b) => acc + (b.dueAmount || 0), 0);

    let todayMealsCount = 0;
    todayAttendance.forEach((a) => {
      todayMealsCount += a.totalMeals || 0;
    });

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        activeStudents,
        lowStockCount: lowStock.length,
        lowStockItems: lowStock,
        pendingComplaintsCount: pendingComplaints.length,
        recentComplaints: pendingComplaints,
        totalRevenue,
        pendingRevenue,
        todayMealsCount,
        recentPayments,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getManagerDashboard = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = days[new Date().getDay()];

    const [todayAttendance, lowStock, complaints, todayMenu] = await Promise.all([
      Attendance.find({ date: today }),
      Inventory.find({ status: { $in: ['Low Stock', 'Out of Stock'] } }),
      Complaint.find({ status: { $in: ['Pending', 'In Progress'] } }).sort({ createdAt: -1 }).limit(5),
      Menu.find({ $or: [{ dayOfWeek: currentDay as any }, { date: today }] }),
    ]);

    let breakfast = 0;
    let lunch = 0;
    let snacks = 0;
    let dinner = 0;

    todayAttendance.forEach((a) => {
      if (a.breakfast) breakfast++;
      if (a.lunch) lunch++;
      if (a.snacks) snacks++;
      if (a.dinner) dinner++;
    });

    res.status(200).json({
      success: true,
      data: {
        todayHeadcount: {
          breakfast,
          lunch,
          snacks,
          dinner,
          total: breakfast + lunch + snacks + dinner,
        },
        lowStockItems: lowStock,
        activeComplaints: complaints,
        todayMenu,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getStudentDashboard = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const studentId = req.user?.studentId;
    const today = new Date().toISOString().split('T')[0];
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = days[new Date().getDay()];

    const [todayAttendance, myBills, myAttendanceRecords, myComplaints, todayMenu, notices] = await Promise.all([
      Attendance.findOne({
        $or: [{ studentId }, { rollNo: studentId }],
        date: today,
      }),
      Bill.find({ $or: [{ studentId }, { rollNo: studentId }] }).sort({ createdAt: -1 }),
      Attendance.find({ $or: [{ studentId }, { rollNo: studentId }] }),
      Complaint.find({ $or: [{ studentId }, { rollNo: studentId }] }).sort({ createdAt: -1 }).limit(4),
      Menu.find({ $or: [{ dayOfWeek: currentDay as any }, { date: today }] }),
      Notice.find().sort({ createdAt: -1 }).limit(3),
    ]);

    // Calculate attendance percentage
    const totalDays = myAttendanceRecords.length;
    let totalAttended = 0;
    myAttendanceRecords.forEach((r) => {
      totalAttended += r.totalMeals || 0;
    });
    const possibleMeals = totalDays > 0 ? totalDays * 4 : 1;
    const attendancePercentage = Math.round((totalAttended / possibleMeals) * 100);

    const currentBill = myBills[0] || null;
    const totalDue = myBills.reduce((sum, b) => sum + (b.dueAmount || 0), 0);

    res.status(200).json({
      success: true,
      data: {
        todayAttendance: todayAttendance || {
          breakfast: false,
          lunch: false,
          snacks: false,
          dinner: false,
          totalMeals: 0,
        },
        attendancePercentage,
        currentBill,
        totalDue,
        recentComplaints: myComplaints,
        todayMenu,
        notices,
      },
    });
  } catch (error) {
    next(error);
  }
};
