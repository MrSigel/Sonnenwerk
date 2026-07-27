import "server-only";
import { env, hasAnalytics } from "../env";
import { dwellBucket, SCROLL_BUCKETS, type TrackPayload } from "./events";

/**
 * Analytics-Speicher auf Upstash Redis.
 *
 * Datenmodell: pro Tag EIN Hash (`sw:a:YYYY-MM-DD`) mit Zählerfeldern. Dadurch
 * genügt ein einziger Pipeline-Aufruf pro Besucher-Übermittlung und ein
 * HGETALL je Tag beim Auswerten — sehr sparsam für den kostenlosen Tarif.
 *
 * Es landen ausschließlich aggregierte Zahlen im Speicher, nie Rohdaten
 * einzelner Besucher.
 */

const PREFIX = "sw:a:";
const TTL_SECONDS = 400 * 24 * 60 * 60; // gut 13 Monate Historie

type RedisClient = {
  hincrby: (key: string, field: string, increment: number) => Promise<number>;
  hgetall: <T>(key: string) => Promise<T | null>;
  expire: (key: string, seconds: number) => Promise<number>;
  pipeline: () => {
    hincrby: (key: string, field: string, increment: number) => void;
    expire: (key: string, seconds: number) => void;
    exec: () => Promise<unknown[]>;
  };
};

let clientPromise: Promise<RedisClient | null> | null = null;

async function getRedis(): Promise<RedisClient | null> {
  if (!hasAnalytics()) return null;
  if (!clientPromise) {
    clientPromise = (async () => {
      try {
        const { Redis } = await import("@upstash/redis");
        return new Redis({
          url: env.UPSTASH_REDIS_REST_URL,
          token: env.UPSTASH_REDIS_REST_TOKEN,
        }) as unknown as RedisClient;
      } catch {
        return null;
      }
    })();
  }
  return clientPromise;
}

/** Tagesschlüssel in Europe/Berlin, damit die Auswertung zur Ortszeit passt. */
export function dayKey(d: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/** Die letzten `days` Tagesschlüssel, aufsteigend. */
export function lastDays(days: number): string[] {
  const out: string[] = [];
  const now = Date.now();
  for (let i = days - 1; i >= 0; i--) {
    out.push(dayKey(new Date(now - i * 24 * 60 * 60 * 1000)));
  }
  return out;
}

/** Feldnamen dürfen den Trenner ":" nicht enthalten. */
function clean(v: string): string {
  return v.replace(/[:\s]+/g, "_").slice(0, 40);
}

/** Ereignis-Bündel eines Besuchers in Zähler übersetzen und schreiben. */
export async function recordEvents(p: TrackPayload): Promise<boolean> {
  const redis = await getRedis();
  if (!redis) return false;

  const key = `${PREFIX}${dayKey()}`;
  const path = clean(p.path || "/");
  const fields: Array<[string, number]> = [];

  if (p.first) {
    fields.push([`pv:${path}`, 1]);
    if (p.device) fields.push([`dev:${p.device}`, 1]);
    if (p.source) fields.push([`ref:${clean(p.source)}`, 1]);
  }

  if (typeof p.scroll === "number") {
    // Alle erreichten Stufen zählen: wer 75 % sah, sah auch 25 % und 50 %.
    for (const b of SCROLL_BUCKETS) {
      if (p.scroll >= b) fields.push([`scroll:${path}:${b}`, 1]);
    }
  }

  if (typeof p.dwellSec === "number") {
    fields.push([`dwell:${path}:${dwellBucket(p.dwellSec)}`, 1]);
    fields.push([`dwellSum:${path}`, p.dwellSec]);
    fields.push([`dwellN:${path}`, 1]);
  }

  for (const [id, sec] of Object.entries(p.sections ?? {})) {
    if (sec <= 0) continue;
    fields.push([`sec:${clean(id)}`, 1]);
    fields.push([`secSum:${clean(id)}`, sec]);
  }

  for (const step of p.funnel ?? []) fields.push([`funnel:${step}`, 1]);
  for (const action of p.exit ?? []) fields.push([`exit:${action}`, 1]);

  if (!fields.length) return true;

  try {
    const pipe = redis.pipeline();
    for (const [field, by] of fields) pipe.hincrby(key, field, by);
    pipe.expire(key, TTL_SECONDS);
    await pipe.exec();
    return true;
  } catch {
    return false;
  }
}

export type DayStats = Record<string, number>;

/** Rohzähler mehrerer Tage laden und aufsummieren. */
export async function readRange(days: number): Promise<{
  total: DayStats;
  perDay: Array<{ day: string; stats: DayStats }>;
  available: boolean;
}> {
  const redis = await getRedis();
  const keys = lastDays(days);
  if (!redis) return { total: {}, perDay: [], available: false };

  const perDay: Array<{ day: string; stats: DayStats }> = [];
  const total: DayStats = {};

  const results = await Promise.all(
    keys.map(async (day) => {
      try {
        const raw = await redis.hgetall<Record<string, string | number>>(`${PREFIX}${day}`);
        const stats: DayStats = {};
        for (const [k, v] of Object.entries(raw ?? {})) {
          const n = typeof v === "number" ? v : Number(v);
          if (Number.isFinite(n)) stats[k] = n;
        }
        return { day, stats };
      } catch {
        return { day, stats: {} as DayStats };
      }
    })
  );

  for (const entry of results) {
    perDay.push(entry);
    for (const [k, v] of Object.entries(entry.stats)) {
      total[k] = (total[k] ?? 0) + v;
    }
  }

  return { total, perDay, available: true };
}
