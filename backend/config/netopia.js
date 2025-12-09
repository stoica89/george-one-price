export const netopiaConfig = {
  merchantId: process.env.NETOPIA_MERCHANT_ID || "",
  privateKey: process.env.NETOPIA_PRIVATE_KEY || "",
  publicKey: process.env.NETOPIA_PUBLIC_KEY || "",
  returnUrl: process.env.NETOPIA_RETURN_URL || "http://localhost:5173/payment/return",
  confirmUrl: process.env.NETOPIA_CONFIRM_URL || "http://localhost:4000/api/payments/netopia/confirm",
  currency: process.env.NETOPIA_CURRENCY || "RON",
};
