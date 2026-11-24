import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { getStoreDb } from "@/lib/admin-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Accesso non autorizzato." }, { status: 401 });
  }

  const db = getStoreDb();
  return NextResponse.json({
    logs: db.adminAuditLogs,
    lowStockThreshold: db.lowStockThreshold,
    processedStripeEventsCount: db.processedStripeEventIds.length,
  });
}
