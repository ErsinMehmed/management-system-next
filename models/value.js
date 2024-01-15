import mongoose, { Schema } from "mongoose";

const valueSchema = new Schema({
  fuel_consumption: Number,
  diesel_price: Number,
});

const Value = mongoose.models.Value || mongoose.model("Value", valueSchema);

export default Value;
