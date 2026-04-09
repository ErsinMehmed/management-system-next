import mongoose, { Schema } from "mongoose";

const orderTemplateSchema = new Schema(
  {
    name: { type: String, required: true },
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1 },
    message: { type: String, default: "" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

orderTemplateSchema.index({ createdBy: 1 });

const OrderTemplate =
  mongoose.models.OrderTemplate || mongoose.model("OrderTemplate", orderTemplateSchema);

export default OrderTemplate;
