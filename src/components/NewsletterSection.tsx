"use client";

import React, { useState } from "react";
import Link from "next/link";
import * as Checkbox from "@radix-ui/react-checkbox";
import { Check, CheckCircle2, Gift, Loader2, Mail, Sparkles } from "lucide-react";
import { newsletterSchema } from "@/lib/validation";
import { useCart } from "@/context/CartContext";

export function NewsletterSection() {
  const { applyPromoCode, openCart } = useCart();
  const [email, setEmail] = useState("");
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [companyWebsite, setCompanyWebsite] = useState(""); // Honeypot anti-spam
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unlockedCode, setUnlockedCode] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = newsletterSchema.safeParse({
      email,
      acceptPrivacy,
      companyWebsite,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Controlla i dati inseriti.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = (await res.json()) as {
        error?: string;
        promoCode?: string;
      };
      if (!res.ok) {
        setError(data.error ?? "Errore durante l'iscrizione.");
        return;
      }
      setUnlockedCode(data.promoCode ?? "BENVENUTO15");
      setEmail("");
      setAcceptPrivacy(false);
    } catch {
      setError("Errore di connessione. Riprova tra qualche istante.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      aria-labelledby="newsletter-heading"
      className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8"
    >
      <div
        className="relative overflow-hidden rounded-3xl border border-white/10 p-7 text-white shadow-2xl sm:p-10 lg:p-14"
        style={{
          background:
            "linear-gradient(125deg, #0F172A 0%, #10255E 58%, #0052FF 100%)",
        }}
      >
        {/* Subtle luminous accent */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#FF5A1F]/25 blur-3xl"
        />

        <div className="relative grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FF5A1F] px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-white">
              <Gift className="h-3.5 w-3.5" aria-hidden="true" />
              Offerta Benvenuto
            </span>
            <h2
              id="newsletter-heading"
              className="mt-4 font-display font-extrabold uppercase leading-tight tracking-[-0.02em] text-white"
              style={{ fontSize: "clamp(1.65rem, 3vw, 2.4rem)" }}
            >
              €15 di sconto sul tuo primo treno di gomme
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-slate-200 sm:text-base">
              Iscriviti al Club STORE 101 per ricevere subito il coupon da €15,
              avvisi sul cambio stagionale e offerte riservate su Michelin,
              Pirelli, Bridgestone, Goodyear e Continental.
            </p>
          </div>

          <div className="lg:col-span-6">
            {unlockedCode ? (
              <div className="rounded-2xl border border-emerald-400/30 bg-white/10 p-6 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-7 w-7 shrink-0 text-[#10B981]" />
                  <div>
                    <p className="font-display text-lg font-extrabold text-white">
                      Iscrizione confermata!
                    </p>
                    <p className="text-xs text-slate-200">
                      Usa questo codice nel carrello (ordini da €150):
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="flex min-h-[48px] flex-1 items-center justify-center rounded-xl border border-dashed border-white/40 bg-[#0F172A]/60 px-4 font-mono text-lg font-extrabold tracking-widest text-[#FF5A1F]">
                    {unlockedCode}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      applyPromoCode(unlockedCode);
                      openCart();
                    }}
                    className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-[#FF5A1F] px-5 text-sm font-bold text-white transition-colors hover:bg-[#E0440C]"
                  >
                    <Sparkles className="h-4 w-4" aria-hidden="true" />
                    Applica al Carrello
                  </button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                noValidate
                className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-md sm:p-6"
              >
                {/* Honeypot anti-spam */}
                <div className="hidden" aria-hidden="true">
                  <label htmlFor="nl-company-website">Sito web</label>
                  <input
                    id="nl-company-website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={companyWebsite}
                    onChange={(e) => setCompanyWebsite(e.target.value)}
                  />
                </div>

                <label
                  htmlFor="newsletter-email"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-200"
                >
                  La tua email
                </label>
                <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                  <div className="relative flex-1">
                    <Mail
                      className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                      aria-hidden="true"
                    />
                    <input
                      id="newsletter-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nome@esempio.it"
                      className="min-h-[48px] w-full rounded-xl border border-white/20 bg-white pl-10 pr-4 text-sm font-medium text-[#0F172A] placeholder:text-slate-400 focus:border-[#FF5A1F] focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]/40"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex min-h-[48px] shrink-0 items-center justify-center gap-2 rounded-xl bg-[#FF5A1F] px-6 text-sm font-extrabold uppercase tracking-wide text-white shadow-lg transition-colors hover:bg-[#E0440C] disabled:opacity-60"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Invio...
                      </>
                    ) : (
                      "Ottieni €15"
                    )}
                  </button>
                </div>

                {/* Checkbox GDPR non pre-spuntata */}
                <div className="mt-4 flex items-start gap-3">
                  <Checkbox.Root
                    id="newsletter-privacy"
                    checked={acceptPrivacy}
                    onCheckedChange={(checked) =>
                      setAcceptPrivacy(checked === true)
                    }
                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border border-white/50 bg-white/10 data-[state=checked]:border-[#FF5A1F] data-[state=checked]:bg-[#FF5A1F]"
                  >
                    <Checkbox.Indicator>
                      <Check className="h-3.5 w-3.5 text-white" />
                    </Checkbox.Indicator>
                  </Checkbox.Root>
                  <label
                    htmlFor="newsletter-privacy"
                    className="text-xs leading-relaxed text-slate-200"
                  >
                    Acconsento al trattamento della mia email per finalità di
                    newsletter e coupon promozionali secondo la{" "}
                    <Link
                      href="/privacy-policy"
                      className="font-semibold text-white underline underline-offset-2 hover:text-[#FF5A1F]"
                    >
                      Privacy Policy
                    </Link>
                    . Disiscrizione possibile in un click.
                  </label>
                </div>

                {error ? (
                  <p
                    role="alert"
                    className="mt-3 rounded-xl bg-red-500/20 px-3.5 py-2 text-xs font-semibold text-red-100 ring-1 ring-red-400/40"
                  >
                    {error}
                  </p>
                ) : null}
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
