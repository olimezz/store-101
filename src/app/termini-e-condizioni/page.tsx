import React from "react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Termini e Condizioni di Vendita",
  description:
    "Condizioni generali di vendita STORE 101: diritto di recesso 14 giorni, contributo ambientale PFU obbligatorio, spedizione 24/48h e garanzia legale.",
};

export default function TerminiCondizioniPage() {
  return (
    <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-card sm:p-10">
        <p className="text-xs font-extrabold uppercase tracking-widest text-[#0052FF]">
          Codice del Consumo (D.Lgs. 206/2005) • D.M. 182/2019
        </p>
        <h1
          className="mt-2 font-display font-extrabold tracking-tight text-[#0F172A]"
          style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)" }}
        >
          Termini e Condizioni di Vendita
        </h1>
        <p className="mt-2 text-sm text-[#475569]">
          Venditore: <strong className="text-[#0F172A]">[RAGIONE_SOCIALE]</strong>{" "}
          &bull; P.IVA [PARTITA_IVA] &bull; [INDIRIZZO_SEDE]
        </p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-[#475569]">
          <section>
            <h2 className="font-display text-lg font-bold text-[#0F172A]">
              1. Prezzi, IVA e Sconto Treno Completo
            </h2>
            <p className="mt-2">
              Tutti i prezzi esposti su STORE 101 sono espressi in Euro (€) e
              comprensivi di IVA al 22%. L&apos;acquisto di 4 o più pneumatici
              dello stesso modello attiva automaticamente uno sconto del 5%
              calcolato e verificato lato server prima della creazione della
              sessione di pagamento Stripe.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-[#0F172A]">
              2. Contributo Ambientale PFU (Obbligatorio per Legge)
            </h2>
            <p className="mt-2">
              In ottemperanza all&apos;art. 228 del D.Lgs. 152/2006 e al{" "}
              <strong>D.M. 182/2019</strong>, su ogni pneumatico nuovo venduto
              nel territorio italiano si applica il{" "}
              <strong>Contributo Ambientale PFU</strong> (Pneumatici Fuori Uso)
              pari a <strong>€3,50 IVA inclusa per singolo pneumatico</strong>,
              indicato in modo chiaro e separato nel carrello, nella sessione
              Stripe e in fattura. Gli accessori non pneumatici sono esenti da
              PFU.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-[#0F172A]">
              3. Pagamenti Sicuri tramite Stripe
            </h2>
            <p className="mt-2">
              I pagamenti avvengono attraverso la piattaforma certificata{" "}
              <strong>Stripe</strong> con supporto a Carta di Credito/Debito
              (Visa, Mastercard, American Express), Apple Pay, Google Pay e
              Klarna. La conferma definitiva dell&apos;ordine avviene al
              ricevimento del webhook crittograficamente firmato da Stripe.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-[#0F172A]">
              4. Spedizione 24/48h e Montaggio presso Officine Partner
            </h2>
            <p className="mt-2">
              La spedizione è gratuita per ordini di importo pari o superiore a{" "}
              <strong>€150,00</strong> (altrimenti €14,90). La consegna avviene
              in 24/48 ore lavorative tramite corriere espresso tracciato presso
              il domicilio del cliente oppure direttamente presso una delle
              oltre 1.200 officine partner convenzionate in Italia.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-[#0F172A]">
              5. Diritto di Recesso 14 Giorni
            </h2>
            <p className="mt-2">
              Ai sensi degli artt. 52 e seguenti del Codice del Consumo (D.Lgs.
              206/2005), il cliente consumatore ha diritto di recedere dal
              contratto di acquisto entro{" "}
              <strong>14 giorni solari</strong> dalla data di consegna senza
              dover fornire alcuna motivazione, purché gli pneumatici risultino{" "}
              <strong>integri, non montati su cerchio e non utilizzati</strong>.
              Per attivare il reso scrivi a <strong>[EMAIL_ASSISTENZA]</strong>{" "}
              indicando il riferimento ordine. Il rimborso completo viene
              emesso entro 14 giorni sullo stesso metodo di pagamento utilizzato
              su Stripe.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-[#0F172A]">
              6. Garanzia Legale di Conformità e DOT Recente
            </h2>
            <p className="mt-2">
              Tutti gli pneumatici venduti da STORE 101 sono coperti da{" "}
              <strong>Garanzia Legale di 24 mesi</strong> per difetti di
              conformità e provengono da lotti con{" "}
              <strong>DOT inferiore a 12 mesi</strong>.
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
            href="/cookie-policy"
            className="inline-flex min-h-[44px] items-center rounded-xl border border-[#E2E8F0] px-4 text-sm font-bold text-[#0F172A] hover:bg-slate-50"
          >
            Cookie Policy
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
