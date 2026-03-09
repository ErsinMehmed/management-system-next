import mongoose, { Schema } from "mongoose";
import Product from "./product.js";
import User from "./user.js";

const sellSchema = new Schema(
  {
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    message: String,
    date: { type: Date, required: true, default: Date.now },
    mileage: Number,
    additional_costs: Number,
    fuel_consumption: Number,
    diesel_price: Number,
    fuel_price: Number,
    is_wholesale: Boolean,
    creator: { type: Schema.Types.ObjectId, ref: "User", required: true },
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  },
  {
    timestamps: true,
  }
);

sellSchema.index({ date: -1 });
sellSchema.index({ creator: 1, date: -1 });
sellSchema.index({ product: 1 });

const Sell = mongoose.models.Sell || mongoose.model("Sell", sellSchema);

export default Sell;
