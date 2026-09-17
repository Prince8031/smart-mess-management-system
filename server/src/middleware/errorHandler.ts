import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  code?: number;
  errors?: any;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle Mongoose duplicate key error (409 Conflict)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys((err as any).keyValue || {})[0] || 'field';
    message = `Duplicate entry: A record with this ${field} already exists.`;
  }

  // Handle Mongoose validation errors (400 Bad Request)
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const validationErrors = Object.values((err as any).errors || {}).map((e: any) => e.message);
    message = validationErrors.join(', ') || 'Validation error';
  }

  // Handle Mongoose CastError / Invalid ObjectId (400 Bad Request)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid resource ID format: ${(err as any).value}`;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authorization token';
  }

  // Log in non-production
  if (process.env.NODE_ENV !== 'production' && statusCode === 500) {
    console.error('Unhandled server error:', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};
