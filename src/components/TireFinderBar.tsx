"use client";

import React, { useMemo, useRef, useState } from "react";
import * as Select from "@radix-ui/react-select";
import {
  Check,
  ChevronDown,
  HelpCircle,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { getUniqueBrands } from "@/data/products";
import { useCatalogFilter } from "@/context/CatalogFilterContext";
import { SupportModal } from "@/components/SupportModal";
import { formatTireSizeInput, parseTireSize } from "@/lib/tire-size";
import { cn } from "@/lib/utils";

const POPULAR_SIZES = [
  { digits: "2454018", label: "245/40R18" },
  { digits: "2254517", label: "225/45R17" },
  { digits: "2055516", label: "205/55R16" },
  { digits: "2355517", label: "235/55R17" },
  { digits: "2553519", label: "255/35R19" },
];

interface FinderSelectProps {
  label: string;
  value: string;
  onValueChange: (val: string) => void;
  placeholder: string;
  options: { value: string; label: string }[];
  className?: string;
}

function FinderSelect({
  label,
  value,
  onValueChange,
  placeholder,
  options,
  className,
}: FinderSelectProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-[11px] font-bold uppercase tracking-wider text-[#475569]">
        {label}
      </span>
      <Select.Root value={value} onValueChange={onValueChange}>
        <Select.Trigger
          aria-label={label}
          className="inline-flex min-h-[46px] w-full items-center justify-between gap-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 text-sm font-semibold tabular-nums text-[#0F172A] transition-colors hover:border-[#0052FF]/50 hover:bg-white focus:border-[#0052FF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0052FF]/20"
        >
          <Select.Value placeholder={placeholder} />
          <Select.Icon>
            <ChevronDown className="h-4 w-4 shrink-0 text-[#475569]" />
          </Select.Icon>
        </Select.Trigger>

        <Select.Portal>
          <Select.Content
            position="popper"
            sideOffset={6}
            className="z-50 max-h-64 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-xl"
          >
            <Select.Viewport className="p-1.5">
              <Select.Item
                value="all"
                className="relative flex min-h-[40px] cursor-pointer select-none items-center rounded-lg pl-8 pr-3 text-sm font-medium text-[#475569] outline-none data-[highlighted]:bg-[#F8FAFC] data-[highlighted]:text-[#0F172A]"
              >
                <Select.ItemIndicator className="absolute left-2.5 inline-flex items-center">
                  <Check className="h-4 w-4 text-[#0052FF]" />
                </Select.ItemIndicator>
                <Select.ItemText>{placeholder}</Select.ItemText>
              </Select.Item>

              {options.map((opt) => (
                <Select.Item
                  key={opt.value}
                  value={opt.value}
                  className="relative flex min-h-[40px] cursor-pointer select-none items-center rounded-lg pl-8 pr-3 text-sm font-semibold tabular-nums text-[#0F172A] outline-none data-[highlighted]:bg-[#0052FF]/10 data-[highlighted]:text-[#0052FF]"
                >
                  <Select.ItemIndicator className="absolute left-2.5 inline-flex items-center">
                    <Check className="h-4 w-4 text-[#0052FF]" />
                  </Select.ItemIndicator>
                  <Select.ItemText>{opt.label}</Select.ItemText>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  );
}

export function TireFinderBar() {
  const { filters, filteredProducts, hasActiveFilters, setFilter, resetFilters } =
    useCatalogFilter();
  const [supportOpen, setSupportOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const parsedSize = useMemo(
    () => parseTireSize(filters.tireSize),
    [filters.tireSize]
  );

  const seasonOptions = [
    { value: "estivi", label: "Estivi" },
    { value: "invernali", label: "Invernali" },
    { value: "4-stagioni", label: "4 Stagioni" },
  ];

  const brandOptions = useMemo(
    () => getUniqueBrands().map((b) => ({ value: b, label: b })),
    []
  );

  const handleSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatTireSizeInput(e.target.value, filters.tireSize);
    setFilter("tireSize", formatted);
  };

  const handleClearSize = () => {
    setFilter("tireSize", "");
    inputRef.current?.focus();
  };

  const handleSelectPopular = (digits: string) => {
    setFilter("tireSize", formatTireSizeInput(digits));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="configuratore-misure"
      aria-label="Configuratore rapido misure pneumatici"
      className="relative z-20 mx-auto -mt-12 max-w-7xl px-4 sm:-mt-16 sm:px-6 lg:px-8"
    >
      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-finder sm:p-6 lg:p-7">
        {/* Top bar of configurator */}
        <div className="flex flex-col gap-3 border-b border-[#E2E8F0] pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0052FF] text-white shadow-sm">
              <SlidersHorizontal className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-display text-base font-extrabold uppercase tracking-tight text-[#0F172A] sm:text-lg">
                Trova il tuo Pneumatico
              </h2>
              <p className="text-xs text-[#475569]">
                Digita solo i numeri della misura (es.{" "}
                <span className="font-semibold tabular-nums text-[#0F172A]">
                  245 40 18
                </span>{" "}
                per{" "}
                <span className="font-semibold tabular-nums text-[#0F172A]">
                  245/40R18
                </span>
                ): gli{" "}
                <span className="font-semibold text-[#0F172A]">/</span> si
                inseriscono in automatico
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 text-xs font-semibold text-[#475569] transition-colors hover:border-[#0F172A] hover:text-[#0F172A]"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                Azzera filtri
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => setSupportOpen(true)}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-[#0052FF]/10 px-3.5 text-xs font-semibold text-[#0052FF] transition-colors hover:bg-[#0052FF]/15"
            >
              <HelpCircle className="h-4 w-4" aria-hidden="true" />
              Dubbi sulla misura?
            </button>
          </div>
        </div>

        {/* Numeric Tire Size Input + Season/Brand filters + Orange CTA */}
        <form
          onSubmit={handleSearchSubmit}
          className="mt-5 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-12 lg:items-end"
        >
          <div className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-4">
            <label
              htmlFor="tire-size-input"
              className="text-[11px] font-bold uppercase tracking-wider text-[#475569]"
            >
              Misura Gomme (Larghezza / Spalla / Cerchio)
            </label>
            <div className="relative flex items-center">
              <input
                ref={inputRef}
                id="tire-size-input"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                spellCheck={false}
                value={filters.tireSize}
                onChange={handleSizeChange}
                placeholder="es. 245/40/18"
                aria-describedby="tire-size-helper"
                className="min-h-[46px] w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] pl-3.5 pr-28 text-base font-bold tracking-wider tabular-nums text-[#0F172A] placeholder:font-medium placeholder:tracking-normal placeholder:text-[#94A3B8] transition-colors hover:border-[#0052FF]/50 hover:bg-white focus:border-[#0052FF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0052FF]/20"
              />
              <div className="absolute right-2 flex items-center gap-1">
                {parsedSize.standardLabel ? (
                  <span className="rounded-md bg-[#0052FF]/10 px-2 py-1 text-[11px] font-extrabold tabular-nums text-[#0052FF]">
                    {parsedSize.standardLabel}
                  </span>
                ) : null}
                {filters.tireSize.length > 0 ? (
                  <button
                    type="button"
                    onClick={handleClearSize}
                    aria-label="Cancella misura"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-[#64748B] transition-colors hover:bg-slate-200/70 hover:text-[#0F172A]"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          <FinderSelect
            label="Stagione"
            value={filters.season}
            onValueChange={(val) => {
              setFilter("season", val);
              setFilter("category", "tutti");
            }}
            placeholder="Tutte"
            options={seasonOptions}
            className="lg:col-span-2"
          />

          <FinderSelect
            label="Brand"
            value={filters.brand}
            onValueChange={(val) => setFilter("brand", val)}
            placeholder="Tutti i Brand"
            options={brandOptions}
            className="lg:col-span-3"
          />

          <button
            type="submit"
            className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-[#FF5A1F] px-5 text-sm font-extrabold uppercase tracking-wide text-white shadow-[0_10px_22px_-6px_rgba(255,90,31,0.55)] transition-colors hover:bg-[#E0440C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F] focus-visible:ring-offset-2 sm:col-span-2 lg:col-span-3"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            <span>Cerca ({filteredProducts.length})</span>
          </button>
        </form>

        {/* Live decoded size feedback OR popular quick-select sizes */}
        <div
          id="tire-size-helper"
          className="mt-3.5 flex flex-wrap items-center gap-2 text-xs text-[#475569]"
        >
          {parsedSize.digits.length > 0 ? (
            <>
              <span className="font-semibold text-[#475569]">
                Misura riconosciuta:
              </span>
              <span
                className={cn(
                  "rounded-lg border px-2.5 py-1 font-semibold tabular-nums",
                  parsedSize.width.length === 3
                    ? "border-[#0052FF]/30 bg-[#0052FF]/10 text-[#0052FF]"
                    : "border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B]"
                )}
              >
                Larghezza: {parsedSize.width || "___"} mm
              </span>
              <span
                className={cn(
                  "rounded-lg border px-2.5 py-1 font-semibold tabular-nums",
                  parsedSize.aspectRatio.length === 2
                    ? "border-[#0052FF]/30 bg-[#0052FF]/10 text-[#0052FF]"
                    : "border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B]"
                )}
              >
                Spalla: /{parsedSize.aspectRatio || "__"}
              </span>
              <span
                className={cn(
                  "rounded-lg border px-2.5 py-1 font-semibold tabular-nums",
                  parsedSize.diameter.length === 2
                    ? "border-[#0052FF]/30 bg-[#0052FF]/10 text-[#0052FF]"
                    : "border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B]"
                )}
              >
                Cerchio: R{parsedSize.diameter || "__"}
              </span>
            </>
          ) : (
            <>
              <span className="font-semibold text-[#64748B]">
                Misure popolari:
              </span>
              {POPULAR_SIZES.map((size) => (
                <button
                  key={size.digits}
                  type="button"
                  onClick={() => handleSelectPopular(size.digits)}
                  className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-1 font-semibold tabular-nums text-[#0F172A] transition-colors hover:border-[#0052FF] hover:bg-[#0052FF]/10 hover:text-[#0052FF]"
                >
                  {size.label}
                </button>
              ))}
            </>
          )}
        </div>
      </div>

      <SupportModal open={supportOpen} onOpenChange={setSupportOpen} />
    </section>
  );
}
