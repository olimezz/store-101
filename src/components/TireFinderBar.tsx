"use client";

import React, { useMemo, useState } from "react";
import * as Select from "@radix-ui/react-select";
import {
  Check,
  ChevronDown,
  HelpCircle,
  RotateCcw,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import {
  getUniqueAspectRatios,
  getUniqueBrands,
  getUniqueDiameters,
  getUniqueWidths,
} from "@/data/products";
import { useCatalogFilter } from "@/context/CatalogFilterContext";
import { SupportModal } from "@/components/SupportModal";

interface FinderSelectProps {
  label: string;
  value: string;
  onValueChange: (val: string) => void;
  placeholder: string;
  options: { value: string; label: string }[];
}

function FinderSelect({
  label,
  value,
  onValueChange,
  placeholder,
  options,
}: FinderSelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
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
            <ChevronDown className="h-4 w-4 text-[#475569]" />
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
  const {
    products,
    filters,
    filteredProducts,
    hasActiveFilters,
    setFilter,
    resetFilters,
  } = useCatalogFilter();
  const [supportOpen, setSupportOpen] = useState(false);

  // Opzioni a cascata intelligenti in base ai filtri selezionati
  const widthOptions = useMemo(
    () =>
      getUniqueWidths(products).map((w) => ({
        value: String(w),
        label: `${w} mm`,
      })),
    [products]
  );

  const ratioOptions = useMemo(() => {
    const relevant = products.filter(
      (p) =>
        p.isTire &&
        (filters.width === "all" || String(p.width) === filters.width)
    );
    const ratios =
      relevant.length > 0
        ? Array.from(
            new Set(
              relevant
                .map((p) => p.aspectRatio)
                .filter((r): r is number => typeof r === "number")
            )
          ).sort((a, b) => a - b)
        : getUniqueAspectRatios(products);

    return ratios.map((r) => ({ value: String(r), label: `/${r}` }));
  }, [filters.width, products]);

  const diameterOptions = useMemo(() => {
    const relevant = products.filter(
      (p) =>
        p.isTire &&
        (filters.width === "all" || String(p.width) === filters.width) &&
        (filters.aspectRatio === "all" ||
          String(p.aspectRatio) === filters.aspectRatio)
    );
    const diams =
      relevant.length > 0
        ? Array.from(
            new Set(
              relevant
                .map((p) => p.diameter)
                .filter((d): d is string => typeof d === "string")
            )
          ).sort()
        : getUniqueDiameters(products);

    return diams.map((d) => ({ value: d, label: d }));
  }, [filters.width, filters.aspectRatio, products]);

  const seasonOptions = [
    { value: "estivi", label: "Estivi" },
    { value: "invernali", label: "Invernali" },
    { value: "4-stagioni", label: "4 Stagioni" },
  ];

  const brandOptions = useMemo(
    () => getUniqueBrands(products).map((b) => ({ value: b, label: b })),
    [products]
  );

  const handleWidthChange = (val: string) => {
    setFilter("width", val);
    setFilter("aspectRatio", "all");
    setFilter("diameter", "all");
  };

  const handleRatioChange = (val: string) => {
    setFilter("aspectRatio", val);
    setFilter("diameter", "all");
  };

  const handleSearchClick = () => {
    if (
      filters.width !== "all" &&
      filters.aspectRatio !== "all" &&
      filters.diameter !== "all"
    ) {
      const sizeQuery = `${filters.width}/${filters.aspectRatio}${filters.diameter}`;
      void fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "search", sizeQuery }),
      }).catch(() => undefined);
    }
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
                Leggi la misura sul fianco della gomma (es.{" "}
                <span className="font-semibold tabular-nums text-[#0F172A]">
                  245 / 40 R18
                </span>
                ) e filtra istantaneamente
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

        {/* Cascading dropdowns + Orange CTA */}
        <div className="mt-5 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-6 lg:items-end">
          <FinderSelect
            label="Larghezza"
            value={filters.width}
            onValueChange={handleWidthChange}
            placeholder="Tutte"
            options={widthOptions}
          />
          <FinderSelect
            label="Altezza / Spalla"
            value={filters.aspectRatio}
            onValueChange={handleRatioChange}
            placeholder="Tutte"
            options={ratioOptions}
          />
          <FinderSelect
            label="Diametro"
            value={filters.diameter}
            onValueChange={(val) => setFilter("diameter", val)}
            placeholder="Tutti"
            options={diameterOptions}
          />
          <FinderSelect
            label="Stagione"
            value={filters.season}
            onValueChange={(val) => {
              setFilter("season", val);
              setFilter("category", "tutti");
            }}
            placeholder="Tutte"
            options={seasonOptions}
          />
          <FinderSelect
            label="Brand"
            value={filters.brand}
            onValueChange={(val) => setFilter("brand", val)}
            placeholder="Tutti i Brand"
            options={brandOptions}
          />

          <button
            type="button"
            onClick={handleSearchClick}
            className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-[#FF5A1F] px-5 text-sm font-extrabold uppercase tracking-wide text-white shadow-[0_10px_22px_-6px_rgba(255,90,31,0.55)] transition-colors hover:bg-[#E0440C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F] focus-visible:ring-offset-2"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            <span>
              Cerca ({filteredProducts.length})
            </span>
          </button>
        </div>
      </div>

      <SupportModal open={supportOpen} onOpenChange={setSupportOpen} />
    </section>
  );
}
