import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

export function isStripeConfigured(): boolean {
  const key = process.env.STRIPE_SECRET_KEY;
  return Boolean(
    key &&
      (key.startsWith("sk_test_") || key.startsWith("sk_live_")) &&
      !key.includes("your_secret_key")
  );
}

export function getStripeServer(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey || !isStripeConfigured()) {
    throw new Error(
      "STRIPE_SECRET_KEY non configurata. Imposta una chiave valida in .env.local (lato server)."
    );
  }

  if (!stripeInstance) {
    stripeInstance = new Stripe(secretKey, {
      apiVersion: "2025-02-24.acacia",
      typescript: true,
      appInfo: {
        name: "STORE 101 E-Commerce",
        version: "1.0.0",
      },
    });
  }

  return stripeInstance;
}
