"use client";

import React from "react";
import Link from "next/link";
import { Cookie, Lock, Mail, MapPin, Phone } from "lucide-react";
import { useConsent } from "@/context/ConsentContext";

const PAYMENT_BADGES = [
  "VISA",
  "Mastercard",
  "AMEX",
  "Apple Pay",
  "Google Pay",
  "Klarna",
];

export function Footer() {
  const { openPreferences } = useConsent();

  return (
    <footer className="border-t border-[#E2E8F0] bg-[#0F172A] text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand & Dati Societari */}
          <div className="space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 font-display text-2xl font-extrabold tracking-tight"
            >
              <span className="text-white">STORE</span>
              <span className="rounded-md bg-[#0052FF] px-2 py-0.5 text-white">
                101
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400">
              E-commerce italiano specializzato in pneumatici premium auto, SUV e
              veicoli commerciali con checkout certificato Stripe e rete di
              montaggio nazionale.
            </p>
            <address className="space-y-2 not-italic text-xs text-slate-400">
              <p className="font-semibold text-slate-200">[RAGIONE_SOCIALE]</p>
              <p className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#0052FF]" />
                <span>[INDIRIZZO_SEDE]</span>
              </p>
              <p>P.IVA [PARTITA_IVA]</p>
            </address>
          </div>

          {/* Categorie */}
          <div>
            <h3 className="font-display text-sm font-extrabold uppercase tracking-wider text-white">
              Catalogo Pneumatici
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/#catalogo" className="hover:text-white">
                  Pneumatici Estivi
                </Link>
              </li>
              <li>
                <Link href="/#catalogo" className="hover:text-white">
                  Pneumatici Invernali 3PMSF
                </Link>
              </li>
              <li>
                <Link href="/#catalogo" className="hover:text-white">
                  Pneumatici 4 Stagioni
                </Link>
              </li>
              <li>
                <Link href="/#catalogo" className="hover:text-white">
                  SUV, Crossover &amp; Furgo
                </Link>
              </li>
              <li>
                <Link href="/#catalogo" className="hover:text-white">
                  Accessori &amp; Manometri TPMS
                </Link>
              </li>
            </ul>
          </div>

          {/* Assistenza & Contatti */}
          <div>
            <h3 className="font-display text-sm font-extrabold uppercase tracking-wider text-white">
              Assistenza Clienti
            </h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-[#FF5A1F]" aria-hidden="true" />
                <span>[EMAIL_ASSISTENZA]</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-[#10B981]" aria-hidden="true" />
                <span>WhatsApp &amp; Tel: [TELEFONO_WHATSAPP]</span>
              </li>
              <li className="text-xs leading-relaxed text-slate-400">
                Lun–Ven 08:30–19:00 &bull; Sab 09:00–13:00
                <br />
                Supporto tecnico omologazione libretto e officine partner.
              </li>
            </ul>
          </div>

          {/* Area Legale & GDPR */}
          <div>
            <h3 className="font-display text-sm font-extrabold uppercase tracking-wider text-white">
              Informazioni Legali &amp; GDPR
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/privacy-policy" className="hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/cookie-policy" className="hover:text-white">
                  Cookie Policy (incl. Stripe)
                </Link>
              </li>
              <li>
                <Link href="/termini-e-condizioni" className="hover:text-white">
                  Termini di Vendita, Recesso 14gg &amp; PFU
                </Link>
              </li>
              <li className="pt-1">
                <button
                  type="button"
                  onClick={openPreferences}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-3.5 text-xs font-bold text-white transition-colors hover:border-[#0052FF] hover:bg-[#0052FF]/20"
                >
                  <Cookie className="h-4 w-4 text-[#FF5A1F]" aria-hidden="true" />
                  Gestisci preferenze cookie
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Payment Circuit Badges via Stripe */}
        <div className="mt-12 flex flex-col items-start justify-between gap-5 border-t border-white/10 pt-8 md:flex-row md:items-center">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400">
              <Lock className="h-3.5 w-3.5 text-[#10B981]" aria-hidden="true" />
              Pagamenti protetti da <strong className="text-white">Stripe</strong>:
            </span>
            {PAYMENT_BADGES.map((badge) => (
              <span
                key={badge}
                className="rounded-md border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-bold tracking-wide text-slate-200"
              >
                {badge}
              </span>
            ))}
          </div>

          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} STORE 101 &bull; Tutti i diritti
            riservati. Prezzi IVA inclusa.
          </p>
        </div>
      </div>
    </footer>
  );
}
