import { Request, Response, NextFunction } from 'express';
import { Complaint } from '../models/Complaint';
import { StudentProfile } from '../models/StudentProfile';

export const getComplaints = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, category, priority, studentId } = req.query;
    const filter: Record<string, any> = {};

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    if (studentId) filter.$or = [{ studentId }, { rollNo: studentId }];

    const complaints = await Complaint.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: complaints,
    });
  } catch (error) {
    next(error);
  }
};

export const getStudentComplaints = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { studentId } = req.params;
    const complaints = await Complaint.find({
      $or: [{ studentId }, { rollNo: studentId }],
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: complaints,
    });
  } catch (error) {
    next(error);
  }
};

export const createComplaint = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { studentId, rollNo, title, description, category, priority } = req.body;

    const resolvedRoll = rollNo || studentId;
    if (!title || !description) {
      res.status(400).json({
        success: false,
        message: 'Title and description are required.',
      });
      return;
    }

    const student = await StudentProfile.findOne({
      $or: [{ studentId: resolvedRoll }, { studentId }],
    });

    const complaint = await Complaint.create({
      studentId: student?.studentId || resolvedRoll || 'STU-1001',
      rollNo: student?.studentId || resolvedRoll || 'STU-1001',
      studentName: student?.name || 'Student',
      title,
      description,
      category: category || 'Food Quality',
      priority: priority || 'Normal',
      status: 'Pending',
      date: new Date().toISOString().split('T')[0],
    });

    res.status(201).json({
      success: true,
      data: complaint,
    });
  } catch (error) {
    next(error);
  }
};

export const updateComplaint = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const complaint = await Complaint.findById(id);

    if (!complaint) {
      res.status(404).json({
        success: false,
        message: 'Complaint record not found.',
      });
      return;
    }

    const { status, response, resolutionNotes, adminNotes, priority } = req.body;

    if (status) complaint.status = status;
    if (response !== undefined) complaint.response = response;
    if (resolutionNotes !== undefined) complaint.resolutionNotes = resolutionNotes;
    if (adminNotes !== undefined) complaint.adminNotes = adminNotes;
    if (priority) complaint.priority = priority;

    await complaint.save();

    res.status(200).json({
      success: true,
      data: complaint,
    });
  } catch (error) {
    next(error);
  }
};
