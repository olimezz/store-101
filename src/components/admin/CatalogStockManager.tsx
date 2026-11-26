"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Check,
  Edit3,
  FileSpreadsheet,
  Loader2,
  Package,
  Search,
  Ship,
  Warehouse,
} from "lucide-react";
import type { Product } from "@/data/products";
import { useCatalogFilter } from "@/context/CatalogFilterContext";
import { cn, formatEur } from "@/lib/utils";

export function CatalogStockManager() {
  const { refreshProducts } = useCatalogFilter();
  const [products, setProducts] = useState<Product[]>([]);
  const [threshold, setThreshold] = useState(4);
  const [query, setQuery] = useState("");
  const [filterMode, setFilterMode] = useState<
    "all" | "italia" | "cina_only" | "alert"
  >("all");
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editIt, setEditIt] = useState(0);
  const [editCn, setEditCn] = useState(0);
  const [editPrice, setEditPrice] = useState(0);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/products", { cache: "no-store" });
      if (!res.ok) return;
      const json = (await res.json()) as {
        products?: Product[];
        lowStockThreshold?: number;
      };
      setProducts(json.products ?? []);
      if (typeof json.lowStockThreshold === "number") {
        setThreshold(json.lowStockThreshold);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (filterMode === "italia" && p.stockItalia <= 0) return false;
      if (filterMode === "cina_only" && !(p.stockItalia === 0 && p.stockCina > 0))
        return false;
      if (
        filterMode === "alert" &&
        !(p.stockItalia + p.stockCina === 0 || p.stockItalia <= threshold)
      ) {
        return false;
      }
      if (q) {
        const hay = `${p.sku} ${p.brand} ${p.model} ${p.sizeLabel} ${p.seasonLabel}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [products, query, filterMode, threshold]);

  const startEdit = (p: Product) => {
    setEditingId(p.id);
    setEditIt(p.stockItalia);
    setEditCn(p.stockCina);
    setEditPrice(p.priceEur);
  };

  const saveEdit = async (productId: string) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          stockItalia: editIt,
          stockCina: editCn,
          priceEur: editPrice,
        }),
      });
      if (res.ok) {
        setEditingId(null);
        await Promise.all([load(), refreshProducts()]);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-card lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-[#0F172A]">
            Catalogo &amp; Stock Dual-Source (IT / CN)
          </h1>
          <p className="mt-1 text-xs text-[#475569]">
            Monitora giacenze Italia (4-7 gg), giacenze Import Cina (5-15 gg
            lav.), margini unitari e alert sottoscorta.
          </p>
        </div>

        <div className="relative w-full lg:w-72">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#475569]" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cerca SKU, misura o marca..."
            className="min-h-[44px] w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] pl-10 pr-3 text-sm text-[#0F172A] focus:border-[#0052FF] focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["all", `Tutti (${products.length})`],
            ["italia", "Disponibili in Italia (4-7 gg)"],
            ["cina_only", "Solo Import Cina (5-15 gg)"],
            ["alert", "Esauriti / Sottoscorta"],
          ] as const
        ).map(([k, lbl]) => (
          <button
            key={k}
            type="button"
            onClick={() => setFilterMode(k)}
            className={cn(
              "min-h-[44px] rounded-xl border px-4 text-xs font-bold transition-colors",
              filterMode === k
                ? "border-[#0052FF] bg-[#0052FF] text-white"
                : "border-[#E2E8F0] bg-white text-[#475569] hover:border-[#0F172A] hover:text-[#0F172A]"
            )}
          >
            {lbl}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="h-64 animate-pulse rounded-2xl border border-[#E2E8F0] bg-white" />
      ) : products.length === 0 ? (
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-12 text-center shadow-card">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0052FF]/10 text-[#0052FF]">
            <Package className="h-7 w-7" />
          </div>
          <h3 className="mt-4 font-display text-lg font-bold text-[#0F172A]">
            Nessun prodotto o stock presente in catalogo
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-[#475569]">
            Non è stato ancora caricato alcuno stock fittizio. Carica il file CSV per sincronizzare automaticamente le giacenze reali di Magazzino Italia (4-7 gg) e Fornitore Cina (5-15 gg).
          </p>
          <div className="mt-6">
            <Link
              href="/admin/import-csv"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#0052FF] px-5 text-sm font-bold text-white hover:bg-[#003ECC]"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Vai all&apos;Importazione CSV
            </Link>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-[#E2E8F0] bg-white shadow-card">
          {/* Desktop Table */}
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[11px] font-bold uppercase tracking-wider text-[#475569]">
                  <th className="px-5 py-3.5">SKU &amp; Pneumatico</th>
                  <th className="px-4 py-3.5">Misura</th>
                  <th className="px-4 py-3.5">Stock Italia</th>
                  <th className="px-4 py-3.5">Stock Cina</th>
                  <th className="px-4 py-3.5">Prezzo / Costo</th>
                  <th className="px-4 py-3.5">Margine</th>
                  <th className="px-4 py-3.5">Regola Sito</th>
                  <th className="px-5 py-3.5 text-right">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] tabular-nums">
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-10 text-center text-sm font-semibold text-[#475569]"
                    >
                      Nessun pneumatico corrisponde ai filtri selezionati.
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => {
                    const isEditing = editingId === p.id;
                    const marginEur = Math.max(0, p.priceEur - p.costEur);
                    const marginPct =
                      p.priceEur > 0 ? Math.round((marginEur / p.priceEur) * 100) : 0;
                    const total = p.stockItalia + p.stockCina;

                    return (
                      <tr key={p.id} className="hover:bg-[#F8FAFC]/70">
                      <td className="px-5 py-3.5">
                        <p className="font-mono text-[11px] font-bold text-[#0052FF]">
                          {p.sku}
                        </p>
                        <p className="font-bold text-[#0F172A]">
                          {p.brand} {p.model}
                        </p>
                      </td>
                      <td className="px-4 py-3.5 font-mono font-bold text-[#0F172A]">
                        {p.sizeLabel}
                      </td>
                      <td className="px-4 py-3.5">
                        {isEditing ? (
                          <input
                            type="number"
                            min={0}
                            value={editIt}
                            onChange={(e) => setEditIt(Number(e.target.value))}
                            className="h-9 w-20 rounded-lg border border-[#0052FF] px-2 text-xs font-bold"
                          />
                        ) : (
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-bold",
                              p.stockItalia > threshold
                                ? "bg-[#D1FAE5] text-[#065F46]"
                                : p.stockItalia > 0
                                  ? "bg-[#FEF3C7] text-[#92400E]"
                                  : "bg-[#FEE2E2] text-[#B91C1C]"
                            )}
                          >
                            <Warehouse className="h-3 w-3" />
                            {p.stockItalia} pz
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        {isEditing ? (
                          <input
                            type="number"
                            min={0}
                            value={editCn}
                            onChange={(e) => setEditCn(Number(e.target.value))}
                            className="h-9 w-20 rounded-lg border border-[#0052FF] px-2 text-xs font-bold"
                          />
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#FEF3C7] px-2.5 py-1 font-bold text-[#92400E]">
                            <Ship className="h-3 w-3" />
                            {p.stockCina} pz
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.01"
                            min={1}
                            value={editPrice}
                            onChange={(e) =>
                              setEditPrice(Number(e.target.value))
                            }
                            className="h-9 w-24 rounded-lg border border-[#0052FF] px-2 text-xs font-bold"
                          />
                        ) : (
                          <div>
                            <p className="font-extrabold text-[#0F172A]">
                              {formatEur(p.priceEur)}
                            </p>
                            <p className="text-[11px] text-[#475569]">
                              Costo: {formatEur(p.costEur)}
                            </p>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3.5 font-bold text-[#10B981]">
                        +{formatEur(marginEur)} ({marginPct}%)
                      </td>
                      <td className="px-4 py-3.5">
                        {total === 0 ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#FEE2E2] px-2.5 py-1 text-[11px] font-bold text-[#B91C1C]">
                            <AlertCircle className="h-3 w-3" />
                            Esaurito
                          </span>
                        ) : p.stockItalia > 0 ? (
                          <span className="rounded-full bg-[#D1FAE5] px-2.5 py-1 text-[11px] font-bold text-[#065F46]">
                            IT 4-7 gg
                          </span>
                        ) : (
                          <span className="rounded-full bg-[#FEF3C7] px-2.5 py-1 text-[11px] font-bold text-[#92400E]">
                            CN 5-15 gg
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {isEditing ? (
                          <div className="inline-flex gap-1.5">
                            <button
                              type="button"
                              disabled={saving}
                              onClick={() => saveEdit(p.id)}
                              className="inline-flex min-h-[36px] items-center gap-1 rounded-lg bg-[#0052FF] px-3 text-xs font-bold text-white"
                            >
                              {saving ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Check className="h-3.5 w-3.5" />
                              )}
                              Salva
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="min-h-[36px] rounded-lg border border-[#E2E8F0] px-2.5 text-xs font-bold text-[#475569]"
                            >
                              Annulla
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => startEdit(p)}
                            className="inline-flex min-h-[38px] items-center gap-1 rounded-lg border border-[#E2E8F0] bg-white px-3 text-xs font-bold text-[#0F172A] hover:border-[#0052FF] hover:text-[#0052FF]"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                            Modifica
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
              </tbody>
            </table>
          </div>

          {/* Mobile Responsive Cards */}
          <div className="divide-y divide-[#E2E8F0] lg:hidden">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-sm font-semibold text-[#475569]">
                Nessun pneumatico corrisponde ai filtri selezionati.
              </div>
            ) : (
              filtered.map((p) => {
                const isEditing = editingId === p.id;
                return (
                  <div key={p.id} className="space-y-3 p-4 text-xs tabular-nums">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-mono text-[11px] font-bold text-[#0052FF]">
                        {p.sku}
                      </p>
                      <p className="font-bold text-[#0F172A]">
                        {p.brand} {p.model}
                      </p>
                      <p className="text-[#475569]">{p.sizeLabel}</p>
                    </div>
                    <p className="font-display text-base font-extrabold text-[#0F172A]">
                      {formatEur(p.priceEur)}
                    </p>
                  </div>

                  {isEditing ? (
                    <div className="grid grid-cols-3 gap-2 rounded-xl bg-[#F8FAFC] p-3">
                      <label className="text-[11px] font-bold text-[#475569]">
                        Stock IT
                        <input
                          type="number"
                          min={0}
                          value={editIt}
                          onChange={(e) => setEditIt(Number(e.target.value))}
                          className="mt-1 min-h-[40px] w-full rounded-lg border border-[#0052FF] px-2 text-xs font-bold text-[#0F172A]"
                        />
                      </label>
                      <label className="text-[11px] font-bold text-[#475569]">
                        Stock CN
                        <input
                          type="number"
                          min={0}
                          value={editCn}
                          onChange={(e) => setEditCn(Number(e.target.value))}
                          className="mt-1 min-h-[40px] w-full rounded-lg border border-[#0052FF] px-2 text-xs font-bold text-[#0F172A]"
                        />
                      </label>
                      <label className="text-[11px] font-bold text-[#475569]">
                        Prezzo €
                        <input
                          type="number"
                          step="0.01"
                          value={editPrice}
                          onChange={(e) => setEditPrice(Number(e.target.value))}
                          className="mt-1 min-h-[40px] w-full rounded-lg border border-[#0052FF] px-2 text-xs font-bold text-[#0F172A]"
                        />
                      </label>
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => saveEdit(p.id)}
                        className="col-span-2 min-h-[44px] rounded-xl bg-[#0052FF] text-xs font-bold text-white"
                      >
                        Salva modifiche
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="min-h-[44px] rounded-xl border border-[#E2E8F0] bg-white text-xs font-bold text-[#475569]"
                      >
                        Annulla
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-wrap gap-1.5">
                        <span className="rounded-full bg-[#D1FAE5] px-2.5 py-1 font-bold text-[#065F46]">
                          IT: {p.stockItalia}
                        </span>
                        <span className="rounded-full bg-[#FEF3C7] px-2.5 py-1 font-bold text-[#92400E]">
                          CN: {p.stockCina}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => startEdit(p)}
                        className="min-h-[44px] rounded-xl border border-[#E2E8F0] px-3.5 text-xs font-bold text-[#0F172A]"
                      >
                        Modifica Stock
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
          </div>
        </div>
      )}
    </div>
  );
}
