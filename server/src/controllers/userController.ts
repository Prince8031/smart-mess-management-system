import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { StudentProfile } from '../models/StudentProfile';

export const getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { role, search, status } = req.query;
    const filter: Record<string, any> = {};

    if (role) {
      filter.role = role;
    }

    if (status) {
      filter.isActive = status === 'Active';
    }

    if (search) {
      filter.$or = [
        { name: { $regex: String(search), $options: 'i' } },
        { email: { $regex: String(search), $options: 'i' } },
        { studentId: { $regex: String(search), $options: 'i' } },
      ];
    }

    const users = await User.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { password, email, ...updateData } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found.',
      });
      return;
    }

    // If password provided, update it
    if (password && password.trim().length >= 6) {
      user.password = password;
    }

    Object.assign(user, updateData);
    await user.save();

    // Also sync with StudentProfile if user is a student
    if (user.role === 'student' && user.studentId) {
      await StudentProfile.findOneAndUpdate(
        { studentId: user.studentId },
        {
          name: user.name,
          phone: user.phone,
          roomNumber: user.roomNo,
          hostel: user.hostelBlock,
          dietPreference: user.dietPreference,
        }
      );
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found.',
      });
      return;
    }

    if (user.studentId) {
      await StudentProfile.findOneAndDelete({ studentId: user.studentId });
    }

    res.status(200).json({
      success: true,
      message: 'User removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};
