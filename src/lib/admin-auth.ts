import crypto from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE_NAME = "store101_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12 ore

export interface AdminSession {
  email: string;
  role: "ADMIN";
  iat: number;
  exp: number;
}

function getSessionSecret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.STRIPE_SECRET_KEY ||
    "store101_dev_admin_session_secret_change_in_prod"
  );
}

export function getConfiguredAdminCredentials(): {
  email: string;
  password: string;
} {
  return {
    email: (process.env.ADMIN_EMAIL || "admin@store101.it").trim().toLowerCase(),
    password: process.env.ADMIN_PASSWORD || "Store101Admin!2026",
  };
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function verifyAdminCredentials(email: string, password: string): boolean {
  const expected = getConfiguredAdminCredentials();
  const normalizedEmail = email.trim().toLowerCase();
  const emailOk = safeEqual(normalizedEmail, expected.email);
  const passOk = safeEqual(password, expected.password);
  return emailOk && passOk;
}

function signPayload(payloadB64: string): string {
  return crypto
    .createHmac("sha256", getSessionSecret())
    .update(payloadB64)
    .digest("base64url");
}

export function createAdminSessionToken(email: string): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: AdminSession = {
    email: email.trim().toLowerCase(),
    role: "ADMIN",
    iat: now,
    exp: now + SESSION_TTL_SECONDS,
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url"
  );
  const sig = signPayload(payloadB64);
  return `${payloadB64}.${sig}`;
}

export function verifyAdminSessionToken(token: string | undefined): AdminSession | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payloadB64, sig] = parts;
  if (!payloadB64 || !sig) return null;

  const expectedSig = signPayload(payloadB64);
  if (!safeEqual(sig, expectedSig)) return null;

  try {
    const parsed = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf8")
    ) as Partial<AdminSession>;
    const now = Math.floor(Date.now() / 1000);
    if (
      parsed.role !== "ADMIN" ||
      typeof parsed.email !== "string" ||
      typeof parsed.exp !== "number" ||
      parsed.exp < now
    ) {
      return null;
    }
    return {
      email: parsed.email,
      role: "ADMIN",
      iat: typeof parsed.iat === "number" ? parsed.iat : now,
      exp: parsed.exp,
    };
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  return verifyAdminSessionToken(token);
}

export async function setAdminSessionCookie(email: string): Promise<void> {
  const token = createAdminSessionToken(email);
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearAdminSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
