import React from "react";
import type { Metadata } from "next";
import { getOrderBySessionId } from "@/lib/orders";
import { getStripeServer, isStripeConfigured } from "@/lib/stripe";
import {
  CheckoutSuccessClient,
  type SuccessOrderSummary,
} from "@/components/CheckoutSuccessClient";

export const metadata: Metadata = {
  title: "Ordine Confermato",
  robots: { index: false, follow: false },
};

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; demo?: string }>;
}) {
  const { session_id: sessionId, demo } = await searchParams;

  let summary: SuccessOrderSummary = {
    orderRef: "S101-DEMO-2026",
    isDemo: true,
    status: "paid",
    customerEmail: "cliente@esempio.it",
    customerName: "Cliente STORE 101",
    amountTotalEur: 1115.96,
    deliveryMode: "home",
    pfuTotalEur: "14.00",
    itemsSummary:
      "4x MICHELIN Pilot Sport 4S (245/40R18) — Sconto Treno 4 (-5%) applicato",
  };

  if (sessionId && demo !== "true") {
    const cached = getOrderBySessionId(sessionId);
    if (cached) {
      summary = {
        orderRef: cached.sessionId.slice(-12).toUpperCase(),
        isDemo: false,
        status: cached.status,
        customerEmail: cached.customerEmail,
        customerName: cached.customerName,
        amountTotalEur: cached.amountTotalCents / 100,
        deliveryMode: cached.deliveryMode,
        pfuTotalEur: cached.pfuTotalEur,
        itemsSummary: cached.itemsSummary,
      };
    } else if (isStripeConfigured()) {
      try {
        const stripe = getStripeServer();
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        summary = {
          orderRef: session.id.slice(-12).toUpperCase(),
          isDemo: false,
          status: session.payment_status,
          customerEmail:
            session.customer_details?.email ?? session.customer_email,
          customerName: session.customer_details?.name ?? null,
          amountTotalEur: (session.amount_total ?? 0) / 100,
          deliveryMode: session.metadata?.deliveryMode ?? "home",
          pfuTotalEur: session.metadata?.pfuTotalEur ?? null,
          itemsSummary: session.metadata?.itemsSummary ?? null,
        };
      } catch (err) {
        console.error("[STORE101 CheckoutSuccess] Retrieve session error:", err);
      }
    }
  }

  return <CheckoutSuccessClient summary={summary} />;
}
