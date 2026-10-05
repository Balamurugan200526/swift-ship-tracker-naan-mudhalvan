import { Request, Response } from 'express';
import AuditLog from '../models/AuditLog';

export const getAuditLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const [logs, total] = await Promise.all([
      AuditLog.find().sort({ timestamp: -1 }).skip(skip).limit(Number(limit)),
      AuditLog.countDocuments()
    ]);
    res.json({ logs, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
