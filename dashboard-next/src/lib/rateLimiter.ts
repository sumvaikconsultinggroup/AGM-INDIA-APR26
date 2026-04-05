/**
 * In-Memory Rate Limiter
 * Enterprise-grade rate limiting for API endpoints.
 * Uses sliding window algorithm with automatic cleanup.
 * 
 * Usage:
 *   const limiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 100 });
 *   const result = limiter.check(ip);
 *   if (!result.allowed) return ApiResponse.tooManyRequests();
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
  firstRequestAt: number;
}

interface RateLimiterConfig {
  windowMs: number;       // Time window in milliseconds
  max: number;            // Max requests per window
  skipSuccessfulRequests?: boolean;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;    // Seconds until next allowed request
}

const stores = new Map<string, Map<string, RateLimitEntry>>();

// Periodic cleanup of expired entries (every 5 minutes)
let cleanupInterval: NodeJS.Timeout | null = null;

function startCleanup() {
  if (cleanupInterval) return;
  cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [, store] of stores) {
      for (const [key, entry] of store) {
        if (now > entry.resetAt) {
          store.delete(key);
        }
      }
    }
  }, 5 * 60 * 1000);
  // Don't prevent Node from exiting
  if (cleanupInterval.unref) cleanupInterval.unref();
}

export function createRateLimiter(config: RateLimiterConfig, name = 'default') {
  const { windowMs, max } = config;

  if (!stores.has(name)) {
    stores.set(name, new Map());
  }
  const store = stores.get(name)!;
  startCleanup();

  return {
    check(identifier: string): RateLimitResult {
      const now = Date.now();
      const existing = store.get(identifier);

      // No existing entry or expired window
      if (!existing || now > existing.resetAt) {
        store.set(identifier, {
          count: 1,
          resetAt: now + windowMs,
          firstRequestAt: now,
        });
        return { allowed: true, remaining: max - 1, resetAt: now + windowMs };
      }

      // Within window
      existing.count++;

      if (existing.count > max) {
        const retryAfter = Math.ceil((existing.resetAt - now) / 1000);
        return {
          allowed: false,
          remaining: 0,
          resetAt: existing.resetAt,
          retryAfter,
        };
      }

      return {
        allowed: true,
        remaining: max - existing.count,
        resetAt: existing.resetAt,
      };
    },

    reset(identifier: string) {
      store.delete(identifier);
    },

    getHeaders(result: RateLimitResult): Record<string, string> {
      const headers: Record<string, string> = {
        'X-RateLimit-Limit': String(max),
        'X-RateLimit-Remaining': String(result.remaining),
        'X-RateLimit-Reset': new Date(result.resetAt).toISOString(),
      };
      if (result.retryAfter) {
        headers['Retry-After'] = String(result.retryAfter);
      }
      return headers;
    },
  };
}

// Pre-configured limiters for common use cases
export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max: 10,                      // 10 login attempts per 15 min
}, 'auth');

export const otpLimiter = createRateLimiter({
  windowMs: 60 * 1000,         // 1 minute
  max: 3,                       // 3 OTP requests per minute
}, 'otp');

export const apiLimiter = createRateLimiter({
  windowMs: 60 * 1000,         // 1 minute
  max: 120,                     // 120 requests per minute
}, 'api');

export const chatbotLimiter = createRateLimiter({
  windowMs: 60 * 1000,         // 1 minute
  max: 10,                      // 10 chatbot messages per minute
}, 'chatbot');

export const uploadLimiter = createRateLimiter({
  windowMs: 60 * 1000,         // 1 minute
  max: 5,                       // 5 uploads per minute
}, 'upload');

/**
 * Extract IP from Next.js request
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp;
  return '127.0.0.1';
}
