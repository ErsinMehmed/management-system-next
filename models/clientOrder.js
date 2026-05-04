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
    revenueConfirmed: { type: Boolean, default: false },
    distributorPayout: { type: Number, default: 0 },
    statusChangedAt: { type: Date, default: null },
    orderNumber: { type: Number, default: 0 },
    coords: {
      lat: { type: Number },
      lng: { type: Number },
      geocodedAt: { type: Date },
    },
  },
  { timestamps: true }
);

clientOrderSchema.index({ status: 1, createdAt: -1 });
clientOrderSchema.index({ assignedTo: 1, status: 1 });
clientOrderSchema.index({ createdAt: -1 });
clientOrderSchema.index({ isPaid: 1, status: 1, assignedTo: 1 });

// Профил на клиента (последни поръчки по телефон)
clientOrderSchema.index({ phone: 1, createdAt: -1 });
// Pagination на seller-а сортирана по дата
clientOrderSchema.index({ assignedTo: 1, createdAt: -1 });
// Seller + статус с time-sort (analytics, history с филтър)
clientOrderSchema.index({ status: 1, assignedTo: 1, createdAt: -1 });
// Lookup по номер на поръчката. Партиален филтър пропуска legacy записи с
// orderNumber=0 (default стойност преди атомарния брояч).
clientOrderSchema.index(
  { orderNumber: 1 },
  { unique: true, partialFilterExpression: { orderNumber: { $gt: 0 } } }
);

const ClientOrder =
  mongoose.models.ClientOrder ||
  mongoose.model("ClientOrder", clientOrderSchema);

export default ClientOrder;
