import { Request, Response, NextFunction } from 'express';
import { StudentProfile } from '../models/StudentProfile';
import { User } from '../models/User';

export const getStudents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, hostel, dietPreference, status } = req.query;
    const filter: Record<string, any> = {};

    if (hostel) {
      filter.hostel = hostel;
    }

    if (dietPreference) {
      filter.dietPreference = dietPreference;
    }

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: String(search), $options: 'i' } },
        { studentId: { $regex: String(search), $options: 'i' } },
        { email: { $regex: String(search), $options: 'i' } },
        { roomNumber: { $regex: String(search), $options: 'i' } },
      ];
    }

    const profiles = await StudentProfile.find(filter).sort({ createdAt: -1 });

    // Map to the shape expected by frontend student lists
    const mapped = profiles.map((p) => ({
      id: p.id || (p._id as any).toString(),
      name: p.name,
      email: p.email,
      role: 'student' as const,
      studentId: p.studentId,
      roomNo: p.roomNumber,
      hostelBlock: p.hostel,
      messHall: 'Annapurna Dining Hall',
      phone: p.phone,
      dietPreference: p.dietPreference,
      status: p.status,
      year: p.semester,
      branch: p.department,
    }));

    res.status(200).json({
      success: true,
      data: mapped,
    });
  } catch (error) {
    next(error);
  }
};

export const getStudentById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const profile = await StudentProfile.findOne({
      $or: [{ _id: req.params.id }, { studentId: req.params.id }],
    });

    if (!profile) {
      res.status(404).json({
        success: false,
        message: 'Student profile not found.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

export const createStudent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, studentId, department, semester, hostel, roomNumber, phone, dietPreference, password } = req.body;

    if (!name || !email || !studentId) {
      res.status(400).json({
        success: false,
        message: 'Name, email, and studentId are required.',
      });
      return;
    }

    const existingStudent = await StudentProfile.findOne({
      $or: [{ studentId }, { email: email.toLowerCase().trim() }],
    });

    if (existingStudent) {
      res.status(409).json({
        success: false,
        message: 'Student with this ID or email already exists.',
      });
      return;
    }

    // Create User record first
    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password: password || 'Student@123',
      role: 'student',
      studentId,
      phone: phone || '',
      roomNo: roomNumber || 'A-101',
      hostelBlock: hostel || 'Block A (Boys)',
      dietPreference: dietPreference || 'Veg',
      year: semester || 'Year 2',
      branch: department || 'Engineering',
    });

    const studentProfile = await StudentProfile.create({
      userId: user._id,
      studentId,
      name,
      department: department || 'Engineering',
      semester: semester || 'Year 2',
      hostel: hostel || 'Block A (Boys)',
      roomNumber: roomNumber || 'A-101',
      phone: phone || '',
      email: email.toLowerCase().trim(),
      dietPreference: dietPreference || 'Veg',
      status: 'Active',
    });

    res.status(201).json({
      success: true,
      data: studentProfile,
    });
  } catch (error) {
    next(error);
  }
};

export const updateStudent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const profile = await StudentProfile.findOne({
      $or: [{ _id: id }, { studentId: id }],
    });

    if (!profile) {
      res.status(404).json({
        success: false,
        message: 'Student profile not found.',
      });
      return;
    }

    Object.assign(profile, req.body);
    await profile.save();

    // Also update associated User record
    await User.findByIdAndUpdate(profile.userId, {
      name: profile.name,
      phone: profile.phone,
      roomNo: profile.roomNumber,
      hostelBlock: profile.hostel,
      dietPreference: profile.dietPreference,
    });

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteStudent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const profile = await StudentProfile.findOneAndDelete({
      $or: [{ _id: id }, { studentId: id }],
    });

    if (!profile) {
      res.status(404).json({
        success: false,
        message: 'Student not found.',
      });
      return;
    }

    if (profile.userId) {
      await User.findByIdAndDelete(profile.userId);
    }

    res.status(200).json({
      success: true,
      message: 'Student deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
