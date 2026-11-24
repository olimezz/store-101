import type { Product } from "@/data/products";

export type OrderLogisticsOrigin = "italia" | "cina" | "split";

export type AdminOrderStatus =
  | "pagato"
  | "in_lavorazione_it"
  | "ordine_fornitore_cn"
  | "spedito"
  | "consegnato";

export type SplitOrderPreference = "split_shipments" | "single_consolidated";

export interface AdminOrderLine {
  productId: string;
  sku: string;
  brand: string;
  model: string;
  sizeLabel: string;
  quantity: number;
  qtyItalia: number;
  qtyCina: number;
  unitPriceEur: number;
  unitCostEur: number;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  stripeSessionId: string | null;
  channel: "stripe" | "csv_reconciliation";
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  status: AdminOrderStatus;
  logisticsOrigin: OrderLogisticsOrigin;
  splitPreference: SplitOrderPreference | null;
  deliveryMode: "home" | "partner-workshop";
  shippingAddress: string;
  carrier: string | null;
  trackingCode: string | null;
  trackingEmailSentAt: string | null;
  lines: AdminOrderLine[];
  totalUnits: number;
  unitsItalia: number;
  unitsCina: number;
  subtotalEur: number;
  pfuTotalEur: number;
  shippingEur: number;
  totalEur: number;
  estimatedMarginEur: number;
  privacyConsentAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CrmCustomer {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  vehicleModel: string;
  licensePlate: string;
  tireSize: string;
  ordersCount: number;
  lifetimeValueEur: number;
  internalNotes: string;
  privacyConsentAt: string;
  anonymized: boolean;
  anonymizedAt: string | null;
  lastOrderAt: string | null;
  createdAt: string;
}

export interface DailyAnalyticsPoint {
  date: string; // YYYY-MM-DD
  label: string;
  uniqueVisits: number;
  pageViews: number;
  cartAdds: number;
  checkoutStarts: number;
  paidOrdersCount: number;
  stripeUnitsSold: number;
  csvUnitsSold: number;
  unitsItalia: number;
  unitsCina: number;
  revenueEur: number;
  marginEur: number;
}

export interface SearchDemandItem {
  sizeQuery: string;
  searches: number;
  lastSearchedAt: string;
}

export interface CsvInventorySnapshotItem {
  id: string;
  sku: string;
  priceEur: number;
  costEur: number;
  stockItalia: number;
  stockCina: number;
  inStock: boolean;
}

export interface CsvImportAuditEntry {
  id: string;
  filename: string;
  uploadedBy: string;
  uploadedAt: string;
  rowsProcessed: number;
  updatedCount: number;
  createdCount: number;
  errorCount: number;
  detectedUnitsSold: number;
  rolledBack: boolean;
  rolledBackAt: string | null;
  previousProductsSnapshot: Product[];
}

export interface AdminAuditEntry {
  id: string;
  actorEmail: string;
  action:
    | "LOGIN_SUCCESS"
    | "LOGOUT"
    | "CSV_APPLY"
    | "CSV_ROLLBACK"
    | "CRM_VIEW"
    | "CRM_EXPORT"
    | "CRM_ANONYMIZE_GDPR"
    | "ORDER_UPDATE"
    | "STOCK_MANUAL_EDIT";
  target: string;
  details: string;
  ip: string;
  createdAt: string;
}

export interface CsvPreviewRowDiff {
  rowNumber: number;
  sku: string;
  brand: string;
  model: string;
  sizeLabel: string;
  season: "estivi" | "invernali" | "4-stagioni";
  action: "update" | "create" | "error";
  errors: string[];
  oldStockItalia: number | null;
  newStockItalia: number;
  oldStockCina: number | null;
  newStockCina: number;
  oldPriceEur: number | null;
  newPriceEur: number;
  newCostEur: number | null;
  detectedUnitsSold: number;
  logisticsAfter: "italia" | "cina" | "out_of_stock";
}

export interface CsvDryRunResult {
  filename: string;
  totalRows: number;
  updatedCount: number;
  createdCount: number;
  errorCount: number;
  totalDetectedUnitsSold: number;
  rows: CsvPreviewRowDiff[];
}

export interface StoreDatabase {
  version: number;
  products: Product[];
  orders: AdminOrder[];
  customers: CrmCustomer[];
  dailyAnalytics: DailyAnalyticsPoint[];
  searchDemand: SearchDemandItem[];
  visitorHashesByDay: Record<string, string[]>;
  csvImports: CsvImportAuditEntry[];
  adminAuditLogs: AdminAuditEntry[];
  processedStripeEventIds: string[];
  lowStockThreshold: number;
}
