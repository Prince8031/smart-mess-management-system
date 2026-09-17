import { Request, Response, NextFunction } from 'express';
import { Notice } from '../models/Notice';

export const getNotices = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { targetAudience, priority } = req.query;
    const filter: Record<string, any> = {};

    if (targetAudience && targetAudience !== 'All') {
      filter.$or = [{ targetAudience }, { targetAudience: 'All' }];
    }

    if (priority) {
      filter.priority = priority;
    }

    const notices = await Notice.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: notices,
    });
  } catch (error) {
    next(error);
  }
};

export const createNotice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, description, priority, postedBy, authorRole, targetAudience } = req.body;

    if (!title || !description) {
      res.status(400).json({
        success: false,
        message: 'Title and description are required.',
      });
      return;
    }

    const notice = await Notice.create({
      title,
      description,
      priority: priority || 'Normal',
      postedBy: postedBy || 'Mess Admin Office',
      authorRole: authorRole || 'Admin',
      targetAudience: targetAudience || 'All',
      date: new Date().toISOString().split('T')[0],
    });

    res.status(201).json({
      success: true,
      data: notice,
    });
  } catch (error) {
    next(error);
  }
};

export const updateNotice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const notice = await Notice.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    if (!notice) {
      res.status(404).json({
        success: false,
        message: 'Notice not found.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: notice,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteNotice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const notice = await Notice.findByIdAndDelete(req.params.id);
    if (!notice) {
      res.status(404).json({
        success: false,
        message: 'Notice not found.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Notice removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};
