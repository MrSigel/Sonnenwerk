/**
 * Rate-Limiting & Missbrauchsschutz (§16).
 * - Default: In-Memory-Limiter (LRU/Map mit Zeitfenster) — kein Zusatzdienst nötig.
 * - Optional: Upstash Ratelimit (Redis) per ENV zuschaltbar (Serverless/Multi-Instanz).
 * - ENV leer → In-Memory-Fallback, kein Fehler.
 *
 * Hinweis: Treffer werden ohne personenbezogene Daten geloggt.
 */

import { env, hasUpstash } from "./env";

export type RateResult = { success: boolean; remaining: number };

type Window = { count: number; resetAt: number; dayCount: number; dayResetAt: number };

// In-Memory-Speicher (pro Serverinstanz).
const store = new Map<string, Window>();

// Aufräumen, damit die Map nicht unbegrenzt wächst.
function sweep(now: number) {
  if (store.size < 5000) return;
  for (const [key, w] of store) {
    if (w.resetAt < now && w.dayResetAt < now) store.delete(key);
  }
}

function memoryLimit(
  key: string,
  limit: number,
  windowMs: number,
  dayCap: number
): RateResult {
  const now = Date.now();
  sweep(now);
  const day = 24 * 60 * 60 * 1000;
  const existing = store.get(key);

  let w: Window;
  if (!existing) {
    w = { count: 0, resetAt: now + windowMs, dayCount: 0, dayResetAt: now + day };
  } else {
    w = existing;
    if (now > w.resetAt) {
      w.count = 0;
      w.resetAt = now + windowMs;
    }
    if (now > w.dayResetAt) {
      w.dayCount = 0;
      w.dayResetAt = now + day;
    }
  }

  w.count += 1;
  w.dayCount += 1;
  store.set(key, w);

  const success = w.count <= limit && w.dayCount <= dayCap;
  return { success, remaining: Math.max(0, limit - w.count) };
}

// Upstash-Limiter lazy laden (nur wenn ENV gesetzt).
type UpstashLimiter = { limit: (id: string) => Promise<{ success: boolean; remaining: number }> };
const upstashCache = new Map<string, UpstashLimiter>();

async function getUpstashLimiter(
  name: string,
  limit: number,
  windowMs: number
): Promise<UpstashLimiter | null> {
  if (!hasUpstash()) return null;
  const cacheKey = `${name}:${limit}:${windowMs}`;
  const cached = upstashCache.get(cacheKey);
  if (cached) return cached;
  try {
    const [{ Ratelimit }, { Redis }] = await Promise.all([
      import("@upstash/ratelimit"),
      import("@upstash/redis"),
    ]);
    const redis = new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    });
    const rl = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, `${Math.round(windowMs / 1000)} s`),
      prefix: `sw:${name}`,
    });
    upstashCache.set(cacheKey, rl);
    return rl;
  } catch {
    return null; // Fällt sauber auf In-Memory zurück.
  }
}

export type LimitConfig = {
  name: string;
  limit: number;
  windowMs: number;
  dayCap: number;
};

/**
 * Prüft das Limit für einen Identifier (i. d. R. IP). Nutzt Upstash, wenn
 * konfiguriert, sonst In-Memory. Wirft nie — im Zweifel „erlauben".
 */
export async function rateLimit(
  identifier: string,
  config: LimitConfig
): Promise<RateResult> {
  const key = `${config.name}:${identifier}`;
  try {
    const upstash = await getUpstashLimiter(config.name, config.limit, config.windowMs);
    if (upstash) {
      const res = await upstash.limit(identifier);
      return { success: res.success, remaining: res.remaining };
    }
  } catch {
    /* auf In-Memory zurückfallen */
  }
  return memoryLimit(key, config.limit, config.windowMs, config.dayCap);
}

/** Standard-Konfigurationen. */
export const LIMITS = {
  lead: { name: "lead", limit: 5, windowMs: 10 * 60 * 1000, dayCap: 40 },
  newsletterConfirm: { name: "nlc", limit: 10, windowMs: 10 * 60 * 1000, dayCap: 60 },
  auth: { name: "auth", limit: 8, windowMs: 10 * 60 * 1000, dayCap: 60 },
  // Adress-Autovervollständigung: großzügig, da beim Tippen mehrfach abgefragt.
  geo: { name: "geo", limit: 60, windowMs: 60 * 1000, dayCap: 1500 },
} satisfies Record<string, LimitConfig>;

/** Client-IP robust aus den üblichen Headern lesen. */
export function clientIp(headers: Headers): string {
  const xff = headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return (
    headers.get("x-real-ip") ||
    headers.get("cf-connecting-ip") ||
    "unknown"
  );
}
