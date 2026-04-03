import mongoose, { Schema } from "mongoose";

const notificationSchema = new Schema(
  {
    type:            { type: String, required: true },          // created | updated | deleted
    orderId:         { type: String, required: true },
    orderNumber:     { type: Number, default: 0 },
    changedBy:       { type: String, default: "" },             // name
    changedByUserId: { type: String, required: true },
    assignedTo:      { type: String, default: null },           // seller userId (null = unassigned)
    change:          { type: String, default: null },           // 'edit' | 'status'
    status:          { type: String, default: null },
    readBy:          [{ type: String }],                        // userIds
  },
  { timestamps: true }
);

notificationSchema.index({ assignedTo: 1, createdAt: -1 });
notificationSchema.index({ changedByUserId: 1, createdAt: -1 });
notificationSchema.index({ createdAt: -1 });

const Notification =
  mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);

export default Notification;
