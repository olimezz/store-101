"use client";

import React from "react";
import { AlertCircle, Ship, Split, Warehouse } from "lucide-react";
import type { LogisticsAvailability } from "@/data/products";
import { cn } from "@/lib/utils";

export function LogisticsBadge({
  logistics,
  showDeliveryText = true,
  className,
}: {
  logistics: LogisticsAvailability;
  showDeliveryText?: boolean;
  className?: string;
}) {
  if (logistics.type === "out_of_stock") {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg border border-[#EF4444]/30 bg-[#FEE2E2] px-2.5 py-1 text-[11px] font-bold text-[#B91C1C]",
          className
        )}
      >
        <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>Esaurito</span>
      </div>
    );
  }

  if (logistics.type === "italia") {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg border border-[#10B981]/30 bg-[#D1FAE5] px-2.5 py-1 text-[11px] font-bold text-[#065F46]",
          className
        )}
      >
        <Warehouse className="h-3.5 w-3.5 shrink-0 text-[#10B981]" aria-hidden="true" />
        <span>
          {showDeliveryText
            ? "Disponibile in Italia • 4-7 gg lav."
            : "Magazzino Italia (4-7 gg)"}
        </span>
      </div>
    );
  }

  if (logistics.type === "cina") {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg border border-[#F59E0B]/40 bg-[#FEF3C7] px-2.5 py-1 text-[11px] font-bold text-[#92400E]",
          className
        )}
      >
        <Ship className="h-3.5 w-3.5 shrink-0 text-[#D97706]" aria-hidden="true" />
        <span>
          {showDeliveryText
            ? "Su ordinazione • 5-15 gg lav."
            : "Import Cina (5-15 gg)"}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border border-[#FF5A1F]/40 bg-[#FFF7ED] px-2.5 py-1 text-[11px] font-bold text-[#C2410C]",
        className
      )}
    >
      <Split className="h-3.5 w-3.5 shrink-0 text-[#FF5A1F]" aria-hidden="true" />
      <span>
        Split: {logistics.fromItalia} pz IT (4-7 gg) + {logistics.fromCina} pz Import (5-15 gg)
      </span>
    </div>
  );
}
