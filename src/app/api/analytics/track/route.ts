import { NextResponse } from "next/server";
import { z } from "zod";
import { recordCookielessAnalyticsEvent } from "@/lib/admin-store";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

const trackSchema = z.object({
  type: z.enum(["pageview", "search", "cart_add", "checkout_start"]),
  sizeQuery: z.string().max(40).optional(),
});

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limit = checkRateLimit(`analytics:${ip}`, {
    windowMs: 60 * 1000,
    maxRequests: 60,
  });

  if (!limit.allowed) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const parsed = trackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const userAgent = request.headers.get("user-agent") ?? "unknown";
  recordCookielessAnalyticsEvent({
    type: parsed.data.type,
    ip,
    userAgent,
    sizeQuery: parsed.data.sizeQuery,
  });

  return NextResponse.json({ ok: true });
}
