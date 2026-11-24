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
  SearchDemandItem,
  SplitOrderPreference,
  StoreDatabase,
} from "@/lib/admin-types";
import {
  parseAndPreviewCsv,
  TIRE_SIZE_REGEX,
  type ValidatedCsvRow,
} from "@/lib/csv-security";
import { sanitizeText } from "@/lib/sanitize";

const DB_VERSION = 1;

function resolveDbPath(): string {
  if (process.env.VERCEL === "1" || process.env.NODE_ENV === "production") {
    return path.join("/tmp", "store101-admin-db.json");
  }
  return path.join(process.cwd(), ".data", "store101-admin-db.json");
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

function buildSeedDatabase(): StoreDatabase {
  const now = new Date();
  const dailyAnalytics: DailyAnalyticsPoint[] = [];

  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const wave = Math.sin((30 - i) * 0.45);
    const weekendBoost = d.getDay() === 0 || d.getDay() === 6 ? 1.18 : 1.0;
    const uniqueVisits = Math.round((310 + wave * 65 + (29 - i) * 3.5) * weekendBoost);
    const pageViews = Math.round(uniqueVisits * 2.85);
    const cartAdds = Math.round(uniqueVisits * 0.14);
    const checkoutStarts = Math.round(cartAdds * 0.56);
    const stripeUnits = Math.max(4, Math.round((10 + wave * 4 + (29 - i) * 0.25) * weekendBoost));
    const csvUnits = Math.max(0, Math.round(4 + Math.cos(i * 0.7) * 3));
    const totalUnits = stripeUnits + csvUnits;
    const unitsItalia = Math.round(totalUnits * 0.68);
    const unitsCina = Math.max(0, totalUnits - unitsItalia);
    const revenueEur = Math.round(totalUnits * 212.5 * 100) / 100;
    const marginEur = Math.round(revenueEur * 0.285 * 100) / 100;

    dailyAnalytics.push({
      date: formatDateYmd(d),
      label: formatDayLabel(d),
      uniqueVisits,
      pageViews,
      cartAdds,
      checkoutStarts,
      stripeUnitsSold: stripeUnits,
      csvUnitsSold: csvUnits,
      unitsItalia,
      unitsCina,
      revenueEur,
      marginEur,
    });
  }

  const isoDaysAgo = (days: number, hoursOffset = 0): string => {
    const dt = new Date(now.getTime() - days * 86400000 - hoursOffset * 3600000);
    return dt.toISOString();
  };

  const customers: CrmCustomer[] = [
    {
      id: "cust_001",
      fullName: "Marco Ferretti",
      email: "marco.ferretti@example.it",
      phone: "+39 347 8912340",
      vehicleModel: "BMW 330i Touring (G21)",
      licensePlate: "GH412KL",
      tireSize: "245/40R18",
      ordersCount: 2,
      lifetimeValueEur: 1845.96,
      internalNotes: "Cliente ricorrente — preferisce consegna presso officina partner Milano Nord.",
      privacyConsentAt: isoDaysAgo(14, 3),
      anonymized: false,
      anonymizedAt: null,
      lastOrderAt: isoDaysAgo(1, 4),
      createdAt: isoDaysAgo(90),
    },
    {
      id: "cust_002",
      fullName: "Elena Rinaldi",
      email: "elena.rinaldi@example.it",
      phone: "+39 338 5520194",
      vehicleModel: "Audi Q3 Sportback 40 TDI",
      licensePlate: "GL780MN",
      tireSize: "235/55R17",
      ordersCount: 1,
      lifetimeValueEur: 827.2,
      internalNotes: "Avvisata sui tempi 5-15 gg lavorativi stock import. Richiede tracking via WhatsApp.",
      privacyConsentAt: isoDaysAgo(2, 6),
      anonymized: false,
      anonymizedAt: null,
      lastOrderAt: isoDaysAgo(2, 6),
      createdAt: isoDaysAgo(2, 6),
    },
    {
      id: "cust_003",
      fullName: "Davide Conti",
      email: "davide.conti@example.it",
      phone: "+39 320 4418871",
      vehicleModel: "Volkswagen Tiguan 2.0 TDI",
      licensePlate: "FT209BV",
      tireSize: "215/60R16",
      ordersCount: 2,
      lifetimeValueEur: 1124.8,
      internalNotes: "Ordine Split IT+CN: ha scelto spedizione separata per montare subito le 2 anteriori.",
      privacyConsentAt: isoDaysAgo(0, 5),
      anonymized: false,
      anonymizedAt: null,
      lastOrderAt: isoDaysAgo(0, 5),
      createdAt: isoDaysAgo(42),
    },
    {
      id: "cust_004",
      fullName: "Chiara Bellini",
      email: "chiara.bellini@example.it",
      phone: "+39 349 7703122",
      vehicleModel: "Volkswagen Golf 8 GTI",
      licensePlate: "GM901TR",
      tireSize: "225/45R18",
      ordersCount: 1,
      lifetimeValueEur: 716.62,
      internalNotes: "Fattura richiesta con codice SDI aziendale.",
      privacyConsentAt: isoDaysAgo(5, 2),
      anonymized: false,
      anonymizedAt: null,
      lastOrderAt: isoDaysAgo(5, 2),
      createdAt: isoDaysAgo(5, 2),
    },
    {
      id: "cust_005",
      fullName: "Roberto Galli",
      email: "roberto.galli@example.it",
      phone: "+39 335 6189045",
      vehicleModel: "Porsche Macan S",
      licensePlate: "GP332AX",
      tireSize: "255/50R19",
      ordersCount: 3,
      lifetimeValueEur: 3120.4,
      internalNotes: "Cliente VIP — acquista treni estivi e invernali ogni stagione.",
      privacyConsentAt: isoDaysAgo(9, 1),
      anonymized: false,
      anonymizedAt: null,
      lastOrderAt: isoDaysAgo(3, 8),
      createdAt: isoDaysAgo(180),
    },
  ];

  const orders: AdminOrder[] = [
    {
      id: "ord_10148",
      orderNumber: "S101-2026-1048",
      stripeSessionId: "cs_live_a1b2c3d41048",
      channel: "stripe",
      customerId: "cust_003",
      customerName: "Davide Conti",
      customerEmail: "davide.conti@example.it",
      customerPhone: "+39 320 4418871",
      status: "pagato",
      logisticsOrigin: "split",
      splitPreference: "split_shipments",
      deliveryMode: "home",
      shippingAddress: "Via Emilia Ponente 142, 40133 Bologna (BO)",
      carrier: null,
      trackingCode: null,
      trackingEmailSentAt: null,
      lines: [
        {
          productId: "prod_bridgestone_blizzak_215_60_16",
          sku: "BRI-WS90-2156016",
          brand: "BRIDGESTONE",
          model: "Blizzak WS90",
          sizeLabel: "215/60R16",
          quantity: 4,
          qtyItalia: 2,
          qtyCina: 2,
          unitPriceEur: 165.5,
          unitCostEur: 116.0,
        },
      ],
      totalUnits: 4,
      unitsItalia: 2,
      unitsCina: 2,
      subtotalEur: 628.9,
      pfuTotalEur: 14.0,
      shippingEur: 0,
      totalEur: 642.9,
      estimatedMarginEur: 164.9,
      privacyConsentAt: isoDaysAgo(0, 5),
      createdAt: isoDaysAgo(0, 5),
      updatedAt: isoDaysAgo(0, 5),
    },
    {
      id: "ord_10147",
      orderNumber: "S101-2026-1047",
      stripeSessionId: "cs_live_a1b2c3d41047",
      channel: "stripe",
      customerId: "cust_001",
      customerName: "Marco Ferretti",
      customerEmail: "marco.ferretti@example.it",
      customerPhone: "+39 347 8912340",
      status: "in_lavorazione_it",
      logisticsOrigin: "italia",
      splitPreference: null,
      deliveryMode: "partner-workshop",
      shippingAddress: "Officina Partner Monza Gomme, Viale Libertà 88, Monza (MB)",
      carrier: "BRT",
      trackingCode: null,
      trackingEmailSentAt: null,
      lines: [
        {
          productId: "prod_michelin_ps4s_245_40_18",
          sku: "MIC-PS4S-2454018",
          brand: "MICHELIN",
          model: "Pilot Sport 4S",
          sizeLabel: "245/40R18",
          quantity: 4,
          qtyItalia: 4,
          qtyCina: 0,
          unitPriceEur: 289.99,
          unitCostEur: 208.0,
        },
      ],
      totalUnits: 4,
      unitsItalia: 4,
      unitsCina: 0,
      subtotalEur: 1101.96,
      pfuTotalEur: 14.0,
      shippingEur: 0,
      totalEur: 1115.96,
      estimatedMarginEur: 269.96,
      privacyConsentAt: isoDaysAgo(1, 4),
      createdAt: isoDaysAgo(1, 4),
      updatedAt: isoDaysAgo(1, 1),
    },
    {
      id: "ord_10146",
      orderNumber: "S101-2026-1046",
      stripeSessionId: "cs_live_a1b2c3d41046",
      channel: "stripe",
      customerId: "cust_002",
      customerName: "Elena Rinaldi",
      customerEmail: "elena.rinaldi@example.it",
      customerPhone: "+39 338 5520194",
      status: "ordine_fornitore_cn",
      logisticsOrigin: "cina",
      splitPreference: null,
      deliveryMode: "home",
      shippingAddress: "Corso Francia 210, 10146 Torino (TO)",
      carrier: "DHL Express Import",
      trackingCode: null,
      trackingEmailSentAt: null,
      lines: [
        {
          productId: "prod_goodyear_weatherready_235_55_17",
          sku: "GDY-AWR-2355517",
          brand: "GOODYEAR",
          model: "Assurance WeatherReady",
          sizeLabel: "235/55R17",
          quantity: 4,
          qtyItalia: 0,
          qtyCina: 4,
          unitPriceEur: 214.0,
          unitCostEur: 151.0,
        },
      ],
      totalUnits: 4,
      unitsItalia: 0,
      unitsCina: 4,
      subtotalEur: 813.2,
      pfuTotalEur: 14.0,
      shippingEur: 0,
      totalEur: 827.2,
      estimatedMarginEur: 209.2,
      privacyConsentAt: isoDaysAgo(2, 6),
      createdAt: isoDaysAgo(2, 6),
      updatedAt: isoDaysAgo(1, 12),
    },
    {
      id: "ord_10145",
      orderNumber: "S101-2026-1045",
      stripeSessionId: "cs_live_a1b2c3d41045",
      channel: "stripe",
      customerId: "cust_005",
      customerName: "Roberto Galli",
      customerEmail: "roberto.galli@example.it",
      customerPhone: "+39 335 6189045",
      status: "spedito",
      logisticsOrigin: "italia",
      splitPreference: null,
      deliveryMode: "partner-workshop",
      shippingAddress: "Centro Gomme Roma Eur, Via Cristoforo Colombo 440, Roma (RM)",
      carrier: "GLS",
      trackingCode: "GLS-IT-992841023",
      trackingEmailSentAt: isoDaysAgo(2, 18),
      lines: [
        {
          productId: "prod_michelin_alpin5_suv_255_50_19",
          sku: "MIC-PA5S-2555019",
          brand: "MICHELIN",
          model: "Pilot Alpin 5 SUV",
          sizeLabel: "255/50R19",
          quantity: 4,
          qtyItalia: 4,
          qtyCina: 0,
          unitPriceEur: 276.0,
          unitCostEur: 198.0,
        },
      ],
      totalUnits: 4,
      unitsItalia: 4,
      unitsCina: 0,
      subtotalEur: 1048.8,
      pfuTotalEur: 14.0,
      shippingEur: 0,
      totalEur: 1062.8,
      estimatedMarginEur: 256.8,
      privacyConsentAt: isoDaysAgo(3, 8),
      createdAt: isoDaysAgo(3, 8),
      updatedAt: isoDaysAgo(2, 18),
    },
    {
      id: "ord_10144",
      orderNumber: "S101-2026-1044",
      stripeSessionId: "cs_live_a1b2c3d41044",
      channel: "stripe",
      customerId: "cust_004",
      customerName: "Chiara Bellini",
      customerEmail: "chiara.bellini@example.it",
      customerPhone: "+39 349 7703122",
      status: "consegnato",
      logisticsOrigin: "italia",
      splitPreference: null,
      deliveryMode: "home",
      shippingAddress: "Via XX Settembre 34, 37129 Verona (VR)",
      carrier: "BRT",
      trackingCode: "BRT-0881927461",
      trackingEmailSentAt: isoDaysAgo(4, 15),
      lines: [
        {
          productId: "prod_bridgestone_potenza_225_45_18",
          sku: "BRI-POT-2254518",
          brand: "BRIDGESTONE",
          model: "Potenza Sport",
          sizeLabel: "225/45R18",
          quantity: 4,
          qtyItalia: 4,
          qtyCina: 0,
          unitPriceEur: 184.9,
          unitCostEur: 131.0,
        },
      ],
      totalUnits: 4,
      unitsItalia: 4,
      unitsCina: 0,
      subtotalEur: 702.62,
      pfuTotalEur: 14.0,
      shippingEur: 0,
      totalEur: 716.62,
      estimatedMarginEur: 178.62,
      privacyConsentAt: isoDaysAgo(5, 2),
      createdAt: isoDaysAgo(5, 2),
      updatedAt: isoDaysAgo(3, 10),
    },
  ];

  const searchDemand: SearchDemandItem[] = [
    { sizeQuery: "225/45R17", searches: 184, lastSearchedAt: isoDaysAgo(0, 1) },
    { sizeQuery: "205/55R16", searches: 156, lastSearchedAt: isoDaysAgo(0, 2) },
    { sizeQuery: "245/40R18", searches: 132, lastSearchedAt: isoDaysAgo(0, 3) },
    { sizeQuery: "235/55R17", searches: 97, lastSearchedAt: isoDaysAgo(0, 4) },
    { sizeQuery: "215/60R16", searches: 84, lastSearchedAt: isoDaysAgo(0, 6) },
    { sizeQuery: "225/40R18", searches: 71, lastSearchedAt: isoDaysAgo(1, 2) },
  ];

  const yesterdayEvening = new Date(now);
  yesterdayEvening.setDate(now.getDate() - 1);
  yesterdayEvening.setHours(21, 30, 0, 0);

  const csvImports: CsvImportAuditEntry[] = [
    {
      id: "csv_seed_001",
      filename: "giacenze_serali_store101_ieri.csv",
      uploadedBy: "admin@store101.it",
      uploadedAt: yesterdayEvening.toISOString(),
      rowsProcessed: 12,
      updatedCount: 12,
      createdCount: 0,
      errorCount: 0,
      detectedUnitsSold: 14,
      rolledBack: false,
      rolledBackAt: null,
      previousProductsSnapshot: structuredClone(PRODUCTS),
    },
  ];

  const adminAuditLogs: AdminAuditEntry[] = [
    {
      id: "audit_seed_001",
      actorEmail: "admin@store101.it",
      action: "CSV_APPLY",
      target: "giacenze_serali_store101_ieri.csv",
      details: "Sincronizzazione serale completata: 12 SKU aggiornati, 14 unità vendute rilevate.",
      ip: "127.0.0.1",
      createdAt: yesterdayEvening.toISOString(),
    },
  ];

  return {
    version: DB_VERSION,
    products: structuredClone(PRODUCTS),
    orders,
    customers,
    dailyAnalytics,
    searchDemand,
    visitorHashesByDay: {},
    csvImports,
    adminAuditLogs,
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
    if (parsed && parsed.version === DB_VERSION && Array.isArray(parsed.products)) {
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
  if (!globalDb.store101AdminDb) {
    globalDb.store101AdminDb = loadDbFromDisk() ?? buildSeedDatabase();
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

export function appendAdminAuditLog(entry: Omit<AdminAuditEntry, "id" | "createdAt">): void {
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
  const todayStr = formatDateYmd(new Date());
  let point = db.dailyAnalytics.find((p) => p.date === todayStr);
  if (!point) {
    point = {
      date: todayStr,
      label: formatDayLabel(new Date()),
      uniqueVisits: 0,
      pageViews: 0,
      cartAdds: 0,
      checkoutStarts: 0,
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
    // Mantieni solo gli hash degli ultimi 2 giorni (minimizzazione GDPR)
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

function buildProductFromCsvRow(row: ValidatedCsvRow, nextIndex: number): Product {
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
    rating: 4.8,
    reviewCount: 24,
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
    shortDescription: `${row.brand} ${row.modello} ${row.misura} — importato dal catalogo serale STORE 101.`,
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
        soldItalia += Math.min(detectedSold, itDelta > 0 ? itDelta : detectedSold);
        soldCina += Math.max(0, detectedSold - Math.min(detectedSold, itDelta > 0 ? itDelta : detectedSold));
        revenueDelta += detectedSold * existing.priceEur;
        marginDelta += detectedSold * Math.max(0, existing.priceEur - existing.costEur);
      }
    } else {
      const created = buildProductFromCsvRow(row, db.products.length + 1);
      db.products.push(created);
      bySku.set(created.sku.toUpperCase(), created);
    }
  }

  // Aggiorna KPI giornalieri se il CSV ha rilevato vendite riconciliate
  if (totalSoldFromCsv > 0) {
    const today = ensureTodayAnalyticsPoint(db);
    today.csvUnitsSold += totalSoldFromCsv;
    today.unitsItalia += soldItalia;
    today.unitsCina += soldCina;
    today.revenueEur = Math.round((today.revenueEur + revenueDelta) * 100) / 100;
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
    estimatedMarginEur += Math.max(0, product.priceEur - product.costEur) * qty;
  }

  const logisticsOrigin: OrderLogisticsOrigin =
    unitsItalia > 0 && unitsCina > 0
      ? "split"
      : unitsCina > 0
        ? "cina"
        : "italia";

  const nowIso = new Date().toISOString();

  // Upsert CRM Customer
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
      vehicleModel: "Da completare",
      licensePlate: "",
      tireSize: lines[0]?.sizeLabel ?? "",
      ordersCount: 1,
      lifetimeValueEur: params.totalEur,
      internalNotes: "Creato automaticamente da checkout Stripe.",
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

  const order: AdminOrder = {
    id: `ord_${crypto.randomBytes(5).toString("hex")}`,
    orderNumber: `S101-2026-${Math.floor(1050 + Math.random() * 8900)}`,
    stripeSessionId: params.stripeSessionId,
    channel: "stripe",
    customerId: customer.id,
    customerName: customer.fullName,
    customerEmail: customer.email,
    customerPhone: customer.phone || null,
    status: "pagato",
    logisticsOrigin,
    splitPreference: logisticsOrigin === "split" ? params.splitPreference ?? "split_shipments" : null,
    deliveryMode: params.deliveryMode,
    shippingAddress: sanitizeText(params.shippingAddress || "Italia", 200),
    carrier: null,
    trackingCode: null,
    trackingEmailSentAt: null,
    lines,
    totalUnits,
    unitsItalia,
    unitsCina,
    subtotalEur: Math.max(0, params.totalEur - params.pfuTotalEur - params.shippingEur),
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
  today.stripeUnitsSold += totalUnits;
  today.unitsItalia += unitsItalia;
  today.unitsCina += unitsCina;
  today.revenueEur = Math.round((today.revenueEur + params.totalEur) * 100) / 100;
  today.marginEur = Math.round((today.marginEur + estimatedMarginEur) * 100) / 100;

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
  customer.internalNotes = "Dati personali anonimizzati ai sensi dell'Art. 17 GDPR. Storico fiscale ordini preservato per 10 anni.";
  customer.anonymized = true;
  customer.anonymizedAt = nowIso;

  // Anonimizza PII negli ordini collegati preservando importi fiscali, SKU e PFU
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
