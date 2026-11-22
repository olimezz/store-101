"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Info, X } from "lucide-react";
import { useCart } from "@/context/CartContext";

export function CheckoutCancelledNotice() {
  const searchParams = useSearchParams();
  const { openCart } = useCart();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (searchParams.get("checkout") === "cancelled") {
      setVisible(true);
    }
  }, [searchParams]);

  if (!visible) return null;

  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-2.5">
          <Info className="h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
          <span>
            Il pagamento Stripe è stato annullato. I tuoi pneumatici sono ancora
            salvati nel carrello.
          </span>
          <button
            type="button"
            onClick={() => {
              setVisible(false);
              openCart();
            }}
            className="font-bold text-[#0052FF] underline underline-offset-2"
          >
            Riapri carrello
          </button>
        </div>
        <button
          type="button"
          onClick={() => setVisible(false)}
          aria-label="Chiudi avviso"
          className="flex min-h-[36px] min-w-[36px] items-center justify-center rounded-lg hover:bg-amber-100"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
