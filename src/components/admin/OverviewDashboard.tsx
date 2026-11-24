"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  CreditCard,
  Eye,
  FileSpreadsheet,
  Loader2,
  PackageCheck,
  Search,
  Ship,
  TrendingUp,
  UploadCloud,
  Warehouse,
} from "lucide-react";
import type { CsvDryRunResult, DailyAnalyticsPoint } from "@/lib/admin-types";
import { useCatalogFilter } from "@/context/CatalogFilterContext";
import { cn, formatEur } from "@/lib/utils";

interface OverviewResponse {
  range: string;
  kpis: {
    revenueEur: number;
    revenueDeltaPct: number;
    marginEur: number;
    marginDeltaPct: number;
    totalUnitsSold: number;
    unitsDeltaPct: number;
    unitsItalia: number;
    unitsCina: number;
    unitsStripe: number;
    unitsCsv: number;
    uniqueVisits: number;
    visitsDeltaPct: number;
    pageViews: number;
    conversionRatePct: number;
    conversionDeltaPct: number;
    aovEur: number;
    ordersToShipCount: number;
    splitOrdersCount: number;
    lowStockCount: number;
  };
  funnel: {
    uniqueVisits: number;
    cartAdds: number;
    checkoutStarts: number;
    paidOrders: number;
  };
  chartSeries: DailyAnalyticsPoint[];
  topSoldTires: {
    sku: string;
    brand: string;
    model: string;
    sizeLabel: string;
    units: number;
    revenueEur: number;
    stockItalia: number;
    stockCina: number;
  }[];
  searchDemand: {
    sizeQuery: string;
    searches: number;
    matchingSkus: number;
    stockItalia: number;
    stockCina: number;
    stockAlert: boolean;
  }[];
  lastCsvSync: {
    id: string;
    filename: string;
    uploadedAt: string;
    uploadedBy: string;
    updatedCount: number;
    createdCount: number;
    errorCount: number;
    rolledBack: boolean;
  } | null;
  recentActivity: {
    id: string;
    type: string;
    title: string;
    subtitle: string;
    timestamp: string;
  }[];
}

function DeltaPill({ value }: { value: number }) {
  const positive = value >= 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums",
        positive
          ? "bg-[#D1FAE5] text-[#065F46]"
          : "bg-[#FEE2E2] text-[#B91C1C]"
      )}
    >
      {positive ? (
        <ArrowUpRight className="h-3 w-3" />
      ) : (
        <ArrowDownRight className="h-3 w-3" />
      )}
      {positive ? "+" : ""}
      {value.toFixed(1)}%
    </span>
  );
}

export function OverviewDashboard() {
  const { refreshProducts } = useCatalogFilter();
  const [range, setRange] = useState<"today" | "7d" | "30d" | "custom">("7d");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [channelFilter, setChannelFilter] = useState<"all" | "stripe" | "csv">(
    "all"
  );
  const [data, setData] = useState<OverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Quick CSV dropzone state
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [quickFile, setQuickFile] = useState<File | null>(null);
  const [quickPreview, setQuickPreview] = useState<CsvDryRunResult | null>(null);
  const [quickBusy, setQuickBusy] = useState(false);
  const [quickMessage, setQuickMessage] = useState<string | null>(null);
  const [quickError, setQuickError] = useState<string | null>(null);

  const loadOverview = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({ range });
      if (range === "custom" && customFrom && customTo) {
        qs.set("from", customFrom);
        qs.set("to", customTo);
      }
      const res = await fetch(`/api/admin/overview?${qs.toString()}`, {
        cache: "no-store",
      });
      if (!res.ok) return;
      const json = (await res.json()) as OverviewResponse;
      setData(json);
    } finally {
      setLoading(false);
    }
  }, [range, customFrom, customTo]);

  useEffect(() => {
    if (range === "custom" && (!customFrom || !customTo)) return;
    void loadOverview();
  }, [loadOverview, range, customFrom, customTo]);

  const handleQuickCsvSelect = async (file: File) => {
    setQuickError(null);
    setQuickMessage(null);
    setQuickPreview(null);
    setQuickFile(file);
    setQuickBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/csv/preview", {
        method: "POST",
        body: fd,
      });
      const json = (await res.json()) as {
        preview?: CsvDryRunResult;
        error?: string;
      };
      if (!res.ok || !json.preview) {
        setQuickError(json.error ?? "Errore lettura CSV.");
        return;
      }
      setQuickPreview(json.preview);
    } catch {
      setQuickError("Errore durante l'anteprima CSV.");
    } finally {
      setQuickBusy(false);
    }
  };

  const handleQuickCsvApply = async () => {
    if (!quickFile) return;
    setQuickBusy(true);
    setQuickError(null);
    try {
      const fd = new FormData();
      fd.append("file", quickFile);
      const res = await fetch("/api/admin/csv/apply", {
        method: "POST",
        body: fd,
      });
      const json = (await res.json()) as { error?: string; ok?: boolean };
      if (!res.ok) {
        setQuickError(json.error ?? "Errore applicazione CSV.");
        return;
      }
      setQuickMessage(
        "Sincronizzazione applicata! Giacenze IT/CN aggiornate sullo storefront."
      );
      setQuickPreview(null);
      setQuickFile(null);
      await Promise.all([loadOverview(), refreshProducts()]);
    } catch {
      setQuickError("Errore di rete durante il salvataggio.");
    } finally {
      setQuickBusy(false);
    }
  };

  const chartData = (data?.chartSeries ?? []).map((p) => ({
    label: p.label,
    visite: p.uniqueVisits,
    vendute:
      channelFilter === "stripe"
        ? p.stripeUnitsSold
        : channelFilter === "csv"
          ? p.csvUnitsSold
          : p.stripeUnitsSold + p.csvUnitsSold,
  }));

  const lastSyncFormatted = data?.lastCsvSync
    ? new Date(data.lastCsvSync.uploadedAt).toLocaleString("it-IT", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Mai eseguito";

  return (
    <div className="space-y-6">
      {/* 1. Header Superiore */}
      <div className="flex flex-col gap-4 rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-card lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="font-display text-2xl font-extrabold tracking-tight text-[#0F172A]">
              Panoramica &amp; Analytics
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#10B981]/30 bg-[#D1FAE5] px-3 py-1 text-xs font-bold text-[#065F46]">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#10B981]" />
              Ultimo sync CSV: {lastSyncFormatted} — OK
            </span>
          </div>
          <p className="mt-1 text-xs text-[#475569]">
            Analytics cookieless privacy-first &bull; Logistica dual-source
            Magazzino Italia (4-7 gg) / Import Cina (5-15 gg lav.)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-1">
            {(
              [
                ["today", "Oggi"],
                ["7d", "7 gg"],
                ["30d", "30 gg"],
                ["custom", "Custom"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setRange(key)}
                className={cn(
                  "min-h-[38px] rounded-lg px-3 text-xs font-bold transition-colors",
                  range === key
                    ? "bg-[#0F172A] text-white"
                    : "text-[#475569] hover:text-[#0F172A]"
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <Link
            href="/admin/import-csv"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#0052FF] px-4 text-xs font-extrabold uppercase tracking-wide text-white shadow-sm transition-colors hover:bg-[#003ECC]"
          >
            <UploadCloud className="h-4 w-4" />
            + Carica CSV Serale
          </Link>
        </div>
      </div>

      {range === "custom" ? (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-card">
          <label className="text-xs font-bold text-[#475569]">
            Dal:
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="ml-2 min-h-[40px] rounded-lg border border-[#E2E8F0] px-2.5 text-xs font-semibold text-[#0F172A]"
            />
          </label>
          <label className="text-xs font-bold text-[#475569]">
            Al:
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="ml-2 min-h-[40px] rounded-lg border border-[#E2E8F0] px-2.5 text-xs font-semibold text-[#0F172A]"
            />
          </label>
        </div>
      ) : null}

      {/* 2. Riga 4 KPI Principali */}
      {loading || !data ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-36 animate-pulse rounded-2xl border border-[#E2E8F0] bg-white p-5"
            />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {/* KPI 1: Fatturato & Margine */}
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-card">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#475569]">
                  Fatturato Totale
                </span>
                <DeltaPill value={data.kpis.revenueDeltaPct} />
              </div>
              <p className="mt-3 font-display text-3xl font-extrabold tabular-nums text-[#0F172A]">
                {formatEur(data.kpis.revenueEur)}
              </p>
              <div className="mt-3 flex items-center justify-between border-t border-[#E2E8F0] pt-2.5 text-xs">
                <span className="text-[#475569]">Margine netto stimato</span>
                <span className="font-bold tabular-nums text-[#10B981]">
                  {formatEur(data.kpis.marginEur)}
                </span>
              </div>
            </div>

            {/* KPI 2: Gomme Vendute (IT / CN split) */}
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-card">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#475569]">
                  Gomme Vendute
                </span>
                <DeltaPill value={data.kpis.unitsDeltaPct} />
              </div>
              <p className="mt-3 font-display text-3xl font-extrabold tabular-nums text-[#0F172A]">
                {data.kpis.totalUnitsSold}{" "}
                <span className="text-sm font-semibold text-[#475569]">pz</span>
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[#E2E8F0] pt-2.5 text-[11px] font-bold tabular-nums">
                <span className="inline-flex items-center gap-1 rounded-md bg-[#D1FAE5] px-2 py-0.5 text-[#065F46]">
                  <Warehouse className="h-3 w-3" />
                  IT: {data.kpis.unitsItalia}
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-[#FEF3C7] px-2 py-0.5 text-[#92400E]">
                  <Ship className="h-3 w-3" />
                  CN: {data.kpis.unitsCina}
                </span>
              </div>
            </div>

            {/* KPI 3: Visite Sito, Conversione & AOV */}
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-card">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#475569]">
                  Visite &amp; Conversione
                </span>
                <DeltaPill value={data.kpis.visitsDeltaPct} />
              </div>
              <div className="mt-3 flex items-baseline gap-2.5">
                <span className="font-display text-3xl font-extrabold tabular-nums text-[#0F172A]">
                  {data.kpis.uniqueVisits.toLocaleString("it-IT")}
                </span>
                <span className="rounded-lg bg-[#0052FF]/10 px-2 py-0.5 text-xs font-extrabold tabular-nums text-[#0052FF]">
                  {data.kpis.conversionRatePct.toFixed(2)}% CVR
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-[#E2E8F0] pt-2.5 text-xs">
                <span className="text-[#475569]">Scontrino medio (AOV)</span>
                <span className="font-bold tabular-nums text-[#0F172A]">
                  {formatEur(data.kpis.aovEur)}
                </span>
              </div>
            </div>

            {/* KPI 4: Ordini da Spedire (Alert) */}
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-card">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#475569]">
                  Ordini da Spedire
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#FF5A1F]/15 px-2.5 py-0.5 text-[11px] font-extrabold text-[#FF5A1F]">
                  <AlertTriangle className="h-3 w-3" />
                  Priorità
                </span>
              </div>
              <p className="mt-3 font-display text-3xl font-extrabold tabular-nums text-[#0F172A]">
                {data.kpis.ordersToShipCount}
              </p>
              <div className="mt-3 flex items-center justify-between border-t border-[#E2E8F0] pt-2.5 text-xs">
                <span className="font-semibold text-[#C2410C]">
                  {data.kpis.splitOrdersCount} Split IT+CN &bull;{" "}
                  {data.kpis.lowStockCount} sottoscorta
                </span>
                <Link
                  href="/admin/ordini"
                  className="font-bold text-[#0052FF] hover:underline"
                >
                  Gestisci →
                </Link>
              </div>
            </div>
          </div>

          {/* 3. Sezione Centrale (65% / 35%) */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
            {/* Sinistra (~65% -> 8 cols) */}
            <div className="space-y-6 xl:col-span-8">
              {/* Grafico Combinato Interattivo */}
              <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-card">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="flex items-center gap-2 font-display text-base font-extrabold text-[#0F172A]">
                      <TrendingUp className="h-4 w-4 text-[#0052FF]" />
                      Visite al Sito vs Unità Vendute
                    </h2>
                    <p className="text-xs text-[#475569]">
                      Andamento giornaliero con filtro per canale di vendita
                    </p>
                  </div>

                  <div className="inline-flex rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-1">
                    {(
                      [
                        ["all", "Tutti"],
                        ["stripe", "Stripe"],
                        ["csv", "Sync CSV"],
                      ] as const
                    ).map(([k, lbl]) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => setChannelFilter(k)}
                        className={cn(
                          "min-h-[34px] rounded-lg px-3 text-xs font-bold transition-colors",
                          channelFilter === k
                            ? "bg-[#0052FF] text-white"
                            : "text-[#475569] hover:text-[#0F172A]"
                        )}
                      >
                        {lbl}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-5 h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={chartData}
                      margin={{ top: 8, right: 8, bottom: 0, left: -12 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 11, fill: "#475569" }}
                      />
                      <YAxis
                        yAxisId="left"
                        tick={{ fontSize: 11, fill: "#475569" }}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        tick={{ fontSize: 11, fill: "#0052FF" }}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: 12,
                          borderColor: "#E2E8F0",
                          fontSize: 12,
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar
                        yAxisId="right"
                        dataKey="vendute"
                        name="Gomme Vendute"
                        fill="#0052FF"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={28}
                      />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="visite"
                        name="Visite Uniche"
                        stroke="#FF5A1F"
                        strokeWidth={2.5}
                        dot={{ r: 3 }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>

                {/* Funnel Conversione Privacy-First */}
                <div className="mt-5 grid grid-cols-2 gap-2.5 border-t border-[#E2E8F0] pt-4 sm:grid-cols-4">
                  {[
                    {
                      label: "Visite Uniche",
                      val: data.funnel.uniqueVisits,
                      pct: "100%",
                    },
                    {
                      label: "Aggiunte Carrello",
                      val: data.funnel.cartAdds,
                      pct: `${data.funnel.uniqueVisits > 0 ? Math.round((data.funnel.cartAdds / data.funnel.uniqueVisits) * 100) : 0}%`,
                    },
                    {
                      label: "Avvio Checkout",
                      val: data.funnel.checkoutStarts,
                      pct: `${data.funnel.uniqueVisits > 0 ? Math.round((data.funnel.checkoutStarts / data.funnel.uniqueVisits) * 100) : 0}%`,
                    },
                    {
                      label: "Ordini Pagati",
                      val: data.funnel.paidOrders,
                      pct: `${data.kpis.conversionRatePct.toFixed(1)}%`,
                    },
                  ].map((step) => (
                    <div
                      key={step.label}
                      className="rounded-xl bg-[#F8FAFC] p-3 ring-1 ring-[#E2E8F0]"
                    >
                      <p className="text-[11px] font-semibold text-[#475569]">
                        {step.label}
                      </p>
                      <div className="mt-1 flex items-baseline justify-between tabular-nums">
                        <span className="font-display text-lg font-extrabold text-[#0F172A]">
                          {step.val.toLocaleString("it-IT")}
                        </span>
                        <span className="text-[11px] font-bold text-[#0052FF]">
                          {step.pct}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Gomme Vendute + Misure più Cercate */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-card">
                  <h3 className="flex items-center gap-2 font-display text-sm font-extrabold uppercase tracking-wider text-[#0F172A]">
                    <PackageCheck className="h-4 w-4 text-[#10B981]" />
                    Top Gomme Vendute
                  </h3>
                  <ul className="mt-4 divide-y divide-[#E2E8F0]">
                    {data.topSoldTires.map((tire) => (
                      <li
                        key={tire.sku}
                        className="flex items-center justify-between gap-3 py-3 text-xs"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-bold text-[#0F172A]">
                            {tire.brand} {tire.model}
                          </p>
                          <p className="tabular-nums text-[#475569]">
                            {tire.sizeLabel} &bull; IT: {tire.stockItalia} | CN:{" "}
                            {tire.stockCina}
                          </p>
                        </div>
                        <div className="shrink-0 text-right tabular-nums">
                          <p className="font-extrabold text-[#0F172A]">
                            {tire.units} pz
                          </p>
                          <p className="text-[11px] font-semibold text-[#0052FF]">
                            {formatEur(tire.revenueEur)}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-card">
                  <h3 className="flex items-center gap-2 font-display text-sm font-extrabold uppercase tracking-wider text-[#0F172A]">
                    <Search className="h-4 w-4 text-[#FF5A1F]" />
                    Misure Più Cercate (Domanda Reale)
                  </h3>
                  <ul className="mt-4 divide-y divide-[#E2E8F0]">
                    {data.searchDemand.map((item) => (
                      <li
                        key={item.sizeQuery}
                        className="flex items-center justify-between gap-2 py-3 text-xs"
                      >
                        <div>
                          <p className="font-mono font-extrabold text-[#0F172A]">
                            {item.sizeQuery}
                          </p>
                          <p className="text-[11px] text-[#475569]">
                            Cercata{" "}
                            <strong className="tabular-nums text-[#0F172A]">
                              {item.searches}
                            </strong>{" "}
                            volte
                          </p>
                        </div>
                        {item.stockAlert ? (
                          <span className="rounded-full bg-[#FEE2E2] px-2.5 py-1 text-[10px] font-extrabold text-[#B91C1C]">
                            0 in stock IT (CN: {item.stockCina})
                          </span>
                        ) : (
                          <span className="rounded-full bg-[#D1FAE5] px-2.5 py-1 text-[10px] font-extrabold text-[#065F46]">
                            IT: {item.stockItalia} pz OK
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Destra (~35% -> 4 cols) */}
            <div className="space-y-6 xl:col-span-4">
              {/* Quick Dropzone CSV Serale */}
              <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-card">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="flex items-center gap-2 font-display text-base font-extrabold text-[#0F172A]">
                    <FileSpreadsheet className="h-4 w-4 text-[#0052FF]" />
                    Quick Sync CSV Serale
                  </h2>
                  <a
                    href="/api/admin/csv/template"
                    className="text-xs font-bold text-[#0052FF] hover:underline"
                  >
                    Template CSV
                  </a>
                </div>
                <p className="mt-1 text-xs text-[#475569]">
                  Trascina qui il file CSV della sera per anteprima dry-run
                  istantanea di giacenze Italia &amp; Cina.
                </p>

                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const f = e.dataTransfer.files[0];
                    if (f) void handleQuickCsvSelect(f);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      fileInputRef.current?.click();
                    }
                  }}
                  className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#0052FF]/35 bg-[#F8FAFC] p-6 text-center transition-colors hover:border-[#0052FF] hover:bg-[#0052FF]/5"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,text/csv"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) void handleQuickCsvSelect(f);
                    }}
                  />
                  {quickBusy ? (
                    <Loader2 className="h-7 w-7 animate-spin text-[#0052FF]" />
                  ) : (
                    <UploadCloud className="h-7 w-7 text-[#0052FF]" />
                  )}
                  <p className="mt-2 text-xs font-bold text-[#0F172A]">
                    Trascina il file .csv o clicca per selezionare
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#475569]">
                    Max 10MB &bull; Validazione Zod anti-injection
                  </p>
                </div>

                {quickError ? (
                  <p className="mt-3 rounded-xl bg-[#FEE2E2] p-3 text-xs font-semibold text-[#B91C1C]">
                    {quickError}
                  </p>
                ) : null}

                {quickMessage ? (
                  <p className="mt-3 rounded-xl bg-[#D1FAE5] p-3 text-xs font-semibold text-[#065F46]">
                    {quickMessage}
                  </p>
                ) : null}

                {quickPreview ? (
                  <div className="mt-4 space-y-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 text-xs">
                    <p className="font-bold text-[#0F172A]">
                      Anteprima: {quickPreview.filename}
                    </p>
                    <div className="grid grid-cols-2 gap-2 tabular-nums">
                      <div className="rounded-lg bg-white p-2 ring-1 ring-[#E2E8F0]">
                        <span className="text-[#475569]">Aggiornati</span>
                        <p className="font-extrabold text-[#0052FF]">
                          {quickPreview.updatedCount} SKU
                        </p>
                      </div>
                      <div className="rounded-lg bg-white p-2 ring-1 ring-[#E2E8F0]">
                        <span className="text-[#475569]">Nuovi SKU</span>
                        <p className="font-extrabold text-[#10B981]">
                          +{quickPreview.createdCount}
                        </p>
                      </div>
                      <div className="rounded-lg bg-white p-2 ring-1 ring-[#E2E8F0]">
                        <span className="text-[#475569]">Vendite rilevate</span>
                        <p className="font-extrabold text-[#0F172A]">
                          {quickPreview.totalDetectedUnitsSold} pz
                        </p>
                      </div>
                      <div className="rounded-lg bg-white p-2 ring-1 ring-[#E2E8F0]">
                        <span className="text-[#475569]">Errori riga</span>
                        <p
                          className={cn(
                            "font-extrabold",
                            quickPreview.errorCount > 0
                              ? "text-[#EF4444]"
                              : "text-[#10B981]"
                          )}
                        >
                          {quickPreview.errorCount}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={quickBusy}
                      onClick={handleQuickCsvApply}
                      className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[#0052FF] px-4 text-xs font-extrabold uppercase text-white hover:bg-[#003ECC] disabled:opacity-60"
                    >
                      Applica Aggiornamento al Sito
                    </button>
                  </div>
                ) : null}

                <Link
                  href="/admin/import-csv"
                  className="mt-4 inline-flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-xl border border-[#E2E8F0] text-xs font-bold text-[#0F172A] hover:bg-slate-50"
                >
                  Apri Console CSV Completa &amp; Rollback
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Feed Attività Recenti */}
              <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-card">
                <h2 className="flex items-center gap-2 font-display text-base font-extrabold text-[#0F172A]">
                  <Eye className="h-4 w-4 text-[#0052FF]" />
                  Attività Recenti
                </h2>
                <ul className="mt-4 space-y-3">
                  {data.recentActivity.map((act) => (
                    <li
                      key={act.id}
                      className="flex items-start gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-xs"
                    >
                      <div
                        className={cn(
                          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                          act.type === "warning"
                            ? "bg-[#FF5A1F]/15 text-[#FF5A1F]"
                            : act.type === "csv"
                              ? "bg-[#10B981]/15 text-[#10B981]"
                              : "bg-[#0052FF]/15 text-[#0052FF]"
                        )}
                      >
                        {act.type === "warning" ? (
                          <AlertTriangle className="h-4 w-4" />
                        ) : act.type === "csv" ? (
                          <FileSpreadsheet className="h-4 w-4" />
                        ) : (
                          <CreditCard className="h-4 w-4" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-[#0F172A]">{act.title}</p>
                        <p className="mt-0.5 text-[#475569]">{act.subtitle}</p>
                        <p className="mt-1 text-[10px] font-semibold text-slate-400">
                          {new Date(act.timestamp).toLocaleString("it-IT", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
