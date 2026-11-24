"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  History,
  Loader2,
  RotateCcw,
  ShieldCheck,
  Ship,
  UploadCloud,
  Warehouse,
} from "lucide-react";
import type { CsvDryRunResult } from "@/lib/admin-types";
import { useCatalogFilter } from "@/context/CatalogFilterContext";
import { cn, formatEur } from "@/lib/utils";

interface CsvHistoryEntry {
  id: string;
  filename: string;
  uploadedBy: string;
  uploadedAt: string;
  rowsProcessed: number;
  updatedCount: number;
  createdCount: number;
  errorCount: number;
  detectedUnitsSold: number;
  rolledBack: boolean;
  rolledBackAt: string | null;
}

export function CsvImportConsole() {
  const { refreshProducts } = useCatalogFilter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<CsvDryRunResult | null>(null);
  const [history, setHistory] = useState<CsvHistoryEntry[]>([]);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [applying, setApplying] = useState(false);
  const [rollingBackId, setRollingBackId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    const res = await fetch("/api/admin/csv/history", { cache: "no-store" });
    if (!res.ok) return;
    const json = (await res.json()) as { history?: CsvHistoryEntry[] };
    setHistory(json.history ?? []);
  }, []);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  const handleFile = async (file: File) => {
    setError(null);
    setSuccessMsg(null);
    setPreview(null);
    setSelectedFile(file);
    setLoadingPreview(true);

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
        setError(json.error ?? "Impossibile analizzare il file CSV.");
        return;
      }
      setPreview(json.preview);
    } catch {
      setError("Errore di rete durante la verifica del file CSV.");
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleApply = async () => {
    if (!selectedFile) return;
    setApplying(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const fd = new FormData();
      fd.append("file", selectedFile);
      const res = await fetch("/api/admin/csv/apply", {
        method: "POST",
        body: fd,
      });
      const json = (await res.json()) as {
        ok?: boolean;
        error?: string;
        preview?: CsvDryRunResult;
      };
      if (!res.ok) {
        setError(json.error ?? "Errore durante l'applicazione del CSV.");
        return;
      }
      setSuccessMsg(
        `Sincronizzazione completata! ${json.preview?.updatedCount ?? 0} SKU aggiornati, ${json.preview?.createdCount ?? 0} nuovi SKU aggiunti. Lo storefront mostra già i nuovi tempi Italia (4-7 gg) / Cina (5-15 gg).`
      );
      setPreview(null);
      setSelectedFile(null);
      await Promise.all([loadHistory(), refreshProducts()]);
    } catch {
      setError("Errore di connessione durante il salvataggio.");
    } finally {
      setApplying(false);
    }
  };

  const handleRollback = async (importId: string) => {
    setRollingBackId(importId);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch("/api/admin/csv/rollback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ importId }),
      });
      const json = (await res.json()) as { message?: string; error?: string };
      if (!res.ok) {
        setError(json.error ?? "Impossibile eseguire il rollback.");
        return;
      }
      setSuccessMsg(json.message ?? "Versione precedente ripristinata!");
      await Promise.all([loadHistory(), refreshProducts()]);
    } catch {
      setError("Errore di rete durante il rollback.");
    } finally {
      setRollingBackId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-card sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-[#0F172A]">
            Sincronizzazione Serale CSV
          </h1>
          <p className="mt-1 text-xs text-[#475569]">
            Carica il file CSV serale per sincronizzare stock Italia (4-7 gg),
            stock Cina (5-15 gg lav.), prezzi e vendite con anteprima dry-run.
          </p>
        </div>

        <a
          href="/api/admin/csv/template"
          className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl border border-[#0052FF] bg-[#0052FF]/10 px-4 text-xs font-extrabold uppercase tracking-wide text-[#0052FF] transition-colors hover:bg-[#0052FF] hover:text-white"
        >
          <Download className="h-4 w-4" />
          Scarica Template CSV di Esempio
        </a>
      </div>

      {/* Dropzone Full-Width */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-card sm:p-6">
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files[0];
            if (f) void handleFile(f);
          }}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              fileInputRef.current?.click();
            }
          }}
          className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#0052FF]/40 bg-[#F8FAFC] px-6 py-10 text-center transition-colors hover:border-[#0052FF] hover:bg-[#0052FF]/5"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleFile(f);
            }}
          />
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0052FF]/10 text-[#0052FF]">
            {loadingPreview ? (
              <Loader2 className="h-7 w-7 animate-spin" />
            ) : (
              <UploadCloud className="h-7 w-7" />
            )}
          </div>
          <p className="mt-4 font-display text-base font-extrabold text-[#0F172A]">
            Trascina qui il file CSV serale oppure clicca per selezionarlo
          </p>
          <p className="mt-1 max-w-xl text-xs text-[#475569]">
            Colonne supportate:{" "}
            <code className="rounded bg-white px-1.5 py-0.5 text-[11px] ring-1 ring-[#E2E8F0]">
              sku, brand, modello, misura, stagione, stock_italia, stock_cina,
              prezzo_vendita, costo_acquisto, unita_vendute_oggi
            </code>
          </p>
          <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700">
            <ShieldCheck className="h-3.5 w-3.5" />
            Limite 10MB &bull; Verifica MIME &bull; Anti CSV Formula Injection
            &bull; Validazione Zod riga per riga
          </div>
        </div>

        {error ? (
          <div
            role="alert"
            className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-[#FEE2E2] p-3.5 text-xs font-bold text-[#B91C1C]"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        ) : null}

        {successMsg ? (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-[#D1FAE5] p-3.5 text-xs font-bold text-[#065F46]">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {successMsg}
          </div>
        ) : null}
      </div>

      {/* Dry-Run Preview & Diff Table */}
      {preview ? (
        <div className="space-y-4 rounded-2xl border-2 border-[#0052FF]/35 bg-white p-5 shadow-card sm:p-6">
          <div className="flex flex-col gap-4 border-b border-[#E2E8F0] pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#FF5A1F]/15 px-2.5 py-0.5 text-[11px] font-extrabold uppercase text-[#FF5A1F]">
                Anteprima Dry-Run (Database non ancora modificato)
              </span>
              <h2 className="mt-1.5 font-display text-lg font-extrabold text-[#0F172A]">
                {preview.filename} ({preview.totalRows} righe elaborate)
              </h2>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setPreview(null);
                  setSelectedFile(null);
                }}
                className="min-h-[46px] rounded-xl border border-[#E2E8F0] px-4 text-xs font-bold text-[#475569] hover:bg-slate-50"
              >
                Annulla
              </button>
              <button
                type="button"
                disabled={
                  applying ||
                  preview.updatedCount + preview.createdCount === 0
                }
                onClick={handleApply}
                className="inline-flex min-h-[46px] items-center gap-2 rounded-xl bg-[#0052FF] px-5 text-xs font-extrabold uppercase tracking-wide text-white shadow-md hover:bg-[#003ECC] disabled:opacity-60"
              >
                {applying ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Applicazione in corso...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Applica Aggiornamento al Sito
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 4 Diff Summary Cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl bg-[#F8FAFC] p-3.5 ring-1 ring-[#E2E8F0]">
              <p className="text-[11px] font-bold uppercase text-[#475569]">
                Prodotti aggiornati
              </p>
              <p className="mt-1 font-display text-2xl font-extrabold tabular-nums text-[#0052FF]">
                {preview.updatedCount}
              </p>
            </div>
            <div className="rounded-xl bg-[#F8FAFC] p-3.5 ring-1 ring-[#E2E8F0]">
              <p className="text-[11px] font-bold uppercase text-[#475569]">
                Nuovi SKU rilevati
              </p>
              <p className="mt-1 font-display text-2xl font-extrabold tabular-nums text-[#10B981]">
                +{preview.createdCount}
              </p>
            </div>
            <div className="rounded-xl bg-[#F8FAFC] p-3.5 ring-1 ring-[#E2E8F0]">
              <p className="text-[11px] font-bold uppercase text-[#475569]">
                Unità vendute rilevate
              </p>
              <p className="mt-1 font-display text-2xl font-extrabold tabular-nums text-[#0F172A]">
                {preview.totalDetectedUnitsSold} pz
              </p>
            </div>
            <div className="rounded-xl bg-[#F8FAFC] p-3.5 ring-1 ring-[#E2E8F0]">
              <p className="text-[11px] font-bold uppercase text-[#475569]">
                Righe con errori
              </p>
              <p
                className={cn(
                  "mt-1 font-display text-2xl font-extrabold tabular-nums",
                  preview.errorCount > 0 ? "text-[#EF4444]" : "text-[#10B981]"
                )}
              >
                {preview.errorCount}
              </p>
            </div>
          </div>

          {/* Desktop Diff Table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-[11px] font-bold uppercase tracking-wider text-[#475569]">
                  <th className="py-3 pr-3">Riga</th>
                  <th className="py-3 pr-3">SKU &amp; Prodotto</th>
                  <th className="py-3 pr-3">Stock Italia</th>
                  <th className="py-3 pr-3">Stock Cina</th>
                  <th className="py-3 pr-3">Vendute</th>
                  <th className="py-3 pr-3">Prezzo</th>
                  <th className="py-3">Esito / Logistica Sito</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] tabular-nums">
                {preview.rows.map((row) => (
                  <tr
                    key={`${row.rowNumber}-${row.sku}`}
                    className={row.action === "error" ? "bg-[#FEE2E2]/40" : ""}
                  >
                    <td className="py-3 pr-3 font-mono font-bold text-[#475569]">
                      #{row.rowNumber}
                    </td>
                    <td className="py-3 pr-3">
                      <p className="font-mono text-[11px] font-bold text-[#0052FF]">
                        {row.sku}
                      </p>
                      <p className="font-bold text-[#0F172A]">
                        {row.brand} {row.model}{" "}
                        <span className="font-normal text-[#475569]">
                          ({row.sizeLabel})
                        </span>
                      </p>
                    </td>
                    <td className="py-3 pr-3 font-bold">
                      {row.oldStockItalia !== null ? (
                        <span>
                          <span className="text-[#475569]">
                            {row.oldStockItalia}
                          </span>{" "}
                          →{" "}
                          <span className="text-[#065F46]">
                            {row.newStockItalia}
                          </span>
                        </span>
                      ) : (
                        <span className="text-[#065F46]">
                          {row.newStockItalia} (Nuovo)
                        </span>
                      )}
                    </td>
                    <td className="py-3 pr-3 font-bold">
                      {row.oldStockCina !== null ? (
                        <span>
                          <span className="text-[#475569]">
                            {row.oldStockCina}
                          </span>{" "}
                          →{" "}
                          <span className="text-[#92400E]">
                            {row.newStockCina}
                          </span>
                        </span>
                      ) : (
                        <span className="text-[#92400E]">
                          {row.newStockCina}
                        </span>
                      )}
                    </td>
                    <td className="py-3 pr-3 font-bold text-[#0F172A]">
                      {row.detectedUnitsSold > 0 ? (
                        <span className="rounded bg-[#0052FF]/10 px-2 py-0.5 text-[#0052FF]">
                          -{row.detectedUnitsSold} pz
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-3 pr-3 font-bold text-[#0F172A]">
                      {formatEur(row.newPriceEur)}
                    </td>
                    <td className="py-3">
                      {row.action === "error" ? (
                        <span className="font-bold text-[#B91C1C]">
                          {row.errors.join(" • ")}
                        </span>
                      ) : row.logisticsAfter === "italia" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#D1FAE5] px-2.5 py-0.5 text-[11px] font-bold text-[#065F46]">
                          <Warehouse className="h-3 w-3" />
                          Italia 4-7 gg
                        </span>
                      ) : row.logisticsAfter === "cina" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#FEF3C7] px-2.5 py-0.5 text-[11px] font-bold text-[#92400E]">
                          <Ship className="h-3 w-3" />
                          Cina 5-15 gg
                        </span>
                      ) : (
                        <span className="rounded-full bg-[#FEE2E2] px-2.5 py-0.5 text-[11px] font-bold text-[#B91C1C]">
                          Esaurito
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Responsive Diff Cards */}
          <div className="space-y-3 md:hidden">
            {preview.rows.map((row) => (
              <div
                key={`${row.rowNumber}-${row.sku}-m`}
                className={cn(
                  "rounded-xl border p-3.5 text-xs tabular-nums",
                  row.action === "error"
                    ? "border-red-300 bg-[#FEE2E2]/40"
                    : "border-[#E2E8F0] bg-[#F8FAFC]"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[#0052FF]">
                    #{row.rowNumber} &bull; {row.sku}
                  </span>
                  <span className="font-extrabold text-[#0F172A]">
                    {formatEur(row.newPriceEur)}
                  </span>
                </div>
                <p className="mt-1 font-bold text-[#0F172A]">
                  {row.brand} {row.model} ({row.sizeLabel})
                </p>
                {row.action === "error" ? (
                  <p className="mt-2 font-bold text-[#B91C1C]">
                    {row.errors.join(" • ")}
                  </p>
                ) : (
                  <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-bold">
                    <span className="rounded bg-[#D1FAE5] px-2 py-0.5 text-[#065F46]">
                      IT: {row.oldStockItalia ?? "-"} → {row.newStockItalia}
                    </span>
                    <span className="rounded bg-[#FEF3C7] px-2 py-0.5 text-[#92400E]">
                      CN: {row.oldStockCina ?? "-"} → {row.newStockCina}
                    </span>
                    {row.detectedUnitsSold > 0 ? (
                      <span className="rounded bg-[#0052FF]/10 px-2 py-0.5 text-[#0052FF]">
                        Vendute: {row.detectedUnitsSold}
                      </span>
                    ) : null}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Storico Upload Serali (Audit Log + Rollback) */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-card sm:p-6">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-[#0052FF]" />
          <h2 className="font-display text-lg font-extrabold text-[#0F172A]">
            Storico Upload Serali &amp; Rollback
          </h2>
        </div>
        <p className="mt-1 text-xs text-[#475569]">
          Ogni sincronizzazione salva uno snapshot completo del catalogo per
          ripristinare istantaneamente la versione precedente in caso di errore.
        </p>

        <div className="mt-4 space-y-3">
          {history.length === 0 ? (
            <p className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-5 text-center text-xs font-semibold text-[#475569]">
              Nessun file CSV caricato finora. Trascina il tuo primo file CSV
              serale qui sopra per iniziare la sincronizzazione reale.
            </p>
          ) : (
            history.map((entry) => (
            <div
              key={entry.id}
              className="flex flex-col gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0052FF]/10 text-[#0052FF]">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <div className="text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-[#0F172A]">{entry.filename}</p>
                    {entry.rolledBack ? (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                        Ripristinato
                      </span>
                    ) : (
                      <span className="rounded-full bg-[#D1FAE5] px-2 py-0.5 text-[10px] font-bold text-[#065F46]">
                        Applicato
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[#475569]">
                    {new Date(entry.uploadedAt).toLocaleString("it-IT")} &bull;{" "}
                    {entry.uploadedBy}
                  </p>
                  <p className="mt-1 font-semibold tabular-nums text-[#0F172A]">
                    {entry.rowsProcessed} righe &bull; {entry.updatedCount}{" "}
                    aggiornati &bull; +{entry.createdCount} nuovi &bull;{" "}
                    {entry.detectedUnitsSold} vendite rilevate
                  </p>
                </div>
              </div>

              {!entry.rolledBack ? (
                <button
                  type="button"
                  disabled={rollingBackId === entry.id}
                  onClick={() => handleRollback(entry.id)}
                  className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white px-4 text-xs font-bold text-[#0F172A] transition-colors hover:border-[#FF5A1F] hover:text-[#FF5A1F] disabled:opacity-60"
                >
                  {rollingBackId === entry.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RotateCcw className="h-4 w-4" />
                  )}
                  Ripristina versione precedente
                </button>
              ) : null}
            </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
