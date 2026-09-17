import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Attendance, IAttendance } from '../models/Attendance';
import { User } from '../models/User';
import { StudentProfile } from '../models/StudentProfile';

// Helper to format attendance record for both object and direct boolean convenience
export const formatAttendanceRecord = (doc: any) => {
  const dateStr = doc.dateString || (doc.date ? new Date(doc.date).toISOString().split('T')[0] : '');
  return {
    id: doc._id ? doc._id.toString() : doc.id,
    _id: doc._id,
    studentId: doc.studentId,
    studentName: doc.studentName || '',
    rollNo: doc.rollNo || '',
    hostelBlock: doc.hostelBlock || 'Hostel 2 (Boys)',
    roomNo: doc.roomNo || 'H2-101',
    date: dateStr,
    dateString: dateStr,
    breakfast: Boolean(doc.breakfast?.status),
    lunch: Boolean(doc.lunch?.status),
    snacks: Boolean(doc.snacks?.status),
    dinner: Boolean(doc.dinner?.status),
    breakfastDetail: doc.breakfast || { status: false, markedAt: null, markedBy: null },
    lunchDetail: doc.lunch || { status: false, markedAt: null, markedBy: null },
    snacksDetail: doc.snacks || { status: false, markedAt: null, markedBy: null },
    dinnerDetail: doc.dinner || { status: false, markedAt: null, markedBy: null },
    totalPresent: doc.totalPresent ?? 0,
    totalMeals: doc.totalMeals ?? 4,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    updatedBy: doc.updatedBy,
  };
};

/**
 * 1. GET /api/attendance
 * Query: date, meal, studentId, hostelBlock, roomNo, search
 * Authorized: Admin, Manager
 */
export const getAttendance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { date, meal, studentId, hostelBlock, roomNo, search } = req.query;
    const filter: Record<string, any> = {};

    if (date) {
      const dateStr = String(date);
      filter.$or = [
        { dateString: dateStr },
        {
          date: {
            $gte: new Date(`${dateStr}T00:00:00.000Z`),
            $lte: new Date(`${dateStr}T23:59:59.999Z`),
          },
        },
      ];
    }

    if (studentId) {
      if (mongoose.Types.ObjectId.isValid(String(studentId))) {
        filter.$or = [{ studentId: new mongoose.Types.ObjectId(String(studentId)) }, { rollNo: String(studentId) }];
      } else {
        filter.rollNo = String(studentId);
      }
    }

    if (hostelBlock && hostelBlock !== 'all') {
      filter.hostelBlock = String(hostelBlock);
    }

    if (roomNo) {
      filter.roomNo = String(roomNo);
    }

    let records = await Attendance.find(filter)
      .populate('studentId', 'name studentId email roomNo hostelBlock roomNumber hostel')
      .populate('updatedBy', 'name role')
      .sort({ date: -1, studentName: 1 });

    let formatted = records.map(formatAttendanceRecord);

    if (search) {
      const q = String(search).toLowerCase();
      formatted = formatted.filter(
        (r) =>
          r.studentName.toLowerCase().includes(q) ||
          r.rollNo.toLowerCase().includes(q) ||
          r.roomNo.toLowerCase().includes(q)
      );
    }

    if (meal && ['breakfast', 'lunch', 'snacks', 'dinner'].includes(String(meal).toLowerCase())) {
      const mealKey = String(meal).toLowerCase() as 'breakfast' | 'lunch' | 'snacks' | 'dinner';
      // calculate meal-specific metrics for the current filtered view
      const mealPresent = formatted.filter((r) => r[mealKey]).length;
      const mealAbsent = formatted.length - mealPresent;
      res.status(200).json({
        success: true,
        count: formatted.length,
        mealStats: {
          meal: mealKey,
          present: mealPresent,
          absent: mealAbsent,
          percentage: formatted.length > 0 ? Math.round((mealPresent / formatted.length) * 1000) / 10 : 0,
        },
        data: formatted,
      });
      return;
    }

    res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 2. GET /api/attendance/today
 * Returns today's meal counts (Breakfast, Lunch, Snacks, Dinner) and total metrics
 */
export const getTodayAttendance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const todayStr = req.query.date ? String(req.query.date) : new Date().toISOString().split('T')[0];

    const records = await Attendance.find({
      $or: [
        { dateString: todayStr },
        {
          date: {
            $gte: new Date(`${todayStr}T00:00:00.000Z`),
            $lte: new Date(`${todayStr}T23:59:59.999Z`),
          },
        },
      ],
    });

    // Count total students registered in database
    const totalStudentsInDb = await User.countDocuments({ role: 'student' });
    const totalStudents = Math.max(records.length, totalStudentsInDb, 20);

    let breakfastPresent = 0;
    let lunchPresent = 0;
    let snacksPresent = 0;
    let dinnerPresent = 0;

    records.forEach((r) => {
      if (r.breakfast?.status) breakfastPresent++;
      if (r.lunch?.status) lunchPresent++;
      if (r.snacks?.status) snacksPresent++;
      if (r.dinner?.status) dinnerPresent++;
    });

    const breakfastAbsent = Math.max(0, totalStudents - breakfastPresent);
    const lunchAbsent = Math.max(0, totalStudents - lunchPresent);
    const snacksAbsent = Math.max(0, totalStudents - snacksPresent);
    const dinnerAbsent = Math.max(0, totalStudents - dinnerPresent);

    const totalMealsServed = breakfastPresent + lunchPresent + snacksPresent + dinnerPresent;
    const possibleMeals = totalStudents * 4;
    const overallPercentage =
      possibleMeals > 0 ? Math.round((totalMealsServed / possibleMeals) * 1000) / 10 : 0;

    res.status(200).json({
      success: true,
      data: {
        date: todayStr,
        totalStudents,
        breakfast: { present: breakfastPresent, absent: breakfastAbsent },
        lunch: { present: lunchPresent, absent: lunchAbsent },
        snacks: { present: snacksPresent, absent: snacksAbsent },
        dinner: { present: dinnerPresent, absent: dinnerAbsent },
        totalMealsServed,
        possibleMeals,
        attendancePercentage: overallPercentage,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 3. GET /api/attendance/student/:studentId
 * View attendance records for a specific student
 * Authorization: Students can ONLY view their own records. Managers and Admins can view any.
 */
export const getStudentAttendance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { studentId } = req.params;
    const currentUser = (req as any).user;

    // Strict Authorization check for students:
    if (currentUser?.role === 'student') {
      const isOwnId =
        currentUser._id?.toString() === studentId ||
        currentUser.studentId === studentId ||
        currentUser.email === studentId;

      if (!isOwnId) {
        res.status(403).json({
          success: false,
          message: 'Access denied. Students are only permitted to view their own attendance records.',
        });
        return;
      }
    }

    let filter: Record<string, any> = {};
    if (mongoose.Types.ObjectId.isValid(studentId)) {
      filter = {
        $or: [
          { studentId: new mongoose.Types.ObjectId(studentId) },
          { rollNo: studentId },
          { 'studentId.studentId': studentId },
        ],
      };
    } else {
      filter = {
        $or: [{ rollNo: studentId }, { studentId: studentId }],
      };
    }

    const records = await Attendance.find(filter).sort({ date: -1 });
    const formatted = records.map(formatAttendanceRecord);

    res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 4. GET /api/attendance/student/:studentId/summary
 * Monthly & overall attendance statistics calculated per meal and overall
 */
export const getStudentSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { studentId } = req.params;
    const currentUser = (req as any).user;

    if (currentUser?.role === 'student') {
      const isOwnId =
        currentUser._id?.toString() === studentId ||
        currentUser.studentId === studentId ||
        currentUser.email === studentId;

      if (!isOwnId) {
        res.status(403).json({
          success: false,
          message: 'Access denied. Students are only permitted to view their own attendance summary.',
        });
        return;
      }
    }

    let filter: Record<string, any> = {};
    if (mongoose.Types.ObjectId.isValid(studentId)) {
      filter = {
        $or: [{ studentId: new mongoose.Types.ObjectId(studentId) }, { rollNo: studentId }],
      };
    } else {
      filter = {
        $or: [{ rollNo: studentId }, { studentId: studentId }],
      };
    }

    const records = await Attendance.find(filter).sort({ date: -1 });

    const totalDays = records.length;
    let breakfastPresent = 0;
    let lunchPresent = 0;
    let snacksPresent = 0;
    let dinnerPresent = 0;

    records.forEach((r) => {
      if (r.breakfast?.status) breakfastPresent++;
      if (r.lunch?.status) lunchPresent++;
      if (r.snacks?.status) snacksPresent++;
      if (r.dinner?.status) dinnerPresent++;
    });

    const totalPresentMeals = breakfastPresent + lunchPresent + snacksPresent + dinnerPresent;
    const totalScheduledMeals = totalDays * 4;

    const round1 = (num: number) => Math.round(num * 10) / 10;

    const summary = {
      studentId,
      studentName: records[0]?.studentName || 'Student',
      totalDays,
      totalScheduledMeals,
      totalPresentMeals,
      breakfast: {
        present: breakfastPresent,
        total: totalDays,
        percentage: totalDays > 0 ? round1((breakfastPresent / totalDays) * 100) : 0,
      },
      lunch: {
        present: lunchPresent,
        total: totalDays,
        percentage: totalDays > 0 ? round1((lunchPresent / totalDays) * 100) : 0,
      },
      snacks: {
        present: snacksPresent,
        total: totalDays,
        percentage: totalDays > 0 ? round1((snacksPresent / totalDays) * 100) : 0,
      },
      dinner: {
        present: dinnerPresent,
        total: totalDays,
        percentage: totalDays > 0 ? round1((dinnerPresent / totalDays) * 100) : 0,
      },
      overallPercentage:
        totalScheduledMeals > 0 ? round1((totalPresentMeals / totalScheduledMeals) * 100) : 0,
    };

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 5. GET /api/attendance/report
 * Query: startDate, endDate, meal, studentId
 * Aggregates attendance statistics across date ranges and per student breakdown table
 * Authorized: Admin, Manager
 */
export const getAttendanceReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { startDate, endDate, meal, studentId } = req.query;

    const filter: Record<string, any> = {};

    if (startDate || endDate) {
      filter.dateString = {};
      if (startDate) filter.dateString.$gte = String(startDate);
      if (endDate) filter.dateString.$lte = String(endDate);
    }

    if (studentId && studentId !== 'all') {
      filter.$or = [{ rollNo: String(studentId) }, { studentId: String(studentId) }];
    }

    const records = await Attendance.find(filter).sort({ dateString: 1, studentName: 1 });

    // Group records by student
    const studentMap = new Map<
      string,
      {
        studentName: string;
        studentId: string;
        rollNo: string;
        roomNo: string;
        hostelBlock: string;
        totalDays: number;
        breakfastPresent: number;
        lunchPresent: number;
        snacksPresent: number;
        dinnerPresent: number;
      }
    >();

    records.forEach((r) => {
      const key = r.rollNo || (r.studentId ? r.studentId.toString() : r.studentName || 'unknown');
      if (!studentMap.has(key)) {
        studentMap.set(key, {
          studentName: r.studentName || 'Student',
          studentId: r.rollNo || key,
          rollNo: r.rollNo || key,
          roomNo: r.roomNo || 'H2-101',
          hostelBlock: r.hostelBlock || 'Hostel 2 (Boys)',
          totalDays: 0,
          breakfastPresent: 0,
          lunchPresent: 0,
          snacksPresent: 0,
          dinnerPresent: 0,
        });
      }

      const s = studentMap.get(key)!;
      s.totalDays++;
      if (r.breakfast?.status) s.breakfastPresent++;
      if (r.lunch?.status) s.lunchPresent++;
      if (r.snacks?.status) s.snacksPresent++;
      if (r.dinner?.status) s.dinnerPresent++;
    });

    const round1 = (num: number) => Math.round(num * 10) / 10;

    let totalPossibleMeals = 0;
    let totalPresentMeals = 0;

    const studentsBreakdown = Array.from(studentMap.values()).map((s) => {
      const studentScheduled = s.totalDays * 4;
      const studentPresent =
        s.breakfastPresent + s.lunchPresent + s.snacksPresent + s.dinnerPresent;

      totalPossibleMeals += studentScheduled;
      totalPresentMeals += studentPresent;

      return {
        studentName: s.studentName,
        studentId: s.studentId,
        rollNo: s.rollNo,
        roomNo: s.roomNo,
        hostelBlock: s.hostelBlock,
        totalDays: s.totalDays,
        breakfastPercentage: s.totalDays > 0 ? round1((s.breakfastPresent / s.totalDays) * 100) : 0,
        lunchPercentage: s.totalDays > 0 ? round1((s.lunchPresent / s.totalDays) * 100) : 0,
        snacksPercentage: s.totalDays > 0 ? round1((s.snacksPresent / s.totalDays) * 100) : 0,
        dinnerPercentage: s.totalDays > 0 ? round1((s.dinnerPresent / s.totalDays) * 100) : 0,
        overallPercentage:
          studentScheduled > 0 ? round1((studentPresent / studentScheduled) * 100) : 0,
      };
    });

    const totalAbsentMeals = Math.max(0, totalPossibleMeals - totalPresentMeals);
    const overallPercentage =
      totalPossibleMeals > 0 ? round1((totalPresentMeals / totalPossibleMeals) * 100) : 0;

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalStudents: studentMap.size,
          totalMeals: totalPossibleMeals,
          presentMeals: totalPresentMeals,
          absentMeals: totalAbsentMeals,
          attendancePercentage: overallPercentage,
          startDate: startDate || (records[0]?.dateString ?? ''),
          endDate: endDate || (records[records.length - 1]?.dateString ?? ''),
        },
        students: studentsBreakdown,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 6. POST /api/attendance
 * Create or bulk update attendance with audit fields (markedBy, markedAt)
 * Prevents duplicate records for the same student and date.
 * Authorized: Admin, Manager
 */
export const markAttendance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const currentUser = (req as any).user;
    const currentUserId = currentUser?._id;

    // Support Batch Array: { date, meal, records: [{ studentId, rollNo, status }] }
    if (req.body.records && Array.isArray(req.body.records)) {
      const { date, meal, records } = req.body;
      const targetDateStr = date || new Date().toISOString().split('T')[0];
      const targetDate = new Date(`${targetDateStr}T00:00:00.000Z`);
      const targetMeal = String(meal || 'breakfast').toLowerCase() as 'breakfast' | 'lunch' | 'snacks' | 'dinner';

      const results = [];

      for (const item of records) {
        const studentIdentifier = item.studentId || item.rollNo;
        if (!studentIdentifier) continue;

        // Resolve student in database
        let studentUser = await User.findOne({
          $or: [
            ...(mongoose.Types.ObjectId.isValid(studentIdentifier) ? [{ _id: studentIdentifier }] : []),
            { studentId: studentIdentifier },
            { email: studentIdentifier },
          ],
        });

        const studentObjectId = studentUser?._id || (mongoose.Types.ObjectId.isValid(studentIdentifier) ? new mongoose.Types.ObjectId(studentIdentifier) : new mongoose.Types.ObjectId());
        const studentName = item.studentName || studentUser?.name || 'Student';
        const rollNo = item.rollNo || studentUser?.studentId || studentIdentifier;
        const hostelBlock = item.hostelBlock || studentUser?.hostelBlock || 'Hostel 2 (Boys)';
        const roomNo = item.roomNo || studentUser?.roomNo || 'H2-101';

        let doc = await Attendance.findOne({
          $or: [
            { studentId: studentObjectId, dateString: targetDateStr },
            { rollNo: rollNo, dateString: targetDateStr },
          ],
        });

        if (!doc) {
          doc = new Attendance({
            studentId: studentObjectId,
            date: targetDate,
            dateString: targetDateStr,
            studentName,
            rollNo,
            hostelBlock,
            roomNo,
            breakfast: { status: false },
            lunch: { status: false },
            snacks: { status: false },
            dinner: { status: false },
          });
        }

        // Set meal status
        const isPresent = Boolean(item.status);
        doc[targetMeal] = {
          status: isPresent,
          markedAt: new Date(),
          markedBy: currentUserId,
        };
        doc.updatedBy = currentUserId;

        await doc.save();
        results.push(formatAttendanceRecord(doc));
      }

      res.status(200).json({
        success: true,
        message: `Attendance saved successfully for ${results.length} students.`,
        data: results,
      });
      return;
    }

    // Single Record Handling
    const {
      studentId,
      rollNo,
      date,
      meal,
      status,
      breakfast,
      lunch,
      snacks,
      dinner,
      studentName,
      hostelBlock,
      roomNo,
    } = req.body;

    const targetRoll = rollNo || studentId;
    if (!targetRoll) {
      res.status(400).json({
        success: false,
        message: 'studentId or rollNo is required to mark attendance.',
      });
      return;
    }

    const targetDateStr = date || new Date().toISOString().split('T')[0];
    const targetDate = new Date(`${targetDateStr}T00:00:00.000Z`);

    // Look up user
    let studentUser = await User.findOne({
      $or: [
        ...(mongoose.Types.ObjectId.isValid(studentId) ? [{ _id: studentId }] : []),
        { studentId: targetRoll },
      ],
    });

    const studentObjectId = studentUser?._id || (mongoose.Types.ObjectId.isValid(studentId) ? new mongoose.Types.ObjectId(studentId) : new mongoose.Types.ObjectId());

    let doc = await Attendance.findOne({
      $or: [
        { studentId: studentObjectId, dateString: targetDateStr },
        { rollNo: targetRoll, dateString: targetDateStr },
      ],
    });

    if (!doc) {
      doc = new Attendance({
        studentId: studentObjectId,
        date: targetDate,
        dateString: targetDateStr,
        studentName: studentName || studentUser?.name || 'Student',
        rollNo: targetRoll,
        hostelBlock: hostelBlock || studentUser?.hostelBlock || 'Hostel 2 (Boys)',
        roomNo: roomNo || studentUser?.roomNo || 'H2-101',
        breakfast: { status: false },
        lunch: { status: false },
        snacks: { status: false },
        dinner: { status: false },
      });
    }

    // Apply specific meal or full object
    if (meal && ['breakfast', 'lunch', 'snacks', 'dinner'].includes(String(meal).toLowerCase())) {
      const mKey = String(meal).toLowerCase() as 'breakfast' | 'lunch' | 'snacks' | 'dinner';
      doc[mKey] = {
        status: Boolean(status),
        markedAt: new Date(),
        markedBy: currentUserId,
      };
    } else {
      if (breakfast !== undefined) {
        doc.breakfast = {
          status: typeof breakfast === 'object' ? Boolean(breakfast.status) : Boolean(breakfast),
          markedAt: new Date(),
          markedBy: currentUserId,
        };
      }
      if (lunch !== undefined) {
        doc.lunch = {
          status: typeof lunch === 'object' ? Boolean(lunch.status) : Boolean(lunch),
          markedAt: new Date(),
          markedBy: currentUserId,
        };
      }
      if (snacks !== undefined) {
        doc.snacks = {
          status: typeof snacks === 'object' ? Boolean(snacks.status) : Boolean(snacks),
          markedAt: new Date(),
          markedBy: currentUserId,
        };
      }
      if (dinner !== undefined) {
        doc.dinner = {
          status: typeof dinner === 'object' ? Boolean(dinner.status) : Boolean(dinner),
          markedAt: new Date(),
          markedBy: currentUserId,
        };
      }
    }

    doc.updatedBy = currentUserId;
    await doc.save();

    res.status(200).json({
      success: true,
      message: 'Attendance saved successfully.',
      data: formatAttendanceRecord(doc),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 7. PUT /api/attendance/:id
 * Full update of attendance record with updatedBy and updatedAt
 * Authorized: Admin, Manager
 */
export const updateAttendance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const currentUser = (req as any).user;

    const doc = await Attendance.findById(id);
    if (!doc) {
      res.status(404).json({
        success: false,
        message: 'Attendance record not found.',
      });
      return;
    }

    const { breakfast, lunch, snacks, dinner, hostelBlock, roomNo } = req.body;

    if (breakfast !== undefined) {
      doc.breakfast = {
        status: typeof breakfast === 'object' ? Boolean(breakfast.status) : Boolean(breakfast),
        markedAt: new Date(),
        markedBy: currentUser?._id,
      };
    }
    if (lunch !== undefined) {
      doc.lunch = {
        status: typeof lunch === 'object' ? Boolean(lunch.status) : Boolean(lunch),
        markedAt: new Date(),
        markedBy: currentUser?._id,
      };
    }
    if (snacks !== undefined) {
      doc.snacks = {
        status: typeof snacks === 'object' ? Boolean(snacks.status) : Boolean(snacks),
        markedAt: new Date(),
        markedBy: currentUser?._id,
      };
    }
    if (dinner !== undefined) {
      doc.dinner = {
        status: typeof dinner === 'object' ? Boolean(dinner.status) : Boolean(dinner),
        markedAt: new Date(),
        markedBy: currentUser?._id,
      };
    }
    if (hostelBlock) doc.hostelBlock = hostelBlock;
    if (roomNo) doc.roomNo = roomNo;

    doc.updatedBy = currentUser?._id;
    await doc.save();

    res.status(200).json({
      success: true,
      message: 'Attendance record updated successfully.',
      data: formatAttendanceRecord(doc),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 8. PATCH /api/attendance/:id/meal
 * Update specific meal status
 * Authorized: Admin, Manager
 */
export const patchMealAttendance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { meal, status } = req.body;
    const currentUser = (req as any).user;

    if (!meal || !['breakfast', 'lunch', 'snacks', 'dinner'].includes(String(meal).toLowerCase())) {
      res.status(400).json({
        success: false,
        message: "Invalid meal type. Must be 'breakfast', 'lunch', 'snacks', or 'dinner'.",
      });
      return;
    }

    const doc = await Attendance.findById(id);
    if (!doc) {
      res.status(404).json({
        success: false,
        message: 'Attendance record not found.',
      });
      return;
    }

    const mKey = String(meal).toLowerCase() as 'breakfast' | 'lunch' | 'snacks' | 'dinner';
    doc[mKey] = {
      status: Boolean(status),
      markedAt: new Date(),
      markedBy: currentUser?._id,
    };
    doc.updatedBy = currentUser?._id;

    await doc.save();

    res.status(200).json({
      success: true,
      message: `${meal.toUpperCase()} attendance updated successfully.`,
      data: formatAttendanceRecord(doc),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 9. DELETE /api/attendance/:id
 * Authorized: Admin only
 */
export const deleteAttendance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const doc = await Attendance.findByIdAndDelete(id);
    if (!doc) {
      res.status(404).json({
        success: false,
        message: 'Attendance record not found.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Attendance record deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
