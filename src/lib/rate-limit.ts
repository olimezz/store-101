/**
 * Rate limiter in-memory con finestra scorrevole per protezione anti-abuso e anti-card-testing.
 * In ambiente multi-istanza serverless può essere sostituito con Upstash Redis mantenendo la stessa firma.
 */
interface Bucket {
  timestamps: number[];
}

const buckets = new Map<string, Bucket>();

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const windowStart = now - config.windowMs;

  const existing = buckets.get(key) ?? { timestamps: [] };
  existing.timestamps = existing.timestamps.filter((t) => t > windowStart);

  if (existing.timestamps.length >= config.maxRequests) {
    const oldest = existing.timestamps[0] ?? now;
    const retryAfterMs = Math.max(1000, oldest + config.windowMs - now);
    buckets.set(key, existing);
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil(retryAfterMs / 1000),
    };
  }

  existing.timestamps.push(now);
  buckets.set(key, existing);

  // Pulizia periodica per evitare crescita illimitata in memoria
  if (buckets.size > 5000) {
    for (const [k, b] of buckets.entries()) {
      if (b.timestamps.every((t) => t <= windowStart)) {
        buckets.delete(k);
      }
    }
  }

  return {
    allowed: true,
    remaining: Math.max(0, config.maxRequests - existing.timestamps.length),
    retryAfterSeconds: 0,
  };
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  return "127.0.0.1";
}
