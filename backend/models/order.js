import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    currency: { type: String, default: "RON" },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    items: { type: [orderItemSchema], default: [] },
    totalAmount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "RON" },
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "canceled"],
      default: "pending",
    },
    customer: {
      name: String,
      email: String,
      phone: String,
      address: String,
      city: String,
      country: String,
    },
    payment: {
      provider: { type: String, default: "netopia" },
      providerOrderId: String,
      transactionId: String,
      raw: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);
