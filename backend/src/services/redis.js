/**
 * EdgeAuth — Redis Integration
 * Token caching, session store, rate limiting
 * Inspired by JusPay's tokenization + session layer
 */

const redis = require("redis");

// ─── Config ───────────────────────────────────────────────────────────────────

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

const TTL = {
  ACCESS_TOKEN:   15 * 60,          // 15 min
  REFRESH_TOKEN:  7 * 24 * 60 * 60, // 7 days
  RATE_LIMIT:     60,                // 1 min window
  DC_HEALTH:      5,                 // 5 sec (frequently updated)
  TXN_CACHE:      300,               // 5 min
  USER_SESSION:   30 * 60,          // 30 min
};

// ─── Client ───────────────────────────────────────────────────────────────────

let client = null;

const getClient = async () => {
  if (client && client.isOpen) return client;
  client = redis.createClient({ url: REDIS_URL });
  client.on("error", err => console.error("[Redis] Error:", err));
  client.on("connect", () => console.log("[Redis] Connected"));
  await client.connect();
  return client;
};

// ─── Pure Key Builders ────────────────────────────────────────────────────────

const keys = {
  accessToken:   (userId, merchantId) => `token:access:${merchantId}:${userId}`,
  refreshToken:  (userId)             => `token:refresh:${userId}`,
  rateLimit:     (ip, endpoint)       => `rate:${endpoint}:${ip}`,
  dcHealth:      (dcId)               => `dc:health:${dcId}`,
  txnCache:      (txnId)              => `txn:${txnId}`,
  userSession:   (userId)             => `session:${userId}`,
  fraudScore:    (txnId)              => `fraud:score:${txnId}`,
  velocityCount: (userId, window)     => `velocity:${userId}:${window}`,
};

// ─── Token Cache (JusPay-style tokenization) ──────────────────────────────────

const tokenCache = {
  async get(userId, merchantId) {
    const r = await getClient();
    const cached = await r.get(keys.accessToken(userId, merchantId));
    if (cached) {
      console.log(`[Redis] Token cache HIT — ${merchantId}:${userId}`);
      return JSON.parse(cached);
    }
    console.log(`[Redis] Token cache MISS — ${merchantId}:${userId}`);
    return null;
  },

  async set(userId, merchantId, tokenData) {
    const r = await getClient();
    await r.setEx(
      keys.accessToken(userId, merchantId),
      TTL.ACCESS_TOKEN,
      JSON.stringify(tokenData)
    );
  },

  async invalidate(userId, merchantId) {
    const r = await getClient();
    await r.del(keys.accessToken(userId, merchantId));
  },

  async setRefresh(userId, tokenData) {
    const r = await getClient();
    await r.setEx(keys.refreshToken(userId), TTL.REFRESH_TOKEN, JSON.stringify(tokenData));
  },

  async getRefresh(userId) {
    const r = await getClient();
    const data = await r.get(keys.refreshToken(userId));
    return data ? JSON.parse(data) : null;
  },

  async deleteRefresh(userId) {
    const r = await getClient();
    await r.del(keys.refreshToken(userId));
  },
};

// ─── Rate Limiter ─────────────────────────────────────────────────────────────

const rateLimiter = {
  /**
   * Returns { allowed, remaining, resetIn }
   * Pure function result based on Redis state
   */
  async check(ip, endpoint, limit = 100) {
    const r   = await getClient();
    const key = keys.rateLimit(ip, endpoint);
    const count = await r.incr(key);
    if (count === 1) await r.expire(key, TTL.RATE_LIMIT);
    const ttl = await r.ttl(key);
    return {
      allowed:   count <= limit,
      remaining: Math.max(0, limit - count),
      resetIn:   ttl,
      current:   count,
    };
  },
};

// ─── DC Health Cache ──────────────────────────────────────────────────────────

const dcHealthCache = {
  async set(dcId, healthData) {
    const r = await getClient();
    await r.setEx(keys.dcHealth(dcId), TTL.DC_HEALTH, JSON.stringify(healthData));
  },

  async get(dcId) {
    const r = await getClient();
    const data = await r.get(keys.dcHealth(dcId));
    return data ? JSON.parse(data) : null;
  },

  async setAll(dcs) {
    await Promise.all(dcs.map(dc => dcHealthCache.set(dc.id, dc)));
  },

  async getAll(dcIds) {
    return Promise.all(dcIds.map(id => dcHealthCache.get(id)));
  },
};

// ─── Velocity Tracking ────────────────────────────────────────────────────────

const velocityTracker = {
  /**
   * Track transaction count per user per time window
   * Returns current count — used in fraud risk scoring
   */
  async increment(userId, windowSec = 3600) {
    const r   = await getClient();
    const key = keys.velocityCount(userId, Math.floor(Date.now() / (windowSec * 1000)));
    const count = await r.incr(key);
    if (count === 1) await r.expire(key, windowSec);
    return count;
  },

  async getCount(userId, windowSec = 3600) {
    const r   = await getClient();
    const key = keys.velocityCount(userId, Math.floor(Date.now() / (windowSec * 1000)));
    const val = await r.get(key);
    return parseInt(val || "0", 10);
  },
};

// ─── Fraud Score Cache ────────────────────────────────────────────────────────

const fraudScoreCache = {
  async set(txnId, score) {
    const r = await getClient();
    await r.setEx(keys.fraudScore(txnId), TTL.TXN_CACHE, String(score));
  },

  async get(txnId) {
    const r   = await getClient();
    const val = await r.get(keys.fraudScore(txnId));
    return val ? parseFloat(val) : null;
  },
};

// ─── Health Check ─────────────────────────────────────────────────────────────

const ping = async () => {
  try {
    const r = await getClient();
    const res = await r.ping();
    return { ok: res === "PONG", latencyMs: 0 };
  } catch (e) {
    return { ok: false, error: e.message };
  }
};

module.exports = {
  getClient,
  keys,
  tokenCache,
  rateLimiter,
  dcHealthCache,
  velocityTracker,
  fraudScoreCache,
  ping,
  TTL,
};
