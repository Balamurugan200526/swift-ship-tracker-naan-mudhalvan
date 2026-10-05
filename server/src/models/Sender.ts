import mongoose, { Document, Schema } from 'mongoose';

export interface ISender extends Document {
  name: string; address: string; phone: string; email: string;
}

const senderSchema = new Schema<ISender>({
  name: { type: String, required: true, trim: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, lowercase: true, trim: true }
}, { timestamps: true });

export default mongoose.model<ISender>('Sender', senderSchema);
