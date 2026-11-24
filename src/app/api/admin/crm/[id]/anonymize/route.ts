import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { anonymizeCustomerGdpr } from "@/lib/admin-store";
import { getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Accesso non autorizzato." }, { status: 401 });
  }

  const { id } = await context.params;
  const anonymized = anonymizeCustomerGdpr({
    customerId: id,
    actorEmail: session.email,
    ip: getClientIp(request),
  });

  if (!anonymized) {
    return NextResponse.json({ error: "Cliente non trovato." }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    customer: anonymized,
    message:
      "Dati personali anonimizzati ai sensi dell'Art. 17 GDPR. Storico fiscale ordini preservato per obbligo di legge (10 anni).",
  });
}
