import mongoose, { Schema } from "mongoose";

const adSchema = new Schema(
  {
    platform: String,
    amount: Number,
    date: Date,
  },
  {
    timestamps: true,
  }
);

const Ad = mongoose.models.Ad || mongoose.model("Ad", adSchema);

export default Ad;
