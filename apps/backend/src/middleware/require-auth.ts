import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import { config } from '../config';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    username: string;
    displayName?: string;
    role?: string;
  };
}

function normalizeRole(role?: string) {
  if (!role) return role;
  return role.toLowerCase().replace(/_/g, '-');
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = req.cookies.cova_token || req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Unauthorized' });
  }

  try {
    const payload = jwt.verify(token, config.jwt.secret) as AuthenticatedRequest['user'];
    req.user = payload ? { ...payload, role: normalizeRole(payload.role) } : payload;
    return next();
  } catch (error) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Invalid token' });
  }
}
