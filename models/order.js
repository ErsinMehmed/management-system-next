import mongoose, { Schema } from "mongoose";
import Product from "./product.js";

const orderSchema = new Schema(
  {
    quantity: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 100,
    },
    flavor: String,
    weight: Number,
    count: Number,
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;
