import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { StudentProfile } from '../models/StudentProfile';
import { signToken } from '../utils/jwt';
import { AuthenticatedRequest } from '../middleware/auth';

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
      return;
    }

    // Explicitly select password field
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials.',
      });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact the administrator.',
      });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials.',
      });
      return;
    }

    const token = signToken({
      id: user.id || (user._id as any).toString(),
      role: user.role,
      email: user.email,
      studentId: user.studentId,
    });

    // Set HTTP-only cookie if desired
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id || (user._id as any).toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        phone: user.phone,
        roomNo: user.roomNo,
        hostelBlock: user.hostelBlock,
        messHall: user.messHall,
        dietPreference: user.dietPreference,
        status: user.isActive ? 'Active' : 'Inactive',
        year: user.year,
        branch: user.branch,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const register = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password, role, studentId, phone, roomNo, hostelBlock, dietPreference, department, semester } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.',
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters.',
      });
      return;
    }

    // Role protection: Only authenticated admins can register manager or admin roles
    let assignedRole = 'student';
    if (role && (role === 'admin' || role === 'manager')) {
      if (!req.user || req.user.role !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'Only system administrators can provision admin or manager accounts.',
        });
        return;
      }
      assignedRole = role;
    }

    // Check existing email
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
      return;
    }

    const newUser: any = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password,
      role: assignedRole as 'admin' | 'manager' | 'student',
      studentId: studentId || (assignedRole === 'student' ? `STU-${Date.now().toString().slice(-4)}` : undefined),
      phone,
      roomNo,
      hostelBlock,
      dietPreference: dietPreference || 'Veg',
      branch: department,
      year: semester,
    });

    if (assignedRole === 'student') {
      await StudentProfile.create({
        userId: newUser._id,
        studentId: newUser.studentId || `STU-${Date.now().toString().slice(-4)}`,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone || '',
        roomNumber: newUser.roomNo || 'A-101',
        hostel: newUser.hostelBlock || 'Block A (Boys)',
        department: department || 'Engineering',
        semester: semester || 'Year 2',
        dietPreference: (newUser.dietPreference as any) || 'Veg',
      });
    }

    const token = signToken({
      id: newUser.id || (newUser._id as any).toString(),
      role: newUser.role,
      email: newUser.email,
      studentId: newUser.studentId,
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser.id || (newUser._id as any).toString(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        studentId: newUser.studentId,
        phone: newUser.phone,
        roomNo: newUser.roomNo,
        hostelBlock: newUser.hostelBlock,
        dietPreference: newUser.dietPreference,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      user: {
        id: (req.user as any).id || (req.user as any)._id?.toString(),
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        studentId: req.user.studentId,
        phone: req.user.phone,
        roomNo: req.user.roomNo,
        hostelBlock: req.user.hostelBlock,
        messHall: req.user.messHall,
        dietPreference: req.user.dietPreference,
        status: req.user.isActive ? 'Active' : 'Inactive',
        year: req.user.year,
        branch: req.user.branch,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (_req: Request, res: Response): Promise<void> => {
  res.clearCookie('token');
  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};
