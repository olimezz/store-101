import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { appendAdminAuditLog, getStoreDb } from "@/lib/admin-store";
import { escapeCsvExportCell } from "@/lib/csv-security";
import { getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Accesso non autorizzato." }, { status: 401 });
  }

  const { id } = await context.params;
  const { searchParams } = new URL(request.url);
  const format = (searchParams.get("format") || "json").toLowerCase();

  const db = getStoreDb();
  const customer = db.customers.find((c) => c.id === id);
  if (!customer) {
    return NextResponse.json({ error: "Cliente non trovato." }, { status: 404 });
  }

  const customerOrders = db.orders.filter((o) => o.customerId === customer.id);

  appendAdminAuditLog({
    actorEmail: session.email,
    action: "CRM_EXPORT",
    target: customer.id,
    details: `Esportazione dati GDPR cliente (${format.toUpperCase()}).`,
    ip: getClientIp(request),
  });

  if (format === "csv") {
    const headers = [
      "id_cliente",
      "nome",
      "email",
      "telefono",
      "veicolo",
      "targa",
      "misura_gomme",
      "ordini_totali",
      "ltv_eur",
      "consenso_privacy_at",
      "anonimizzato",
    ];
    const row = [
      customer.id,
      customer.fullName,
      customer.email,
      customer.phone,
      customer.vehicleModel,
      customer.licensePlate,
      customer.tireSize,
      String(customer.ordersCount),
      customer.lifetimeValueEur.toFixed(2),
      customer.privacyConsentAt,
      customer.anonymized ? "SI" : "NO",
    ];
    const csv = [
      headers.join(","),
      row.map(escapeCsvExportCell).join(","),
    ].join("\n");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="gdpr_export_${customer.id}.csv"`,
        "X-Content-Type-Options": "nosniff",
      },
    });
  }

  const jsonPayload = JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      gdprArticle: "Art. 15 / Art. 20 Regolamento (UE) 2016/679",
      customer,
      orders: customerOrders,
    },
    null,
    2
  );

  return new NextResponse(jsonPayload, {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="gdpr_export_${customer.id}.json"`,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
