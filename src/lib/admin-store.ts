import crypto from "crypto";
import fs from "fs";
import path from "path";
import { PRODUCTS, type Product } from "@/data/products";
import type {
  AdminAuditEntry,
  AdminOrder,
  AdminOrderLine,
  AdminOrderStatus,
  CrmCustomer,
  CsvDryRunResult,
  CsvImportAuditEntry,
  DailyAnalyticsPoint,
  OrderLogisticsOrigin,
  SplitOrderPreference,
  StoreDatabase,
} from "@/lib/admin-types";
import {
  parseAndPreviewCsv,
  TIRE_SIZE_REGEX,
  type ValidatedCsvRow,
} from "@/lib/csv-security";
import { sanitizeText } from "@/lib/sanitize";

// Versione 2: database pulito senza dati fittizi o inventati
const DB_VERSION = 2;

function resolveDbPath(): string {
  if (process.env.VERCEL === "1" || process.env.NODE_ENV === "production") {
    return path.join("/tmp", "store101-admin-db-v2.json");
  }
  return path.join(process.cwd(), ".data", "store101-admin-db-v2.json");
}

function formatDateYmd(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDayLabel(date: Date): string {
  return date.toLocaleDateString("it-IT", { day: "2-digit", month: "short" });
}

/**
 * Inizializza il database completamente vuoto per ordini, CRM, analytics,
 * ricerche, storico CSV e audit log: verranno mostrati esclusivamente dati reali.
 */
function buildCleanDatabase(): StoreDatabase {
  return {
    version: DB_VERSION,
    products: structuredClone(PRODUCTS),
    orders: [],
    customers: [],
    dailyAnalytics: [],
    searchDemand: [],
    visitorHashesByDay: {},
    csvImports: [],
    adminAuditLogs: [],
    processedStripeEventIds: [],
    lowStockThreshold: 4,
  };
}

const globalDb = globalThis as unknown as {
  store101AdminDb?: StoreDatabase;
};

function loadDbFromDisk(): StoreDatabase | null {
  try {
    const filePath = resolveDbPath();
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw) as StoreDatabase;
    if (
      parsed &&
      parsed.version === DB_VERSION &&
      Array.isArray(parsed.products)
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

function saveDbToDisk(db: StoreDatabase): void {
  try {
    const filePath = resolveDbPath();
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(db, null, 2), "utf8");
  } catch (err) {
    console.warn("[STORE101 DB] Persistenza disco non riuscita:", err);
  }
}

export function getStoreDb(): StoreDatabase {
  if (!globalDb.store101AdminDb || globalDb.store101AdminDb.version !== DB_VERSION) {
    globalDb.store101AdminDb = loadDbFromDisk() ?? buildCleanDatabase();
    saveDbToDisk(globalDb.store101AdminDb);
  }
  return globalDb.store101AdminDb;
}

export function saveStoreDb(db: StoreDatabase): void {
  globalDb.store101AdminDb = db;
  saveDbToDisk(db);
}

export function getLiveProducts(): Product[] {
  return getStoreDb().products;
}

export function getLiveProductById(id: string): Product | undefined {
  return getStoreDb().products.find((p) => p.id === id);
}

export function getLiveProductBySlug(slug: string): Product | undefined {
  return getStoreDb().products.find((p) => p.slug === slug);
}

export function appendAdminAuditLog(
  entry: Omit<AdminAuditEntry, "id" | "createdAt">
): void {
  const db = getStoreDb();
  db.adminAuditLogs.unshift({
    ...entry,
    id: `audit_${crypto.randomBytes(6).toString("hex")}`,
    createdAt: new Date().toISOString(),
  });
  db.adminAuditLogs = db.adminAuditLogs.slice(0, 200);
  saveStoreDb(db);
}

function ensureTodayAnalyticsPoint(db: StoreDatabase): DailyAnalyticsPoint {
  const now = new Date();
  const todayStr = formatDateYmd(now);
  let point = db.dailyAnalytics.find((p) => p.date === todayStr);
  if (!point) {
    point = {
      date: todayStr,
      label: formatDayLabel(now),
      uniqueVisits: 0,
      pageViews: 0,
      cartAdds: 0,
      checkoutStarts: 0,
      paidOrdersCount: 0,
      stripeUnitsSold: 0,
      csvUnitsSold: 0,
      unitsItalia: 0,
      unitsCina: 0,
      revenueEur: 0,
      marginEur: 0,
    };
    db.dailyAnalytics.push(point);
    db.dailyAnalytics = db.dailyAnalytics.slice(-90);
  }
  return point;
}

/**
 * Analytics cookieless GDPR-compliant:
 * hash giornaliero SHA-256 non reversibile di IP + User-Agent + data + sale server.
 * Nessun dato personale salvato, nessun cookie impostato.
 */
export function recordCookielessAnalyticsEvent(params: {
  type: "pageview" | "search" | "cart_add" | "checkout_start";
  ip: string;
  userAgent: string;
  sizeQuery?: string;
}): void {
  const db = getStoreDb();
  const today = formatDateYmd(new Date());
  const salt = process.env.ADMIN_SESSION_SECRET || "store101-cookieless-salt";
  const visitorHash = crypto
    .createHash("sha256")
    .update(`${params.ip}|${params.userAgent}|${today}|${salt}`)
    .digest("hex")
    .slice(0, 20);

  const point = ensureTodayAnalyticsPoint(db);

  if (params.type === "pageview") {
    point.pageViews += 1;
    const hashes = db.visitorHashesByDay[today] ?? [];
    if (!hashes.includes(visitorHash)) {
      hashes.push(visitorHash);
      db.visitorHashesByDay[today] = hashes;
      point.uniqueVisits += 1;
    }
    // Mantieni solo gli hash del giorno corrente (minimizzazione GDPR)
    for (const dayKey of Object.keys(db.visitorHashesByDay)) {
      if (dayKey !== today) {
        delete db.visitorHashesByDay[dayKey];
      }
    }
  } else if (params.type === "cart_add") {
    point.cartAdds += 1;
  } else if (params.type === "checkout_start") {
    point.checkoutStarts += 1;
  } else if (params.type === "search" && params.sizeQuery) {
    const cleanQuery = sanitizeText(params.sizeQuery, 30)
      .toUpperCase()
      .replace(/\s+/g, "");
    if (cleanQuery.length >= 3) {
      const existing = db.searchDemand.find((s) => s.sizeQuery === cleanQuery);
      if (existing) {
        existing.searches += 1;
        existing.lastSearchedAt = new Date().toISOString();
      } else {
        db.searchDemand.push({
          sizeQuery: cleanQuery,
          searches: 1,
          lastSearchedAt: new Date().toISOString(),
        });
      }
      db.searchDemand.sort((a, b) => b.searches - a.searches);
      db.searchDemand = db.searchDemand.slice(0, 40);
    }
  }

  saveStoreDb(db);
}

function buildProductFromCsvRow(
  row: ValidatedCsvRow,
  nextIndex: number
): Product {
  const match = TIRE_SIZE_REGEX.exec(row.misura);
  const width = match?.[1] ? Number(match[1]) : undefined;
  const aspectRatio = match?.[2] ? Number(match[2]) : undefined;
  const diameter = match?.[3] ? `R${match[3]}` : undefined;

  const seasonLabel =
    row.stagione === "estivi"
      ? "Estivo"
      : row.stagione === "invernali"
        ? "Invernale"
        : "4 Stagioni";
  const image =
    row.stagione === "estivi"
      ? "/images/tire-summer.jpg"
      : row.stagione === "invernali"
        ? "/images/tire-winter.jpg"
        : "/images/tire-allseason.jpg";

  const slugBase = `${row.brand}-${row.modello}-${row.misura}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const costEur =
    row.costo_acquisto !== null
      ? row.costo_acquisto
      : Math.round(row.prezzo_vendita * 0.7 * 100) / 100;

  return {
    id: `prod_csv_${row.sku.toLowerCase().replace(/[^a-z0-9_]/g, "_")}`,
    sku: row.sku,
    badgeNumber: String(nextIndex).padStart(2, "0"),
    slug: slugBase,
    brand: row.brand,
    model: row.modello,
    season: row.stagione,
    seasonLabel,
    vehicle: "auto",
    vehicleLabel: "Auto",
    width,
    aspectRatio,
    diameter,
    sizeLabel: row.misura,
    loadSpeedIndex: "94Y XL",
    priceEur: row.prezzo_vendita,
    costEur,
    stockItalia: row.stock_italia,
    stockCina: row.stock_cina,
    rating: 5.0,
    reviewCount: 0,
    image,
    isTire: true,
    featured: false,
    inStock: row.stock_italia + row.stock_cina > 0,
    dotGuarantee: "DOT 2026 (< 12 mesi)",
    shippingBadge:
      row.stock_italia > 0
        ? "IT 4-7 gg"
        : row.stock_cina > 0
          ? "Import 5-15 gg"
          : "Esaurito",
    euLabel: {
      fuel: "C",
      wetGrip: "A",
      noiseDb: 70,
      noiseClass: "B",
    },
    shortDescription: `${row.brand} ${row.modello} ${row.misura} — sincronizzato da catalogo CSV STORE 101.`,
    description: `Pneumatico ${seasonLabel.toLowerCase()} ${row.brand} ${row.modello} misura ${row.misura}, disponibile tramite la rete logistica integrata Italia / Import di STORE 101.`,
    highlights: [
      "Sincronizzato in tempo reale tramite gestionale STORE 101",
      "Garanzia legale 24 mesi e DOT recente certificato",
      "Sconto automatico 5% acquistando il treno completo da 4 gomme",
    ],
  };
}

export function previewEveningCsv(
  csvText: string,
  filename: string
): CsvDryRunResult {
  const db = getStoreDb();
  const { preview } = parseAndPreviewCsv(csvText, filename, db.products);
  return preview;
}

export function applyEveningCsv(params: {
  csvText: string;
  filename: string;
  actorEmail: string;
  ip: string;
}): { preview: CsvDryRunResult; importEntry: CsvImportAuditEntry } {
  const db = getStoreDb();
  const previousProductsSnapshot = structuredClone(db.products);
  const { preview, validRows } = parseAndPreviewCsv(
    params.csvText,
    params.filename,
    db.products
  );

  const bySku = new Map<string, Product>();
  for (const p of db.products) {
    bySku.set(p.sku.toUpperCase(), p);
  }

  let totalSoldFromCsv = 0;
  let soldItalia = 0;
  let soldCina = 0;
  let revenueDelta = 0;
  let marginDelta = 0;

  for (const row of validRows) {
    const existing = bySku.get(row.sku.toUpperCase());
    if (existing) {
      const oldIt = existing.stockItalia;
      const oldCn = existing.stockCina;
      const itDelta = Math.max(0, oldIt - row.stock_italia);
      const cnDelta = Math.max(0, oldCn - row.stock_cina);
      const detectedSold =
        row.unita_vendute_oggi !== null
          ? row.unita_vendute_oggi
          : itDelta + cnDelta;

      existing.brand = row.brand;
      existing.model = row.modello;
      existing.sizeLabel = row.misura;
      existing.stockItalia = row.stock_italia;
      existing.stockCina = row.stock_cina;
      existing.priceEur = row.prezzo_vendita;
      if (row.costo_acquisto !== null) {
        existing.costEur = row.costo_acquisto;
      }
      existing.inStock = row.stock_italia + row.stock_cina > 0;
      existing.shippingBadge =
        row.stock_italia > 0
          ? "IT 4-7 gg"
          : row.stock_cina > 0
            ? "Import 5-15 gg"
            : "Esaurito";

      if (detectedSold > 0) {
        totalSoldFromCsv += detectedSold;
        const fromIt = Math.min(detectedSold, itDelta > 0 ? itDelta : detectedSold);
        soldItalia += fromIt;
        soldCina += Math.max(0, detectedSold - fromIt);
        revenueDelta += detectedSold * existing.priceEur;
        marginDelta +=
          detectedSold * Math.max(0, existing.priceEur - existing.costEur);
      }
    } else {
      const created = buildProductFromCsvRow(row, db.products.length + 1);
      db.products.push(created);
      bySku.set(created.sku.toUpperCase(), created);
    }
  }

  if (totalSoldFromCsv > 0) {
    const today = ensureTodayAnalyticsPoint(db);
    today.csvUnitsSold += totalSoldFromCsv;
    today.unitsItalia += soldItalia;
    today.unitsCina += soldCina;
    today.revenueEur =
      Math.round((today.revenueEur + revenueDelta) * 100) / 100;
    today.marginEur = Math.round((today.marginEur + marginDelta) * 100) / 100;
  }

  const importEntry: CsvImportAuditEntry = {
    id: `csv_${crypto.randomBytes(6).toString("hex")}`,
    filename: preview.filename,
    uploadedBy: params.actorEmail,
    uploadedAt: new Date().toISOString(),
    rowsProcessed: preview.totalRows,
    updatedCount: preview.updatedCount,
    createdCount: preview.createdCount,
    errorCount: preview.errorCount,
    detectedUnitsSold: preview.totalDetectedUnitsSold,
    rolledBack: false,
    rolledBackAt: null,
    previousProductsSnapshot,
  };

  db.csvImports.unshift(importEntry);
  db.csvImports = db.csvImports.slice(0, 30);

  saveStoreDb(db);

  appendAdminAuditLog({
    actorEmail: params.actorEmail,
    action: "CSV_APPLY",
    target: preview.filename,
    details: `Aggiornati ${preview.updatedCount} SKU, creati ${preview.createdCount} SKU, errori ${preview.errorCount}, vendite rilevate ${preview.totalDetectedUnitsSold}.`,
    ip: params.ip,
  });

  return { preview, importEntry };
}

export function rollbackCsvImport(params: {
  importId: string;
  actorEmail: string;
  ip: string;
}): CsvImportAuditEntry | null {
  const db = getStoreDb();
  const entry = db.csvImports.find((e) => e.id === params.importId);
  if (!entry || entry.rolledBack) return null;

  db.products = structuredClone(entry.previousProductsSnapshot);
  entry.rolledBack = true;
  entry.rolledBackAt = new Date().toISOString();
  saveStoreDb(db);

  appendAdminAuditLog({
    actorEmail: params.actorEmail,
    action: "CSV_ROLLBACK",
    target: entry.filename,
    details: `Ripristinata versione stock precedente al caricamento ${entry.id}.`,
    ip: params.ip,
  });

  return entry;
}

/**
 * Registrazione idempotente ordine Stripe + scarico automatico giacenze IT -> CN + CRM sync.
 */
export function recordStripePaidOrderIdempotent(params: {
  stripeEventId: string;
  stripeSessionId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  shippingAddress: string;
  deliveryMode: "home" | "partner-workshop";
  splitPreference: SplitOrderPreference | null;
  items: { productId: string; quantity: number }[];
  totalEur: number;
  pfuTotalEur: number;
  shippingEur: number;
}): { duplicated: boolean; order?: AdminOrder } {
  const db = getStoreDb();

  if (db.processedStripeEventIds.includes(params.stripeEventId)) {
    return { duplicated: true };
  }

  db.processedStripeEventIds.push(params.stripeEventId);
  db.processedStripeEventIds = db.processedStripeEventIds.slice(-500);

  const lines: AdminOrderLine[] = [];
  let totalUnits = 0;
  let unitsItalia = 0;
  let unitsCina = 0;
  let estimatedMarginEur = 0;

  for (const item of params.items) {
    const product = db.products.find((p) => p.id === item.productId);
    if (!product) continue;

    const qty = Math.max(1, item.quantity);
    const takeIt = Math.min(product.stockItalia, qty);
    const remaining = qty - takeIt;
    const takeCn = Math.min(product.stockCina, remaining);

    product.stockItalia = Math.max(0, product.stockItalia - takeIt);
    product.stockCina = Math.max(0, product.stockCina - takeCn);
    product.inStock = product.stockItalia + product.stockCina > 0;
    product.shippingBadge =
      product.stockItalia > 0
        ? "IT 4-7 gg"
        : product.stockCina > 0
          ? "Import 5-15 gg"
          : "Esaurito";

    lines.push({
      productId: product.id,
      sku: product.sku,
      brand: product.brand,
      model: product.model,
      sizeLabel: product.sizeLabel,
      quantity: qty,
      qtyItalia: takeIt,
      qtyCina: takeCn,
      unitPriceEur: product.priceEur,
      unitCostEur: product.costEur,
    });

    totalUnits += qty;
    unitsItalia += takeIt;
    unitsCina += takeCn;
    estimatedMarginEur +=
      Math.max(0, product.priceEur - product.costEur) * qty;
  }

  const logisticsOrigin: OrderLogisticsOrigin =
    unitsItalia > 0 && unitsCina > 0
      ? "split"
      : unitsCina > 0
        ? "cina"
        : "italia";

  const nowIso = new Date().toISOString();

  const emailLower = params.customerEmail.trim().toLowerCase();
  let customer = db.customers.find(
    (c) => !c.anonymized && c.email.toLowerCase() === emailLower
  );
  if (!customer) {
    customer = {
      id: `cust_${crypto.randomBytes(4).toString("hex")}`,
      fullName: sanitizeText(params.customerName || "Cliente STORE 101", 90),
      email: emailLower,
      phone: sanitizeText(params.customerPhone || "", 32),
      vehicleModel: "",
      licensePlate: "",
      tireSize: lines[0]?.sizeLabel ?? "",
      ordersCount: 1,
      lifetimeValueEur: params.totalEur,
      internalNotes: "",
      privacyConsentAt: nowIso,
      anonymized: false,
      anonymizedAt: null,
      lastOrderAt: nowIso,
      createdAt: nowIso,
    };
    db.customers.unshift(customer);
  } else {
    customer.ordersCount += 1;
    customer.lifetimeValueEur =
      Math.round((customer.lifetimeValueEur + params.totalEur) * 100) / 100;
    customer.lastOrderAt = nowIso;
    if (params.customerPhone && !customer.phone) {
      customer.phone = sanitizeText(params.customerPhone, 32);
    }
  }

  const nextSeq = db.orders.length + 1;
  const order: AdminOrder = {
    id: `ord_${crypto.randomBytes(5).toString("hex")}`,
    orderNumber: `S101-${new Date().getFullYear()}-${String(nextSeq).padStart(4, "0")}`,
    stripeSessionId: params.stripeSessionId,
    channel: "stripe",
    customerId: customer.id,
    customerName: customer.fullName,
    customerEmail: customer.email,
    customerPhone: customer.phone || null,
    status: "pagato",
    logisticsOrigin,
    splitPreference:
      logisticsOrigin === "split"
        ? params.splitPreference ?? "split_shipments"
        : null,
    deliveryMode: params.deliveryMode,
    shippingAddress: sanitizeText(params.shippingAddress || "Italia", 200),
    carrier: null,
    trackingCode: null,
    trackingEmailSentAt: null,
    lines,
    totalUnits,
    unitsItalia,
    unitsCina,
    subtotalEur: Math.max(
      0,
      params.totalEur - params.pfuTotalEur - params.shippingEur
    ),
    pfuTotalEur: params.pfuTotalEur,
    shippingEur: params.shippingEur,
    totalEur: params.totalEur,
    estimatedMarginEur: Math.round(estimatedMarginEur * 100) / 100,
    privacyConsentAt: nowIso,
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  db.orders.unshift(order);

  const today = ensureTodayAnalyticsPoint(db);
  today.paidOrdersCount += 1;
  today.stripeUnitsSold += totalUnits;
  today.unitsItalia += unitsItalia;
  today.unitsCina += unitsCina;
  today.revenueEur =
    Math.round((today.revenueEur + params.totalEur) * 100) / 100;
  today.marginEur =
    Math.round((today.marginEur + estimatedMarginEur) * 100) / 100;

  saveStoreDb(db);
  return { duplicated: false, order };
}

export function updateOrderLogistics(params: {
  orderId: string;
  status: AdminOrderStatus;
  carrier?: string | null;
  trackingCode?: string | null;
  actorEmail: string;
  ip: string;
}): { order: AdminOrder; trackingEmailTriggered: boolean } | null {
  const db = getStoreDb();
  const order = db.orders.find((o) => o.id === params.orderId);
  if (!order) return null;

  const hadTracking = Boolean(order.trackingCode);
  order.status = params.status;
  if (params.carrier !== undefined) {
    order.carrier = params.carrier ? sanitizeText(params.carrier, 60) : null;
  }
  if (params.trackingCode !== undefined) {
    order.trackingCode = params.trackingCode
      ? sanitizeText(params.trackingCode, 80)
      : null;
  }

  let trackingEmailTriggered = false;
  if (order.trackingCode && (!hadTracking || params.status === "spedito")) {
    order.trackingEmailSentAt = new Date().toISOString();
    trackingEmailTriggered = true;
  }

  order.updatedAt = new Date().toISOString();
  saveStoreDb(db);

  appendAdminAuditLog({
    actorEmail: params.actorEmail,
    action: "ORDER_UPDATE",
    target: order.orderNumber,
    details: `Stato: ${order.status}${order.trackingCode ? ` • Tracking: ${order.carrier ?? ""} ${order.trackingCode}` : ""}`,
    ip: params.ip,
  });

  return { order, trackingEmailTriggered };
}

export function updateCustomerDetails(params: {
  customerId: string;
  vehicleModel?: string;
  licensePlate?: string;
  tireSize?: string;
  internalNotes?: string;
  actorEmail: string;
  ip: string;
}): CrmCustomer | null {
  const db = getStoreDb();
  const customer = db.customers.find((c) => c.id === params.customerId);
  if (!customer || customer.anonymized) return null;

  if (params.vehicleModel !== undefined) {
    customer.vehicleModel = sanitizeText(params.vehicleModel, 100);
  }
  if (params.licensePlate !== undefined) {
    customer.licensePlate = sanitizeText(params.licensePlate, 16).toUpperCase();
  }
  if (params.tireSize !== undefined) {
    customer.tireSize = sanitizeText(params.tireSize, 24).toUpperCase();
  }
  if (params.internalNotes !== undefined) {
    customer.internalNotes = sanitizeText(params.internalNotes, 500);
  }

  saveStoreDb(db);
  return customer;
}

/**
 * Diritto all'Oblio Art. 17 GDPR:
 * Anonimizza tutti i dati personali identificativi mantenendo intatti
 * i totali e le date degli ordini per obbligo fiscale italiano (10 anni).
 */
export function anonymizeCustomerGdpr(params: {
  customerId: string;
  actorEmail: string;
  ip: string;
}): CrmCustomer | null {
  const db = getStoreDb();
  const customer = db.customers.find((c) => c.id === params.customerId);
  if (!customer) return null;

  const anonTag = `GDPR-${customer.id.slice(-4).toUpperCase()}`;
  const nowIso = new Date().toISOString();

  customer.fullName = `Utente Anonimizzato (${anonTag})`;
  customer.email = `anonimizzato-${anonTag.toLowerCase()}@gdpr.invalid`;
  customer.phone = "";
  customer.licensePlate = "";
  customer.vehicleModel = "Dato rimosso (Art. 17 GDPR)";
  customer.internalNotes =
    "Dati personali anonimizzati ai sensi dell'Art. 17 GDPR. Storico fiscale ordini preservato per 10 anni.";
  customer.anonymized = true;
  customer.anonymizedAt = nowIso;

  for (const order of db.orders) {
    if (order.customerId === customer.id) {
      order.customerName = customer.fullName;
      order.customerEmail = customer.email;
      order.customerPhone = null;
      order.shippingAddress = "Indirizzo rimosso (Art. 17 GDPR)";
    }
  }

  saveStoreDb(db);

  appendAdminAuditLog({
    actorEmail: params.actorEmail,
    action: "CRM_ANONYMIZE_GDPR",
    target: customer.id,
    details: `Anonimizzazione Art. 17 GDPR eseguita su cliente ${anonTag}; dati fiscali ordini conservati.`,
    ip: params.ip,
  });

  return customer;
}

export function updateManualProductStock(params: {
  productId: string;
  stockItalia: number;
  stockCina: number;
  priceEur?: number;
  costEur?: number;
  actorEmail: string;
  ip: string;
}): Product | null {
  const db = getStoreDb();
  const product = db.products.find((p) => p.id === params.productId);
  if (!product) return null;

  product.stockItalia = Math.max(0, Math.floor(params.stockItalia));
  product.stockCina = Math.max(0, Math.floor(params.stockCina));
  if (typeof params.priceEur === "number" && params.priceEur > 0) {
    product.priceEur = Math.round(params.priceEur * 100) / 100;
  }
  if (typeof params.costEur === "number" && params.costEur >= 0) {
    product.costEur = Math.round(params.costEur * 100) / 100;
  }
  product.inStock = product.stockItalia + product.stockCina > 0;
  product.shippingBadge =
    product.stockItalia > 0
      ? "IT 4-7 gg"
      : product.stockCina > 0
        ? "Import 5-15 gg"
        : "Esaurito";

  saveStoreDb(db);

  appendAdminAuditLog({
    actorEmail: params.actorEmail,
    action: "STOCK_MANUAL_EDIT",
    target: product.sku,
    details: `Stock manuale: IT=${product.stockItalia}, CN=${product.stockCina}, Prezzo=€${product.priceEur.toFixed(2)}`,
    ip: params.ip,
  });

  return product;
}
