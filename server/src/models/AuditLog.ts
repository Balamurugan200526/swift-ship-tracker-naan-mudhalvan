import mongoose, { Document, Schema } from 'mongoose';

export interface IAuditLog extends Document {
  actor?: mongoose.Types.ObjectId; actorName?: string;
  action: string; entityType: string; entityId?: string;
  oldValue?: any; newValue?: any; timestamp: Date;
}

const auditLogSchema = new Schema<IAuditLog>({
  actor: { type: Schema.Types.ObjectId, ref: 'User' },
  actorName: { type: String },
  action: { type: String, required: true },
  entityType: { type: String, required: true },
  entityId: { type: String },
  oldValue: { type: Schema.Types.Mixed },
  newValue: { type: Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
