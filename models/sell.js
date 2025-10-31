import mongoose, { Schema } from "mongoose";
import Product from "./product.js";
import User from "./user.js";

const sellSchema = new Schema(
  {
    quantity: Number,
    price: Number,
    message: String,
    date: Date,
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

const Sell = mongoose.models.Sell || mongoose.model("Sell", sellSchema);

export default Sell;
