import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripeServer, isStripeConfigured } from "@/lib/stripe";
import { upsertOrder } from "@/lib/orders";
import { recordStripePaidOrderIdempotent } from "@/lib/admin-store";
import type { SplitOrderPreference } from "@/lib/admin-types";

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
      const email =
        session.customer_details?.email ?? session.customer_email ?? "";
      const name = session.customer_details?.name ?? "Cliente STORE 101";
      const phone = session.customer_details?.phone ?? null;

      upsertOrder({
        sessionId: session.id,
        status: session.payment_status === "paid" ? "paid" : "pending",
        customerEmail: email || null,
        customerName: name,
        amountTotalCents: session.amount_total ?? 0,
        currency: session.currency ?? "eur",
        deliveryMode: session.metadata?.deliveryMode ?? "home",
        promoCode: session.metadata?.promoCode || null,
        pfuTotalEur: session.metadata?.pfuTotalEur || null,
        itemsSummary: session.metadata?.itemsSummary || null,
        createdAt: now,
        updatedAt: now,
      });

      // Sincronizzazione idempotente verso CRM, pipeline ordini e scarico magazzino IT/CN
      if (session.payment_status === "paid") {
        let parsedItems: { productId: string; quantity: number }[] = [];
        try {
          if (session.metadata?.itemsJson) {
            const raw = JSON.parse(session.metadata.itemsJson) as unknown;
            if (Array.isArray(raw)) {
              parsedItems = raw.filter(
                (x): x is { productId: string; quantity: number } =>
                  typeof x?.productId === "string" &&
                  typeof x?.quantity === "number"
              );
            }
          }
        } catch {
          parsedItems = [];
        }

        const addr = session.customer_details?.address;
        const formattedAddress = [
          addr?.line1,
          addr?.postal_code,
          addr?.city,
          addr?.country,
        ]
          .filter(Boolean)
          .join(", ");

        const rawSplit = session.metadata?.splitPreference;
        const splitPreference: SplitOrderPreference | null =
          rawSplit === "split_shipments" || rawSplit === "single_consolidated"
            ? rawSplit
            : null;

        recordStripePaidOrderIdempotent({
          stripeEventId: event.id,
          stripeSessionId: session.id,
          customerName: name,
          customerEmail: email || "cliente@store101.it",
          customerPhone: phone,
          shippingAddress: formattedAddress || "Italia",
          deliveryMode:
            session.metadata?.deliveryMode === "partner-workshop"
              ? "partner-workshop"
              : "home",
          splitPreference,
          items: parsedItems,
          totalEur: (session.amount_total ?? 0) / 100,
          pfuTotalEur: Number(session.metadata?.pfuTotalEur ?? 0) || 0,
          shippingEur: Number(session.metadata?.shippingEur ?? 0) || 0,
        });
      }
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
