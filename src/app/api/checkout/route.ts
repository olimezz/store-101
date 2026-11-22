import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { calculateOrder, eurToCents } from "@/lib/pricing";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { getStripeServer, isStripeConfigured } from "@/lib/stripe";
import { checkoutRequestSchema } from "@/lib/validation";
import { upsertOrder } from "@/lib/orders";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limit = checkRateLimit(`checkout:${ip}`, {
    windowMs: 5 * 60 * 1000,
    maxRequests: 10,
  });

  if (!limit.allowed) {
    return NextResponse.json(
      {
        error:
          "Troppe richieste di checkout ravvicinate. Riprova tra qualche istante.",
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(limit.retryAfterSeconds),
        },
      }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Payload JSON non valido." },
      { status: 400 }
    );
  }

  const parsed = checkoutRequestSchema.safeParse(body);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return NextResponse.json(
      {
        error: firstIssue?.message ?? "Dati del carrello non validi.",
        details: parsed.error.flatten(),
      },
      { status: 400 }
    );
  }

  const { items, promoCode, customerEmail, deliveryMode } = parsed.data;

  // Ricalcolo prezzi ESCLUSIVAMENTE lato server dal catalogo certificato
  const order = calculateOrder(items, promoCode);

  if (order.lines.length === 0) {
    return NextResponse.json(
      { error: "Nessun prodotto valido presente nel carrello." },
      { status: 400 }
    );
  }

  if (!isStripeConfigured()) {
    return NextResponse.json(
      {
        error:
          "Chiave Stripe lato server non configurata. Inserisci STRIPE_SECRET_KEY in .env.local per attivare il checkout reale.",
        code: "STRIPE_NOT_CONFIGURED",
        serverSummary: {
          grandTotalEur: order.grandTotalEur,
          pfuTotalEur: order.pfuTotalEur,
          shippingEur: order.shippingEur,
          totalQuantity: order.totalQuantity,
        },
      },
      { status: 503 }
    );
  }

  try {
    const stripe = getStripeServer();
    const origin =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
      request.headers.get("origin") ||
      "http://localhost:3000";

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
      order.lines.map((line) => {
        // Calcolo del prezzo unitario netto scontato in caso di treno completo da 4 gomme
        const effectiveUnitCents = Math.round(
          eurToCents(line.lineNetEur) / line.quantity
        );
        const setLabel =
          line.fullSetDiscountEur > 0 ? " • Sconto Treno 4 Gomme (-5%)" : "";

        return {
          quantity: line.quantity,
          price_data: {
            currency: "eur",
            unit_amount: effectiveUnitCents,
            product_data: {
              name: `${line.product.brand} ${line.product.model}`,
              description: `${line.product.seasonLabel} | ${line.product.sizeLabel}${setLabel}`,
              metadata: {
                productId: line.product.id,
                size: line.product.sizeLabel,
              },
            },
          },
        };
      });

    // Contributo ambientale PFU obbligatorio per legge (D.M. 182/2019)
    if (order.pfuTotalEur > 0 && order.totalTires > 0) {
      lineItems.push({
        quantity: order.totalTires,
        price_data: {
          currency: "eur",
          unit_amount: eurToCents(3.5),
          product_data: {
            name: "Contributo Ambientale PFU (Obbligatorio)",
            description:
              "Gestione e recupero pneumatici fuori uso ex D.M. 182/2019 (€3,50/pneumatico)",
          },
        },
      });
    }

    // Eventuale codice promo verificato lato server applicato come sconto one-time Stripe
    let discounts: Stripe.Checkout.SessionCreateParams.Discount[] | undefined;
    if (order.promo?.valid && order.promo.discountEur > 0) {
      const coupon = await stripe.coupons.create({
        amount_off: eurToCents(order.promo.discountEur),
        currency: "eur",
        duration: "once",
        name: order.promo.label,
      });
      discounts = [{ coupon: coupon.id }];
    }

    const itemsSummary = order.lines
      .map(
        (l) =>
          `${l.quantity}x ${l.product.brand} ${l.product.model} (${l.product.sizeLabel})`
      )
      .join(" | ")
      .slice(0, 490);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      locale: "it",
      currency: "eur",
      customer_email: customerEmail,
      line_items: lineItems,
      discounts,
      shipping_address_collection: {
        allowed_countries: ["IT", "SM", "VA", "FR", "DE", "AT", "CH"],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: eurToCents(order.shippingEur),
              currency: "eur",
            },
            display_name:
              order.shippingEur === 0
                ? deliveryMode === "partner-workshop"
                  ? "Spedizione Gratuita presso Officina Partner 24/48h"
                  : "Spedizione Express Gratuita 24/48h"
                : deliveryMode === "partner-workshop"
                  ? "Spedizione Express presso Officina Partner 24/48h"
                  : "Spedizione Express Corriere 24/48h",
            delivery_estimate: {
              minimum: { unit: "business_day", value: 1 },
              maximum: { unit: "business_day", value: 2 },
            },
          },
        },
      ],
      billing_address_collection: "required",
      phone_number_collection: { enabled: true },
      consent_collection: {
        terms_of_service: "required",
      },
      custom_text: {
        terms_of_service_acceptance: {
          message:
            "Confermo di aver letto i [Termini di Vendita](" +
            origin +
            "/termini-e-condizioni) inclusi diritto di recesso 14 giorni e contributo PFU.",
        },
        submit: {
          message:
            "Pagamento crittografato SSL 256-bit gestito in sicurezza da Stripe.",
        },
      },
      metadata: {
        store: "STORE 101",
        deliveryMode,
        promoCode: order.promo?.valid ? order.promo.code : "",
        pfuTotalEur: order.pfuTotalEur.toFixed(2),
        itemsSummary,
      },
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?checkout=cancelled`,
    });

    const now = new Date().toISOString();
    upsertOrder({
      sessionId: session.id,
      status: "pending",
      customerEmail: customerEmail ?? null,
      customerName: null,
      amountTotalCents: eurToCents(order.grandTotalEur),
      currency: "eur",
      deliveryMode,
      promoCode: order.promo?.valid ? order.promo.code : null,
      pfuTotalEur: order.pfuTotalEur.toFixed(2),
      itemsSummary,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("[STORE101 Checkout Error]:", error);
    return NextResponse.json(
      {
        error:
          "Impossibile inizializzare la sessione di pagamento Stripe. Riprova tra pochi secondi.",
      },
      { status: 500 }
    );
  }
}
