import mongoose, { Schema } from "mongoose";
import Product from "./product.js";

const orderSchema = new Schema(
  {
    quantity: Number,
    total_amount: Number,
    price: Number,
    message: String,
    date: Date,
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;
