import { Request, Response } from 'express';
import Receiver from '../models/Receiver';
import Parcel from '../models/Parcel';

export const getReceivers = async (req: Request, res: Response): Promise<void> => {
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
    const receivers = await Receiver.find(query).sort({ createdAt: -1 });
    res.json(receivers);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createReceiver = async (req: Request, res: Response): Promise<void> => {
  try {
    const receiver = await Receiver.create(req.body);
    res.status(201).json(receiver);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateReceiver = async (req: Request, res: Response): Promise<void> => {
  try {
    const receiver = await Receiver.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!receiver) { res.status(404).json({ message: 'Receiver not found' }); return; }
    res.json(receiver);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteReceiver = async (req: Request, res: Response): Promise<void> => {
  try {
    await Receiver.findByIdAndDelete(req.params.id);
    res.json({ message: 'Receiver deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getReceiverParcels = async (req: Request, res: Response): Promise<void> => {
  try {
    const parcels = await Parcel.find({ receiverId: req.params.id })
      .populate('senderId', 'name email')
      .populate('deliveryId')
      .sort({ createdAt: -1 });
    res.json(parcels);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
