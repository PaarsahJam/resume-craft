import { describe, it, expect, vi, afterEach } from 'vitest';
import { createRateLimiter } from './rateLimiter';

/** Build a minimal fake Express req/res pair for a given IP. */
function makeReqRes(ip: string) {
  const req: any = { ip, socket: { remoteAddress: ip } };
  const res: any = {
    headers: {} as Record<string, string>,
    statusCode: 200,
    body: null as any,
    setHeader(k: string, v: string) {
      this.headers[k] = v;
      return this;
    },
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: any) {
      this.body = payload;
      return this;
    },
  };
  return { req, res };
}

/** Fresh response object that models status/json the way Express does. */
function freshRes() {
  return {
    headers: {} as Record<string, string>,
    statusCode: 200,
    body: null as any,
    setHeader(k: string, v: string) {
      this.headers[k] = v;
      return this;
    },
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: any) {
      this.body = payload;
      return this;
    },
  } as any;
}

afterEach(() => {
  vi.useRealTimers();
});

describe('createRateLimiter', () => {
  it('allows requests up to the max, then returns 429 with Retry-After', () => {
    const limiter = createRateLimiter({ windowMs: 60_000, max: 3 });
    const { req, res } = makeReqRes('1.2.3.4');
    const next = vi.fn();

    for (let i = 0; i < 3; i++) limiter(req, res, next);
    expect(next).toHaveBeenCalledTimes(3);
    expect(res.statusCode).toBe(200);

    limiter(req, res, next); // 4th should be blocked
    expect(next).toHaveBeenCalledTimes(3);
    expect(res.statusCode).toBe(429);
    expect(res.headers['Retry-After']).toBeDefined();
    expect(Number(res.headers['Retry-After'])).toBeGreaterThan(0);
  });

  it('tracks each IP independently', () => {
    const limiter = createRateLimiter({ windowMs: 60_000, max: 1 });
    const next = vi.fn();

    const a = makeReqRes('10.0.0.1');
    limiter(a.req, a.res, next);
    expect(a.res.statusCode).toBe(200);

    const b = makeReqRes('10.0.0.2');
    limiter(b.req, b.res, next);
    expect(b.res.statusCode).toBe(200); // different IP unaffected

    // Same IP again is now blocked.
    const a2 = makeReqRes('10.0.0.1');
    limiter(a2.req, a2.res, next);
    expect(a2.res.statusCode).toBe(429);
  });

  it('resets after the window elapses', () => {
    vi.useFakeTimers();
    const limiter = createRateLimiter({ windowMs: 1000, max: 1 });
    const next = vi.fn();
    const req = { ip: '5.5.5.5', socket: { remoteAddress: '5.5.5.5' } };

    const r1 = freshRes();
    limiter(req, r1, next);
    expect(r1.statusCode).toBe(200);
    expect(next).toHaveBeenCalledTimes(1);

    // Exhaust the limit.
    const r2 = freshRes();
    limiter(req, r2, next);
    expect(r2.statusCode).toBe(429);
    expect(next).toHaveBeenCalledTimes(1);

    // Move past the window; a fresh request should be allowed again.
    vi.advanceTimersByTime(1001);

    const r3 = freshRes();
    limiter(req, r3, next);
    expect(r3.statusCode).toBe(200);
    expect(next).toHaveBeenCalledTimes(2);
  });

  it('falls back to socket.remoteAddress when req.ip is missing', () => {
    const limiter = createRateLimiter({ windowMs: 60_000, max: 1 });
    const next = vi.fn();
    const req: any = { ip: undefined, socket: { remoteAddress: '9.9.9.9' } };

    const r1 = freshRes();
    limiter(req, r1, next);
    expect(r1.statusCode).toBe(200);

    const r2 = freshRes();
    limiter(req, r2, next);
    expect(r2.statusCode).toBe(429);
  });
});