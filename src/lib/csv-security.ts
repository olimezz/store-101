import Papa from "papaparse";
import { z } from "zod";
import type { Product } from "@/data/products";
import type { CsvDryRunResult, CsvPreviewRowDiff } from "@/lib/admin-types";
import { sanitizeText } from "@/lib/sanitize";

export const MAX_CSV_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

const ALLOWED_MIME_TYPES = new Set([
  "text/csv",
  "application/csv",
  "application/vnd.ms-excel",
  "text/plain",
  "",
]);

/**
 * Protezione contro CSV Formula Injection (OWASP):
 * rimuove/neutralizza caratteri iniziali pericolosi (=, +, -, @, tab, CR)
 * e tag HTML prima del salvataggio o della riesportazione.
 */
export function sanitizeCsvCell(raw: unknown, maxLength = 120): string {
  const str = String(raw ?? "").trim();
  const cleaned = sanitizeText(str, maxLength);
  return cleaned.replace(/^[=+\-@\t\r]+/, "").trim();
}

/**
 * Escape sicuro per celle in esportazione CSV (previene formula injection in Excel/Sheets).
 */
export function escapeCsvExportCell(raw: unknown): string {
  const value = String(raw ?? "").replace(/\r?\n/g, " ");
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  if (/[",;]/.test(safe)) {
    return `"${safe.replace(/"/g, '""')}"`;
  }
  return safe;
}

export function validateCsvFileMeta(file: {
  name: string;
  size: number;
  type: string;
}): string | null {
  if (!file.name.toLowerCase().endsWith(".csv")) {
    return "Sono consentiti esclusivamente file con estensione .csv";
  }
  if (file.size <= 0) {
    return "Il file CSV è vuoto.";
  }
  if (file.size > MAX_CSV_SIZE_BYTES) {
    return "Il file supera il limite massimo di 10 MB.";
  }
  if (!ALLOWED_MIME_TYPES.has(file.type.toLowerCase())) {
    return `Tipo MIME non consentito (${file.type}). Carica un file CSV valido.`;
  }
  return null;
}

const HEADER_ALIASES: Record<string, string> = {
  sku: "sku",
  codice: "sku",
  ean: "sku",
  codice_ean: "sku",
  product_sku: "sku",

  brand: "brand",
  marca: "brand",
  produttore: "brand",

  modello: "modello",
  model: "modello",
  nome: "modello",

  misura: "misura",
  size: "misura",
  dimensione: "misura",

  stagione: "stagione",
  season: "stagione",

  stock_italia: "stock_italia",
  giacenza_italia: "stock_italia",
  stock_it: "stock_italia",
  italia: "stock_italia",

  stock_cina: "stock_cina",
  giacenza_cina: "stock_cina",
  stock_cn: "stock_cina",
  cina: "stock_cina",

  prezzo_vendita: "prezzo_vendita",
  prezzo: "prezzo_vendita",
  price: "prezzo_vendita",

  costo_acquisto: "costo_acquisto",
  costo: "costo_acquisto",
  cost: "costo_acquisto",

  unita_vendute_oggi: "unita_vendute_oggi",
  vendute_oggi: "unita_vendute_oggi",
  units_sold: "unita_vendute_oggi",
};

function normalizeHeader(header: string): string {
  const key = header
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .replace(/[\s\-]+/g, "_");
  return HEADER_ALIASES[key] ?? key;
}

function parseLocaleNumber(val: unknown): number {
  const raw = String(val ?? "")
    .trim()
    .replace(/€/g, "")
    .replace(/\s+/g, "");
  if (!raw) return Number.NaN;
  // Supporta sia "289.99" sia "289,99"
  const normalized =
    raw.includes(",") && !raw.includes(".")
      ? raw.replace(",", ".")
      : raw.includes(",") && raw.includes(".")
        ? raw.replace(/\./g, "").replace(",", ".")
        : raw;
  return Number(normalized);
}

function normalizeSeason(
  raw: string
): "estivi" | "invernali" | "4-stagioni" | null {
  const s = raw.toLowerCase().replace(/[\s\-_]+/g, "");
  if (s === "estivo" || s === "estivi" || s === "summer") return "estivi";
  if (s === "invernale" || s === "invernali" || s === "winter")
    return "invernali";
  if (
    s === "4stagioni" ||
    s === "quattrostagioni" ||
    s === "allseason" ||
    s === "allweather"
  ) {
    return "4-stagioni";
  }
  return null;
}

export const TIRE_SIZE_REGEX = /^(\d{3})\/(\d{2})\s*R(\d{2})$/i;

export const csvNormalizedRowSchema = z.object({
  sku: z
    .string()
    .min(3, "SKU troppo corto (min 3 caratteri)")
    .max(40, "SKU troppo lungo")
    .regex(/^[A-Za-z0-9_-]+$/, "SKU contiene caratteri non validi"),
  brand: z.string().min(2, "Brand mancante").max(50),
  modello: z.string().min(2, "Modello mancante").max(90),
  misura: z
    .string()
    .regex(
      TIRE_SIZE_REGEX,
      "Misura non valida (formato richiesto es. 245/40R18)"
    ),
  stagione: z.enum(["estivi", "invernali", "4-stagioni"]),
  stock_italia: z
    .number({ invalid_type_error: "stock_italia deve essere un numero" })
    .int("stock_italia deve essere intero")
    .min(0, "stock_italia non può essere negativo")
    .max(50000),
  stock_cina: z
    .number({ invalid_type_error: "stock_cina deve essere un numero" })
    .int("stock_cina deve essere intero")
    .min(0, "stock_cina non può essere negativo")
    .max(100000),
  prezzo_vendita: z
    .number({ invalid_type_error: "prezzo_vendita non valido" })
    .positive("prezzo_vendita deve essere maggiore di 0")
    .max(5000),
  costo_acquisto: z
    .number()
    .min(0, "costo_acquisto non può essere negativo")
    .max(5000)
    .nullable(),
  unita_vendute_oggi: z.number().int().min(0).max(5000).nullable(),
});

export type ValidatedCsvRow = z.infer<typeof csvNormalizedRowSchema>;

export function parseAndPreviewCsv(
  csvText: string,
  filename: string,
  existingProducts: Product[]
): { preview: CsvDryRunResult; validRows: ValidatedCsvRow[] } {
  const parsed = Papa.parse<Record<string, unknown>>(csvText, {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: normalizeHeader,
  });

  const bySku = new Map<string, Product>();
  for (const p of existingProducts) {
    bySku.set(p.sku.toUpperCase(), p);
  }

  const rows: CsvPreviewRowDiff[] = [];
  const validRows: ValidatedCsvRow[] = [];

  let updatedCount = 0;
  let createdCount = 0;
  let errorCount = 0;
  let totalDetectedUnitsSold = 0;

  parsed.data.forEach((rawRow, idx) => {
    const rowNumber = idx + 2; // Riga 1 = intestazione

    const sku = sanitizeCsvCell(rawRow.sku, 40).toUpperCase();
    const brand = sanitizeCsvCell(rawRow.brand, 50).toUpperCase();
    const modello = sanitizeCsvCell(rawRow.modello, 90);
    const misuraClean = sanitizeCsvCell(rawRow.misura, 24)
      .toUpperCase()
      .replace(/\s+/g, "");
    const stagioneNorm = normalizeSeason(sanitizeCsvCell(rawRow.stagione, 24));

    const stockIt = parseLocaleNumber(rawRow.stock_italia);
    const stockCn = parseLocaleNumber(rawRow.stock_cina);
    const prezzo = parseLocaleNumber(rawRow.prezzo_vendita);

    const hasCost = String(rawRow.costo_acquisto ?? "").trim().length > 0;
    const costo = hasCost ? parseLocaleNumber(rawRow.costo_acquisto) : null;

    const hasSold = String(rawRow.unita_vendute_oggi ?? "").trim().length > 0;
    const venduteOggi = hasSold
      ? parseLocaleNumber(rawRow.unita_vendute_oggi)
      : null;

    const candidate = {
      sku,
      brand,
      modello,
      misura: misuraClean,
      stagione: stagioneNorm ?? "invalid",
      stock_italia: stockIt,
      stock_cina: stockCn,
      prezzo_vendita: prezzo,
      costo_acquisto: costo,
      unita_vendute_oggi: venduteOggi,
    };

    const result = csvNormalizedRowSchema.safeParse(candidate);
    const existing = bySku.get(sku);

    if (!result.success) {
      errorCount += 1;
      const errors = result.error.issues.map((issue) => {
        if (issue.path[0] === "stagione") {
          return "Stagione non valida (usa: estivo, invernale o 4stagioni)";
        }
        return issue.message;
      });
      rows.push({
        rowNumber,
        sku: sku || "(mancante)",
        brand: brand || "-",
        model: modello || "-",
        sizeLabel: misuraClean || "-",
        season: stagioneNorm ?? "estivi",
        action: "error",
        errors,
        oldStockItalia: existing?.stockItalia ?? null,
        newStockItalia: Number.isFinite(stockIt) ? stockIt : 0,
        oldStockCina: existing?.stockCina ?? null,
        newStockCina: Number.isFinite(stockCn) ? stockCn : 0,
        oldPriceEur: existing?.priceEur ?? null,
        newPriceEur: Number.isFinite(prezzo) ? prezzo : 0,
        newCostEur: costo !== null && Number.isFinite(costo) ? costo : null,
        detectedUnitsSold: 0,
        logisticsAfter: "out_of_stock",
      });
      return;
    }

    const valid = result.data;
    validRows.push(valid);

    let detectedSold = 0;
    if (valid.unita_vendute_oggi !== null) {
      detectedSold = valid.unita_vendute_oggi;
    } else if (existing) {
      const oldTotal = existing.stockItalia + existing.stockCina;
      const newTotal = valid.stock_italia + valid.stock_cina;
      if (oldTotal > newTotal) {
        detectedSold = oldTotal - newTotal;
      }
    }

    totalDetectedUnitsSold += detectedSold;

    const action = existing ? "update" : "create";
    if (action === "update") updatedCount += 1;
    else createdCount += 1;

    const logisticsAfter =
      valid.stock_italia > 0
        ? "italia"
        : valid.stock_cina > 0
          ? "cina"
          : "out_of_stock";

    rows.push({
      rowNumber,
      sku: valid.sku,
      brand: valid.brand,
      model: valid.modello,
      sizeLabel: valid.misura,
      season: valid.stagione,
      action,
      errors: [],
      oldStockItalia: existing?.stockItalia ?? null,
      newStockItalia: valid.stock_italia,
      oldStockCina: existing?.stockCina ?? null,
      newStockCina: valid.stock_cina,
      oldPriceEur: existing?.priceEur ?? null,
      newPriceEur: valid.prezzo_vendita,
      newCostEur: valid.costo_acquisto,
      detectedUnitsSold: detectedSold,
      logisticsAfter,
    });
  });

  return {
    preview: {
      filename: sanitizeCsvCell(filename, 120),
      totalRows: parsed.data.length,
      updatedCount,
      createdCount,
      errorCount,
      totalDetectedUnitsSold,
      rows,
    },
    validRows,
  };
}

export function buildSampleCsvTemplate(products: Product[]): string {
  const headers = [
    "sku",
    "brand",
    "modello",
    "misura",
    "stagione",
    "stock_italia",
    "stock_cina",
    "prezzo_vendita",
    "costo_acquisto",
    "unita_vendute_oggi",
  ];

  const sampleTires = products.filter((p) => p.isTire).slice(0, 5);
  const dataRows = sampleTires.map((p, idx) => {
    const seasonCsv =
      p.season === "estivi"
        ? "estivo"
        : p.season === "invernali"
          ? "invernale"
          : "4stagioni";
    // Simula leggera variazione serale per test immediato del diff
    const nextIt = idx === 0 ? Math.max(0, p.stockItalia - 4) : p.stockItalia;
    const nextCn = idx === 2 ? Math.max(0, p.stockCina - 2) : p.stockCina;
    return [
      p.sku,
      p.brand,
      p.model,
      p.sizeLabel,
      seasonCsv,
      String(nextIt),
      String(nextCn),
      p.priceEur.toFixed(2),
      p.costEur.toFixed(2),
      idx === 0 ? "4" : idx === 2 ? "2" : "0",
    ];
  });

  // Aggiungi 1 nuovo SKU di esempio per mostrare creazione nuovo prodotto
  dataRows.push([
    "HAN-VENTUS-2254517",
    "HANKOOK",
    "Ventus Prime 4",
    "225/45R17",
    "estivo",
    "16",
    "30",
    "118.90",
    "81.00",
    "0",
  ]);

  return [
    headers.join(","),
    ...dataRows.map((row) => row.map(escapeCsvExportCell).join(",")),
  ].join("\n");
}
