"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, ShoppingCart, Star, Truck } from "lucide-react";
import type { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { EuEnergyLabel, SeasonBadge } from "@/components/SeasonBadge";
import { cn, formatEur } from "@/lib/utils";
import { FULL_SET_DISCOUNT_RATE } from "@/lib/pricing";

const QUICK_QTY_OPTIONS = [1, 2, 4] as const;

export function ProductCard({
  product,
  index,
}: {
  product: Product;
  index: number;
}) {
  const { addItem } = useCart();
  const [selectedQty, setSelectedQty] = useState<number>(product.isTire ? 4 : 1);
  const [added, setAdded] = useState(false);

  const qualifiesDiscount = product.isTire && selectedQty >= 4;
  const effectiveUnitPrice = qualifiesDiscount
    ? product.priceEur * (1 - FULL_SET_DISCOUNT_RATE)
    : product.priceEur;
  const totalForSelection = effectiveUnitPrice * selectedQty;

  const handleAdd = () => {
    addItem(product.id, selectedQty);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{
        duration: 0.35,
        delay: Math.min(index * 0.05, 0.25),
        ease: "easeOut",
      }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-card transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-[#0052FF]/35 hover:shadow-card-hover"
    >
      {/* Top badges row */}
      <div className="flex items-center justify-between gap-2 px-5 pt-5">
        <div className="flex items-center gap-2">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0F172A] font-display text-xs font-extrabold tabular-nums text-white"
            aria-label={`Prodotto numero ${product.badgeNumber}`}
          >
            {product.badgeNumber}
          </span>
          <SeasonBadge season={product.season} label={product.seasonLabel} />
        </div>

        <span className="inline-flex items-center gap-1 rounded-full bg-[#FF5A1F]/10 px-2.5 py-1 text-[11px] font-bold text-[#FF5A1F]">
          <Truck className="h-3 w-3" aria-hidden="true" />
          24/48h
        </span>
      </div>

      {/* Product Studio Image */}
      <Link
        href={`/prodotti/${product.slug}`}
        className="relative mx-5 mt-3 block aspect-[4/3] overflow-hidden rounded-xl bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0052FF]"
      >
        <Image
          src={product.image}
          alt={`${product.brand} ${product.model} ${product.sizeLabel}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-contain p-3 transition-transform duration-300 group-hover:scale-105"
        />
      </Link>

      {/* Card Body */}
      <div className="flex flex-1 flex-col px-5 pb-5 pt-3">
        {/* Brand + Rating */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#0052FF]">
            {product.brand}
          </span>
          <div className="inline-flex items-center gap-1 text-xs font-semibold tabular-nums text-[#0F172A]">
            <Star
              className="h-3.5 w-3.5 fill-[#F59E0B] text-[#F59E0B]"
              aria-hidden="true"
            />
            <span>{product.rating.toFixed(1)}</span>
            <span className="text-[#475569]">({product.reviewCount})</span>
          </div>
        </div>

        {/* Title & Size Spec */}
        <Link
          href={`/prodotti/${product.slug}`}
          className="mt-1 font-display text-lg font-extrabold leading-snug tracking-tight text-[#0F172A] transition-colors hover:text-[#0052FF]"
        >
          {product.model}
        </Link>

        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs font-semibold tabular-nums text-[#475569]">
          <span className="rounded-md bg-[#F8FAFC] px-2 py-0.5 font-bold text-[#0F172A] ring-1 ring-[#E2E8F0]">
            {product.sizeLabel}
          </span>
          {product.loadSpeedIndex ? (
            <span>{product.loadSpeedIndex}</span>
          ) : null}
          <span>&bull; {product.vehicleLabel}</span>
        </div>

        {/* EU Energy Label or Accessory spec */}
        <div className="mt-3">
          {product.euLabel ? (
            <EuEnergyLabel euLabel={product.euLabel} compact />
          ) : (
            <p className="line-clamp-2 text-xs leading-relaxed text-[#475569]">
              {product.shortDescription}
            </p>
          )}
        </div>

        {/* Price Block */}
        <div className="mt-4 flex items-baseline justify-between gap-2 border-t border-[#E2E8F0] pt-4">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-2xl font-extrabold tabular-nums text-[#0F172A]">
                {formatEur(product.priceEur)}
              </span>
              {product.compareAtEur ? (
                <span className="text-xs font-medium tabular-nums text-[#475569] line-through">
                  {formatEur(product.compareAtEur)}
                </span>
              ) : null}
            </div>
            <p className="text-[11px] text-[#475569]">
              {product.isTire
                ? "cad. • +€3,50 PFU nel carrello"
                : "IVA inclusa • esente PFU"}
            </p>
          </div>
          <span className="rounded-lg bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700">
            {product.dotGuarantee}
          </span>
        </div>

        {/* Quick Quantity Selector (1 / 2 / 4 gomme con -5% su 4) */}
        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-[11px]">
            <span className="font-semibold uppercase tracking-wider text-[#475569]">
              Quantità rapida
            </span>
            {qualifiesDiscount ? (
              <span className="font-bold text-[#10B981]">
                Sconto -5% applicato ({formatEur(totalForSelection)})
              </span>
            ) : (
              <span className="font-semibold tabular-nums text-[#475569]">
                Tot: {formatEur(totalForSelection)}
              </span>
            )}
          </div>

          <div
            className={cn(
              "grid gap-2",
              product.isTire ? "grid-cols-3" : "grid-cols-2"
            )}
          >
            {(product.isTire ? QUICK_QTY_OPTIONS : ([1, 2] as const)).map(
              (qty) => {
                const active = selectedQty === qty;
                const isFullSet = product.isTire && qty === 4;
                return (
                  <button
                    key={qty}
                    type="button"
                    onClick={() => setSelectedQty(qty)}
                    className={cn(
                      "relative flex min-h-[44px] flex-col items-center justify-center rounded-xl border text-xs font-bold tabular-nums transition-colors",
                      active
                        ? "border-[#FF5A1F] bg-[#FF5A1F]/10 text-[#0F172A] ring-1 ring-[#FF5A1F]"
                        : "border-[#E2E8F0] bg-[#F8FAFC] text-[#475569] hover:border-[#0052FF]/40 hover:bg-white hover:text-[#0F172A]"
                    )}
                  >
                    <span>
                      {qty} {product.isTire ? (qty === 1 ? "gomma" : "gomme") : "pz"}
                    </span>
                    {isFullSet ? (
                      <span className="mt-0.5 rounded bg-[#FF5A1F] px-1.5 py-0.2 text-[9px] font-extrabold uppercase text-white">
                        -5% TRENO
                      </span>
                    ) : null}
                  </button>
                );
              }
            )}
          </div>
        </div>

        {/* Add to Cart CTA with GPU-only animated feedback */}
        <div className="mt-4 pt-1">
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={handleAdd}
            className={cn(
              "flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0052FF] focus-visible:ring-offset-2",
              added
                ? "bg-[#10B981] hover:bg-[#059669]"
                : "bg-[#0052FF] hover:bg-[#003ECC]"
            )}
          >
            {added ? (
              <>
                <Check className="h-4 w-4 stroke-[3]" aria-hidden="true" />
                <span>Aggiunto ✓</span>
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4" aria-hidden="true" />
                <span>Aggiungi al Carrello</span>
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
}
