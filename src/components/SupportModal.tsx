"use client";

import React, { useState } from "react";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import * as Checkbox from "@radix-ui/react-checkbox";
import { Check, CheckCircle2, Headphones, Loader2, X } from "lucide-react";
import { supportRequestSchema } from "@/lib/validation";

export function SupportModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [vehicleInfo, setVehicleInfo] = useState("");
  const [message, setMessage] = useState("");
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [faxNumber, setFaxNumber] = useState(""); // Honeypot anti-spam
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successTicket, setSuccessTicket] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = supportRequestSchema.safeParse({
      fullName,
      email,
      vehicleInfo,
      message,
      acceptPrivacy,
      faxNumber,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Controlla i campi inseriti.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = (await res.json()) as {
        error?: string;
        ticketId?: string;
      };
      if (!res.ok) {
        setError(data.error ?? "Errore durante l'invio. Riprova.");
        return;
      }
      setSuccessTicket(data.ticketId ?? "S101-OK");
      setFullName("");
      setEmail("");
      setVehicleInfo("");
      setMessage("");
      setAcceptPrivacy(false);
    } catch {
      setError("Errore di rete. Controlla la connessione e riprova.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) {
          setError(null);
          setSuccessTicket(null);
        }
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-[#0F172A]/60 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-2xl focus:outline-none">
          <div className="flex items-start justify-between gap-4 border-b border-[#E2E8F0] pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0052FF]/10 text-[#0052FF]">
                <Headphones className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <Dialog.Title className="font-display text-lg font-bold text-[#0F172A]">
                  Assistenza Tecnica Misure
                </Dialog.Title>
                <Dialog.Description className="text-xs text-[#475569]">
                  Un esperto STORE 101 verifica la compatibilità dal libretto
                </Dialog.Description>
              </div>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Chiudi richiesta assistenza"
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-[#475569] hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          {successTicket ? (
            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
              <h3 className="mt-3 font-display text-base font-bold text-[#0F172A]">
                Richiesta inviata! Ticket {successTicket}
              </h3>
              <p className="mt-1.5 text-sm text-[#475569]">
                Il nostro team tecnico ti risponderà via email entro 2 ore
                lavorative con le gomme omologate per il tuo veicolo.
              </p>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="mt-5 min-h-[44px] rounded-xl bg-[#0052FF] px-6 text-sm font-bold text-white hover:bg-[#003ECC]"
              >
                Torna al catalogo
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {/* Campo Honeypot anti-spam invisibile */}
              <div className="hidden" aria-hidden="true">
                <label htmlFor="support-fax">Fax</label>
                <input
                  id="support-fax"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={faxNumber}
                  onChange={(e) => setFaxNumber(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="support-name"
                    className="block text-xs font-semibold uppercase tracking-wide text-[#475569]"
                  >
                    Nome e Cognome *
                  </label>
                  <input
                    id="support-name"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Mario Rossi"
                    className="mt-1.5 min-h-[44px] w-full rounded-xl border border-[#E2E8F0] px-3.5 text-sm text-[#0F172A] focus:border-[#0052FF] focus:outline-none focus:ring-2 focus:ring-[#0052FF]/20"
                  />
                </div>
                <div>
                  <label
                    htmlFor="support-email"
                    className="block text-xs font-semibold uppercase tracking-wide text-[#475569]"
                  >
                    Email *
                  </label>
                  <input
                    id="support-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="mario@esempio.it"
                    className="mt-1.5 min-h-[44px] w-full rounded-xl border border-[#E2E8F0] px-3.5 text-sm text-[#0F172A] focus:border-[#0052FF] focus:outline-none focus:ring-2 focus:ring-[#0052FF]/20"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="support-vehicle"
                  className="block text-xs font-semibold uppercase tracking-wide text-[#475569]"
                >
                  Auto / Misura sul libretto *
                </label>
                <input
                  id="support-vehicle"
                  type="text"
                  required
                  value={vehicleInfo}
                  onChange={(e) => setVehicleInfo(e.target.value)}
                  placeholder="Es. Audi A3 Sportback — 225/45 R17 91Y"
                  className="mt-1.5 min-h-[44px] w-full rounded-xl border border-[#E2E8F0] px-3.5 text-sm text-[#0F172A] focus:border-[#0052FF] focus:outline-none focus:ring-2 focus:ring-[#0052FF]/20"
                />
              </div>

              <div>
                <label
                  htmlFor="support-message"
                  className="block text-xs font-semibold uppercase tracking-wide text-[#475569]"
                >
                  Come possiamo aiutarti? *
                </label>
                <textarea
                  id="support-message"
                  rows={3}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Indica se cerchi estivi, invernali o 4 stagioni e il tuo stile di guida..."
                  className="mt-1.5 w-full rounded-xl border border-[#E2E8F0] p-3.5 text-sm text-[#0F172A] focus:border-[#0052FF] focus:outline-none focus:ring-2 focus:ring-[#0052FF]/20"
                />
              </div>

              <div className="flex items-start gap-3">
                <Checkbox.Root
                  id="support-privacy"
                  checked={acceptPrivacy}
                  onCheckedChange={(checked) =>
                    setAcceptPrivacy(checked === true)
                  }
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border border-[#94A3B8] bg-white data-[state=checked]:border-[#0052FF] data-[state=checked]:bg-[#0052FF]"
                >
                  <Checkbox.Indicator>
                    <Check className="h-3.5 w-3.5 text-white" />
                  </Checkbox.Indicator>
                </Checkbox.Root>
                <label
                  htmlFor="support-privacy"
                  className="text-xs leading-relaxed text-[#475569]"
                >
                  Dichiaro di aver letto e accettato la{" "}
                  <Link
                    href="/privacy-policy"
                    onClick={() => onOpenChange(false)}
                    className="font-semibold text-[#0052FF] underline"
                  >
                    Privacy Policy
                  </Link>{" "}
                  per il trattamento dei dati ai fini della risposta tecnica.
                </label>
              </div>

              {error ? (
                <p
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700"
                >
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={submitting}
                className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-[#0052FF] px-5 text-sm font-bold text-white transition-colors hover:bg-[#003ECC] disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Invio in corso...
                  </>
                ) : (
                  "Invia richiesta a un tecnico"
                )}
              </button>
            </form>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
