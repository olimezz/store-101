import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { OpenCookiePrefsButton } from "@/components/OpenCookiePrefsButton";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description:
    "Informativa estesa sui cookie di STORE 101, inclusi i cookie tecnici di sicurezza antifrode Stripe e la gestione del consenso preventivo.",
};

export default function CookiePolicyPage() {
  return (
    <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-card sm:p-10">
        <p className="text-xs font-extrabold uppercase tracking-widest text-[#0052FF]">
          Linee Guida Garante Privacy • Direttiva ePrivacy
        </p>
        <h1
          className="mt-2 font-display font-extrabold tracking-tight text-[#0F172A]"
          style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)" }}
        >
          Cookie Policy
        </h1>
        <p className="mt-2 text-sm text-[#475569]">
          STORE 101 adotta il blocco tecnico preventivo di tutti gli script non
          essenziali finché l&apos;utente non esprime un consenso libero e
          informato.
        </p>

        <div className="mt-6">
          <OpenCookiePrefsButton />
        </div>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-[#475569]">
          <section>
            <h2 className="font-display text-lg font-bold text-[#0F172A]">
              1. Cookie Tecnici Strettamente Necessari (Sempre Attivi)
            </h2>
            <p className="mt-2">
              Sono indispensabili per il corretto funzionamento del sito e non
              richiedono il consenso preventivo dell&apos;utente:
            </p>
            <ul className="mt-2 list-disc space-y-1.5 pl-5">
              <li>
                <strong>Storage Carrello (<code>store101_cart_v1</code>):</strong>{" "}
                mantiene i pneumatici selezionati e i codici sconto tra le
                pagine.
              </li>
              <li>
                <strong>Registro Consenso (<code>store101_cookie_consent_v1</code>):</strong>{" "}
                memorizza le preferenze espresse sul banner cookie.
              </li>
              <li>
                <strong>Cookie Tecnici Antifrode Stripe (<code>__stripe_mid</code>, <code>__stripe_sid</code>):</strong>{" "}
                utilizzati da Stripe esclusivamente durante il processo di
                checkout per prevenire frodi con carta, attacchi di card testing
                e garantire la conformità PSD2 / Strong Customer Authentication
                (3D Secure). Sono esenti da consenso preventivo in quanto
                strettamente necessari all&apos;erogazione del servizio di
                pagamento richiesto dall&apos;utente.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-[#0F172A]">
              2. Cookie Analitici (Previo Consenso)
            </h2>
            <p className="mt-2">
              Se attivati dall&apos;utente, consentono l&apos;utilizzo di{" "}
              <strong>Google Analytics 4</strong> con anonimizzazione IP per
              analizzare statistiche aggregate sulle ricerche misure e migliorare
              la disponibilità di magazzino. Rimangono completamente bloccati in
              assenza di consenso esplicito.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-[#0F172A]">
              3. Cookie di Marketing e Profilazione (Previo Consenso)
            </h2>
            <p className="mt-2">
              Se attivati dall&apos;utente, abilitano script di terze parti (es.{" "}
              <strong>Meta Pixel</strong> e widget di recensioni certificate) per
              mostrare promozioni stagionali pertinenti. In assenza di consenso
              nessuno script viene iniettato nel DOM.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-[#0F172A]">
              4. Revoca o Modifica del Consenso
            </h2>
            <p className="mt-2">
              Puoi modificare o revocare le tue scelte in qualsiasi momento
              cliccando su <strong>&ldquo;Gestisci preferenze cookie&rdquo;</strong>{" "}
              presente nel footer di ogni pagina o utilizzando il pulsante in
              alto.
            </p>
          </section>
        </div>

        <div className="mt-8 flex flex-wrap gap-3 border-t border-[#E2E8F0] pt-6">
          <Link
            href="/privacy-policy"
            className="inline-flex min-h-[44px] items-center rounded-xl border border-[#E2E8F0] px-4 text-sm font-bold text-[#0F172A] hover:bg-slate-50"
          >
            Privacy Policy
          </Link>
          <Link
            href="/"
            className="inline-flex min-h-[44px] items-center rounded-xl bg-[#0052FF] px-5 text-sm font-bold text-white hover:bg-[#003ECC]"
          >
            Torna a STORE 101
          </Link>
        </div>
      </div>
    </article>
  );
}
