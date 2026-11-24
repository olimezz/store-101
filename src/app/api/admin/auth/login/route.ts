import { NextResponse } from "next/server";
import { z } from "zod";
import {
  setAdminSessionCookie,
  verifyAdminCredentials,
} from "@/lib/admin-auth";
import { appendAdminAuditLog } from "@/lib/admin-store";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

const loginSchema = z.object({
  email: z.string().email("Inserisci un'email valida"),
  password: z.string().min(6, "Password non valida").max(128),
});

export async function POST(request: Request) {
  const ip = getClientIp(request);
  // Protezione brute-force: max 5 tentativi ogni 15 minuti per IP
  const limit = checkRateLimit(`admin-login:${ip}`, {
    windowMs: 15 * 60 * 1000,
    maxRequests: 8,
  });

  if (!limit.allowed) {
    return NextResponse.json(
      {
        error: `Troppi tentativi di accesso falliti. Riprova tra ${Math.ceil(limit.retryAfterSeconds / 60)} minuti.`,
      },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Payload non valido." }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Credenziali non valide." },
      { status: 400 }
    );
  }

  const valid = verifyAdminCredentials(parsed.data.email, parsed.data.password);
  if (!valid) {
    return NextResponse.json(
      { error: "Email o password errati." },
      { status: 401 }
    );
  }

  await setAdminSessionCookie(parsed.data.email);
  appendAdminAuditLog({
    actorEmail: parsed.data.email.trim().toLowerCase(),
    action: "LOGIN_SUCCESS",
    target: "/admin",
    details: "Accesso amministratore autenticato (RBAC ADMIN).",
    ip,
  });

  return NextResponse.json({
    ok: true,
    email: parsed.data.email.trim().toLowerCase(),
    role: "ADMIN",
  });
}
