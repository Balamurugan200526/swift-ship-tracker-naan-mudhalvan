import mongoose, { Document, Schema } from 'mongoose';

export interface IDelivery extends Document {
  deliveryId: string; parcelId: mongoose.Types.ObjectId;
  deliveryAgentId?: mongoose.Types.ObjectId;
  currentLocation: string; latitude: number; longitude: number;
  estimatedDeliveryDate?: Date; status: string;
  lastUpdated: Date; deliveryNotes?: string;
}

const deliverySchema = new Schema<IDelivery>({
  deliveryId: { type: String, required: true, unique: true },
  parcelId: { type: Schema.Types.ObjectId, ref: 'Parcel', required: true },
  deliveryAgentId: { type: Schema.Types.ObjectId, ref: 'User' },
  currentLocation: { type: String, default: 'Warehouse' },
  latitude: { type: Number, default: 13.0827 },
  longitude: { type: Number, default: 80.2707 },
  estimatedDeliveryDate: { type: Date },
  status: { type: String, default: 'Pending' },
  lastUpdated: { type: Date, default: Date.now },
  deliveryNotes: { type: String }
}, { timestamps: true });

export default mongoose.model<IDelivery>('Delivery', deliverySchema);
