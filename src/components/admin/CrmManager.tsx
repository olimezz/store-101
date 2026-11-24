"use client";

import React, { useCallback, useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  AlertTriangle,
  Car,
  CheckCircle2,
  Download,
  Loader2,
  MessageCircle,
  Search,
  ShieldAlert,
  Trash2,
  UserCheck,
  X,
} from "lucide-react";
import type { AdminOrder, CrmCustomer } from "@/lib/admin-types";
import { formatEur } from "@/lib/utils";

interface CustomerWithOrders extends CrmCustomer {
  orders: AdminOrder[];
}

function buildWhatsAppCustomerLink(customer: CustomerWithOrders): string | null {
  if (!customer.phone || customer.anonymized) return null;
  const digits = customer.phone.replace(/[^0-9]/g, "");
  if (!digits) return null;
  const latestOrder = customer.orders[0];
  const msg = latestOrder
    ? `Ciao ${customer.fullName}, siamo il team STORE 101! Ti aggiorniamo sul tuo ordine ${latestOrder.orderNumber}${latestOrder.trackingCode ? ` (tracking ${latestOrder.trackingCode})` : ""}.`
    : `Ciao ${customer.fullName}, siamo il team STORE 101. Possiamo aiutarti per i tuoi pneumatici ${customer.tireSize || ""}?`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(msg)}`;
}

export function CrmManager() {
  const [customers, setCustomers] = useState<CustomerWithOrders[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState<CustomerWithOrders | null>(null);
  const [vehicleModel, setVehicleModel] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [tireSize, setTireSize] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [anonymizing, setAnonymizing] = useState(false);
  const [confirmForget, setConfirmForget] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadCustomers = useCallback(
    async (auditFirstLoad = false) => {
      setLoading(true);
      try {
        const qs = new URLSearchParams();
        if (search.trim()) qs.set("q", search.trim());
        if (auditFirstLoad) qs.set("audit", "1");
        const res = await fetch(`/api/admin/crm?${qs.toString()}`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const json = (await res.json()) as { customers?: CustomerWithOrders[] };
        setCustomers(json.customers ?? []);
      } finally {
        setLoading(false);
      }
    },
    [search]
  );

  useEffect(() => {
    void loadCustomers(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadCustomers(false);
    }, 200);
    return () => window.clearTimeout(timer);
  }, [search, loadCustomers]);

  const openCustomer = (c: CustomerWithOrders) => {
    setSelected(c);
    setVehicleModel(c.vehicleModel);
    setLicensePlate(c.licensePlate);
    setTireSize(c.tireSize);
    setInternalNotes(c.internalNotes);
    setConfirmForget(false);
    setFeedback(null);
  };

  const handleSaveNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/crm", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: selected.id,
          vehicleModel,
          licensePlate,
          tireSize,
          internalNotes,
        }),
      });
      const json = (await res.json()) as { customer?: CrmCustomer };
      if (res.ok && json.customer) {
        setSelected({ ...selected, ...json.customer });
        setFeedback("Scheda cliente aggiornata.");
        await loadCustomers(false);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleAnonymizeGdpr = async () => {
    if (!selected) return;
    setAnonymizing(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/crm/${selected.id}/anonymize`, {
        method: "POST",
      });
      const json = (await res.json()) as {
        customer?: CrmCustomer;
        message?: string;
      };
      if (res.ok && json.customer) {
        setSelected({ ...selected, ...json.customer });
        setConfirmForget(false);
        setFeedback(
          json.message ?? "Cliente anonimizzato ai sensi dell'Art. 17 GDPR."
        );
        await loadCustomers(false);
      }
    } finally {
      setAnonymizing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-card lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-[#0F172A]">
            CRM Clienti &amp; Conformità GDPR
          </h1>
          <p className="mt-1 text-xs text-[#475569]">
            Anagrafica clienti, targa/misura gomme, WhatsApp 1-clic, storico LTV,
            export GDPR (JSON/CSV) e Diritto all&apos;Oblio (Art. 17).
          </p>
        </div>

        <div className="relative w-full lg:w-80">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#475569]" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cerca nome, email, targa o misura..."
            className="min-h-[44px] w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] pl-10 pr-3 text-sm text-[#0F172A] focus:border-[#0052FF] focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      {/* Customer Table / Mobile Cards */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-white shadow-card">
        {loading ? (
          <div className="h-52 animate-pulse rounded-2xl bg-slate-50" />
        ) : customers.length === 0 ? (
          <p className="p-10 text-center text-sm font-semibold text-[#475569]">
            Nessun cliente registrato nel CRM. I clienti appariranno
            automaticamente al primo ordine completato su Stripe.
          </p>
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[11px] font-bold uppercase tracking-wider text-[#475569]">
                    <th className="px-5 py-3.5">Cliente</th>
                    <th className="px-4 py-3.5">Veicolo / Targa / Misura</th>
                    <th className="px-4 py-3.5">Ordini</th>
                    <th className="px-4 py-3.5">Valore LTV</th>
                    <th className="px-4 py-3.5">Consenso Privacy</th>
                    <th className="px-5 py-3.5 text-right">Azioni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] tabular-nums">
                  {customers.map((c) => {
                    const waLink = buildWhatsAppCustomerLink(c);
                    return (
                      <tr key={c.id} className="hover:bg-[#F8FAFC]/70">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-[#0F172A]">
                              {c.fullName}
                            </p>
                            {c.anonymized ? (
                              <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                                Art. 17 Anonimizzato
                              </span>
                            ) : null}
                          </div>
                          <p className="text-[11px] text-[#475569]">
                            {c.email}
                            {c.phone ? ` • ${c.phone}` : ""}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-semibold text-[#0F172A]">
                            {c.vehicleModel}
                          </p>
                          <p className="font-mono text-[11px] text-[#475569]">
                            {c.licensePlate ? `Targa ${c.licensePlate} • ` : ""}
                            {c.tireSize || "Misura n/d"}
                          </p>
                        </td>
                        <td className="px-4 py-4 font-bold text-[#0F172A]">
                          {c.ordersCount}
                        </td>
                        <td className="px-4 py-4 font-extrabold text-[#0052FF]">
                          {formatEur(c.lifetimeValueEur)}
                        </td>
                        <td className="px-4 py-4 text-[11px] text-[#475569]">
                          <span className="inline-flex items-center gap-1 text-[#065F46]">
                            <UserCheck className="h-3.5 w-3.5 text-[#10B981]" />
                            {new Date(c.privacyConsentAt).toLocaleDateString(
                              "it-IT"
                            )}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            {waLink ? (
                              <a
                                href={waLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`WhatsApp ${c.fullName}`}
                                className="inline-flex min-h-[40px] items-center gap-1 rounded-xl bg-[#D1FAE5] px-3 text-xs font-bold text-[#065F46] hover:bg-[#10B981] hover:text-white"
                              >
                                <MessageCircle className="h-3.5 w-3.5" />
                                WA
                              </a>
                            ) : null}
                            <button
                              type="button"
                              onClick={() => openCustomer(c)}
                              className="min-h-[40px] rounded-xl bg-[#0F172A] px-3.5 text-xs font-bold text-white hover:bg-[#0052FF]"
                            >
                              Scheda &amp; GDPR
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="divide-y divide-[#E2E8F0] lg:hidden">
              {customers.map((c) => {
                const waLink = buildWhatsAppCustomerLink(c);
                return (
                  <div key={c.id} className="space-y-2.5 p-4 text-xs tabular-nums">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-[#0F172A]">{c.fullName}</p>
                        <p className="text-[11px] text-[#475569]">{c.email}</p>
                      </div>
                      <p className="font-display text-base font-extrabold text-[#0052FF]">
                        {formatEur(c.lifetimeValueEur)}
                      </p>
                    </div>
                    <p className="font-mono text-[11px] text-[#475569]">
                      {c.vehicleModel} &bull; {c.licensePlate || "—"} &bull;{" "}
                      {c.tireSize || "—"}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {waLink ? (
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-[#10B981] font-bold text-white"
                        >
                          <MessageCircle className="h-4 w-4" />
                          WhatsApp
                        </a>
                      ) : (
                        <span className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-slate-100 font-bold text-slate-400">
                          Anonimizzato
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => openCustomer(c)}
                        className="min-h-[44px] rounded-xl bg-[#0F172A] font-bold text-white"
                      >
                        Scheda &amp; GDPR
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Customer Detail + GDPR Drawer */}
      <Dialog.Root
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-[#0F172A]/60 backdrop-blur-sm" />
          <Dialog.Content className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col bg-white shadow-2xl focus:outline-none">
            {selected ? (
              <>
                <div className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-4">
                  <div>
                    <Dialog.Title className="font-display text-lg font-extrabold text-[#0F172A]">
                      {selected.fullName}
                    </Dialog.Title>
                    <Dialog.Description className="text-xs text-[#475569]">
                      LTV: {formatEur(selected.lifetimeValueEur)} &bull;{" "}
                      {selected.ordersCount} ordini
                    </Dialog.Description>
                  </div>
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      aria-label="Chiudi scheda cliente"
                      className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-[#475569] hover:bg-slate-100"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </Dialog.Close>
                </div>

                <div className="flex-1 space-y-5 overflow-y-auto p-5 text-xs">
                  {feedback ? (
                    <p className="flex items-start gap-2 rounded-xl bg-[#D1FAE5] p-3 font-bold text-[#065F46]">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                      {feedback}
                    </p>
                  ) : null}

                  {/* 1-Click WhatsApp */}
                  {buildWhatsAppCustomerLink(selected) ? (
                    <a
                      href={buildWhatsAppCustomerLink(selected) ?? "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-[#10B981] px-4 text-xs font-extrabold uppercase tracking-wide text-white hover:bg-[#059669]"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Contatta su WhatsApp ({selected.phone})
                    </a>
                  ) : null}

                  {/* Editable Vehicle & Notes */}
                  <form
                    onSubmit={handleSaveNotes}
                    className="space-y-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4"
                  >
                    <p className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[#0F172A]">
                      <Car className="h-4 w-4 text-[#0052FF]" />
                      Dati Veicolo &amp; Note Interne
                    </p>

                    <div>
                      <label className="block text-[11px] font-bold text-[#475569]">
                        Modello Veicolo
                      </label>
                      <input
                        type="text"
                        disabled={selected.anonymized}
                        value={vehicleModel}
                        onChange={(e) => setVehicleModel(e.target.value)}
                        className="mt-1 min-h-[44px] w-full rounded-xl border border-[#E2E8F0] bg-white px-3 text-sm font-medium text-[#0F172A] disabled:bg-slate-100"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-[#475569]">
                          Targa
                        </label>
                        <input
                          type="text"
                          disabled={selected.anonymized}
                          value={licensePlate}
                          onChange={(e) => setLicensePlate(e.target.value)}
                          className="mt-1 min-h-[44px] w-full rounded-xl border border-[#E2E8F0] bg-white px-3 font-mono text-sm font-bold uppercase text-[#0F172A] disabled:bg-slate-100"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#475569]">
                          Misura Pneumatici
                        </label>
                        <input
                          type="text"
                          disabled={selected.anonymized}
                          value={tireSize}
                          onChange={(e) => setTireSize(e.target.value)}
                          className="mt-1 min-h-[44px] w-full rounded-xl border border-[#E2E8F0] bg-white px-3 font-mono text-sm font-bold text-[#0F172A] disabled:bg-slate-100"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#475569]">
                        Note interne proprietario
                      </label>
                      <textarea
                        rows={3}
                        disabled={selected.anonymized}
                        value={internalNotes}
                        onChange={(e) => setInternalNotes(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-[#E2E8F0] bg-white p-3 text-sm text-[#0F172A] disabled:bg-slate-100"
                      />
                    </div>

                    {!selected.anonymized ? (
                      <button
                        type="submit"
                        disabled={saving}
                        className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[#0052FF] text-xs font-extrabold uppercase text-white hover:bg-[#003ECC] disabled:opacity-60"
                      >
                        {saving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Salva Scheda Cliente"
                        )}
                      </button>
                    ) : null}
                  </form>

                  {/* Storico Ordini Cliente */}
                  <div className="rounded-xl border border-[#E2E8F0] p-4">
                    <p className="font-bold uppercase tracking-wider text-[#475569]">
                      Storico Ordini ({selected.orders.length})
                    </p>
                    <ul className="mt-2 divide-y divide-[#E2E8F0] tabular-nums">
                      {selected.orders.map((ord) => (
                        <li
                          key={ord.id}
                          className="flex items-center justify-between py-2.5"
                        >
                          <div>
                            <p className="font-mono font-bold text-[#0F172A]">
                              {ord.orderNumber}
                            </p>
                            <p className="text-[11px] text-[#475569]">
                              {new Date(ord.createdAt).toLocaleDateString(
                                "it-IT"
                              )}{" "}
                              &bull; {ord.totalUnits} pz
                            </p>
                          </div>
                          <span className="font-extrabold text-[#0F172A]">
                            {formatEur(ord.totalEur)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* GDPR Panel: Consent Timestamp + Export + Art. 17 Oblio */}
                  <div className="space-y-3 rounded-xl border border-[#0052FF]/25 bg-[#F8FAFC] p-4">
                    <p className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[#0F172A]">
                      <ShieldAlert className="h-4 w-4 text-[#0052FF]" />
                      Diritti GDPR &amp; Tracciabilità Consenso
                    </p>
                    <p className="text-[11px] text-[#475569]">
                      Accettazione Privacy Policy al checkout:{" "}
                      <strong className="text-[#0F172A]">
                        {new Date(selected.privacyConsentAt).toLocaleString(
                          "it-IT"
                        )}
                      </strong>
                    </p>

                    <div className="grid grid-cols-2 gap-2">
                      <a
                        href={`/api/admin/crm/${selected.id}/export?format=json`}
                        className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white px-3 text-xs font-bold text-[#0F172A] hover:border-[#0052FF] hover:text-[#0052FF]"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Esporta JSON
                      </a>
                      <a
                        href={`/api/admin/crm/${selected.id}/export?format=csv`}
                        className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white px-3 text-xs font-bold text-[#0F172A] hover:border-[#0052FF] hover:text-[#0052FF]"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Esporta CSV
                      </a>
                    </div>

                    {!selected.anonymized ? (
                      confirmForget ? (
                        <div className="space-y-2 rounded-xl border border-red-300 bg-[#FEE2E2] p-3 text-[#991B1B]">
                          <p className="flex items-start gap-1.5 font-bold">
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                            Confermi l&apos;anonimizzazione Art. 17 GDPR? Nome,
                            email, telefono, targa e note verranno rimossi
                            definitivamente; gli importi fiscali degli ordini
                            resteranno conservati per 10 anni di legge.
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setConfirmForget(false)}
                              className="min-h-[40px] rounded-lg bg-white font-bold text-[#0F172A]"
                            >
                              Annulla
                            </button>
                            <button
                              type="button"
                              disabled={anonymizing}
                              onClick={handleAnonymizeGdpr}
                              className="flex min-h-[40px] items-center justify-center gap-1 rounded-lg bg-[#EF4444] font-bold text-white"
                            >
                              {anonymizing ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                "Conferma Oblio"
                              )}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmForget(true)}
                          className="flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-xl border border-red-300 bg-[#FEE2E2]/60 px-3 text-xs font-bold text-[#B91C1C] hover:bg-[#EF4444] hover:text-white"
                        >
                          <Trash2 className="h-4 w-4" />
                          Anonimizza / Cancella Cliente (Art. 17 GDPR)
                        </button>
                      )
                    ) : (
                      <p className="rounded-lg bg-slate-200 p-2.5 font-bold text-slate-700">
                        Cliente anonimizzato il{" "}
                        {selected.anonymizedAt
                          ? new Date(selected.anonymizedAt).toLocaleString(
                              "it-IT"
                            )
                          : "—"}
                        .
                      </p>
                    )}
                  </div>
                </div>
              </>
            ) : null}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
