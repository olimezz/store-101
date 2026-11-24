import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin-auth";
import { rollbackCsvImport } from "@/lib/admin-store";
import { getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

const rollbackSchema = z.object({
  importId: z.string().min(3).max(80),
});

export async function POST(request: Request) {
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

  const parsed = rollbackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "ID importazione non valido." }, { status: 400 });
  }

  const restored = rollbackCsvImport({
    importId: parsed.data.importId,
    actorEmail: session.email,
    ip: getClientIp(request),
  });

  if (!restored) {
    return NextResponse.json(
      { error: "Importazione non trovata o già ripristinata." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    ok: true,
    message: `Ripristinata versione stock precedente al file "${restored.filename}".`,
  });
}
