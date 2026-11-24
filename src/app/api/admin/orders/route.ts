import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin-auth";
import { getStoreDb, updateOrderLogistics } from "@/lib/admin-store";
import { getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const patchOrderSchema = z.object({
  orderId: z.string().min(3).max(80),
  status: z.enum([
    "pagato",
    "in_lavorazione_it",
    "ordine_fornitore_cn",
    "spedito",
    "consegnato",
  ]),
  carrier: z.string().max(60).nullable().optional(),
  trackingCode: z.string().max(80).nullable().optional(),
});

export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Accesso non autorizzato." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const originFilter = searchParams.get("origin") || "all";
  const query = (searchParams.get("q") || "").trim().toLowerCase();

  let orders = [...getStoreDb().orders];

  if (
    originFilter === "italia" ||
    originFilter === "cina" ||
    originFilter === "split"
  ) {
    orders = orders.filter((o) => o.logisticsOrigin === originFilter);
  }

  if (query) {
    orders = orders.filter((o) => {
      const hay = [
        o.orderNumber,
        o.customerName,
        o.customerEmail,
        o.trackingCode ?? "",
        ...o.lines.map((l) => `${l.brand} ${l.model} ${l.sizeLabel} ${l.sku}`),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(query);
    });
  }

  return NextResponse.json({ orders });
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

  const parsed = patchOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dati ordine non validi." },
      { status: 400 }
    );
  }

  const result = updateOrderLogistics({
    ...parsed.data,
    actorEmail: session.email,
    ip: getClientIp(request),
  });

  if (!result) {
    return NextResponse.json({ error: "Ordine non trovato." }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    order: result.order,
    trackingEmailTriggered: result.trackingEmailTriggered,
  });
}
