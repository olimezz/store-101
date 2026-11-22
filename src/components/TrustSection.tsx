"use client";

import React from "react";
import { motion } from "framer-motion";
import { CalendarCheck2, RotateCcw, ShieldCheck, Truck } from "lucide-react";

const TRUST_ITEMS = [
  {
    title: "Pagamenti Sicuri SSL & Stripe",
    description:
      "Transazioni crittografate 256-bit con Carta, Apple Pay, Google Pay e Klarna protette da antifrode Stripe.",
    icon: ShieldCheck,
    accentBg: "bg-[#0052FF]/10",
    accentText: "text-[#0052FF]",
    accentBorder: "border-t-[#0052FF]",
  },
  {
    title: "Spedizione Express 24/48h",
    description:
      "Consegna tracciata gratuita oltre €150 a casa tua o direttamente presso oltre 1.200 officine partner.",
    icon: Truck,
    accentBg: "bg-[#FF5A1F]/10",
    accentText: "text-[#FF5A1F]",
    accentBorder: "border-t-[#FF5A1F]",
  },
  {
    title: "DOT Recente Garantito (< 12 mesi)",
    description:
      "Solo pneumatici di fabbricazione recente conservati in magazzini climatizzati secondo standard costruttori.",
    icon: CalendarCheck2,
    accentBg: "bg-[#10B981]/10",
    accentText: "text-[#10B981]",
    accentBorder: "border-t-[#10B981]",
  },
  {
    title: "Reso Facile 14 Giorni",
    description:
      "Diritto di recesso trasparente con ritiro a domicilio su gomme non montate e rimborso rapido su Stripe.",
    icon: RotateCcw,
    accentBg: "bg-[#0EA5E9]/10",
    accentText: "text-[#0EA5E9]",
    accentBorder: "border-t-[#0EA5E9]",
  },
];

export function TrustSection() {
  return (
    <section
      aria-label="Garanzie e vantaggi STORE 101"
      className="border-y border-[#E2E8F0] bg-white py-14 sm:py-16"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST_ITEMS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.35, delay: idx * 0.06 }}
                className={`rounded-2xl border border-[#E2E8F0] border-t-4 ${item.accentBorder} bg-[#F8FAFC] p-6 transition-shadow hover:shadow-card-hover`}
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.accentBg} ${item.accentText}`}
                >
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="mt-4 font-display text-base font-extrabold text-[#0F172A]">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#475569]">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
