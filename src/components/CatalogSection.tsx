"use client";

import React, { useState } from "react";
import { ArrowUpDown, RotateCcw, Sparkles } from "lucide-react";
import {
  useCatalogFilter,
  type CategoryNavKey,
  type SortOption,
} from "@/context/CatalogFilterContext";
import { ProductCard } from "@/components/ProductCard";
import { SupportModal } from "@/components/SupportModal";
import { cn } from "@/lib/utils";

const QUICK_PILLS: { key: CategoryNavKey; label: string; activeClass: string }[] = [
  {
    key: "tutti",
    label: "Tutti (12)",
    activeClass: "bg-[#0F172A] text-white border-[#0F172A]",
  },
  {
    key: "estivi",
    label: "Estivi",
    activeClass: "bg-[#FEF3C7] text-[#B45309] border-[#F59E0B]",
  },
  {
    key: "invernali",
    label: "Invernali",
    activeClass: "bg-[#E0F2FE] text-[#0369A1] border-[#0EA5E9]",
  },
  {
    key: "4-stagioni",
    label: "4 Stagioni",
    activeClass: "bg-[#D1FAE5] text-[#047857] border-[#10B981]",
  },
  {
    key: "suv-furgo",
    label: "SUV & Furgo",
    activeClass: "bg-[#0052FF] text-white border-[#0052FF]",
  },
  {
    key: "accessori",
    label: "Accessori",
    activeClass: "bg-[#FF5A1F] text-white border-[#FF5A1F]",
  },
];

export function CatalogSection() {
  const {
    filters,
    filteredProducts,
    hasActiveFilters,
    setCategoryNav,
    setFilter,
    resetFilters,
  } = useCatalogFilter();
  const [showAll, setShowAll] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);

  const visibleProducts =
    hasActiveFilters || showAll
      ? filteredProducts
      : filteredProducts.slice(0, 6);

  return (
    <section
      id="catalogo"
      aria-labelledby="catalogo-heading"
      className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8"
    >
      {/* Section Header */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-[#0052FF]">
            <Sparkles className="h-3.5 w-3.5 text-[#FF5A1F]" aria-hidden="true" />
            Catalogo Certificato UE &bull; DOT 2026
          </span>
          <h2
            id="catalogo-heading"
            className="mt-2 font-display font-extrabold uppercase tracking-[-0.02em] text-[#0F172A]"
            style={{ fontSize: "clamp(1.65rem, 3vw, 2.5rem)" }}
          >
            {hasActiveFilters
              ? `Risultati Filtrati (${filteredProducts.length})`
              : "Selezione in Evidenza"}
          </h2>
          <p className="mt-1.5 max-w-2xl text-sm text-[#475569] sm:text-base">
            Pneumatici testati per massima tenuta sul bagnato e durata. Seleziona
            un treno completo da 4 gomme per ottenere subito il{" "}
            <strong className="font-bold text-[#0F172A]">-5% automatico</strong>.
          </p>
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2.5">
          <ArrowUpDown className="h-4 w-4 text-[#475569]" aria-hidden="true" />
          <label htmlFor="catalog-sort" className="sr-only">
            Ordina prodotti
          </label>
          <select
            id="catalog-sort"
            value={filters.sort}
            onChange={(e) => setFilter("sort", e.target.value as SortOption)}
            className="min-h-[44px] rounded-xl border border-[#E2E8F0] bg-white px-3.5 text-sm font-semibold text-[#0F172A] focus:border-[#0052FF] focus:outline-none focus:ring-2 focus:ring-[#0052FF]/20"
          >
            <option value="featured">Ordina: In evidenza</option>
            <option value="price-asc">Prezzo: dal più basso</option>
            <option value="price-desc">Prezzo: dal più alto</option>
            <option value="rating">Valutazione clienti</option>
          </select>
        </div>
      </div>

      {/* Category Quick Filter Pills */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        {QUICK_PILLS.map((pill) => {
          const active = filters.category === pill.key;
          return (
            <button
              key={pill.key}
              type="button"
              onClick={() => setCategoryNav(pill.key)}
              className={cn(
                "min-h-[44px] rounded-full border px-4 text-xs font-bold transition-colors sm:text-sm",
                active
                  ? pill.activeClass
                  : "border-[#E2E8F0] bg-white text-[#475569] hover:border-[#0F172A] hover:text-[#0F172A]"
              )}
            >
              {pill.label}
            </button>
          );
        })}

        {hasActiveFilters ? (
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-[#FF5A1F]/40 bg-[#FF5A1F]/10 px-4 text-xs font-bold text-[#FF5A1F] transition-colors hover:bg-[#FF5A1F] hover:text-white sm:text-sm"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Rimuovi filtri
          </button>
        ) : null}
      </div>

      {/* Product Grid or Empty State */}
      {visibleProducts.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-[#E2E8F0] bg-white p-10 text-center shadow-card">
          <p className="font-display text-xl font-extrabold text-[#0F172A]">
            Nessun pneumatico corrisponde esattamente a questa combinazione
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-[#475569]">
            Prova ad allargare i filtri di misura oppure chiedi ai nostri tecnici:
            possiamo ordinare qualsiasi misura su richiesta in 24/48h.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={resetFilters}
              className="min-h-[46px] rounded-xl bg-[#0052FF] px-6 text-sm font-bold text-white hover:bg-[#003ECC]"
            >
              Mostra tutto il catalogo
            </button>
            <button
              type="button"
              onClick={() => setSupportOpen(true)}
              className="min-h-[46px] rounded-xl border border-[#E2E8F0] bg-white px-6 text-sm font-bold text-[#0F172A] hover:bg-slate-50"
            >
              Richiedi misura a un tecnico
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {visibleProducts.map((product, idx) => (
              <ProductCard key={product.id} product={product} index={idx} />
            ))}
          </div>

          {!hasActiveFilters && filteredProducts.length > 6 ? (
            <div className="mt-10 text-center">
              <button
                type="button"
                onClick={() => setShowAll((prev) => !prev)}
                className="min-h-[50px] rounded-xl border-2 border-[#0F172A] bg-white px-8 text-sm font-extrabold uppercase tracking-wide text-[#0F172A] transition-colors hover:bg-[#0F172A] hover:text-white"
              >
                {showAll
                  ? "Mostra solo selezione in evidenza"
                  : `Esplora tutto il catalogo (${filteredProducts.length} prodotti)`}
              </button>
            </div>
          ) : null}
        </>
      )}

      <SupportModal open={supportOpen} onOpenChange={setSupportOpen} />
    </section>
  );
}
