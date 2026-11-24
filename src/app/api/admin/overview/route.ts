import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { getStoreDb } from "@/lib/admin-store";
import type { DailyAnalyticsPoint } from "@/lib/admin-types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function pctDelta(current: number, previous: number): number {
  if (previous <= 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

function formatYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatLabel(d: Date): string {
  return d.toLocaleDateString("it-IT", { day: "2-digit", month: "short" });
}

function buildWindowSeries(
  daysCount: number,
  endDate: Date,
  byDate: Map<string, DailyAnalyticsPoint>
): DailyAnalyticsPoint[] {
  const result: DailyAnalyticsPoint[] = [];
  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(endDate);
    d.setDate(endDate.getDate() - i);
    const key = formatYmd(d);
    const existing = byDate.get(key);
    result.push(
      existing ?? {
        date: key,
        label: formatLabel(d),
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
      }
    );
  }
  return result;
}

export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Accesso non autorizzato." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const range = searchParams.get("range") || "7d";
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");

  const db = getStoreDb();
  const byDate = new Map<string, DailyAnalyticsPoint>();
  for (const p of db.dailyAnalytics) {
    byDate.set(p.date, p);
  }

  const now = new Date();
  let currentSlice: DailyAnalyticsPoint[];
  let prevSlice: DailyAnalyticsPoint[];

  if (range === "today") {
    currentSlice = buildWindowSeries(1, now, byDate);
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    prevSlice = buildWindowSeries(1, yesterday, byDate);
  } else if (range === "30d") {
    currentSlice = buildWindowSeries(30, now, byDate);
    const prevEnd = new Date(now);
    prevEnd.setDate(now.getDate() - 30);
    prevSlice = buildWindowSeries(30, prevEnd, byDate);
  } else if (range === "custom" && fromParam && toParam) {
    const start = new Date(`${fromParam}T00:00:00`);
    const end = new Date(`${toParam}T00:00:00`);
    const diffDays = Math.max(
      1,
      Math.min(
        90,
        Math.round((end.getTime() - start.getTime()) / 86400000) + 1
      )
    );
    currentSlice = buildWindowSeries(diffDays, end, byDate);
    const prevEnd = new Date(start);
    prevEnd.setDate(start.getDate() - 1);
    prevSlice = buildWindowSeries(diffDays, prevEnd, byDate);
  } else {
    currentSlice = buildWindowSeries(7, now, byDate);
    const prevEnd = new Date(now);
    prevEnd.setDate(now.getDate() - 7);
    prevSlice = buildWindowSeries(7, prevEnd, byDate);
  }

  const sum = (
    list: DailyAnalyticsPoint[],
    pick: (item: DailyAnalyticsPoint) => number
  ) => list.reduce((acc, item) => acc + pick(item), 0);

  const revenue =
    Math.round(sum(currentSlice, (p) => p.revenueEur) * 100) / 100;
  const prevRevenue = sum(prevSlice, (p) => p.revenueEur);

  const margin =
    Math.round(sum(currentSlice, (p) => p.marginEur) * 100) / 100;
  const prevMargin = sum(prevSlice, (p) => p.marginEur);

  const unitsStripe = sum(currentSlice, (p) => p.stripeUnitsSold);
  const unitsCsv = sum(currentSlice, (p) => p.csvUnitsSold);
  const totalUnits = unitsStripe + unitsCsv;
  const prevUnits = sum(
    prevSlice,
    (p) => p.stripeUnitsSold + p.csvUnitsSold
  );

  const unitsItalia = sum(currentSlice, (p) => p.unitsItalia);
  const unitsCina = sum(currentSlice, (p) => p.unitsCina);

  const uniqueVisits = sum(currentSlice, (p) => p.uniqueVisits);
  const prevVisits = sum(prevSlice, (p) => p.uniqueVisits);
  const pageViews = sum(currentSlice, (p) => p.pageViews);
  const cartAdds = sum(currentSlice, (p) => p.cartAdds);
  const checkoutStarts = sum(currentSlice, (p) => p.checkoutStarts);
  const paidOrders = sum(currentSlice, (p) => p.paidOrdersCount);
  const prevPaidOrders = sum(prevSlice, (p) => p.paidOrdersCount);

  const conversionRatePct =
    uniqueVisits > 0 && paidOrders > 0
      ? Math.round((paidOrders / uniqueVisits) * 10000) / 100
      : 0;
  const prevConv =
    prevVisits > 0 && prevPaidOrders > 0
      ? (prevPaidOrders / prevVisits) * 100
      : 0;

  const aovEur =
    paidOrders > 0 ? Math.round((revenue / paidOrders) * 100) / 100 : 0;

  const pendingOrders = db.orders.filter(
    (o) =>
      o.status === "pagato" ||
      o.status === "in_lavorazione_it" ||
      o.status === "ordine_fornitore_cn"
  );
  const splitOrdersCount = pendingOrders.filter(
    (o) => o.logisticsOrigin === "split"
  ).length;

  const soldBySku = new Map<
    string,
    {
      sku: string;
      brand: string;
      model: string;
      sizeLabel: string;
      units: number;
      revenueEur: number;
      stockItalia: number;
      stockCina: number;
    }
  >();

  for (const ord of db.orders) {
    for (const line of ord.lines) {
      const prod = db.products.find((p) => p.sku === line.sku);
      const curr = soldBySku.get(line.sku) ?? {
        sku: line.sku,
        brand: line.brand,
        model: line.model,
        sizeLabel: line.sizeLabel,
        units: 0,
        revenueEur: 0,
        stockItalia: prod?.stockItalia ?? 0,
        stockCina: prod?.stockCina ?? 0,
      };
      curr.units += line.quantity;
      curr.revenueEur =
        Math.round((curr.revenueEur + line.unitPriceEur * line.quantity) * 100) /
        100;
      soldBySku.set(line.sku, curr);
    }
  }

  const topSoldTires = Array.from(soldBySku.values())
    .sort((a, b) => b.units - a.units)
    .slice(0, 6);

  const searchDemandEnriched = db.searchDemand.slice(0, 6).map((item) => {
    const matching = db.products.filter(
      (p) =>
        p.sizeLabel.toUpperCase().replace(/\s+/g, "") === item.sizeQuery
    );
    const totalIt = matching.reduce((acc, p) => acc + p.stockItalia, 0);
    const totalCn = matching.reduce((acc, p) => acc + p.stockCina, 0);
    return {
      ...item,
      matchingSkus: matching.length,
      stockItalia: totalIt,
      stockCina: totalCn,
      stockAlert: totalIt === 0,
    };
  });

  const lowStockProducts = db.products.filter(
    (p) =>
      p.stockItalia + p.stockCina === 0 || p.stockItalia <= db.lowStockThreshold
  );

  const lastCsv =
    db.csvImports.find((c) => !c.rolledBack) ?? db.csvImports[0] ?? null;

  const recentActivity = [
    ...db.orders.slice(0, 4).map((o) => ({
      id: `act_ord_${o.id}`,
      type: o.logisticsOrigin === "split" ? "warning" : "stripe",
      title: `Ordine ${o.orderNumber} (${o.customerName})`,
      subtitle: `${o.totalUnits} gomme • ${o.logisticsOrigin === "italia" ? "Magazzino IT" : o.logisticsOrigin === "cina" ? "Import CN" : "Split IT+CN"} • €${o.totalEur.toFixed(2)}`,
      timestamp: o.createdAt,
    })),
    ...db.csvImports.slice(0, 2).map((c) => ({
      id: `act_csv_${c.id}`,
      type: "csv",
      title: `Sync CSV ${c.filename}`,
      subtitle: `${c.updatedCount} aggiornati, ${c.createdCount} nuovi, ${c.detectedUnitsSold} vendite rilevate`,
      timestamp: c.uploadedAt,
    })),
  ]
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, 6);

  return NextResponse.json({
    range,
    kpis: {
      revenueEur: revenue,
      revenueDeltaPct: pctDelta(revenue, prevRevenue),
      marginEur: margin,
      marginDeltaPct: pctDelta(margin, prevMargin),
      totalUnitsSold: totalUnits,
      unitsDeltaPct: pctDelta(totalUnits, prevUnits),
      unitsItalia,
      unitsCina,
      unitsStripe,
      unitsCsv,
      uniqueVisits,
      visitsDeltaPct: pctDelta(uniqueVisits, prevVisits),
      pageViews,
      conversionRatePct,
      conversionDeltaPct: pctDelta(conversionRatePct, prevConv),
      aovEur,
      ordersToShipCount: pendingOrders.length,
      splitOrdersCount,
      lowStockCount: lowStockProducts.length,
    },
    funnel: {
      uniqueVisits,
      cartAdds,
      checkoutStarts,
      paidOrders,
    },
    chartSeries: currentSlice,
    topSoldTires,
    searchDemand: searchDemandEnriched,
    lastCsvSync: lastCsv
      ? {
          id: lastCsv.id,
          filename: lastCsv.filename,
          uploadedAt: lastCsv.uploadedAt,
          uploadedBy: lastCsv.uploadedBy,
          updatedCount: lastCsv.updatedCount,
          createdCount: lastCsv.createdCount,
          errorCount: lastCsv.errorCount,
          rolledBack: lastCsv.rolledBack,
        }
      : null,
    recentActivity,
  });
}
