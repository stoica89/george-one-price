import { v4 as uuid } from "uuid";
import { Order } from "../models/order.js";
import { netopiaConfig } from "../config/netopia.js";

function ensureConfig() {
  if (!netopiaConfig.merchantId || !netopiaConfig.privateKey) {
    throw new Error("Netopia config missing. Set NETOPIA_MERCHANT_ID and NETOPIA_PRIVATE_KEY.");
  }
}

function calculateTotals(items = []) {
  const total = items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);
  return { total, currency: items[0]?.currency || netopiaConfig.currency || "RON" };
}

export async function initiateNetopiaPayment(req, res, next) {
  try {
    ensureConfig();
    const { orderId, items = [], customer = {} } = req.body || {};

    let order = null;
    if (orderId) {
      order = await Order.findById(orderId);
    }

    if (!order) {
      const { total, currency } = calculateTotals(items);
      if (!items.length || total <= 0) {
        return res.status(400).json({ error: "Invalid items" });
      }

      order = await Order.create({
        items,
        totalAmount: total,
        currency,
        customer,
        status: "pending",
      });
    }

    const paymentReference = uuid();

    // NOTE: In productie trebuie semnatura digitala cu cheia privata Netopia si payload conform docs.
    const payload = {
      merchantId: netopiaConfig.merchantId,
      amount: order.totalAmount,
      currency: order.currency,
      orderId: order.id,
      paymentReference,
      description: `Comanda ${order.id}`,
      returnUrl: netopiaConfig.returnUrl,
      confirmUrl: netopiaConfig.confirmUrl,
      signature: "TODO_sign_with_private_key",
    };

    order.payment = {
      provider: "netopia",
      providerOrderId: paymentReference,
    };
    await order.save();

    res.json({ orderId: order.id, payment: payload });
  } catch (err) {
    next(err);
  }
}

export async function confirmNetopiaPayment(req, res, next) {
  try {
    const { orderId, status, transactionId } = req.body || {};
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });

    order.status = status || "paid";
    order.payment = {
      ...order.payment,
      transactionId,
      raw: req.body,
    };
    await order.save();

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}
