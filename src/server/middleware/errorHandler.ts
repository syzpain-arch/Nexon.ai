import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';
import { metricsRegistry } from '../utils/metrics.js';

export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction): void {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error in Jarvis Subsystems';

  logger.error('ErrorHandler', `${req.method} ${req.path} - ${message}`, {
    stack: err.stack,
    statusCode,
  });

  metricsRegistry.recordError(err.name || 'INTERNAL_ERROR', req.path);

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      statusCode,
      timestamp: new Date().toISOString(),
      path: req.path,
    },
  });
}
