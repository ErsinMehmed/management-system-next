import mongoose, { Schema } from "mongoose";

const secondProductSchema = new Schema(
  {
    product:  { type: Schema.Types.ObjectId, ref: "Product", default: null },
    quantity: { type: Number, default: 0 },
    price:    { type: Number, default: 0 },
    payout:   { type: Number, default: 0 },
  },
  { _id: false }
);

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
    payout: { type: Number, default: 0 },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date, default: null },
    deliveryCost: { type: Number, default: 0 },
    secondProduct: { type: secondProductSchema, default: () => ({}) },
    rejectionReason: { type: String, default: "" },
    viewedBySeller: { type: Boolean, default: false },
    statusChangedAt: { type: Date, default: null },
    orderNumber: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const ClientOrder =
  mongoose.models.ClientOrder ||
  mongoose.model("ClientOrder", clientOrderSchema);

export default ClientOrder;
