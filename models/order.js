import mongoose, { Schema } from "mongoose";
import Product from "./product.js";

const orderSchema = new Schema(
  {
    quantity: { type: Number, required: true, min: 1 },
    total_amount: { type: Number, required: true, min: 0 },
    price: { type: Number, required: true, min: 0 },
    message: String,
    date: { type: Date, required: true, default: Date.now },
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  },
  {
    timestamps: true,
  }
);

orderSchema.index({ date: -1 });
orderSchema.index({ product: 1, date: -1 });

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;
