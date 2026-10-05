import mongoose, { Document, Schema } from 'mongoose';

export interface ITrackingHistory extends Document {
  parcelId: mongoose.Types.ObjectId; status: string; location: string;
  latitude?: number; longitude?: number; description?: string;
  updatedBy?: mongoose.Types.ObjectId; timestamp: Date;
}

const trackingHistorySchema = new Schema<ITrackingHistory>({
  parcelId: { type: Schema.Types.ObjectId, ref: 'Parcel', required: true },
  status: { type: String, required: true },
  location: { type: String },
  latitude: { type: Number },
  longitude: { type: Number },
  description: { type: String },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model<ITrackingHistory>('TrackingHistory', trackingHistorySchema);
