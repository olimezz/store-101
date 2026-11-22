"use client";

import React from "react";
import { Sun, Snowflake, CloudSun, Wrench, Fuel, CloudRain, Volume2 } from "lucide-react";
import type { Product, SeasonType } from "@/data/products";
import { cn } from "@/lib/utils";

const SEASON_STYLES: Record<
  SeasonType,
  { bg: string; text: string; border: string; icon: React.ComponentType<{ className?: string }> }
> = {
  estivi: {
    bg: "bg-[#FEF3C7]",
    text: "text-[#B45309]",
    border: "border-[#F59E0B]/40",
    icon: Sun,
  },
  invernali: {
    bg: "bg-[#E0F2FE]",
    text: "text-[#0369A1]",
    border: "border-[#0EA5E9]/40",
    icon: Snowflake,
  },
  "4-stagioni": {
    bg: "bg-[#D1FAE5]",
    text: "text-[#047857]",
    border: "border-[#10B981]/40",
    icon: CloudSun,
  },
  accessori: {
    bg: "bg-slate-100",
    text: "text-slate-700",
    border: "border-slate-300",
    icon: Wrench,
  },
};

export function SeasonBadge({
  season,
  label,
  className,
}: {
  season: SeasonType;
  label: string;
  className?: string;
}) {
  const style = SEASON_STYLES[season];
  const Icon = style.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold tracking-tight",
        style.bg,
        style.text,
        style.border,
        className
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      {label}
    </span>
  );
}

export function EuEnergyLabel({
  euLabel,
  compact = true,
}: {
  euLabel: NonNullable<Product["euLabel"]>;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] tabular-nums",
        compact ? "px-2.5 py-1.5 text-[11px]" : "px-3.5 py-2.5 text-xs"
      )}
      aria-label={`Etichetta energetica UE: Consumi ${euLabel.fuel}, Bagnato ${euLabel.wetGrip}, Rumorosità ${euLabel.noiseDb} dB`}
    >
      <span className="inline-flex items-center gap-1 font-semibold text-[#0F172A]" title="Efficienza consumi carburante">
        <Fuel className="h-3.5 w-3.5 text-[#475569]" aria-hidden="true" />
        <span className="rounded bg-[#0F172A] px-1.5 py-0.5 text-[10px] font-bold text-white">
          {euLabel.fuel}
        </span>
      </span>
      <span className="h-3.5 w-px bg-[#E2E8F0]" aria-hidden="true" />
      <span className="inline-flex items-center gap-1 font-semibold text-[#0F172A]" title="Aderenza sul bagnato">
        <CloudRain className="h-3.5 w-3.5 text-[#0052FF]" aria-hidden="true" />
        <span className="rounded bg-[#0052FF] px-1.5 py-0.5 text-[10px] font-bold text-white">
          {euLabel.wetGrip}
        </span>
      </span>
      <span className="h-3.5 w-px bg-[#E2E8F0]" aria-hidden="true" />
      <span className="inline-flex items-center gap-1 font-medium text-[#475569]" title="Rumorosità esterna di rotolamento">
        <Volume2 className="h-3.5 w-3.5 text-[#475569]" aria-hidden="true" />
        <span className="font-semibold text-[#0F172A]">{euLabel.noiseDb} dB</span>
      </span>
    </div>
  );
}
