"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import * as Dialog from "@radix-ui/react-dialog";
import * as Switch from "@radix-ui/react-switch";
import { Cookie, ShieldCheck, X } from "lucide-react";
import { useConsent } from "@/context/ConsentContext";

export function CookieBanner() {
  const { showBanner, acceptAll, rejectAll, openPreferences } = useConsent();

  if (!showBanner) return null;

  return (
    <aside
      role="region"
      aria-label="Gestione consenso cookie"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-[#E2E8F0] bg-white/95 p-4 shadow-[0_-12px_40px_rgba(15,23,42,0.14)] backdrop-blur-md sm:p-6"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3.5 lg:max-w-2xl">
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0052FF]/10 text-[#0052FF]">
            <Cookie className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="space-y-1 text-sm text-[#475569]">
            <p className="font-display text-base font-bold text-[#0F172A]">
              La tua privacy su STORE 101
            </p>
            <p className="leading-relaxed">
              Utilizziamo cookie strettamente tecnici (inclusi quelli di sicurezza
              antifrode Stripe durante il pagamento) e, solo con il tuo consenso
              esplicito, cookie analitici e di marketing. Nessuno script di terze
              parti viene caricato prima della tua scelta. Consulta la nostra{" "}
              <Link
                href="/cookie-policy"
                className="font-semibold text-[#0052FF] underline underline-offset-2 hover:text-[#003ECC]"
              >
                Cookie Policy
              </Link>{" "}
              e{" "}
              <Link
                href="/privacy-policy"
                className="font-semibold text-[#0052FF] underline underline-offset-2 hover:text-[#003ECC]"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>

        {/* Tre pulsanti con pari gerarchia visiva e cromaticità equilibrata (Linee Guida Garante Privacy) */}
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 lg:shrink-0">
          <button
            type="button"
            onClick={rejectAll}
            className="min-h-[44px] rounded-xl border-2 border-[#0F172A] bg-white px-4 py-2.5 text-sm font-semibold text-[#0F172A] transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0052FF]"
          >
            Rifiuta tutti
          </button>
          <button
            type="button"
            onClick={openPreferences}
            className="min-h-[44px] rounded-xl border-2 border-[#0F172A] bg-white px-4 py-2.5 text-sm font-semibold text-[#0F172A] transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0052FF]"
          >
            Personalizza preferenze
          </button>
          <button
            type="button"
            onClick={acceptAll}
            className="min-h-[44px] rounded-xl border-2 border-[#0F172A] bg-[#0F172A] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0052FF]"
          >
            Accetta tutti
          </button>
        </div>
      </div>
    </aside>
  );
}

export function CookiePreferencesModal() {
  const {
    consent,
    preferencesOpen,
    closePreferences,
    acceptAll,
    rejectAll,
    savePreferences,
  } = useConsent();

  const [analytics, setAnalytics] = useState(consent.analytics);
  const [marketing, setMarketing] = useState(consent.marketing);

  useEffect(() => {
    if (preferencesOpen) {
      setAnalytics(consent.analytics);
      setMarketing(consent.marketing);
    }
  }, [preferencesOpen, consent.analytics, consent.marketing]);

  return (
    <Dialog.Root
      open={preferencesOpen}
      onOpenChange={(open) => {
        if (!open) closePreferences();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-[#0F172A]/60 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-2xl focus:outline-none">
          <div className="flex items-start justify-between gap-4 border-b border-[#E2E8F0] pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0052FF]/10 text-[#0052FF]">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <Dialog.Title className="font-display text-lg font-bold text-[#0F172A]">
                  Preferenze Cookie & Privacy
                </Dialog.Title>
                <Dialog.Description className="text-xs text-[#475569]">
                  Gestisci il consenso per ciascuna categoria ai sensi del GDPR
                </Dialog.Description>
              </div>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Chiudi pannello preferenze cookie"
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-[#475569] transition-colors hover:bg-slate-100 hover:text-[#0F172A]"
              >
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          <div className="mt-5 space-y-4">
            {/* Tecnici */}
            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-[#0F172A]">
                    Cookie Tecnici e Sicurezza Stripe
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-[#475569]">
                    Indispensabili per il carrello persistente, la memoria delle
                    preferenze di consenso e la protezione antifrode Stripe
                    durante il checkout (esenti da consenso preventivo).
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                  Sempre attivi
                </span>
              </div>
            </div>

            {/* Analitici */}
            <div className="rounded-xl border border-[#E2E8F0] bg-white p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-[#0F172A]">
                    Cookie Analitici (es. Google Analytics 4)
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-[#475569]">
                    Ci aiutano a comprendere in forma aggregata quali misure di
                    pneumatici vengono cercate di più per migliorare il
                    catalogo. Bloccati finché non acconsenti.
                  </p>
                </div>
                <Switch.Root
                  checked={analytics}
                  onCheckedChange={setAnalytics}
                  aria-label="Attiva cookie analitici"
                  className="relative h-7 w-12 shrink-0 cursor-pointer rounded-full bg-slate-300 transition-colors data-[state=checked]:bg-[#0052FF]"
                >
                  <Switch.Thumb className="block h-5 w-5 translate-x-1 rounded-full bg-white shadow transition-transform data-[state=checked]:translate-x-6" />
                </Switch.Root>
              </div>
            </div>

            {/* Marketing */}
            <div className="rounded-xl border border-[#E2E8F0] bg-white p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-[#0F172A]">
                    Cookie di Marketing & Recensioni Esterne (es. Meta Pixel)
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-[#475569]">
                    Utilizzati per offerte stagionali personalizzate e widget di
                    recensioni certificate di terze parti. Bloccati finché non
                    acconsenti.
                  </p>
                </div>
                <Switch.Root
                  checked={marketing}
                  onCheckedChange={setMarketing}
                  aria-label="Attiva cookie di marketing"
                  className="relative h-7 w-12 shrink-0 cursor-pointer rounded-full bg-slate-300 transition-colors data-[state=checked]:bg-[#0052FF]"
                >
                  <Switch.Thumb className="block h-5 w-5 translate-x-1 rounded-full bg-white shadow transition-transform data-[state=checked]:translate-x-6" />
                </Switch.Root>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-2.5 border-t border-[#E2E8F0] pt-5 sm:grid-cols-3">
            <button
              type="button"
              onClick={rejectAll}
              className="min-h-[44px] rounded-xl border border-[#E2E8F0] bg-white px-4 py-2.5 text-sm font-semibold text-[#0F172A] transition-colors hover:bg-slate-100"
            >
              Rifiuta tutti
            </button>
            <button
              type="button"
              onClick={() => savePreferences({ analytics, marketing })}
              className="min-h-[44px] rounded-xl bg-[#0052FF] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#003ECC]"
            >
              Salva scelte
            </button>
            <button
              type="button"
              onClick={acceptAll}
              className="min-h-[44px] rounded-xl bg-[#0F172A] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
            >
              Accetta tutti
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/**
 * Blocco tecnico reale degli script non essenziali:
 * GA4 e Meta Pixel vengono montati nel DOM ESCLUSIVAMENTE dopo consenso esplicito.
 */
export function ThirdPartyScripts() {
  const { consent, hydrated } = useConsent();
  const ga4Id = process.env.NEXT_PUBLIC_GA4_ID;
  const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;

  if (!hydrated) return null;

  return (
    <>
      {consent.analytics && ga4Id ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga4Id)}`}
            strategy="afterInteractive"
          />
          <Script id="store101-ga4-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga4Id.replace(/[^A-Za-z0-9_-]/g, "")}',{anonymize_ip:true});`}
          </Script>
        </>
      ) : null}

      {consent.marketing && metaPixelId ? (
        <Script id="store101-meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${metaPixelId.replace(/[^0-9]/g, "")}');fbq('track','PageView');`}
        </Script>
      ) : null}
    </>
  );
}
