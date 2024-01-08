import mongoose, { Schema } from "mongoose";
import Product from "./product.js";

const sellSchema = new Schema(
  {
    quantity: Number,
    price: Number,
    message: String,
    date: Date,
    mileage: Number,
    fuel_consumption: Number,
    diesel_price: Number,
    fuel_price: Number,

    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  },
  {
    timestamps: true,
  }
);

const Sell = mongoose.models.Sell || mongoose.model("Sell", sellSchema);

export default Sell;
