import { Order } from "../models/order.js";

export async function listOrders(_req, res) {
  const orders = await Order.find({}).sort({ createdAt: -1 });
  res.json(orders);
}

export async function getOrder(req, res) {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });
  res.json(order);
}
