import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin-auth";
import {
  appendAdminAuditLog,
  getStoreDb,
  updateCustomerDetails,
} from "@/lib/admin-store";
import { getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const patchCustomerSchema = z.object({
  customerId: z.string().min(3).max(80),
  vehicleModel: z.string().max(100).optional(),
  licensePlate: z.string().max(16).optional(),
  tireSize: z.string().max(24).optional(),
  internalNotes: z.string().max(500).optional(),
});

export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Accesso non autorizzato." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") || "").trim().toLowerCase();
  const logView = searchParams.get("audit") === "1";

  const db = getStoreDb();
  let customers = [...db.customers];

  if (query) {
    customers = customers.filter((c) => {
      const hay = [
        c.fullName,
        c.email,
        c.phone,
        c.vehicleModel,
        c.licensePlate,
        c.tireSize,
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(query);
    });
  }

  if (logView) {
    appendAdminAuditLog({
      actorEmail: session.email,
      action: "CRM_VIEW",
      target: "anagrafica_clienti",
      details: `Consultazione anagrafica CRM (${customers.length} schede).`,
      ip: getClientIp(request),
    });
  }

  const ordersByCustomer = new Map<string, typeof db.orders>();
  for (const ord of db.orders) {
    const list = ordersByCustomer.get(ord.customerId) ?? [];
    list.push(ord);
    ordersByCustomer.set(ord.customerId, list);
  }

  return NextResponse.json({
    customers: customers.map((c) => ({
      ...c,
      orders: ordersByCustomer.get(c.id) ?? [],
    })),
  });
}

export async function PATCH(request: Request) {
  const session = await getAdminSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Accesso non autorizzato." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON non valido." }, { status: 400 });
  }

  const parsed = patchCustomerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dati cliente non validi." },
      { status: 400 }
    );
  }

  const updated = updateCustomerDetails({
    ...parsed.data,
    actorEmail: session.email,
    ip: getClientIp(request),
  });

  if (!updated) {
    return NextResponse.json(
      { error: "Cliente non trovato o anonimizzato." },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true, customer: updated });
}
