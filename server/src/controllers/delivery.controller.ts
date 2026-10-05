import { Request, Response } from 'express';
import Delivery from '../models/Delivery';
import TrackingHistory from '../models/TrackingHistory';

const LOCATION_COORDS: Record<string, { lat: number; lng: number }> = {
  'Warehouse': { lat: 13.0827, lng: 80.2707 },
  'Chennai': { lat: 13.0827, lng: 80.2707 },
  'Coimbatore': { lat: 11.0168, lng: 76.9558 },
  'Madurai': { lat: 9.9252, lng: 78.1198 },
  'Trichy': { lat: 10.7905, lng: 78.7047 },
  'Salem': { lat: 11.6643, lng: 78.1460 },
  'Thanjavur': { lat: 10.7870, lng: 79.1378 },
  'Mayiladuthurai': { lat: 11.1011, lng: 79.6547 },
};

export const getDeliveries = async (req: any, res: Response): Promise<void> => {
  try {
    const query: any = {};
    if (req.user.role === 'DELIVERY_AGENT') {
      query.deliveryAgentId = req.user._id;
    }
    const deliveries = await Delivery.find(query)
      .populate({ path: 'parcelId', populate: [{ path: 'senderId', select: 'name' }, { path: 'receiverId', select: 'name address' }] })
      .populate('deliveryAgentId', 'name email phone')
      .sort({ updatedAt: -1 });
    res.json(deliveries);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getDeliveryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const delivery = await Delivery.findById(req.params.id)
      .populate({ path: 'parcelId', populate: [{ path: 'senderId' }, { path: 'receiverId' }] })
      .populate('deliveryAgentId', 'name email phone');
    if (!delivery) { res.status(404).json({ message: 'Delivery not found' }); return; }
    res.json(delivery);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createDelivery = async (req: any, res: Response): Promise<void> => {
  try {
    const count = await Delivery.countDocuments();
    const deliveryId = `D-${String(count + 1).padStart(3, '0')}`;
    const delivery = await Delivery.create({ ...req.body, deliveryId });
    res.status(201).json(delivery);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateDelivery = async (req: any, res: Response): Promise<void> => {
  try {
    const delivery = await Delivery.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('parcelId')
      .populate('deliveryAgentId', 'name email phone');
    if (!delivery) { res.status(404).json({ message: 'Delivery not found' }); return; }
    res.json(delivery);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateLocation = async (req: any, res: Response): Promise<void> => {
  try {
    const { currentLocation, latitude, longitude, deliveryNotes } = req.body;
    const coords = LOCATION_COORDS[currentLocation] || { lat: latitude || 13.0827, lng: longitude || 80.2707 };

    const delivery = await Delivery.findByIdAndUpdate(
      req.params.id,
      {
        currentLocation,
        latitude: coords.lat,
        longitude: coords.lng,
        deliveryNotes,
        lastUpdated: new Date()
      },
      { new: true }
    ).populate('parcelId');

    if (!delivery) { res.status(404).json({ message: 'Delivery not found' }); return; }

    if (delivery.parcelId) {
      await TrackingHistory.create({
        parcelId: (delivery.parcelId as any)._id,
        status: (delivery.parcelId as any).status,
        location: currentLocation,
        latitude: coords.lat,
        longitude: coords.lng,
        description: deliveryNotes || `Location updated to ${currentLocation}`,
        updatedBy: req.user._id,
        timestamp: new Date()
      });
    }

    res.json(delivery);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const assignAgent = async (req: any, res: Response): Promise<void> => {
  try {
    const { deliveryAgentId } = req.body;
    const delivery = await Delivery.findByIdAndUpdate(
      req.params.id,
      { deliveryAgentId },
      { new: true }
    ).populate('parcelId').populate('deliveryAgentId', 'name email phone');
    if (!delivery) { res.status(404).json({ message: 'Delivery not found' }); return; }
    res.json(delivery);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
