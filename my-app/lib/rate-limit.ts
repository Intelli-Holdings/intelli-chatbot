/**
 * In-memory sliding window rate limiter.
 * No external dependencies required.
 */

interface RateLimitOptions {
  /** Time window in milliseconds */
  interval: number;
  /** Maximum number of requests allowed in the interval */
  limit: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetIn: number;
}

const store = new Map<string, number[]>();

// Periodically clean up expired entries to prevent memory leaks
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    store.forEach((timestamps, key) => {
      const filtered = timestamps.filter((t: number) => now - t < 3600000);
      if (filtered.length === 0) {
        store.delete(key);
      } else {
        store.set(key, filtered);
      }
    });
  }, 60000);
}

/**
 * Create a rate limiter with the given options.
 *
 * Usage:
 * ```ts
 * const limiter = rateLimit({ interval: 60000, limit: 30 });
 * const result = limiter("user-123");
 * if (!result.success) {
 *   return NextResponse.json({ error: "Too many requests" }, { status: 429 });
 * }
 * ```
 */
export function rateLimit(options: RateLimitOptions) {
  return function check(key: string): RateLimitResult {
    const now = Date.now();
    const timestamps = store.get(key) || [];

    // Remove expired entries outside the window
    const validTimestamps = timestamps.filter((t) => now - t < options.interval);

    if (validTimestamps.length >= options.limit) {
      const oldestInWindow = validTimestamps[0];
      return {
        success: false,
        remaining: 0,
        resetIn: options.interval - (now - oldestInWindow),
      };
    }

    validTimestamps.push(now);
    store.set(key, validTimestamps);

    return {
      success: true,
      remaining: options.limit - validTimestamps.length,
      resetIn: options.interval,
    };
  };
}

/** Pre-configured rate limiters for common use cases */
export const chatLimiter = rateLimit({ interval: 3600000, limit: 60 });
export const apiLimiter = rateLimit({ interval: 60000, limit: 30 });
export const campaignLimiter = rateLimit({ interval: 3600000, limit: 20 });
