import { Request, Response } from 'express';
import Sender from '../models/Sender';
import Parcel from '../models/Parcel';

export const getSenders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search } = req.query;
    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    const senders = await Sender.find(query).sort({ createdAt: -1 });
    res.json(senders);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createSender = async (req: Request, res: Response): Promise<void> => {
  try {
    const sender = await Sender.create(req.body);
    res.status(201).json(sender);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateSender = async (req: Request, res: Response): Promise<void> => {
  try {
    const sender = await Sender.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!sender) { res.status(404).json({ message: 'Sender not found' }); return; }
    res.json(sender);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteSender = async (req: Request, res: Response): Promise<void> => {
  try {
    await Sender.findByIdAndDelete(req.params.id);
    res.json({ message: 'Sender deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getSenderParcels = async (req: Request, res: Response): Promise<void> => {
  try {
    const parcels = await Parcel.find({ senderId: req.params.id })
      .populate('receiverId', 'name email')
      .populate('deliveryId')
      .sort({ createdAt: -1 });
    res.json(parcels);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
