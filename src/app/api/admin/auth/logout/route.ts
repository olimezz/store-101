import { NextResponse } from "next/server";
import { clearAdminSessionCookie, getAdminSession } from "@/lib/admin-auth";
import { appendAdminAuditLog } from "@/lib/admin-store";
import { getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (session) {
    appendAdminAuditLog({
      actorEmail: session.email,
      action: "LOGOUT",
      target: "/admin",
      details: "Sessione amministratore chiusa.",
      ip: getClientIp(request),
    });
  }
  await clearAdminSessionCookie();
  return NextResponse.json({ ok: true });
}
