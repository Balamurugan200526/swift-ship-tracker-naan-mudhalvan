import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export interface AuthRequest extends Request {
  user?: any;
  headers: any;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = (req.headers && req.headers.authorization) || (typeof req.header === 'function' ? req.header('authorization') : undefined);
    const token = typeof authHeader === 'string' ? authHeader.split(' ')[1] : undefined;
    if (!token) { res.status(401).json({ message: 'No token provided' }); return; }
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'swiftship_secret_key_2024');
    const user = await User.findById(decoded.id).select('-password');
    if (!user || !user.isActive) { res.status(401).json({ message: 'Unauthorized' }); return; }
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
      return;
    }
    next();
  };
};
