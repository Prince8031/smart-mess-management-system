import { Request, Response, NextFunction } from 'express';
import { Inventory } from '../models/Inventory';

export const getInventory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { category, status, search } = req.query;
    const filter: Record<string, any> = {};

    if (category) filter.category = category;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { itemName: { $regex: String(search), $options: 'i' } },
        { category: { $regex: String(search), $options: 'i' } },
        { supplier: { $regex: String(search), $options: 'i' } },
      ];
    }

    const items = await Inventory.find(filter).sort({ itemName: 1 });

    res.status(200).json({
      success: true,
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

export const createInventory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { itemName, name, category, quantity, unit, minimumStock, supplier, costPerUnit, updatedBy } = req.body;

    const resolvedName = itemName || name;
    if (!resolvedName) {
      res.status(400).json({
        success: false,
        message: 'Item name is required.',
      });
      return;
    }

    const item = await Inventory.create({
      itemName: resolvedName,
      category: category || 'Grains & Pulses',
      quantity: Number(quantity) || 0,
      unit: unit || 'kg',
      minimumStock: Number(minimumStock) || 10,
      supplier: supplier || 'Local Vendor',
      costPerUnit: Number(costPerUnit) || 0,
      updatedBy: updatedBy || 'Mess Manager',
      lastRestocked: new Date().toISOString().split('T')[0],
    });

    res.status(201).json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

export const updateInventory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) {
      res.status(404).json({
        success: false,
        message: 'Inventory item not found.',
      });
      return;
    }

    const { itemName, name, category, quantity, unit, minimumStock, supplier, costPerUnit, updatedBy } = req.body;

    if (itemName || name) item.itemName = itemName || name;
    if (category) item.category = category;
    if (quantity !== undefined) item.quantity = Number(quantity);
    if (unit) item.unit = unit;
    if (minimumStock !== undefined) item.minimumStock = Number(minimumStock);
    if (supplier) item.supplier = supplier;
    if (costPerUnit !== undefined) item.costPerUnit = Number(costPerUnit);
    if (updatedBy) item.updatedBy = updatedBy;
    item.lastRestocked = new Date().toISOString().split('T')[0];

    // Triggers pre-save status recalculation
    await item.save();

    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteInventory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const item = await Inventory.findByIdAndDelete(req.params.id);
    if (!item) {
      res.status(404).json({
        success: false,
        message: 'Inventory item not found.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Inventory item removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};
