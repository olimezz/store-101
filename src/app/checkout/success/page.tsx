import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";
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
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;

  let summary: SuccessOrderSummary | null = null;

  if (sessionId) {
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

  if (!summary) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <div className="rounded-3xl border border-[#E2E8F0] bg-white p-8 shadow-card">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            <AlertCircle className="h-7 w-7" aria-hidden="true" />
          </div>
          <h1 className="mt-4 font-display text-2xl font-extrabold text-[#0F172A]">
            Sessione ordine non trovata
          </h1>
          <p className="mt-2 text-sm text-[#475569]">
            Questa pagina mostra il riepilogo esclusivamente dopo un pagamento
            verificato su Stripe.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-[#0052FF] px-6 text-sm font-bold text-white hover:bg-[#003ECC]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Torna a STORE 101
          </Link>
        </div>
      </div>
    );
  }

  return <CheckoutSuccessClient summary={summary} />;
}
