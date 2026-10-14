/**
 * In-memory fixed-window rate limiter for AI endpoints.
 *
 * Conservative default: 20 requests per minute per client. The window is
 * fixed (not sliding) which is simpler and adequate for a low-traffic resume
 * tool. State is process-local; a multi-instance deployment would need a shared
 * store, which is out of scope here.
 */

export interface RateLimiterOptions {
  windowMs: number;
  max: number;
}

/** A rate-limiting middleware, plus a `reset()` used by tests for isolation. */
export interface RateLimiterMiddleware {
  (req: any, res: any, next: () => void): void;
  /** Drop all buckets. Intended for tests; never called in production. */
  reset(): void;
}

interface Bucket {
  count: number;
  resetAt: number;
}

export function createRateLimiter(options: RateLimiterOptions): RateLimiterMiddleware {
  const buckets = new Map<string, Bucket>();

  // Periodically evict expired buckets so the map does not grow unbounded.
  const sweeper = setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(key);
    }
  }, options.windowMs);
  // Do not keep the Node process alive solely for the sweeper.
  if (typeof sweeper.unref === 'function') sweeper.unref();

  const middleware = function rateLimiter(req: any, res: any, next: () => void) {
    const key = req.ip ?? req.socket?.remoteAddress ?? 'unknown';
    const now = Date.now();

    let bucket = buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + options.windowMs };
      buckets.set(key, bucket);
    }

    bucket.count += 1;

    if (bucket.count > options.max) {
      const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
      res.setHeader('Retry-After', String(retryAfter));
      res.status(429).json({ error: 'Too many requests. Please try again later.' });
      return;
    }

    next();
  };

  middleware.reset = () => {
    buckets.clear();
  };

  return middleware;
}
