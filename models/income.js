import mongoose, { Schema } from "mongoose";
import Distributor from "./distributor.js";

const incomeSchema = new Schema(
  {
    amount: Number,
    message: String,
    distributor: {
      type: Schema.Types.ObjectId,
      ref: "Distributor",
      required: true,
    },
    date: Date,
  },
  {
    timestamps: true,
  }
);

incomeSchema.index({ date: -1 });
incomeSchema.index({ distributor: 1, date: -1 });

const Income = mongoose.models.Income || mongoose.model("Income", incomeSchema);

export default Income;
