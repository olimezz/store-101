"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CalendarCheck2,
  Check,
  CheckCircle2,
  RotateCcw,
  ShieldCheck,
  ShoppingCart,
  Star,
  Truck,
} from "lucide-react";
import type { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { EuEnergyLabel, SeasonBadge } from "@/components/SeasonBadge";
import {
  FULL_SET_DISCOUNT_RATE,
  PFU_FEE_PER_TIRE_EUR,
} from "@/lib/pricing";
import { cn, formatEur } from "@/lib/utils";

export function ProductDetailClient({
  product,
  relatedProducts,
}: {
  product: Product;
  relatedProducts: Product[];
}) {
  const { addItem, openCart } = useCart();
  const [quantity, setQuantity] = useState<number>(product.isTire ? 4 : 1);
  const [added, setAdded] = useState(false);

  const qualifiesSetDiscount = product.isTire && quantity >= 4;
  const lineGross = product.priceEur * quantity;
  const setDiscount = qualifiesSetDiscount
    ? lineGross * FULL_SET_DISCOUNT_RATE
    : 0;
  const pfuTotal = product.isTire ? PFU_FEE_PER_TIRE_EUR * quantity : 0;
  const estimatedTotal = lineGross - setDiscount + pfuTotal;

  const handleAdd = (openDrawerAfter = false) => {
    addItem(product.id, quantity);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
    if (openDrawerAfter) {
      openCart();
    }
  };

  return (
    <div className="pb-28 lg:pb-16">
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <Link
          href="/#catalogo"
          className="inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-[#475569] transition-colors hover:text-[#0052FF]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Torna al catalogo STORE 101
        </Link>

        {/* Main Split Detail */}
        <div className="mt-4 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Image Gallery Box */}
          <div className="lg:col-span-6">
            <div className="relative overflow-hidden rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-card sm:p-10">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0F172A] font-display text-sm font-extrabold tabular-nums text-white">
                    {product.badgeNumber}
                  </span>
                  <SeasonBadge
                    season={product.season}
                    label={product.seasonLabel}
                  />
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#FF5A1F]/10 px-3 py-1 text-xs font-bold text-[#FF5A1F]">
                  <Truck className="h-3.5 w-3.5" aria-hidden="true" />
                  {product.shippingBadge}
                </span>
              </div>

              <div className="relative mx-auto mt-6 aspect-square max-w-md">
                <Image
                  src={product.image}
                  alt={`${product.brand} ${product.model} ${product.sizeLabel}`}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-contain p-4"
                />
              </div>

              {product.euLabel ? (
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#E2E8F0] pt-5">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#475569]">
                    Etichetta Energetica UE 2020/740
                  </span>
                  <EuEnergyLabel euLabel={product.euLabel} compact={false} />
                </div>
              ) : null}
            </div>
          </div>

          {/* Info & Purchase Column */}
          <div className="lg:col-span-6">
            <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-card sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-extrabold uppercase tracking-wider text-[#0052FF]">
                  {product.brand}
                </span>
                <div className="inline-flex items-center gap-1.5 text-sm font-bold tabular-nums text-[#0F172A]">
                  <Star className="h-4 w-4 fill-[#F59E0B] text-[#F59E0B]" />
                  <span>{product.rating.toFixed(1)}</span>
                  <span className="font-medium text-[#475569]">
                    ({product.reviewCount} recensioni verificate)
                  </span>
                </div>
              </div>

              <h1
                className="mt-2 font-display font-extrabold tracking-[-0.02em] text-[#0F172A]"
                style={{ fontSize: "clamp(1.65rem, 3vw, 2.35rem)" }}
              >
                {product.model}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm font-semibold tabular-nums text-[#475569]">
                <span className="rounded-lg bg-[#0F172A] px-3 py-1 font-bold text-white">
                  {product.sizeLabel}
                </span>
                {product.loadSpeedIndex ? (
                  <span className="rounded-lg bg-[#F8FAFC] px-3 py-1 text-[#0F172A] ring-1 ring-[#E2E8F0]">
                    Indice {product.loadSpeedIndex}
                  </span>
                ) : null}
                <span className="rounded-lg bg-emerald-50 px-3 py-1 text-emerald-700">
                  {product.dotGuarantee}
                </span>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-[#475569] sm:text-base">
                {product.description}
              </p>

              {/* Pricing */}
              <div className="mt-6 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <div className="flex items-baseline gap-2.5">
                      <span className="font-display text-3xl font-extrabold tabular-nums text-[#0F172A]">
                        {formatEur(product.priceEur)}
                      </span>
                      {product.compareAtEur ? (
                        <span className="text-sm font-medium tabular-nums text-[#475569] line-through">
                          {formatEur(product.compareAtEur)}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-0.5 text-xs text-[#475569]">
                      Prezzo unitario IVA inclusa{" "}
                      {product.isTire
                        ? "• +€3,50/cad. contributo PFU obbligatorio"
                        : "• esente PFU"}
                    </p>
                  </div>

                  {qualifiesSetDiscount ? (
                    <span className="rounded-full bg-[#10B981] px-3 py-1 text-xs font-extrabold uppercase text-white">
                      -5% Treno Completo
                    </span>
                  ) : null}
                </div>

                {/* Quantity selector */}
                <div className="mt-5">
                  <span className="block text-xs font-bold uppercase tracking-wider text-[#475569]">
                    Seleziona quantità
                  </span>
                  <div className="mt-2 grid grid-cols-3 gap-2.5">
                    {(product.isTire ? [1, 2, 4] : [1, 2, 3]).map((qty) => {
                      const active = quantity === qty;
                      const isFour = product.isTire && qty === 4;
                      return (
                        <button
                          key={qty}
                          type="button"
                          onClick={() => setQuantity(qty)}
                          className={cn(
                            "flex min-h-[52px] flex-col items-center justify-center rounded-xl border text-sm font-bold tabular-nums transition-colors",
                            active
                              ? "border-[#FF5A1F] bg-[#FF5A1F]/10 text-[#0F172A] ring-1 ring-[#FF5A1F]"
                              : "border-[#E2E8F0] bg-white text-[#475569] hover:border-[#0052FF]/40"
                          )}
                        >
                          <span>
                            {qty}{" "}
                            {product.isTire
                              ? qty === 1
                                ? "gomma"
                                : "gomme"
                              : "pz"}
                          </span>
                          {isFour ? (
                            <span className="mt-0.5 rounded bg-[#FF5A1F] px-1.5 py-0.5 text-[10px] font-extrabold text-white">
                              RISPARMIA 5%
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Order total preview */}
                <div className="mt-4 space-y-1 border-t border-[#E2E8F0] pt-3.5 text-xs tabular-nums text-[#475569]">
                  {setDiscount > 0 ? (
                    <div className="flex justify-between font-bold text-[#10B981]">
                      <span>Sconto automatico treno da 4 (-5%)</span>
                      <span>-{formatEur(setDiscount)}</span>
                    </div>
                  ) : null}
                  {pfuTotal > 0 ? (
                    <div className="flex justify-between">
                      <span>Contributo PFU ({quantity} &times; €3,50)</span>
                      <span className="font-semibold text-[#0F172A]">
                        {formatEur(pfuTotal)}
                      </span>
                    </div>
                  ) : null}
                  <div className="flex justify-between pt-1 font-display text-base font-extrabold text-[#0F172A]">
                    <span>Totale selezione</span>
                    <span>{formatEur(estimatedTotal)}</span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAdd(false)}
                    className={cn(
                      "flex min-h-[52px] items-center justify-center gap-2 rounded-xl px-5 text-sm font-extrabold uppercase tracking-wide text-white transition-colors",
                      added
                        ? "bg-[#10B981]"
                        : "bg-[#0052FF] hover:bg-[#003ECC]"
                    )}
                  >
                    {added ? (
                      <>
                        <Check className="h-4 w-4 stroke-[3]" />
                        Aggiunto ✓
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-4 w-4" />
                        Aggiungi al Carrello
                      </>
                    )}
                  </motion.button>

                  <button
                    type="button"
                    onClick={() => handleAdd(true)}
                    className="flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-[#0F172A] px-5 text-sm font-extrabold uppercase tracking-wide text-white transition-colors hover:bg-slate-800"
                  >
                    Acquista con Stripe
                  </button>
                </div>
              </div>

              {/* Technical Highlights */}
              <div className="mt-6">
                <h2 className="font-display text-sm font-extrabold uppercase tracking-wider text-[#0F172A]">
                  Punti di forza tecnici
                </h2>
                <ul className="mt-3 space-y-2.5">
                  {product.highlights.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2.5 text-sm text-[#475569]"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#10B981]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Guarantee mini-strip */}
              <div className="mt-6 grid grid-cols-1 gap-3 border-t border-[#E2E8F0] pt-5 text-xs text-[#475569] sm:grid-cols-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[#0052FF]" />
                  <span>Garanzia Legale 24 mesi</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarCheck2 className="h-4 w-4 text-[#10B981]" />
                  <span>DOT recente &lt; 12 mesi</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4 text-[#0EA5E9]" />
                  <span>Reso facile 14 giorni</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 ? (
          <section className="mt-14">
            <h2 className="font-display text-xl font-extrabold uppercase tracking-tight text-[#0F172A]">
              Alternative consigliate
            </h2>
            <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3">
              {relatedProducts.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/prodotti/${rel.slug}`}
                  className="flex items-center gap-4 rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-card transition-all hover:-translate-y-0.5 hover:border-[#0052FF]/40 hover:shadow-card-hover"
                >
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-white">
                    <Image
                      src={rel.image}
                      alt={`${rel.brand} ${rel.model}`}
                      fill
                      sizes="80px"
                      className="object-contain p-1.5"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-extrabold uppercase text-[#0052FF]">
                      {rel.brand}
                    </p>
                    <p className="truncate font-display text-sm font-bold text-[#0F172A]">
                      {rel.model}
                    </p>
                    <p className="text-xs tabular-nums text-[#475569]">
                      {rel.sizeLabel} &bull; {rel.seasonLabel}
                    </p>
                    <p className="mt-1 font-display text-base font-extrabold tabular-nums text-[#0F172A]">
                      {formatEur(rel.priceEur)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>

      {/* Sticky Bottom Bar Mobile (Pagina Dettaglio Prodotto) */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[#E2E8F0] bg-white/95 px-4 py-3 shadow-[0_-10px_28px_rgba(15,23,42,0.14)] backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#475569]">
              Totale ({quantity} {product.isTire ? "gomme" : "pz"})
            </p>
            <p className="font-display text-lg font-extrabold tabular-nums text-[#0F172A]">
              {formatEur(estimatedTotal)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleAdd(true)}
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-[#0052FF] px-5 text-xs font-extrabold uppercase tracking-wide text-white shadow-md hover:bg-[#003ECC]"
          >
            <ShoppingCart className="h-4 w-4" />
            <span>Aggiungi al Carrello</span>
          </button>
        </div>
      </div>
    </div>
  );
}
