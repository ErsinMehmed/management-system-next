import mongoose, { Schema } from "mongoose";

const incomeSchema = new Schema(
  {
    amount: Number,
    message: String,
    date: Date,
  },
  {
    timestamps: true,
  }
);

const Income = mongoose.models.Income || mongoose.model("Income", incomeSchema);

export default Income;
