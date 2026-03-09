import mongoose, { Schema } from "mongoose";

const valueSchema = new Schema(
  {
    _id: { type: String, default: "global" },
    fuel_consumption: { type: Number, required: true, min: 0 },
    diesel_price: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

const Value = mongoose.models.Value || mongoose.model("Value", valueSchema);

export default Value;
