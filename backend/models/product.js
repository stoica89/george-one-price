import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "RON" },
    category: { type: String, trim: true },
    sku: { type: String, trim: true, unique: true, sparse: true },
    stock: { type: Number, default: 0, min: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Product = mongoose.model("Product", productSchema);
