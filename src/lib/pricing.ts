import {
  evaluateProductLogistics,
  PRODUCTS,
  type LogisticsAvailability,
  type Product,
} from "@/data/products";

export const PFU_FEE_PER_TIRE_EUR = 3.5;
export const FREE_SHIPPING_THRESHOLD_EUR = 150;
export const STANDARD_SHIPPING_EUR = 14.9;
export const FULL_SET_MIN_QTY = 4;
export const FULL_SET_DISCOUNT_RATE = 0.05;

export interface CartItemInput {
  productId: string;
  quantity: number;
}

export interface PricedLineItem {
  product: Product;
  quantity: number;
  unitPriceEur: number;
  lineSubtotalEur: number;
  fullSetDiscountEur: number;
  lineNetEur: number;
  pfuEur: number;
  logistics: LogisticsAvailability;
}

export interface PromoResult {
  code: string;
  valid: boolean;
  label: string;
  discountEur: number;
  reason?: string;
}

export interface OrderCalculation {
  lines: PricedLineItem[];
  totalQuantity: number;
  totalTires: number;
  totalFromItalia: number;
  totalFromCina: number;
  hasSplitOrder: boolean;
  hasChinaImport: boolean;
  grossSubtotalEur: number;
  fullSetDiscountTotalEur: number;
  subtotalAfterSetDiscountEur: number;
  promo: PromoResult | null;
  pfuTotalEur: number;
  shippingEur: number;
  freeShippingRemainingEur: number;
  grandTotalEur: number;
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function evaluatePromoCode(
  rawCode: string | undefined,
  subtotalAfterSetDiscountEur: number
): PromoResult | null {
  if (!rawCode || !rawCode.trim()) return null;
  const code = rawCode.trim().toUpperCase();

  if (code === "BENVENUTO15") {
    if (subtotalAfterSetDiscountEur >= 150) {
      return {
        code,
        valid: true,
        label: "Codice BENVENUTO15 (-€15,00)",
        discountEur: 15,
      };
    }
    return {
      code,
      valid: false,
      label: "Codice BENVENUTO15",
      discountEur: 0,
      reason: "Valido su un ordine minimo di €150,00",
    };
  }

  if (code === "STORE101") {
    const discount = roundMoney(subtotalAfterSetDiscountEur * 0.05);
    return {
      code,
      valid: true,
      label: "Codice STORE101 (-5%)",
      discountEur: discount,
    };
  }

  return {
    code,
    valid: false,
    label: `Codice ${code}`,
    discountEur: 0,
    reason: "Codice promozionale non valido o scaduto",
  };
}

/**
 * Calcolo deterministico del carrello e della ripartizione logistica Italia/Cina.
 * Sul server viene eseguito esclusivamente a partire dal catalogo autorevole.
 */
export function calculateOrder(
  items: CartItemInput[],
  promoCode?: string,
  catalog: Product[] = PRODUCTS
): OrderCalculation {
  const byId = new Map<string, Product>();
  for (const p of catalog) {
    byId.set(p.id, p);
  }

  const lines: PricedLineItem[] = [];

  for (const item of items) {
    const product = byId.get(item.productId);
    if (!product) continue;
    const totalAvail = product.stockItalia + product.stockCina;
    if (!product.inStock || totalAvail <= 0) continue;

    const qty = Math.max(1, Math.min(20, Math.floor(item.quantity)));
    const logistics = evaluateProductLogistics(
      product.stockItalia,
      product.stockCina,
      qty
    );

    const lineSubtotalEur = roundMoney(product.priceEur * qty);
    const qualifiesSetDiscount = product.isTire && qty >= FULL_SET_MIN_QTY;
    const fullSetDiscountEur = qualifiesSetDiscount
      ? roundMoney(lineSubtotalEur * FULL_SET_DISCOUNT_RATE)
      : 0;
    const lineNetEur = roundMoney(lineSubtotalEur - fullSetDiscountEur);
    const pfuEur = product.isTire ? roundMoney(PFU_FEE_PER_TIRE_EUR * qty) : 0;

    lines.push({
      product,
      quantity: qty,
      unitPriceEur: product.priceEur,
      lineSubtotalEur,
      fullSetDiscountEur,
      lineNetEur,
      pfuEur,
      logistics,
    });
  }

  const totalQuantity = lines.reduce((sum, l) => sum + l.quantity, 0);
  const totalTires = lines.reduce(
    (sum, l) => sum + (l.product.isTire ? l.quantity : 0),
    0
  );
  const totalFromItalia = lines.reduce(
    (sum, l) => sum + l.logistics.fromItalia,
    0
  );
  const totalFromCina = lines.reduce((sum, l) => sum + l.logistics.fromCina, 0);
  const hasSplitOrder =
    (totalFromItalia > 0 && totalFromCina > 0) ||
    lines.some((l) => l.logistics.type === "split");
  const hasChinaImport = totalFromCina > 0;

  const grossSubtotalEur = roundMoney(
    lines.reduce((sum, l) => sum + l.lineSubtotalEur, 0)
  );
  const fullSetDiscountTotalEur = roundMoney(
    lines.reduce((sum, l) => sum + l.fullSetDiscountEur, 0)
  );
  const subtotalAfterSetDiscountEur = roundMoney(
    grossSubtotalEur - fullSetDiscountTotalEur
  );
  const promo = evaluatePromoCode(promoCode, subtotalAfterSetDiscountEur);
  const promoDiscountEur = promo?.valid ? promo.discountEur : 0;

  const netMerchandiseEur = Math.max(
    0,
    roundMoney(subtotalAfterSetDiscountEur - promoDiscountEur)
  );
  const pfuTotalEur = roundMoney(lines.reduce((sum, l) => sum + l.pfuEur, 0));

  const qualifiesFreeShipping =
    lines.length === 0 || netMerchandiseEur >= FREE_SHIPPING_THRESHOLD_EUR;
  const shippingEur =
    lines.length === 0 || qualifiesFreeShipping ? 0 : STANDARD_SHIPPING_EUR;
  const freeShippingRemainingEur = qualifiesFreeShipping
    ? 0
    : roundMoney(FREE_SHIPPING_THRESHOLD_EUR - netMerchandiseEur);

  const grandTotalEur = roundMoney(netMerchandiseEur + pfuTotalEur + shippingEur);

  return {
    lines,
    totalQuantity,
    totalTires,
    totalFromItalia,
    totalFromCina,
    hasSplitOrder,
    hasChinaImport,
    grossSubtotalEur,
    fullSetDiscountTotalEur,
    subtotalAfterSetDiscountEur,
    promo,
    pfuTotalEur,
    shippingEur,
    freeShippingRemainingEur,
    grandTotalEur,
  };
}

export function eurToCents(eur: number): number {
  return Math.round(eur * 100);
}
