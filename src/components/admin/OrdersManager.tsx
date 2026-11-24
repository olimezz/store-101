"use client";

import React, { useCallback, useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  CheckCircle2,
  Loader2,
  Mail,
  MessageCircle,
  Search,
  Ship,
  Split,
  Truck,
  Warehouse,
  X,
} from "lucide-react";
import type { AdminOrder, AdminOrderStatus } from "@/lib/admin-types";
import { cn, formatEur } from "@/lib/utils";

const STATUS_META: Record<
  AdminOrderStatus,
  { label: string; badgeClass: string }
> = {
  pagato: {
    label: "Pagato (Stripe)",
    badgeClass: "bg-[#0052FF]/10 text-[#0052FF]",
  },
  in_lavorazione_it: {
    label: "In Lavorazione IT",
    badgeClass: "bg-[#D1FAE5] text-[#065F46]",
  },
  ordine_fornitore_cn: {
    label: "Ordine Fornitore CN",
    badgeClass: "bg-[#FEF3C7] text-[#92400E]",
  },
  spedito: {
    label: "Spedito",
    badgeClass: "bg-[#E0F2FE] text-[#0369A1]",
  },
  consegnato: {
    label: "Consegnato",
    badgeClass: "bg-slate-200 text-[#0F172A]",
  },
};

function buildWhatsAppOrderLink(order: AdminOrder): string | null {
  if (!order.customerPhone) return null;
  const digits = order.customerPhone.replace(/[^0-9]/g, "");
  if (!digits) return null;
  const msg = order.trackingCode
    ? `Ciao ${order.customerName}, il tuo ordine STORE 101 ${order.orderNumber} è stato spedito con ${order.carrier ?? "corriere espresso"}! Codice tracking: ${order.trackingCode}.`
    : `Ciao ${order.customerName}, aggiornamento sul tuo ordine STORE 101 ${order.orderNumber}: stato attuale "${STATUS_META[order.status].label}". Per qualsiasi domanda rispondici qui!`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(msg)}`;
}

export function OrdersManager() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [originFilter, setOriginFilter] = useState<
    "all" | "italia" | "cina" | "split"
  >("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [editStatus, setEditStatus] = useState<AdminOrderStatus>("pagato");
  const [editCarrier, setEditCarrier] = useState("");
  const [editTracking, setEditTracking] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({ origin: originFilter });
      if (search.trim()) qs.set("q", search.trim());
      const res = await fetch(`/api/admin/orders?${qs.toString()}`, {
        cache: "no-store",
      });
      if (!res.ok) return;
      const json = (await res.json()) as { orders?: AdminOrder[] };
      setOrders(json.orders ?? []);
    } finally {
      setLoading(false);
    }
  }, [originFilter, search]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const openDrawer = (order: AdminOrder) => {
    setSelectedOrder(order);
    setEditStatus(order.status);
    setEditCarrier(order.carrier ?? (order.logisticsOrigin === "cina" ? "DHL Express Import" : "BRT"));
    setEditTracking(order.trackingCode ?? "");
    setToast(null);
  };

  const handleSaveOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setSaving(true);
    setToast(null);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          status: editStatus,
          carrier: editCarrier || null,
          trackingCode: editTracking.trim() || null,
        }),
      });
      const json = (await res.json()) as {
        order?: AdminOrder;
        trackingEmailTriggered?: boolean;
      };
      if (res.ok && json.order) {
        setSelectedOrder(json.order);
        setToast(
          json.trackingEmailTriggered
            ? `Ordine aggiornato ed email transazionale con tracking ${json.order.trackingCode} inviata a ${json.order.customerEmail}!`
            : "Stato logistico ordine aggiornato."
        );
        await loadOrders();
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
            Ordini &amp; Pipeline Logistica
          </h1>
          <p className="mt-1 text-xs text-[#475569]">
            Gestisci spedizioni Magazzino Italia (4-7 gg), ordini fornitore Cina
            (5-15 gg) e Split Order con invio automatico tracking.
          </p>
        </div>

        <div className="relative w-full lg:w-80">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#475569]" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cerca ordine, cliente, misura (245/40R18)..."
            className="min-h-[44px] w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] pl-10 pr-3 text-sm text-[#0F172A] focus:border-[#0052FF] focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      {/* Origin filters */}
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["all", "Tutti gli Ordini"],
            ["italia", "Solo Italia (4-7 gg)"],
            ["cina", "Solo Cina (5-15 gg)"],
            ["split", "Ordini Misti (Split IT+CN)"],
          ] as const
        ).map(([k, lbl]) => (
          <button
            key={k}
            type="button"
            onClick={() => setOriginFilter(k)}
            className={cn(
              "min-h-[44px] rounded-xl border px-4 text-xs font-bold transition-colors",
              originFilter === k
                ? "border-[#0052FF] bg-[#0052FF] text-white"
                : "border-[#E2E8F0] bg-white text-[#475569] hover:border-[#0F172A] hover:text-[#0F172A]"
            )}
          >
            {lbl}
          </button>
        ))}
      </div>

      {/* Table (Desktop) / Compact Cards (Mobile) */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-white shadow-card">
        {loading ? (
          <div className="h-52 animate-pulse rounded-2xl bg-slate-50" />
        ) : orders.length === 0 ? (
          <p className="p-10 text-center text-sm font-semibold text-[#475569]">
            Nessun ordine trovato per i filtri selezionati.
          </p>
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[11px] font-bold uppercase tracking-wider text-[#475569]">
                    <th className="px-5 py-3.5">Ordine</th>
                    <th className="px-4 py-3.5">Cliente</th>
                    <th className="px-4 py-3.5">Articoli &amp; Misura</th>
                    <th className="px-4 py-3.5">Origine Logistica</th>
                    <th className="px-4 py-3.5">Stato</th>
                    <th className="px-4 py-3.5">Totale / Margine</th>
                    <th className="px-5 py-3.5 text-right">Gestione</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] tabular-nums">
                  {orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-[#F8FAFC]/70">
                      <td className="px-5 py-4">
                        <p className="font-mono font-extrabold text-[#0F172A]">
                          {ord.orderNumber}
                        </p>
                        <p className="text-[11px] text-[#475569]">
                          {new Date(ord.createdAt).toLocaleDateString("it-IT", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-bold text-[#0F172A]">
                          {ord.customerName}
                        </p>
                        <p className="text-[11px] text-[#475569]">
                          {ord.customerEmail}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        {ord.lines.map((l) => (
                          <p key={l.sku} className="font-semibold text-[#0F172A]">
                            {l.quantity}x {l.brand} {l.model}{" "}
                            <span className="font-mono text-[#475569]">
                              ({l.sizeLabel})
                            </span>
                          </p>
                        ))}
                      </td>
                      <td className="px-4 py-4">
                        {ord.logisticsOrigin === "italia" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#D1FAE5] px-2.5 py-1 font-bold text-[#065F46]">
                            <Warehouse className="h-3 w-3" />
                            Italia ({ord.unitsItalia} pz)
                          </span>
                        ) : ord.logisticsOrigin === "cina" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#FEF3C7] px-2.5 py-1 font-bold text-[#92400E]">
                            <Ship className="h-3 w-3" />
                            Cina ({ord.unitsCina} pz)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF7ED] px-2.5 py-1 font-bold text-[#C2410C] ring-1 ring-[#FF5A1F]/40">
                            <Split className="h-3 w-3" />
                            Split ({ord.unitsItalia} IT + {ord.unitsCina} CN)
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-1 font-bold",
                            STATUS_META[ord.status].badgeClass
                          )}
                        >
                          {STATUS_META[ord.status].label}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-extrabold text-[#0F172A]">
                          {formatEur(ord.totalEur)}
                        </p>
                        <p className="text-[11px] font-semibold text-[#10B981]">
                          Margine: +{formatEur(ord.estimatedMarginEur)}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => openDrawer(ord)}
                          className="min-h-[40px] rounded-xl bg-[#0F172A] px-3.5 text-xs font-bold text-white hover:bg-[#0052FF]"
                        >
                          Dettagli &amp; Tracking
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="divide-y divide-[#E2E8F0] lg:hidden">
              {orders.map((ord) => (
                <div key={ord.id} className="space-y-2.5 p-4 text-xs tabular-nums">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-mono font-extrabold text-[#0F172A]">
                        {ord.orderNumber}
                      </p>
                      <p className="font-bold text-[#0F172A]">
                        {ord.customerName}
                      </p>
                    </div>
                    <p className="font-display text-base font-extrabold text-[#0052FF]">
                      {formatEur(ord.totalEur)}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 font-bold",
                        STATUS_META[ord.status].badgeClass
                      )}
                    >
                      {STATUS_META[ord.status].label}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 font-bold text-[#0F172A]">
                      {ord.logisticsOrigin === "italia"
                        ? "Italia 4-7 gg"
                        : ord.logisticsOrigin === "cina"
                          ? "Cina 5-15 gg"
                          : `Split ${ord.unitsItalia} IT + ${ord.unitsCina} CN`}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => openDrawer(ord)}
                    className="min-h-[44px] w-full rounded-xl bg-[#0F172A] text-xs font-bold text-white"
                  >
                    Apri Dettaglio &amp; Inserisci Tracking
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Order Detail Slide-Over Drawer */}
      <Dialog.Root
        open={Boolean(selectedOrder)}
        onOpenChange={(open) => {
          if (!open) setSelectedOrder(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-[#0F172A]/60 backdrop-blur-sm" />
          <Dialog.Content className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col bg-white shadow-2xl focus:outline-none">
            {selectedOrder ? (
              <>
                <div className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-4">
                  <div>
                    <Dialog.Title className="font-display text-lg font-extrabold text-[#0F172A]">
                      Ordine {selectedOrder.orderNumber}
                    </Dialog.Title>
                    <Dialog.Description className="text-xs text-[#475569]">
                      {selectedOrder.customerName} &bull;{" "}
                      {selectedOrder.customerEmail}
                    </Dialog.Description>
                  </div>
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      aria-label="Chiudi dettaglio ordine"
                      className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-[#475569] hover:bg-slate-100"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </Dialog.Close>
                </div>

                <div className="flex-1 space-y-5 overflow-y-auto p-5 text-xs">
                  {/* Split / Origin info */}
                  <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 space-y-2">
                    <p className="font-bold uppercase tracking-wider text-[#475569]">
                      Dettagli Spedizione &amp; Origine
                    </p>
                    <p className="font-semibold text-[#0F172A]">
                      {selectedOrder.shippingAddress}
                    </p>
                    <p className="text-[#475569]">
                      Consegna:{" "}
                      <strong className="text-[#0F172A]">
                        {selectedOrder.deliveryMode === "partner-workshop"
                          ? "Officina Partner"
                          : "Domicilio Cliente"}
                      </strong>
                    </p>
                    {selectedOrder.logisticsOrigin === "split" ? (
                      <p className="rounded-lg bg-[#FFF7ED] p-2.5 font-bold text-[#C2410C]">
                        Split Order ({selectedOrder.unitsItalia} pz Italia +{" "}
                        {selectedOrder.unitsCina} pz Cina) &bull; Scelta cliente:{" "}
                        {selectedOrder.splitPreference === "single_consolidated"
                          ? "Spedizione unica consolidata (5-15 gg)"
                          : "Spedizioni separate (4-7 gg + 5-15 gg)"}
                      </p>
                    ) : null}
                  </div>

                  {/* Line items */}
                  <div className="rounded-xl border border-[#E2E8F0] p-4">
                    <p className="font-bold uppercase tracking-wider text-[#475569]">
                      Pneumatici Ordinati
                    </p>
                    <ul className="mt-2.5 divide-y divide-[#E2E8F0] tabular-nums">
                      {selectedOrder.lines.map((line) => (
                        <li
                          key={line.sku}
                          className="flex items-center justify-between py-2.5"
                        >
                          <div>
                            <p className="font-bold text-[#0F172A]">
                              {line.quantity}x {line.brand} {line.model}
                            </p>
                            <p className="text-[11px] text-[#475569]">
                              {line.sizeLabel} &bull; IT: {line.qtyItalia} | CN:{" "}
                              {line.qtyCina}
                            </p>
                          </div>
                          <span className="font-extrabold text-[#0F172A]">
                            {formatEur(line.unitPriceEur * line.quantity)}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-2 flex justify-between border-t border-[#E2E8F0] pt-2.5 font-display text-sm font-extrabold text-[#0F172A]">
                      <span>Totale (PFU €{selectedOrder.pfuTotalEur.toFixed(2)} incl.)</span>
                      <span>{formatEur(selectedOrder.totalEur)}</span>
                    </div>
                  </div>

                  {/* Status + Tracking Form */}
                  <form
                    onSubmit={handleSaveOrder}
                    className="space-y-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4"
                  >
                    <p className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[#0F172A]">
                      <Truck className="h-4 w-4 text-[#0052FF]" />
                      Aggiorna Stato &amp; Tracking
                    </p>

                    <div>
                      <label className="block text-[11px] font-bold text-[#475569]">
                        Stato Pipeline Ordine
                      </label>
                      <select
                        value={editStatus}
                        onChange={(e) =>
                          setEditStatus(e.target.value as AdminOrderStatus)
                        }
                        className="mt-1 min-h-[44px] w-full rounded-xl border border-[#E2E8F0] bg-white px-3 text-sm font-semibold text-[#0F172A]"
                      >
                        <option value="pagato">Pagato (Stripe)</option>
                        <option value="in_lavorazione_it">
                          In Lavorazione (Magazzino Italia)
                        </option>
                        <option value="ordine_fornitore_cn">
                          Ordine Fornitore Cina (Import)
                        </option>
                        <option value="spedito">Spedito</option>
                        <option value="consegnato">Consegnato</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className="block text-[11px] font-bold text-[#475569]">
                          Corriere
                        </label>
                        <select
                          value={editCarrier}
                          onChange={(e) => setEditCarrier(e.target.value)}
                          className="mt-1 min-h-[44px] w-full rounded-xl border border-[#E2E8F0] bg-white px-3 text-sm font-semibold text-[#0F172A]"
                        >
                          <option value="BRT">BRT (Italia)</option>
                          <option value="GLS">GLS (Italia)</option>
                          <option value="SDA">SDA / Poste</option>
                          <option value="DHL Express Import">
                            DHL Express (Import CN)
                          </option>
                          <option value="FedEx Cargo">
                            FedEx Cargo (Import CN)
                          </option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#475569]">
                          Codice Tracking
                        </label>
                        <input
                          type="text"
                          value={editTracking}
                          onChange={(e) => setEditTracking(e.target.value)}
                          placeholder="Es. BRT-981234567"
                          className="mt-1 min-h-[44px] w-full rounded-xl border border-[#E2E8F0] bg-white px-3 font-mono text-sm font-semibold text-[#0F172A]"
                        />
                      </div>
                    </div>

                    {selectedOrder.trackingEmailSentAt ? (
                      <p className="flex items-center gap-1.5 text-[11px] font-semibold text-[#10B981]">
                        <Mail className="h-3.5 w-3.5" />
                        Email tracking inviata il{" "}
                        {new Date(
                          selectedOrder.trackingEmailSentAt
                        ).toLocaleString("it-IT")}
                      </p>
                    ) : null}

                    {toast ? (
                      <p className="flex items-start gap-2 rounded-xl bg-[#D1FAE5] p-3 text-xs font-bold text-[#065F46]">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                        {toast}
                      </p>
                    ) : null}

                    <button
                      type="submit"
                      disabled={saving}
                      className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-[#0052FF] px-4 text-xs font-extrabold uppercase tracking-wide text-white hover:bg-[#003ECC] disabled:opacity-60"
                    >
                      {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Salva & Invia Notifica Tracking"
                      )}
                    </button>
                  </form>

                  {/* 1-click WhatsApp */}
                  {buildWhatsAppOrderLink(selectedOrder) ? (
                    <a
                      href={buildWhatsAppOrderLink(selectedOrder) ?? "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-[#10B981] px-4 text-xs font-extrabold uppercase tracking-wide text-white hover:bg-[#059669]"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Apri Chat WhatsApp con Stato Spedizione
                    </a>
                  ) : null}
                </div>
              </>
            ) : null}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
