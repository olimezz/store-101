import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin-auth";
import { getStoreDb, updateManualProductStock } from "@/lib/admin-store";
import { getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const patchProductSchema = z.object({
  productId: z.string().min(3).max(80),
  stockItalia: z.number().int().min(0).max(50000),
  stockCina: z.number().int().min(0).max(100000),
  priceEur: z.number().positive().max(5000).optional(),
  costEur: z.number().min(0).max(5000).optional(),
});

export async function GET() {
  const session = await getAdminSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Accesso non autorizzato." }, { status: 401 });
  }

  const db = getStoreDb();
  return NextResponse.json({
    products: db.products,
    lowStockThreshold: db.lowStockThreshold,
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

  const parsed = patchProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dati prodotto non validi." },
      { status: 400 }
    );
  }

  const updated = updateManualProductStock({
    ...parsed.data,
    actorEmail: session.email,
    ip: getClientIp(request),
  });

  if (!updated) {
    return NextResponse.json(
      { error: "Prodotto non trovato." },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true, product: updated });
}
