export type SeasonType = "estivi" | "invernali" | "4-stagioni" | "accessori";
export type VehicleType = "auto" | "suv-furgo" | "accessori";
export type EuGrade = "A" | "B" | "C" | "D" | "E";

export interface Product {
  id: string;
  sku: string;
  badgeNumber: string;
  slug: string;
  brand: string;
  model: string;
  season: SeasonType;
  seasonLabel: string;
  vehicle: VehicleType;
  vehicleLabel: string;
  width?: number;
  aspectRatio?: number;
  diameter?: string;
  sizeLabel: string;
  loadSpeedIndex?: string;
  priceEur: number;
  costEur: number;
  compareAtEur?: number;
  stockItalia: number;
  stockCina: number;
  rating: number;
  reviewCount: number;
  image: string;
  isTire: boolean;
  featured: boolean;
  inStock: boolean;
  dotGuarantee: string;
  shippingBadge: string;
  euLabel?: {
    fuel: EuGrade;
    wetGrip: EuGrade;
    noiseDb: number;
    noiseClass: "A" | "B" | "C";
  };
  shortDescription: string;
  description: string;
  highlights: string[];
}

export type LogisticsAvailabilityType =
  | "italia"
  | "cina"
  | "split"
  | "out_of_stock";

export interface LogisticsAvailability {
  type: LogisticsAvailabilityType;
  totalAvailable: number;
  fromItalia: number;
  fromCina: number;
  badgeLabel: string;
  deliveryEstimate: string;
  canFulfill: boolean;
}

/**
 * Regola logistica ufficiale STORE 101:
 * - Magazzino Italia (stock_italia > 0): consegna 4-7 giorni lavorativi
 * - Stock Cina / Import (stock_italia == 0 && stock_cina > 0): consegna 5-15 giorni lavorativi
 * - Ordine Misto (Split Order): se qty > stock_italia ma stock_italia > 0 e stock_italia + stock_cina >= qty
 */
export function evaluateProductLogistics(
  stockItalia: number,
  stockCina: number,
  requestedQty = 1
): LogisticsAvailability {
  const it = Math.max(0, Math.floor(stockItalia));
  const cn = Math.max(0, Math.floor(stockCina));
  const totalAvailable = it + cn;

  if (totalAvailable === 0) {
    return {
      type: "out_of_stock",
      totalAvailable: 0,
      fromItalia: 0,
      fromCina: 0,
      badgeLabel: "Esaurito",
      deliveryEstimate: "Attualmente non disponibile",
      canFulfill: false,
    };
  }

  if (it >= requestedQty) {
    return {
      type: "italia",
      totalAvailable,
      fromItalia: requestedQty,
      fromCina: 0,
      badgeLabel: "Disponibile in Italia",
      deliveryEstimate: "Consegna in 4-7 giorni lavorativi",
      canFulfill: true,
    };
  }

  if (it === 0 && cn > 0) {
    return {
      type: "cina",
      totalAvailable,
      fromItalia: 0,
      fromCina: Math.min(requestedQty, cn),
      badgeLabel: "Disponibile su ordinazione",
      deliveryEstimate: "Consegna in 5-15 giorni lavorativi",
      canFulfill: cn >= requestedQty,
    };
  }

  // Split order: una parte in Italia, il resto da stock Cina
  const remainingFromCina = Math.min(requestedQty - it, cn);
  return {
    type: "split",
    totalAvailable,
    fromItalia: it,
    fromCina: remainingFromCina,
    badgeLabel: `Split IT/CN (${it} IT + ${remainingFromCina} CN)`,
    deliveryEstimate: `${it} pz in 4-7 gg + ${remainingFromCina} pz in 5-15 gg lav.`,
    canFulfill: totalAvailable >= requestedQty,
  };
}

/**
 * Catalogo iniziale vuoto: nessuna giacenza o prodotto fittizio caricato.
 * Le giacenze e i prodotti reali vengono popolati esclusivamente tramite importazione CSV serale.
 */
export const PRODUCTS: Product[] = [];

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getUniqueWidths(catalog: Product[] = PRODUCTS): number[] {
  const widths = catalog.map((p) => p.width).filter(
    (w): w is number => typeof w === "number"
  );
  return Array.from(new Set(widths)).sort((a, b) => a - b);
}

export function getUniqueAspectRatios(catalog: Product[] = PRODUCTS): number[] {
  const ratios = catalog.map((p) => p.aspectRatio).filter(
    (r): r is number => typeof r === "number"
  );
  return Array.from(new Set(ratios)).sort((a, b) => a - b);
}

export function getUniqueDiameters(catalog: Product[] = PRODUCTS): string[] {
  const diameters = catalog.map((p) => p.diameter).filter(
    (d): d is string => typeof d === "string"
  );
  return Array.from(new Set(diameters)).sort();
}

export function getUniqueBrands(catalog: Product[] = PRODUCTS): string[] {
  const brands = catalog.filter((p) => p.isTire).map((p) => p.brand);
  return Array.from(new Set(brands)).sort();
}
