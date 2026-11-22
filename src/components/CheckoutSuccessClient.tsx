"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  PackageCheck,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatEur } from "@/lib/utils";

export interface SuccessOrderSummary {
  orderRef: string;
  isDemo: boolean;
  status: string;
  customerEmail: string | null;
  customerName: string | null;
  amountTotalEur: number;
  deliveryMode: string;
  pfuTotalEur: string | null;
  itemsSummary: string | null;
}

export function CheckoutSuccessClient({
  summary,
}: {
  summary: SuccessOrderSummary;
}) {
  const { clearCart } = useCart();

  useEffect(() => {
    if (!summary.isDemo) {
      clearCart();
    }
  }, [clearCart, summary.isDemo]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
      <div className="overflow-hidden rounded-3xl border border-[#E2E8F0] bg-white shadow-card-hover">
        <div
          className="px-6 py-8 text-center text-white sm:px-10"
          style={{
            background:
              "linear-gradient(125deg, #0F172A 0%, #10255E 60%, #0052FF 100%)",
          }}
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#10B981] text-white shadow-lg">
            <CheckCircle2 className="h-9 w-9" aria-hidden="true" />
          </div>
          {summary.isDemo ? (
            <span className="mt-4 inline-block rounded-full bg-[#FF5A1F] px-3 py-1 text-xs font-extrabold uppercase tracking-wider">
              Modalità Anteprima Conferma Ordine
            </span>
          ) : null}
          <h1
            className="mt-4 font-display font-extrabold uppercase tracking-tight"
            style={{ fontSize: "clamp(1.6rem, 3vw, 2.3rem)" }}
          >
            Ordine Confermato!
          </h1>
          <p className="mt-2 text-sm text-slate-200 sm:text-base">
            Grazie per aver scelto STORE 101. Il pagamento Stripe è stato
            verificato e il magazzino sta preparando i tuoi pneumatici.
          </p>
        </div>

        <div className="space-y-6 p-6 sm:p-10">
          <div className="grid grid-cols-1 gap-4 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-5 text-sm sm:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#475569]">
                Riferimento Ordine
              </p>
              <p className="mt-1 font-mono text-sm font-bold text-[#0F172A]">
                {summary.orderRef}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#475569]">
                Totale Pagato (IVA &amp; PFU inclusi)
              </p>
              <p className="mt-1 font-display text-xl font-extrabold tabular-nums text-[#0052FF]">
                {formatEur(summary.amountTotalEur)}
              </p>
            </div>
            {summary.customerEmail ? (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#475569]">
                  Email ricevuta
                </p>
                <p className="mt-1 font-semibold text-[#0F172A]">
                  {summary.customerEmail}
                </p>
              </div>
            ) : null}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#475569]">
                Modalità consegna
              </p>
              <p className="mt-1 font-semibold text-[#0F172A]">
                {summary.deliveryMode === "partner-workshop"
                  ? "Consegna presso Officina Partner"
                  : "Spedizione Express a domicilio (24/48h)"}
              </p>
            </div>
          </div>

          {summary.itemsSummary ? (
            <div className="rounded-2xl border border-[#E2E8F0] p-5">
              <h2 className="flex items-center gap-2 font-display text-sm font-extrabold uppercase tracking-wider text-[#0F172A]">
                <PackageCheck className="h-4 w-4 text-[#0052FF]" />
                Riepilogo Articoli
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[#475569]">
                {summary.itemsSummary}
              </p>
              {summary.pfuTotalEur ? (
                <p className="mt-2 text-xs font-medium text-[#475569]">
                  Incluso contributo ambientale PFU di legge: €
                  {summary.pfuTotalEur.replace(".", ",")}
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-3 text-xs text-[#475569] sm:grid-cols-2">
            <div className="flex items-center gap-2.5 rounded-xl bg-[#F8FAFC] p-3.5 ring-1 ring-[#E2E8F0]">
              <Truck className="h-5 w-5 shrink-0 text-[#FF5A1F]" />
              <span>
                Riceverai il codice di tracciamento corriere entro poche ore
                dalla spedizione.
              </span>
            </div>
            <div className="flex items-center gap-2.5 rounded-xl bg-[#F8FAFC] p-3.5 ring-1 ring-[#E2E8F0]">
              <ShieldCheck className="h-5 w-5 shrink-0 text-[#10B981]" />
              <span>
                Hai 14 giorni di diritto di recesso e 24 mesi di garanzia
                legale su ogni pneumatico.
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Link
              href="/"
              className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl bg-[#0052FF] px-6 text-sm font-extrabold uppercase tracking-wide text-white hover:bg-[#003ECC]"
            >
              <span>Torna allo Store</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/termini-e-condizioni"
              className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-[#E2E8F0] px-6 text-sm font-bold text-[#0F172A] hover:bg-slate-50"
            >
              Condizioni &amp; Resi
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
