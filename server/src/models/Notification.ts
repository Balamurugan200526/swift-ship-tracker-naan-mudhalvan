import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId; message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean; parcelId?: string;
}

const notificationSchema = new Schema<INotification>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['info', 'success', 'warning', 'error'], default: 'info' },
  read: { type: Boolean, default: false },
  parcelId: { type: String }
}, { timestamps: true });

export default mongoose.model<INotification>('Notification', notificationSchema);
