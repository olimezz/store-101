"use client";

import React, { useEffect, useState } from "react";
import {
  CheckCircle2,
  Database,
  Lock,
  ShieldCheck,
  Ship,
  Warehouse,
} from "lucide-react";
import type { AdminAuditEntry } from "@/lib/admin-types";

export function SettingsAuditView() {
  const [logs, setLogs] = useState<AdminAuditEntry[]>([]);
  const [stripeCount, setStripeCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/admin/audit", { cache: "no-store" });
        if (!res.ok) return;
        const json = (await res.json()) as {
          logs?: AdminAuditEntry[];
          processedStripeEventsCount?: number;
        };
        setLogs(json.logs ?? []);
        setStripeCount(json.processedStripeEventsCount ?? 0);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-card">
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-[#0F172A]">
          Impostazioni Logistica, Sicurezza &amp; Audit Log
        </h1>
        <p className="mt-1 text-xs text-[#475569]">
          Riepilogo regole dual-source Italia/Cina, protezioni Security by
          Design, schema Supabase RLS e registro accessi amministrativi.
        </p>
      </div>

      {/* Rules & Security Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-card text-xs space-y-2">
          <div className="flex items-center gap-2 font-display text-sm font-extrabold text-[#0F172A]">
            <Warehouse className="h-4 w-4 text-[#10B981]" />
            Logistica Magazzino Italia
          </div>
          <p className="text-[#475569] leading-relaxed">
            Quando <code>stock_italia &gt; 0</code>, lo storefront mostra
            automaticamente{" "}
            <strong className="text-[#065F46]">
              Disponibile in Italia — Consegna in 4-7 giorni lavorativi
            </strong>
            .
          </p>
        </div>

        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-card text-xs space-y-2">
          <div className="flex items-center gap-2 font-display text-sm font-extrabold text-[#0F172A]">
            <Ship className="h-4 w-4 text-[#F59E0B]" />
            Import Cina &amp; Split Order
          </div>
          <p className="text-[#475569] leading-relaxed">
            Se <code>stock_italia == 0</code> e <code>stock_cina &gt; 0</code>:
            consegna <strong className="text-[#92400E]">5-15 gg lav.</strong>.
            Su ordini misti il cliente sceglie tra spedizioni separate o unica
            consolidata al checkout.
          </p>
        </div>

        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-card text-xs space-y-2">
          <div className="flex items-center gap-2 font-display text-sm font-extrabold text-[#0F172A]">
            <Database className="h-4 w-4 text-[#0052FF]" />
            PostgreSQL / Supabase RLS
          </div>
          <p className="text-[#475569] leading-relaxed">
            Lo schema SQL con Row Level Security (<code>supabase/schema.sql</code>)
            è pronto nel repository. Eventi webhook Stripe idempotenti
            elaborati: <strong>{stripeCount}</strong>.
          </p>
        </div>
      </div>

      {/* Security Checklist */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-card">
        <h2 className="flex items-center gap-2 font-display text-base font-extrabold text-[#0F172A]">
          <ShieldCheck className="h-5 w-5 text-[#10B981]" />
          Controlli Security by Design &amp; GDPR Attivi
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-3 text-xs sm:grid-cols-2 lg:grid-cols-3">
          {[
            "Autenticazione RBAC ADMIN lato server su ogni pagina e /api/admin/*",
            "Rate limiting anti brute-force su /api/admin/auth/login",
            "Protezione CSV Formula Injection + limite 10MB + MIME + Zod",
            "Analytics cookieless con hash anonimizzato giornaliero (zero PII)",
            "Webhook Stripe firmato (constructEvent) con idempotenza scarico stock",
            "Export GDPR (JSON/CSV) e Diritto all'Oblio Art. 17 con storico fiscale 10 anni",
          ].map((item) => (
            <div
              key={item}
              className="flex items-start gap-2 rounded-xl bg-[#F8FAFC] p-3 ring-1 ring-[#E2E8F0]"
            >
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#10B981]" />
              <span className="font-medium text-[#0F172A]">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Admin Access & Action Audit Log */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-card">
        <h2 className="flex items-center gap-2 font-display text-base font-extrabold text-[#0F172A]">
          <Lock className="h-4 w-4 text-[#0052FF]" />
          Registro Accessi Amministrativi &amp; Azioni GDPR (Audit Log)
        </h2>
        <p className="mt-1 text-xs text-[#475569]">
          Traccia chi accede al gestionale, consulta o esporta il CRM, esegue
          anonimizzazioni Art. 17 o applica/ripristina file CSV.
        </p>

        {loading ? (
          <div className="mt-4 h-36 animate-pulse rounded-xl bg-slate-50" />
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-[11px] font-bold uppercase tracking-wider text-[#475569]">
                  <th className="py-2.5 pr-4">Data / Ora</th>
                  <th className="py-2.5 pr-4">Amministratore</th>
                  <th className="py-2.5 pr-4">Azione</th>
                  <th className="py-2.5 pr-4">Target</th>
                  <th className="py-2.5">Dettagli</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] tabular-nums">
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className="whitespace-nowrap py-3 pr-4 text-[#475569]">
                      {new Date(log.createdAt).toLocaleString("it-IT")}
                    </td>
                    <td className="py-3 pr-4 font-bold text-[#0F172A]">
                      {log.actorEmail}
                    </td>
                    <td className="py-3 pr-4">
                      <span className="rounded-md bg-[#0F172A] px-2 py-0.5 font-mono text-[10px] font-bold text-white">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 pr-4 font-mono text-[#0052FF]">
                      {log.target}
                    </td>
                    <td className="py-3 text-[#475569]">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
