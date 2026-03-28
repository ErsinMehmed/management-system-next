import mongoose, { Schema } from "mongoose";

const clientPhoneSchema = new Schema(
  {
    phone: { type: String, required: true, unique: true, trim: true },
    name: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

const ClientPhone =
  mongoose.models.ClientPhone || mongoose.model("ClientPhone", clientPhoneSchema);

export default ClientPhone;
