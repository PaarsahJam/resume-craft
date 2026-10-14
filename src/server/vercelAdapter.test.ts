import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { IncomingMessage, ServerResponse } from 'node:http';
import { Socket } from 'node:net';
import { createAiHandler, createHealthHandler } from './vercelAdapter';
import { aiRateLimiter } from './aiRoutes';
import { useNetworkGuard } from './testNetworkGuard';

/**
 * Tests for the Vercel function adapter.
 *
 * The adapter is exercised with real Node http objects, because that is what
 * Vercel passes to a function. Nothing here touches the network: every test
 * that reaches the provider stubs `fetch`.
 */

useNetworkGuard();

const RESUME = {
  personal: { fullName: 'Jane Doe', email: 'jane@example.com' },
  summary: 'A summary of things.',
  skills: [{ category: 'Languages', items: ['TypeScript'] }],
  experience: [{ jobTitle: 'Engineer', company: 'Acme', description: ['Built X'] }],
  projects: [],
  education: [],
  certifications: [],
  languages: [],
  additionalSections: [],
  sectionOrder: ['summary'],
  hiddenSections: [],
};

/** Minimal provider payload, mirroring OpenRouter's response shape. */
function providerBody(content: unknown, extra: Record<string, unknown> = {}) {
  return {
    id: 'gen-1',
    model: 'vendor/actual-model:free',
    choices: [
      { message: { content: typeof content === 'string' ? content : JSON.stringify(content) } },
    ],
    ...extra,
  };
}

function mockProvider(body: unknown) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => body }));
}

beforeEach(() => {
  process.env.OPENROUTER_API_KEY = 'test-key';
  aiRateLimiter.reset();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  delete process.env.OPENROUTER_API_KEY;
  aiRateLimiter.reset();
});

/**
 * Invoke a handler with a real Node request/response pair and collect the
 * result. This mirrors the Vercel Node runtime closely enough to catch
 * adapter bugs that a hand-rolled mock would hide.
 */
async function invoke(
  handler: ReturnType<typeof createAiHandler> | ReturnType<typeof createHealthHandler>,
  options: { method: string; url: string; body?: unknown; headers?: Record<string, string> } = {
    method: 'POST',
    url: '/api/ai/improve-summary',
  }
): Promise<{ status: number; headers: Record<string, any>; body: any; raw: string }> {
  const result = await invokeAwaitingHandler(handler, options);
  return { status: result.status, headers: result.headers, body: result.body, raw: result.raw };
}

/**
 * Invoke the handler and AWAIT THE HANDLER'S OWN PROMISE.
 *
 * This is the assertion that matters for the lifecycle contract: a handler
 * that sends its response but never settles would still pass a suite that
 * only watched the response `finish` event. The timeout turns a never-settling
 * handler into a clear failure rather than a hung test run.
 */
async function invokeAwaitingHandler(
  handler: ReturnType<typeof createAiHandler> | ReturnType<typeof createHealthHandler>,
  options: { method: string; url: string; body?: unknown; headers?: Record<string, string>; close?: boolean },
  timeoutMs = 2000
): Promise<{
  status: number;
  headers: Record<string, any>;
  body: any;
  raw: string;
  handlerSettled: boolean;
}> {
  const socket = new Socket();
  const req = new IncomingMessage(socket);
  req.method = options.method;
  req.url = options.url;
  req.headers = { 'content-type': 'application/json', ...(options.headers ?? {}) };

  const res = new ServerResponse(req);
  const chunks: Buffer[] = [];
  let handlerSettled = false;

  const settleResult = () => {
    const raw = Buffer.concat(chunks).toString('utf8');
    let parsed: any;
    try {
      parsed = raw ? JSON.parse(raw) : undefined;
    } catch {
      parsed = undefined;
    }
    return {
      status: res.statusCode,
      headers: res.getHeaders(),
      body: parsed,
      raw,
      handlerSettled,
    };
  };

  let finished: (() => void) | undefined;
  const finishedPromise = new Promise<void>((r) => {
    finished = r;
  });

  (res as any).write = (chunk: any) => {
    chunks.push(Buffer.from(chunk));
    return true;
  };
  (res as any).end = (chunk?: any) => {
    if (chunk) chunks.push(Buffer.from(chunk));
    res.emit('finish');
    finished!();
    return res;
  };

  // Vercel pre-parses the JSON body for the function runtime.
  if (options.body !== undefined) (req as any).body = options.body;

  const handlerPromise = Promise.resolve(handler(req as any, res as any)).then(
    () => {
      handlerSettled = true;
    },
    () => {
      handlerSettled = true;
    }
  );

  // Simulate a client disconnect: the socket closes without finishing.
  if (options.close) {
    res.emit('close');
    finished!();
  }

  await Promise.race([
    Promise.all([handlerPromise, finishedPromise]),
    new Promise((r) => setTimeout(r, timeoutMs)),
  ]);

  return settleResult();
}

describe('GET /api/health handler', () => {
  const handler = createHealthHandler();

  it('returns 200 and the health payload', async () => {
    const res = await invoke(handler, { method: 'GET', url: '/api/health' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(typeof res.body.time).toBe('string');
  });

  it('sets a JSON content type', async () => {
    const res = await invoke(handler, { method: 'GET', url: '/api/health' });
    expect(res.headers['content-type']).toContain('application/json');
  });

  it('never contacts the provider', async () => {
    const res = await invoke(handler, { method: 'GET', url: '/api/health' });
    expect(res.status).toBe(200);
    // The guard is still installed: reaching fetch would have thrown.
  });

  it('rejects non-GET methods with 405', async () => {
    const res = await invoke(handler, { method: 'POST', url: '/api/health' });
    expect(res.status).toBe(405);
    expect(res.body.error).toBeDefined();
  });
});

describe('AI function handlers', () => {
  // Columns: route name, URL, request body, MODEL output, EXPECTED HTTP body.
  // They differ for the cover letter: the model returns plain text but the
  // route contract wraps it as { body }.
  const ROUTES: Array<[string, string, unknown, unknown, unknown]> = [
    [
      'improve-summary',
      '/api/ai/improve-summary',
      { summary: 'Original.' },
      { concise: 'A', executive: 'B' },
      { concise: 'A', executive: 'B' },
    ],
    [
      'improve-bullet',
      '/api/ai/improve-bullet',
      { bullet: 'Did X.' },
      { impact: 'I', concise: 'C', technical: 'T' },
      { impact: 'I', concise: 'C', technical: 'T' },
    ],
    [
      'tailor-jd',
      '/api/ai/tailor-jd',
      { resume: RESUME, jobDescription: 'Need TS.' },
      { score: 80, matchedKeywords: ['ts'], missingKeywords: [], suggestions: ['a'] },
      { score: 80, matchedKeywords: ['ts'], missingKeywords: [], suggestions: ['a'] },
    ],
    [
      'generate-cover-letter',
      '/api/ai/generate-cover-letter',
      { resume: RESUME },
      'Dear team, Regards.',
      { body: 'Dear team, Regards.' },
    ],
    ['translate-resume', '/api/ai/translate-resume', { resume: RESUME }, RESUME, RESUME],
  ];

  it.each(ROUTES)('%s preserves its response contract', async (name, url, body, modelOut, expected) => {
    mockProvider(providerBody(modelOut));
    const res = await invoke(createAiHandler(), { method: 'POST', url, body });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(expected);
  });

  it.each(ROUTES)('%s never exposes usage metadata to the client', async (name, url, body, modelOut) => {
    mockProvider(
      providerBody(modelOut, { usage: { prompt_tokens: 90, completion_tokens: 10, total_tokens: 100 } })
    );
    const res = await invoke(createAiHandler(), { method: 'POST', url, body });

    expect(res.status).toBe(200);
    expect(res.raw).not.toMatch(/promptTokens|completionTokens|totalTokens|"usage"/);
  });

  it.each(ROUTES)('%s sets an X-Request-Id correlation header', async (name, url, body, modelOut) => {
    mockProvider(providerBody(modelOut));
    const res = await invoke(createAiHandler(), { method: 'POST', url, body });

    expect(res.status).toBe(200);
    expect(res.headers['x-request-id']).toBeTruthy();
    expect(String(res.headers['x-request-id']).length).toBeGreaterThan(0);
  });
});

describe('AI handler — validation and error responses', () => {
  it('returns 400 for an invalid body', async () => {
    mockProvider(providerBody({ concise: 'A', executive: 'B' }));
    const res = await invoke(createAiHandler(), {
      method: 'POST',
      url: '/api/ai/improve-summary',
      body: {},
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('returns 503 with not_configured when no key is set', async () => {
    delete process.env.OPENROUTER_API_KEY;
    const res = await invoke(createAiHandler(), {
      method: 'POST',
      url: '/api/ai/improve-summary',
      body: { summary: 'x' },
    });

    expect(res.status).toBe(503);
    expect(res.body.code).toBe('not_configured');
  });

  it('maps an upstream 401 to a safe 502 without leaking the key', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 401, json: async () => ({}) }));
    const res = await invoke(createAiHandler(), {
      method: 'POST',
      url: '/api/ai/improve-summary',
      body: { summary: 'x' },
    });

    expect(res.status).toBe(502);
    expect(res.body.code).toBe('auth_error');
    expect(res.raw).not.toContain('test-key');
    expect(res.raw).not.toMatch(/sk-or-v1|Bearer/i);
  });

  it('maps an upstream 429 to 429 with the error code', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 429, json: async () => ({}) }));
    const res = await invoke(createAiHandler(), {
      method: 'POST',
      url: '/api/ai/improve-summary',
      body: { summary: 'x' },
    });

    expect(res.status).toBe(429);
    expect(res.body.code).toBe('rate_limited');
  });

  it('returns 404 for a non-POST method on an AI path', async () => {
    const res = await invoke(createAiHandler(), {
      method: 'GET',
      url: '/api/ai/improve-summary',
    });

    expect(res.status).toBe(404);
  });

  it('returns 502 when the model output is unusable', async () => {
    mockProvider(providerBody({ onlyOneField: true }));
    const res = await invoke(createAiHandler(), {
      method: 'POST',
      url: '/api/ai/improve-summary',
      body: { summary: 'x' },
    });

    expect(res.status).toBe(502);
  });
});

describe('AI handler — request body handling', () => {
  it('accepts the platform-preparsed body', async () => {
    mockProvider(providerBody({ concise: 'A', executive: 'B' }));
    const res = await invoke(createAiHandler(), {
      method: 'POST',
      url: '/api/ai/improve-summary',
      body: { summary: 'Original.' },
    });

    expect(res.status).toBe(200);
  });

  it('returns 400 for an oversized body', async () => {
    mockProvider(providerBody({ concise: 'A', executive: 'B' }));
    const res = await invoke(createAiHandler(), {
      method: 'POST',
      url: '/api/ai/improve-summary',
      body: { summary: 'x'.repeat(20_001) },
    });

    expect([400, 413]).toContain(res.status);
  });

  it('does not contact the provider for an over-long target language', async () => {
    const spy = vi.fn();
    vi.stubGlobal('fetch', spy);

    const res = await invoke(createAiHandler(), {
      method: 'POST',
      url: '/api/ai/translate-resume',
      body: { resume: RESUME, targetLanguage: 'y'.repeat(201) },
    });

    expect(res.status).toBe(400);
    expect(spy).not.toHaveBeenCalled();
  });
});

describe('handler lifecycle — the returned promise must settle', () => {
  /**
   * Regression tests for the defect found in Phase 3.0.1: the handler's
   * promise resolved only from Express's `next()` callback, which a matched
   * route never calls. The response was sent correctly, so a suite that only
   * watched the `finish` event passed while the promise stayed pending —
   * holding the Vercel invocation open.
   *
   * Every test below awaits the handler's own promise. Against the previous
   * implementation these fail with `handlerSettled: false`.
   */

  it('settles after a successful AI response', async () => {
    mockProvider(providerBody({ concise: 'A', executive: 'B' }));
    const res = await invokeAwaitingHandler(createAiHandler(), {
      method: 'POST',
      url: '/api/ai/improve-summary',
      body: { summary: 'Original.' },
    });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ concise: 'A', executive: 'B' });
    expect(res.handlerSettled).toBe(true);
  });

  it('settles after a validation error response', async () => {
    mockProvider(providerBody({ concise: 'A', executive: 'B' }));
    const res = await invokeAwaitingHandler(createAiHandler(), {
      method: 'POST',
      url: '/api/ai/improve-summary',
      body: {},
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
    expect(res.handlerSettled).toBe(true);
  });

  it('settles after an unmatched route or method', async () => {
    const res = await invokeAwaitingHandler(createAiHandler(), {
      method: 'GET',
      url: '/api/ai/improve-summary',
    });

    expect(res.status).toBe(404);
    expect(res.handlerSettled).toBe(true);
  });

  it('settles after a provider error response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 401, json: async () => ({}) })
    );
    const res = await invokeAwaitingHandler(createAiHandler(), {
      method: 'POST',
      url: '/api/ai/improve-summary',
      body: { summary: 'x' },
    });

    expect(res.status).toBe(502);
    expect(res.handlerSettled).toBe(true);
  });

  it('settles when the client disconnects before the response finishes', async () => {
    mockProvider(providerBody({ concise: 'A', executive: 'B' }));
    const res = await invokeAwaitingHandler(
      createAiHandler(),
      { method: 'POST', url: '/api/ai/improve-summary', body: { summary: 'x' }, close: true },
      // Short timeout: the point is that settlement does not depend on finish.
      300
    );

    expect(res.handlerSettled).toBe(true);
  });

  it('settles exactly once across finish and close', async () => {
    mockProvider(providerBody({ concise: 'A', executive: 'B' }));
    const socket = new Socket();
    const req = new IncomingMessage(socket);
    req.method = 'POST';
    req.url = '/api/ai/improve-summary';
    req.headers = { 'content-type': 'application/json' };
    (req as any).body = { summary: 'x' };

    const res = new ServerResponse(req) as any;
    const chunks: Buffer[] = [];
    res.write = (c: any) => {
      chunks.push(Buffer.from(c));
      return true;
    };
    let ends = 0;
    res.end = (c?: any) => {
      if (c) chunks.push(Buffer.from(c));
      ends += 1;
      res.emit('finish');
      return res;
    };

    const handler = createAiHandler();
    let resolutions = 0;
    const p = Promise.resolve(handler(req, res)).then(
      () => {
        resolutions += 1;
      },
      () => {
        resolutions += 1;
      }
    );
    await new Promise((r) => setTimeout(r, 200));

    // Both lifecycle events fire; settlement must remain idempotent.
    res.emit('close');
    res.emit('finish');
    await p;

    expect(ends).toBe(1);
    expect(resolutions).toBe(1);
  });

  it('detaches its lifecycle listeners once settled', async () => {
    mockProvider(providerBody({ concise: 'A', executive: 'B' }));
    const socket = new Socket();
    const req = new IncomingMessage(socket);
    req.method = 'POST';
    req.url = '/api/ai/improve-summary';
    req.headers = { 'content-type': 'application/json' };
    (req as any).body = { summary: 'x' };

    const res = new ServerResponse(req) as any;
    res.write = () => true;
    res.end = () => {
      res.emit('finish');
      return res;
    };

    await Promise.resolve(createAiHandler()(req, res));

    expect(res.listenerCount('finish')).toBe(0);
    expect(res.listenerCount('close')).toBe(0);
  });
});

describe('network isolation', () => {
  it('fails loudly rather than calling out when a stub is missing', async () => {
    // No fetch stub is installed for this test beyond the shared guard.
    const res = await invoke(createAiHandler(), {
      method: 'POST',
      url: '/api/ai/improve-summary',
      body: { summary: 'x' },
    });

    // The guard throws inside the adapter, which the router normalises to a
    // safe 504 rather than leaking the guard message.
    expect(res.status).toBe(504);
    expect(res.body.code).toBe('network_error');
    expect(res.raw).not.toContain('BLOCKED');
  });
});