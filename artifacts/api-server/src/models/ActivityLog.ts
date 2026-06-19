import mongoose, { type Document } from "mongoose";

export interface IActivityLog extends Document {
  _id: mongoose.Types.ObjectId;
  type: string;
  description: string;
  actor: string;
  actorId?: string;
  createdAt: Date;
}

const activityLogSchema = new mongoose.Schema<IActivityLog>(
  {
    type: { type: String, required: true },
    description: { type: String, required: true },
    actor: { type: String, required: true },
    actorId: { type: String },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

activityLogSchema.index({ createdAt: -1 });

const ActivityLog = mongoose.model<IActivityLog>("ActivityLog", activityLogSchema);
export default ActivityLog;
