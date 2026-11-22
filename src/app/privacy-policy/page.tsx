import React from "react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Informativa sul trattamento dei dati personali ai sensi dell'art. 13 del Regolamento (UE) 2016/679 (GDPR) per STORE 101.",
};

export default function PrivacyPolicyPage() {
  return (
    <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-card sm:p-10">
        <p className="text-xs font-extrabold uppercase tracking-widest text-[#0052FF]">
          Regolamento (UE) 2016/679 (GDPR)
        </p>
        <h1
          className="mt-2 font-display font-extrabold tracking-tight text-[#0F172A]"
          style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)" }}
        >
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-[#475569]">
          Ultimo aggiornamento: 2026 &bull; Titolare del Trattamento:{" "}
          <strong className="text-[#0F172A]">[RAGIONE_SOCIALE]</strong>
        </p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-[#475569]">
          <section>
            <h2 className="font-display text-lg font-bold text-[#0F172A]">
              1. Titolare del Trattamento
            </h2>
            <p className="mt-2">
              Il Titolare del trattamento dei dati personali raccolti tramite
              l&apos;e-commerce <strong>STORE 101</strong> è{" "}
              <strong>[RAGIONE_SOCIALE]</strong>, con sede legale in{" "}
              <strong>[INDIRIZZO_SEDE]</strong>, P.IVA{" "}
              <strong>[PARTITA_IVA]</strong>, contattabile all&apos;indirizzo
              email <strong>[EMAIL_ASSISTENZA]</strong> o al recapito{" "}
              <strong>[TELEFONO_WHATSAPP]</strong>.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-[#0F172A]">
              2. Tipologie di Dati Trattati e Finalità
            </h2>
            <ul className="mt-2 list-disc space-y-1.5 pl-5">
              <li>
                <strong>Evasione ordini e spedizioni (Art. 6.1.b GDPR):</strong>{" "}
                nome, cognome, indirizzo di spedizione o officina partner
                prescelta, email, numero di telefono e dati di fatturazione.
              </li>
              <li>
                <strong>Pagamenti elettronici tramite Stripe:</strong> i dati
                delle carte di pagamento sono elaborati direttamente da{" "}
                <em>Stripe Payments Europe, Limited</em> secondo gli standard
                PCI-DSS Level 1; STORE 101 non memorizza mai numeri di carta sui
                propri server.
              </li>
              <li>
                <strong>Adempimenti fiscali e PFU (Art. 6.1.c GDPR):</strong>{" "}
                conservazione contabile e gestione del contributo ambientale PFU
                obbligatorio per legge.
              </li>
              <li>
                <strong>Newsletter e promozioni (Art. 6.1.a GDPR):</strong> solo
                previo consenso esplicito, libero e revocabile in qualsiasi
                momento.
              </li>
              <li>
                <strong>Assistenza tecnica misure (Art. 6.1.b GDPR):</strong>{" "}
                dati forniti volontariamente per verificare la compatibilità
                degli pneumatici con il veicolo.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-[#0F172A]">
              3. Periodo di Conservazione
            </h2>
            <p className="mt-2">
              I dati relativi agli ordini e alla fatturazione sono conservati
              per 10 anni in conformità agli obblighi civilistici e fiscali
              italiani. I dati per la newsletter sono conservati fino alla
              revoca del consenso da parte dell&apos;interessato.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-[#0F172A]">
              4. Diritti dell&apos;Interessato
            </h2>
            <p className="mt-2">
              Ai sensi degli artt. 15–22 del GDPR hai diritto di accedere ai tuoi
              dati, chiederne la rettifica, la cancellazione, la limitazione del
              trattamento, la portabilità e di opporti al trattamento o proporre
              reclamo al Garante per la protezione dei dati personali
              (www.garanteprivacy.it). Per esercitare i tuoi diritti scrivi a{" "}
              <strong>[EMAIL_ASSISTENZA]</strong>.
            </p>
          </section>
        </div>

        <div className="mt-8 flex flex-wrap gap-3 border-t border-[#E2E8F0] pt-6">
          <Link
            href="/cookie-policy"
            className="inline-flex min-h-[44px] items-center rounded-xl border border-[#E2E8F0] px-4 text-sm font-bold text-[#0F172A] hover:bg-slate-50"
          >
            Consulta la Cookie Policy
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
