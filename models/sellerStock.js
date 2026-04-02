import mongoose, { Schema } from "mongoose";

const sellerStockSchema = new Schema(
  {
    seller: { type: Schema.Types.ObjectId, ref: "User", required: true },
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    stock: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

sellerStockSchema.index({ seller: 1, product: 1 }, { unique: true });

const SellerStock =
  mongoose.models.SellerStock || mongoose.model("SellerStock", sellerStockSchema);

export default SellerStock;
