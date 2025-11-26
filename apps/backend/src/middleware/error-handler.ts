import type { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { logger } from '../logger';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  logger.error(err, 'Unhandled error');
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    message: err.message ?? 'Internal server error'
  });
}
