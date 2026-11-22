import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { newsletterSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limit = checkRateLimit(`newsletter:${ip}`, {
    windowMs: 10 * 60 * 1000,
    maxRequests: 5,
  });

  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Troppi tentativi. Riprova tra qualche minuto." },
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

  // Controllo silenzioso honeypot anti-bot
  if (
    typeof body === "object" &&
    body !== null &&
    "companyWebsite" in body &&
    typeof (body as { companyWebsite?: unknown }).companyWebsite === "string" &&
    (body as { companyWebsite: string }).companyWebsite.trim().length > 0
  ) {
    return NextResponse.json({
      success: true,
      promoCode: "BENVENUTO15",
      message: "Iscrizione confermata!",
    });
  }

  const parsed = newsletterSchema.safeParse(body);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return NextResponse.json(
      { error: firstError?.message ?? "Verifica i dati inseriti." },
      { status: 400 }
    );
  }

  // Qui collegare il provider email (es. Brevo / Mailchimp / Resend)
  return NextResponse.json({
    success: true,
    email: parsed.data.email,
    promoCode: "BENVENUTO15",
    message:
      "Iscrizione completata! Usa il codice BENVENUTO15 nel carrello per €15 di sconto sul tuo primo treno di gomme.",
  });
}
