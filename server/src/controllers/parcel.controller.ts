import { Request, Response } from 'express';
import Parcel from '../models/Parcel';
import Delivery from '../models/Delivery';
import TrackingHistory from '../models/TrackingHistory';
import Notification from '../models/Notification';
import AuditLog from '../models/AuditLog';

const LOCATION_COORDS: Record<string, { lat: number; lng: number }> = {
  'Warehouse': { lat: 13.0827, lng: 80.2707 },
  'Chennai': { lat: 13.0827, lng: 80.2707 },
  'Coimbatore': { lat: 11.0168, lng: 76.9558 },
  'Madurai': { lat: 9.9252, lng: 78.1198 },
  'Trichy': { lat: 10.7905, lng: 78.7047 },
  'Salem': { lat: 11.6643, lng: 78.1460 },
  'Thanjavur': { lat: 10.7870, lng: 79.1378 },
  'Mayiladuthurai': { lat: 11.1011, lng: 79.6547 },
  'Vellore': { lat: 12.9165, lng: 79.1325 },
  'Erode': { lat: 11.3410, lng: 77.7172 },
};

const generateParcelId = async (): Promise<string> => {
  const count = await Parcel.countDocuments();
  const num = String(count + 1).padStart(3, '0');
  let id = `P-${num}`;
  // ensure uniqueness
  let exists = await Parcel.findOne({ parcelId: id });
  let attempts = 0;
  while (exists && attempts < 100) {
    attempts++;
    const newNum = String(count + 1 + attempts).padStart(3, '0');
    id = `P-${newNum}`;
    exists = await Parcel.findOne({ parcelId: id });
  }
  return id;
};

export const getParcels = async (req: any, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const query: any = {};

    if (req.user.role === 'CUSTOMER') {
      query.customerId = req.user._id;
    }
    if (status && status !== 'all') query.status = status;
    if (search) {
      query.$or = [{ parcelId: { $regex: search, $options: 'i' } }];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [parcels, total] = await Promise.all([
      Parcel.find(query)
        .populate('senderId', 'name email phone address')
        .populate('receiverId', 'name email phone address')
        .populate({ path: 'deliveryId', populate: { path: 'deliveryAgentId', select: 'name email phone' } })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Parcel.countDocuments(query)
    ]);

    res.json({ parcels, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getParcelById = async (req: any, res: Response): Promise<void> => {
  try {
    const parcel = await Parcel.findOne({
      $or: [
        { _id: req.params.id.match(/^[a-f\d]{24}$/i) ? req.params.id : null },
        { parcelId: req.params.id.toUpperCase() }
      ].filter(Boolean)
    })
      .populate('senderId')
      .populate('receiverId')
      .populate({ path: 'deliveryId', populate: { path: 'deliveryAgentId', select: 'name email phone' } });

    if (!parcel) {
      res.status(404).json({ message: 'Parcel not found' });
      return;
    }
    if (req.user?.role === 'CUSTOMER' && parcel.customerId?.toString() !== req.user._id.toString()) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }
    const history = await TrackingHistory.find({ parcelId: parcel._id }).sort({ timestamp: 1 });
    res.json({ parcel, history });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const trackParcel = async (req: Request, res: Response): Promise<void> => {
  try {
    const parcelId = req.params.parcelId.toUpperCase();
    const parcel = await Parcel.findOne({ parcelId })
      .populate('senderId', 'name phone')
      .populate('receiverId', 'name phone address')
      .populate({ path: 'deliveryId', populate: { path: 'deliveryAgentId', select: 'name phone' } });

    if (!parcel) {
      res.status(404).json({ message: `No parcel found with ID ${parcelId}` });
      return;
    }
    const history = await TrackingHistory.find({ parcelId: parcel._id }).sort({ timestamp: 1 });
    res.json({ parcel, history });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createParcel = async (req: any, res: Response): Promise<void> => {
  try {
    const parcelId = await generateParcelId();
    const parcelData: any = { ...req.body, parcelId };
    if (req.user.role === 'CUSTOMER') parcelData.customerId = req.user._id;

    const parcel = await Parcel.create(parcelData);

    // Tracking history entry
    await TrackingHistory.create({
      parcelId: parcel._id,
      status: 'Booked',
      location: 'Warehouse, Chennai',
      latitude: 13.0827,
      longitude: 80.2707,
      description: 'Parcel received and booked at warehouse',
      updatedBy: req.user._id,
      timestamp: new Date()
    });

    // Audit log
    await AuditLog.create({
      actor: req.user._id,
      actorName: req.user.name,
      action: 'CREATE_PARCEL',
      entityType: 'Parcel',
      entityId: parcelId,
      newValue: { parcelId, status: 'Booked', weight: parcel.weight }
    });

    // Delivery record
    const deliveryCount = await Delivery.countDocuments();
    const deliveryId = `D-${String(deliveryCount + 1).padStart(3, '0')}`;
    const delivery = await Delivery.create({
      deliveryId,
      parcelId: parcel._id,
      estimatedDeliveryDate: parcel.estimatedDeliveryDate,
      status: 'Pending',
      currentLocation: 'Warehouse, Chennai',
      latitude: 13.0827,
      longitude: 80.2707
    });

    await Parcel.findByIdAndUpdate(parcel._id, { deliveryId: delivery._id });

    // Notification for customer
    if (parcel.customerId) {
      await Notification.create({
        userId: parcel.customerId,
        message: `📦 Your parcel ${parcelId} has been booked successfully! Track it anytime.`,
        type: 'success',
        parcelId
      });
    }

    const populated = await Parcel.findById(parcel._id)
      .populate('senderId').populate('receiverId').populate('deliveryId');
    res.status(201).json(populated);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateParcel = async (req: any, res: Response): Promise<void> => {
  try {
    const parcel = await Parcel.findById(req.params.id);
    if (!parcel) { res.status(404).json({ message: 'Parcel not found' }); return; }

    const oldStatus = parcel.status;
    const updated = await Parcel.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('senderId').populate('receiverId').populate('deliveryId');

    await AuditLog.create({
      actor: req.user._id,
      actorName: req.user.name,
      action: 'UPDATE_PARCEL',
      entityType: 'Parcel',
      entityId: parcel.parcelId,
      oldValue: { status: oldStatus },
      newValue: req.body
    });
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateParcelStatus = async (req: any, res: Response): Promise<void> => {
  try {
    const { status, location, notes } = req.body;
    const parcel = await Parcel.findById(req.params.id);
    if (!parcel) { res.status(404).json({ message: 'Parcel not found' }); return; }

    const oldStatus = parcel.status;
    parcel.status = status;
    await parcel.save();

    const coords = LOCATION_COORDS[location] || LOCATION_COORDS['Warehouse'];

    // Tracking history
    await TrackingHistory.create({
      parcelId: parcel._id,
      status,
      location: location || 'Unknown',
      latitude: coords.lat,
      longitude: coords.lng,
      description: notes || `Status updated to ${status}`,
      updatedBy: req.user._id,
      timestamp: new Date()
    });

    // Update delivery
    if (parcel.deliveryId) {
      await Delivery.findByIdAndUpdate(parcel.deliveryId, {
        status,
        currentLocation: location || 'Unknown',
        latitude: coords.lat,
        longitude: coords.lng,
        lastUpdated: new Date(),
        deliveryNotes: notes
      });
    }

    // Notification for customer
    if (parcel.customerId) {
      const notifMessages: Record<string, string> = {
        'In Transit': `🚚 Your parcel ${parcel.parcelId} is now In Transit!`,
        'Out for Delivery': `🛵 Your parcel ${parcel.parcelId} is Out for Delivery! Expect it today.`,
        'Delivered': `✅ Your parcel ${parcel.parcelId} has been Delivered successfully!`,
        'Delayed': `⚠️ Your parcel ${parcel.parcelId} has been Delayed. We apologize for the inconvenience.`,
        'Cancelled': `❌ Your parcel ${parcel.parcelId} has been Cancelled.`
      };
      if (notifMessages[status]) {
        await Notification.create({
          userId: parcel.customerId,
          message: notifMessages[status],
          type: status === 'Delayed' || status === 'Cancelled' ? 'warning' : status === 'Delivered' ? 'success' : 'info',
          parcelId: parcel.parcelId
        });
      }
    }

    // Audit log
    await AuditLog.create({
      actor: req.user._id,
      actorName: req.user.name,
      action: 'STATUS_UPDATE',
      entityType: 'Parcel',
      entityId: parcel.parcelId,
      oldValue: { status: oldStatus },
      newValue: { status, location, notes }
    });

    const updated = await Parcel.findById(parcel._id)
      .populate('senderId').populate('receiverId').populate('deliveryId');
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteParcel = async (req: any, res: Response): Promise<void> => {
  try {
    const parcel = await Parcel.findById(req.params.id);
    if (!parcel) { res.status(404).json({ message: 'Parcel not found' }); return; }
    await Parcel.findByIdAndDelete(req.params.id);

    await AuditLog.create({
      actor: req.user._id,
      actorName: req.user.name,
      action: 'DELETE_PARCEL',
      entityType: 'Parcel',
      entityId: parcel.parcelId
    });
    res.json({ message: 'Parcel deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
