import mongoose, { Schema } from "mongoose";
import Category from "./category.js";

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 100,
    },
    flavor: String,
    weight: Number,
    count: Number,
    availability: Number,
    price: Number,
    hidden: Boolean,
    image_url: String,
    sell_prices: {
      type: [Number],
      required: true,
    },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
  },
  {
    timestamps: true,
  }
);

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;
