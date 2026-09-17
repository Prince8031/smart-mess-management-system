import { Request, Response, NextFunction } from 'express';
import { Menu } from '../models/Menu';

export const getMenu = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { dayOfWeek, category, dietType } = req.query;
    const filter: Record<string, any> = {};

    if (dayOfWeek) {
      filter.dayOfWeek = dayOfWeek;
    }

    if (category) {
      filter.category = category;
    }

    if (dietType) {
      filter.dietType = dietType;
    }

    const items = await Menu.find(filter).sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

export const getMenuById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const item = await Menu.findById(req.params.id);
    if (!item) {
      res.status(404).json({
        success: false,
        message: 'Menu item not found.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

export const createMenu = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, category, items, timing, calories, dietType, allergens, dayOfWeek, date, createdBy } = req.body;

    if (!name || !category || !dayOfWeek) {
      res.status(400).json({
        success: false,
        message: 'Name, category, and dayOfWeek are required.',
      });
      return;
    }

    const menuItem = await Menu.create({
      name,
      category,
      items: Array.isArray(items) ? items : [items],
      timing: timing || (category === 'Breakfast' ? '07:30 AM - 09:30 AM' : category === 'Lunch' ? '12:30 PM - 02:30 PM' : category === 'Snacks' ? '05:00 PM - 06:15 PM' : '07:45 PM - 09:45 PM'),
      calories: Number(calories) || 450,
      dietType: dietType || 'Veg',
      allergens: allergens || [],
      dayOfWeek,
      date,
      createdBy: createdBy || 'Admin',
    });

    res.status(201).json({
      success: true,
      data: menuItem,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMenu = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const item = await Menu.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    if (!item) {
      res.status(404).json({
        success: false,
        message: 'Menu item not found.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMenu = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const item = await Menu.findByIdAndDelete(req.params.id);
    if (!item) {
      res.status(404).json({
        success: false,
        message: 'Menu item not found.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Menu item deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
