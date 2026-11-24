import type { Product } from "@/data/products";

export interface ParsedTireSize {
  digits: string;
  width: string;
  aspectRatio: string;
  diameter: string;
  isComplete: boolean;
  standardLabel: string | null;
}

const MAX_TIRE_DIGITS = 7; // WWW (3) + AA (2) + DD (2)
const TRAILING_SEPARATOR_RE = /[\s/\-rR]$/;

/**
 * Formatta l'input della misura pneumatico lasciando digitare solo i numeri
 * (es. "245 40 18" o "2454018" -> "245/40/18") con inserimento automatico degli "/".
 * Gestisce anche Backspace fluido sugli "/" automatici e incolla da formato standard ("245/40R18").
 */
export function formatTireSizeInput(raw: string, prevDisplay = ""): string {
  const prevDigits = prevDisplay.replace(/\D/g, "").slice(0, MAX_TIRE_DIGITS);
  let digits = raw.replace(/\D/g, "").slice(0, MAX_TIRE_DIGITS);
  const isDeleting = raw.length < prevDisplay.length;

  // Se l'utente preme Backspace sullo "/" inserito automaticamente a fine stringa,
  // rimuove anche la cifra precedente così 1 Backspace elimina sempre 1 cifra.
  if (
    isDeleting &&
    prevDisplay.endsWith("/") &&
    raw === prevDisplay.slice(0, -1) &&
    digits === prevDigits &&
    digits.length > 0
  ) {
    digits = digits.slice(0, -1);
  }

  if (digits.length === 0) {
    return "";
  }

  const addedDigits = digits.length > prevDigits.length;
  const typedSeparator = !isDeleting && TRAILING_SEPARATOR_RE.test(raw);
  const keepExistingSlash =
    !isDeleting && prevDisplay.endsWith("/") && digits === prevDigits;
  const shouldAutoSlash = addedDigits || typedSeparator || keepExistingSlash;

  if (digits.length < 3) {
    return digits;
  }

  const width = digits.slice(0, 3);
  if (digits.length === 3) {
    return shouldAutoSlash ? `${width}/` : width;
  }

  const aspectRatio = digits.slice(3, 5);
  if (digits.length === 4) {
    return `${width}/${aspectRatio}`;
  }

  if (digits.length === 5) {
    return shouldAutoSlash
      ? `${width}/${aspectRatio}/`
      : `${width}/${aspectRatio}`;
  }

  const diameter = digits.slice(5, 7);
  return `${width}/${aspectRatio}/${diameter}`;
}

export function parseTireSize(input: string): ParsedTireSize {
  const digits = input.replace(/\D/g, "").slice(0, MAX_TIRE_DIGITS);
  const width = digits.slice(0, 3);
  const aspectRatio = digits.slice(3, 5);
  const diameter = digits.slice(5, 7);
  const isComplete = digits.length === MAX_TIRE_DIGITS;

  return {
    digits,
    width,
    aspectRatio,
    diameter,
    isComplete,
    standardLabel: isComplete ? `${width}/${aspectRatio}R${diameter}` : null,
  };
}

export function matchesTireSize(
  product: Pick<Product, "isTire" | "width" | "aspectRatio" | "diameter">,
  tireSizeInput: string
): boolean {
  const parsed = parseTireSize(tireSizeInput);
  if (parsed.digits.length === 0) {
    return true;
  }

  if (!product.isTire) {
    return false;
  }

  const prodWidth = String(product.width ?? "");
  if (parsed.width.length > 0 && !prodWidth.startsWith(parsed.width)) {
    return false;
  }

  const prodRatio = String(product.aspectRatio ?? "");
  if (
    parsed.aspectRatio.length > 0 &&
    !prodRatio.startsWith(parsed.aspectRatio)
  ) {
    return false;
  }

  const prodDiamDigits = (product.diameter ?? "").replace(/\D/g, "");
  if (
    parsed.diameter.length > 0 &&
    !prodDiamDigits.startsWith(parsed.diameter)
  ) {
    return false;
  }

  return true;
}
