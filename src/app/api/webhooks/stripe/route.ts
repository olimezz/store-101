import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripeServer, isStripeConfigured } from "@/lib/stripe";
import { upsertOrder } from "@/lib/orders";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Stripe non configurato sul server." },
      { status: 503 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret || webhookSecret.includes("your_webhook_secret")) {
    return NextResponse.json(
      { error: "STRIPE_WEBHOOK_SECRET non configurato." },
      { status: 500 }
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json(
      { error: "Header stripe-signature mancante." },
      { status: 400 }
    );
  }

  const rawBody = await request.text();
  let event: Stripe.Event;

  try {
    const stripe = getStripeServer();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Verifica firma webhook fallita";
    console.error("[STORE101 Stripe Webhook] Invalid signature:", message);
    return NextResponse.json(
      { error: "Firma crittografica Stripe non valida." },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();

  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object as Stripe.Checkout.Session;
      upsertOrder({
        sessionId: session.id,
        status: session.payment_status === "paid" ? "paid" : "pending",
        customerEmail: session.customer_details?.email ?? session.customer_email,
        customerName: session.customer_details?.name ?? null,
        amountTotalCents: session.amount_total ?? 0,
        currency: session.currency ?? "eur",
        deliveryMode: session.metadata?.deliveryMode ?? "home",
        promoCode: session.metadata?.promoCode || null,
        pfuTotalEur: session.metadata?.pfuTotalEur || null,
        itemsSummary: session.metadata?.itemsSummary || null,
        createdAt: now,
        updatedAt: now,
      });
      break;
    }

    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      upsertOrder({
        sessionId: session.id,
        status: "expired",
        customerEmail: session.customer_details?.email ?? session.customer_email,
        customerName: session.customer_details?.name ?? null,
        amountTotalCents: session.amount_total ?? 0,
        currency: session.currency ?? "eur",
        deliveryMode: session.metadata?.deliveryMode ?? "home",
        promoCode: session.metadata?.promoCode || null,
        pfuTotalEur: session.metadata?.pfuTotalEur || null,
        itemsSummary: session.metadata?.itemsSummary || null,
        createdAt: now,
        updatedAt: now,
      });
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
