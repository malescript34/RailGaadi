import { NextRequest, NextResponse } from "next/server";

type CacheEntry<T> = { value: T; expiresAt: number };
const memoryCache = new Map<string, CacheEntry<unknown>>();
const rateBuckets = new Map<string, { count: number; resetAt: number }>();
const circuits = new Map<string, { failures: number; openUntil: number }>();

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

async function redis(command: string[]): Promise<unknown> {
  if (!redisUrl || !redisToken) return undefined;
  const response = await fetch(`${redisUrl}/${command.map(encodeURIComponent).join("/")}`, {
    headers: { Authorization: `Bearer ${redisToken}` },
    cache: "no-store",
    signal: AbortSignal.timeout(3000),
  });
  if (!response.ok) throw new Error(`Redis returned ${response.status}`);
  return (await response.json() as { result?: unknown }).result;
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const remote = await redis(["get", key]);
    if (typeof remote === "string") return JSON.parse(remote) as T;
  } catch (error) { console.warn("Redis cache read failed", error); }
  const local = memoryCache.get(key);
  if (!local || local.expiresAt <= Date.now()) { memoryCache.delete(key); return null; }
  return local.value as T;
}

export async function cacheSet<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
  memoryCache.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
  try { await redis(["set", key, JSON.stringify(value), "EX", String(ttlSeconds)]); }
  catch (error) { console.warn("Redis cache write failed", error); }
}

export async function cached<T>(key: string, ttlSeconds: number, loader: () => Promise<T>): Promise<T> {
  const existing = await cacheGet<T>(key);
  if (existing !== null) return existing;
  const result = await circuit(key.split(":")[0], loader);
  await cacheSet(key, result, ttlSeconds);
  return result;
}

export async function circuit<T>(name: string, loader: () => Promise<T>): Promise<T> {
  const state = circuits.get(name);
  if (state && state.openUntil > Date.now()) throw new Error(`${name} is temporarily unavailable`);
  try {
    const result = await loader();
    circuits.delete(name);
    return result;
  } catch (error) {
    const failures = (state?.failures || 0) + 1;
    circuits.set(name, { failures, openUntil: failures >= 3 ? Date.now() + 30000 : 0 });
    throw error;
  }
}

export function enforceRateLimit(request: NextRequest, bucket: string, limit = 60, windowMs = 60000): NextResponse | null {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const key = `${bucket}:${ip}`;
  const now = Date.now();
  const current = rateBuckets.get(key);
  const entry = !current || current.resetAt <= now ? { count: 0, resetAt: now + windowMs } : current;
  entry.count += 1;
  rateBuckets.set(key, entry);
  if (entry.count <= limit) return null;
  return NextResponse.json({ error: { code: "RATE_LIMITED", message: "Too many requests. Please try again shortly." } }, {
    status: 429,
    headers: { "Retry-After": String(Math.ceil((entry.resetAt - now) / 1000)) },
  });
}
