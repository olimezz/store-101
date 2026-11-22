"use client";

import React from "react";
import { ArrowRight, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useConsent } from "@/context/ConsentContext";
import { formatEur } from "@/lib/utils";

/**
 * Sticky Bottom Bar Mobile per riepilogo carrello sempre raggiungibile con il pollice.
 */
export function MobileStickyCartBar() {
  const { order, openCart, isOpen } = useCart();
  const { showBanner } = useConsent();

  if (order.totalQuantity === 0 || isOpen || showBanner) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[#E2E8F0] bg-white/95 px-4 py-3 shadow-[0_-8px_24px_rgba(15,23,42,0.12)] backdrop-blur-md lg:hidden">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#475569]">
            Totale carrello ({order.totalQuantity})
          </p>
          <p className="font-display text-lg font-extrabold tabular-nums text-[#0F172A]">
            {formatEur(order.grandTotalEur)}
          </p>
        </div>

        <button
          type="button"
          onClick={openCart}
          className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-[#0052FF] px-5 text-xs font-extrabold uppercase tracking-wide text-white shadow-md transition-colors hover:bg-[#003ECC]"
        >
          <ShoppingCart className="h-4 w-4" aria-hidden="true" />
          <span>Checkout Stripe</span>
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
