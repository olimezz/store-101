import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { supportRequestSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limit = checkRateLimit(`support:${ip}`, {
    windowMs: 10 * 60 * 1000,
    maxRequests: 5,
  });

  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Hai inviato troppe richieste. Attendi qualche minuto." },
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
    return NextResponse.json(
      { error: "Richiesta non valida." },
      { status: 400 }
    );
  }

  // Protezione honeypot anti-spam
  if (
    typeof body === "object" &&
    body !== null &&
    "faxNumber" in body &&
    typeof (body as { faxNumber?: unknown }).faxNumber === "string" &&
    (body as { faxNumber: string }).faxNumber.trim().length > 0
  ) {
    return NextResponse.json({
      success: true,
      ticketId: "S101-OK",
      message: "Richiesta ricevuta dal team tecnico STORE 101.",
    });
  }

  const parsed = supportRequestSchema.safeParse(body);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return NextResponse.json(
      { error: firstIssue?.message ?? "Controlla i campi obbligatori." },
      { status: 400 }
    );
  }

  const ticketId = `S101-${Math.floor(100000 + Math.random() * 900000)}`;

  return NextResponse.json({
    success: true,
    ticketId,
    message:
      "Richiesta ricevuta! Un nostro tecnico pneumatici ti risponderà entro 2 ore lavorative.",
  });
}
