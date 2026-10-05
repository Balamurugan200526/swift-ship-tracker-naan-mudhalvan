import { Request, Response } from 'express';
import Notification from '../models/Notification';

export const getNotifications = async (req: any, res: Response): Promise<void> => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    const unreadCount = await Notification.countDocuments({ userId: req.user._id, read: false });
    res.json({ notifications, unreadCount });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const markAsRead = async (req: any, res: Response): Promise<void> => {
  try {
    if (req.params.id === 'all') {
      await Notification.updateMany({ userId: req.user._id }, { read: true });
    } else {
      await Notification.findByIdAndUpdate(req.params.id, { read: true });
    }
    res.json({ message: 'Marked as read' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
