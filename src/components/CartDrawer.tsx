"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import * as Checkbox from "@radix-ui/react-checkbox";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  Check,
  Home,
  Loader2,
  Lock,
  Minus,
  Plus,
  ShoppingBag,
  Sparkles,
  Tag,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { LogisticsBadge } from "@/components/LogisticsBadge";
import { FREE_SHIPPING_THRESHOLD_EUR } from "@/lib/pricing";
import { cn, formatEur } from "@/lib/utils";

export function CartDrawer() {
  const {
    items,
    promoCode,
    order,
    isOpen,
    closeCart,
    updateQuantity,
    removeItem,
    applyPromoCode,
    removePromoCode,
  } = useCart();

  const [promoInput, setPromoInput] = useState(promoCode);
  const [customerEmail, setCustomerEmail] = useState("");
  const [deliveryMode, setDeliveryMode] = useState<"home" | "partner-workshop">(
    "home"
  );
  const [splitPreference, setSplitPreference] = useState<
    "split_shipments" | "single_consolidated"
  >("split_shipments");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const progressPct = Math.min(
    100,
    Math.round(
      (order.subtotalAfterSetDiscountEur / FREE_SHIPPING_THRESHOLD_EUR) * 100
    )
  );

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    applyPromoCode(promoInput);
  };

  const handleCheckout = async () => {
    setCheckoutError(null);

    if (items.length === 0) return;
    if (!acceptTerms) {
      setCheckoutError(
        "Devi accettare la Privacy Policy e i Termini di Vendita prima di procedere al pagamento."
      );
      return;
    }

    setCheckoutLoading(true);
    void fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "checkout_start" }),
    }).catch(() => undefined);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
          promoCode: promoCode || undefined,
          customerEmail: customerEmail.trim() || undefined,
          acceptTerms: true,
          deliveryMode,
          splitPreference: order.hasSplitOrder ? splitPreference : undefined,
        }),
      });

      const data = (await response.json()) as {
        url?: string;
        error?: string;
        code?: string;
      };

      if (!response.ok) {
        setCheckoutError(
          data.error ?? "Impossibile avviare il checkout Stripe."
        );
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        setCheckoutError("URL di pagamento Stripe non ricevuto.");
      }
    } catch {
      setCheckoutError(
        "Errore di rete durante la connessione a Stripe. Riprova."
      );
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) closeCart();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-[#0F172A]/60 backdrop-blur-sm" />
        <Dialog.Content className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl focus:outline-none">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0F172A] text-white">
                <ShoppingBag className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <Dialog.Title className="font-display text-lg font-extrabold text-[#0F172A]">
                  Il tuo Carrello
                </Dialog.Title>
                <Dialog.Description className="text-xs font-medium tabular-nums text-[#475569]">
                  {order.totalQuantity}{" "}
                  {order.totalQuantity === 1 ? "articolo" : "articoli"} nel
                  carrello
                </Dialog.Description>
              </div>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Chiudi carrello"
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-[#475569] transition-colors hover:bg-slate-100 hover:text-[#0F172A]"
              >
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          {/* Free Shipping Progress Bar */}
          {order.lines.length > 0 ? (
            <div className="border-b border-[#E2E8F0] bg-[#F8FAFC] px-5 py-3">
              <div className="flex items-center justify-between gap-2 text-xs font-semibold">
                <span className="inline-flex items-center gap-1.5 text-[#0F172A]">
                  <Truck className="h-4 w-4 text-[#FF5A1F]" aria-hidden="true" />
                  {order.freeShippingRemainingEur === 0 ? (
                    <span className="text-[#10B981]">
                      Spedizione Express Gratuita sbloccata!
                    </span>
                  ) : (
                    <span>
                      Aggiungi{" "}
                      <strong className="tabular-nums text-[#FF5A1F]">
                        {formatEur(order.freeShippingRemainingEur)}
                      </strong>{" "}
                      per la spedizione gratuita
                    </span>
                  )}
                </span>
                <span className="tabular-nums text-[#475569]">
                  {progressPct}%
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#E2E8F0]">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-300",
                    order.freeShippingRemainingEur === 0
                      ? "bg-[#10B981]"
                      : "bg-[#FF5A1F]"
                  )}
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          ) : null}

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {order.lines.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F8FAFC] text-[#475569] ring-1 ring-[#E2E8F0]">
                  <ShoppingBag className="h-7 w-7" />
                </div>
                <p className="mt-4 font-display text-lg font-bold text-[#0F172A]">
                  Il carrello è vuoto
                </p>
                <p className="mt-1.5 max-w-xs text-sm text-[#475569]">
                  Scegli i tuoi pneumatici e approfitta dello sconto automatico
                  del 5% sul treno completo da 4 gomme.
                </p>
                <button
                  type="button"
                  onClick={closeCart}
                  className="mt-6 min-h-[46px] rounded-xl bg-[#0052FF] px-6 text-sm font-bold text-white hover:bg-[#003ECC]"
                >
                  Esplora il Catalogo
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Line Items */}
                <ul className="space-y-3">
                  {order.lines.map((line) => (
                    <li
                      key={line.product.id}
                      className="rounded-2xl border border-[#E2E8F0] bg-white p-3.5 shadow-card"
                    >
                      <div className="flex gap-3">
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-[#E2E8F0] bg-white">
                          <Image
                            src={line.product.image}
                            alt={`${line.product.brand} ${line.product.model}`}
                            fill
                            sizes="80px"
                            className="object-contain p-1.5"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#0052FF]">
                                {line.product.brand}
                              </p>
                              <Link
                                href={`/prodotti/${line.product.slug}`}
                                onClick={closeCart}
                                className="line-clamp-1 font-display text-sm font-bold text-[#0F172A] hover:text-[#0052FF]"
                              >
                                {line.product.model}
                              </Link>
                              <p className="text-xs font-medium tabular-nums text-[#475569]">
                                {line.product.seasonLabel} &bull;{" "}
                                {line.product.sizeLabel}
                              </p>
                              <div className="mt-1.5">
                                <LogisticsBadge logistics={line.logistics} />
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeItem(line.product.id)}
                              aria-label={`Rimuovi ${line.product.model}`}
                              className="flex min-h-[44px] min-w-[44px] -mr-2 -mt-2 items-center justify-center rounded-xl text-[#475569] hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="mt-2.5 flex items-center justify-between gap-2">
                            {/* Stepper */}
                            <div className="inline-flex items-center rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]">
                              <button
                                type="button"
                                aria-label="Diminuisci quantità"
                                onClick={() =>
                                  updateQuantity(
                                    line.product.id,
                                    line.quantity - 1
                                  )
                                }
                                className="flex min-h-[44px] min-w-[44px] items-center justify-center text-[#0F172A] hover:text-[#0052FF]"
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="min-w-[28px] text-center text-sm font-bold tabular-nums text-[#0F172A]">
                                {line.quantity}
                              </span>
                              <button
                                type="button"
                                aria-label="Aumenta quantità"
                                onClick={() =>
                                  updateQuantity(
                                    line.product.id,
                                    line.quantity + 1
                                  )
                                }
                                className="flex min-h-[44px] min-w-[44px] items-center justify-center text-[#0F172A] hover:text-[#0052FF]"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>

                            <div className="text-right tabular-nums">
                              <p className="font-display text-sm font-extrabold text-[#0F172A]">
                                {formatEur(line.lineNetEur)}
                              </p>
                              {line.fullSetDiscountEur > 0 ? (
                                <p className="text-[11px] font-bold text-[#10B981]">
                                  -5% ({formatEur(-line.fullSetDiscountEur)})
                                </p>
                              ) : null}
                            </div>
                          </div>

                          {/* Upsell per completare il treno da 4 gomme */}
                          {line.product.isTire && line.quantity < 4 ? (
                            <button
                              type="button"
                              onClick={() => updateQuantity(line.product.id, 4)}
                              className="mt-2 inline-flex min-h-[36px] w-full items-center justify-center gap-1.5 rounded-lg bg-[#FF5A1F]/10 px-3 text-[11px] font-bold text-[#FF5A1F] transition-colors hover:bg-[#FF5A1F] hover:text-white"
                            >
                              <Sparkles className="h-3 w-3" />
                              Completa il treno da 4 gomme e risparmia il 5%
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                {/* Delivery Mode */}
                <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#475569]">
                    Modalità di consegna
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDeliveryMode("home")}
                      className={cn(
                        "flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border px-2.5 text-xs font-bold transition-colors",
                        deliveryMode === "home"
                          ? "border-[#0052FF] bg-white text-[#0052FF] shadow-sm"
                          : "border-[#E2E8F0] bg-transparent text-[#475569]"
                      )}
                    >
                      <Home className="h-4 w-4 shrink-0" />
                      A casa tua
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveryMode("partner-workshop")}
                      className={cn(
                        "flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border px-2.5 text-xs font-bold transition-colors",
                        deliveryMode === "partner-workshop"
                          ? "border-[#0052FF] bg-white text-[#0052FF] shadow-sm"
                          : "border-[#E2E8F0] bg-transparent text-[#475569]"
                      )}
                    >
                      <Building2 className="h-4 w-4 shrink-0" />
                      Officina Partner
                    </button>
                  </div>
                </div>

                {/* Split Order Logistics Choice (Magazzino Italia + Import Cina) */}
                {order.hasSplitOrder ? (
                  <div className="rounded-2xl border border-[#FF5A1F]/40 bg-[#FFF7ED] p-3.5">
                    <p className="text-xs font-extrabold uppercase tracking-wider text-[#C2410C]">
                      Ordine Misto Rilevato ({order.totalFromItalia} pz IT +{" "}
                      {order.totalFromCina} pz Import)
                    </p>
                    <p className="mt-1 text-[11px] leading-relaxed text-[#7C2D12]">
                      Scegli come preferisci ricevere gli pneumatici:
                    </p>
                    <div className="mt-2.5 grid grid-cols-1 gap-2">
                      <button
                        type="button"
                        onClick={() => setSplitPreference("split_shipments")}
                        className={cn(
                          "min-h-[44px] rounded-xl border px-3 py-2 text-left text-xs transition-colors",
                          splitPreference === "split_shipments"
                            ? "border-[#FF5A1F] bg-white font-bold text-[#0F172A] shadow-sm"
                            : "border-[#FDBA74]/60 bg-white/50 text-[#7C2D12]"
                        )}
                      >
                        <span className="block">Spedizione separata (Consigliata)</span>
                        <span className="text-[11px] font-normal text-[#475569]">
                          {order.totalFromItalia} pz in 4-7 gg (Italia) +{" "}
                          {order.totalFromCina} pz in 5-15 gg lav.
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSplitPreference("single_consolidated")}
                        className={cn(
                          "min-h-[44px] rounded-xl border px-3 py-2 text-left text-xs transition-colors",
                          splitPreference === "single_consolidated"
                            ? "border-[#FF5A1F] bg-white font-bold text-[#0F172A] shadow-sm"
                            : "border-[#FDBA74]/60 bg-white/50 text-[#7C2D12]"
                        )}
                      >
                        <span className="block">Spedizione unica consolidata</span>
                        <span className="text-[11px] font-normal text-[#475569]">
                          Tutti i {order.totalQuantity} pezzi insieme in 5-15 gg lav.
                        </span>
                      </button>
                    </div>
                  </div>
                ) : null}

                {/* Promo Code */}
                <div className="rounded-2xl border border-[#E2E8F0] bg-white p-3.5">
                  <form onSubmit={handleApplyPromo} className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag
                        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#475569]"
                        aria-hidden="true"
                      />
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(e) =>
                          setPromoInput(e.target.value.toUpperCase())
                        }
                        placeholder="Codice promo (es. BENVENUTO15)"
                        aria-label="Codice promozionale"
                        className="min-h-[44px] w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] pl-9 pr-3 text-xs font-semibold uppercase text-[#0F172A] focus:border-[#0052FF] focus:bg-white focus:outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="min-h-[44px] rounded-xl bg-[#0F172A] px-4 text-xs font-bold text-white hover:bg-[#0052FF]"
                    >
                      Applica
                    </button>
                  </form>

                  {order.promo ? (
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span
                        className={
                          order.promo.valid
                            ? "font-semibold text-[#10B981]"
                            : "font-medium text-red-600"
                        }
                      >
                        {order.promo.valid
                          ? `${order.promo.label} applicato`
                          : order.promo.reason}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          removePromoCode();
                          setPromoInput("");
                        }}
                        className="font-semibold text-[#475569] underline hover:text-[#0F172A]"
                      >
                        Rimuovi
                      </button>
                    </div>
                  ) : null}
                </div>

                {/* Email opzionale per ricevuta Stripe */}
                <div>
                  <label
                    htmlFor="cart-email"
                    className="block text-xs font-semibold text-[#475569]"
                  >
                    Email per ricevuta ordine (opzionale)
                  </label>
                  <input
                    id="cart-email"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="nome@esempio.it"
                    className="mt-1 min-h-[44px] w-full rounded-xl border border-[#E2E8F0] px-3.5 text-sm text-[#0F172A] focus:border-[#0052FF] focus:outline-none focus:ring-2 focus:ring-[#0052FF]/20"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sticky Footer Summary + Stripe Checkout CTA */}
          {order.lines.length > 0 ? (
            <div className="border-t border-[#E2E8F0] bg-[#F8FAFC] px-5 py-4">
              <dl className="space-y-1.5 text-xs tabular-nums">
                <div className="flex justify-between text-[#475569]">
                  <dt>Subtotale prodotti</dt>
                  <dd className="font-semibold text-[#0F172A]">
                    {formatEur(order.grossSubtotalEur)}
                  </dd>
                </div>

                {order.fullSetDiscountTotalEur > 0 ? (
                  <div className="flex justify-between font-semibold text-[#10B981]">
                    <dt>Sconto Treno Completo (-5%)</dt>
                    <dd>-{formatEur(order.fullSetDiscountTotalEur)}</dd>
                  </div>
                ) : null}

                {order.promo?.valid ? (
                  <div className="flex justify-between font-semibold text-[#10B981]">
                    <dt>{order.promo.label}</dt>
                    <dd>-{formatEur(order.promo.discountEur)}</dd>
                  </div>
                ) : null}

                {order.pfuTotalEur > 0 ? (
                  <div className="flex justify-between text-[#475569]">
                    <dt>
                      Contributo ambientale PFU ({order.totalTires} &times; €3,50)
                    </dt>
                    <dd className="font-semibold text-[#0F172A]">
                      {formatEur(order.pfuTotalEur)}
                    </dd>
                  </div>
                ) : null}

                <div className="flex justify-between text-[#475569]">
                  <dt>Spedizione Express 24/48h</dt>
                  <dd
                    className={cn(
                      "font-semibold",
                      order.shippingEur === 0
                        ? "text-[#10B981]"
                        : "text-[#0F172A]"
                    )}
                  >
                    {order.shippingEur === 0
                      ? "GRATUITA"
                      : formatEur(order.shippingEur)}
                  </dd>
                </div>

                <div className="flex justify-between border-t border-[#E2E8F0] pt-2.5 font-display text-base font-extrabold text-[#0F172A]">
                  <dt>Totale IVA inclusa</dt>
                  <dd>{formatEur(order.grandTotalEur)}</dd>
                </div>
              </dl>

              {/* Consenso esplicito non pre-spuntato */}
              <div className="mt-3.5 flex items-start gap-2.5">
                <Checkbox.Root
                  id="cart-terms-consent"
                  checked={acceptTerms}
                  onCheckedChange={(checked) =>
                    setAcceptTerms(checked === true)
                  }
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border border-[#94A3B8] bg-white data-[state=checked]:border-[#0052FF] data-[state=checked]:bg-[#0052FF]"
                >
                  <Checkbox.Indicator>
                    <Check className="h-3.5 w-3.5 text-white" />
                  </Checkbox.Indicator>
                </Checkbox.Root>
                <label
                  htmlFor="cart-terms-consent"
                  className="text-[11px] leading-relaxed text-[#475569]"
                >
                  Accetto la{" "}
                  <Link
                    href="/privacy-policy"
                    onClick={closeCart}
                    className="font-semibold text-[#0052FF] underline"
                  >
                    Privacy Policy
                  </Link>{" "}
                  e i{" "}
                  <Link
                    href="/termini-e-condizioni"
                    onClick={closeCart}
                    className="font-semibold text-[#0052FF] underline"
                  >
                    Termini di Vendita
                  </Link>{" "}
                  (diritto di recesso 14 gg e contributo PFU).
                </label>
              </div>

              {checkoutError ? (
                <div
                  role="alert"
                  className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900"
                >
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                    <p className="font-semibold">{checkoutError}</p>
                  </div>
                </div>
              ) : null}

              <button
                type="button"
                disabled={checkoutLoading}
                onClick={handleCheckout}
                className="mt-4 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#0052FF] px-5 text-sm font-extrabold uppercase tracking-wide text-white shadow-[0_12px_24px_-6px_rgba(0,82,255,0.5)] transition-colors hover:bg-[#003ECC] disabled:opacity-60"
              >
                {checkoutLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Connessione a Stripe...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" aria-hidden="true" />
                    <span>Procedi al Pagamento Stripe</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </>
                )}
              </button>

              <p className="mt-2 text-center text-[11px] text-[#475569]">
                Carta, Apple Pay, Google Pay, Klarna &bull; Calcolo prezzi
                verificato lato server
              </p>
            </div>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
