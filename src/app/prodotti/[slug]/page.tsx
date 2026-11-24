import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLiveProductBySlug, getLiveProducts } from "@/lib/admin-store";
import { ProductDetailClient } from "@/components/ProductDetailClient";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getLiveProductBySlug(slug);
  if (!product) {
    return { title: "Prodotto non trovato" };
  }
  return {
    title: `${product.brand} ${product.model} ${product.sizeLabel}`,
    description: product.shortDescription,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getLiveProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = getLiveProducts()
    .filter((p) => p.id !== product.id && p.season === product.season)
    .slice(0, 3);

  return (
    <ProductDetailClient product={product} relatedProducts={relatedProducts} />
  );
}
