import mongoose, { Schema } from "mongoose";

const clientOrderSchema = new Schema(
  {
    phone: { type: String, required: true },
    isNewClient: { type: Boolean, default: true },
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    address: { type: String, default: "" },
    note: { type: String, default: "" },
    status: {
      type: String,
      enum: ["нова", "доставена", "отказана"],
      default: "нова",
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User", default: null },
    contactMethod: { type: String, default: "" },
    rejectionReason: { type: String, default: "" },
    viewedBySeller: { type: Boolean, default: false },
    statusChangedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const ClientOrder =
  mongoose.models.ClientOrder ||
  mongoose.model("ClientOrder", clientOrderSchema);

export default ClientOrder;
