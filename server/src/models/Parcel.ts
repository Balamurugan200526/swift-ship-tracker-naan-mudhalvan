import mongoose, { Document, Schema } from 'mongoose';

export type ParcelStatus = 'Booked' | 'In Transit' | 'Out for Delivery' | 'Delivered' | 'Delayed' | 'Cancelled';

export interface IParcel extends Document {
  parcelId: string; status: ParcelStatus; weight: number;
  description?: string; estimatedDeliveryDate: Date;
  senderId: mongoose.Types.ObjectId; receiverId: mongoose.Types.ObjectId;
  deliveryId?: mongoose.Types.ObjectId; customerId?: mongoose.Types.ObjectId;
}

const parcelSchema = new Schema<IParcel>({
  parcelId: { type: String, required: true, unique: true, uppercase: true },
  status: { type: String, enum: ['Booked', 'In Transit', 'Out for Delivery', 'Delivered', 'Delayed', 'Cancelled'], default: 'Booked' },
  weight: { type: Number, required: true, min: 0.1 },
  description: { type: String },
  estimatedDeliveryDate: { type: Date, required: true },
  senderId: { type: Schema.Types.ObjectId, ref: 'Sender', required: true },
  receiverId: { type: Schema.Types.ObjectId, ref: 'Receiver', required: true },
  deliveryId: { type: Schema.Types.ObjectId, ref: 'Delivery' },
  customerId: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

parcelSchema.index({ parcelId: 1 });
parcelSchema.index({ status: 1 });

export default mongoose.model<IParcel>('Parcel', parcelSchema);
